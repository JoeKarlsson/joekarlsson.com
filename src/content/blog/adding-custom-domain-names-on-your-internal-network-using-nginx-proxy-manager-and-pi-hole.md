---
title: 'Adding Custom Domain Names on Your Internal Network Using Nginx Proxy Manager and Pi-Hole'
seoTitle: 'Local Domains with Nginx Proxy Manager'
shareTitle: 'Custom Domain Names on Your Home Network with Nginx Proxy Manager and Pi-Hole'
date: 2024-01-17
slug: 'adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole'
description: 'How I set up custom domain names on my internal network with Pi-Hole for DNS and Nginx Proxy Manager, plus what works for SSL on local-only domains.'
categories: ['Homelab']
heroImage: '/images/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/thumb-0cabecaf.webp'
heroAlt: 'Postal workers sorting a cart of mail sacks'
tldr: "I got tired of typing IP addresses, so I set up Pi-hole for local DNS and Nginx Proxy Manager for routing. Let's Encrypt won't sign a made-up name like magic.mirror, so for HTTPS use a DNS-01 wildcard cert on a domain you own, or mkcert if you don't. DNS and routing take about 15 minutes."
updatedDate: 2026-09-22
corrections:
  - date: 2026-09-22
    note: "Step 3 told you to get a Let's Encrypt certificate for `magic.mirror`. Let's Encrypt only signs real public domains, so that couldn't work. Step 3 now uses a DNS-01 wildcard on a domain you own, or mkcert."
---

**Update (September 2026):** A reader pointed out that my original SSL steps couldn't work, and they're right. I've rewritten Step 3; Steps 1 and 2 are unchanged.

---

I got tired of typing IP addresses to access services on my homelab, so I set up custom domain names on my internal network. If you don't have a homelab yet, check out my guide on [how to get started building a homelab server](/blog/how-to-get-started-building-a-homelab-server/) first. I use [Pi-hole](https://pi-hole.net/) for local DNS and [Nginx Proxy Manager](https://nginxproxymanager.com/) to route requests and handle certificates.

![How a custom local domain resolves. The browser asks Pi-hole where magic.mirror is, and Pi-hole's local DNS record answers with Nginx Proxy Manager's IP. The browser sends its request for magic.mirror to Nginx Proxy Manager, whose proxy host forwards it to the IP of the server running Magic Mirror, and the page comes back the same way.](/images/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/request-flow.svg)

## Step 1: Add a local DNS record in Pi-hole

Pi-hole is best known for ad blocking, but it's also a local DNS server. To set a custom domain:

1. Log into the Pi-hole admin page.
2. Go to Settings > Local DNS Records.
3. Enter your custom domain (such as `magic.mirror`) and the IP address of your Nginx Proxy Manager server. The domain doesn't need to be registered or use a real top-level domain (TLD), but Let's Encrypt won't issue a certificate for it (see Step 3).

## Step 2: Add a proxy host in Nginx Proxy Manager

Next, I configured Nginx Proxy Manager to forward requests for the custom domain:

1. Open the Nginx Proxy Manager admin interface.
2. Go to Proxy Hosts, click Add Proxy Host, and enter the custom domain you set in Pi-hole (such as `magic.mirror`).
3. Under Forward Hostname / IP, enter the IP address of the server running the service (such as your MagicMirror server), and its port (MagicMirror defaults to 8080).
4. Optionally, turn on Cache Assets for speed and Block Common Exploits for security.

## Step 3: HTTPS certificates

Let's Encrypt can't issue a certificate for a made-up TLD like `.mirror` - it validates against the [public suffix list](https://publicsuffix.org/), and `magic.mirror` isn't on it. You'll get a hard error before any challenge is even attempted. Skipping the reachability test doesn't fix this.

There are two real approaches depending on whether you own a public domain:

![Two ways to get a certificate browsers trust on a local domain. If you own a public domain: Nginx Proxy Manager uses a Cloudflare API token to add a TXT record, Let's Encrypt checks that record with the DNS-01 challenge and issues a wildcard certificate for *.home.yourdomain.com, which renews itself and is trusted by every browser. With no public domain: mkcert -install creates a local certificate authority in your trust store, mkcert magic.mirror signs a cert and key for that name, and the CA has to be installed by hand on every phone, tablet and laptop. Let's Encrypt won't sign magic.mirror because .mirror isn't a public suffix.](/images/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/certificates.svg)

### Option A: You own a public domain (recommended)

If you have a real domain - even a cheap one - this is the cleanest path. Get a wildcard Let's Encrypt cert for something like `*.home.yourdomain.com` using the DNS-01 challenge, then use Pi-hole to point those subdomains at your local NPM. Traffic stays on your LAN, but browsers trust the cert.

- **In NPM**, when adding SSL to a host, choose "Let's Encrypt" and switch the challenge to **DNS**
- **Choose your DNS provider** - Cloudflare is the easiest since NPM has built-in support. You'll need a Cloudflare API token with `Zone:DNS:Edit` permission
- **Request a wildcard cert** for `*.home.yourdomain.com` - NPM creates a TXT record via the API to prove ownership, Let's Encrypt validates it, cert issued
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

In NPM, go to Certificates > Add Certificate > Custom Certificate and upload `magic.mirror.pem` and `magic.mirror-key.pem`, then choose that certificate in the proxy host's SSL settings.

You need to install the CA certificate on every device that needs to trust it - each phone, tablet, laptop. For a one-person homelab that's a one-time thing; for a household it gets annoying fast.

For most homelab setups I'd go with Option A if you have any public domain at hand. The DNS-01 approach with NPM and Cloudflare takes about 10 minutes once you have the API token, and you never have to touch trust stores again.

---

**Reference Links**:

- [Pi-Hole Official Site](https://pi-hole.net/)

- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/)

- [MagicMirror Project](https://magicmirror.builders/)

- [Let's Encrypt Challenge Types](https://letsencrypt.org/docs/challenge-types/)

- [mkcert - valid HTTPS certificates for local development](https://github.com/FiloSottile/mkcert)
