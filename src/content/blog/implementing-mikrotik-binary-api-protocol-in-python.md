---
title: 'Implementing MikroTik''s Binary API Protocol in Python from Scratch'
date: 2026-03-05
slug: 'implementing-mikrotik-binary-api-protocol-in-python'
description: 'A deep dive into implementing MikroTik''s proprietary RouterOS binary API protocol in Python — variable-length encoding, sentence-based messaging, and programmatic network infrastructure control. Zero dependencies, 137 lines.'
categories: ['Homelab', 'Networking']
heroImage: '/images/blog/implementing-mikrotik-binary-api-protocol-in-python/hero.webp'
heroAlt: 'MikroTik binary API protocol implementation'
tldr: 'I implemented MikroTik''s proprietary binary API protocol from scratch in Python to programmatically manage my network infrastructure. The protocol uses variable-length encoding (similar to UTF-8), sentence-based messaging over raw TCP, and plain-text authentication. In ~137 lines of Python, you get full control over bonding, DHCP, firewall rules, and anything else exposed by the RouterOS API.'
---

My [homelab](/blog/how-to-get-started-building-a-homelab-server-in-2024/) runs a MikroTik CRS317 as the 10G backbone switch, handling LACP bonds to two Proxmox hosts and a failover bond to a UniFi switch. When I started managing bonding configurations, DHCP settings, and firewall rules, I wanted to do it programmatically — not by SSHing in and typing commands interactively.

[MikroTik routers expose an API](https://help.mikrotik.com/docs/spaces/ROS/pages/47579149/API) on port 8728, but it's not REST. It's not even HTTP. It's a proprietary binary protocol with its own encoding scheme. Most people use existing libraries or just stick with SSH. I decided to implement the protocol from scratch.

## Why Not Use an Existing Library?

Honestly? I wanted to understand the protocol. MikroTik's documentation describes it at a high level, but the actual byte-level encoding is the kind of thing you only truly understand by implementing it yourself. Plus, the existing Python libraries tend to be heavy — I just wanted a lightweight script I could call from shell scripts and automation.

The result is about 137 lines of Python — using only `socket` and `struct` from the standard library — that give me full programmatic control over the router.

## The Protocol: Sentences and Words

MikroTik's API protocol is built around **sentences** — sequences of **words** terminated by a null byte. Each word is a length-prefixed UTF-8 string. A command looks like this on the wire:

```
[length][word][length][word]...[0x00]
```

For example, logging in sends a sentence with three words:

```
/login
=name=admin
=password=secret
[null byte]
```

The server responds with its own sentences. A successful login returns a sentence containing `!done`. An error returns `!trap` with details.

## Variable-Length Encoding: The Interesting Part

The clever bit is how word lengths are encoded. Rather than using a fixed 4-byte length prefix (wasteful for short words) or a delimiter (ambiguous with binary data), MikroTik uses a **variable-length encoding** where the high bits of the first byte tell you how many additional bytes follow.

| Length Range | Bytes Used | First Byte Pattern |
|---|---|---|
| 0–127 | 1 | `0xxxxxxx` |
| 128–16,383 | 2 | `10xxxxxx xxxxxxxx` |
| 16,384–2,097,151 | 3 | `110xxxxx xxxxxxxx xxxxxxxx` |
| 2,097,152–268,435,455 | 4 | `1110xxxx xxxxxxxx xxxxxxxx xxxxxxxx` |
| 268,435,456+ | 5 | `11110000 xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx` |

If you squint, this looks a lot like UTF-8's encoding scheme — the leading bits are a "type marker" that signals the total length of the field. It's elegant: short API commands (which are the vast majority) use just one byte for the length, while the protocol can still handle arbitrarily large payloads.

Here's the encoding function:

```python
def encode_length(length: int) -> bytes:
    if length < 0x80:
        return struct.pack('!B', length)
    elif length < 0x4000:
        return struct.pack('!H', length | 0x8000)
    elif length < 0x200000:
        return struct.pack('!I', length | 0xC00000)[1:]  # 3 bytes
    elif length < 0x10000000:
        return struct.pack('!I', length | 0xE0000000)
    else:
        return b'\xf0' + struct.pack('!I', length)
```

And decoding reads the first byte, checks the high bits, then reads the appropriate number of additional bytes:

```python
def read_sentence(sock) -> list[str]:
    words = []
    while True:
        first = sock.recv(1)
        b = first[0]

        if b == 0:
            break  # End of sentence
        elif b < 0x80:
            length = b
        elif b < 0xC0:
            length = ((b & 0x3F) << 8) + sock.recv(1)[0]
        elif b < 0xE0:
            length = ((b & 0x1F) << 16) + struct.unpack('!H', sock.recv(2))[0]
        elif b < 0xF0:
            length = ((b & 0x0F) << 24) + struct.unpack('!I', b'\x00' + sock.recv(3))[0]
        else:
            length = struct.unpack('!I', sock.recv(4))[0]

        words.append(sock.recv(length).decode('utf-8'))
    return words
```

## Authentication

Login is refreshingly simple compared to modern REST APIs:

```python
def connect(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.settimeout(10)
    self.sock.connect((self.host, 8728))

    send_sentence(self.sock, [
        '/login',
        f'=name={self.username}',
        f'=password={self.password}'
    ])

    response = read_sentence(self.sock)
    if '!done' not in response:
        raise Exception(f"Login failed: {response}")
```

No tokens, no OAuth, no session cookies. Just username and password over a persistent TCP connection. Security relies on network-level controls — this API should only be accessible from trusted networks.

> **Security note:** If you need encryption, MikroTik also offers an API-SSL endpoint on port 8729 with TLS. For a homelab on a trusted LAN, plaintext on port 8728 is fine — but don't expose it to the internet.

## Sending Commands

Once authenticated, the same connection handles all subsequent commands. The API mirrors MikroTik's CLI path structure:

```python
def command(self, *words):
    send_sentence(self.sock, list(words))

    responses = []
    while True:
        sentence = read_sentence(self.sock)
        responses.append(sentence)
        if any(w in ('!done', '!trap') for w in sentence):
            break
    return responses
```

The `command()` method collects all response sentences until it sees `!done` (success) or `!trap` (error). A single command can return multiple `!re` (record entry) sentences — for example, listing all bonding interfaces returns one `!re` per bond.

## Real-World Usage

From the command line:

```bash
# List all bonding interfaces
python mikrotik-api.py /interface/bonding/print

# Update a bond's transmit hash policy
python mikrotik-api.py /interface/bonding/set \
    =.id=bond-prxbox1 \
    =transmit-hash-policy=layer-3-and-4

# Check system resources
python mikrotik-api.py /system/resource/print

# View DHCP leases
python mikrotik-api.py /ip/dhcp-server/lease/print
```

The CLI is generic — any RouterOS API command works without code changes. The output formatter pretty-prints `=key=value` pairs from response sentences, making it easy to pipe into shell scripts.

I use this from automation scripts to:
- Monitor LACP bond status across the 20Gbps links to my Proxmox hosts
- Query DHCP lease state
- Manage firewall rules programmatically
- Check interface statistics

## What I Learned

**Binary protocols aren't scary.** The variable-length encoding is probably the most complex part, and it's still only ~20 lines of code. Once you understand the byte-level structure, everything else falls into place.

**Variable-length encoding is everywhere.** The same pattern shows up in UTF-8, [Protocol Buffers (varints)](https://protobuf.dev/programming-guides/encoding/#varints), Git packfiles, and now MikroTik's API. Understanding it in one context makes all the others click.

**Sometimes you don't need a library.** At 137 lines, this script is smaller than most library README files. It has zero dependencies beyond Python's standard library. For a homelab tool that runs on a cron job, that's exactly the right level of complexity.

**Raw TCP still has its place.** In a world of REST APIs and GraphQL, there's something satisfying about writing bytes to a socket and parsing the response. The protocol is efficient — no HTTP overhead, no JSON parsing, just compact binary messages over a persistent connection.

The full implementation is straightforward enough that I'd recommend it as a learning exercise for anyone interested in network protocols. There's no better way to understand a protocol than to implement it from scratch.
