---
title: 'Taste Matters More with AI'
date: 2026-10-12
slug: 'taste-matters-more-with-ai'
description: "The newsletter is back after almost three years, it runs in my homelab now, and it's going to be about what I actually think about. First up, taste."
heroImage: '/images/newsletter/taste-matters-more-with-ai/header.webp'
heroAlt: "Header for Taste Matters More with AI from Works on My Machine, with a photo of Joe gluing a jack-o'-lantern collage onto red paper"
---

This newsletter used to be TL;DR in Tech, a weekly roundup of the links I was reading, until I quit sending it. I'd stopped feeling the pull to make things online. The rise of AI made sharing links feel a lot less valuable, and I'd been laid off, which really hurt my confidence. Posting my thoughts on the internet started to feel silly.

I've gotten [some wins](https://www.joekarlsson.com/blog/reversing-seo-traffic-decline-ai-overviews/) under my belt since then, and I feel confident and sure of myself again. A couple of months ago I picked up Julia Cameron's [The Artist's Way](https://juliacameronlive.com/book/the-artists-way-a-spiritual-path-to-higher-creativity/) and started doing the morning pages: one to three pages of whatever's in my head before the workday starts. Unfortunately, I have to report that journaling is incredibly useful. I'm someone who thinks about the same stuff over and over, and dumping it onto the page lets me stop thinking about it and focus on real work. I also catch what's bothering me at work or at home a lot sooner, before it turns into a bigger problem. And I've started painting and making collages.

![Joe's hand holding a copy of The Artist's Way by Julia Cameron, 30th anniversary edition, in his living room](/images/newsletter/taste-matters-more-with-ai/artists-way.webp)

I've been feeling creatively inspired again and wanted an outlet for all of it, so I'm bringing this newsletter back as **Works on My Machine**. Instead of a link roundup, it'll be about AI, the tech market, writing, open source and whatever I'm building in my homelab, whenever I have something to say. If you signed up for the links and this isn't for you, the unsubscribe link is at the bottom.

## Taste matters more with AI

Models can turn out competent writing and code on demand now, and so much of it comes out sanded down to the same average. I've been seeing a lot more of that slop in my feeds lately, and the stuff that stands out to me is the stuff where someone with taste made the calls. I think taste is going to be one of the things that matters most in the AI era.

Painting is where I started to understand that, and Paul Graham got there the same way. His 2021 essay [Is There Such a Thing as Good Taste?](https://www.paulgraham.com/goodtaste.html) starts with his dad telling him there wasn't. Graham's case is that if taste isn't real, good art isn't real either, so you couldn't even say a painter is better than a randomly chosen eight-year-old. He worked this out by taking up painting himself and seeing how far his paintings were from Bellini's. He doesn't claim anyone has perfect taste. He calls it a partial order, so some people's is clearly better than others', and you can get better at it.

![Two photos from above. Left: Joe gluing a collage of a jack-o'-lantern, a black cat and a wheat field onto red paper, surrounded by markers and glue jars. Right: Joe sketching in pink watercolor at a marble cafe table next to a paint palette and a plate of oysters.](/images/newsletter/taste-matters-more-with-ai/art.webp)

Callum Flack's 2018 essay [The matter of taste](https://www.callum.website/the-matter-of-taste) goes further. He defines taste as knowhow you've built up for so long that it shows up as a feeling. You've made the same small decisions so many times that you skip over them and go straight to the hard part of the problem. He uses the German word _fingerspitzengefühl_ for it, which means fingertip feeling.

Painting runs mostly on that feeling for me. I'm going by what feels right and looks right, and I'm usually trying to push a piece further. A lot of the time I keep going until I overwork it, just to find out where the limit is. There's a lot of fear in painting that one more pass will ruin a piece, but crossing that line is how I've learned where it is and what works.

I think a lot of technical work runs on the same feeling. What makes a good PR description, a solid demo, or an app or output that's actually good is a matter of taste. Flack says we tend to distrust anything we can't put into words, and tech leans hard that way.

Taste is a big part of my job right now. I started at CData in June, where I work in developer marketing and I'm the only engineer on the marketing team. Part of the job is being the voice of the developers and technical builders who use our product, and my instincts are often different from the rest of my team's. Mine always push toward content that's genuinely helpful.

AI moves fast and there are a lot of shiny things out there, so we have to be smart about what we build and prioritize, and about how we track it. I push to treat everything as an experiment and to move faster instead of doing things the way we've always done them, because our product keeps changing, and so do our customers and what they need. A lot of the time I'm the one describing what the industry looks like: who's building what, what they care about, and when something is ready to talk about.

Flack also made me notice that taste at work has to be shared. When I paint, I'm the only one deciding, but on a team my instincts only matter if other people pick them up. He calls that _scenius_, Brian Eno's word for the genius of a whole scene.

At my last job, people had picked mine up. I wrote in [What I Learned Running DevRel in 2026](https://www.joekarlsson.com/blog/running-devrel-2026/) about how my DevRel work there pushed our organic traffic to an all-time high, and by the end I had buy-in from the CEO, marketing, engineering and sales. At CData I'm starting over from scratch. So I'm saying what I think in meetings even when I'm nervous, and I'm writing about it more, because the influence I build outside the company is how I'll get eyeballs and trust on the work I do inside it. Everything I'm doing right now is about driving trust and buy-in for my vision.

## Why I left Substack for my homelab

I left Substack partly over its content policy. I liked its recommendation engine, but Substack hosts Nazi newsletters, and I think that's weird. In 2023 Jonathan M. Katz reported in The Atlantic that [Substack Has a Nazi Problem](https://www.theatlantic.com/ideas/archive/2023/11/substack-extremism-nazi-white-supremacy-newsletters/676156/), and co-founder Hamish McKenzie answered that the company [wouldn't remove or demonetize Nazi content](https://www.theverge.com/2023/12/21/24011232/substack-nazi-moderation-demonetization-hamish-mckenzie) because it didn't think censorship makes the problem go away. A few weeks later Substack [said it would remove several Nazi publications](https://www.platformer.news/substack-says-it-will-remove-nazi/) that Platformer had flagged, saying they broke its rules against inciting violence. In 2025 Taylor Lorenz reported that [Substack sent a push alert promoting a Nazi blog](https://www.usermag.co/p/substack-sent-a-push-alert-promoting-nazi-white-supremacist-blog) to its users, which the company called an error. In February 2026 the Guardian found that Substack [makes money from hosting Nazi newsletters](https://www.theguardian.com/media/2026/feb/07/revealed-how-substack-makes-money-from-hosting-nazi-newsletters) by taking a cut of their paid subscriptions.

I've also been on a mission to self-host as much as I can, and it turns out hosting your own newsletter isn't that hard. It runs on [listmonk](https://listmonk.app/), an open source newsletter manager, in a container in my homelab next to about 70 other services. I exported the 141 subscribers from Substack as a CSV, imported them, and Brevo's free plan does the actual sending.

![Architecture diagram of how this newsletter is delivered. A signup on joekarlsson.com goes through a Cloudflare Tunnel with CrowdSec, then Nginx Proxy Manager, to listmonk and Postgres in one LXC container on Proxmox, built by OpenTofu and backed up to Proxmox Backup Server. Subscribers came from a Substack CSV export, and the admin UI is reachable only from the home network. listmonk sends over SMTP through Brevo's free plan to your inbox, and replies come back to Joe.](/images/newsletter/taste-matters-more-with-ai/architecture.webp)

The newsletter doesn't open any ports on my home network. A Cloudflare Tunnel brings the subscribe, confirm and unsubscribe pages in, and the admin side and its API answer with a 404 from outside my house. The container is built by OpenTofu, so I can tear it down and rebuild it, and the subscriber database is backed up to Proxmox Backup Server. Brevo's 300 emails a day are shared with my homelab's alerts and a couple of other services, which is plenty for 141 people.

I'll write up the whole build in a future issue, including the part where new Outlook threw out my email's stylesheet.

## Further reading

- [How to be a wise optimist about science and technology?](https://michaelnotebook.com/optimism/) by Michael Nielsen: I keep rereading this because I use AI every day. I'm optimistic about the open models I can run on my own hardware, but I've watched tech start open and then get more expensive and worse once everyone depends on it. This is the essay I go back to when I'm trying to square the two.
- [John Maeda on Creativity, AI, and the Human Pursuit of Uphill Thinking](https://www.figma.com/blog/uphill-thinking/) by John Maeda: AI takes the shortest, most expected path, and people take the long way on purpose. That's pretty close to how I split my own work now. The drudgery goes to AI. Code, videos and writing are the uphill parts, and there AI helps me outline and pokes holes in my argument, but the bulk of the work is mine.
