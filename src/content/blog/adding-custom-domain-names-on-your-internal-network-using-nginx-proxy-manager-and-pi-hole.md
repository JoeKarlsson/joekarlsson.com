---
title: 'Adding Custom Domain Names on Your Internal Network Using Nginx Proxy Manager and Pi-Hole'
date: 2024-01-17
slug: 'adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole'
description: 'How I set up custom domain names on my internal network using Pi-Hole for DNS and Nginx Proxy Manager for traffic control and SSL - no public domain registration needed.'
categories: ['Homelab']
heroImage: '/images/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/d4994649-ee18-4d47-aaa7-567b58bb9f39.webp'
heroAlt: 'Setting up custom domain names on a home network with Nginx Proxy Manager and Pi-hole'
tldr: 'I got tired of typing IP addresses to access my homelab services, so I set up Pi-Hole for local DNS and Nginx Proxy Manager for routing and SSL. The whole thing takes about 15 minutes.'
---

I got tired of typing IP addresses to access services on my homelab, so I set up custom domain names on my internal network. If you don't have a homelab yet, check out my guide on [how to get started building a homelab server](/blog/how-to-get-started-building-a-homelab-server-in-2024/) first. I'm going to walk through how I set up custom domain names using [Pi-Hole](https://pi-hole.net/) for DNS management and [Nginx Proxy Manager](https://nginxproxymanager.com/) for web traffic control and SSL encryption.

## Step 1: Configuring Pi Hole for Custom Domain

Pi-Hole, primarily known for ad-blocking, also serves as a local DNS server. To set a custom domain:

- **Access Pi-Hole**: Log into the Pi-Hole administrative interface.

- **Navigate to Local DNS**: Select ‘Local DNS’ from the menu, then ‘DNS Records’.

- **Add Custom Domain**: Enter your desired custom domain name (e.g., `magic.mirror`) and the IP address of your NGINX Proxy Manager server. Remember, this domain doesn’t need to be a registered one or have a valid top-level domain (TLD).

## Step 2: Configuring NGINX Proxy Manager

Next, I configured my NGINX Proxy Manager to recognize and forward requests for the custom domain:

- **Access NGINX Proxy Manager**: Open the NGINX Proxy Manager interface.

- **Add New Host**: Click on ‘Add New Host’ and enter the custom domain you set in Pi Hole (e.g., `magic.mirror`).

- **Set Forward Hostname**: Under ‘Forward Hostname / IP’, enter the IP address of the server hosting the service (e.g., your Magic Mirror server).

- **Enable Options** (Optional): You may enable ‘Cache Assets’ for improved performance and ‘Block Common Exploits’ for added security.

## Step 3: SSL Encryption with Let’s Encrypt

I also wanted SSL on my internal traffic, and it's surprisingly easy to set up:

- **Select SSL**: In the NGINX Proxy Manager, while setting up the host, choose to add an SSL certificate.

- **Use Let’s Encrypt**: Opt for a free certificate from Let’s Encrypt.

- **Avoid Server Reachability Test**: Do not click ‘Test Server Reachability’ since the service isn’t accessible externally. This doesn’t impede the SSL setup for internal use.

## Why This Setup Works

I use this setup on my homelab and it's made a huge difference. Instead of remembering IP addresses for every service, I just type something like `magic.mirror` in my browser and it works. The whole thing takes maybe 15 minutes to set up and makes your internal network feel way more polished.

---

**Reference Links**:

- [Pi-Hole Official Site](https://pi-hole.net/)

- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/)

- [MagicMirror Project](https://magicmirror.builders/)

- [Let’s Encrypt](https://letsencrypt.org/)
