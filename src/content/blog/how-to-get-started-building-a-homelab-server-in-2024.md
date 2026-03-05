---
title: 'How to get started building a Homelab server in 2026'
date: 2023-09-27
slug: 'how-to-get-started-building-a-homelab-server-in-2024'
description: 'Welcome to your definitive guide on building your first Homelab server, aimed at both seasoned tech aficionados and nascent enthusiasts. In this blog post, I hope to provide an in-depth walkthrough...'
categories: ['Homelab']
heroImage: '/images/blog/how-to-get-started-building-a-homelab-server-in-2024/homelab-vaporwave.webp'
---

Welcome to your definitive guide on building your first Homelab server, aimed at both seasoned tech aficionados and nascent enthusiasts. In this blog post, I hope to provide an in-depth walkthrough of the components you need and configuration best practices I’ve picked up since completing my first Homelab build.

## Why did I get started with making a Homelab? 

Alright, but why did I start building a Homelab server now? Well, it all began when my Synology NAS could no longer handle the increasing weight of additional Docker services. It wasn’t long before the CPU and RAM were gasping for air. The realization hit: I needed to transition to being an active maintainer of my own Homelab to truly expand and experiment. Let’s dig into how you can make that leap too.

## Goals of my Homelab server

As we pivot from the “why” to the “how,” aligning our actions with clearly defined goals is important. A Homelab can serve lots of purposes, from hosting media files to serving as a solid testing environment for DevOps pipelines. My specific objectives for constructing a Homelab server are as follows:

- **Affordable**: Keep the budget under $200 USD.

- **Run All Desired Containers and Services**: The server must be capable of handling every microservice and application I want to deploy.

- **Performance-to-Cost Ratio**: Opt for hardware that offers the best blend of performance and affordability, without exceeding the $200 limit.

- **Containerization**: Must be compatible with Docker and Kubernetes for hassle-free orchestration of microservices.

- **Modular Design**: Hardware should be upgradeable-whether it’s RAM, CPU, or storage-without necessitating a complete system revamp.

- **Power Efficiency**: The server should have a minimal electrical draw to ensure that operational costs remain low.

- **RAID Support**: Include redundant storage options for added fault tolerance.

These guidelines will act as the North Star for the decisions and recommendations that follow, steering us toward a balanced, cost-effective, and high-performance Homelab server.

Before zeroing in on the ideal server, I embarked on an expansive journey through the labyrinthine world of hardware options. High-end server racks, Raspberry Pi-powered configurations, and specialized, bespoke solutions-I considered them all. Each had its unique merits but also accompanying drawbacks, often violating one or more of the pre-set guidelines.

## Buying my Homelab Server

Then serendipity struck. I stumbled upon a “good enough” solution on Facebook Marketplace-a used Lenovo ThinkServer PC that once powered a local small business. At first glance, the specs seemed to align well with my goals:

- **CPU**: 4 x Intel(R) Xeon(R) CPU E3-1226 v3 @ 3.30GHz

- **Storage**: 2 TBs

- **RAM**: 32 GBs

This system not only met but exceeded expectations in certain areas. Here’s how it measured up against the goals:

- **Affordability**: Purchased second-hand, the cost was significantly below the $200 budget.

- **Run All Desired Containers and Services**: The quad-core Intel Xeon CPUs and 32 GBs of RAM more than suffice for any container or service I plan to run.

- **Performance-to-Cost Ratio**: The combination of a high-performance Xeon CPU and abundant RAM, at a discounted price, hit the sweet spot.

- **Containerization**: Compatibility with Docker and Kubernetes is a given, thanks to the beefy CPU.

- **Modular Design**: The ThinkServer design allows for future hardware upgrades.

- **Power Efficiency**: Though not the most efficient, the server’s power draw is reasonable, and the performance payoff justifies it.

- **Minimal Footprint**: Its form factor is manageable and could be rack-mounted.

- **RAID Support**: 2 TBs of storage provides ample room for RAID configurations.

In the grand scheme of things, this used ThinkServer was a golden compromise-a solution that ticked nearly all boxes without breaking the bank. Up next, let’s discuss setting this beast up and breathing new life into it.

### **Note on Starting Small and Scaling Up**

For those just dipping their toes into the world of Homelab servers, I highly recommend starting with used PCs available on platforms like eBay or Craigslist. These platforms offer tons of cost-effective options that can serve as excellent starting points for a beginner. Moreover, the used market provides an affordable way to meet most of your initial requirements, as my experience with the ThinkServer illustrates. Once you’re comfortable with your setup and find yourself craving more power or features, that’s the time to consider investing in a high-end, specialized server rack. It’s a modular approach; start small, get the hang of it, and then scale up as your needs and skills grow.

## My Decision Matrix for Selecting an Operating System

The operating system (OS) is the foundation of your Homelab server-choosing wisely can dictate your future experience. While my initial inclination was to use Ubuntu due to familiarity and its well-documented ecosystem, I eventually settled on Proxmox as my OS of choice. Here’s why:

#### **Why Not Just Ubuntu?**

Ubuntu’s mainstream popularity and extensive community support make it an attractive option. Layering Docker or Portainer atop Ubuntu would have enabled containerization. However, the Linux distro is more general-purpose and less tailored for virtualization and container orchestration in comparison to [Proxmox](https://www.proxmox.com/en/).

#### **The Case for Proxmox**

- **Native Virtualization and Container Support**: Proxmox VE (Virtual Environment) is built with virtualization and containerization in mind. It supports both KVM for virtual machines and LXC for containers, offering a flexible, integrated environment for all your services.

- **Web-Based Management Interface**: Proxmox comes with a full-featured and intuitive web GUI. This allows for easy management of virtual machines, containers, storage, and even cluster configurations without the need for an SSH window for every task.

- **Backup and Restore Features**: Proxmox has solid backup mechanisms, allowing for quick snapshots and restores of your VMs and containers. This functionality is vital for experimentation and recovery scenarios in a Homelab setting.

- **Resource Monitoring and Reporting**: Proxmox provides real-time reporting and monitoring of resources, making it easier to optimize the usage of your hardware based on specific needs.

- **ZFS Support**: While Ubuntu supports ZFS, Proxmox’s tighter integration enables more efficient storage utilization, especially beneficial if you’re considering RAID configurations.

- **Community and Commercial Support**: Proxmox has a thriving community, much like Ubuntu. However, it also offers a commercial subscription for enterprise-grade support, an option worth considering as your Homelab server grows in complexity.

- **Clustering Capabilities**: Proxmox allows for easy clustering, which can be beneficial if you decide to scale your operations horizontally by adding more nodes to your setup.

- **Security Measures**: From built-in firewalls to various authentication methods, Proxmox offers a variety of security options, important for an environment that might eventually face exposure to the internet.

Proxmox offers a slew of features tailored for a Homelab setup. Its focus on containerization, virtualization, and ease of management makes it a more fitting choice for those specifically interested in a solid, scalable Homelab server environment. Therefore, despite my comfort level with Ubuntu, the feature set of Proxmox tipped the scales.

## Containers I wanted to run on my Homelab

I found this amazing site that has a ton of scripts for simplifying your Proxmox Homelab setup [https://tteck.github.io/Proxmox/](https://tteck.github.io/Proxmox/)

**Media Management:**

I use the TRaSH-Guide to configure and set up all of my Arr apps and media downloaders: [https://trash-guides.info/](https://trash-guides.info/)

- **Plex**: While Plex has been reliable, my confidence in the project’s direction has diminished, prompting me to explore alternatives.[ [2]](https://www.geekbitzone.com/posts/2022/proxmox/plex-lxc/install-plex-in-proxmox-lxc/#introducing-linux-containers-lxc)

- **Jellyfin**: An open-source alternative to Plex; spinning up a Proxmox container provided the perfect testing ground.[ [3]](https://jellyfin.org/)

- **Tautulli**: For monitoring Plex libraries.[ [4]](https://tautulli.com/)

- **Overseerr**: For request management and media discovery within the Plex ecosystem.[ [5]](https://overseerr.dev/)

- **Radarr/Sonarr/Lidarr**: These ‘Arr’ apps are for managing movies, TV shows, and music respectively, integrated with Usenet and BitTorrent.[ [6]](https://radarr.video/)[ [7]](https://sonarr.tv/)

- **Prowlarr**: Serves as an indexer manager and proxy for the ‘Arr’ apps.

- **Readarr**: Manages eBooks and audiobooks.

- **Audiobookshelf**: A server for audiobooks and podcasts.

- **Bazarr**: Manages and downloads subtitles.[ [8]](https://www.bazarr.media/)

- **Tdarr**: Transcoding and remuxing media; also checks for corrupted files.

- **qBittorrent**: For torrenting legal content.

- **SABnzbd**: For Usenet downloads.

#### **Miscellaneous**

- **Pi-Hole**: Network-level ad-blocking; moved from a Raspberry Pi to Proxmox.[ [9]](https://pi-hole.net/)

- **MotionEye**: Manages IP cameras flashed with RSTP firmware.

- **Octoprint**: To control my Prusa MK3S 3D printer.[ [10]](https://octoprint.org/)

- **MagicMirror**: Moved my smart mirror setup to Proxmox for centralized IoT management.[ [11]](https://www.joekarlsson.com/portfolio/magicmirror%C2%B2-smart-iot-mirror/)[ [12]](https://magicmirror.builders/)

- **Grocy**: Manages groceries and household items, meal plans, and more.[ [13]](https://grocy.info/)

- **Minecraft**: Rekindled my love for Minecraft and decided to run my own server for a more personalized experience. Followed a Debian-based installation guide to set it up.[ [1]](https://raspberrytips.com/install-minecraft-server-debian/)

## Container Architecture

For efficient system design, the architecture of my Homelab leans heavily on containerization. The core philosophy here is isolation for service-level granularity. What this means in plain English: each service or application in my Homelab exists in its own distinct container. This brings about a handful of key advantages:

#### **Benefits of Isolated Containers**

- **Simplified Management**: The Proxmox interface becomes a one-stop shop for managing individual services. Stop, start, or clone services without affecting the others.

- **Easy Updates**: Updating a single service doesn’t require an entire system halt; you can update one container without touching the others.

- **Resource Efficiency**: Containers share the host system’s OS kernel, unlike VMs, which require their own operating system, thereby using fewer system resources.

- **Rapid Deployment**: With the use of container templates, spinning up new services becomes a matter of a few clicks.

- **Fault Isolation**: If one service goes haywire, it won’t bring down the whole system, thanks to the isolated environment.

### How it Works

Using Proxmox as the orchestration layer, services such as databases, web servers, or media servers each exist in individual containers. These containers are essentially lightweight, standalone, executable software packages that contain everything needed to run the service: code, libraries, and runtime.

For example, if I’m running a MySQL database and a separate NGINX web server, each would live in its own container. Should I need to upgrade MySQL, I can do so without affecting the NGINX container. This is a high degree of control and flexibility you’d be hard-pressed to achieve with traditional virtual machines.

By maintaining each service in an isolated container, I’ve essentially modularized my Homelab, making it a more manageable, efficient, and reliable system.

### **Leveraging NAS for Media Management in Containers**

In my Homelab architecture, the Synology NAS isn’t just a separate entity; it’s an integral part of the ecosystem, especially for my media management tasks. I’ve configured it as a mounted data store accessible to several of my containers running on the Proxmox host. This approach serves a dual purpose. First, it offers an optimized, centralized repository for all media files, eliminating data redundancy and ensuring quick access across services. Second, it makes resource allocation more efficient. Containers dedicated to tasks like media streaming, transcoding, or library management can access the same high-capacity storage without wasting local Proxmox server resources. So, whether it’s a Plex server or a torrent client, multiple containers can read and write to the same NAS-based datastore, offering a unified, efficient media management solution.

![Homelab architecture diagram showing NAS with NFS mount to Proxmox server running Plex, Minecraft, qBittorrent, Jellyfin, Sonarr, and Radarr behind Nginx reverse proxy serving desktop and mobile clients](/images/blog/how-to-get-started-building-a-homelab-server-in-2024/Homelab-Archiecture-1024x473.webp)

## How to mount NAS inside of your Proxmox containers

In the pursuit of optimizing my Homelab, integrating Network Attached Storage (NAS) into my Proxmox containers was essential. This provides centralized storage, making data access more consistent and efficient across all my services (especially with my media manager containers). If you’ve been using a Synology NAS like I have, these steps simplify the process of mounting it within your Proxmox containers. Here’s how to do it:

- Update the Package List and Install NFS Support

```
sudo apt update && sudo apt install nfs-common -y
```

- Create Mount Point Directory

```
mkdir /nas
```

- Edit Filesystem Table

Open the `/etc/fstab` file in a text editor. Here, we use `nano`.

```
nano /etc/fstab
```

Add the following line to mount the NAS.

```
[IP_ADDRESS_OF_YOUR_NAS]:[DIRECTORY_YOUR_SHARE] /nas nfs defaults 0 0
```

An example would be:

```
192.168.0.555:/volume1/data /nas nfs defaults 0 0
```

- Reload System Daemons

```
systemctl daemon-reload
```

- Mount the NAS

```
mount [IP_ADDRESS_OF_YOUR_NAS]:[DIRECTORY_YOUR_SHARE]
```

## Best Practices for setting up home lab architecture:

Once you’ve opted for Proxmox as your operating system of choice, and got it all [installed and setup](https://forum.proxmox.com/threads/proxmox-beginner-tutorial-how-to-set-up-your-first-virtual-machine-on-a-secondary-hard-disk.59559/). Adhering to best practices during setup can save you from future headaches. Here’s a roadmap for deploying a solid, scalable, and secure Proxmox-based Homelab:

#### **Hardware Resource Allocation**

- **CPU Pinning**: Assign specific CPU cores to particular virtual machines (VMs) or containers to ensure optimal performance.

- **RAM Allocation**: Don’t overcommit. Use a tool like htop to monitor usage and leave some headroom for the host OS.

#### **Storage Strategy**

- **ZFS Pool Setup**: I opted to not use a ZFS pool since it requires extra RAM to manage, but I had a massive TrueNAS cluster, I would probably opt to use this feature.

- **SSD Caching**: If available, use an SSD as a cache drive to speed up data access for frequently used files.

#### **Networking**

- **VLANs**: Segregate your network using VLANs for increased security and better traffic management.

- **Firewall Rules**: Use Proxmox’s built-in firewall to restrict both inbound and outbound traffic as per your needs.

#### **Virtual Machines & Containers**

- **Template Creation**: Create templates for common OS setups to speed up future deployments.

- **Container Images**: I opted to use a lightweight Debian image for all of my containers. I was comfortable with Ubuntu, and Debian is the parent distro of Ubuntu, so it was natural to get used to,

- **Resource Limits**: Set CPU and RAM limits to prevent any single VM or container from consuming excessive resources.

#### **Backup and Snapshots**

- **Automated Backups**: Schedule automated backups and store them on a separate disk or network storage.

- **Snapshot Scheduling**: Use Proxmox’s snapshot feature to take periodic snapshots of your VMs and containers.

## Next steps

Next on the agenda, I’ve got a few exciting projects. First, I’m eyeing a GPU installation to get a Windows VM up and running. The main push? Gaming. I’ve been itching to play Baldur’s Gate 3 and this setup will make that possible. Alongside this, I’m working on setting up [OpenVPN](https://openvpn.net/). This will give me secure remote access to my Homelab, allowing me to manage it from anywhere. Lastly, I’m planning on installing Nginx Proxy Manager. The aim is to make some of my services available for public use. Specifically, I want my friends to be able to access my Minecraft server and Overseer, a platform for managing media requests. I ended up writing a follow-up on [how to set up custom domain names on your internal network using Nginx Proxy Manager and Pi-Hole](/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/).

Shockingly, I decided not to install HomeAssistant (which is a project I am a massive fan of). When setting up my Homelab, including Home Assistant on the same Proxmox server and other services might seem intuitive. However, I deliberately chose not to. The reason is rooted in the concept of operational isolation and security. Home Assistant is a powerful tool for home automation, interacting directly with various IoT devices in my home-from smart lights to HVAC systems. Mixing this level of access with a web server that hosts public-facing services introduces a significant security risk. Should the web server be compromised, it could potentially give an attacker access to control or manipulate my home automation system.

## Wrap Up

The most important takeaway is this: don’t wait for the ‘perfect’ time or the ‘perfect’ gear to start your Homelab. You can see my full gear list on my [uses page](/uses/) if you’re curious about what I’m running these days. With platforms like Proxmox and a vibrant community supporting tons of containerized services, you can start small and scale at your own pace. A Homelab is a canvas for your technical endeavors, a playground for your curiosity. It’s a project that grows with you, and it’s never too late to get started. Whether you’re using second-hand hardware, an old PC, or even a Raspberry Pi, your journey into the world of home labs will be a fulfilling one. Reach out to share your own experiences, ask questions, or offer insights. Trust me, once you dive in, you’ll wonder why you didn’t start sooner.

---

## URLs:

- [https://raspberrytips.com/install-minecraft-server-debian/](https://raspberrytips.com/install-minecraft-server-debian/)

- [https://www.geekbitzone.com/posts/2022/proxmox/plex-lxc/install-plex-in-proxmox-lxc/#introducing-linux-containers-lxc](https://www.geekbitzone.com/posts/2022/proxmox/plex-lxc/install-plex-in-proxmox-lxc/#introducing-linux-containers-lxc)

- [https://jellyfin.org/](https://jellyfin.org/)

- [https://tautulli.com/](https://tautulli.com/)

- [https://overseerr.dev/](https://overseerr.dev/)

- [https://radarr.video/](https://radarr.video/)

- [https://sonarr.tv/](https://sonarr.tv/)

- [https://www.bazarr.media/](https://www.bazarr.media/)

- [https://pi-hole.net/](https://pi-hole.net/)

- [https://octoprint.org/](https://octoprint.org/)

- [https://www.joekarlsson.com/portfolio/magicmirror%C2%B2-smart-iot-mirror/](https://www.joekarlsson.com/portfolio/magicmirror%C2%B2-smart-iot-mirror/)

- [https://magicmirror.builders/](https://magicmirror.builders/)

- [https://grocy.info/](https://grocy.info/)
