---
title: 'How to get started building a Homelab server in 2027'
seoTitle: 'How to Build a Homelab Server in 2027'
date: 2023-09-27
updatedDate: 2026-11-09
updateNote: 'Refreshed for 2027 with higher hardware prices from the RAM shortage, Proxmox VE 9.2, current Unraid and Plex pricing, TrueNAS Community Edition, LazyLibrarian in place of the retired Readarr, and power costs at $0.15/kWh.'
slug: 'how-to-get-started-building-a-homelab-server'
description: "I built my first Homelab server for under $200 with a used Lenovo ThinkServer and Proxmox. Here's how I picked hardware, ran containers and mounted NAS."
categories: ['Homelab']
heroImage: '/images/blog/how-to-get-started-building-a-homelab-server/thumb-52866fdd.webp'
heroAlt: 'Is this a server? meme: me looking at any used PC on Facebook Marketplace'
tldr: 'Buy a used office PC or a mini PC with at least 16GB of RAM, install Proxmox VE 9.2 (free), and start with four services: Pi-hole, Jellyfin, a Homepage dashboard and Uptime Kuma. Keep your files on a NAS and mount it into the containers. My first server was a $150 used Lenovo ThinkServer, though RAM prices make that hard to match now.'
faq:
  - question: 'How much does a homelab cost to run?'
    answer: 'Hardware is a one-time cost, and it went up in 2026 because of the RAM shortage. Electricity is the ongoing cost. At $0.15/kWh, a mini PC idles at 10-25W and costs about $1-3 a month, a used office tower costs about $4-9 a month, and a full rack server costs $11-22 or more a month.'
  - question: 'Can I run a homelab in an apartment?'
    answer: 'Yes. A mini PC (Beelink, ASUS NUC, Minisforum) is completely silent, smaller than a book, and uses less power than an old incandescent bulb. You can run Pi-hole, Jellyfin, Home Assistant, and a dozen other services on one.'
  - question: 'Is a homelab worth it in 2027?'
    answer: 'If you want to learn Linux, Docker, and networking - yes. If you want to self-host your own services instead of paying for cloud subscriptions - yes. Hardware costs more than it did a couple of years ago, so start with a used office PC or a machine you already own.'
  - question: 'What if I break something?'
    answer: "You will break something. That's the whole point. Proxmox snapshots make it easy to roll back, and the worst case scenario is you reinstall a container (which takes about 2 minutes). Nothing you do on a homelab is going to damage your hardware permanently."
  - question: 'Do I need to know Linux?'
    answer: "Not to start. Proxmox and Unraid both have web UIs that handle most things. But you'll naturally pick up Linux commands as you go, and that's one of the most valuable skills a homelab gives you."
---

Look, if you've been lurking on r/homelab or watching YouTube videos of people with full server racks in their basements, I get it. It looks intimidating and expensive, like you need an IT degree and a dedicated room in your house just to get started.

You don't. I built my first homelab server for under $200 with a used PC from Facebook Marketplace, and it ran everything I threw at it. This is the guide I wish I'd had when I started.

## Why did I start building a Homelab?

It started with my Synology NAS choking. I kept adding Docker containers to it - a media server here, a download manager there - and eventually the little NAS was gasping for air. The CPU was pegged at 100% and the 2GB of RAM was a joke. Every time I wanted to try a new service, something else would crash.

I realized I had two options: buy an expensive new NAS with better specs, or get a proper server and let the NAS do what it's good at - storing files. The server won.

![A paper-collage animation on a chalk field: my Synology NAS lands and shipping containers stack up on its roof until it tilts, an old pressure gauge beside it shakes, then my ThinkServer drops in, toned pink, the containers hop over onto it one by one, the NAS straightens, the gauge goes still, and the words The server won set in above it](/images/blog/how-to-get-started-building-a-homelab-server/nas-gasping-for-air.svg)

## What I actually wanted out of this thing

Before I started browsing hardware, I wrote down what mattered to me:

- **Cheap.** Under $200. I didn't know if I'd stick with this hobby, so I wasn't about to drop serious money on it.
- **Run all my containers.** I had about 15 services I wanted to run, and the server needed to handle them without breaking a sweat.
- **Upgradeable.** I wanted to be able to add RAM or swap drives later without buying a whole new machine.
- **Docker and container friendly.** This was non-negotiable.
- **Low power draw.** I didn't want my electricity bill to double.
- **RAID support.** Some level of redundancy for my data.

## Start small. Seriously.

Here's the best advice I can give you: **don't overthink your first homelab.** You don't need a rack-mounted Dell R730 (I eventually got two of those, but that came later). You don't need 10G networking. You don't need ECC RAM.

You need a used PC with a decent CPU and enough RAM to run some containers. That's it.

## Hardware costs more now

Prices went up a lot since I first wrote this. AI companies are buying up memory, and that shortage reaches anything with RAM in it. Raspberry Pi raised prices three times in 2026. Minisforum raised prices on mini PCs that ship with RAM and an SSD. Used DDR4 ECC, the RAM in old servers, costs about five times what it did when I started, which I wrote about in [my homelab two years later post](/blog/homelab-two-years-later/).

My advice hasn't changed, but following it costs more. Buy used, buy barebones if you already have RAM or an SSD to reuse, and check prices the day you buy, because they moved every few months in 2026. My $150 ThinkServer with 32GB of RAM, further down, isn't a deal you'll find today.

![Is this a server? - me looking at any used PC on Facebook Marketplace](/images/blog/how-to-get-started-building-a-homelab-server/is-this-a-server.webp)

## Picking hardware for a homelab on a budget

Not everyone needs the same thing, and your living situation matters more than you'd think. A rack server in an apartment is going to make your partner hate you (ask me how I know). Here's how I'd think about hardware tiers for beginners:

### Tier 1: An old laptop or a Raspberry Pi

**Start with what you already own.** If you've got an old laptop collecting dust, install Ubuntu Server or Debian on it, throw Docker on top, and start playing. A Raspberry Pi 5 works too, but it's not the cheap option it used to be: the 8GB model went from $80 to about $125 in 2026, so check the current price. You won't run 20 containers on these, but you can run Pi-hole, a small media server, and a few other things. The point is to learn Linux, Docker, and networking basics without spending real money.

**Best for:** People who aren't sure they'll stick with it, apartment dwellers with zero space, students.

### Tier 2: Mini PCs

**Beelink, ASUS NUC, or Minisforum mini PCs.** This is the quiet homelab sweet spot. These things idle at 10-25W (your electricity bill won't even notice), they're dead silent, and they fit on a bookshelf. A used Intel NUC or a Beelink Mini S with 16GB RAM and a small SSD will run 10-15 containers comfortably. Intel left the NUC business in 2023, and ASUS makes the new ones now.

Mini PCs that ship with RAM and an SSD got more expensive in 2026. A barebones unit plus RAM you already own can come out cheaper.

**Best for:** Apartments, shared living spaces, anyone who values quiet over raw power.

### Tier 3: Used office PCs

**Dell OptiPlex, HP EliteDesk, Lenovo ThinkCentre.** This is what I'd recommend for most people starting out. Businesses cycle these out every 3-5 years by the thousands, and they end up on eBay and Facebook Marketplace cheap. Look for one with the RAM already in it, because adding 16-32GB of DDR4 yourself costs a lot more than it used to. An OptiPlex 7040 or ThinkCentre M920 with an i5, 16-32GB RAM, and an SSD will handle pretty much anything a beginner throws at it.

**Best for:** Anyone who wants the best balance of price, performance, and upgradeability. My recommendation for most beginners.

### Tier 4: Used enterprise servers

**Dell PowerEdge, HP Proliant, Lenovo ThinkServer.** This is what I started with, and it's overkill for most beginners. The servers are still cheap, but the ECC RAM to fill them costs about five times what it did. These have Xeon CPUs, tons of RAM slots, and hardware RAID controllers. But they're also loud (small high-RPM fans), power-hungry (100-200W idle for older models), and heavy. Don't start here unless you have a basement, garage, or attic to put it in.

**Best for:** People with dedicated space who know they want to go deep into virtualization and containers.

### A note about noise and power

Rack servers sound like a jet engine when they boot up. Tower servers and mini PCs are fine, but anything designed for a data center rack is going to be loud.

Power is the other thing. Here's what different setups actually cost to run 24/7 (at $0.15/kWh, the rate I use in my other homelab posts):

| Hardware                                | Idle Wattage | Monthly Cost | Annual Cost |
| --------------------------------------- | ------------ | ------------ | ----------- |
| Raspberry Pi 5                          | 3-5W         | ~$0.50       | ~$5         |
| Mini PC (NUC/Beelink)                   | 10-25W       | $1-3         | $13-33      |
| Used office PC (OptiPlex/ThinkCentre)   | 40-80W       | $4-9         | $53-105     |
| My ThinkServer (Xeon E3)                | ~80W         | ~$9          | ~$105       |
| Enterprise rack server (R730, etc.)     | 100-200W     | $11-22+      | $130-260+   |
| My current rack (two R730s and network) | ~430W        | ~$47         | ~$565       |

My ThinkServer probably idled around 80W, about $9 a month. That's not bad. My current rack with two Dell R730s averages about 430W on the smart plug, or about $47 a month. Rule of thumb: multiply your idle wattage by 0.11 to get your rough monthly cost at $0.15/kWh.

![A paper-collage animation on a yellow field: my old ThinkServer lands on the left with a short stack of coins and a $9 tag, then my server rack lands on the right and a pink stack of coins beside it grows taller and taller until a $47 tag swings on, and the words $9 to $47 a month set in above it](/images/blog/how-to-get-started-building-a-homelab-server/nine-to-forty-seven.svg)

### Where to buy used hardware

- **Facebook Marketplace** - Local businesses dump old office PCs here constantly. I've seen perfectly good machines for $50-150.
- **eBay** - Great for specific models. Search for "Dell OptiPlex" or "Lenovo ThinkCentre" and sort by price.
- **Craigslist** - Hit or miss, but you can find deals.
- **[r/homelabsales](https://www.reddit.com/r/homelabsales/)** - The subreddit where homelab people sell their old gear when they upgrade.
- **Local e-waste recyclers** - Some will sell you old business PCs for next to nothing.

What to look for in any used hardware:

- **CPU**: Any Intel i5/i7 from the last 8-10 years, or a Xeon E3/E5. These are more than enough for a starter homelab.
- **RAM**: 16GB minimum, 32GB is the sweet spot. RAM is usually the first bottleneck.
- **Storage**: Doesn't matter as much if you have a NAS. A single SSD for the OS works fine.

## Buying my first server

I found a used Lenovo ThinkServer on Facebook Marketplace that some local business was getting rid of. $150.

![Drake meme - rejecting buying a brand new server for $800, approving finding a used ThinkServer on Facebook Marketplace for $150](/images/blog/how-to-get-started-building-a-homelab-server/drake-used-server.webp)

The specs:

- **CPU**: Intel Xeon E3-1226 v3 @ 3.30GHz (4 cores)
- **Storage**: 2TB HDD
- **RAM**: 32GB

For $150, this was a steal. The Xeon CPU handles virtualization like a champ, 32GB of RAM is plenty for running 15-20 containers, and the 2TB drive gave me room for local storage while my NAS handled the bulk media files.

The thing about buying used enterprise hardware is that it was built to run 24/7 in a server closet. These machines are tanks. My ThinkServer had been running for years in some office before I got it, and it didn't skip a beat.

## Picking an operating system

I almost went with Ubuntu since it's what I knew. Throw Docker on top, maybe Portainer for a web UI, and call it a day. But I kept reading about [Proxmox](https://www.proxmox.com/en/) and decided to give it a shot.

I'm glad I did. Here's what sold me:

**Proxmox is built for exactly this.** It's a free, open-source virtualization platform that supports both full VMs (via KVM) and lightweight containers (via LXC). Ubuntu can do containerization, sure, but Proxmox was _designed_ for it.

**The web UI is great.** You get a full management interface out of the box. Create containers, manage storage, monitor resources, take snapshots - all from your browser. No SSHing into the machine for every little thing.

**Snapshots and backups are built in.** Before I make any changes to a container, I take a snapshot. If I break something (and I break things constantly), I roll back in 30 seconds. This alone makes Proxmox worth it for a homelab.

**ZFS support.** If you want RAID or data integrity checking, Proxmox has tight ZFS integration. I ended up not using ZFS on my first build (it needs extra RAM to manage), but it's there when you need it.

**It grows with you.** When I eventually added a second server, Proxmox clustering made it easy to manage both from one interface. Try doing that with bare Ubuntu and Docker.

Install the current release, Proxmox VE 9.2 (May 2026), built on Debian 13. Proxmox VE 8 reached end of life in August 2026, so skip any tutorial that installs 8.

### Other OS options worth knowing about

Proxmox is my pick, but it's not the only option:

- **[Unraid](https://unraid.net/)** - Paid, but has a polished UI and a built-in app store. Great if you want something that "just works" and don't mind paying for it. Particularly good for NAS + containers on the same box. As of November 2026 it's $49 (Starter, up to 6 storage devices), $109 (Unleashed) or $249 (Lifetime), and Starter and Unleashed include a year of updates.
- **[TrueNAS Community Edition](https://www.truenas.com/truenas-community-edition/)** - Free, Linux-based, strong on storage and ZFS. TrueNAS renamed SCALE to this in 2025. Better if your primary use case is NAS with some containers on the side.
- **[CasaOS](https://casaos.zimaspace.com/)** - I used to call this the simplest option, an app store for self-hosted services on top of Debian or Ubuntu. Its releases have stalled since late 2024 while its maker works on ZimaOS, so I wouldn't start a new setup on it.
- **Ubuntu/Debian + Docker** - The DIY option. No web UI out of the box (add [Portainer](https://www.portainer.io/) for that), but maximum flexibility and the most online tutorials.

If you're brand new and just want to run Docker containers, Unraid is the lowest friction option. If you want to learn virtualization and have more control, Proxmox is the way to go.

The [Proxmox forum](https://forum.proxmox.com/threads/proxmox-beginner-tutorial-how-to-set-up-your-first-virtual-machine-on-a-secondary-hard-disk.59559/) has a good beginner tutorial for getting your first VM set up.

## What to run first on your homelab

When you've got your server running, it's tempting to install everything. Resist the urge. Start with services that give you immediate, tangible value so you actually _use_ the thing instead of just admiring your container list.

**My recommended day-one stack:**

1. **[Pi-hole](https://pi-hole.net/)** - Network-wide ad blocking. Set this as your DNS server and every device on your network stops seeing ads. Your family will notice this one immediately.
2. **[Jellyfin](https://jellyfin.org/)** or **Plex** - A media server. Throw your movies and music on it and you've got your own private streaming service. Jellyfin is free everywhere. Plex is free at home but charges to stream outside it (more below).
3. **[Homepage](https://gethomepage.dev/)** or **[Homarr](https://homarr.dev/)** - A dashboard that shows all your services in one place. Makes your homelab feel real.
4. **[Uptime Kuma](https://uptime.kuma.pet/)** - Monitors whether your services are up. You'll be surprised how addictive this dashboard becomes.

That's a solid afternoon project. Once those are running and you're comfortable, branch out to the full list below.

## The containers I run

The [Community Scripts project](https://github.com/community-scripts/ProxmoxVE) (formerly the tteck Proxmox Helper Scripts) has one-liner install scripts for most popular homelab services. It makes setup almost embarrassingly easy.

![One does not simply stop at one container](/images/blog/how-to-get-started-building-a-homelab-server/one-does-not-simply-containers.webp)

### Media management

I use the [TRaSH Guides](https://trash-guides.info/) to configure all of my Arr apps and media downloaders. If you're setting up a media stack, start there.

- **[Plex](https://www.geekbitzone.com/posts/2022/proxmox/plex-lxc/install-plex-in-proxmox-lxc/#introducing-linux-containers-lxc)** - My original media server. Still works, but I've lost some confidence in where the project is headed. Streaming outside your home has needed Plex Pass or a Remote Watch Pass since April 2025. In 2026 the Remote Watch Pass went up to $2.99 a month or $29.99 a year, and a new lifetime Plex Pass went from $249.99 to $749.99. Those are November 2026 prices, so check [plex.tv/plans](https://www.plex.tv/plans/).
- **[Jellyfin](https://jellyfin.org/)** - The free, open-source alternative I've been testing. It jumped from 10.11 straight to version 12 in September 2026. Running both side by side in separate containers is one of the nice things about Proxmox. (If you're into music specifically, I wrote about [why self-hosted music still sucks](/blog/self-hosted-music-still-sucks-in-2026/) - the video side is way more mature.)
- **[Tautulli](https://tautulli.com/)** - Monitors Plex usage. Tells me exactly who's streaming what and when.
- **[Seerr](https://seerr.dev/)** - Request management and media discovery. Friends and family can request movies and shows through a nice web UI. Overseerr and Jellyseerr merged into Seerr in 2026, so it works with Plex or Jellyfin.
- **[Radarr](https://radarr.video/) / [Sonarr](https://sonarr.tv/)** - Automated movie and TV show management, integrated with Usenet and BitTorrent.
- **Prowlarr** - Indexer manager for all the Arr apps.
- **[LazyLibrarian](https://lazylibrarian.gitlab.io/)** - Manages ebooks. I used Readarr until the Servarr team retired it.
- **Audiobookshelf** - A dedicated server for audiobooks and podcasts.
- **[Bazarr](https://www.bazarr.media/)** - Automated subtitle downloads.
- **Tdarr** - Transcoding and health checking for media files.
- **qBittorrent** - Torrenting (legal content, obviously).
- **SABnzbd** - Usenet downloads.

### Everything else

- **[Pi-Hole](https://pi-hole.net/)** - Network-wide ad blocking. I moved this off a Raspberry Pi and onto Proxmox. Way more reliable.
- **[Octoprint](https://octoprint.org/)** - Remote control for my 3D printer.
- **[MagicMirror](https://magicmirror.builders/)** - Moved my [smart mirror project](/work/) to Proxmox for centralized management.
- **[Grocy](https://grocy.info/)** - Grocery and household management. My partner actually uses this one, which is the ultimate test of any self-hosted app.
- **[Minecraft server](https://raspberrytips.com/install-minecraft-server-debian/)** - Because of course I run a Minecraft server.

For a much bigger list of self-hosted apps, check out [Awesome Self-Hosted](https://github.com/awesome-selfhosted/awesome-selfhosted) on GitHub.

## How I architect containers

My approach is simple: **one service per container.** Every app gets its own isolated LXC container in Proxmox. This sounds like overkill until the first time you update one service and it breaks another one's dependencies. Isolated containers keep one app's update from breaking another's packages.

![A paper-collage animation on a pink field: a black-and-white egg carton holding six eggs lands, one egg in the front row wobbles and tips in its cup, then a cracked egg with its yolk in full color drops into that cup while the other five sit still, and the words Only one breaks set in above it](/images/blog/how-to-get-started-building-a-homelab-server/only-one-breaks.svg)

The benefits are practical:

You can update Sonarr without worrying about breaking Radarr. You can snapshot a container before making changes and roll back if something goes wrong. If one service goes haywire and eats all its allocated RAM, everything else keeps running. And when you want to try a new service, you spin up a fresh container in about 30 seconds.

I use lightweight Debian images for all my containers. I was already comfortable with Ubuntu, and Debian is Ubuntu's parent distro, so the learning curve was minimal.

### Using the NAS as shared storage

The Synology NAS is the backbone of my media setup. Instead of storing media files on the Proxmox server itself, I mount the NAS on the Proxmox host and pass it into each container that needs access to media. This means Plex, Sonarr, Radarr, and qBittorrent all read and write to the same NAS storage. No data duplication, no wasted local disk space.

![The homelab media setup: clients on desktop and mobile reach everything through an Nginx reverse proxy. Behind it, the Proxmox server runs Plex, Jellyfin, Sonarr, Radarr, Seerr, qBittorrent, Pi-hole, Minecraft and more, and mounts the Synology NAS over NFS, where /volume1/data holds the movies, TV, music and books.](/images/blog/how-to-get-started-building-a-homelab-server/media-setup.svg)

## How to mount a NAS inside Proxmox containers

Proxmox creates containers unprivileged by default, and an unprivileged container can't mount an NFS share itself. So mount the share once on the Proxmox host, then bind-mount it into each container that needs it. If you're using a Synology NAS (or any NFS-capable NAS), run these on the host:

First, update packages and install NFS support:

```bash
sudo apt update && sudo apt install nfs-common -y
```

Create a mount point:

```bash
mkdir /nas
```

Edit your filesystem table to add the NAS mount:

```bash
nano /etc/fstab
```

Add this line (replace with your NAS IP and share path):

```bash
192.168.0.100:/volume1/data /nas nfs defaults 0 0
```

Reload system daemons and mount:

```bash
systemctl daemon-reload
mount /nas
```

Then bind-mount it into a container (replace 101 with the container's ID):

```bash
pct set 101 -mp0 /nas,mp=/nas
```

That's it. Your NAS storage is now available at `/nas` inside the container, and the host mounts it again on every reboot. Unprivileged containers map their users to different IDs on the host (root inside becomes 100000), so if a service can't write to the share, check the NAS permissions for those IDs.

## Mistakes I made so you don't have to

After running this setup for a while (and eventually scaling to a full rack with two Dell R730s), here are the things I wish someone had told me:

### Don't overcommit RAM

It's tempting to give every container 4GB of RAM "just in case." Don't. Most services need way less than you think. Start with 512MB or 1GB per container and bump it up only if you see actual memory pressure. Use `htop` inside your containers to monitor real usage.

### Don't install everything at once

I know the [awesome-selfhosted list](https://github.com/awesome-selfhosted/awesome-selfhosted) is exciting. But deploying 30 containers you'll never actually use is a waste of resources and a maintenance headache. Install what you'll actually use this week, not what sounds cool.

### Set up static IPs early

I didn't do this at first and it was a nightmare. Every time my router reassigned an IP, half my services would break because they referenced each other by IP address. Assign static IPs to your server and containers from day one, or use your router's DHCP reservation feature.

### Take snapshots before you change anything

Proxmox snapshots are free and fast. Before updating a container, changing a config, or trying something new - take a snapshot. I can't count the number of times this has saved me from a full reinstall.

### Use VLANs if you're exposing anything to the internet

If you're planning to make any services publicly accessible (and you probably will eventually), segment your network. Put your public-facing services on a separate VLAN from your home network. Proxmox's built-in firewall makes this manageable. The same idea works for cheap gadgets: [my LED pixel art frame lives on its own IoT VLAN](/blog/pixelpane-pixel-art-home-assistant/), where it can reach Home Assistant and the internet and nothing else.

### Containers over VMs (usually)

LXC containers share the host kernel and use way fewer resources than full VMs. For most homelab services, containers are the right choice. I only use full VMs for things that need a separate kernel (like a Windows gaming VM or a firewall appliance).

### Automate your backups

Set up automated backups to a separate disk or your NAS. Proxmox has built-in scheduled backup support. Don't be the person who loses their entire setup because a drive died. The [3-2-1 backup rule](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/) is worth reading about: 3 copies of your data, on 2 different types of media, with 1 offsite.

### Document what you do

Future you will not remember why you changed that config file at 11 PM on a Tuesday. Keep notes. A simple markdown file in a git repo works great. When something breaks six months later, you'll thank yourself.

## Where to go from here

My setup started as a single $150 ThinkServer running 15 containers. Today it's two Dell R730s with dual NVIDIA GPUs, 10G networking, VLANs, about 70 containers, and a full Home Assistant smart home setup. You can read about that evolution in [My Homelab Two Years Later: From Desktop Tower to Server Rack](/blog/homelab-two-years-later/).

But none of that would have happened if I'd waited until I could afford the "right" hardware. I started with what I could get cheap, learned as I went, and upgraded when I hit actual limitations - not imagined ones.

Some natural next steps once you're comfortable:

- **Set up a reverse proxy** (Nginx Proxy Manager or Caddy) to give your services clean URLs. I wrote about [how to set up custom domain names on your internal network using Nginx Proxy Manager and Pi-Hole](/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/).
- **Add a VPN** ([WireGuard](https://www.wireguard.com/) or [Tailscale](https://tailscale.com/)) for secure remote access to your homelab. Tailscale's free plan covers up to 6 users as of November 2026.
- **Put your containers in code** once clicking through the Proxmox UI starts to hurt. For me that was around forty containers, each configured by hand. I moved them all into OpenTofu and wrote up [how I stopped managing my homelab by hand](/blog/opentofu-proxmox-immutable-homelab/).
- **Try Home Assistant** if you have any smart home devices. I initially kept it off my server for security reasons, but it eventually became the most important thing in my entire setup. I wrote a [getting started guide for Home Assistant](/blog/how-to-get-started-with-home-assistant/) and later documented [replacing Alexa with a privacy-focused setup](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/).
- **Add GPU passthrough** if you want hardware-accelerated transcoding in Plex/Jellyfin or want to run a gaming VM. I used GPU passthrough to build a [subtitle generator with Whisper](/blog/building-a-gpu-accelerated-subtitle-generator/).

## Resources for homelab beginners

When I was starting out, these communities and resources helped me most:

- **[r/homelab](https://www.reddit.com/r/homelab/)** - The main subreddit. Great for inspiration and troubleshooting. Read the [wiki](https://www.reddit.com/r/homelab/wiki/index/) before posting.
- **[r/selfhosted](https://www.reddit.com/r/selfhosted/)** - Focused specifically on self-hosted apps and services.
- **[Awesome Self-Hosted](https://github.com/awesome-selfhosted/awesome-selfhosted)** - A curated list of self-hosted software. This is where you go to discover what's possible.
- **[ServeTheHome](https://www.servethehome.com/)** - Hardware reviews focused on servers and homelab gear. Their mini PC reviews are particularly useful.
- **[Proxmox community forums](https://forum.proxmox.com/)** - For Proxmox-specific troubleshooting.
- **[TRaSH Guides](https://trash-guides.info/)** - If you're setting up a media stack, start with these guides.
- **[Community Scripts for Proxmox](https://github.com/community-scripts/ProxmoxVE)** - One-liner install scripts that make Proxmox setup painless.

## Frequently asked questions

**How much does a homelab cost to run?**

Hardware is a one-time cost, and it went up in 2026 because of the RAM shortage. Electricity is the ongoing cost. At $0.15/kWh, a mini PC idles at 10-25W and costs about $1-3 a month. A used office tower idles at 40-80W and costs about $4-9 a month. A full rack server idles at 100-200W and costs $11-22 or more a month. My single ThinkServer added about $9 a month to my electricity bill.

**Can I run a homelab in an apartment?**

Yes. A mini PC (Beelink, ASUS NUC, Minisforum) is completely silent, smaller than a book, and uses less power than an old incandescent bulb. You can run Pi-hole, Jellyfin, Home Assistant, and a dozen other services on one. Just don't buy a rack server for an apartment - your neighbors will hear it.

**Is a homelab worth it in 2027?**

If you want to learn Linux, Docker, and networking - yes. If you want to self-host your own services instead of paying for cloud subscriptions - yes. Hardware costs more than it did a couple of years ago, so start with a used office PC or a machine you already own.

**What if I break something?**

You will break something. That's the whole point. Proxmox snapshots make it easy to roll back, and the worst case scenario is you reinstall a container (which takes about 2 minutes). Nothing you do on a homelab is going to damage your hardware permanently.

**Do I need to know Linux?**

Not to start. Proxmox and Unraid both have web UIs that handle most things. But you'll naturally pick up Linux commands as you go, and that's one of the most valuable skills a homelab gives you.
