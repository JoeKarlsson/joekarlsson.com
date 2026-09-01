---
title: 'What I Learned Running DevRel in 2026'
date: 2026-04-21
slug: 'running-devrel-2026'
description: 'Lessons from running DevRel in 2026: why data gets you buy-in, why LLMs are a third distribution surface, and what I actually do in the first 90 days.'
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
tldr: 'The DevRel job description is three years out of date. In 2026 there are three distribution surfaces to own, not one: human developers, search crawlers, and LLMs. Each breaks differently. Data is how you get leadership buy-in - not because executives love dashboards, but because leading indicators tell a story before downloads start moving. And the first 30 days should be an audit, not a content calendar.'
faq:
  - question: 'What is the biggest mistake DevRel programs make in year one?'
    answer: "Skipping the audit. The instinct is to ship - start content, launch a community channel, go to a conference. But without a baseline of what's actually broken, you're optimizing blind. The programs that compound are the ones that spend the first 30 days on evidence - technical site health, LLM presence, developer UX - before deciding where to invest."
  - question: 'How do I get LLMs to actually recommend my developer tool?'
    answer: "You can't control the training corpus directly. But you can put well-structured information in the places LLMs reliably pull from: your README, your examples directory, your API reference, Stack Overflow answers, dev.to posts, HN threads. Factual and specific content gets cited - benchmark numbers, concrete use cases, real working examples. Marketing copy doesn't. Keep docs current, write self-contained prose rather than fragmented reference docs, and put a clear one-sentence definition of what your product does at the top of every key page."
  - question: 'What should I actually do in my first 30 days as the DevRel hire?'
    answer: "Run a Developer Discoverability Audit - technical SEO and site health, LLM discoverability, and developer UX. Go through the product as a complete stranger and measure time to first value. Interview product, eng, sales, and CS. Build a baseline metrics snapshot. Do NOT ship content yet - you need evidence of what's broken before you decide what to build."
  - question: 'How do I show DevRel ROI before downloads start moving?'
    answer: 'Downloads are a lagging indicator. The leading indicators I actually find predictive: star velocity (week-over-week delta, not cumulative), issue response time (developers vote with their feet on this one), and LLM mention rank tracked quarterly. Contributor metrics like PR merge rate and fork-to-contributor conversion show up in a lot of playbooks but in practice most companies do not care about them - they are closer to vanity metrics than predictive signals. Define the ones you do track up front with leadership so they understand what predicts the number they care about.'
---

Ask ten DevRel candidates what they'd focus on in the first 90 days. Community, content, events - in some order, with "developer experience" added if they're sharp. Every time. None of it is wrong. It's just describing one distribution surface out of three, while the other two sit broken and nobody's talking about them.

The traditional scope is real work that still matters. But it was written for a world where developers found your tool through word of mouth and search. In 2026 there's a third surface - LLMs, specifically IDE-native AI like Claude Code and Cursor - and the first two are both broken in ways the standard playbook doesn't cover.

This is what I've actually been working through. What changed my approach, what moved the metrics, and what I'd do differently.

## The mental model I had to unlearn

For a long time I thought about developer discoverability as one problem. Developers need to find us. So you write content, build community, go to conferences, and hope word spreads. That's not wrong. It's just incomplete.

There are three distinct surfaces where developers encounter your tool - and most DevRel programs own one of them well and ignore the other two.

| Surface          | How discovery happens                            | What breaks                                                         | How to measure it                                  |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------- |
| Human developers | Word of mouth, community, events                 | Usually least broken                                                | Community activity, TTFV benchmark                 |
| Search crawlers  | Google indexing, technical SEO                   | Docs siloed from root domain, crawl errors, keyword cannibalization | Ahrefs organic, keyword positions, Core Web Vitals |
| LLMs             | Training corpus: GitHub, docs, third-party sites | Stale README, thin examples, no third-party presence                | Quarterly manual benchmark, AI referral traffic    |

**Surface one is human developers.** Someone searched for something, found your docs, tried the quickstart. Your job is to make that experience good enough that they stick around and tell someone else. Community, content, events, and the [Dev Zero approach to product testing](/blog/devrel-as-dev-zero/) all serve this surface. This is the one DevRel has always owned.

**Surface two is search.** Not "write SEO content" - actual technical site health. Core Web Vitals on the docs site. Whether your docs subdomain is building domain authority independently from your main site (it is, and it shouldn't be). Redirect chains from that subdomain migration that nobody cleaned up. Keyword cannibalization between your blog and your docs both targeting the same queries. I've written about this in depth because [it turned out to matter a lot more than I expected](/blog/reversing-seo-traffic-decline-ai-overviews/) - fixing technical site health moved our metrics faster than any content I'd written.

**Surface three is LLMs.** And this one is genuinely different.

When a developer opens Claude Code or Cursor and asks "add a real-time analytics layer to this application," the AI doesn't search for tools to recommend. It writes code. It reaches into its training data and produces an implementation using whatever packages and APIs it learned from. If your SDK isn't represented there - with accurate documentation and clear usage patterns - the AI either ignores you or uses you incorrectly. And the developer may never know there was a choice.

![Distracted Boyfriend meme: the boyfriend labeled "developers using Claude Code to build from scratch" turns away from his girlfriend labeled "your product's SDK docs"](/images/blog/running-devrel-2026/meme-claude-code.webp)

In search, a developer is actively looking for a tool. In an AI coding assistant, the AI is solving a problem directly. It's not shopping. You have to already be there.

The practical implication is that your README, your examples directory, your API reference, and your SDK docs are your LLM marketing. Not your blog posts. Not your conference talks. If your examples directory hasn't been updated since your last major release and your README is still three paragraphs, you're training models to give wrong answers about you.

LLMs also consume content differently than either humans or crawlers. Factual, specific content gets cited - "ingestion latency under 50ms at 10M events per second on a 3-node cluster" is something a model can extract and use. "Our platform handles high-throughput streaming data" is useless. Every piece of content should have at least a few sentences specific enough to be citable. Third-party presence matters too: Stack Overflow answers, dev.to posts, HN discussions all appear in training data. Answering a developer question well in public is both community work and corpus work.

![One Does Not Simply meme: "One does not simply improve LLM discoverability without fixing the README first"](/images/blog/running-devrel-2026/meme-llm-readme.webp)

I want to be honest about the limits of what I know here: LLM discoverability measurement is largely unsolved. I wrote about [the data blind spot specifically](/blog/reversing-seo-traffic-decline-ai-overviews/) - I still have no reliable way to measure how often we show up in AI responses or in what context. The quarterly benchmark (prompt GPT-4o, Claude, Gemini, and Perplexity with your ICP's actual queries, document what you see) is the best proxy I've found. The ecosystem is moving fast and the tooling will catch up.

## Data is how you get buy-in

Here's the thing I've noticed: when DevRel struggles to get resources or headcount or leadership attention, it's almost never because the work is bad. It's because the work isn't connected to anything leadership already cares about. The State of Developer Relations 2024 report found that 60.7% of DevRel practitioners cite proving impact with data as their top challenge - which means most people in this role already know the problem. The gap is usually execution, not awareness.

The first time I showed up to a leadership review with a dashboard instead of a list of things I'd done, the dynamic changed. Not because executives love dashboards. Because a dashboard forces you to make claims that can be verified, and verified claims build credibility faster than any amount of storytelling.

[Tessa Kriesel](https://builtfor.dev) at builtfor.dev has a framework I keep coming back to: the developer journey maps to five stages - Discover, Evaluate, Learn, Build, Scale. [The builtfor.dev DevRel playbook](https://builtfor.dev/blog/devrel-playbook) lays it out in full and is worth reading.

The reason I find it useful: most DevRel programs measure activity, not progression. Tutorials published. Events attended. Community posts. Fine to track, but they don't tell you which stage is broken. This framework forces that question before you decide what to build.

### Discover

Developer first hears about you. Searched for a solution, found your docs, hit your README, caught your name in a Slack channel. You have maybe 30 seconds before they decide whether to keep reading.

The metric question here is simple: are developers finding us? Organic traffic by source, search rankings for ICP queries, AI referral traffic. Not "are we publishing" - whether the publishing is actually reaching people.

The most common break at this stage isn't thin content. It's a homepage that leads with architecture instead of the problem it solves.

### Evaluate

Developer decides whether the product is worth trying. They read docs, look at pricing, check GitHub activity, compare against alternatives. Three things will kill this stage before they ever try the product:

- "Contact sales" where pricing should be
- A changelog that hasn't moved in six months
- A GitHub issues backlog full of unanswered questions

All three signal the same thing: risk. Developer moves on.

I track docs page views on getting-started sections and pricing page scroll depth. If people are reading but not signing up, that's an Evaluate problem - something in the friction between "found you" and "made an account."

### Learn

This is where most developer tools die. Not because the product is bad - because the first 20 minutes are brutal.

Time to first value is the number that matters here. How long from "I signed up" to "I have a working output"? If it's past 20 minutes, nothing else matters until you fix that. I benchmark this myself against two or three competitors with an actual stopwatch. Not a gut feeling. A stopwatch.

Failed docs searches are the most underrated signal I track. Every search query with zero results is a gap someone hit in the wild. When the same question keeps coming up in community, that's a docs bug - not a support problem.

### Build

Developer is doing real work. API calls, integrations, debugging against production data.

DevRel's job at Build is less about content and more about whether the feedback loop to engineering actually works. SDK quality matters here in ways that tutorials can't compensate for. Error messages either help or they don't. The switch to a competitor usually happens quietly, alone, when something fails and the error is useless.

A specific error appearing repeatedly in support tickets is almost never a support problem. It's a product problem. Flagging that pattern upstream is some of the highest-leverage work I do at this stage.

### Scale

Developer is in production. They've committed. Now the question is: do they stay, expand, and tell other people?

This is the stage most DevRel programs ignore - because the work is less visible and the feedback loop is long. But it's where community advocacy becomes a measurable business asset. A developer who's been in production six months, answers other people's questions publicly, and refers their team? That's pipeline with a long first-touch trail. Track upgrade and conversion rates, churn signals, and referral rates. Watch who's answering questions in your Discord and sharing their implementations publicly. Those people are not a side effect. They're the program working.

---

The core thesis - DevRel is a revenue function, not a marketing expense - is one I've come to agree with completely. When I can map a content piece to Discover, a quickstart fix to Learn, an SDK improvement to Build, and show that each one moved its stage metric, the program stops being a line item that gets cut in a downturn. The metrics have to trace back to revenue. Not perfectly, not directly, but traceably.

For OSS tools, downloads are the lagging indicator. The leading indicators I actually track:

| Metric                                         | Why I care about it                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Star velocity (W/W delta, not cumulative)      | Momentum signal. Flat cumulative count looks fine until you notice stars/week dropped 40% |
| Issue response time and time to first response | Developers vote with their feet. A long first-response time kills early-stage trust fast  |
| LLM mention rank (quarterly)                   | Still early, but I want baseline data before everyone else starts measuring it            |

A note on contributor metrics: I've seen contributor count, PR merge rate, and fork-to-contributor conversion pushed as leading indicators in a lot of DevRel playbooks. Honestly, most companies I've worked with don't care about them - and in my experience they're closer to vanity metrics than predictive signals. Issue response time is the one that actually matters in practice. The others look good in a slide deck.

I frame the metrics I do track to leadership the same way every time: downloads are the number we're trying to move, but these are the numbers that predict downloads 8-12 weeks from now. If these trend right and downloads lag, the program is working and the cycle is just long. That framing - established before you start, with the logic written down somewhere - is what protects you from the 90-day credibility gap.

Here's what the data loop actually looked like in practice. At a cloud-native developer tools company where I ran DevRel, a three-month sprint of audit-first work produced: 200 PRs merged (86 content, 44 SEO, 31 other), organic traffic at an all-time high with Ahrefs estimated daily visits up 121% from the starting baseline, and 426 keywords ranking in the top 10. Specific keyword movements: "it asset management" went from position 43 to 7; "cloud governance framework" from position 11 to 2. Trial signups increased 61% over the same period. And this came in from a customer on a first sales call:

> "It was a colleague of mine who stumbled upon a blog post that you guys had published and which was very well written. He's like, I think this thing might actually make sense for us."

That quote alone justified more content budget than any dashboard I'd ever built. But you need the dashboard to get there.

Community signals are also pipeline intelligence, and naming that explicitly has been one of the highest-impact things I've done. Which companies have the most active developers in your Discord? Who's asking questions that imply enterprise-scale usage - "how does this handle 50 billion events per day" is a sales conversation waiting to happen. Flagging those patterns to sales turns community work into something with a clear business case.

## The first 90 days

The most common mistake when you're the first DevRel hire is doing too much too fast. You want to show up and ship - start a newsletter, propose a conference talk, draft a content calendar. The impulse makes sense. Resist it.

![Drake meme: Drake rejects "start a content calendar on day 1" and approves "run the Developer Discoverability Audit first"](/images/blog/running-devrel-2026/meme-audit-first.webp)

Before you invest in any channel, you need to know what's actually broken.

### Days 1-30: The Developer Discoverability Audit

I spend the first 30 days on a Developer Discoverability Audit before touching anything else. The goal is evidence, not opinions. Specifically, I look at three things in parallel.

#### Technical site health

Every subdomain - docs, blog, app, changelog, API reference. Core Web Vitals, robots.txt hygiene, internal link structure (docs siloed on a separate subdomain build authority independently instead of contributing to yours), redirect chains, keyword cannibalization between the blog and the docs, structured data gaps. The tool I use is Ahrefs at ~$129/month - not cheap, but one found indexing bug pays for a year of the subscription. If budget is tight, Screaming Frog has a free tier that handles up to 500 URLs. Run a content gap analysis against two or three competitors. What are they ranking for that you aren't? That becomes your content priority list.

#### LLM presence

Open GPT-4o, Claude, Gemini, and Perplexity. Type in your ICP's actual queries. "Best tool for real-time analytics on streaming data." "Compare [your product] vs [competitor]." Document where you appear, how you're described, what gets wrong about you, where competitors show up instead. Check your README quality and your examples directory. Check whether you have a `llms.txt` - honest caveat: as of early 2026 there's no confirmed evidence that major AI platforms read this, but it costs 10 minutes and signals intent.

#### Developer UX

Go through the product as a complete stranger. No internal Slack, no engineer sitting next to you. Measure time to first value - meaning how long from landing on your homepage to getting a working output. Benchmark against two or three competitors, with a stopwatch. Does the quickstart work on an M-series Mac? On Windows? In Docker? Can every code snippet be copy-pasted and run without modification? What happens when something goes wrong - are errors searchable? Do they tell you what to do next?

The deliverable is what I call a "State of Developer Experience" brief. A prioritized list of what's broken, with severity ratings, backed by data. Not a content plan. Not a pitch deck. Evidence of where you're leaking discoverability, specific enough that engineering and product can act on it.

This is what you bring to the first roadmap meeting. The difference between "I've been thinking about some content ideas" and "here are six indexing bugs and three quickstart gaps we should fix before we invest more in content" is enormous.

### Days 31-60: Building the foundation

Days 31-60 are about building the foundation. Fix the highest-priority DX gaps from the audit - some of this needs engineering, file the tickets and follow up until they're closed. Ship your first two or three content pieces, but make them count: benchmark content comparing your approach to alternatives, or integration-specific tutorials targeting queries with real search volume. Not a product announcement, not a "hello world" tutorial, not a thought leadership post about the future of the industry. Something a developer would search for, find, and use.

Pick one or two community channels and go deep. Not five. A Discord with one person who answers questions within an hour beats five channels where nothing happens. Set up tracking: UTM attribution, download-to-signup funnel, community metrics. The measurement infrastructure is tedious to build and you'll be grateful for it in month four.

One thing that changed my output significantly at this stage: automating the measurement layer instead of doing it manually. I built a [Claude Code skill for weekly SEO analysis](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling) that pulls from Google Search Console, Ahrefs, and Plausible together, compares against last week's snapshot, and surfaces what moved. What used to take an afternoon now takes ten minutes. That's not a productivity flex - it's about frequency. When the analysis is fast, you do it weekly instead of monthly, and you catch problems before they compound. The same principle applies to community monitoring: if pulling the "who's active from which company" report is a manual thirty-minute task, it doesn't happen. If it's a command, it happens every week.

### Days 61-90: Execute and measure

Days 61-90: run the first full content cycle. Check whether what you shipped in days 31-60 actually moved anything. Present learnings with data to leadership - even if the data is "here's what we tried, here's what we measured, here's what we'd do differently." Draft a six-month roadmap. The goal at 90 days is not to have won. The goal is a measurement layer, evidence of what's working, and a credible hypothesis about what to do next. If you've built that, you're ahead.

## Three conversations in the same building

Early-stage companies have multiple audiences under one roof, and pitching the same content to all of them is one of the fastest ways to lose credibility with everyone.

| Audience               | What they actually want                                       | What converts them                                                            |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Individual developers  | Code that runs, docs that anticipate their real questions     | Quickstarts that work in under 20 min, copy-paste snippets, searchable errors |
| Technical leads        | Architecture tradeoffs, operational complexity, failure modes | Benchmark posts, honest competitor comparisons, integration guides            |
| Engineering executives | Cost reduction, time-to-value, retention                      | Customer quotes, ROI framing, case studies their team can hand upward         |

Developers want working examples. Not architecture diagrams. Not marketing copy about how easy the tool is. Code that runs. Documentation that anticipates the questions they'll actually have rather than the questions you wish they'd ask. The fastest path to a developer trusting your product is going from "I heard about this" to "I have a working implementation" in under 20 minutes. If the quickstart can't get there, content won't save you.

Technical leads want architecture tradeoffs. Not "this is easy to use." Easy is not a technical decision criterion. What are the consistency guarantees? How does it behave under partition? What's the operational complexity at scale compared to the incumbent? What did you do differently from the alternatives and why? This audience is evaluating whether the product is worth bringing into their stack - a different question from whether it's easy to get started.

Executives want business outcomes. Cost reduction, time-to-value, retention. They don't need to understand the architecture. They need to understand why it matters for their company.

The mistake I see most often is optimizing for executives at the expense of developers, because that's where budget decisions happen. But executives almost never choose your tool directly. They respond to what their technical team recommends. The technical team responds to whether developers trust it. If you're writing "Why Real-Time Analytics Matters for Enterprise Teams" posts instead of docs that work and tutorials that run, you're optimizing for the wrong audience. Benchmark content that a technical lead can hand to an executive is the middle path - technically credible and business-outcome legible.

## What's actually working in 2026

Each surface has its own playbook. Applying the same tactic to all three is how programs stay busy without moving anything.

### The human developer surface

Fix the quickstart before you write anything. Benchmark time to first value against two or three competitors with a stopwatch - not a gut feeling, a stopwatch. If it's over 20 minutes, no content strategy compensates for that.

After that works, comparison posts are the format I'd reach for first. Not "us vs. them" marketing. Honest technical comparisons with reproducible numbers, the kind developers can run themselves and share when they're right. I've watched one comparison post stay in the top 10 performers for over a year with zero updates. Good data ages better than good writing.

Community: deep in one or two channels, fast response time, real answers. Not five channels where nothing happens.

### Search is mostly a plumbing problem

The biggest ranking jumps I've seen this year didn't come from new content. They came from fixing what was already broken. One redirect chain cleanup sprint across 200+ pages moved keywords more than six months of publishing had. Orphan pages with zero internal links are invisible to Google - just adding contextual links from related posts changes their trajectory fast. High-impression/low-CTR pages recover well once you add structured data: FAQPage schema specifically, TechArticle type on docs pages.

| What sounds right            | What actually moves the needle                 |
| ---------------------------- | ---------------------------------------------- |
| Publish more content         | Fix redirect chains and internal linking first |
| Thought leadership posts     | Comparison posts with reproducible benchmarks  |
| Presence on every platform   | Deep, fast-response community in 1-2 channels  |
| "Optimize for LLMs"          | Update your README and examples directory      |
| Add llms.txt                 | Have accurate, current docs to point it at     |
| Write for AI discoverability | Answer real questions publicly on SO and HN    |

One pattern worth watching in your GSC: "impressions up, position up, clicks flat." That's AI Overviews suppressing CTR on informational queries even as rankings improve. The SEO work is working. The click economy on informational queries is just changing. You need to understand that distinction before you explain the numbers to leadership or it looks like the program is stalling.

### The LLM surface

The playbook is early. Anyone claiming certainty is overstating it.

That said.

Your README is your primary marketing surface for IDE-native AI. When a developer asks Claude Code how to implement something, the model reaches into training data that includes your GitHub repo. A three-paragraph README with a stale quickstart? Invisible. A README with real use cases, working examples, and clear positioning against alternatives - that's what it has to work with. It's not content strategy. It's product work. Put it on the engineering roadmap.

AI referral traffic is measurable right now, even if it's small. ChatGPT, Claude, Perplexity - they all send trackable referral hits in Plausible and GA4. Usually 1-2% of total traffic. But at companies with well-structured docs, I've seen 50-60% month-over-month growth in AI-sourced visits. Set up the tracking now, before it becomes significant, so you have the baseline.

Last thing: structured FAQs and a clean one-sentence product definition get extracted as citable answers. Third-party presence - Stack Overflow, HN, dev.to - shows up in training data. Answering developer questions publicly is corpus work. Doesn't feel like marketing. That's why it works.

## The work nobody talks about

The highest-impact thing I've done in DevRel - consistently, at every company - is showing up to roadmap discussions before decisions get made, not after. Bringing the question "would a developer actually want this, and would they understand it?" before something ships rather than after someone's angry on GitHub.

Most companies don't install this function until they've shipped something that confused developers publicly. An error message that makes no sense without internal context. A quickstart that broke silently after a dependency update. An API that changed behavior without a deprecation notice. The external damage is visible. The internal damage is invisible: the developers who silently churned and never came back.

### The Dev Zero function

I think of this as the [Dev Zero role](/blog/devrel-as-dev-zero/) - being developer-zero in the product development process rather than a post-ship wrapper. You go through new features as a complete stranger before launch. You find the friction before developers in the wild do. You fight for docs to be written alongside the feature rather than six weeks after.

There's no dashboard for this. But it shows up as fewer developer complaints, better top-of-funnel retention, and a product team that actually trusts the DX feedback loop because you speak their language.

### Docs as a product

Docs are the most neglected part of this. Not writing them - fighting for how they get made.

The default at most companies is that docs happen after the feature ships. Written by whoever has five minutes, during the sprint where everyone is already mentally on the next thing. No review from someone who hasn't seen the code. They go stale the second the next release touches anything adjacent. And nobody files a ticket for documentation debt, so it just silently accumulates.

Fighting for docs to be part of the feature spec - reviewed before launch, not six weeks after - is one of the least glamorous and most effective things I do. The other piece is analytics. I run Plausible on our docs the same way I track the blog. A page with a high exit rate and low time-on-page is usually broken or confusing in a way no one has named yet. This is how I find problems that nobody filed a ticket for.

## The sales relationship nobody talks about honestly

I've worked at several developer-first companies and this tension shows up at all of them. It's not a people problem. It's structural.

![Two Buttons meme: sweating person choosing between "Pass developer names directly to sales" and "Proactively flag enterprise signals with context so the community stays healthy"](/images/blog/running-devrel-2026/meme-two-buttons.webp)

The most obvious version: sales wants names from Discord. Who's active, who might be enterprise-ready, who's asking questions that sound like a buying signal. And if you just hand over a list, you've poisoned the well. Developers feel the room shift. They stop asking real questions. The community goes quiet in exactly the ways that made it valuable.

The attribution version is more insidious. You've been doing DevRel for six months. A developer who was active in your community for months closes a deal. Sales gets 100% of the credit. DevRel gets none. This matters more than it sounds - your budget depends on demonstrating what you contribute to revenue, and if every community-influenced deal disappears into sales attribution you can't make the case for the next hire or the next conference budget or anything else.

Then there's the slow one. Custom demo requests. Architecture calls for prospects. "Can you just jump on this one call." Fine once. Fine twice. After a while you're doing pre-sales support for specific deals instead of building things that help a thousand developers at once. The community you were supposed to be building has gone quiet while you were in deal cycles.

The way I handle it: I own the signal-passing proactively, on my own terms. Rather than waiting for sales to ask for a lead list, I flag enterprise signals with context when I see them. "Three engineers from Acme Corp have been asking about HA configuration this week." Company name, what they're asking, why it sounds like a buying conversation. Sales gets something actionable. I haven't handed over a list that makes developers feel surveilled. The distinction sounds small. It isn't.

UTM and first-touch attribution from day one helps with the other problem. If a developer's first interaction with you was a Stack Overflow answer six months before they signed, that should be in the CRM. When a deal closes and you can trace the first touch to something you built, the attribution conversation gets a lot easier.

## How DevRel programs actually die

### No metrics defined before you start

The most common version is simple: no metrics defined before you start. You spend the first 90 days writing content, going to an event, building community presence. At the check-in, someone asks what the impact has been. You don't have a clean answer because you never defined "working" before you started. Leadership loses confidence. The program gets starved or cut. The work wasn't bad. The framing was.

### The wrong first hire

The wrong first hire is its own failure mode, and it's more specific than it sounds. The role almost always gets written as a content or community hire - someone who can ship tutorials and grow a Discord. That's the output layer. What's actually needed first is someone who can run the diagnostic: read crawl data, benchmark the quickstart as a stranger, identify what's leaking discoverability, and earn enough credibility with engineering to get the findings acted on. Hiring for output before you've done the diagnosis means 90 days of newsletters and conference abstracts while the real problems stay invisible.

### Wrong problem diagnosis

![Surprised Pikachu meme: "Hired DevRel to fix an 'awareness problem.' DX was broken the whole time."](/images/blog/running-devrel-2026/meme-surprised-pikachu.webp)

The trickier failure mode is wrong problem diagnosis. A company has a DX problem - the quickstart fails on half the platforms their developers actually use, the APIs are confusing, the error messages are incomprehensible without internal context. They hire DevRel to fix "awareness." You write great content about a product that frustrates developers. Nothing converts. Six months later you're blamed for not moving the needle. The problem was never yours to fix. This one is hard to see from outside before you join, which is why I spent so much time on the diagnosis question at the end of this post.

### Sales capture

Sales capture is the slow one, and it usually happens because you're succeeding. You're generating pipeline signals that sales values. They start treating you like a resource for deal support. You say yes because the work feels important. After six months you're running custom demos and jumping on prospect calls, building for one company instead of a thousand developers, and the community that made the signals worth anything in the first place has gone quiet.

### Vanity metrics

Vanity metrics are what happen when nobody pushed back on the first measurement conversation. Event attendance, social followers, blog views. Fine things to track. Completely insufficient to defend a budget when someone in leadership asks what DevRel actually contributed to revenue. Cut in the next downturn, every time.

### Scope creep

![Gru's Plan meme: "Define a focused DevRel scope: content, community, developer experience" then "Also own SEO, docs, social, events, pre-sales support, and every underfunded function without a clear owner"](/images/blog/running-devrel-2026/meme-this-is-fine.webp)

And then scope creep, which burns people out quietly. Founding DevRel means you own everything that doesn't obviously belong to someone else. SEO. Docs. Social. Event logistics. Sometimes customer success adjacent things. Nobody assigns this to you maliciously - it's just what happens on small teams. Within a year you're doing five jobs, none of them well. The fix is simple in theory: define your scope explicitly, write it down, revisit it quarterly. In practice it requires saying no to things that feel important, which is hard when you're trying to prove the function's value.

## The one question that tells you if you can win

Before investing heavily in the next phase of a DevRel program - or before taking a new role - get an honest answer to this:

_"What's the biggest thing between where your developer adoption is today and where you want it to be - and is it a content problem, a product problem, or a distribution problem?"_

These need completely different fixes. A content problem means you have a good product that developers can't find or don't understand. A product problem means the DX is broken - no amount of content fixes a quickstart that doesn't work. A distribution problem means the content is solid and the product works, but you're not on the surfaces where developers actually look: the docs have no search presence, the README isn't in any AI tool's training data, you have 50 GitHub stars and no third-party presence anywhere.

Most teams conflate all three and apply one solution - "write more content" - to all of them. A company with a product problem that responds by hiring DevRel and producing tutorials is going to spend money and then conclude that DevRel doesn't work. They'll be wrong about why.

Getting an honest answer to this question before you commit tells you almost everything about whether you can succeed. If the problem is clearly a product problem but leadership thinks it's a content problem, you're going to spend two years writing into a void. If they can name the right problem with enough specificity that you'd know how to address it, that's a role worth taking.

And if they can't answer the question at all - that's signal too. Helping a company develop an honest answer to it is one of the most valuable things a DevRel lead can do in the first 30 days.

---

If you're running a DevRel program - or trying to make the case for one to skeptical leadership - I'm always up for comparing notes. The LLM discoverability piece especially is still early and the most useful conversations I have are with people actively running the experiment. Find me on [Bluesky](https://bsky.app/profile/joekarlsson.com) or [LinkedIn](https://www.linkedin.com/in/joekarlsson/).

## Sources and further reading

- [The builtfor.dev DevRel Playbook](https://builtfor.dev/blog/devrel-playbook) by Tessa Kriesel - the Discover/Evaluate/Learn/Build/Scale framework and the "DevRel is a revenue function" thesis
- [DevRel Metrics and Why They Matter](https://thefalc.com/2020/12/devrel-metrics-and-why-they-matter/) by Sean Falconer - North Star metrics framework and how to connect DevRel activity to business outcomes
- [Developer Relations at GitLab: What We've Learned](https://web.archive.org/web/20250614065339/https://about.gitlab.com/blog/2024/03/13/developer-relations-at-gitlab-what-weve-learned-since-our-start/) by John Coghlan - five years of lessons on evolving a DevRel program through attention, active users, and revenue phases
- [The Future of DevRel: Six Shifts Reshaping Developer Engagement in 2026](https://blog.stateshift.com/future-of-devrel-2026/) by Mindy Faieta at Stateshift - good overview of where the industry is heading, especially the LLM discovery and time-to-value shifts
- State of Developer Relations 2024 - 60.7% of DevRel practitioners cite proving impact with data as their top challenge; useful context for why the metrics framing matters
