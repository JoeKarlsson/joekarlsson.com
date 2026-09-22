---
title: 'Adding Custom Domain Names on Your Internal Network Using Nginx Proxy Manager and Pi-Hole'
date: 2024-01-17
slug: 'adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole'
description: 'How I set up custom domain names on my internal network using Pi-Hole for DNS and Nginx Proxy Manager for traffic control and SSL - including what actually works for SSL on local-only domains.'
categories: ['Homelab']
heroImage: '/images/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/d4994649-ee18-4d47-aaa7-567b58bb9f39.webp'
heroAlt: 'Setting up custom domain names on a home network with Nginx Proxy Manager and Pi-hole'
tldr: 'I got tired of typing IP addresses to access my homelab services, so I set up Pi-Hole for local DNS and Nginx Proxy Manager for routing and SSL. The whole thing takes about 15 minutes.'
---

**Update (September 2026):** A reader reached out to let me know the SSL section below is wrong - and they're right. Let's Encrypt rejects certificate requests for local-only TLDs like `.mirror` because they aren't in the [public suffix list](https://publicsuffix.org/). Skipping the reachability test in NPM doesn't help - the rejection happens at Let's Encrypt's API before any challenge is attempted. I've rewritten Step 3 with two approaches that actually work. Steps 1 and 2 (Pi-hole DNS + NPM routing) are still valid.

---

I got tired of typing IP addresses to access services on my homelab, so I set up custom domain names on my internal network. If you don't have a homelab yet, check out my guide on [how to get started building a homelab server](/blog/how-to-get-started-building-a-homelab-server-in-2024/) first. I'm going to walk through how I set up custom domain names using [Pi-Hole](https://pi-hole.net/) for DNS management and [Nginx Proxy Manager](https://nginxproxymanager.com/) for web traffic control and SSL encryption.

## Step 1: Configuring Pi Hole for Custom Domain

Pi-Hole, primarily known for ad-blocking, also serves as a local DNS server. To set a custom domain:

- **Access Pi-Hole**: Log into the Pi-Hole administrative interface.

- **Go to Local DNS**: Select ‘Local DNS’ from the menu, then ‘DNS Records’.

- **Add Custom Domain**: Enter your desired custom domain name (e.g., `magic.mirror`) and the IP address of your NGINX Proxy Manager server. Remember, this domain doesn’t need to be a registered one or have a valid top-level domain (TLD).

## Step 2: Configuring NGINX Proxy Manager

Next, I configured my NGINX Proxy Manager to recognize and forward requests for the custom domain:

- **Access NGINX Proxy Manager**: Open the NGINX Proxy Manager interface.

- **Add New Host**: Click on ‘Add New Host’ and enter the custom domain you set in Pi Hole (e.g., `magic.mirror`).

- **Set Forward Hostname**: Under ‘Forward Hostname / IP’, enter the IP address of the server hosting the service (e.g., your Magic Mirror server).

- **Enable Options** (Optional): You may enable ‘Cache Assets’ for improved performance and ‘Block Common Exploits’ for added security.

## Step 3: SSL Encryption (What Actually Works)

This is the part I got wrong originally. Let’s Encrypt can’t issue a certificate for a made-up TLD like `.mirror` - it validates against the public suffix list, and `magic.mirror` isn’t on it. You’ll get a hard error before any challenge is even attempted. Skipping the reachability test doesn’t fix this.

There are two real approaches depending on whether you own a public domain:

### Option A: You own a public domain (recommended)

If you have a real domain - even a cheap one - this is the cleanest path. The idea: get a wildcard Let’s Encrypt cert for something like `*.home.yourdomain.com` using the DNS-01 challenge, then use Pi-hole to point those subdomains at your local NPM. Traffic stays on your LAN, but browsers trust the cert.

- **In NPM**, when adding SSL to a host, choose "Let’s Encrypt" and switch the challenge to **DNS**
- **Choose your DNS provider** - Cloudflare is the easiest since NPM has built-in support. You’ll need a Cloudflare API token with `Zone:DNS:Edit` permission
- **Request a wildcard cert** for `*.home.yourdomain.com` - NPM creates a TXT record via the API to prove ownership, Let’s Encrypt validates it, cert issued
- **In Pi-hole**, add local DNS records pointing `service.home.yourdomain.com` to your NPM IP
- Your browser hits `magic.home.yourdomain.com`, Pi-hole resolves it locally, NPM serves it with a valid cert

The cert renewal is automatic and nothing on your network needs to be publicly reachable.

### Option B: No public domain at all

Use [mkcert](https://github.com/FiloSottile/mkcert). It creates a local certificate authority and signs certs for whatever hostnames you want, including `magic.mirror` or any other local invention.

```bash
brew install mkcert
mkcert -install          # installs the CA into your OS trust store
mkcert magic.mirror      # generates a cert + key for that hostname
```

The downside: you need to install the CA certificate on every device that needs to trust it - each phone, tablet, laptop. For a one-person homelab that’s a one-time thing; for a household it gets annoying fast.

For most homelab setups I’d go with Option A if you have any public domain at hand. The DNS-01 approach with NPM and Cloudflare takes about 10 minutes once you have the API token, and you never have to touch trust stores again.

## Why This Setup Works

I use this setup on my homelab and it's made a huge difference. Instead of remembering IP addresses for every service, I just type something like `magic.mirror` in my browser and it works. The whole thing takes maybe 15 minutes to set up and makes your internal network feel way more polished.

---

**Reference Links**:

- [Pi-Hole Official Site](https://pi-hole.net/)

- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/)

- [MagicMirror Project](https://magicmirror.builders/)

- [Let’s Encrypt Challenge Types](https://letsencrypt.org/docs/challenge-types/)

- [mkcert - valid HTTPS certificates for local development](https://github.com/FiloSottile/mkcert)
