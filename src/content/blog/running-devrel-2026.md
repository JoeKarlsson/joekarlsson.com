---
title: 'Running DevRel in 2026 Means Owning Three Discovery Surfaces'
date: 2026-04-21
updatedDate: 2026-10-12
slug: 'running-devrel-2026'
description: 'Running DevRel in 2026: developers find you through people, search, and LLMs. What breaks on each surface, how I measure it, and my first 90 days.'
categories: ['DevRel', 'Career']
tags:
  [
    'developer relations',
    'developer advocacy',
    'DevRel',
    'content strategy',
    'LLM discoverability',
    'GEO',
    'OSS',
    'Claude Code',
  ]
heroImage: '/images/blog/running-devrel-2026/hero.webp'
heroAlt: 'Halftone illustration of hands typing on a laptop with a terminal screen, on an orange background'
tldr: 'Developers find tools through three surfaces in 2026: other people, search crawlers, and LLM coding assistants like Claude Code and Cursor. Most DevRel programs only work the first. I spend my first 30 days auditing all three (site health, LLM presence, developer UX) before shipping any content, and I track leading indicators like star velocity, issue response time, and quarterly LLM mention rank, because downloads lag the work by months.'
faq:
  - question: 'What are the three discovery surfaces for developer tools?'
    answer: 'Human developers, search crawlers, and LLMs. Developers find you through community, content, and events. Search rewards technical site health: Core Web Vitals, clean redirects, internal linking. LLMs, especially IDE-native assistants like Claude Code and Cursor, often write code from what they learned in training, so your README, examples directory, and API reference are your marketing there. Most DevRel programs only work the first surface.'
  - question: 'What is the biggest mistake DevRel programs make in year one?'
    answer: "Skipping the audit. The instinct is to ship: start content, launch a community channel, go to a conference. Without a baseline of what's broken, you're optimizing blind. I spend the first 30 days on evidence (technical site health, LLM presence, developer UX) before deciding where to invest."
  - question: 'How do I get LLMs to recommend my developer tool?'
    answer: "You can't guarantee it, but you can improve your odds. Put well-structured, specific information where models learn from and look things up: your README, examples directory, API reference, Stack Overflow answers, dev.to posts, and HN threads. Specific claims get cited (benchmark numbers, concrete use cases, working examples) and marketing copy doesn't. Keep docs current and put a one-sentence definition of what your product does at the top of every key page."
  - question: 'Does llms.txt help developer tools show up in AI answers?'
    answer: 'Not reliably. As of October 2026 none of the major AI platforms have said they read llms.txt in their answer products, and server-log studies show their crawlers rarely request it. Some coding tools and docs platforms do use it. It takes about 10 minutes to add, so I treat it as cheap insurance, not a strategy.'
  - question: 'What should I do in my first 30 days as the DevRel hire?'
    answer: "Run a Developer Discoverability Audit across all three surfaces: technical SEO and site health, LLM presence, and developer UX. Go through the product as a stranger and time how long it takes to get a working result. Interview product, engineering, sales, and customer success. Build a baseline metrics snapshot. Don't ship content yet."
  - question: 'How do I show DevRel ROI before downloads start moving?'
    answer: 'Downloads are a lagging indicator. The leading indicators I find predictive are star velocity (week-over-week change, not the cumulative count), issue response time, and LLM mention rank tracked quarterly. Contributor metrics like PR merge rate show up in a lot of playbooks, but most companies I have worked with do not care about them. Agree on the indicators with leadership before you start, so they know what predicts the number they care about.'
  - question: 'Should DevRel give sales a list of developers from the community?'
    answer: 'No. Flag enterprise signals with context instead: which company, what they are asking, and why it sounds like a buying conversation. A raw name list makes the community feel watched, and the real questions stop.'
---

Most DevRel plans for the first 90 days come down to community, content, and events, with "developer experience" added if the author is sharp. That plan covers one of the three places developers find your tool. The other two are search crawlers and LLMs like Claude Code and Cursor, and in my experience that's where the damage is. I spend my first month auditing all three before I ship anything, and I measure each one differently.

I wrote about [developer advocacy in 2023](/blog/developer-advocacy-in-2023/) when layoffs made everyone ask what DevRel was for. Since then the job has picked up two surfaces the standard playbook still doesn't mention.

## Three discovery surfaces

For a long time I treated developer discoverability as one problem: write content, build community, go to conferences, and hope word spreads. Now I split it three ways, because each surface breaks differently and needs a different fix.

| Surface          | How discovery happens                           | What breaks                                                         | How to measure it                                        |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Human developers | Word of mouth, community, events                | Usually least broken                                                | Community activity, time to first value (TTFV) benchmark |
| Search crawlers  | Google indexing, technical SEO                  | Docs siloed from root domain, crawl errors, keyword cannibalization | Ahrefs organic, keyword positions, Core Web Vitals       |
| LLMs             | Training data, web lookups by coding assistants | Stale README, thin examples, no third-party presence                | Quarterly manual benchmark, AI referral traffic          |

DevRel has always owned the first one. The second usually belongs to marketing, who treat it as a content problem when it's mostly plumbing. Nobody owns the third.

## Surface one: human developers

Someone heard about you, found your docs, and tried the quickstart. Your job is to make that good enough that they stick around and tell someone else.

**Fix the quickstart before you write anything.** Time to first value is the number I care about most here: how long from landing on the homepage to having a working output. I time it myself, as a stranger, against two or three competitors with a stopwatch. If it's over 20 minutes, no content strategy makes up for it.

I also watch failed docs searches. Every query with zero results is a gap someone hit in the wild. When the same question keeps coming up in the community, that's a docs bug, not a support problem. The same goes for an error that keeps showing up in support tickets: it's almost always a product problem, and flagging that pattern to engineering is some of the best use of my time at this stage. Developers rarely complain before they leave. Something fails, the error message is useless, and they try a competitor.

The audience question matters too. Executives sign the contracts, so it's tempting to write for them. But executives almost never choose your tool directly. They go with what their technical team recommends, and the technical team goes with what developers trust. If you're writing "Why Real-Time Analytics Matters for Enterprise Teams" instead of docs that work and tutorials that run, you're writing for the wrong reader. Benchmark content that a tech lead can forward to their boss covers both.

Once the quickstart works, comparison posts are the first format I reach for. Not "us vs. them" marketing, but honest comparisons with numbers a developer can reproduce and share when they're right. I've had one comparison post stay in a company's top 10 for over a year with zero updates.

For community, I pick one or two channels and go deep. A Discord where someone answers within an hour beats five channels where nothing happens.

## Dev Zero and docs

The highest-impact thing I've done in DevRel, at every company, is showing up to roadmap discussions before decisions get made. I call it being [Dev Zero](/blog/devrel-as-dev-zero/): going through new features as a stranger before launch and finding the friction before developers in the wild do. Most companies don't set this up until they've shipped something that confused developers publicly, like an error message that makes no sense without internal context or an API that changed behavior with no deprecation notice. The public complaints are the visible part. The bigger cost is the developers who quietly churned and never came back.

Docs are where this matters most, and the work is fighting for how they get made, not writing them. The default at most companies is that docs happen after the feature ships, written by whoever has five minutes during a sprint where everyone is already on the next thing. Nobody files a ticket for documentation debt, so it piles up. I push for docs to be part of the feature spec and reviewed before launch. I also run Plausible on docs the same way I track a blog. A page with a high exit rate and short time on page is usually broken or confusing in a way nobody has named yet.

## Surface two: search

Search is mostly a plumbing problem. Not "write SEO content," but technical site health: Core Web Vitals on the docs site, redirect chains from a subdomain migration nobody cleaned up, the blog and docs competing for the same queries, and a docs subdomain building authority on its own instead of for the main domain (it usually is, and it shouldn't be).

The biggest ranking jumps I've seen didn't come from new content. They came from fixing what was already broken. One redirect chain cleanup sprint across 200+ pages moved keywords more than six months of publishing had. Orphan pages with zero internal links are invisible to Google, and adding contextual links from related posts changes their trajectory fast. Pages with lots of impressions and a low click-through rate recover well once they get structured data, specifically FAQPage schema on posts and TechArticle on docs.

At CloudQuery, where I ran DevRel, a three-month audit-first sprint produced 200 merged PRs across content and SEO fixes, organic traffic at an all-time high (Ahrefs estimated daily visits up 121% from the starting baseline), and 426 keywords in the top 10. "It asset management" went from position 43 to 7, and "cloud governance framework" went from 11 to 2. Trial signups rose 61% over the same period. That's one team over one quarter, so I treat it as a result, not a benchmark. I wrote up [the SEO side of that work](/blog/reversing-seo-traffic-decline-ai-overviews/) separately.

Then this came in from a customer on a first sales call:

> "It was a colleague of mine who stumbled upon a blog post that you guys had published and which was very well written. He's like, I think this thing might actually make sense for us."

That quote did more for the content budget than any dashboard I'd built, but I needed the dashboard to get the meeting.

One pattern to watch for in Google Search Console is impressions up, position up, and clicks flat. That's AI Overviews answering informational queries on the results page. The SEO work is fine; fewer people click through. Explain that distinction to leadership before you show them the numbers, or it looks like the program is stalling.

## Surface three: LLMs

When a developer opens Claude Code or Cursor and asks it to "add a real-time analytics layer to this application," the assistant usually doesn't go shopping for tools. It writes code, using whatever packages and APIs it learned about. If your SDK isn't well represented there, with accurate docs and clear usage patterns, it either skips you or uses you wrong, and the developer never knows there was a choice. When the assistant does look things up on the web, it lands on your docs and README, which is the same argument from the other direction.

So your README, examples directory, API reference, and SDK docs are your LLM marketing. Blog posts and conference talks matter much less here. A three-paragraph README with a stale quickstart gives the model nothing to work with. If your examples directory hasn't been touched since the last major release, you're teaching models to give wrong answers about you. Treat it as product work and put it on the engineering roadmap.

LLMs also use content differently than people or crawlers do. Specific claims get cited. Something like "ingestion latency under 50ms at 10M events per second on a 3-node cluster" (a made-up example) is a sentence a model can extract and repeat, and "our platform handles high-throughput streaming data" isn't. Every important page should have a few sentences that specific, plus a one-sentence definition of what the product does near the top. Third-party presence counts too: Stack Overflow answers, dev.to posts, and HN threads all end up in training data. Answering a developer's question well in public is community work and corpus work at the same time. I built [a blog skill that bakes these checks into my writing workflow](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/) so I don't skip them.

Measuring this surface is mostly unsolved. I still have no reliable way to see how often a product shows up in AI answers or in what context. My best proxy is a quarterly manual benchmark: prompt ChatGPT, Claude, Gemini, and Perplexity with the queries your target users would type, and write down where you appear, how you're described, and who shows up instead.

AI referral traffic is measurable, though the counts run low. Plausible groups ChatGPT, Perplexity, Claude, and others into an AI channel, and in GA4 you'll want a custom channel group on those referrer domains. Some assistants often send no referrer at all, so treat the number as a floor. In my own reporting it's been 1-2% of total traffic, but at companies with well-structured docs I've seen AI-sourced visits grow 50-60% month over month. Set up the tracking now so you have a baseline before it gets big.

As for `llms.txt`: as of October 2026, none of the major AI platforms have said they read it in their answer products, and server-log studies show their crawlers rarely request it. Some coding tools and docs platforms do use it. It takes 10 minutes, so I add it, but accurate docs for it to point at matter far more.

## Metrics that predict downloads

When DevRel struggles to get headcount or leadership attention, it's almost never because the work is bad. It's because the work isn't connected to anything leadership already cares about. In the [State of Developer Relations 2024 report](https://www.stateofdeveloperrelations.com/2024devrelreport), 60.7% of respondents named proving impact with data and metrics as their top challenge, so most people in this role know the problem already.

The first time I brought a dashboard to a leadership review instead of a list of things I'd done, the conversation changed. A dashboard forces you to make claims that can be checked, and checked claims build credibility faster than storytelling. Later I [got CRM access and tied my content to conversions](/blog/proving-my-work-mattered/), which changed my 1:1s more than anything else I've done.

[Tessa Kriesel's DevRel playbook](https://www.builtfor.dev/blog/devrel-playbook) at builtfor.dev is the framework I lean on for structure. It maps the developer journey to five stages (Discover, Evaluate, Learn, Build, Scale) and argues that DevRel is a revenue function, not a marketing expense. Its most useful move is forcing you to ask which stage is broken before you decide what to build, instead of counting tutorials published and events attended.

For open source tools, downloads are the lagging indicator. These are the leading indicators I track:

| Metric                                         | Why I care about it                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| Star velocity (W/W delta, not cumulative)      | A flat cumulative count looks fine until you notice stars per week dropped 40%       |
| Issue response time and time to first response | Developers notice slow first responses on issues and stop trusting the project early |
| LLM mention rank (quarterly)                   | Still early, but I want a baseline before everyone else starts measuring it          |

I've seen contributor count, PR merge rate, and fork-to-contributor conversion pushed as leading indicators in a lot of DevRel playbooks. Most companies I've worked with don't care about them, and in my experience they're closer to vanity metrics than predictive signals. Issue response time is the one that matters in practice.

I frame these to leadership the same way every time: downloads are the number we're trying to move, and these are the numbers that move first. My rule of thumb is a lead of about two to three months. If they trend right and downloads lag, the program is working and the cycle is long. Agree on that framing before you start and write it down.

## The first 90 days

The most common mistake when you're the first DevRel hire is doing too much too fast: a newsletter, a conference talk proposal, a content calendar. Before you invest in any channel, find out what's broken.

### Days 1-30: the Developer Discoverability Audit

I spend the first 30 days auditing, and the audit has one part per surface.

**Developer UX (humans).** Go through the product as a stranger, with no internal Slack and no engineer sitting next to you. Time the quickstart. Does it work on an M-series Mac? On Windows? In Docker? Can every code snippet be copied and run without changes? When something goes wrong, are the errors searchable, and do they tell you what to do next?

**Technical site health (search).** Check every subdomain: docs, blog, app, changelog, API reference. Look at Core Web Vitals, robots.txt, internal links, redirect chains, keyword cannibalization between blog and docs, and missing structured data. I use [Ahrefs](https://ahrefs.com/pricing) (Lite starts at $129/month), and one indexing bug found pays for a year of it. If budget is tight, [Screaming Frog's free tier](https://www.screamingfrog.co.uk/seo-spider/pricing/) crawls up to 500 URLs. Run a content gap analysis against two or three competitors; what they rank for and you don't becomes your content list.

**LLM presence.** Run the first quarterly benchmark described above. Type in your target users' real queries, like "best tool for real-time analytics on streaming data" or "compare [your product] vs [competitor]." Document where you appear, what the model gets wrong about you, and where competitors show up instead. Then read your README and examples directory the way a model would.

The deliverable is a "State of Developer Experience" brief: a prioritized list of what's broken, with severity ratings and data behind each item. It's not a content plan. It's evidence specific enough that engineering and product can act on it. Showing up to the first roadmap meeting with "here are six indexing bugs and three quickstart gaps to fix before we spend more on content" lands differently from "I've been thinking about some content ideas."

I've run this plan as the first DevRel hire on small teams. At a company that already has a DevRel team, I'd expect the first month to look different.

### Days 31-90: fix, ship, measure

Fix the highest-priority gaps from the audit. Some of that needs engineering, so file the tickets and follow up until they're closed. Ship your first two or three content pieces: benchmark content or integration tutorials that target queries with real search volume. Not a product announcement, and not a thought leadership post about the future of the industry. Don't wait for them to be perfect, either; I wrote about why in [Ship the Ugly Pot](/blog/ship-the-ugly-pot/).

Set up tracking early: UTM attribution, the download-to-signup funnel, community metrics. It's tedious, and you'll be glad you did it by month four. I automate as much of it as I can. I built a [Claude Code skill for weekly SEO analysis](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/) that pulls Google Search Console, Ahrefs, and Plausible together, compares against last week's snapshot, and shows what moved. What took an afternoon takes ten minutes, so I run it weekly instead of monthly and catch problems sooner. The same goes for community reports. If "who's active, from which company" is a thirty-minute manual job, it doesn't happen.

By day 90, check whether what you shipped moved anything, present it to leadership with data (including what didn't work), and draft a six-month roadmap. At 90 days I want a working measurement layer, evidence of what's working, and a credible hypothesis about what to do next.

## Working with sales

I've worked at several developer-first companies, and this tension showed up at all of them. It comes from how the teams are set up, not from the people.

The obvious version is that sales wants names from Discord: who's active, who might be enterprise-ready, who's asking questions that sound like buying signals. Hand over a list and you've poisoned the well. Developers feel the room shift, stop asking real questions, and the community goes quiet in exactly the ways that made it valuable.

Attribution is the second version. A developer who was active in your community for months closes a deal, sales gets 100% of the credit, and DevRel gets none. Your budget depends on showing what you contribute to revenue, so if every community-influenced deal disappears into sales attribution, you can't make the case for the next hire.

The third one creeps up on you, and it usually happens because you're succeeding. Custom demo requests, architecture calls for prospects, "can you just jump on this one call." Fine once, fine twice. Six months later you're doing pre-sales for individual deals instead of building things that help a thousand developers at once, and the community has gone quiet while you were in deal cycles.

![Mother Ignoring Kid Drowning In A Pool meme: a mother labeled "DevRel" happily plays with a child labeled "Custom demo for one prospect" while a kid labeled "The community" struggles in the water; in the bottom panel, a skeleton at the bottom of the pool is labeled "The community, six months later"](/images/blog/running-devrel-2026/meme-mother-ignoring.webp)

What works for me is owning the signal-passing on my own terms. Instead of waiting for sales to ask for a list, I flag enterprise signals with context when I see them: "Three engineers from Acme Corp have been asking about HA configuration this week," or someone asking how the product handles 50 billion events per day. Sales gets the company name, what they're asking, and why it sounds like a buying conversation. Nobody in the community feels surveilled.

UTM and first-touch attribution from day one fixes most of the attribution problem. If a developer's first interaction was a Stack Overflow answer six months before they signed, that belongs in the CRM. When you can trace a closed deal back to something you built, the credit conversation gets a lot easier.

## How DevRel programs die

### No metrics defined up front

This is the most common one. You spend the first 90 days writing content, going to an event, and building community presence. At the check-in, someone asks what the impact has been, and you don't have a clean answer because you never defined "working." Leadership loses confidence and the program gets starved or cut. Agree on the leading indicators before you start, with the reasoning written down.

### Wrong problem diagnosis

![Woman Yelling At Cat meme: the yelling woman is captioned "Leadership: why isn't DevRel fixing our awareness problem?!" and the unbothered cat at the dinner table is captioned "The quickstart that fails on Windows"](/images/blog/running-devrel-2026/meme-yelling-cat.webp)

A company has a developer experience problem. The quickstart fails on half the platforms their developers use, the APIs are confusing, and the error messages are useless without internal context. They hire DevRel to fix "awareness," and the job description asks for someone to ship tutorials and grow a Discord. You write great content about a product that frustrates developers, nothing converts, and six months later you get the blame for flat adoption. The first hire should be someone who can run the diagnosis: read crawl data, time the quickstart as a stranger, and earn enough credibility with engineering to get the findings fixed. This failure is hard to see from outside before you join, which is what the question at the end of this post is for.

### Scope creep

Founding DevRel means you own everything that doesn't obviously belong to someone else: SEO, docs, social, event logistics, sometimes customer success. Nobody assigns it to you maliciously; it's what happens on small teams. Within a year you're doing five jobs, none of them well. Define your scope, write it down, and revisit it quarterly. That means saying no to things that feel important while you're still trying to prove the function's value, which is the hard part.

## Content, product, or distribution problem?

Before investing in the next phase of a DevRel program, or before taking a new role, ask this:

_"What's the biggest thing between where your developer adoption is today and where you want it to be, and is it a content problem, a product problem, or a distribution problem?"_

These need completely different fixes. A content problem means developers can't find or don't understand a good product. A product problem means the developer experience is broken, and no amount of content fixes a quickstart that doesn't work. A distribution problem means you're missing one of the three surfaces: the docs have no search presence, the README gives LLMs nothing to work with, or you have 50 GitHub stars and no third-party presence anywhere. You should be able to say which surface.

The teams I've seen struggle treat all three as one and apply one fix, "write more content." A company with a product problem that hires DevRel to produce tutorials will spend the money and then conclude DevRel doesn't work.

The answer tells you most of what you need to know. If it's clearly a product problem but leadership thinks it's a content problem, you'll spend two years writing into a void. If they can name the right problem specifically enough that you'd know how to start, that's a role worth taking. If they can't answer at all, helping them work out the answer is the best thing you can do in your first 30 days.

## Sources and further reading

- [The builtfor.dev DevRel Playbook](https://www.builtfor.dev/blog/devrel-playbook) by Tessa Kriesel - the Discover/Evaluate/Learn/Build/Scale framework and the "DevRel is a revenue function" thesis
- [DevRel Metrics and Why They Matter](https://thefalc.com/2020/12/devrel-metrics-and-why-they-matter/) by Sean Falconer - North Star metrics and how to connect DevRel activity to business outcomes
- [Developer Relations at GitLab: What We've Learned](https://web.archive.org/web/20250614065339/https://about.gitlab.com/blog/2024/03/13/developer-relations-at-gitlab-what-weve-learned-since-our-start/) by John Coghlan - five years of evolving a DevRel program through attention, active users, and revenue phases
- [The Future of DevRel: Six Shifts Reshaping Developer Engagement in 2026](https://blog.stateshift.com/future-of-devrel-2026/) by Mindy Faieta at Stateshift - where the industry is heading, especially LLM discovery and time to value
- [State of Developer Relations 2024](https://www.stateofdeveloperrelations.com/2024devrelreport) - source of the 60.7% "proving impact with data" figure

If you're running a DevRel program, or making the case for one to skeptical leadership, I'm always up for comparing notes. The LLM surface especially is early, and the most useful conversations I have are with people running the experiment. Find me on [Bluesky](https://bsky.app/profile/joekarlsson.com) or [LinkedIn](https://www.linkedin.com/in/joekarlsson/).
