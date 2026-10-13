---
title: 'Reversing SEO Traffic Decline From AI Overviews: A Weekly Audit (2026)'
date: 2026-04-07T18:08:30Z
slug: 'reversing-seo-traffic-decline-ai-overviews'
description: 'How I reversed an SEO traffic decline caused partly by AI Overviews: two failure modes, a weekly Claude Code audit, and real numbers from four weeks.'
categories: ['DevRel', 'Career']
tags: ['SEO', 'Claude Code', 'AI Overviews', 'GEO', 'developer advocacy', 'content strategy']
heroImage: '/images/blog/reversing-seo-traffic-decline-ai-overviews/hero.webp'
heroAlt: 'Pink magnifying glass over a search bar, representing SEO and search visibility'
tldr: 'Our traffic was declining - impressions down, clicks down. Diagnosing it turned up two different failure modes happening at the same time on different pages, and most SEO recovery advice only addresses one of them. When an AI Overview appears, organic CTR drops by about 61%, per Seer Interactive. A weekly multi-source audit combining GSC, Ahrefs, Plausible, and HubSpot gives you the signal to tell them apart and prioritize fixes. Four weeks in: +57% organic traffic, +316% impressions, +440% docs traffic, average position up 5.2 places. With Claude Code doing the fixes, diagnosis is the hard part.'
faq:
  - question: 'Why are my impressions going up but clicks staying flat?'
    answer: "AI Overviews are likely appearing on your queries and absorbing clicks before users reach your site. Seer Interactive's research across 25 million impressions found a 61% drop in organic CTR when an AI Overview appears. Your content is good enough to summarize - you're just not getting credit for it in clicks."
  - question: 'What is GEO optimization?'
    answer: 'Generative Engine Optimization (GEO) is the practice of structuring content so AI systems cite it as a source. Tactics include FAQ schema, quotable definitions in lead paragraphs, first-person authoritative voice, and specific verifiable claims with real numbers.'
  - question: 'How long does SEO take to show results?'
    answer: "Changes typically show up in ranking data 2-4 weeks after merging. Plan your measurement window accordingly - abandoning a fix before that window closes is a common reason people think SEO changes aren't working."
  - question: 'Do AI Overviews hurt organic click-through rate?'
    answer: 'Yes. Seer Interactive found organic CTR falls from 1.76% to 0.61% when an AI Overview appears. Being cited as a source in the Overview helps: cited pages saw about 35% higher CTR than uncited ones (0.70% vs 0.52%).'
  - question: 'How do I tell whether AI Overviews or a quality problem is causing my traffic drop?'
    answer: 'Check position alongside clicks, page by page. Position and impressions up with clicks flat points to AI Overviews absorbing clicks. Position and clicks both down points to a quality, authority, or technical problem. Each needs a different fix.'
  - question: 'What tools do I need for a weekly SEO audit?'
    answer: 'At minimum: Google Search Console (free) for impressions and clicks, and either Plausible or GA4 for actual visitor counts. Adding Ahrefs ($129/mo) unlocks keyword position tracking, redirect audits, and competitor gap analysis. Combining multiple sources is what makes the signal reliable.'
---

_A traffic decline usually has two failure modes that need different fixes. Once Claude Code made the fixes cheap, telling them apart became the hard part._

---

**Table of Contents**

- [AI Overviews are eating clicks](#ai-overviews-are-eating-clicks)
- [Two failure modes](#two-failure-modes)
- [How I ended up owning this](#how-i-ended-up-owning-this)
- [The weekly SEO audit](#the-weekly-seo-audit)
- [The numbers after four weeks](#the-numbers-after-four-weeks)
- [Getting cited in AI Overviews](#getting-cited-in-ai-overviews)
- [LLMs as a discovery channel](#llms-as-a-discovery-channel)
- [How much time this takes](#how-much-time-this-takes)
- [What's working, in order of ROI](#whats-working-in-order-of-roi)
- [The stack and what it costs](#the-stack-and-what-it-costs)
- [What this means for marketing](#what-this-means-for-marketing)
- [What Claude Code changed](#what-claude-code-changed)
- [If you want to do this](#if-you-want-to-do-this)
- [What I'm still figuring out](#what-im-still-figuring-out)

---

Our organic search traffic had been sliding for months. It wasn't a crash. Apart from the occasional spike around a launch, we lost a little traffic almost every week, which was easy to explain away week by week and hard to ignore once I zoomed out to six months.

When I finally sat down to diagnose it, I found two different problems, affecting different pages and needing different fixes, that I'd been treating as one. Applying the wrong fix to the wrong problem is why a lot of SEO recovery efforts don't work. And with Claude Code, shipping a fix takes an afternoon, so the diagnosis is where the real work is.

I'm a Developer Advocate: docs, demos, conference talks, community. Somehow I also own our entire web presence now, which turned out to be part of why this worked.

---

## AI Overviews are eating clicks

Some sites are seeing impressions climb while clicks stay flat. Others, like us, were watching both decline together. Those look similar from the outside, but they're different problems, and one of them comes from something that didn't exist three years ago: AI Overviews.

Google's AI-generated answer boxes now show up at the top of search results and absorb clicks that used to reach your site. People read the summary on the results page and never visit. You still get the impression, but Google gets the engagement.

[Seer Interactive ran the most rigorous study I've found](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update) - 3,119 search terms, 42 client organizations, 25 million organic impressions tracked over 15 months. When an AI Overview appears on a query, organic CTR drops from 1.76% to 0.61%, which is **61% less**. [Ahrefs measured a 58% lower CTR](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/) for the top-ranking page when an AI Overview shows up.

It's not just a publisher and e-commerce problem. [Semrush's AI Overviews study](https://www.semrush.com/blog/semrush-ai-overviews-study/) found them on nearly 18% of keywords in Computers & Electronics, the second-highest category it tracked, and that's our space. And clicks were already scarce before AI Overviews: [SparkToro's zero-click research](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/) found that for every 1,000 Google searches in the US, only **360 clicks** reach the open web at all.

If AI Overviews are showing up on your queries, Google thinks your content is worth citing, and the Overview built from it is what keeps people from clicking through to you.

That was part of what was happening to us. Some of our pages were ranking and getting summarized, and the clicks went nowhere. But we also had pages declining across the board, which is a different problem.

![Meme: Drake approving AI Overview absorbing clicks while rejecting organic clicks from improved rankings](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-drake-ai-overview.webp)

---

## Two failure modes

I spent the first couple of weeks of this project confused. Our overall numbers were declining, but page by page the picture was inconsistent. Some pages had positions improving and clicks flat. Others had everything going south together. I kept trying to apply one diagnosis to both and getting nowhere, until I started sorting pages into two failure modes.

**Failure mode 1: ranking up, clicks down.** Position improving, impressions growing, clicks flat or declining. This is the AI Overview signature: the content is being summarized and users aren't clicking through. The fix is GEO optimization (more on this below): better structured content, quotable definitions, FAQ schema, structured data. Plus title and meta rewrites so people want to click.

**Failure mode 2: ranking down, clicks down.** Both going south together. This is a quality or authority problem, whether algorithmic, structural, or competitive. The fix is content quality, internal linking, redirect cleanup, and backlink work.

We had both at once. Failure mode 2 fixes on failure mode 1 pages would have done nothing. Most of the posts I found about "reversing SEO decline" were about content E-E-A-T and authority building, which is failure mode 2 advice. If you have failure mode 1, it won't help and might distract you.

[The same Seer Interactive study](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update) also found that AI Overviews tend to appear on queries that were already generating fewer clicks, so the causation is murkier than "AI killed my CTR." Sometimes AI Overviews correlate with low CTR rather than causing it. Pulling data from more sources than GSC, and checking whether a query's CTR was already low before an AI Overview showed up on it, helps you tell those apart.

![Meme: Gru's plan - traffic declining, diagnose the problem, realize there are two different problems, fix both differently](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-grus-plan.webp)

---

## How I ended up owning this

I'd been building a mental backlog of things I wanted to fix for years - bad titles on pages that ranked but didn't convert, blog posts with no internal links going anywhere, a resource hub (we call ours the Learning Center: in-depth evergreen guides with original research where possible) that was invisible because nothing pointed to it, redirect chains from a subdomain migration that nobody ever cleaned up. I knew what was wrong. I just couldn't do anything about it at a pace that mattered, because acting on it meant writing up a request and getting in the engineering team's queue, which was full of more important work.

That's not a criticism. At a startup, the front-end team is building the actual product. And nothing obviously breaks when SEO debt piles up, so it never gets prioritized.

![Meme: This is fine dog - me, a developer advocate, also somehow owning the entire company web presence](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-this-is-fine.webp)

We weren't doing nothing. We'd hired an SEO agency at around $10,000 a month, and they were good: helpful tips, solid strategy advice. But execution was still slow. Recommendations sat in a doc waiting on the engineering queue, and changes took weeks to get from "identified" to "shipped."

Getting time for this wasn't hard. My manager was on board immediately. The problem was execution speed. I could find issues faster than I could fix them. I'd run a site crawl, find 102 pages returning 404 with significant link equity attached, and then put it in a doc and wait.

Claude Code changed that.

I have ADHD, and the work I'm describing - pulling data from six different tools, synthesizing it, deciding what to fix, writing the fix, tracking whether it worked - is the sprawling, multi-step, context-heavy kind of task my brain has a hard time getting traction on. Starting takes a lot of energy, and there are a lot of places to lose the thread. I'd sit down to do a proper SEO audit and end up with twelve tabs open and no progress.

Working with Claude Code broke that pattern for me. I don't fully understand why. Maybe it's that I can think out loud and the work starts happening, instead of holding the whole structure in my head before I begin. Maybe it's that each step stays small enough to feel doable. Whatever it is, the barrier that made this kind of work hard for me is mostly gone. I'm faster, and I'm also doing work I would have avoided before.

I thought the bottleneck was implementation speed. That's part of it, but the bigger shift was realizing this is a **data problem**. Every tool I had showed me a different slice of the picture, and none of them talked to each other. GSC shows you clicks and impressions but not actual visitors. Ahrefs shows estimated traffic but not funnel conversions. Plausible shows real visitor counts but not keyword positions. HubSpot shows which leads came from organic but not what pages they landed on first. Combining them by hand was slow enough that I only did it occasionally, so I was always making decisions on stale or partial information.

Once I had Claude Code, the constraint became data access instead of implementation. That's now how I evaluate every tool (more on that in [the stack section](#the-stack-and-what-it-costs)): can I pull its data through an API, or better, through an MCP server so Claude Code can query it directly? A tool that's 80% as good with clean API access beats a slightly better one that locks the data behind a dashboard.

"AI makes me faster" is one of the laziest sentences in tech right now, so here's what it looks like in practice. The gap between spotting a problem and shipping the fix **went from weeks to hours.** I find a batch of 404s with link equity and describe the redirect logic to Claude Code. It writes the code, tests it, and opens the PR. I review it and it ships that afternoon. Before, that finding would sit in a doc for a month.

I can also combine the data sources that don't talk to each other. They rarely agree, and no single one shows the whole picture, so I built a [Claude Code skill](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling) - I've been calling it `/seo-analysis` - that pulls all of them, correlates the signals, compares against last week's snapshot, and surfaces what moved. Building and iterating on that alone would have taken me months. With Claude Code it took a few days.

What I underestimated is how fast a passing thought turns into work now. "I wonder if these resource hub pages are invisible because nothing links to them" used to die in a Slack message. Now it becomes an Ahrefs crawl export, an analysis, and a PR before lunch.

---

## The weekly SEO audit

**Step 1: Pull a multi-source snapshot.**

Every week I run `/seo-analysis`, the [Claude Code skill I built](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling). If you're not familiar with Claude Code skills, think of them as reusable slash commands you build yourself. This one pulls from:

- [Google Search Console](https://search.google.com/search-console/welcome): impressions, clicks, position changes (free, authoritative on your own data)
- [Plausible](https://plausible.io): actual visitor counts (I trust this more than GA for accuracy)
- [Ahrefs](https://ahrefs.com): keyword positions, traffic value estimates, site audit findings, competitor gaps
- [GA4](https://analytics.google.com): session and conversion data
- [HubSpot](https://www.hubspot.com): organic MQL counts to see if traffic is becoming leads
- [PageSpeed](https://pagespeed.web.dev): Core Web Vitals

The sources disagree with each other, and the disagreement is useful. If Ahrefs says traffic is up 40% but Plausible shows flat visitors, that tells you something about traffic quality. If GSC impressions are exploding but clicks aren't following, that's the AI Overview signature.

**Step 2: Diagnose before touching anything.**

I go through the affected pages and decide which failure mode they're in before fixing anything. Impressions up, position up, and clicks flat means GEO and CTR work. Everything declining means quality and structure work.

**Step 3: Find the highest-ROI issues.**

My priority order:

Pages with high impressions and low CTR in positions 4-16. These are showing up but not getting clicked, usually because the title or meta description doesn't match search intent. I batch these, rewrite them, ship them in one PR, and check back in three weeks.

Redirect chains and 404s with link equity. Every redirect loses a little signal, and every 404 with internal links pointing at it wastes link equity. I run Ahrefs crawl exports, sort by URL Rating, and fix the highest-equity broken pages first. We found 1,555 redirects in a single crawl, and some of those chains had four hops.

Orphan pages, with zero internal links pointing to them. Google can barely find these. We had a long tail of resource hub articles that had never been linked from anywhere. Adding them to related article blocks costs nothing, and it moves rankings.

Keyword cannibalization. Multiple pages targeting the same keyword fight each other and split authority. Identify the cluster, pick a winner, redirect or re-optimize the rest.

Content gaps. A content gap analysis against a competitor shows you every topic they rank for that you don't. Filter by volume and keyword difficulty. The highest-volume, lowest-KD gaps are your fastest path to new traffic.

**Step 4: Ship, tag the PR, and wait.**

Every change gets a tracked PR tagged by category: SEO, content, docs, performance, fix. After 2-4 weeks, the workflow checks what happened to the affected URLs' positions and traffic.

I don't see many people talk about **building the measurement layer**, and without it you're doing SEO on vibes. With it, I can tell you which PR moved a specific page from position 19 to position 7.7. I can tell you a single title/meta rewrite batch produced +397 clicks and +4,131 impressions, and that docs improvements took quickstart completions from zero to 25 per week.

One finding has held up every week: **in-depth, definitional, long-form guide pages massively outperform blog posts.** Eight of our nine top traffic-gaining pages are resource hub articles. If you're pouring resources into the blog but haven't built out a proper resource hub, the ROI is probably inverted.

**Step 5: Repeat next week.**

---

## The numbers after four weeks

The first week after I got `/seo-analysis` running and started shipping fixes, I opened Ahrefs on a Monday morning and the impressions chart had gone hockey stick. It was a steep enough climb that I refreshed the page to make sure. I screenshotted it and sent it to my manager right away. (I wrote about [what showing those numbers did for me](/blog/proving-my-work-mattered) separately.)

![Ahrefs 5-year performance chart showing referring domains (blue), organic traffic (orange), and impressions (pink) from 2021 to April 2026. Red arrows annotate the "SEO Start" date and point to the hockey-stick spike in impressions and organic traffic in early 2026.](/images/blog/reversing-seo-traffic-decline-ai-overviews/chart-5yr-performance.webp)
_Five years of data: the slow decline after AI Overviews launched, the date I started the weekly audit, and what happened next._

That's advice I'd give in any department: when you see something working, **brag about it early and often.** Send the screenshot, share the chart, and don't wait for the quarterly review or a polished slide deck. Leadership responds to evidence, and early evidence, even imperfect, builds the credibility that gets you more time and room to keep doing the work.

![Meme: One does not simply wait for the quarterly review to show leadership the SEO wins](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-one-does-not-simply.webp)

Here's where we started on Feb 27, 2026, and where we were about four weeks later:

| Metric                      | Start     | Four Weeks Later | Change             |
| --------------------------- | --------- | ---------------- | ------------------ |
| Average position (GSC)      | 16.6      | 11.4             | **+5.2 positions** |
| Organic traffic (Ahrefs)    | ~1,175/wk | ~1,842/wk        | **+57%**           |
| Search impressions (Ahrefs) | ~10K/wk   | ~41,590/wk       | **+316%**          |
| Estimated traffic value     | $932/mo   | $1,855/mo        | **+99%**           |
| Weekly visitors (Plausible) | ~1,354    | ~2,386           | **+76%**           |
| Docs visitors/week          | ~48       | ~261             | **+440%**          |

The impressions number surprised me most. Our previous all-time high was around 10,150 impressions, in May 2024, and that was a one-off spike from a launch, not normal traffic. By mid-March we'd passed it, and three weeks in we hit **49,220 impressions** in a single week, 4.9x the old record.

![Ahrefs 90-day performance chart showing the "Start" line at Feb 27. After that date, impressions (pink) climb steeply, organic traffic (orange) rises, and referring domains (blue) hold steady - showing the growth is search-driven, not backlink-driven.](/images/blog/reversing-seo-traffic-decline-ai-overviews/chart-90day-performance.webp)
_The 90-day view. The vertical red line is Feb 27, when the weekly audit workflow started._

We hit position #1 for a couple of target keywords, and moved a high-volume query that had been completely off our radar from position 49 to 15.

![Ahrefs organic positions stacked area chart showing position brackets (1-3, 4-10, 11-20, 21-50, 51+). After the "Start" line at Feb 27, the total number of tracked keyword positions rises across every bracket - the whole stack grows.](/images/blog/reversing-seo-traffic-decline-ai-overviews/chart-organic-positions.webp)
_Organic positions across all ranking brackets, Jan-Apr 2026. Every band grew after the start date, which is what an improving average position looks like keyword by keyword._

Clicks didn't keep pace. Impressions roughly quadrupled while organic traffic grew 57%, and that gap is the AI Overview effect showing up in our own data.

![Meme: Distracted Boyfriend - my organic traffic watching AI Overviews absorb all the clicks](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-distracted-boyfriend.webp)

---

## Getting cited in AI Overviews

Being featured in an AI Overview is a weird flex. Google is saying your content is authoritative enough to pull into a generated answer, and the user might never come to your site.

We went from 11 AI Overview placements to a peak of 115 in a single week. We didn't engineer that. Google expanded coverage, and our content was in the right shape to get pulled.

The Seer Interactive study found something that changed how I think about this: **when you're cited as a source in an AI Overview, your organic CTR is 35% higher** than when an AI Overview appears without citing you, 0.70% vs 0.52%. That sounds small, but when CTR is already suppressed, 35% matters. So you're not trying to avoid AI Overviews. You can't, and optimizing to avoid them would mean worse content. You're trying to be the source that gets cited.

What I didn't expect was our conversion rate going _up_. People arrive with a better understanding of what we do. The AI already did the research for them, they've seen our product mentioned in the answer, and they're coming to convert rather than browse. We're getting trial signups and sales inquiries from people who need less convincing, so the funnel is shorter and the win rate is higher.

I don't know if that's permanent. Marketing happens in more places now: on Google, in AI Overviews, and in conversations people have with Claude and ChatGPT before they search for anything. Nobody knows where that lands. For now, the visitors who do click through are more likely to buy than they used to be.

A [2023 academic paper from Princeton, Georgia Tech, and Allen AI](https://arxiv.org/abs/2311.09735) coined the term GEO (Generative Engine Optimization) and found that specific content optimizations could boost visibility in AI-generated responses by up to 40%. Its best performers were adding citations, quotations, and statistics. Here's what we put in place on our own pages:

- **FAQ schema** on content pages so AI can extract structured Q&A
- **TL;DR summaries** at the top of long posts - AI systems pull these as concise answers
- **Comparison tables** that directly answer "X vs Y" queries in a structured format
- **Quotable definitions** in your lead paragraphs: sentences that can be lifted verbatim as a cited answer
- **Structured data**: HowTo, Article, BreadcrumbList
- **First-person authoritative voice**: "we provide X" lands differently than "some tools include X"
- **Specific, verifiable claims**: real numbers, named integrations, dated examples

The content that gets cited in AI answers tends to be content that directly answers the query, which is also what ranks in traditional organic search, so the work for both is mostly the same.

![Meme: Always Has Been astronaut - wait, good SEO is just writing thorough content that actually answers questions? Always has been.](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-always-has-been.webp)

---

## LLMs as a discovery channel

If AI Overviews are eating Google clicks and more people start their research in Claude or Perplexity, the question shifts from "how do we rank on Google" to "how do we become part of what LLMs draw from when someone asks about our space?"

We're already seeing early data, though the numbers are tiny. AI and LLM referrals to our docs went from zero to 2 per week, and docs traffic from claude.ai grew 450% week-over-week in one measurement window. If you make a technical product, treat your docs as an LLM SEO asset as well as a support cost.

The first job is accuracy. LLMs train on and cite recent, authoritative sources. Outdated or vague content gets deprioritized, or worse, gets used to generate wrong answers about your product. We run voice-and-tone audits across docs, update stale content, and add "last updated" signals. That's maintenance more than content marketing.

Depth matters more than it used to. A page that covers a topic thoroughly, with definitions, examples, comparisons, and real use cases, is more useful to an LLM summarizing that topic than a page that hits the keyword and stays shallow.

Everything we ship is public: our docs, our repos, every technical piece. That's training data for future LLMs. When a developer asks an AI assistant about building a cloud asset inventory, we want to be the answer they get, and that only happens if we keep putting out correct, current information, consistently rather than in bursts.

On **llms.txt**: you've probably seen it pitched as the hot new signal. We have one. But as of early 2026, there's no confirmed evidence that any major AI platform reads it in a meaningful way. [Rankability's adoption tracking](https://www.rankability.com/blog/llms-txt-adoption/) found only 0.3% of the top 1,000 websites had one in June 2025. [Google's Gary Illyes said Google doesn't support it](https://searchengineland.com/google-says-normal-seo-works-for-ranking-in-ai-overviews-and-llms-txt-wont-be-used-459422), and Google's own docs now say Search ignores it. It takes 5 minutes. Don't treat it as a strategy.

The goal is to show up on every discovery surface: Google, Claude, ChatGPT, Perplexity. The content work underneath is the same for all of them: accurate, well-structured pages.

---

## How much time this takes

A lot of "I built an SEO system" posts make it sound like a 20-minute weekly process. It isn't.

On a week where I'm heads-down:

- The `/seo-analysis` pulse takes about 10 minutes to run and review - it's mostly automated, I'm just reading the output
- Prioritizing what to fix and making the plan is maybe 30 minutes
- Writing the actual PRs takes 2 to 4 hours depending on scope - sometimes it's a simple title/meta batch, sometimes it's a redirect audit with complex logic, sometimes it's content
- Getting reviewed and merged is usually a day or two
- Checking prior weeks' PRs for measurable impact is another 20 minutes

Then you wait 2 to 4 weeks. A PR shipped Monday might not show up in ranking data until mid-month. If you need fast feedback loops to stay motivated, this work will make you want to flip a table.

![Meme: Waiting skeleton - me, waiting for SEO results from the redirect cleanup I shipped 3 weeks ago](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-waiting-skeleton.webp)

The upside is that the work accumulates. A cleaned-up redirect stays fixed, an internally linked page stays easier to crawl, and a better meta description stays until you change it.

---

## What's working, in order of ROI

Internal linking and redirect cleanup have had the highest return, and I say that as someone who spent years thinking they were boring maintenance. Orphan pages with zero internal links are nearly invisible to Google, and adding resource hub articles to related article modules was some of our best work. One PR added internal links to 21 orphan pages. A separate one moved a target page from position 19 to 7.7 with a single change. Redistributing link equity costs nothing, and almost everyone neglects it.

Redirect chains and 404s with link equity come next, for the same reason. If you've done any site migrations, you have chains. None of this is glamorous.

After the technical cleanup comes the high-impressions, low-CTR hit list from Step 3. The filter is GSC positions 4-16 with CTR below 5%, and nine times out of ten the title doesn't match what someone searched. This was one of our fastest-moving wins.

On content strategy, the Learning Center articles behind those 8 of 9 top gainers are in-depth, definitional guides on topics our audience searches for, updated regularly, with original research where we can get it. I'm not saying stop blogging. Build the hub, link to it from everything, and keep it current.

For GEO specifically, the highest-signal thing you can add is FAQ schema, especially on how-to and comparison pages. It's a traditional rich result signal, and it hands AI systems a clean question-and-answer pair to lift. I also use [a blog skill that bakes these SEO and LLM-citation checks into the writing workflow](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation).

![Meme: Expanding brain - from knowing SEO problems exist, to weekly audits, to Claude Code automation, to being cited in AI Overviews while a cron job collects data](/images/blog/reversing-seo-traffic-decline-ai-overviews/meme-expanding-brain.webp)

One thing I haven't solved is Core Web Vitals. Our Total Blocking Time is poor across most pages, and it's a JavaScript bundle problem that needs real engineering involvement. A page with great content and bad CWV will underperform a page with great content and good CWV, so it caps everything else. I've filed the issue, and it's still open.

Before any of the above, **build the measurement layer**: weekly snapshots, a PR tracker, a feedback loop. Without it you'll run out of conviction before the results show up, and everything else on this list is harder to justify when you can't prove what moved.

---

## The stack and what it costs

Since I keep saying "run multiple data sources," here's what that costs.

| Tool                  | What it's for                                                    | Cost                    |
| --------------------- | ---------------------------------------------------------------- | ----------------------- |
| Google Search Console | Query-level clicks, impressions, positions                       | Free                    |
| GA4                   | Session and conversion data                                      | Free                    |
| Google PageSpeed API  | Core Web Vitals                                                  | Free                    |
| Plausible             | Accurate visitor counts, referrer sources                        | ~$9/mo (Starter)        |
| Claude Code           | Writing the analysis workflow + implementing fixes               | ~$20/mo (Pro)           |
| Ahrefs                | Keyword positions, traffic estimates, site audit, competitor gap | ~$129/mo (Lite)         |
| HubSpot               | Funnel attribution, organic MQL tracking                         | Free CRM tier available |

Ahrefs is the expensive one. For site audits, keyword gap analysis, redirect crawls, and position tracking against competitors, I haven't found a free tool that comes close. If you already pay for SEMrush, it covers most of the same ground. Screaming Frog has a free tier that handles up to 500 URLs, which is enough for a smaller site's technical audit work. Everything else is free or close to it: the stack outside Ahrefs runs under $30/month.

**My test for any tool now** is whether it exposes a data API. The value is in pulling the data into my analysis workflow and correlating it with everything else, not in the dashboard. Plausible has a clean REST API. GSC has an API I query with a Python script. HubSpot and GA4 both have full APIs. Ahrefs Lite didn't when I set this up, so I exported CSVs by hand. Its pricing page now lists API and MCP access on Lite. I've stopped using tools that lock the data in the UI with no export or API path at all.

An MCP server is even better than a REST API. Several tools I use now ship one that Claude Code can query directly, with no glue code or CSV wrangling. Linear has one, and so does Webflow. I expect "does it have an MCP server?" to become as standard an evaluation question as "does it have a Zapier integration?" was five years ago. If you're evaluating SEO or analytics tooling and this matters to you, ask the vendor before you sign up.

---

## What this means for marketing

The top of the funnel has moved. More and more people start their research by asking Claude or ChatGPT to explain a category, compare tools, or recommend a starting point, and they show up at your site with a shortlist already formed. That matches what I saw in our conversion rate. You're no longer trying to catch someone at the start of their search and walk them down a funnel. You're trying to be the answer they get before they ever visit, and if you're not cited in that AI conversation, that user may never see you.

What makes content good hasn't changed: be accurate, answer the question people are asking, and back up your claims with real data and first-person experience. What's different is that you're writing for people _and_ for the AI systems that summarize content for them, and those systems have no use for vague claims or sales language.

I think technical DevRels are well-positioned for this. It's not that we're better at marketing. The content we naturally produce - tutorials, technical opinions, first-person accounts of building things, docs written from real usage - is exactly what AI systems cite. We write for developer trust rather than conversion rates, and writing for developer trust turns out to be what gets you into AI answers. I wrote more about [how I run DevRel in 2026](/blog/running-devrel-2026) separately.

---

## What Claude Code changed

I had a list of things I wanted to fix on our marketing site for years and couldn't ship fast enough for it to matter. Claude Code didn't change what I knew about the problem. It changed how much of what I identified actually shipped. I think of a fix, write it out, and have a PR up the same afternoon, and doing that every week adds up. It's the same reason I think [shipping small and often beats waiting for perfect](/blog/ship-the-ugly-pot/).

I can also prove it now. The PR tracker ties changes to position and traffic data, so I can point to a specific PR and say it moved a page from position 19 to 7.7, show which set of work came before the 440% docs traffic jump, and show how organic search turned into funnel entries.

We went from an impressions all-time high of ~10K to nearly 50K in three weeks. Organic traffic grew 57%, and docs traffic more than quintupled. Confirmed deal pipeline came in from pure organic search in month one, with clear first-touch attribution to a Google organic click. Most of the decline came from neglected basics.

The bigger lesson, for anyone building a marketing career right now, is that **the people who win with AI won't be the ones who are best at executing.** AI already handles execution. What will separate people is the ability to _identify problems_: to look at a messy pile of data from six different tools, none of which agree, and correctly diagnose what's wrong.

AI is bad at that right now. It can write the redirect logic once you've identified which 404s have link equity. It can rewrite 40 meta descriptions once you've figured out which pages have the wrong ones. It can't look at your GSC data and tell you whether your traffic problem is failure mode 1 or failure mode 2. That call is yours.

---

## If you want to do this

A few things I'd tell myself at the start.

Set up multiple data sources before you touch anything: GSC for clicks and impressions, Ahrefs for positions and traffic estimates, Plausible or GA4 for actual visitor counts, your CRM for funnel correlation. No single tool sees the full picture, and you need all of them to tell failure mode 1 from failure mode 2.

Snapshot everything weekly from day one, even before you've shipped a single fix. You can't measure improvement without a baseline. The snapshot feels pointless in week one, and in week five it's the only thing that tells you whether a PR moved anything.

Set up the PR tracker early too. The feedback loop only closes if you can look back and say "this change, those URLs, this outcome." If you wait until you need it, you've already lost the link between your first few fixes and their results.

**On prerequisites:** this workflow assumes you have some existing search presence - GSC data, some rankings, a site Google has been crawling for a while. If you're starting from zero, everything still applies, but give yourself 6-8 weeks of consistent snapshots before you expect the measurement layer to tell you anything useful.

Be patient. A change merged today might not show up in ranking data for 2-4 weeks, and week three is when it's most tempting to give up, often right before results land. If you can hold the timeline, the fixes keep adding up.

Tie the work to revenue as closely as you can, because that's what gets you room to keep doing it. For us that meant connecting organic search to MQL creation in HubSpot. Being able to say "this blog post was the first touch for X leads this month" is a different conversation from "our impressions went up," and a deal in the pipeline with first-touch attribution to an organic Google click is what gets you more runway. Track it from day one.

---

**Quick-start checklist if you want to try this:**

- [ ] Connect Google Search Console and set up a weekly export
- [ ] Add at least one analytics source for actual visitor counts (Plausible or GA4)
- [ ] Run your first site crawl in Ahrefs or Screaming Frog and sort 404s by URL Rating
- [ ] Pull a GSC export, sort by impressions, flag everything in positions 4-16 with CTR below 5%
- [ ] Identify your orphan pages (zero internal links) - these are your fastest wins
- [ ] Take a baseline snapshot before you change anything
- [ ] Sort affected pages into failure mode 1 or 2 before choosing a fix
- [ ] Ship one small fix, tag the PR, set a calendar reminder to check results in 3 weeks
- [ ] Repeat

---

## What I'm still figuring out

The biggest gap was the Ahrefs API. When I wrote this, the Lite tier didn't include API access, so I exported CSVs by hand, which works but breaks the automation. (Ahrefs' pricing page now lists API and MCP access on Lite.) I want a cron job that collects all the data every week without me triggering it, and I'm not there yet.

What frustrates me most is that **I have no reliable way to measure how often we show up in AI assistants, in what context, or what search terms trigger us.** When someone asks Claude or ChatGPT about building a cloud asset inventory and our product gets mentioned, I can't see it. I don't know how often it happens, which questions surface us, or how we're being described. That's a big chunk of the discovery funnel I'm flying blind on. If you know of good data sources for tracking LLM mentions, I'd like to hear about them.

The same gap exists for AI Overviews. Ahrefs shows me that we have placements, but understanding the _context_ of those placements at scale is still manual work.

I also want to build a proper internal dashboard the whole team can see, instead of a weekly report I write up and share in Slack. Right now I'm the only one with the full picture, which makes me the bottleneck for anyone else trying to make sense of our search presence. A shared portal with position trends, content performance, and funnel attribution in real time would fix that. It's on the list.

---

_If you're working through something similar, or want to compare notes on multi-source SEO analysis or GEO strategy, you can find me on [Bluesky](https://bsky.app/profile/joekarlsson.com) or [LinkedIn](https://www.linkedin.com/in/joekarlsson/). Always happy to geek out about this._

---

## Sources

- [Seer Interactive: AI Overview Impact on Google CTR, Sept 2025 Update](https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update)
- [Search Engine Land: Google AI Overviews drive 61% drop in organic CTR](https://searchengineland.com/google-ai-overviews-drive-drop-organic-paid-ctr-464212)
- [Ahrefs: AI Overviews Reduce Clicks by 58%](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)
- [SparkToro: 2024 Zero-Click Search Study](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/)
- [Semrush: AI Overviews Study by Industry](https://www.semrush.com/blog/semrush-ai-overviews-study/)
- [Rankability: llms.txt Adoption Research Report](https://www.rankability.com/blog/llms-txt-adoption/)
- [GEO: Generative Engine Optimization - Princeton / Georgia Tech / Allen AI (2023)](https://arxiv.org/abs/2311.09735)
- [Grow and Convert: SEO Traffic Decline - ChatGPT vs AI Overviews](https://www.growandconvert.com/ai/seo-traffic-decline-chatgpt-ai/)
