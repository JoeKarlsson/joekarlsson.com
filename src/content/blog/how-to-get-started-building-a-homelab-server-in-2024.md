---
title: 'How to get started building a Homelab server in 2026'
date: 2023-09-27
slug: 'how-to-get-started-building-a-homelab-server-in-2024'
description: 'I built my first Homelab server for under $200 using a used Lenovo ThinkServer from Facebook Marketplace and Proxmox. Here is everything I learned about picking hardware, choosing an OS, setting up containers, and mounting NAS storage.'
categories: ['Homelab']
heroImage: '/images/blog/how-to-get-started-building-a-homelab-server-in-2024/homelab-vaporwave.webp'
heroAlt: 'Homelab server setup guide with architecture diagram'
tldr: 'I built my first Homelab server for under $200 using a used Lenovo ThinkServer from Facebook Marketplace and Proxmox. Here is everything I learned about picking hardware, choosing an OS, setting up containers, and mounting NAS storage.'
---

Look, if you've been lurking on r/homelab or watching YouTube videos of people with full server racks in their basements, I get it. It looks intimidating. Expensive. Like you need an IT degree and a dedicated room in your house just to get started.

You don't. I built my first homelab server for under $200 with a used PC from Facebook Marketplace, and it ran everything I threw at it. This post is the guide I wish I had when I started - no $2,000 server rack required, no enterprise networking degree, just a cheap used PC and some curiosity.

## Why did I start building a Homelab?

It started with my Synology NAS choking. I kept adding Docker containers to it - a media server here, a download manager there - and eventually the little NAS was gasping for air. The CPU was pegged at 100% and the 2GB of RAM was a joke. Every time I wanted to try a new service, something else would crash.

I realized I had two options: buy an expensive new NAS with better specs, or get a proper server and let the NAS do what it's good at - storing files. The server won.

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

![Is this a server? - me looking at any used PC on Facebook Marketplace](/images/blog/how-to-get-started-building-a-homelab-server-in-2024/is-this-a-server.webp)

The best places to find used hardware in 2026:

- **Facebook Marketplace** - Local businesses dump old office PCs here constantly. I've seen perfectly good machines for $50-150.
- **eBay** - Great for specific models. Search for "Dell Optiplex" or "Lenovo ThinkCentre" and sort by price.
- **Craigslist** - Hit or miss, but you can find deals.
- **r/homelabsales** - The subreddit where homelab people sell their old gear when they upgrade.
- **Local e-waste recyclers** - Some will sell you old business PCs for next to nothing.

What to look for in used hardware:

- **CPU**: Any Intel i5/i7 from the last 8-10 years, or a Xeon E3/E5. These are more than enough for a starter homelab.
- **RAM**: 16GB minimum, 32GB is the sweet spot. RAM is usually the first bottleneck.
- **Storage**: Doesn't matter as much if you have a NAS. A single SSD for the OS works fine.

## Buying my first server

I found a used Lenovo ThinkServer on Facebook Marketplace that some local business was getting rid of. $150.

![Drake meme - rejecting buying a brand new server for $800, approving finding a used ThinkServer on Facebook Marketplace for $150](/images/blog/how-to-get-started-building-a-homelab-server-in-2024/drake-used-server.webp)

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

If you're brand new to all of this, Proxmox has a solid community and good documentation. The [Proxmox forum](https://forum.proxmox.com/threads/proxmox-beginner-tutorial-how-to-set-up-your-first-virtual-machine-on-a-secondary-hard-disk.59559/) has a good beginner tutorial for getting your first VM set up.

## The containers I run

Once Proxmox was installed, the fun part started - spinning up containers. The [Community Scripts project](https://github.com/community-scripts/ProxmoxVE) (formerly the tteck Proxmox Helper Scripts) has one-liner install scripts for most popular homelab services. It makes setup almost embarrassingly easy.

![One does not simply stop at one container](/images/blog/how-to-get-started-building-a-homelab-server-in-2024/one-does-not-simply-containers.webp)

### Media Management

I use the [TRaSH Guides](https://trash-guides.info/) to configure all of my Arr apps and media downloaders. If you're setting up a media stack, start there.

- **[Plex](https://www.geekbitzone.com/posts/2022/proxmox/plex-lxc/install-plex-in-proxmox-lxc/#introducing-linux-containers-lxc)** - My original media server. Still works, but I've lost some confidence in where the project is headed.
- **[Jellyfin](https://jellyfin.org/)** - The open-source alternative I've been testing. Running both side by side in separate containers is one of the nice things about Proxmox.
- **[Tautulli](https://tautulli.com/)** - Monitors Plex usage. Tells me exactly who's streaming what and when.
- **[Seerr](https://seerr.dev/)** - Request management and media discovery. Friends and family can request movies and shows through a nice web UI.
- **[Radarr](https://radarr.video/) / [Sonarr](https://sonarr.tv/)** - Automated movie and TV show management, integrated with Usenet and BitTorrent.
- **Prowlarr** - Indexer manager for all the Arr apps.
- **Readarr** - Manages ebooks and audiobooks.
- **Audiobookshelf** - A dedicated server for audiobooks and podcasts.
- **[Bazarr](https://www.bazarr.media/)** - Automated subtitle downloads.
- **Tdarr** - Transcoding and health checking for media files.
- **qBittorrent** - Torrenting (legal content, obviously).
- **SABnzbd** - Usenet downloads.

### Everything Else

- **[Pi-Hole](https://pi-hole.net/)** - Network-wide ad blocking. I moved this off a Raspberry Pi and onto Proxmox. Way more reliable.
- **[Octoprint](https://octoprint.org/)** - Remote control for my 3D printer.
- **[MagicMirror](https://magicmirror.builders/)** - Moved my [smart mirror project](/work/) to Proxmox for centralized management.
- **[Grocy](https://grocy.info/)** - Grocery and household management. My partner actually uses this one, which is the ultimate test of any self-hosted app.
- **[Minecraft server](https://raspberrytips.com/install-minecraft-server-debian/)** - Because of course I run a Minecraft server.

## How I architect containers

My approach is simple: **one service per container.** Every app gets its own isolated LXC container in Proxmox. This sounds like overkill until the first time you update one service and it breaks another one's dependencies. With isolated containers, that never happens.

The benefits are practical:

You can update Sonarr without worrying about breaking Radarr. You can snapshot a container before making changes and roll back if something goes wrong. If one service goes haywire and eats all its allocated RAM, everything else keeps running. And when you want to try a new service, you spin up a fresh container in about 30 seconds.

I use lightweight Debian images for all my containers. I was already comfortable with Ubuntu, and Debian is Ubuntu's parent distro, so the learning curve was minimal.

### Using the NAS as shared storage

The Synology NAS is the backbone of my media setup. Instead of storing media files on the Proxmox server itself, I mount the NAS as a network drive inside each container that needs access to media. This means Plex, Sonarr, Radarr, and qBittorrent all read and write to the same NAS storage. No data duplication, no wasted local disk space.

![Homelab architecture diagram showing NAS with NFS mount to Proxmox server running Plex, Minecraft, qBittorrent, Jellyfin, Sonarr, and Radarr behind Nginx reverse proxy serving desktop and mobile clients](/images/blog/how-to-get-started-building-a-homelab-server-in-2024/Homelab-Archiecture-1024x473.webp)

## How to mount a NAS inside Proxmox containers

If you're using a Synology NAS (or any NFS-capable NAS), mounting it in your Proxmox containers is straightforward. Here's how:

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

That's it. Your NAS storage is now available at `/nas` inside the container, and it'll automatically mount on reboot.

## Best practices I learned the hard way

After running this setup for a while (and eventually scaling to a full rack with two Dell R730s), here are the things I wish I'd known from the start:

### Don't overcommit RAM

It's tempting to give every container 4GB of RAM "just in case." Don't. Most services need way less than you think. Start with 512MB or 1GB per container and bump it up only if you see actual memory pressure. Use `htop` inside your containers to monitor real usage.

### Take snapshots before you change anything

Proxmox snapshots are free and fast. Before updating a container, changing a config, or trying something new - take a snapshot. I can't count the number of times this has saved me from a full reinstall.

### Use VLANs if you're exposing anything to the internet

If you're planning to make any services publicly accessible (and you probably will eventually), segment your network. Put your public-facing services on a separate VLAN from your home network. Proxmox's built-in firewall makes this manageable.

### Containers over VMs (usually)

LXC containers share the host kernel and use way fewer resources than full VMs. For most homelab services, containers are the right choice. I only use full VMs for things that need a separate kernel (like a Windows gaming VM or a firewall appliance).

### Automate your backups

Set up automated backups to a separate disk or your NAS. Proxmox has built-in scheduled backup support. Don't be the person who loses their entire setup because a drive died.

## Where to go from here

The beauty of a homelab is that it grows with you. My setup started as a single $150 ThinkServer running 15 containers. Two years later, it's two Dell R730s with dual NVIDIA GPUs, 10G networking, VLANs, 60+ containers, and a full Home Assistant smart home setup. You can read about that evolution in [My Homelab Two Years Later: From Desktop Tower to Server Rack](/blog/homelab-two-years-later/).

But none of that would have happened if I'd waited until I could afford the "right" hardware. I started with what I could get cheap, learned as I went, and upgraded when I hit actual limitations - not imagined ones.

Some natural next steps once you're comfortable:

- **Set up a reverse proxy** (Nginx Proxy Manager or Caddy) to give your services clean URLs. I wrote about [how to set up custom domain names on your internal network using Nginx Proxy Manager and Pi-Hole](/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/).
- **Add a VPN** ([WireGuard](https://www.wireguard.com/) or [Tailscale](https://tailscale.com/)) for secure remote access to your homelab.
- **Try Home Assistant** if you have any smart home devices. I initially kept it off my server for security reasons, but it eventually became the most important thing in my entire setup.
- **Add GPU passthrough** if you want hardware-accelerated transcoding in Plex/Jellyfin or want to run a gaming VM.

## Wrap up

Don't wait for the perfect hardware or the perfect time. Grab a used PC for $100-200, install Proxmox, and start spinning up containers. You'll break things, you'll learn a ton, and you'll wonder why you didn't start sooner. The homelab community is one of the most helpful communities in tech - hit up r/homelab, the Proxmox forums, or the [Self-Hosted podcast](https://selfhosted.show/) when you get stuck.

Your first homelab doesn't need to be impressive. It just needs to exist.
