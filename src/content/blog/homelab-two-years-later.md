---
title: 'My Homelab Two Years Later, Every Upgrade and What It Cost'
date: 2026-03-05
updatedDate: 2026-10-01
slug: 'homelab-two-years-later'
description: 'Two years after a $200 ThinkServer: two Dell R730s, 73 containers, metered power data, and an honest look at whether a homelab pays for itself.'
categories: ['Homelab']
heroImage: '/images/blog/homelab-two-years-later/hero.webp'
heroAlt: 'Server rack with two Dell R730 servers, 10G networking, and cable management'
tldr: 'Two years after my first homelab post, I went from a $200 ThinkServer with 15 containers to a server rack with two Dell R730s (80 cores, 256GB RAM), two NVIDIA GPUs, 10G networking, VLANs, and 73 containers managed in OpenTofu. Hardware cost about $7,400. The rack averages about 420W, roughly $46/month at $0.15/kWh. On paper it pays for itself in about 4.6 years, but that leans on one $80/month line item - take it out and break-even is over a decade. Along the way I found that my 10G links peak at 12% of one link, my night mode saves about 5W, and my CPUs average 13% busy. Here is every phase, what it cost, and what I got wrong.'
---

Two years ago I bought a $200 ThinkServer off Facebook Marketplace, put Proxmox on it, ran about 15 containers, and wrote an [original homelab post](/blog/how-to-get-started-building-a-homelab-server-in-2024/) telling everyone that was all a homelab needed.

Today I have two Dell R730s in a rack in my attic, 73 containers, two NVIDIA GPUs, and 10G networking. The rack averages about 420W, or about $46 a month in electricity. Total hardware spend: about $7,400.

None of it was planned. Each phase started with one question or one frustration, usually at 11 PM on a Tuesday, and somehow always ended with new hardware in the rack and a higher electricity bill. This post covers each phase: what drove it, what it cost, what went wrong, and whether any of it pays for itself. Short version: slower than I first claimed, and some of what I bought, I barely use.

_Updated October 2026: I first published this in March. Since then I've retired Open WebUI, Nextcloud, and Readarr and moved every container into OpenTofu. I also pulled 30 days of real data out of Prometheus for this update, and it corrected me in several places: a CPU count I had wrong by a factor of two, a night mode that saves almost nothing, and a rack power sensor that sat frozen for three weeks without anything noticing. The numbers below are current._

## Where the $200 ThinkServer ran out

The original setup was genuinely great. A Xeon E3-1226 v3 with 4 cores, 32GB of RAM, 2TB of storage. [Proxmox](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) running LXC containers. [Plex](https://www.plex.tv/), the \*arr stack, Pi-Hole, download clients. For six months it handled everything without complaint.

Then I got ambitious. You know how it goes.

First it was Plex transcoding. Two people streaming at once and the quad-core Xeon started choking. Then I saw [Frigate](https://frigate.video/) - real-time AI object detection on security camera feeds. On CPU, Frigate's detector alone ate about 120% CPU, more than one of my four cores. A [Coral USB accelerator](https://coral.ai/products/accelerator) fixed that part: about 10 ms per inference and 4.5% CPU. But a Coral only runs Frigate's detector. It doesn't transcode Plex or run a local LLM, and the ThinkServer had no PCIe slot that could take a real GPU.

And then there was [Home Assistant](https://www.home-assistant.io/). I'd been running it for about 10 years at that point - but always on its own dedicated hardware, completely separate from the homelab. I deliberately left it out of the original post because it wasn't part of that setup. But I kept looking at it and thinking: what if I migrated it into a Proxmox VM? The problem was the ThinkServer had zero network segmentation. No VLANs, no firewall rules, just everything on one flat network. Mixing home automation with public-facing services on that? That felt wrong.

The ThinkServer didn't fail spectacularly. It just ran out of room.

## Buying a used Dell R730

The jump from consumer to enterprise hardware was driven by one thing: I needed a GPU in my server. Real PCIe slots. Proper power delivery. A chassis that could actually dissipate heat from a workstation graphics card without melting.

The R730 I landed on has dual Xeon E5-2698 v4 processors. 20 cores each, so 40 cores and 80 threads in one box. That turned out to be far more CPU than I need - over the last 30 days both hosts averaged about 13% CPU, and neither went past 51% even at its busiest five minutes. The PCIe slots were the point. The cores came along for the ride.

Then the electricity bill showed up. I never metered the ThinkServer, but it was probably around 80W at idle, about $9 a month. The rack now averages about 420W - roughly four to seven idle desktops' worth of power, 24/7, in my attic, in Minnesota. The full numbers are in the [power section below](#power-about-420w-and-46-a-month).

### Why the R730: ECC, iDRAC, dual PSUs, and PCIe slots

I spent weeks reading r/homelab threads, watching ServeTheHome reviews, and comparing spec sheets. Kept coming back to the [Dell PowerEdge R730](https://www.dell.com/support/manuals/en-us/poweredge-r730/r730_ompublication/technical-specifications?guid=guid-c32a42e1-fbc4-4dfe-983d-df4d34ff1e17&lang=en-us) for four reasons:

**ECC RAM.** ECC corrects single-bit memory errors and flags the ones it can't fix, so a flaky stick shows up in a log instead of as a corrupted file or a container that crashes for no reason. That matters on a box that runs for months without a reboot. Full disclosure: across 63 days of uptime on both hosts, the kernel has logged zero corrected memory errors. So far it's insurance I haven't needed.

**iDRAC.** This is the feature that ruins you for everything else. It's a management controller built into the board, independent of the OS - basically an IP KVM that came free with the server. I can watch the BIOS POST screen from bed, mount a virtual ISO to reinstall the OS, or power-cycle a hung box without walking up to the attic. From outside the house I reach it over Tailscale, through a subnet router that runs as a container on prxbox1. Which means if prxbox1 is the box that's down, I can't reach either iDRAC remotely. I learned that while researching this update, not during an outage, which is the good order to learn it in. The iDRAC ports also sit on my main LAN, where a stricter setup would give them their own management VLAN.

**Dual PSU.** One power supply dies? Server keeps running. In a datacenter that's table stakes. In my attic it means a dead PSU is an Amazon order, not a 3 AM emergency.

**PCIe expansion.** Enough slots for GPUs, 10G network cards, and whatever I decide I need six months from now.

### Where to buy used enterprise servers

Here's the economics that make all of this possible: enterprise hardware depreciates like a luxury car. Companies lease thousands of R730s, run them for 3-5 years, and then dump them when the lease ends and newer hardware arrives. A barebones R730 chassis can show up on eBay for $300-500. But if you want one configured with specific CPUs, RAM, and drives - ready to rack and run - expect to pay more. I bought mine from Server Design Lab fully configured for about $1,850 each. Still a fraction of the $15,000+ sticker price new, but not the "$300 eBay special" you see in Reddit posts.

Best places I've found: eBay (sort by newly listed - the good deals go fast), r/homelabsales on Reddit, specialty refurbishers like Server Design Lab, and local IT surplus liquidators. If you're near any city with tech companies, there's probably a warehouse within driving distance selling rack servers by the pallet.

### Desktop GPUs don't fit in a 2U server

Here's something I learned the expensive way: you can't just drop a gaming GPU into a 2U rack server.

I know. Obvious in retrospect. But when you've spent years building desktop PCs where any GPU fits in any case, it doesn't occur to you that rack servers are a different universe. With Dell's GPU kit, the R730 can take full-length, double-wide cards. Most gaming GPUs still fail somewhere: they're taller than a standard PCIe bracket, their power connectors stick up past a lid that's 3.5 inches off the floor of the chassis, and their open-air coolers dump heat sideways into a box built for front-to-back airflow. Anything that pulls more than the slot's 75W also needs Dell's GPU power cable off the riser. A full-size RTX 4090 is three-plus slots thick and doesn't fit at all.

Single-slot workstation cards with blower coolers skip every one of those problems, which is why both of mine are NVIDIA's pro cards. I burned a weekend figuring this out before buying anything that actually fit.

### DDR4 ECC prices roughly tripled

I need to talk about this because it caught me off guard. Enterprise DDR4 ECC RAM has gotten significantly more expensive since I started this project, and the timing couldn't be worse.

The AI boom did this. Every company building GPU clusters and inference servers needs massive amounts of memory, and that demand is competing directly with the secondhand market that homelabbers depend on. Used DDR4 ECC sticks I could find for $40-80 a couple years ago now run $200-400 for 32GB RDIMMs - roughly 3x or worse. It's bad enough that it has [its own Wikipedia article](https://en.wikipedia.org/wiki/2025%E2%80%93present_global_memory_supply_shortage). The supply of used enterprise RAM dried up because the same companies that used to surplus it are now keeping older servers running longer to meet AI compute demand.

Each host has 128GB. Filling those DIMM slots was painful on the wallet. I picked the worst possible time to be upgrading enterprise servers as a hobby. But it's still a hobby, and it's still fun, so here we are.

![Y'all Got Any More Of That meme: Dave Chappelle as a homelabber asking every AI company 'Y'all got any more of that DDR4 ECC?'](/images/blog/homelab-two-years-later/meme-yall-got-any-more-ddr4.webp)

There's not a great way to mitigate this. You can watch r/homelabsales for deals and buy in bulk when you find good prices. Moving to a newer DDR5 platform doesn't save you either - the shortage hits DDR5 at least as hard. For DDR4 ECC right now? Budget for it on day one. Don't treat it as a "I'll upgrade later" afterthought, because later is more expensive - and with DDR4 production winding down, it's only going in one direction.

Worth knowing before you buy, though: right now prxbox1 uses about 45GB of its 128GB and prxbox2 about 27GB. I bought for headroom I haven't touched.

![Front view of both Dell R730 servers in the rack with drive bays and status LEDs visible](/images/blog/homelab-two-years-later/rack-front-servers.webp)

## A second server, a rack, and 10G networking

### A second R730 so Frigate and Plex stop fighting over one GPU

GPU time-sharing. I wanted local LLMs, Frigate's object detection, speech-to-text for Home Assistant voice, Plex transcoding, and Tdarr video encoding all running at once. A 15GB language model and an 8GB card don't fit together, and I didn't want Plex stuttering every time Frigate spotted a squirrel.

Two GPUs on two hosts split the work:

- **prxbox1** got a [Quadro RTX 4000](https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-4000-datasheet.pdf) (8GB VRAM) for the always-on stuff: Frigate's detector and its semantic-search and face models across 4 cameras, the camera video decodes, Whisper speech-to-text for Home Assistant voice (about 2GB on its own), and a Tdarr worker. It sits around 4GB used, and peaked at 4.7GB in the last 30 days.
- **prxbox2** got an [RTX A4000](https://www.nvidia.com/en-us/design-visualization/rtx-a4000/) (16GB VRAM) for the bursty stuff: Plex transcoding, [Immich](https://immich.app/) video transcoding, [Tdarr](https://github.com/HaveAGitGat/Tdarr) encoding, and local LLMs with [Ollama](https://ollama.com/) and [llama.cpp](https://github.com/ggml-org/llama.cpp).

The 16GB card is the reason the big model runs at all. My largest one is a 30B coding model quantized down to a 13.8GB file, and it peaked at about 15GB of VRAM. The funny part: averaged over 30 days, the A4000 has less than 1GB in use, because models unload when nobody's asking them anything. It's empty most of the day and completely full for a few minutes at a time.

Immich's face recognition and search models run on CPU on purpose, so they never fight an LLM for VRAM. With 80 threads mostly idle, CPU is the cheap resource here.

### A rack is just a desktop split into separate boxes

I knew embarrassingly little about server racks. I didn't know 19 inches was a standard width. I was measuring my R730s with a tape measure trying to figure out what kind of enclosure would hold them. Turns out the width goes back to the 1920s (telephone industry, originally), and today mounting holes, unit height, and rail depth all follow the same spec.

The mental model that finally made it click for me: **a server rack is just a desktop computer where every component lives in its own chassis.** Your desktop has a CPU, GPU, RAM, storage, network card, and power supply all crammed into one box. A rack separates all of that:

- **Compute** = the Dell R730 servers (CPU + RAM + GPU)
- **Storage** = [Synology DS418play](https://www.synology.com/en-global/support/download/DS418play) on a shelf, 48TB with 34TB used
- **Networking** = [MikroTik CRS317](https://mikrotik.com/product/crs317_1g_16s_rm) for 10G between the servers + [UniFi US-24](https://store.ui.com/us/en/products/usw-24) for 1G devices
- **Power** = PDU (power distribution) + two UPS units (battery backup so a power blip doesn't kill everything)
- **Management** = iDRAC ports on each server

Same building blocks. Physically separated. Independently replaceable. Once I thought about it that way, the whole thing stopped being intimidating and started making sense.

![Full 25U server rack in the attic showing both Dell R730 servers, MikroTik and UniFi networking, Synology NAS, and dual UPS units](/images/blog/homelab-two-years-later/rack-full-front.webp)

Here's the actual rack layout:

```
StarTech 25U Rack
+----------------------------------+
|   StarTech PDU                   |  1U
+----------------------------------+
|   MikroTik CRS317 (10G Switch)  |  1U
+----------------------------------+
|   UniFi US24 (24-port 1G)       |  1U
+----------------------------------+
|   UniFi Cloud Gateway Ultra      |  shelf
|   Synology NAS (4-bay)          |  shelf
+----------------------------------+
|          (empty - future NAS)    |
+----------------------------------+
|   Dell R730 - prxbox1            |  2U
|   (Quadro RTX 4000, 8GB)        |
+----------------------------------+
|   Dell R730 - prxbox2            |  2U
|   (RTX A4000, 16GB)             |
+----------------------------------+
|          UPS                     |  2U
+----------------------------------+
|          UPS                     |  2U
+----------------------------------+
```

![Close-up of the rack top section showing PDU, patch panel, UniFi switch, and Synology NAS with networking cables](/images/blog/homelab-two-years-later/rack-top-networking.webp)

### Dual 10G LACP bonds to each host

Each R730 has two 10G SFP+ ports on an Intel X710, bonded with LACP to the MikroTik. That's 20Gbps per host on paper. A single TCP connection only ever uses one of the two links, because LACP picks a link per flow, not per packet.

Here's what the bonds actually carried over the last 30 days:

| Host    | Average in | Peak in (5 min) | Average out | Peak out (5 min) |
| ------- | ---------- | --------------- | ----------- | ---------------- |
| prxbox1 | 32 Mbps    | 1.0 Gbps        | 30 Mbps     | 0.7 Gbps         |
| prxbox2 | 184 Mbps   | 0.9 Gbps        | 28 Mbps     | 1.0 Gbps         |

The busiest minute either host has had peaked at about 1.2Gbps - roughly 12% of a single 10G link. The bonds are fine. My network design is what caps them. The NAS has two 1G ports and hangs off the UniFi switch, and the UniFi switch connects to the MikroTik at 1G. So the NAS, the internet, and every client in the house share one 1G uplink. The only thing that uses the 10G links is server-to-server traffic: prxbox1's backups landing on the Proxmox Backup Server container on prxbox2, apps on one host calling the LLMs on the other, and Prometheus scrapes.

If you're planning a build like this, the 10G links were the part I needed least. Put the money into getting the NAS onto 10G first, or skip 10G entirely.

I still enjoyed setting it up. I wrote a [Python script to manage the MikroTik bonding configuration programmatically](/blog/implementing-mikrotik-binary-api-protocol-in-python/) because clicking through web UIs to configure network infrastructure felt wrong. That turned into its own blog post about implementing MikroTik's proprietary binary protocol from scratch.

## Rebuilding my home network to learn VLANs

I wanted to understand networking properly - VLANs, firewall rules, routing, subnets, all of it. So I did what any reasonable person would do.

I tore down my entire home network and rebuilt it from scratch.

### UniFi gateway, MikroTik backbone, three access points

[UniFi Cloud Gateway Ultra](https://store.ui.com/us/en/products/ucg-ultra) as the router, firewall, DHCP server, and WiFi controller. It does all the routing between VLANs and runs Suricata intrusion prevention inline. The MikroTik is just a 10G switch. Three UniFi access points with 802.11r fast roaming: two [U7 Pros](https://ui.com/us/wifi/u7-pro), one upstairs and one on the main floor, plus a U7 Pro XG I added in the basement later. Devices hand off between APs as I walk through the house without dropping connections. Guests don't notice, which is the highest compliment network infrastructure can receive.

### Four VLANs keep the IoT junk away from my NAS

Here's the thing about IoT devices. They're manufactured by companies you've never heard of, running firmware that rarely gets security patches, phoning home to servers in countries you can't identify on a map. I do not want any of them to have network access to my NAS full of family photos and financial documents.

VLANs create separate virtual networks that can't talk to each other unless I write a firewall rule allowing it. Here's what each one can actually reach:

| Network                   | Can reach                                          | Blocked from      |
| ------------------------- | -------------------------------------------------- | ----------------- |
| Default LAN (192.168.0.x) | Everything                                         | -                 |
| Guest (192.168.20.x)      | Internet, DNS, the speakers (for AirPlay and Cast) | Main LAN, cameras |
| IoT (192.168.30.x)        | Home Assistant, DNS, my music server, the internet | Main LAN, guests  |
| Cameras (192.168.40.x)    | Frigate, Home Assistant, DNS                       | Main LAN, IoT     |

A compromised smart plug on the IoT VLAN can't reach my NAS. A guest can't scan my local network. The IoT VLAN does still have internet access, because plenty of these devices stop working without their cloud.

Two honest footnotes. First, casting across VLANs needs mDNS, and right now the gateway reflects all mDNS traffic between networks instead of just AirPlay and Cast. Narrowing that is on my list. Second, only 11 devices are on the IoT VLAN right now. A lot of my older smart stuff still lives on the main LAN, fenced in by a MikroTik firewall list I set up before the VLANs existed. Moving them over is the kind of job that never feels urgent until something gets popped.

Here's how the network is structured:

```
Internet
  |
  v
Fiber ONT (bridge mode)
  |
  v
UniFi Cloud Gateway Ultra (Router / Firewall / DHCP / WiFi Controller)
  |
  v
MikroTik CRS317 (10G switch)
  |
  +---> prxbox1 (2x 10G LACP = 20Gbps)
  +---> prxbox2 (2x 10G LACP = 20Gbps)
  |
  +---> UniFi US24 (1G switch, 1G uplink to the MikroTik)
          |
          +---> Synology NAS (2x 1G)
          +---> iDRAC1, iDRAC2, IoT devices, cameras
          +---> UniFi U7 Pro AP (Upstairs)
          +---> UniFi U7 Pro AP (Main Floor)
          +---> UniFi U7 Pro XG AP (Basement)

VLANs:
  Default LAN (192.168.0.0/24)  - servers, workstation, trusted
  Guest       (192.168.20.0/24) - internet, DNS, speakers
  IoT         (192.168.30.0/24) - HA + DNS + music server + internet
  Cameras     (192.168.40.0/24) - Frigate + HA + DNS
```

## What the 73 containers run

You'd think 80 cores, 256GB of RAM, and 24GB of GPU VRAM would get filled. They don't. The CPUs average about 13%, and the two hosts use about 72GB of RAM between them. The only thing I fill is VRAM, and only when a big model loads.

Right now that's 73 LXC containers plus the Home Assistant VM - 45 on prxbox1, 28 on prxbox2. Not exhaustive - check my [uses page](/uses) for more. But here's the landscape:

**Media:** Plex (the busiest it got in the last 30 days was 5 streams and 3 transcodes at once), Immich (self-hosted Google Photos, holding 55,581 photos and 12,296 videos - the only thing I miss from Google is photo editing), full \*arr stack ([Sonarr](https://sonarr.tv/), [Radarr](https://radarr.video/), [Prowlarr](https://prowlarr.com/), [Lidarr](https://lidarr.audio/), and a few more), [LazyLibrarian](https://lazylibrarian.gitlab.io/) for books since Readarr was retired, Tdarr for automated video health checking and transcoding, a [GPU-accelerated subtitle generator](/blog/building-a-gpu-accelerated-subtitle-generator/) I built with Whisper AI, [Audiobookshelf](https://www.audiobookshelf.org/)

**Security:** Frigate NVR, [Vaultwarden](https://github.com/dani-garcia/vaultwarden) (self-hosted Bitwarden), [Authentik](https://goauthentik.io/) (SSO for every service), [CrowdSec](https://www.crowdsec.net/) (community threat intelligence)

**Home automation:** Home Assistant as a full VM (not a container - it needs the supervisor for add-ons and updates), [Zigbee2MQTT](https://www.zigbee2mqtt.io/) for local Zigbee control without any cloud dependency

**AI/ML:** Ollama runs the everyday models (Qwen3 8B and 14B), and llama.cpp's `llama-server` runs the big 30B coding model. A LiteLLM gateway in front gives every app one endpoint with aliases like `local-fast` and `local-smart`, plus a cloud route to Claude for the jobs a local model can't handle. I used to run Open WebUI on top for a ChatGPT-style interface, then retired it in June - llama-server's built-in web UI does what I need with one less service to keep alive.

**Monitoring:** [Prometheus](https://prometheus.io/), [Grafana](https://grafana.com/), [Loki](https://grafana.com/oss/loki/), [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/), [Uptime Kuma](https://github.com/louislam/uptime-kuma), Healthchecks, plus a pile of custom health check scripts (more on those below)

**Productivity:** [Paperless-NGX](https://docs.paperless-ngx.com/) scans and OCRs my documents, and Paperless-AI tags them with the local Qwen3 8B model. 308 documents in, it has invented 1,172 tags, so the AI is nothing if not enthusiastic. [Syncthing](https://syncthing.net/) handles file sync. I ran Nextcloud for a while and replaced it in September, because Syncthing does the one job I was actually using Nextcloud for.

## Home Assistant moved off its own box and into a Proxmox VM

I've been running Home Assistant for about 10 years - long before this homelab existed. It always lived on its own dedicated hardware, and two years ago I kept it off the ThinkServer on purpose, because I didn't trust mixing home automation with everything else on one flat network.

VLANs fixed the isolation problem, so it moved into a VM on prxbox1. What that bought me is that Home Assistant now sits on the same network as the servers and can talk to Proxmox, Prometheus, and Alertmanager directly. A few of the 134 automations that depend on that:

- **Night mode** SSHes to prxbox1 at 11 PM and runs a script that stops 11 non-essential containers across both hosts, then starts them again at 6 AM. (More on whether it's worth it below.)
- **AI-translated alerts.** Alertmanager sends a webhook to Home Assistant, a local LLM rewrites the alert in plain English, and my phone gets a notification with "Open Grafana" and "Silence for 1 hour" buttons.
- **Backup failure recovery.** If the Home Assistant backup fails to upload, it reloads the NAS mount, re-runs the backup, and checks the result five minutes later.
- **UPS monitor.** When either UPS switches to battery, I get a live battery-level notification with a link to the Grafana UPS dashboard.

What it cost me is independence. The VM, the Zigbee coordinator (a ConBee II USB stick passed into the Zigbee2MQTT container), and the Bluetooth adapter all live on prxbox1. There's no failover. If prxbox1 reboots, the house loses its automations until the VM comes back. The wall switches still work, because I build every automation to fail that way, but the smart stuff waits. That's the trade I made.

I wrote more about why Home Assistant matters so much to me in my post about [replacing Alexa with a private, local-first setup](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/).

## Monitoring, after three silent failures

There's a specific moment where a homelab stops being a hobby project and starts feeling like production infrastructure you're personally responsible for. For me, that moment was the third time I discovered a service had been silently dead for over a week.

Third time. A week each time. Nobody noticed.

### Prometheus, Grafana, Loki, and Alertmanager

**Prometheus** scrapes metrics from every host and container every 15 seconds. CPU, memory, disk, network throughput, GPU utilization, VRAM usage, inlet temperature, exhaust temperature, iDRAC power readings, and the rack's power draw from Home Assistant. It keeps 30 days, which is where almost every number in this post came from.

**Grafana** turns that into dashboards. The main overview shows both servers at a glance - power draw, CPU load, memory pressure, GPU status, disk I/O. I check it most mornings with coffee. It's weirdly satisfying.

**Loki** aggregates logs from every container. When something breaks, I search from one Grafana panel instead of SSH-ing into individual containers and tailing log files like it's 2003.

**Alertmanager** is the one place alerts go. It emails me, and critical alerts also go through Home Assistant to my phone. I used to run ntfy for push notifications too, and shut it down in September. Two alert paths meant two things to maintain and one I'd eventually stop trusting.

### 185 health checks, each testing one thing

When I first wrote this post I had 41 health check scripts. Now it's 153 shell checks on the Proxmox side plus 32 Python checks for Home Assistant.

This sounds insane. I know it sounds insane. But each one is dead simple: check one thing, exit 0 if healthy, exit 1 with a message if not. Backup verification. SSL certificate expiry. Disk space thresholds. DNS resolution. Container restart detection. Subtitles actually getting generated. Most of them are a few lines that call a shared library - the Radarr check is basically one function call against Radarr's own `/health` API. A wrapper runs them all at 6 AM, pings Healthchecks so I know the wrapper itself ran, and sends anything critical to Alertmanager.

The count keeps growing for a boring reason: every time something breaks in a way I didn't catch, the fix includes a new check. And here's the latest one I need to write. While pulling numbers for this update, I found the smart plug's rack power sensor had reported a perfectly flat 541W from September 1 to September 23. Three weeks of frozen data, and not one of 185 checks noticed. My first draft of this update used it. Check 186 will look for sensors that stop changing.

### Backups: PBS locally, Backblaze B2 offsite

[Proxmox Backup Server](https://www.proxmox.com/en/products/proxmox-backup-server/overview) runs as a container on prxbox2, with its datastore on the NAS. It does incremental backups with deduplication, and since nearly every container is the same Debian base, most chunks are shared. Right now 10.9TB of logical backups take up 1.31TB on disk - about 8.4x.

PBS is not an offsite backup, though. It lives in the same attic as everything it's backing up. So every day a small container syncs the whole PBS datastore to Backblaze B2, about $9 a month for 1.3TB. Once a week a separate job downloads a random 1/256 of the chunks and compares them against the local copy, and it's reported zero differences every week so far. The NAS also runs its own B2 backup with 60-day retention. Yes, that means I pay Backblaze again. A fire in the attic shouldn't take the backups with it.

## Every container is defined in OpenTofu

The biggest change since March isn't hardware. Every container is now defined in [OpenTofu](https://opentofu.org/) with the [`bpg/proxmox`](https://registry.terraform.io/providers/bpg/proxmox/latest/docs) provider. All 74 service directories call one shared module. Here's a trimmed real one, for the Healthchecks container:

```hcl
module "container" {
  source           = "../../modules/proxmox-lxc"
  template_file_id = "local:vztmpl/debian-13-standard_13.1-2_amd64.tar.zst"
  vmid             = var.vmid
  hostname         = var.hostname
  node_name        = var.node_name
  cores            = 2
  memory           = 1024
  disk_size        = 10
  unprivileged     = true
  tags             = ["immutable", "docker", "monitoring"]
  protection       = true
}

resource "null_resource" "provision" {
  triggers = {
    vmid           = module.container.vmid
    provision_hash = sha256(local.provision_script) # re-runs when the script changes
  }
  # renders provision.sh.tpl and runs it inside the container
}
```

Everything installed inside the container lives in that provision script, so changing a line in it re-provisions the container. If a fix isn't in the code, it doesn't exist, and SSH fixes on a finished container are banned. Every six hours a drift check runs `tofu plan -detailed-exitcode` in every service directory and flags anything changed outside the code. I wrote up the whole migration in [I Finally Stopped Managing My Homelab by Hand](/blog/opentofu-proxmox-immutable-homelab/).

It's the change I'd make first if I started over, and the one I put off longest. One limit worth knowing: the drift check only sees what OpenTofu manages, which is the containers. The Proxmox hosts themselves are still configured by hand. You'll see why that matters in the next section.

## Power: about 420W and $46 a month

Here's the real data. Per-server numbers come from each R730's iDRAC, and the rack total comes from a Home Assistant smart plug that the whole rack runs through. I'm using the plug's last 7 days only, because of the frozen-sensor mess above.

| Metric               | Value                                           |
| -------------------- | ----------------------------------------------- |
| prxbox1              | ~211W, 7-day average (the Quadro averages ~41W) |
| prxbox2              | ~191W, 7-day average (the A4000 averages ~25W)  |
| Both servers (iDRAC) | ~393W 7-day average, ~418W 30-day average       |
| Whole rack (plug)    | ~422W 7-day average                             |
| Daily consumption    | ~10 kWh                                         |
| Monthly cost         | ~$46 at $0.15/kWh                               |
| Annual projection    | ~$550                                           |

That's metered. Not estimated. The plug reads about 30W more than the two servers, which covers the switches, NAS, gateway, and UPS overhead.

### What I tried to cut the power bill

**Killed the third server.** I had prxbox3 - the original ThinkServer from my first blog post - still running 9 containers. Migrated all of them to the two R730s (which had plenty of room) and powered it off. I never metered it, so I can't tell you what that saved. It's fully out of the Proxmox cluster now. A Raspberry Pi running a quorum device gives the two-node cluster its tiebreaker vote instead.

**Night mode.** This was the automation I was proudest of.

```
Home Assistant: "Power - Night Mode System"
  |
  +--> 11 PM: Enter Night Mode
  |     +---> Stop 4 containers on prxbox2 (Ollama, Paperless, Paperless-AI, Audiobookshelf)
  |     +---> Stop 7 containers on prxbox1 (Kometa, Dockge, Maintainerr, etc.)
  |
  +--> 6 AM: Exit Night Mode
  |     +---> Start all stopped containers
  |     +---> Run health checks, post a Home Assistant notification
  |
  +--> Manual Override (phone toggle anytime)

Always running 24/7 (never stopped):
  Plex, Frigate, Immich, Tdarr, Home Assistant, Monitoring Stack,
  Infrastructure (reverse proxy, AdGuard, Tailscale),
  Media Automation (*arr stack, download clients)
```

I've written up night mode alongside [more of my favorite Home Assistant automations](/blog/best-home-assistant-automations/).

The notification it sends every night says "Saving ~175W." I never actually measured that. For this update I did. Over 30 days, the two servers averaged 414.5W between 11 PM and 6 AM and 419.1W the rest of the day - a difference of about 5W. Over the last 7 days, nights were slightly higher than days. The containers night mode stops are idle most of the time anyway, so stopping them saves almost nothing, and the overnight backup and cleanup jobs run in exactly that window.

So night mode, as built, is a well-engineered way to save about 15 cents a month. It either needs to stop things that actually draw power, or it needs to go. I haven't decided which. Lesson learned: measure before you automate.

**CPU governor tuning.** Both hosts are supposed to run the `powersave` frequency governor instead of `performance`. At 13% average CPU there's nothing for `performance` mode to speed up. When I checked for this update, prxbox1 was all `powersave`, but 31 of prxbox2's 80 threads had drifted back to `performance`. The governor is host-level config, and the hosts aren't in OpenTofu, so the drift check never had a chance to catch it.

![Anakin Padme 4 Panel meme: 'I put everything in OpenTofu' / 'So nothing can drift, right?' / Anakin's silent stare / '...nothing can drift, right?'](/images/blog/homelab-two-years-later/meme-anakin-padme-drift.webp)

### Built for data center power prices, not my attic

![Change My Mind meme - 'Enterprise servers are cheap to buy and expensive to run'](/images/blog/homelab-two-years-later/change-my-mind-enterprise.webp)

The R730 is cheap to buy: about $1,850 configured, against a five-figure price new, with ECC RAM, redundant power supplies, iDRAC, and expansion slots that consumer hardware doesn't have.

But these machines were designed for data centers paying industrial electricity rates well below residential, with industrial cooling. In my attic, on a residential plan, they're free heat in a Minnesota January and a problem in July. Factor in power before you buy that second server. Not after.

The obvious objection: a couple of modern mini PCs would run most of these 73 containers at a fraction of the power. The numbers back that up - my CPUs average 13% busy, and I use 72GB of 256GB of RAM. Frigate runs fine on a Coral, which plugs into anything. What a mini PC can't do is hold a 16GB workstation GPU for local LLMs and transcoding, or give me iDRAC and ECC. If you don't want local AI or GPU video work, buy mini PCs and skip the rack.

## 2023 vs. 2026

Sometimes it helps to just see the numbers side by side.

```
2023 (ThinkServer Era)          2026 (Server Rack Era)
========================        ========================
1x Lenovo ThinkServer           2x Dell R730 (ThinkServer retired)
Xeon E3 quad-core               80 cores / 160 threads, ~13% busy
32GB RAM                        256GB RAM, ~72GB used
No GPU                          2x NVIDIA GPUs (24GB VRAM)
~15 containers                  73 containers + 1 VM
Flat network (no VLANs)         4 VLANs, 10G between hosts
No monitoring                   Prometheus, Loki, 185 health checks
Configured by hand              Every container in OpenTofu
~80W power draw (estimated)     ~420W average (metered)
$200 hardware cost              ~$7,440 total hardware
~$105/yr power                  ~$550/yr power
```

That escalated.

![Ron Burgundy saying 'that escalated quickly'](/images/blog/homelab-two-years-later/escalated-quickly.webp)

## What it cost, and whether it pays for itself

### $7,440 in hardware

People always ask this, so here's the honest breakdown:

| Item                                     | Cost        |
| ---------------------------------------- | ----------- |
| R730 #1 (Server Design Lab, configured)  | $1,857      |
| R730 #2 (Server Design Lab, configured)  | $1,839      |
| ThinkServer (original post, now retired) | $200        |
| Quadro RTX 4000 8GB (eBay)               | $230        |
| RTX A4000 16GB (eBay)                    | $895        |
| UniFi Cloud Gateway Ultra                | $129        |
| UniFi U7 Pro APs (x2)                    | $378        |
| UniFi US-24 (renewed)                    | $225        |
| StarTech rack + shelves                  | $375        |
| MikroTik CRS317                          | $433        |
| CyberPower UPS (x2)                      | $778        |
| Cables, adapters, misc                   | ~$100       |
| **Total hardware**                       | **~$7,440** |
| Electricity (~$46/month x 24 months)     | ~$1,100     |
| **Total cost of ownership (2 years)**    | **~$8,540** |

That's not counting the basement AP I added later.

Is that a lot? Yes. Here's the other side of the math.

### Break-even is 4.6 years, if you squint

Every one of these services is something I used to pay for monthly and no longer do:

| Subscription replaced                       | Self-hosted with         | Monthly cost saved       |
| ------------------------------------------- | ------------------------ | ------------------------ |
| iCloud 2TB + Dropbox Plus                   | Immich + Syncthing       | ~$22                     |
| NordVPN                                     | Tailscale                | ~$13                     |
| 1Password                                   | Vaultwarden              | ~$4                      |
| ChatGPT Plus                                | Ollama + llama.cpp       | $20                      |
| Ring Protect Plus                           | Frigate                  | $12                      |
| Security monitoring plan                    | Frigate + Home Assistant | ~$80                     |
| Audible                                     | Audiobookshelf           | $15                      |
| Bluehost hosting (WordPress + dedicated IP) | Astro + Caddy on homelab | ~$21                     |
| **Total subscriptions killed**              |                          | **~$187/mo ($2,244/yr)** |

I left streaming out of this table on purpose, video and music both. I still pay for Apple Music, and "I cancelled Netflix" is a different argument from this one - not one I want to hang a break-even number on.

Two rows are generous, and I'd rather say so than have you find it. Tailscale isn't a privacy VPN like NordVPN - I just stopped needing one once I could reach my own network from anywhere. And a local 8B or 14B model isn't GPT-level. It handles tagging, summaries, and alert rewriting, and anything harder goes to Claude through the same gateway.

Subtract about $46/month of electricity and $9/month of Backblaze B2, and I'm netting about **$132/month**.

**Break-even: ~4.6 years** ($7,240 in hardware, leaving out the ThinkServer I already owned, divided by $132/month).

That number leans hard on one line. The $80 security monitoring plan is over 40% of the savings. Take it out and break-even stretches to more than 11 years. None of this counts my time either, which on a bad weekend is the most expensive part.

So does the homelab pay for itself? Eventually, maybe, if you squint. Subscription prices do keep going up - 1Password went from $2.99 to $3.99 in March, and Ring Protect from $10 to $12 in February - and I own my data and control my infrastructure. But I'm not going to pretend the spreadsheet is why I did this.

Honestly? It's a hobby. Hobbies cost money. Nobody asks a golfer to justify their club membership with a break-even analysis.

### The real return was my day job

The unintended ROI has been professional. I'm not going to get a job titled "homelab engineer." But running every layer of this myself - the network, the hosts, the deploys, the monitoring, the power bill - means that when I'm in a meeting about infrastructure costs or deployment strategy, I actually know what the platform team is talking about. I can push back on vendor pricing because I know what the underlying resources cost, down to the watt.

The homelab made me better at my day job in ways I didn't expect when I bought that first ThinkServer.

## What I'd do differently

If I were starting over tomorrow with everything I know now:

- **Infrastructure as code from day one, hosts included.** I put off OpenTofu for over a year because hand-configuring one more container always felt faster. It wasn't. And I stopped at the containers, which is how the CPU governor drifted.
- **Measure before you automate.** Night mode was a weekend of work to save about 5W. Five minutes in Prometheus would have told me that first.
- **VLANs from day one.** Retrofitting network segmentation onto a running homelab means updating every single service that hardcodes an IP address. It's a miserable weekend project that should've been a 10-minute setup decision.
- **Buy for the bottleneck.** I put 10G between two servers and left the NAS on 1G. Figure out what actually moves data before you buy the fast links.
- **Monitoring before the first failure, not after the third.** You don't need 150 scripts on day one. But uptime checks and basic backup verification should exist before you need them.
- **An offsite copy before you need it.** Local backups protect you from your own mistakes. They don't protect you from the attic.
- **GPU form factor research.** Measure twice, buy once. Rack servers are not desktop cases.
- **Budget for RAM upfront, but buy what you'll use.** The AI boom crushed the DDR4 ECC market, and I'm using about a quarter of what I bought.

## What's next

The homelab is never done. I know that now. Current explorations:

- Lower-power hardware for the services that don't need 40 cores (maybe a small NUC or mini PC for lightweight containers)
- Deciding whether night mode gets rebuilt around things that actually draw power, or retired
- A check for sensors that stop changing, and the Proxmox hosts themselves under code so the governor can't drift again
- A second way into the iDRACs that doesn't depend on prxbox1 being up
- Fixing things remotely - I've since started [driving the homelab from my phone with Claude Code](/blog/my-development-setup-2026/)

Each phase of this started with curiosity about one thing - "I want GPU transcoding," "I want to learn networking," "I want to run AI locally," "why did my power bill double?" - and ended with new hardware and new knowledge. This update added one more: "what do my own numbers actually say?" Turns out they had opinions.

If you read my [original homelab post](/blog/how-to-get-started-building-a-homelab-server-in-2024/) and you're wondering what comes next: this is one version of that answer. Follow the curiosity. Just keep an eye on your power bill.
