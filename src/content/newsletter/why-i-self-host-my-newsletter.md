---
title: 'Why I Self-Host My Newsletter'
date: 2026-10-13
slug: 'why-i-self-host-my-newsletter'
description: "Why my newsletter runs in my homelab, why I picked listmonk over Ghost, and what I haven't figured out about outgrowing a free email plan."
heroImage: '/images/newsletter/why-i-self-host-my-newsletter/header.webp'
heroAlt: "Header for Why I Self-Host My Newsletter from Works on My Machine, with the diagram of how the newsletter runs from joekarlsson.com through Cloudflare and listmonk in Joe's homelab to Brevo and your inbox"
---

In [the last issue](https://www.joekarlsson.com/newsletter/taste-matters-more-with-ai/) I promised to write up how I built this newsletter in my homelab. I'd been thinking about leaving Substack for a long time, and there had been problems with it for a while, but I wasn't posting much, so it was low priority. Now that I'm writing again, I started rethinking where I wanted the newsletter to live and how I wanted to manage it. My homelab has changed a lot since I started on Substack, so it felt like time to go, plus the Nazi problem.

## Why it runs at home

Part of my homelab journey has been taking back the pieces of the internet that big tech took over, and trying to understand how they work again. RSS feeds are one. Website development is another: the full stack, the deployment and keeping it maintainable, like with this website and this newsletter. Then there's email, an old tool that's been around forever. It's distributed, but the Outlooks, Gmails and Yahoos of the world have consolidated it and abstracted it away from me.

I think newsletters and RSS feeds are a remnant of the old web, and I think they're more valuable in this age of algorithms. So much is being taken out of my control in the algorithmic feeds that run every social platform I use. Following writers directly, subscribing to someone whose taste or opinion you respect, is something I'm trying to do more of myself. I want more control for everybody, more transparency, more freedom and more openness, and less of the sameness you get when algorithms sand down everyone's opinions.

It's also fun, and it cost me $0 extra a month, because [my homelab](https://www.joekarlsson.com/blog/homelab-two-years-later/) had the hard parts and the free plan from Brevo, an email sending service, does the sending. And I own the list. The 141 subscribers are in a Postgres database I control, so no publishing platform can take them, and I can be sure this platform will be Nazi-free.

## Picking listmonk over Ghost

When I looked at open source replacements for Substack, it came down to two options. [Ghost](https://ghost.org/) works a lot like Substack, with posts, members and paid subscriptions in one app. It tempted me. Its [social web feature](https://ghost.org/changelog/6/) lets people follow your posts from Bluesky, Mastodon and Threads, which is the closest thing I've seen to the Substack recommendation engine I liked, and paid subscriptions would be there if I ever wanted them.

But I don't have any paid subscribers, and I didn't want a second blog. My posts already live on joekarlsson.com next to everything else I write, so I only needed the email part. Self-hosted Ghost also [only sends newsletters through Mailgun](https://docs.ghost.org/newsletters/), and Brevo was already sending my Plex server's weekly newsletter.

So I went with [listmonk](https://listmonk.app/). It's a mailing list manager written in Go, backed by Postgres, and it sends through any SMTP relay you point it at, including Brevo.

![Comparison of Ghost and listmonk. Ghost is a whole publishing platform with a second blog inside it, sends only through Mailgun when self-hosted, has paid subscriptions through Stripe, and has a social web feature for following from Bluesky, Mastodon and Threads. listmonk is just the mailing list and the sending, keeps posts on joekarlsson.com, works with any SMTP relay like Brevo, and has no paid subscriptions or discovery.](/images/newsletter/why-i-self-host-my-newsletter/ghost-vs-listmonk.webp)

## How it's built

![Architecture diagram of how this newsletter is delivered. A signup on joekarlsson.com goes through a Cloudflare Tunnel with CrowdSec, then Nginx Proxy Manager, to listmonk and Postgres in one LXC container on Proxmox, built by OpenTofu and backed up to Proxmox Backup Server. Subscribers came from a Substack CSV export, and the admin UI is reachable only from the home network. listmonk sends over SMTP through Brevo's free plan, shared with Joe's critical alerts and Plex newsletter, to your inbox, and replies come back to Joe.](/images/newsletter/why-i-self-host-my-newsletter/architecture.webp)

I try to reduce my homelab's exposure to the outside world as much as humanly possible, so the newsletter doesn't open any ports on my home network. The signup form on joekarlsson.com posts to listmonk through a Cloudflare Tunnel. I already use Cloudflare for the rest of my homelab, so it was easy to expand that out to the newsletter. CrowdSec sits in front of the tunnel to block known bad traffic. Only the subscriber-facing pages are public, like subscribe, confirm, unsubscribe and the links inside each email.

I only learned recently that you can close off parts of an app so they're visible just on your own network. [Nginx Proxy Manager](https://www.joekarlsson.com/blog/adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole/) answers everything else with a 404, and the admin side only works from my home network. I use Tailscale to connect all my devices, so I can still manage it remotely and securely.

I put listmonk and its Postgres database together in one LXC container on [Proxmox](https://www.joekarlsson.com/blog/how-to-get-started-building-a-homelab-server-in-2024/). [OpenTofu builds it](https://www.joekarlsson.com/blog/opentofu-proxmox-immutable-homelab/) like most of the containers in my homelab, so I never change the container by hand and I can tear it down and rebuild it. The database, the one part a rebuild can't recreate, is backed up to Proxmox Backup Server.

The newsletter has health checks, but they never page me. My rule for alerts is whether I'd want to be woken up at 3 a.m. for it, and a newsletter outage doesn't make the cut. Every issue also goes up on [my newsletter page](https://www.joekarlsson.com/newsletter/) and in my RSS feed, so the email is only one way to read it.

## What I don't know yet

Email is still a bit of a mystery to me. It's an internet protocol I don't have much experience with. Right now, Brevo signs my mail with DKIM, but my DMARC policy is still in monitor mode, so mail servers aren't told to reject someone faking my address yet. I'll tighten it once I've checked the reports. I've also had some issues with testing and formatting, like new Outlook throwing out my email's stylesheet. If this issue went to your spam folder, or it isn't rendering well in your email client, please let me know. I'm still figuring this out.

I also gave up Substack's discovery, and I don't have a replacement for it. My blog has been getting a lot of traffic lately from my [homelab posts](https://www.joekarlsson.com/blog/category/homelab/), and a couple of subscribers have come from there, so my plan is to keep writing about what I'm working on and invite people to sign up if they're interested.

## Past 300 emails a day: Brevo or SES

Brevo's free plan sends 300 emails a day for my whole account, and that's shared with my homelab's critical alerts, my Plex newsletter and a couple of other services. 141 subscribers fits fine. Once the list gets close to 300, one issue could use up the day and an alert about a dead server wouldn't go out. When that happens, I see two options:

- **Brevo's paid Starter plan**, which [starts at $9 a month](https://www.brevo.com/pricing/) for 5,000 emails a month, with no daily sending limit. I wouldn't have to change anything in listmonk.
- **[Amazon SES](https://aws.amazon.com/ses/pricing/)**, at $0.10 per 1,000 emails on pay-as-you-go, or 3 cents an issue at 300 subscribers. Switching means a new SMTP login in listmonk and new DKIM records, and new SES accounts start in a sandbox until you ask AWS to let you send to real people.

![Diagram of where this newsletter goes next. It moved from Substack, where TL;DR in Tech lived, with 141 subscribers exported as a CSV, to listmonk in Joe's homelab sending through Brevo's free plan for $0 extra a month, 300 emails a day shared with critical alerts and a Plex newsletter. Once the list nears 300, the undecided next step is either Brevo Starter at $9 a month for 5,000 emails with no daily limit, or Amazon SES at $0.10 per 1,000 emails, about 3 cents an issue, which needs a new SMTP login, DKIM records and leaving the sandbox.](/images/newsletter/why-i-self-host-my-newsletter/path-forward.webp)

SES is cheaper, and Brevo doesn't need any changes. I don't know which one I'll pick yet. If you've sent a small list through SES or Brevo's paid plan, I'd like to hear which one you'd pick.
