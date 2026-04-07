---
title: "How I Reversed a Traffic Death Spiral (And the Weekly Ritual That's Doing It)"
date: 2026-04-07
slug: 'reversing-seo-traffic-decline-ai-overviews'
description: "A Developer Advocate accidentally inherited an entire web presence and used Claude Code to reverse a traffic decline caused by AI Overviews. Real numbers, the weekly audit workflow, and what's actually working in 2026."
categories: ['DevRel', 'Career']
tags: ['SEO', 'Claude Code', 'AI Overviews', 'GEO', 'developer advocacy', 'content strategy']
heroImage: '/images/blog/reversing-seo-traffic-decline-ai-overviews/hero.webp'
heroAlt: 'Pink magnifying glass over a search bar, representing SEO and search visibility'
tldr: 'AI Overviews now appear on ~58% of Google queries and can drop organic CTR by up to 61%. Your rankings can improve while clicks stay completely flat. There are two distinct failure modes that need different fixes, and most SEO recovery advice conflates them. A weekly multi-source audit combining GSC, Ahrefs, Plausible, and HubSpot gives you the signal to prioritize high-impact fixes. Four weeks in: +57% organic traffic, +316% impressions, +440% docs traffic, average position up 5.2 places. When you see results early, screenshot them and send them to your manager immediately.'
faq:
  - question: 'Why are my impressions going up but clicks staying flat?'
    answer: "AI Overviews are likely appearing on your queries and absorbing clicks before users reach your site. Seer Interactive's research across 25 million impressions found a 61% drop in organic CTR when an AI Overview appears. Your content is good enough to summarize - you're just not getting credit for it in clicks."
  - question: 'What is GEO optimization?'
    answer: 'Generative Engine Optimization (GEO) is the practice of structuring content so AI systems cite it as a source. Key tactics include FAQ schema, quotable definitions in lead paragraphs, first-person authoritative voice, and specific verifiable claims with real numbers.'
  - question: 'How long does SEO take to show results?'
    answer: "Changes typically show up in ranking data 2-4 weeks after merging. Plan your measurement window accordingly - abandoning a fix before that window closes is the most common reason people think SEO changes aren't working."
  - question: 'What tools do I need for a weekly SEO audit?'
    answer: 'At minimum: Google Search Console (free) for impressions and clicks, and either Plausible or GA4 for actual visitor counts. Adding Ahrefs ($129/mo) unlocks keyword position tracking, redirect audits, and competitor gap analysis. The combination of multiple sources is what makes the signal reliable.'
---

_A personal story about obsessive SEO audits, Claude Code, AI Overviews stealing your clicks, and why content is still king - especially for the robots._

---

**Table of Contents**

- [The Industry Problem: AI Overviews Are Eating Your Clicks](#first-a-thing-thats-breaking-everyones-traffic-right-now)
- [The Two Failure Modes Nobody Talks About](#the-thing-i-figured-out-that-changed-how-i-approached-this)
- [How I Ended Up Owning This](#how-i-ended-up-owning-this)
- [The Weekly Ritual](#the-weekly-ritual)
- [The Numbers After Four Weeks](#the-numbers-because-i-know-you-want-them)
- [Being Cited in an AI Overview Is Actually Good (With an Asterisk)](#being-cited-in-an-ai-overview-is-actually-good-with-an-asterisk)
- [The LLM Discovery Channel Is Already Here](#the-llm-discovery-channel-is-already-here)
- [How Much Time This Actually Takes](#how-much-time-this-actually-takes)
- [Things That Are Actually Working in 2026](#things-that-are-actually-working-in-2026-in-order-of-roi)
- [The Stack and What It Costs](#the-stack-and-what-it-costs)
- [What Changed](#what-changed)
- [If You Want to Do This](#if-you-want-to-do-this)

---

My job title is Developer Advocate. I write docs, I build demos, I talk to developers at conferences, I maintain open source tooling, I show up to community calls. That's the job.

Somehow I also now own our entire web presence.

I'm not totally sure how it happened. Our front-end team is excellent - genuinely great engineers doing genuinely important product work. But the marketing site was a second-tier priority for them, and we didn't have a dedicated SEO person, and I had all these ideas I'd been sitting on for literally years about things I wanted to fix. Bad titles on pages that ranked but didn't convert. Blog posts that had no internal links going anywhere. A resource hub that was basically invisible because nothing pointed to it. Redirect chains from a subdomain migration that happened years ago and nobody cleaned up.

I knew what was wrong. I just couldn't do anything about it at a pace that mattered.

Then I got Claude Code, and something changed. I want to tell that story, because I think it's more useful than another "SEO best practices for 2026" post, but it also contains SEO best practices for 2026, because I've actually been running this experiment and have numbers.

---

## First, A Thing That's Breaking Everyone's Traffic Right Now

Before I get into what we did, some context. If you manage a website for a SaaS or tech company, you've probably noticed something weird: your impressions are going up. Your rankings are improving. Google Search Console shows you appearing on more queries than ever. And your clicks are... flat. Maybe down.

This isn't you. It's not your content. It's AI Overviews.

Google's AI-generated answer boxes are now appearing at the top of search results and absorbing clicks that used to reach your site. Users get the summary on the results page and never visit you. You got the impression. Google got the engagement. You got nothing.

The data is genuinely alarming. [Seer Interactive ran the most rigorous study I've found](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update) - 3,119 search terms, 42 client organizations, 25 million organic impressions tracked over 15 months. When an AI Overview appears on a query, organic CTR drops from 1.76% to 0.61%. That's **61% less.** Not a rounding error. [Ahrefs measured a 58% CTR reduction](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/) for high-ranking pages. For the #1 position, Authoritas found 79%.

And these things are _everywhere_ now. AI Overviews went from appearing on about 12% of queries in 2024 to roughly **58% of queries** by early 2026. According to [SparkToro's zero-click research](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/), for every 1,000 Google searches in the US, only **360 clicks** reach the open web at all.

If you're thinking "okay but that's mostly a publisher and e-commerce problem" - no. [TripleDart's 2026 B2B SaaS benchmark](https://www.tripledart.com/guides/b2b-saas-inbound-marketing-report) found AI Overviews appearing on **54% of tracked B2B SaaS keywords**. [Semrush found the Computers & Electronics category](https://www.semrush.com/blog/semrush-ai-overviews-study/) now sees AI Overviews on nearly 18% of keywords. This is squarely our space.

The cruel part: if AI Overviews are appearing on your queries, it's because Google considers your content good enough to summarize. You're being rewarded with invisibility.

At my company, this showed up in real numbers. Our average search position improved **5.2 positions in four weeks** - a real ranking improvement, moving from the middle of page 2 toward the top. Our raw click count barely moved. We estimated AI Overviews were absorbing around 107 clicks per week on our best queries. Ranking better than ever. Fewer clicks.

Welcome to 2026.

![Meme: Drake approving AI Overview absorbing clicks while rejecting organic clicks from improved rankings](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-drake-ai-overview.webp)

---

## The Thing I Figured Out That Changed How I Approached This

I spent the first couple weeks of this project confused. Our GSC position data was trending up, impressions were going up, but clicks weren't responding the way I expected. I kept trying to diagnose a content quality problem that wasn't there.

Eventually I landed on what I now think of as the two-failure-modes framework, and it completely changed how I prioritized work.

**Failure mode 1: ranking up, clicks down.** Position improving, impressions growing, clicks flat or declining. This is the AI Overview signature. The content is being summarized and users aren't clicking through. The fix is GEO optimization (more on this shortly): better structured content, quotable definitions, FAQ schema, structured data. Plus title and meta rewrites to improve click-worthiness.

**Failure mode 2: ranking down, clicks down.** Both going south together. This is a quality or authority problem: algorithmic, structural, or competitive. The fix is content quality, internal linking, redirect cleanup, backlink work.

These need completely different responses. I kept seeing posts about "reversing SEO decline" that were all about content E-E-A-T and authority building, which is failure mode 2 advice. If you have failure mode 1, that advice doesn't help and might actually distract you.

One thing worth being honest about: [the same Seer Interactive study](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update) found that AI Overviews tend to preferentially appear on queries that were already generating fewer clicks, so the causation arrow is murkier than the "AI killed my CTR" narrative suggests. Sometimes AI Overviews correlate with low CTR rather than causing it. Multi-source data - not just GSC - helps you tell these apart. Which brings me to the actual workflow.

![Meme: Gru's plan - impressions up 316%, ship more content, clicks still flat, realize it was AI Overviews the whole time](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-grus-plan.webp)

---

## How I Ended Up Owning This

I've been at my company for a while now in a DevRel role. I care deeply about the developer experience, the docs, the content we put out. But I also have strong opinions about the marketing site. I'd been accumulating a mental backlog of "things I want to fix" for years, and not acting on any of it, because acting on it meant writing up a request and getting in the engineering team's queue, which was legitimately full of more important work.

I don't say this as a criticism. It's just the reality of a startup where the front-end team is building the actual product. SEO debt accumulates silently. Nothing breaks. Traffic doesn't crash. It just... slowly, quietly underperforms what it could be.

![Meme: This is fine dog - me, a developer advocate, also somehow owning the entire company web presence](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-this-is-fine.webp)

Getting time to work on this wasn't hard to justify. My manager was on board immediately. But even with the time approved, the problem was execution speed. I could identify issues faster than I could fix them. I'd run a site crawl, find 102 pages returning 404 with significant link equity attached, and then... put it in a doc and wait.

Claude Code changed that equation completely, but not in the way I expected.

I thought the bottleneck was implementation speed. Write the fix faster, ship more. That's part of it. But the real shift was realizing this is fundamentally a **data problem**. You can't fix what you can't see. And I couldn't see very much, because every tool I had was showing me a different slice of the picture and none of them talked to each other.

GSC shows you clicks and impressions but not actual visitors. Ahrefs shows you estimated traffic but not funnel conversions. Plausible shows you real visitor counts but not keyword positions. HubSpot shows you which leads came from organic but not what pages they landed on first. The data was all there, just siloed, and synthesizing it by hand was slow enough that I'd only do it occasionally, which meant I was always making decisions on stale or partial information.

Once I had Claude Code, the constraint became data access, not implementation. So now that's how I evaluate every tool: does it have a data API I can pull from? Even better: does it have an MCP server, so Claude Code can query it directly without me writing glue code? A tool that's 80% as good but exposes clean API access beats a tool that's slightly better but locks the data behind a dashboard. I want the data in my analysis workflow, not trapped in someone's UI.

I want to be specific about what I mean, because "AI makes me faster" is one of the laziest sentences in tech right now.

The gap between "spotted" and "shipped" collapsed from weeks to hours. I find a batch of 404s with link equity. I describe the redirect logic to Claude Code. It writes the code, tests it, opens the PR. I review it. Done that afternoon. Before, that finding would sit in a doc for a month.

I can combine data sources that don't talk to each other. This is actually huge. SEO data is fragmented: Google Search Console shows impressions and clicks. Ahrefs shows estimated traffic and keyword position. Plausible shows actual visitor counts. HubSpot shows what happened in the funnel. None of these agree with each other, and no single one tells the full story. I built a Claude Code skill - I've been calling it `/seo-analysis` - that pulls all of them, correlates the signals, compares against last week's snapshot, and surfaces what moved. Writing and iterating on that infrastructure would have taken me months to do alone. It took days.

And honestly, the thing I underestimated: I can just think out loud. "I wonder if these resource hub pages are invisible because nothing links to them." That thought used to die in a Slack message. Now it becomes an Ahrefs crawl export, an analysis, and a PR before lunch.

My manager was supportive from day one. Once the results started showing up, it's been effortless to keep time on this. Nothing convinces people like a chart going in the right direction.

---

## The Weekly Ritual

Here's the actual workflow. Not magic. Just consistent.

**Step 1: Pull a multi-source snapshot.**

Every week I run `/seo-analysis`, which pulls:

- Google Search Console: impressions, clicks, position changes (free, authoritative on your own data)
- Plausible: actual visitor counts (I trust this more than GA for accuracy)
- Ahrefs: keyword positions, traffic value estimates, site audit findings, competitor gaps
- GA4: session and conversion data
- HubSpot: organic MQL counts to see if traffic is becoming leads
- PageSpeed: Core Web Vitals

The key insight about running multiple sources: they disagree with each other, and that disagreement is signal. If Ahrefs says traffic is up 40% but Plausible shows flat visitors, that's telling you something about traffic quality. If GSC impressions are exploding but clicks aren't following, that's the AI Overview signature. The gaps between tools are where the story lives.

The workflow compares against last week's snapshot and surfaces what moved.

**Step 2: Diagnose before touching anything.**

Failure mode 1 or failure mode 2? I run through the affected pages before deciding what to fix. Impressions up, position up, clicks flat: GEO and CTR optimization. Everything declining: quality and structure work. Different problem, different fix.

**Step 3: Find the highest-ROI issues.**

My priority order:

Pages with high impressions, low CTR, sitting in positions 4-16. These are showing up - they just aren't getting clicked. Usually a title problem or a meta description that doesn't match search intent. I batch these, rewrite them, ship in one PR, check back in three weeks.

Redirect chains and 404s with link equity. Every redirect is a small signal tax. Every 404 with internal links pointing to it is wasted link equity. I run Ahrefs crawl exports, sort by URL Rating, fix the highest-equity broken pages first. We found 1,555 redirects in a single crawl. Some of those chains had four hops.

Orphan pages - pages with zero internal links pointing to them. Google can barely find these. We had a long tail of resource hub articles that had never been linked from anywhere. Adding them to related article blocks is free. The ranking lift from it is not.

Keyword cannibalization. Multiple pages targeting the same keyword fight each other and split authority. Identify the cluster, pick a winner, redirect or re-optimize the rest.

Content gaps. Running a content gap analysis against a competitor shows you every topic they rank for that you don't. Filter by volume and keyword difficulty. The highest-volume, lowest-KD gaps are your fastest path to new traffic.

**Step 4: Ship. Tag the PR. Wait.**

Every change gets a tracked PR tagged by category - SEO, content, docs, performance, fix. After 2-4 weeks, the workflow checks what happened to the affected URLs' positions and traffic.

This is the part nobody talks about: **building the measurement layer.** Without it, you're doing SEO on vibes. With it, I can tell you exactly which PR moved a specific page from position 19 to position 7.7. I can tell you a single title/meta rewrite batch produced +397 clicks and +4,131 impressions. I can tell you docs improvements drove +302% docs traffic and took quickstart completions from zero to 25 per week.

One consistent finding: **in-depth, definitional, long-form guide pages massively outperform blog posts.** Eight of our nine top traffic-gaining pages are resource hub articles, not blog posts. If you're pouring resources into the blog but haven't built out a proper resource hub, the ROI is probably inverted.

**Step 5: Repeat next week.**

---

## The Numbers, Because I Know You Want Them

The first week after I got the `/seo-analysis` skill running and started shipping fixes, I opened Ahrefs on a Monday morning and the impressions chart had gone hockey stick. Not a little uptick - an actual steep climb that made me do a double-take and refresh the page. That was the moment I knew this was real.

I immediately screenshotted it and sent it to my manager.

![Ahrefs 5-year performance chart showing referring domains (blue), organic traffic (orange), and impressions (pink) from 2021 to April 2026. Red arrows annotate the "SEO Start" date and point to the hockey-stick spike in impressions and organic traffic in early 2026.](/images/blog/reversing-seo-traffic-decline-ai-overviews/chart-5yr-performance.webp)
_Five years of data. You can see the slow decline once AI Overviews got introduced, exactly when I started the weekly ritual, and what happened next._

This is actually a piece of advice I'd give in any department, not just SEO: when you see something working, **brag about it early and often.** Send the screenshot. Share the chart. Tell the story. Don't wait for the quarterly review or the perfect slide deck. Leadership responds to evidence, and early evidence - even imperfect, early-stage evidence - builds the credibility that gives you more time, more resources, and more latitude to keep doing the work. The projects that get cut are the ones where nobody knows they're working. Don't let that happen to yours.

![Meme: One does not simply wait for the quarterly review to show leadership the SEO wins](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-one-does-not-simply.webp)

Here's where we started and where we are after about four weeks of this:

| Metric                      | Start     | Four Weeks Later | Change             |
| --------------------------- | --------- | ---------------- | ------------------ |
| Average position (GSC)      | 16.6      | 11.4             | **+5.2 positions** |
| Organic traffic (Ahrefs)    | ~1,175/wk | ~1,842/wk        | **+57%**           |
| Search impressions (Ahrefs) | ~10K/wk   | ~41,590/wk       | **+316%**          |
| Estimated traffic value     | $932/mo   | $1,855/mo        | **+99%**           |
| Weekly visitors (Plausible) | ~1,354    | ~2,386           | **+76%**           |
| Docs visitors/week          | ~48       | ~261             | **+440%**          |

The impressions number is the one that surprised me most. Our previous all-time high was around 10,150 impressions - in May 2024. By mid-March we'd already blown past it. We hit **49,220 impressions** in a single week. That's 4.9x the prior all-time high. The record fell three weeks in.

_(The Ahrefs performance chart above shows this - the "Previous All Time High" annotation and the spike past it are already labeled on the image.)_

![Ahrefs 90-day performance chart showing the "Start" line at Feb 27. After that date, impressions (pink) climb steeply, organic traffic (orange) rises, and referring domains (blue) hold steady - showing the growth is search-driven, not backlink-driven.](/images/blog/reversing-seo-traffic-decline-ai-overviews/chart-90day-performance.webp)
_The 90-day view. That vertical red line is Feb 27 - when the weekly audit workflow started. Everything to the right of it is the result._

We hit position #1 for a couple of target keywords. Moved a high-volume query from position 49 to 15 - a query that had been completely off our radar.

![Ahrefs organic positions stacked area chart showing position brackets (1-3, 4-10, 11-20, 21-50, 51+). After the "Start" line at Feb 27, the total number of tracked keyword positions rises across every bracket - the whole stack grows.](/images/blog/reversing-seo-traffic-decline-ai-overviews/chart-organic-positions.webp)
_Organic positions across all ranking brackets, Jan-Apr 2026. Every band grew after the start date. This is what "improving average position" actually looks like in the underlying data._

And then: look at the clicks. Basically flat.

That's the AI Overview effect in real data. We tripled our search visibility. The clicks got absorbed. This is the game now.

![Meme: Distracted Boyfriend - my organic traffic watching AI Overviews absorb all the clicks](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-distracted-boyfriend.webp)

---

## Being Cited in an AI Overview is Actually Good (With an Asterisk)

Being featured in an AI Overview is a weird flex. Google is saying your content is authoritative enough to summarize in a generated answer. The asterisk is that the user might never come to your site. You're rewarded for quality with reduced traffic.

We went from 11 AI Overview placements to a peak of 115 in a single week. That's not something we engineered - that's Google expanding coverage and our content being in the right shape to get pulled.

Here's where it gets interesting though. The Seer Interactive study found something that changed how I think about this: **when you're actually cited as a source in an AI Overview, your organic CTR is 35% higher** than when AI Overviews appear without citing you. The number is 0.70% vs 0.52%. That sounds small, but in a suppressed-CTR environment, 35% higher is meaningful.

There's a win condition. You're not trying to avoid AI Overviews - you can't, and optimizing to avoid them would mean worse content. You're trying to be the source that gets cited.

A [2023 academic paper from Princeton, Georgia Tech, and Allen AI](https://arxiv.org/abs/2311.09735) coined the term GEO (Generative Engine Optimization) and found that specific content optimizations could boost visibility in AI-generated responses by up to 40%. The tactics that worked in the research:

- **FAQ schema** on content pages so AI can extract structured Q&A
- **Quotable definitions** in your lead paragraphs: sentences that can be lifted verbatim as a cited answer
- **Structured data**: HowTo, Article, BreadcrumbList
- **First-person authoritative voice**: "we provide X" lands differently than "some tools include X"
- **Specific, verifiable claims**: real numbers, named integrations, dated examples

The content that gets cited in AI answers tends to be content that directly and clearly answers the query. That's also content that ranks well in traditional organic search. Good writing and good SEO are converging. Write for people, format for robots.

---

## The LLM Discovery Channel Is Already Here

If AI Overviews are eating Google clicks, and more people are starting their research in Claude or Perplexity rather than Google, the strategic question shifts. It's not just "how do we rank on Google" anymore. It's "how do we become part of the stack that LLMs draw from when someone asks about our space?"

We're already seeing early data on this. AI and LLM referrals to our docs went from zero to 2 per week. Small. But our docs traffic from claude.ai grew **450% week-over-week** in one measurement window. Developer documentation is [specifically identified as heavily extracted by Claude and Perplexity](https://www.kalungi.com/blog/b2b-saas-seo-in-the-age-of-ai) - if you make a technical product, your docs are an LLM SEO asset, not just a support cost center.

The practical response starts with accuracy. LLMs train on and cite recent, authoritative sources. Outdated or vague content gets deprioritized - or worse, gets used to generate wrong answers about your product. We do voice-and-tone audits across docs, update stale content, and add "last updated" signals. This isn't content marketing. It's maintenance.

Depth matters more than it used to. A page that covers a topic thoroughly - definitions, examples, comparisons, real use cases - is more useful to an LLM summarizing that topic than a page that hits the keyword but stays surface-level. The bar moved, and it moved in the direction of "actually useful."

The thing I keep coming back to: everything we ship is public. Our docs, our repos, every technical piece. That's training data for future LLMs. When a developer asks an AI assistant about building a cloud asset inventory, we want to be the answer they get. The only way that happens is if we're putting out correct, specific, current, findable information - consistently, not in bursts.

On **llms.txt**: you've probably seen this pitched as the hot new signal. We have one. But I want to be honest - as of early 2026, there's no confirmed evidence that any major AI platform actually reads it in a meaningful way. [Rankability's adoption study](https://www.rankability.com/data/llms-txt-adoption/) found that while 844,000+ sites have implemented it, only 0.3% of the top 1,000 websites have. Google's Gary Illyes publicly said Google doesn't support it, then quietly added it to official developer docs six months later. Make of that what you will. It costs 5 minutes. Don't treat it as a strategy.

The goal is presence on every discovery surface - Google, Claude, ChatGPT, Perplexity. The underlying work for all of them is the same: accurate, thorough, current, well-structured content. That's the moat.

---

## How Much Time This Actually Takes

I want to be honest about this because a lot of "I built an SEO system" posts make it sound like a 20-minute weekly process. It's not.

On a week where I'm heads-down:

- The `/seo-analysis` pulse takes about 10 minutes to run and review - it's mostly automated, I'm just reading the output
- Prioritizing what to fix and making the plan is maybe 30 minutes
- Writing the actual PRs takes 2 to 4 hours depending on scope - sometimes it's a simple title/meta batch, sometimes it's a redirect audit with complex logic, sometimes it's content
- Getting reviewed and merged is usually a day or two
- Checking prior weeks' PRs for measurable impact is another 20 minutes

Then you wait. 2 to 4 weeks. That's the part people don't warn you about.

SEO moves at geological speeds. A PR shipped Monday might not show up in ranking data until mid-month. You're planting seeds. If you need fast feedback loops to stay motivated, this work will make you want to flip a table. I said it at the top and I'll say it again: this is not a project for the impatient.

![Meme: Waiting skeleton - me, waiting for SEO results from the redirect cleanup I shipped 3 weeks ago](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-waiting-skeleton.webp)

But the cumulative effect is real. Every redirect you clean up is a permanent improvement. Every internally-linked page is easier to crawl forever. Every quality meta description stays until you change it. Nothing you ship here decays. It compounds.

---

## Things That Are Actually Working in 2026 (In Order of ROI)

I've been accumulating evidence for a few months. Here's what's actually moving the needle, roughly in order of ROI.

The highest-return work has been internal linking and redirect cleanup - and I say that as someone who spent years thinking these were boring maintenance tasks. Orphan pages with zero internal links are nearly invisible to Google. Adding resource hub articles to related article modules was among our best work. One PR added internal links to 21 orphan pages. A separate one moved a target page from position 19 to 7.7 - a 12-position jump from a single change. That's free link equity redistribution, and it's almost always neglected.

Redirect chains fall into the same category. Every hop loses signal. If you've done any site migrations, you have chains. We found 1,555 redirects in one crawl, some with 4 hops. Same goes for 404s with link equity - run Ahrefs, sort by URL Rating, redirect the highest-equity broken pages first. None of this is glamorous. All of it compounds.

> _"The cruel part: if AI Overviews are appearing on your queries, it's because Google considers your content good enough to summarize. You're being rewarded with invisibility."_

After the technical cleanup, the next thing I do every week is build the high-impressions/low-CTR hit list. I export GSC data, sort by impressions, and find everything sitting in positions 4-16 with CTR below 5%. These pages are showing up on Google - they just aren't getting clicked. Nine times out of ten it's a title that doesn't match what someone actually searched. Batch the rewrites, ship in one PR, check back in three weeks. This was one of our fastest-moving wins.

On content strategy: **resource hub articles massively outperform blog posts.** 8 of our 9 top traffic-gaining pages are in-depth, definitional guides, not blog posts. I'm not saying stop blogging - I'm saying if you're putting all your resources into the blog and haven't built a proper resource hub, the ROI is probably inverted. Build the hub, link to it from everything, and keep it current.

For GEO specifically, the highest-signal thing you can add is FAQ schema - especially on how-to and comparison pages. It's a traditional rich result signal and the most consistently cited optimization in the [original GEO research](https://arxiv.org/abs/2311.09735).

One thing I still haven't solved: Core Web Vitals. Our Total Blocking Time is poor across most pages. It's a JavaScript bundle problem that needs real engineering involvement. A page with great content and terrible CWV will underperform against a page with great content and good CWV. It's a ceiling. I've filed the issue. I haven't cracked it.

And before any of the above: **build the measurement layer first.** Weekly snapshots, PR tracker, feedback loop. Without that infrastructure, you'll run out of conviction before the results show up. Everything else in this list is harder to justify and easier to abandon when you can't prove what moved.

---

## The Stack and What It Costs

Since I keep saying "run multiple data sources," I should be upfront about what that actually means in dollars.

| Tool                  | What it's for                                                    | Cost                    |
| --------------------- | ---------------------------------------------------------------- | ----------------------- |
| Google Search Console | Query-level clicks, impressions, positions                       | Free                    |
| GA4                   | Session and conversion data                                      | Free                    |
| Google PageSpeed API  | Core Web Vitals                                                  | Free                    |
| Plausible             | Accurate visitor counts, referrer sources                        | ~$9/mo                  |
| Claude Code           | Writing the analysis workflow + implementing fixes               | ~$20/mo (Pro)           |
| Ahrefs                | Keyword positions, traffic estimates, site audit, competitor gap | ~$129/mo (Lite)         |
| HubSpot               | Funnel attribution, organic MQL tracking                         | Free CRM tier available |

The expensive one is Ahrefs. There's no polite way around it. For site audits, keyword gap analysis, redirect crawls, and position tracking against competitors, I haven't found a free tool that comes close. If you already have SEMrush (~$140/mo), it covers most of the same ground. Screaming Frog has a free tier that handles up to 500 URLs - enough for a smaller site's technical audit work.

Everything else is free or close to it. The whole stack outside of Ahrefs runs under $30/month.

**The criterion I use for evaluating any tool now:** does it expose a data API? Because the value isn't in the dashboard - it's in pulling the data into my analysis workflow and correlating it with everything else. Plausible has a clean REST API. GSC has a direct API I query with a Python script. HubSpot has a full API. GA4 has one. Ahrefs on the standard plan doesn't have an API (you export CSVs manually), which is annoying but manageable. The tools I've stopped using are the ones where the data is completely locked in the UI with no export or API path at all.

Even better than a REST API: an MCP server. Several tools I use now ship MCP servers that Claude Code can query directly - no glue code, no CSV wrangling. Linear has one. Webflow has one. As this ecosystem matures, "does it have an MCP server?" is going to be as standard an evaluation question as "does it have a Zapier integration" was five years ago. If you're evaluating SEO or analytics tooling and this matters to you, ask the vendor before you sign up.

---

## What Changed

I had a list of things I wanted to fix on our marketing site for years. I knew what was wrong. I just couldn't ship fast enough for it to matter.

The thing Claude Code changed wasn't my intelligence about the problem. It changed the ratio of identified to shipped. I think of a fix, write it out, have it in PR in the same afternoon. That velocity - applied week after week - produces compounding results. The improvements stack. None of them decay.

The other thing that changed is I can now prove it. The PR tracker correlating changes to position and traffic data means I can point to specific PRs and say "this one moved that page from position 19 to 7.7." I can show docs traffic grew 440% after a specific set of work. I can show exactly how organic search turned into funnel entries. It's not vibes. It's a repeatable experiment with a measurement layer.

We went from an impressions all-time high of ~10K to nearly 50K in three weeks. Organic traffic doubled. Docs traffic grew 4x. Confirmed deal pipeline came in from pure organic search in month one - clear first-touch attribution to a Google organic click. The death spiral was neglect. Neglect is fixable.

I'm going to keep doing this every week. The loops are slow. The results are not.

Here's the thing I keep coming back to though, and I think it matters for anyone building a marketing career right now: **the people who will win with AI aren't the ones who are best at executing.** AI already handles that. The skill that's going to separate people going forward is the ability to _identify problems_ - to look at a messy pile of data from six different tools, none of which agree with each other, and correctly diagnose what's actually wrong.

AI right now is genuinely terrible at this. It can write the redirect logic once you've identified which 404s have link equity. It can rewrite 40 meta descriptions once you've figured out which pages have the wrong ones. It cannot look at your GSC data and tell you whether your traffic problem is failure mode 1 or failure mode 2. That call is yours.

Doing frequent, multi-source data analysis and making good decisions on it - that's the actual job now. The execution is almost free. The diagnosis is everything.

---

## If You Want to Do This

A few things I'd tell myself at the start.

The first one is about data. Set up multiple sources before you touch anything - GSC for clicks and impressions, Ahrefs for positions and traffic estimates, Plausible or GA4 for actual visitor counts, your CRM for funnel correlation. No single tool sees the full picture. The gaps between what they report are where the real signals live, and you need all of them to tell failure mode 1 from failure mode 2.

Whatever you do, snapshot everything weekly from day one, even before you've shipped a single fix. You cannot measure improvement without a baseline. The snapshot feels pointless in week one. In week five, when you're trying to figure out if a PR actually moved anything, it's the only thing that tells you.

Same logic applies to the PR tracker. The feedback loop only closes if you can look back later and say "this change, those URLs, this outcome." Set it up before you think you need it, because by the time you realize you need it, you've already lost the ability to connect your first few fixes to their results.

**One note on prerequisites:** this workflow assumes you have some existing search presence - GSC data, some rankings, a site Google has been crawling for a while. If you're starting from zero, everything still applies, but give yourself 6-8 weeks of consistent snapshots before you expect the measurement layer to tell you anything useful. Start snapshotting on day one, before any fixes. The baseline is the whole game.

The last thing is about patience, and I mean this genuinely: a change merged today might not show up in ranking data for 2-4 weeks. I've seen people abandon this process at week three, right before results were about to land. If you need fast feedback loops to stay motivated, this work is going to drive you up a wall. But if you can hold the timeline, the results compound in a way that almost nothing else does. Every clean redirect, every internal link, every better title stays fixed. None of it decays.

That's the whole thing. The loops are slow. The execution is almost free. **The diagnosis is everything.**

---

_If you're working through something similar, or want to compare notes on multi-source SEO analysis or GEO strategy, you can find me on [Bluesky](https://bsky.app/profile/joekarlsson.com) or [LinkedIn](https://www.linkedin.com/in/joekarlsson/). Always happy to geek out about this._

---

## Sources

- [Seer Interactive: AI Overview Impact on Google CTR, Sept 2025 Update](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update)
- [Search Engine Land: Google AI Overviews drive 61% drop in organic CTR](https://searchengineland.com/google-ai-overviews-drive-drop-organic-paid-ctr-464212)
- [Ahrefs: AI Overviews Reduce Clicks by 58%](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)
- [SparkToro: 2024 Zero-Click Search Study](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/)
- [TripleDart: B2B SaaS Inbound Marketing Report 2026](https://www.tripledart.com/guides/b2b-saas-inbound-marketing-report)
- [Semrush: AI Overviews Study by Industry](https://www.semrush.com/blog/semrush-ai-overviews-study/)
- [Rankability: llms.txt Adoption Research Report](https://www.rankability.com/data/llms-txt-adoption/)
- [Kalungi: State of B2B SaaS SEO in the Age of AI 2025](https://www.kalungi.com/blog/b2b-saas-seo-in-the-age-of-ai)
- [GEO: Generative Engine Optimization - Princeton / Georgia Tech / Allen AI (2023)](https://arxiv.org/abs/2311.09735)
- [Grow and Convert: SEO Traffic Decline - ChatGPT vs AI Overviews](https://www.growandconvert.com/ai/seo-traffic-decline-chatgpt-ai/)
