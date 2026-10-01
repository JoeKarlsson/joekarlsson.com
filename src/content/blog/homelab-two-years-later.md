---
title: 'My Homelab Two Years Later, Every Upgrade and What It Cost'
date: 2026-03-05
updatedDate: 2026-10-01
slug: 'homelab-two-years-later'
description: 'Two years after a $200 ThinkServer: two Dell R730s, 73 containers, metered power data, and an honest look at whether a homelab pays for itself.'
categories: ['Homelab']
heroImage: '/images/blog/homelab-two-years-later/hero.webp'
heroAlt: 'Server rack with two Dell R730 servers, 10G networking, and cable management'
tldr: 'Two years after my first homelab post, I went from a $200 ThinkServer with 15 containers to a server rack with two Dell R730s (80 cores, 256GB RAM), two NVIDIA GPUs, 10G networking, VLANs, and 73 containers managed in OpenTofu. Hardware cost about $7,400. A smart plug meters the whole rack at roughly 430-510W on average, about $55/month at $0.15/kWh. On paper it pays for itself in about 4.6 years, but that leans on one $80/month line item - take it out and break-even is over a decade. Here is every phase, what drove it, what it cost, and what I got wrong.'
---

Two years ago I bought a $200 ThinkServer off Facebook Marketplace, put Proxmox on it, ran about 15 containers, and wrote an [original homelab post](/blog/how-to-get-started-building-a-homelab-server-in-2024/) telling everyone that was all a homelab needed.

Today I have two Dell R730s in a rack in my attic, 73 containers, two NVIDIA GPUs, and 10G networking. A smart plug on the rack says the whole thing averages around 500W, or about $55 a month in electricity. Total hardware spend: about $7,400.

None of it was planned. Each phase started with one question or one frustration, usually at 11 PM on a Tuesday, and somehow always ended with new hardware in the rack and a higher electricity bill. This post covers each phase: what drove it, what it cost, what went wrong, and whether any of it pays for itself. Short version: slower than I first claimed.

_Updated October 2026: I first published this in March. Since then I've retired Open WebUI, Nextcloud, and Readarr, moved every container into OpenTofu, re-measured the power, and redid the money math - including a CPU count I had wrong by a factor of two. The numbers below are current._

## Where the $200 ThinkServer ran out

The original setup was genuinely great. A Xeon E3-1226 v3 with 4 cores, 32GB of RAM, 2TB of storage. [Proxmox](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) running LXC containers. [Plex](https://www.plex.tv/), the \*arr stack, Pi-Hole, download clients. For six months it handled everything without complaint.

Then I got ambitious. You know how it goes.

First it was Plex transcoding. Two people streaming at once and the quad-core Xeon started choking. GPU-accelerated transcoding would fix that, but the ThinkServer didn't have a PCIe slot that could fit anything useful. Then I saw [Frigate](https://frigate.video/) - real-time AI object detection on security camera feeds. Sounds incredible, right? Four CPU cores cannot do real-time neural network inference while simultaneously running 15 other services. Not happening.

And then there was [Home Assistant](https://www.home-assistant.io/). I'd been running it for about 10 years at that point - but always on its own dedicated hardware, completely separate from the homelab. I deliberately left it out of the original post because it wasn't part of that setup. But I kept looking at it and thinking: what if I migrated it into a Proxmox VM? The problem was the ThinkServer had zero network segmentation. No VLANs, no firewall rules, just everything on one flat network. Mixing home automation with public-facing services on that? That felt wrong.

The ThinkServer didn't fail spectacularly. It just ran out of room. And once you start seeing what's possible with more compute, more GPU VRAM, more network bandwidth - well. The itch starts.

## Buying a used Dell R730

The jump from consumer to enterprise hardware was driven by one thing: I needed a GPU in my server. Real PCIe slots. Proper power delivery. A chassis that could actually dissipate heat from a workstation graphics card without melting.

The R730 I landed on has dual Xeon E5-2698 v4 processors. 20 cores each, so 40 cores and 80 threads in one box.

Performance was unreal. And then the electricity bill showed up. The ThinkServer drew maybe 80W at idle. Cute. About $9 a month.

I have a Home Assistant smart plug tracking the entire rack's power draw in real time. The full numbers are in the [power section below](#power-about-500w-and-55-a-month), but the short version: **about $55/month in electricity.** A regular desktop PC idles at 60-100W. I'm running five to eight idle desktops' worth of power, 24/7, in my attic, in Minnesota.

### Why the R730: ECC, iDRAC, dual PSUs, and PCIe slots

I spent weeks reading r/homelab threads, watching ServeTheHome reviews, and comparing spec sheets. Kept coming back to the [Dell PowerEdge R730](https://www.dell.com/support/manuals/en-us/poweredge-r730/r730_ompublication/technical-specifications?guid=guid-c32a42e1-fbc4-4dfe-983d-df4d34ff1e17&lang=en-us) for four reasons:

**ECC RAM.** Error-correcting memory actually matters when your server runs 24/7 for months without rebooting. A single random bit flip in regular RAM can crash a container or - worse - silently corrupt data. ECC catches those errors before they cause problems. It's the kind of thing you don't appreciate until you've lost data to it exactly once.

**iDRAC.** This is the feature that ruins you for everything else. It's a dedicated management controller built into the server - completely independent of the main OS. I can reboot the server from my phone while I'm at the grocery store. Watch the BIOS POST screen from bed. Mount a virtual ISO to reinstall the OS remotely. When the server kernel panics at 2 AM, I don't have to walk up to the attic. Think of it like a KVM switch that's permanently attached.

**Dual PSU.** One power supply dies? Server keeps running. In a datacenter that's table stakes. In my attic it means a dead PSU is an Amazon order, not a 3 AM emergency.

**PCIe expansion.** Enough slots for GPUs, 10G network cards, and whatever I decide I need six months from now.

### Where to buy used enterprise servers

Here's the economics that make all of this possible: enterprise hardware depreciates like a luxury car. Companies lease thousands of R730s, run them for 3-5 years, and then dump them when the lease ends and newer hardware arrives. A barebones R730 chassis can show up on eBay for $300-500. But if you want one configured with specific CPUs, RAM, and drives - ready to rack and run - expect to pay more. I bought mine from Server Design Lab fully configured for about $1,850 each. Still a fraction of the $15,000+ sticker price new, but not the "$300 eBay special" you see in Reddit posts.

Best places I've found: eBay (sort by newly listed - the good deals go fast), r/homelabsales on Reddit, specialty refurbishers like Server Design Lab, and local IT surplus liquidators. If you're near any city with tech companies, there's probably a warehouse within driving distance selling rack servers by the pallet.

### Desktop GPUs don't fit in a 2U server

Here's something I learned the expensive way: you cannot just drop a desktop gaming GPU into a 2U rack server.

I know. Obvious in retrospect. But when you've spent years building desktop PCs where any GPU fits in any case, it doesn't occur to you that rack servers are a completely different universe. Desktop GPUs are designed for full-height PCIe slots with side-panel fans blowing directly onto them. A 2U server is 3.5 inches tall. The airflow goes front-to-back through a carefully engineered wind tunnel. A full-size RTX 4090 physically will not fit. Period.

For the R730, you need cards under a specific length and height - typically workstation or datacenter class GPUs. NVIDIA Quadro, NVIDIA RTX (the professional ones), Tesla. Not GeForce. I burned a weekend figuring this out before finding cards that actually worked.

### DDR4 ECC prices roughly tripled

I need to talk about this because it caught me off guard. Enterprise DDR4 ECC RAM has gotten significantly more expensive since I started this project, and the timing couldn't be worse.

The AI boom did this. Every company building GPU clusters and inference servers needs massive amounts of memory, and that demand is competing directly with the secondhand market that homelabbers depend on. Used DDR4 ECC sticks I could find for $40-80 a couple years ago now run $200-400 for 32GB RDIMMs - roughly 3x or worse. It's bad enough that it has [its own Wikipedia article](https://en.wikipedia.org/wiki/2025%E2%80%93present_global_memory_supply_shortage). The supply of used enterprise RAM dried up because the same companies that used to surplus it are now keeping older servers running longer to meet AI compute demand.

Each host has 128GB. Filling those DIMM slots was genuinely painful on the wallet. I picked the worst possible time to be upgrading enterprise servers as a hobby. But it's still a hobby, and it's still fun, so here we are.

![Y'all Got Any More Of That meme: Dave Chappelle as a homelabber asking every AI company 'Y'all got any more of that DDR4 ECC?'](/images/blog/homelab-two-years-later/meme-yall-got-any-more-ddr4.webp)

There's not a great way to mitigate this. You can watch r/homelabsales for deals and buy in bulk when you find good prices. Moving to a newer DDR5 platform doesn't save you either - the shortage hits DDR5 at least as hard. For DDR4 ECC right now? Budget for it on day one. Don't treat it as a "I'll upgrade later" afterthought, because later is more expensive - and with DDR4 production winding down, it's only going in one direction.

![Front view of both Dell R730 servers in the rack with drive bays and status LEDs visible](/images/blog/homelab-two-years-later/rack-front-servers.webp)

## A second server, a rack, and 10G networking

### A second R730 so Frigate and Plex stop fighting over one GPU

GPU time-sharing. I wanted to run local AI models (Ollama for LLMs, Immich ML for photo face recognition, Frigate for security camera object detection) alongside Plex transcoding and Tdarr video encoding. Trying to run all of that on one GPU simultaneously is a recipe for CUDA out-of-memory crashes and Plex stuttering every time Frigate detects a squirrel.

Two GPUs on two hosts solved it cleanly:

- **prxbox1** got a [Quadro RTX 4000](https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-4000-datasheet.pdf) (8GB VRAM) - dedicated to Frigate NVR running real-time object detection across 4 security cameras, plus a Tdarr distributed transcoding worker and the Whisper speech-to-text for Home Assistant voice
- **prxbox2** got an [RTX A4000](https://www.nvidia.com/en-us/design-visualization/rtx-a4000/) (16GB VRAM) - the big one, handling Plex hardware transcoding, [Immich](https://immich.app/) ML photo processing, [Tdarr](https://github.com/HaveAGitGat/Tdarr) encoding, and local LLMs with [Ollama](https://ollama.com/) and [llama.cpp](https://github.com/ggml-org/llama.cpp)

The 16GB card was the important investment. Running a decent local LLM eats VRAM fast, and 8GB fills up the moment you're also running photo ML and video transcoding on the same GPU.

### A rack is just a desktop split into separate boxes

I knew embarrassingly little about server racks. I didn't know 19 inches was a standard width. I was measuring my R730s with a tape measure trying to figure out what kind of enclosure would hold them. Turns out the width goes back to the 1920s (telephone industry, originally), and today mounting holes, unit height, and rail depth all follow the same spec.

The mental model that finally made it click for me: **a server rack is just a desktop computer where every component lives in its own chassis.** Your desktop has a CPU, GPU, RAM, storage, network card, and power supply all crammed into one box. A rack separates all of that:

- **Compute** = the Dell R730 servers (CPU + RAM + GPU)
- **Storage** = [Synology DS418play](https://www.synology.com/en-global/support/download/DS418play) on a shelf
- **Networking** = [MikroTik CRS317](https://mikrotik.com/product/crs317_1g_16s_rm) for 10G backbone + [UniFi US-24](https://store.ui.com/us/en/products/usw-24) for 1G devices
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

Each R730 has dual 10Gb SFP+ ports bonded via LACP to the MikroTik switch. That's 20Gbps aggregate bandwidth per host. A single TCP connection won't saturate both links (LACP distributes traffic by flow hash, not by individual packet), but when dozens of containers on each host are all hitting the NAS simultaneously - media files, log writes, backup streams - both links stay busy.

I wrote a [Python script to manage the MikroTik bonding configuration programmatically](/blog/implementing-mikrotik-binary-api-protocol-in-python/) because clicking through web UIs to configure network infrastructure felt wrong. That turned into its own blog post about implementing MikroTik's proprietary binary protocol from scratch.

## Rebuilding my home network to learn VLANs

I wanted to understand networking properly - VLANs, firewall rules, routing, subnets, all of it. So I did what any reasonable person would do.

I tore down my entire home network and rebuilt it from scratch.

### UniFi gateway, MikroTik backbone, three access points

[UniFi Cloud Gateway Ultra](https://store.ui.com/us/en/products/ucg-ultra) as the router, DHCP server, and WiFi controller. Three UniFi access points with 802.11r fast roaming: two [U7 Pros](https://ui.com/us/wifi/u7-pro), one upstairs and one on the main floor, plus a U7 Pro XG I added in the basement later. Devices hand off between APs as I walk through the house without dropping connections. Guests don't notice, which is the highest compliment network infrastructure can receive.

### Four VLANs keep the IoT junk away from my NAS

Here's the thing about IoT devices. They're manufactured by companies you've never heard of, running firmware that rarely gets security patches, phoning home to servers in countries you can't identify on a map. I have maybe 40 of these things in my house. I do not want any of them to have network access to my NAS full of family photos and financial documents.

VLANs create separate virtual networks that can't talk to each other unless I explicitly write a firewall rule allowing it:

- **Default LAN** (192.168.0.0/24) - trusted devices: servers, my workstation, phones
- **Guest** (192.168.20.0/24) - internet access only, can't see anything local
- **IoT** (192.168.30.0/24) - smart home devices, can only reach Home Assistant, DNS, and my music server
- **Cameras** (192.168.40.0/24) - security cameras, can only reach Frigate, Home Assistant, and DNS

A compromised smart plug can't reach my NAS. A camera can't exfiltrate data to the internet. A guest can't scan my local network. Each VLAN is its own isolated world with strictly controlled exits.

Here's how the network is structured:

```
Internet
  |
  v
Fiber ONT (bridge mode)
  |
  v
UniFi Cloud Gateway Ultra (Router / DHCP / WiFi Controller)
  |
  v
MikroTik CRS317 (10G Backbone)
  |
  +---> prxbox1 (2x 10G LACP = 20Gbps)
  +---> prxbox2 (2x 10G LACP = 20Gbps)
  |
  +---> UniFi US24 (1G switch)
          |
          +---> iDRAC1, iDRAC2, IoT devices, cameras
          +---> UniFi U7 Pro AP (Upstairs)
          +---> UniFi U7 Pro AP (Main Floor)
          +---> UniFi U7 Pro XG AP (Basement)

VLANs:
  Default LAN (192.168.0.0/24)  - servers, workstation, trusted
  Guest       (192.168.20.0/24) - internet only
  IoT         (192.168.30.0/24) - can reach HA + DNS + music server
  Cameras     (192.168.40.0/24) - can reach Frigate + HA + DNS
```

## What the 73 containers run

Here's what happens when you hand someone 80 cores, 256GB of RAM, and 24GB of GPU VRAM.

They fill it.

Right now that's 73 LXC containers plus the Home Assistant VM - 45 on prxbox1, 28 on prxbox2. Not exhaustive - check my [uses page](/uses) for more. But here's the landscape:

**Media:** Plex, Immich (self-hosted Google Photos - genuinely excellent), full \*arr stack ([Sonarr](https://sonarr.tv/), [Radarr](https://radarr.video/), [Prowlarr](https://prowlarr.com/), [Lidarr](https://lidarr.audio/), and a few more), [LazyLibrarian](https://lazylibrarian.gitlab.io/) for books since Readarr was retired, Tdarr for automated video health checking and transcoding, a [GPU-accelerated subtitle generator](/blog/building-a-gpu-accelerated-subtitle-generator/) I built with Whisper AI, [Audiobookshelf](https://www.audiobookshelf.org/)

**Security:** Frigate NVR, [Vaultwarden](https://github.com/dani-garcia/vaultwarden) (self-hosted Bitwarden), [Authentik](https://goauthentik.io/) (SSO for every service), [CrowdSec](https://www.crowdsec.net/) (community threat intelligence)

**Home automation:** Home Assistant as a full VM (not a container - it needs the supervisor for add-ons and updates), [Zigbee2MQTT](https://www.zigbee2mqtt.io/) for local Zigbee control without any cloud dependency

**AI/ML:** Ollama and llama.cpp's `llama-server` behind a LiteLLM gateway. I used to run Open WebUI on top for a ChatGPT-style interface, then retired it in June - llama-server's built-in web UI does what I need with one less service to keep alive. No API costs. No data leaving my network. No rate limits. I use it daily.

**Monitoring:** [Prometheus](https://prometheus.io/), [Grafana](https://grafana.com/), [Loki](https://grafana.com/oss/loki/), [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/), [Uptime Kuma](https://github.com/louislam/uptime-kuma), Healthchecks, plus a pile of custom health check scripts (more on those below)

**Productivity:** [Paperless-NGX](https://docs.paperless-ngx.com/) (scans every receipt and document, OCRs them, uses AI to categorize and tag automatically - it's magic), [Syncthing](https://syncthing.net/) for file sync. I ran Nextcloud for a while and replaced it in September. Syncthing does the one job I was actually using Nextcloud for.

## Home Assistant moved off its own box and into a Proxmox VM

This one deserves a callout because it's one of the biggest changes from the original post.

I've been running Home Assistant for about 10 years - long before this homelab existed. But it always lived on its own dedicated hardware, completely isolated from everything else. Two years ago I deliberately kept it separate from the ThinkServer because I didn't trust mixing home automation with other services on a single machine with no network isolation. That was a reasonable concern! And it was completely addressed by VLANs and a dedicated VM.

Once I had proper network segmentation, migrating Home Assistant into a Proxmox VM on the R730 was a no-brainer. Now it's the single most important piece of the entire homelab. It doesn't just control lights - it manages server power states, monitors container health, runs the night mode system, and orchestrates automations I couldn't have imagined two years ago. I wrote about that journey in my post about [replacing Alexa with a private, local-first setup](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/).

Moving it from dedicated hardware into the rack unlocked a whole new level of integration. Having Home Assistant on the same network backbone as the servers means automations can talk directly to Proxmox, containers, and monitoring - no hacks or workarounds needed.

## Monitoring, after three silent failures

There's a specific moment where a homelab stops being a hobby project and starts feeling like production infrastructure you're personally responsible for. For me, that moment was the third time I discovered a service had been silently dead for over a week.

Third time. A week each time. Nobody noticed.

### Prometheus, Grafana, Loki, and Alertmanager

**Prometheus** scrapes metrics from every host and container every 15 seconds. CPU, memory, disk, network throughput, GPU utilization, VRAM usage, inlet temperature, exhaust temperature, and the rack's power draw from Home Assistant. All of it, continuously, into a time-series database.

**Grafana** turns that into dashboards. The main overview shows both servers at a glance - power draw, CPU load, memory pressure, GPU status, disk I/O. I check it most mornings with coffee. It's weirdly satisfying.

**Loki** aggregates logs from every container. When something breaks, I search from one Grafana panel instead of SSH-ing into individual containers and tailing log files like it's 2003.

**Alertmanager** is the one place alerts go. It emails me, and critical alerts also push through Home Assistant to my phone. I used to run ntfy for push notifications too, and shut it down in September. Two alert paths meant two things to maintain and one I'd eventually stop trusting.

### 185 health checks, each testing one thing

When I first wrote this post I had 41 health check scripts. Now it's 153 shell checks on the Proxmox side plus 32 Python checks for Home Assistant.

This sounds insane. I know it sounds insane. But each one is dead simple: check one thing, exit 0 if healthy, exit 1 with a message if not. Backup verification. SSL certificate expiry. Disk space thresholds. DNS resolution. Container restart detection. Subtitles actually getting generated. A wrapper runs them all at 6 AM, pings Healthchecks so I know the wrapper itself ran, and sends anything critical to Alertmanager.

The count keeps growing for a boring reason: every time something breaks in a way I didn't catch, the fix includes a new check. I haven't been surprised by a silent failure in months.

### Backups: PBS locally, Backblaze B2 offsite

[Proxmox Backup Server](https://www.proxmox.com/en/products/proxmox-backup-server/overview) handles incremental backups with deduplication. Most of the filesystem is identical between containers (they're nearly all Debian under the hood), so PBS only stores unique data chunks. The last time I checked, about 5TB of logical backups took up about 1.3TB on disk - roughly 3.8x.

PBS is not an offsite backup, though. It lives in the same attic as everything it's backing up. So every day at 1 PM a small container syncs the whole PBS datastore to Backblaze B2, and the NAS runs its own B2 backup with 60-day retention. Yes, that means I pay Backblaze again. A fire in the attic shouldn't take the backups with it.

## Every container is defined in OpenTofu

The biggest change since March isn't hardware. Every container is now defined in [OpenTofu](https://opentofu.org/) - resources, network, and everything installed inside it. If a fix isn't in the code, it doesn't exist, and SSH fixes on a finished container are banned. A scheduled drift check compares the running containers against the code. I wrote up the whole migration in [I Finally Stopped Managing My Homelab by Hand](/blog/opentofu-proxmox-immutable-homelab/).

It's the change I'd make first if I started over, and the one I put off longest.

## Power: about 500W and $55 a month

OK. Let's talk about the electricity.

Here's the real data, re-measured for this update. Rack totals come from my Home Assistant energy monitoring plug (`sensor.office_server_rack_power`), which tracks the entire server rack through a smart power outlet. Per-server numbers come from each R730's iDRAC.

| Metric             | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| prxbox1 power draw | ~214W, 7-day average (Quadro RTX 4000 at ~40W under Frigate) |
| prxbox2 power draw | ~190W, 7-day average (RTX A4000 averaging ~12W)              |
| Total rack         | ~430W 7-day average, ~510W 30-day average (range: 352W-868W) |
| Daily consumption  | 10.4-12.3 kWh/day                                            |
| Monthly cost       | ~$55 at $0.15/kWh (30-day average)                           |
| Annual projection  | ~$660                                                        |

That's metered. Not estimated. The gap between the two servers and the rack total is everything else on the plug: switches, NAS, gateway, and UPS overhead.

### Three ways I cut the power bill

**Killed the third server.** I had prxbox3 - the original ThinkServer from my first blog post - still running 9 containers. Migrated all of them to the two R730s (which had plenty of headroom) and powered it off. It's fully out of the Proxmox cluster now. A Raspberry Pi running a quorum device gives the two-node cluster its tiebreaker vote instead.

**Night mode.** This is the automation I'm most proud of building.

```
Home Assistant: "Power - Night Mode System"
  |
  +--> 11 PM: Enter Night Mode
  |     +---> Stop 4 containers on prxbox2 (Ollama, Paperless, Paperless-AI, Audiobookshelf)
  |     +---> Stop 7 containers on prxbox1 (Kometa, Dockge, Maintainerr, etc.)
  |
  +--> 6 AM: Exit Night Mode
  |     +---> Start all stopped containers
  |     +---> Post a Home Assistant notification
  |
  +--> Manual Override (phone toggle anytime)

Always running 24/7 (never stopped):
  Plex, Frigate, Immich, Tdarr, Home Assistant, Monitoring Stack,
  Infrastructure (reverse proxy, AdGuard, Tailscale),
  Media Automation (*arr stack, download clients)
```

I've since written up night mode alongside [more of my favorite Home Assistant automations](/blog/best-home-assistant-automations/).

When I first built it, night mode stopped 17 containers and saved about 175W overnight, roughly $7/month. Since then I've pulled Tdarr and a few others out of it because I wanted them running overnight, so it stops 11 now and the saving is smaller. I haven't re-measured it yet, which is a little embarrassing in a post about metered power. If I need Ollama at 1 AM (it happens), I can override from my phone.

**CPU governor tuning.** Both hosts are supposed to run the `powersave` frequency governor instead of `performance`. There's absurd headroom even in power-save. CPUs ramp up when a workload demands it, drop to minimum frequency when idle. When I checked for this update, prxbox1 was all `powersave`, but 31 of prxbox2's 80 threads had drifted back to `performance`. Nothing in my OpenTofu code manages the governor, so nothing caught it. That's the whole argument for putting everything in code, in one bug.

![Anakin Padme 4 Panel meme: 'I put everything in OpenTofu' / 'So nothing can drift, right?' / Anakin's silent stare / '...nothing can drift, right?'](/images/blog/homelab-two-years-later/meme-anakin-padme-drift.webp)

### Cheap to buy, expensive to run

![Change My Mind meme - 'Enterprise servers are cheap to buy and expensive to run'](/images/blog/homelab-two-years-later/change-my-mind-enterprise.webp)

The R730 is an incredible value on the used market. Even configured, you're paying a fraction of the original five-figure price, with ECC RAM, redundant power supplies, iDRAC, and expansion capabilities that consumer hardware can't touch.

But these machines were designed for data centers paying industrial electricity rates well below residential, with industrial cooling. In my attic, on a residential plan, with Minnesota heating costs on top of it? The economics look different. Factor in power before you buy that second server. Not after.

The obvious objection: a couple of modern mini PCs would run most of these 73 containers at a fraction of the power. For the \*arr stack, Vaultwarden, Paperless, and the monitoring stack, that's true, and it's why lower-power hardware is on my "What's Next" list. What a mini PC can't do is hold a 16GB workstation GPU for Frigate, Immich, and local LLMs, or give me iDRAC and ECC. If you don't want local AI or GPU video work, buy mini PCs and skip the rack.

## 2023 vs. 2026

Sometimes it helps to just see the numbers side by side.

```
2023 (ThinkServer Era)          2026 (Server Rack Era)
========================        ========================
1x Lenovo ThinkServer           2x Dell R730 (ThinkServer retired)
Xeon E3 quad-core               80 cores / 160 threads total
32GB RAM                        256GB RAM total
No GPU                          2x NVIDIA GPUs (24GB VRAM)
~15 containers                  73 containers + 1 VM
Flat network (no VLANs)         4 VLANs, 10G backbone
No monitoring                   Full observability + 185 health checks
Configured by hand              Every container in OpenTofu
~80W power draw                 ~430-510W average
$200 hardware cost              ~$7,440 total hardware
~$105/yr power                  ~$660/yr power
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
| Electricity (~$55/month x 24 months)     | ~$1,320     |
| **Total cost of ownership (2 years)**    | **~$8,760** |

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

Subtract about $55/month of electricity and I'm netting about **$132/month**.

**Break-even: ~4.6 years** ($7,240 in hardware, leaving out the ThinkServer I already owned, divided by $132/month).

That number leans hard on one line. The $80 security monitoring plan is over 40% of the savings. Take it out and break-even stretches to more than 11 years. None of this counts my time either, which on a bad weekend is the most expensive part.

So does the homelab pay for itself? Eventually, maybe, if you squint. Subscription prices do keep going up - 1Password went from $2.99 to $3.99 in March, and Ring Protect from $10 to $12 in February - and I own my data and control my infrastructure. But I'm not going to pretend the spreadsheet is why I did this.

Honestly? It's a hobby. Hobbies cost money. Nobody asks a golfer to justify their club membership with a break-even analysis.

### The real return was my day job

The unintended ROI has been professional. Running this homelab gave me a working understanding of the full stack - deployments, hosting, infrastructure, networking, monitoring, cost optimization - that I never got from application development alone. I'm not going to get a job titled "homelab engineer." But when I'm in a meeting scoping infrastructure costs, or collaborating with platform and DevOps teams on deployment strategy, or estimating cloud compute budgets, I actually understand what they're talking about. I can push back on vendor pricing because I know what the underlying resources cost. I can scope cross-domain projects more accurately because I've touched every layer of the stack myself.

The homelab made me better at my day job in ways I didn't expect when I bought that first ThinkServer.

## What I'd do differently

If I were starting over tomorrow with everything I know now:

- **Infrastructure as code from day one.** I put off OpenTofu for over a year because hand-configuring one more container always felt faster. It wasn't. Every undocumented fix became something I had to rediscover later.
- **VLANs from day one.** Retrofitting network segmentation onto a running homelab means updating every single service that hardcodes an IP address. It's a miserable weekend project that should've been a 10-minute setup decision.
- **Monitoring before the first failure, not after the third.** You don't need 150 scripts on day one. But uptime checks and basic backup verification should exist before you need them.
- **An offsite copy before you need it.** Local backups protect you from your own mistakes. They don't protect you from the attic.
- **GPU form factor research.** Measure twice, buy once. Rack servers are not desktop cases.
- **Budget for RAM upfront.** The AI boom crushed the DDR4 ECC market. Prices went up, not down, and they haven't come back.
- **Power costs from the very start.** Not after the first bill shock.

## What's next

The homelab is never done. I know that now. Current explorations:

- Lower-power hardware for services that don't need 40 cores (maybe a small NUC or mini PC for lightweight containers)
- Re-measuring night mode now that it stops fewer containers, and putting the CPU governor under code so it can't drift again
- More self-healing automation - containers that detect their own failure and restart without waking me up
- Fixing things remotely - I've since started [driving the homelab from my phone with Claude Code](/blog/my-development-setup-2026/)

None of this was planned. I didn't draw up a blueprint for a dual-server rack with 10G networking in 2023. Each phase started with curiosity about one thing - "I want GPU transcoding," "I want to learn networking," "I want to run AI locally," "why did my power bill double?" - and ended with new hardware and new knowledge.

If you read my [original homelab post](/blog/how-to-get-started-building-a-homelab-server-in-2024/) and you're wondering what comes next: this is one version of that answer. Follow the curiosity. Just keep an eye on your power bill.
