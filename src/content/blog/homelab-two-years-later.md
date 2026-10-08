---
title: 'My Homelab Two Years Later, Every Upgrade and What It Cost'
date: 2026-03-05
updatedDate: 2026-10-01
slug: 'homelab-two-years-later'
description: 'Two years after a $200 ThinkServer: two Dell R730s, 73 containers, metered power data, and whether a homelab pays for itself.'
categories: ['Homelab']
heroImage: '/images/blog/homelab-two-years-later/hero.webp'
heroAlt: 'Server rack with two Dell R730 servers, 10G networking, and cable management'
tldr: 'Two years after my first homelab post, I went from a $200 ThinkServer with 15 containers to a server rack with two Dell R730s (80 cores, 256GB RAM), two NVIDIA GPUs, 10G networking, VLANs, and 73 containers managed in OpenTofu. Hardware cost about $7,400. The rack averages about 430W, roughly $47/month at $0.15/kWh. On paper it pays for itself in about 4.6 years, but that leans on one $80/month line item - take it out and break-even is over a decade. I also bought a lot more than I use.'
---

Two years ago I bought a $200 ThinkServer off Facebook Marketplace, put Proxmox on it, ran about 15 containers, and wrote an [original homelab post](/blog/how-to-get-started-building-a-homelab-server-in-2024/) telling everyone that was all a homelab needed.

Today I have two Dell R730s in a rack in my attic, 73 containers, two NVIDIA GPUs, and 10G networking. The rack averages about 430W, or about $47 a month in electricity, and I've spent about $7,400 on hardware.

None of it was planned. I'd get curious about something or annoyed by something, buy hardware for the rack to deal with it, and the electricity bill would go up again. It pays for itself more slowly than I first claimed, and I barely use some of what I bought.

_Updated October 2026: I first published this in March. Since then I've retired Open WebUI, Nextcloud, and Readarr and moved every container into OpenTofu. I also pulled 30 days of data out of Prometheus for this update, which turned up a few things I got wrong in March. The numbers below are current._

## Where the $200 ThinkServer ran out

The original setup was great. It was a Xeon E3-1226 v3 with 4 cores, 32GB of RAM, and 2TB of storage, running [Proxmox](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) with LXC containers for [Plex](https://www.plex.tv/), the \*arr stack, Pi-Hole, and download clients, and for six months it handled everything without complaint.

Then I got ambitious, starting with Plex transcoding. With two people streaming at once, the quad-core Xeon started choking. Next I saw [Frigate](https://frigate.video/) - real-time AI object detection on security camera feeds. On CPU, Frigate's detector alone ate about 120% CPU, more than one of my four cores. A [Coral USB accelerator](https://developers.google.com/coral) fixed that part: about 10 ms per inference and 4.5% CPU. But a Coral only runs Frigate's detector. It doesn't transcode Plex or run a local LLM, and the ThinkServer had no PCIe slot that could take a real GPU.

There was also [Home Assistant](https://www.home-assistant.io/). I'd been running it for years on its own hardware, separate from the homelab, which is why I left it out of the original post. I wanted to move it into a Proxmox VM, but the ThinkServer had no network segmentation at all: no VLANs, no firewall rules, everything on one flat network. I didn't want home automation sharing that network with public-facing services.

## Buying a used Dell R730

I moved from consumer to enterprise hardware because I needed a GPU in my server, which meant real PCIe slots, proper power delivery, and a chassis that could get the heat out of a workstation graphics card without melting.

The R730 I landed on has two Xeon E5-2698 v4 processors with 20 cores each, so 40 cores and 80 threads in one box. That's way more CPU than I need. Both hosts average about 13% busy.

They also use a lot more electricity. I never metered the ThinkServer, but it probably idled around 80W, about $9 a month. The rack now averages about 430W, roughly four to seven idle desktops running around the clock in my attic. The full numbers are in the [power section below](#power-about-430w-and-47-a-month).

### Why the R730: ECC, iDRAC, dual PSUs, and PCIe slots

I spent weeks reading r/homelab threads, watching ServeTheHome reviews, and comparing spec sheets, and I kept coming back to the [Dell PowerEdge R730](https://www.dell.com/support/manuals/en-us/poweredge-r730/r730_ompublication/technical-specifications?guid=guid-c32a42e1-fbc4-4dfe-983d-df4d34ff1e17&lang=en-us).

**ECC RAM.** ECC corrects single-bit memory errors and flags the ones it can't fix, so a flaky stick shows up in a log instead of as a corrupted file or a container that crashes for no reason. That matters on a box that runs for months without a reboot. In 63 days of uptime the kernel hasn't logged a single corrected memory error on either host.

**iDRAC.** This is the feature that ruins you for everything else. It's a management controller built into the board, independent of the OS - an IP KVM that came free with the server. I can watch the BIOS POST screen from bed, mount a virtual ISO to reinstall the OS, or power-cycle a hung box without walking up to the attic. The virtual console and virtual media need the iDRAC Enterprise license, so check for it before you buy a used one.

From outside the house I reach it over Tailscale, through a subnet router that runs as a container on prxbox1, so if prxbox1 is the box that's down, I can't reach either iDRAC remotely. The iDRAC ports are also on my main LAN. A stricter setup would give them their own management VLAN.

**Dual PSU.** If one power supply dies, the server keeps running and the fix is an Amazon order.

**PCIe expansion.** There are enough slots for GPUs, 10G network cards, and whatever I decide I need six months from now.

### Where to buy used enterprise servers

Used enterprise hardware is cheap because it depreciates like a luxury car. Companies lease thousands of R730s, run them for 3-5 years, and then dump them when the lease ends and newer hardware arrives. A barebones R730 chassis can show up on eBay for $300-500, but if you want one configured with specific CPUs, RAM, and drives, ready to rack and run, expect to pay more. I bought mine fully configured from Server Design Lab for about $1,850 each. That's a fraction of the $15,000+ sticker price new, and a lot more than the "$300 eBay special" you see in Reddit posts.

The best places I've found are eBay (sort by newly listed, because the good deals go fast), r/homelabsales on Reddit, specialty refurbishers like Server Design Lab, and local IT surplus liquidators. If you're near any city with tech companies, there's probably a warehouse within driving distance selling rack servers by the pallet.

### Desktop GPUs don't fit in a 2U server

After years of building desktop PCs where any GPU fits in any case, it didn't occur to me that a 2U rack server is a different universe. With Dell's GPU kit, the R730 can take full-length, double-wide cards. Most gaming GPUs still fail somewhere: they're taller than a standard PCIe bracket, their power connectors stick up past the lid of a chassis that fits in 3.5 inches of rack space, and their open-air coolers dump heat sideways into a box built for front-to-back airflow. Anything that pulls more than the slot's 75W also needs Dell's GPU power cable off the riser. A full-size RTX 4090 is three-plus slots thick and doesn't fit at all.

Single-slot workstation cards with blower coolers skip the size, connector-height, and airflow problems, which is why both of mine are NVIDIA's pro cards. Both still draw more than 75W, so both still need the riser power cable. I spent a weekend figuring all of this out before buying anything.

### DDR4 ECC prices went up about 5x

This one caught me off guard. Enterprise DDR4 ECC RAM costs several times what it did when I started this project.

The AI boom did this. Every company building GPU clusters and inference servers needs massive amounts of memory, and that demand is competing directly with the secondhand market that homelabbers depend on. Used DDR4 ECC sticks I could find for $40-80 a couple years ago now run $200-400 for 32GB RDIMMs - about 5x. It's bad enough that it has [its own Wikipedia article](https://en.wikipedia.org/wiki/2025%E2%80%93present_global_memory_supply_shortage). The supply of used enterprise RAM dried up because the same companies that used to surplus it are now keeping their older servers running longer because they need the compute for AI.

Each host has 128GB, and it came with the configured servers, so I never bought sticks on their own, and I'm glad. Filling those 256GB today would cost $1,600-3,200 - close to what I paid for one whole configured server.

![Y'all Got Any More Of That meme: Dave Chappelle as a homelabber asking every AI company 'Y'all got any more of that DDR4 ECC?'](/images/blog/homelab-two-years-later/meme-yall-got-any-more-ddr4.webp)

There's no good way around this. You can watch r/homelabsales for deals and buy in bulk when you find good prices. Moving to a newer DDR5 platform doesn't save you either - the shortage hits DDR5 at least as hard. For DDR4 ECC, buy what you'll use in the next year up front, because DDR4 production is winding down and prices are only going up. Don't overbuy, though. Right now prxbox1 uses about 45GB of its 128GB and prxbox2 about 27GB.

![Front view of both Dell R730 servers in the rack with drive bays and status LEDs visible](/images/blog/homelab-two-years-later/rack-front-servers.webp)

## A second server, a rack, and 10G networking

### A second R730 so Frigate and Plex stop fighting over one GPU

The second server was about GPU time-sharing. I wanted local LLMs, Frigate's object detection, speech-to-text for Home Assistant voice, Plex transcoding, and Tdarr video encoding all running at once. A model that needs about 15GB of VRAM and an 8GB card don't fit together, and I didn't want Plex stuttering every time Frigate spotted a squirrel.

Two GPUs on two hosts split the work:

- **prxbox1** got a [Quadro RTX 4000](https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-4000-datasheet.pdf) (8GB VRAM) for the always-on stuff: Frigate's detector and its semantic-search and face models across 4 cameras, the camera video decodes, Whisper speech-to-text for Home Assistant voice (about 2GB on its own), and a Tdarr worker. It sits around 4GB used, and peaked at 4.7GB in the last 30 days.
- **prxbox2** got an [RTX A4000](https://www.nvidia.com/en-us/design-visualization/rtx-a4000/) (16GB VRAM) for the bursty stuff: Plex transcoding, [Immich](https://immich.app/) video transcoding, [Tdarr](https://github.com/HaveAGitGat/Tdarr) encoding, and local LLMs with [Ollama](https://ollama.com/) and [llama.cpp](https://github.com/ggml-org/llama.cpp).

The 16GB card is the reason the big model runs at all. My largest one is a 30B coding model quantized down to a 13.8GB file, and it peaked at about 15GB of VRAM. Most of the day the card is close to empty, because models unload when nobody's using them.

Immich's face recognition and search models run on CPU on purpose, so they never fight an LLM for VRAM.

### A rack is just a desktop split into separate boxes

I didn't know 19 inches was a standard rack width. I was measuring my R730s with a tape measure trying to figure out what kind of enclosure would hold them. The width goes back to the 1920s (telephone industry, originally), and today mounting holes, unit height, and rail depth all follow the same spec.

What made it click for me was thinking of **a server rack as a desktop computer where every component lives in its own chassis.** Your desktop has a CPU, GPU, RAM, storage, network card, and power supply all crammed into one box. A rack separates all of that:

- **Compute** = the Dell R730 servers (CPU + RAM + GPU)
- **Storage** = [Synology DS418play](https://www.synology.com/en-global/support/download/DS418play) on a shelf, 48TB with 34TB used
- **Networking** = [MikroTik CRS317](https://mikrotik.com/product/crs317_1g_16s_rm) for 10G between the servers + [UniFi US-24](https://store.ui.com/us/en/products/usw-24) for 1G devices
- **Power** = PDU (power distribution) + two UPS units (battery backup so a power blip doesn't kill everything)
- **Management** = iDRAC ports on each server

Same parts, separate boxes, and I can swap any one of them without touching the rest.

![Full 25U server rack in the attic showing both Dell R730 servers, MikroTik and UniFi networking, Synology NAS, and dual UPS units](/images/blog/homelab-two-years-later/rack-full-front.webp)

The rack layout:

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

In practice, the busiest minute either host has had was about 1.2Gbps, around 12% of one 10G link, and that's because of how I built the network. The NAS has two 1G ports and hangs off the UniFi switch, and the UniFi switch connects to the MikroTik at 1G. So the NAS, the internet, and every client in the house share one 1G uplink. The only thing that uses the 10G links is server-to-server traffic: prxbox1's backups landing on the Proxmox Backup Server container on prxbox2, apps on one host calling the LLMs on the other, and Prometheus scrapes.

The 10G links were the part I needed least. If you're planning a build like this, get the NAS onto 10G first, or skip 10G entirely.

I still enjoyed setting it up. I wrote a [Python script to manage the MikroTik bonding configuration programmatically](/blog/implementing-mikrotik-binary-api-protocol-in-python/) because clicking through web UIs to configure a switch felt wrong. That turned into its own blog post about implementing MikroTik's proprietary binary protocol from scratch.

## Rebuilding my home network to learn VLANs

I wanted to understand networking properly (VLANs, firewall rules, routing, subnets, all of it), so I tore down my entire home network and rebuilt it from scratch.

### UniFi gateway, MikroTik backbone, three access points

The router is a [UniFi Cloud Gateway Ultra](https://store.ui.com/us/en/products/ucg-ultra), which is also the firewall, DHCP server, and WiFi controller. It does all the routing between VLANs and runs Suricata intrusion prevention inline. The MikroTik is just a 10G switch. There are three UniFi access points with 802.11r fast roaming: two [U7 Pros](https://ui.com/us/wifi/u7-pro), one upstairs and one on the main floor, plus a U7 Pro XG I added in the basement later. Devices hand off between APs as I walk through the house without dropping connections, and guests never notice.

### Four VLANs keep the IoT junk away from my NAS

IoT devices are made by companies you've never heard of, run firmware that rarely gets security patches, and phone home to servers in countries you can't identify on a map. I don't want any of them to have network access to my NAS full of family photos and financial documents.

VLANs create separate virtual networks that can't talk to each other unless I write a firewall rule allowing it. Here's what each one can actually reach:

| Network                   | Can reach                                          | Blocked from      |
| ------------------------- | -------------------------------------------------- | ----------------- |
| Default LAN (192.168.0.x) | Everything                                         | -                 |
| Guest (192.168.20.x)      | Internet, DNS, the speakers (for AirPlay and Cast) | Main LAN, cameras |
| IoT (192.168.30.x)        | Home Assistant, DNS, my music server, the internet | Main LAN, guests  |
| Cameras (192.168.40.x)    | Frigate, Home Assistant, DNS                       | Main LAN, IoT     |

A compromised smart plug on the IoT VLAN can't reach my NAS, and a guest can't scan my local network. The IoT VLAN still has internet access, because plenty of these devices stop working without their cloud.

It's not airtight. Casting across VLANs needs mDNS, and right now the gateway reflects all mDNS traffic between networks instead of just AirPlay and Cast. And only 11 devices are on the IoT VLAN right now. A lot of my older smart stuff still lives on the main LAN, fenced in by a MikroTik firewall list I set up before the VLANs existed. I haven't moved them yet.

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

There are 73 LXC containers plus the Home Assistant VM, 45 on prxbox1 and 28 on prxbox2. This isn't exhaustive (see my [uses page](/uses)), but here's what runs:

**Media:** Plex - the busiest it got in the last 30 days was 5 streams and 3 transcodes at once. Immich, self-hosted Google Photos, holds 55,581 photos and 12,296 videos, and the only thing I miss from Google is photo editing. Plus the \*arr stack ([Sonarr](https://sonarr.tv/), [Radarr](https://radarr.video/), [Prowlarr](https://prowlarr.com/), [Lidarr](https://lidarr.audio/), and a few more), [LazyLibrarian](https://lazylibrarian.gitlab.io/) for books since Readarr was retired, Tdarr for automated video health checking and transcoding, a [GPU-accelerated subtitle generator](/blog/building-a-gpu-accelerated-subtitle-generator/) I built with Whisper AI, and [Audiobookshelf](https://audiobookshelf.org/).

**Security:** Frigate NVR, [Vaultwarden](https://github.com/dani-garcia/vaultwarden) (self-hosted Bitwarden), [Authentik](https://goauthentik.io/) (SSO for every service), [CrowdSec](https://www.crowdsec.net/) (community threat intelligence)

**Home automation:** Home Assistant as a full VM (not a container - it needs the supervisor for add-ons and updates), [Zigbee2MQTT](https://www.zigbee2mqtt.io/) for local Zigbee control without any cloud dependency

**AI/ML:** Ollama runs the everyday models (Qwen3 8B and 14B), and llama.cpp's `llama-server` runs the big 30B coding model. A LiteLLM gateway in front gives every app one endpoint with aliases like `local-fast` and `local-smart`, plus a cloud route to Claude for the jobs a local model can't handle. I used to run Open WebUI on top for a ChatGPT-style interface, then retired it in June - llama-server's built-in web UI does what I need with one less service to keep alive.

**Monitoring:** [Prometheus](https://prometheus.io/), [Grafana](https://grafana.com/), [Loki](https://grafana.com/oss/loki/), [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/), [Uptime Kuma](https://github.com/louislam/uptime-kuma), Healthchecks, plus a pile of custom health check scripts (more on those below)

**Productivity:** [Paperless-NGX](https://docs.paperless-ngx.com/) scans and OCRs my documents, and Paperless-AI tags them with the local Qwen3 8B model. 308 documents in, it has invented 1,172 tags. [Syncthing](https://syncthing.net/) handles file sync. I ran Nextcloud for a while and replaced it in September, because Syncthing does the one job I was actually using Nextcloud for.

## Home Assistant moved off its own box and into a Proxmox VM

Home Assistant lived on its own hardware for years because of that flat network. VLANs fixed the isolation problem, so it moved into a VM on prxbox1. Now Home Assistant is on the same network as the servers and can talk to Proxmox, Prometheus, and Alertmanager directly. A few of the 134 automations that depend on that:

- **AI-translated alerts.** Alertmanager sends a webhook to Home Assistant, a local LLM rewrites the alert in plain English, and my phone gets a notification with "Open Grafana" and "Silence for 1 hour" buttons.
- **Backup failure recovery.** If the Home Assistant backup fails to upload, it reloads the NAS mount, re-runs the backup, and checks the result five minutes later.
- **UPS monitor.** When either UPS switches to battery, I get a live battery-level notification with a link to the Grafana UPS dashboard.

The downside is that it's not independent anymore. The VM, the Zigbee coordinator (a ConBee II USB stick passed into the Zigbee2MQTT container), and the Bluetooth adapter all live on prxbox1. There's no failover, so if prxbox1 reboots, the house loses its automations until the VM comes back. The wall switches still work, because I build every automation to fail that way.

I wrote more about why Home Assistant matters so much to me in my post about [replacing Alexa with a private, local-first setup](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/).

## Monitoring, after three silent failures

My homelab started feeling like production infrastructure I was responsible for the third time I found a service had been dead for over a week without anything telling me.

### Prometheus, Grafana, Loki, and Alertmanager

**Prometheus** scrapes metrics from every host and container every 15 seconds: CPU, memory, disk, network throughput, GPU utilization, VRAM usage, inlet temperature, exhaust temperature, iDRAC power readings, and the rack's power draw from Home Assistant. It keeps 30 days, which is where almost every number in this post came from.

**Grafana** turns that into dashboards. The main overview shows both servers at a glance - power draw, CPU load, memory pressure, GPU status, disk I/O. I pull it up most mornings over coffee.

**Loki** aggregates logs from every container. When something breaks, I search from one Grafana panel instead of SSH-ing into individual containers and tailing log files like it's 2003.

**Alertmanager** is the one place alerts go. It emails me, and critical alerts also go through Home Assistant to my phone. I used to run ntfy for push notifications too, and shut it down in September because two alert paths were more than I wanted to maintain.

### 185 health checks, each testing one thing

When I first wrote this post I had 41 health check scripts. Now it's 153 shell checks on the Proxmox side plus 32 Python checks for Home Assistant.

That sounds insane, but each one is dead simple: check one thing, exit 0 if healthy, exit 1 with a message if not. They cover backup verification, SSL certificate expiry, disk space thresholds, DNS resolution, container restarts, and whether subtitles are actually getting generated. Most of them are a few lines that call a shared library - the Radarr check is one function call against Radarr's own `/health` API. A wrapper runs them all at 6 AM, pings Healthchecks so I know the wrapper itself ran, and sends anything critical to Alertmanager.

The count keeps growing because every time something breaks in a way I didn't catch, the fix includes a new check. While pulling numbers for this update, I found the smart plug's rack power sensor had reported a flat 541W from September 1 to September 23, and none of the checks caught it.

### Backups: PBS locally, Backblaze B2 offsite

[Proxmox Backup Server](https://www.proxmox.com/en/products/proxmox-backup-server/overview) runs as a container on prxbox2, with its datastore on the NAS. It does incremental backups with deduplication, and since nearly every container is the same Debian base, most chunks are shared. Right now 10.9TB of logical backups take up 1.31TB on disk - about 8.3x.

PBS is in the same attic as everything it backs up, though, so a fire up there would take both. So every day a small container syncs the whole PBS datastore to Backblaze B2, about $9 a month for 1.3TB. Once a week a separate job downloads a random 1/256 of the chunks and compares them against the local copy, and it's reported zero differences every week so far. The NAS also runs its own B2 backup with 60-day retention, so I pay Backblaze twice.

## Every container is defined in OpenTofu

The biggest change since March is that every container is now defined in [OpenTofu](https://opentofu.org/) with the [`bpg/proxmox`](https://registry.terraform.io/providers/bpg/proxmox/latest/docs) provider. Each container's directory calls one shared module. Here's a trimmed real one, for the Healthchecks container:

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

Everything installed inside the container lives in that provision script, so changing a line in it re-provisions the container. I don't SSH into a running container to fix things anymore. Every six hours a drift check runs `tofu plan -detailed-exitcode` in every service directory and flags anything changed outside the code. It's slower, since a one-line fix now means editing the script and re-running provisioning instead of thirty seconds over SSH. I wrote up the whole migration in [I Finally Stopped Managing My Homelab by Hand](/blog/opentofu-proxmox-immutable-homelab/).

The drift check only sees what OpenTofu manages, which is the containers. The Proxmox hosts themselves are still configured by hand, which is how a CPU setting on prxbox2 drifted without anything noticing (more on that in the power section).

## Power: about 430W and $47 a month

Per-server numbers come from each R730's iDRAC, and the rack total comes from a Home Assistant smart plug that the whole rack runs through. I'm using the plug's last 7 days only, because of the frozen-sensor mess above.

| Metric            | Value             |
| ----------------- | ----------------- |
| prxbox1           | ~215W             |
| prxbox2           | ~191W             |
| Whole rack (plug) | ~430W             |
| Monthly cost      | ~$47 at $0.15/kWh |
| Annual projection | ~$565             |

The plug reads about 25W more than the two servers, which covers the switches, NAS, gateway, and UPS overhead.

### What I tried to cut the power bill

**Killed the third server.** I had prxbox3, the original ThinkServer from my first blog post, still running 9 containers. I migrated all of them to the two R730s, which had plenty of room, and powered it off. I never metered it, so I can't tell you what that saved. It's fully out of the Proxmox cluster now, and a Raspberry Pi running a quorum device gives the two-node cluster its tiebreaker vote instead.

**CPU governor tuning.** Both hosts are supposed to run the `powersave` frequency governor instead of `performance`. At 13% average CPU there's nothing for `performance` mode to speed up. When I checked for this update, prxbox1 was all `powersave`, but 31 of prxbox2's 80 threads had drifted back to `performance`. The governor is host-level config, and the hosts aren't in OpenTofu, so the drift check couldn't catch it. I also haven't measured what `powersave` actually saves, and at 13% CPU I'd guess not much.

![Anakin Padme 4 Panel meme: 'I put everything in OpenTofu' / 'So nothing can drift, right?' / Anakin's silent stare / '...nothing can drift, right?'](/images/blog/homelab-two-years-later/meme-anakin-padme-drift.webp)

### Built for data center power prices, not my attic

The R730 is cheap to buy: about $1,850 configured, against a five-figure price new, with ECC RAM, redundant power supplies, iDRAC, and expansion slots that consumer hardware doesn't have.

But these machines were designed for data centers with commercial power contracts and industrial cooling. In my attic, on a residential plan, they're free heat in a Minnesota January and a problem in July.

![Change My Mind meme: 'Enterprise servers are cheap to buy and expensive to run'](/images/blog/homelab-two-years-later/change-my-mind-enterprise.webp)

Yes, a couple of modern mini PCs would run most of these 73 containers at a fraction of the power. My CPUs average 13% busy, I use 72GB of 256GB of RAM, and Frigate runs fine on a Coral, which plugs into anything. A mini PC can't hold a 16GB workstation GPU for local LLMs and transcoding, though, or give me iDRAC and ECC. If you don't want local AI or GPU video work, buy mini PCs and skip the rack.

## 2023 vs. 2026

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
~80W power draw (estimated)     ~430W average (metered)
$200 hardware cost              ~$7,400 total hardware
~$105/yr power                  ~$565/yr power
```

![That Escalated Quickly meme: Ron Burgundy saying 'that escalated quickly'](/images/blog/homelab-two-years-later/escalated-quickly.webp)

## What it cost, and whether it pays for itself

### $7,400 in hardware

People always ask what this cost:

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
| **Total hardware**                       | **~$7,400** |
| Electricity (~$47/month x 24 months)     | ~$1,130     |
| **Total cost of ownership (2 years)**    | **~$8,500** |

The table leaves out the NAS and its drives, which I've owned for years and haven't added to since the servers arrived, plus the basement AP I added later, the cameras, and small stuff like the Coral and the Zigbee stick.

### Break-even is 4.6 years, if you squint

I used to pay a monthly subscription for every one of these:

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

I left streaming out of this table on purpose, video and music both. I still pay for Apple Music, and "I cancelled Netflix" is a different argument that I don't want to hang a break-even number on.

Two of these rows are generous. Tailscale isn't a privacy VPN like NordVPN - I just stopped needing one once I could reach my own network from anywhere. And a local 8B or 14B model isn't GPT-level. It handles tagging, summaries, and alert rewriting, and anything harder goes to Claude through the same gateway.

Subtract about $47/month of electricity and $9/month for the Backblaze B2 copy of my Proxmox backups, and I'm netting about **$131/month**. That leaves out the NAS's own B2 backup and the Claude usage I mentioned, so treat it as a best case.

**Break-even: ~4.6 years** ($7,200 in hardware, leaving out the ThinkServer I already owned, divided by $131/month).

That number depends a lot on one line: the $80 security monitoring plan is over 40% of the gross savings, and without it break-even stretches to more than 11 years. None of this counts my time, either.

It may pay for itself eventually. Subscription prices keep going up - [1Password went from $2.99 to $3.99](https://www.macrumors.com/2026/02/24/1password-march-price-increase/) in March, and [Ring Protect from $10 to $12](https://ring.com/support/articles/7zvp5/Ring-Protect-Plus-1st-Gen-Information) in February - and I own my data and the hardware it runs on.

It's a hobby, and hobbies cost money. Nobody asks a golfer to justify their club membership with a break-even analysis.

### The real return was my day job

I'm not going to get a job titled "homelab engineer," but running every layer of this myself - the network, the hosts, the deploys, the monitoring, the power bill - shows up at work constantly.

I can actually deploy the things I write about instead of stopping at `localhost`. When I need a demo app, I stand up the whole thing myself: the database, the backend, the hosting, and the monitoring that tells me when it falls over. I can also talk to network people, platform teams, data engineers, and app developers on their own terms, because I've broken each of their layers in my attic.

## What I'd do differently

If I were starting over tomorrow with everything I know now:

- **Infrastructure as code from day one, hosts included.** I put off OpenTofu for over a year because hand-configuring one more container always felt faster, even though it wasn't. When I finally did it, I stopped at the containers, which is how the CPU governor drifted.
- **VLANs from day one.** Retrofitting network segmentation onto a running homelab means updating every single service that hardcodes an IP address. It's a miserable weekend project that should've been a 10-minute setup decision.
- **Buy for the bottleneck.** I put 10G between two servers and left the NAS on 1G. Figure out what actually moves data before you buy the fast links.
- **Monitoring before the first failure.** You don't need 185 checks on day one, but uptime checks and basic backup verification should be there from the start.
- **An offsite copy before you need it.** Local backups cover your own mistakes, but mine are in the same attic as everything else.
- **GPU form factor research.** A card that fits any desktop case can still fail in a 2U server on height, power connectors, or airflow.
- **Budget for RAM upfront, but buy what you'll use.** The AI boom crushed the DDR4 ECC market, and I'm using about a quarter of what I bought.

## What's next

- Lower-power hardware for the services that don't need 40 cores (maybe a small NUC or mini PC for lightweight containers)
- A check for sensors that stop changing, and the Proxmox hosts themselves under code so the governor can't drift again
- A second way into the iDRACs that doesn't depend on prxbox1 being up
- Fixing things remotely - I've since started [driving the homelab from my phone with Claude Code](/blog/my-development-setup-2026/)

If you read my [original homelab post](/blog/how-to-get-started-building-a-homelab-server-in-2024/) and you're wondering what comes next, this is one version of it.
