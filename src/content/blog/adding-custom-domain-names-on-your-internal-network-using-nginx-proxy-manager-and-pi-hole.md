---
title: "Adding Custom Domain Names on Your Internal Network Using Nginx Proxy Manager and Pi-Hole"
date: 2024-01-17
slug: "adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole"
description: "Creating custom domain names within your internal network can streamline access to locally hosted services without the need for public domain registration. This guide explains how to set up custom..."
categories: ["Blog"]
heroImage: "/images/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/d4994649-ee18-4d47-aaa7-567b58bb9f39.webp"
---

Creating custom domain names within your internal network can streamline access to locally hosted services without the need for public domain registration. This guide explains how to set up custom domain names using [Pi-Hole](https://pi-hole.net/) for DNS management and [Nginx Proxy Manager](https://nginxproxymanager.com/) for web traffic control and SSL encryption.

## Step 1: Configuring Pi Hole for Custom Domain

Pi-Hole, primarily known for ad-blocking, also serves as a local DNS server. To set a custom domain:

- **Access Pi-Hole**: Log into the Pi-Hole administrative interface.

- **Navigate to Local DNS**: Select ‘Local DNS’ from the menu, then ‘DNS Records’.

- **Add Custom Domain**: Enter your desired custom domain name (e.g., `magic.mirror`) and the IP address of your NGINX Proxy Manager server. Remember, this domain doesn’t need to be a registered one or have a valid top-level domain (TLD).

## Step 2: Configuring NGINX Proxy Manager

Next, configure the NGINX Proxy Manager to recognize and forward requests for your custom domain:

- **Access NGINX Proxy Manager**: Open the NGINX Proxy Manager interface.

- **Add New Host**: Click on ‘Add New Host’ and enter the custom domain you set in Pi Hole (e.g., `magic.mirror`).

- **Set Forward Hostname**: Under ‘Forward Hostname / IP’, enter the IP address of the server hosting the service (e.g., your Magic Mirror server).

- **Enable Options** (Optional): You may enable ‘Cache Assets’ for improved performance and ‘Block Common Exploits’ for added security.

## Step 3: SSL Encryption with Let’s Encrypt

Securing your internal traffic with SSL:

- **Select SSL**: In the NGINX Proxy Manager, while setting up the host, choose to add an SSL certificate.

- **Use Let’s Encrypt**: Opt for a free certificate from Let’s Encrypt.

- **Avoid Server Reachability Test**: Do not click ‘Test Server Reachability’ since the service isn’t accessible externally. This doesn’t impede the SSL setup for internal use.

## Conclusion

By following these steps, you can create a streamlined, secure internal network with custom domain names, enhancing the accessibility and security of local services like the Magic Mirror.

---

**Reference Links**:

- Pi Hole Official Site: [https://pi-hole.net/](https://pi-hole.net/)

- NGINX Proxy Manager Official Documentation: [https://nginxproxymanager.com/](https://nginxproxymanager.com/)

- Magic Mirror Project: [https://magicmirror.builders/](https://magicmirror.builders/)

- Let’s Encrypt: [https://letsencrypt.org/](https://letsencrypt.org/)
