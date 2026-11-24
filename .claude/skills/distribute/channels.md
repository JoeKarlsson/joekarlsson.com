# Distribution channels

The `distribute` skill's registry. Every entry: lanes, type and size, the rule (quoted where the source words it), format, how to submit, `pitch-first` when the venue wants the piece before Joe publishes it, status (`active`, `paused`, `dead`, `invite`), the source it was checked against, and the date. `joe: regular` marks a community Joe already takes part in (those go first in a plan). `verified: never` means nobody has read the live rules yet (Reddit refuses automated reads); the skill flags those rather than guess.

Lanes: `homelab`, `selfhosted`, `networking`, `data`, `ai`, `webdev`, `python`, `dataviz`, `genart`, `film`, `linguistics`, `research`, `devrel`, `techwriting`, `general-tech`, `essay`, `art`, `hardware`.

Evidence behind the routing (2026-11-23 research, 115 sources): `~/.claude/skills/personal-marketing/references/distribution-evidence.md`. Track-record lines (`track record: <slug> <date>: ...`) are added by the skill's day 2/7/30 checks.

Seeded 2026-11-22 from third-party research: each community's own rules or submission page where it loaded, otherwise news coverage of the rule change, cited.

## Aggregators

### Hacker News
- lanes: general-tech, homelab, networking, python, data, ai, webdev, research, dataviz
- rule: "Please don't use HN primarily for promotion. It's ok to post your own stuff part of the time." Original title, no editorializing, no site name. Asking for upvotes gets submissions, accounts and sites "penalized or banned." Repost OK if the story got no significant attention in the last year; don't delete and repost.
- also (read 2026-11-23): "Please don't put generated text in HN posts." "Don't post generated text or AI-edited text." Joe's call: Claude drafts, Joe edits; the plan shows this rule beside the HN row.
- base rates: Show HN median 2 points, 90th percentile 24, across 188,085 posts (danfking, 2026-04-23). A 1-point result is normal.
- joe: HN sent joekarlsson.com 629 visitors May-Nov 2026 (+92 via hckrnews), his biggest social-style referrer. Judge per piece: measured numbers, a checkable method, research, or Show HN for something runnable; never essays (Joe, 2026-11-23).
- format: link post, then an author comment
- status: active
- source: https://news.ycombinator.com/newsguidelines.html , https://news.ycombinator.com/newsfaq.html
- verified: 2026-11-22
- track record (HN Algolia, 2026-11-22): 5 joekarlsson.com submissions. My Homelab Two Years Later reached 17 points and 16 comments (2026-10-05, item 49965959). The rest stalled at 1 point: MikroTik binary API (a reader's submission, 2026-04-20), DevRel 2026, Ship the Ugly Pot, The Cognitive Case for Play (2026-11-18). A 1-point story counts as no "significant attention", so one repost is allowed.

### Show HN
- lanes: any, only for something runnable
- rule: off topic: "blog posts, sign-up pages, newsletters, lists, and other reading material... can't be tried out." A repo, tool or interactive viz qualifies.
- format: submit the tool, link the post from it
- status: active
- source: https://news.ycombinator.com/showhn.html
- verified: 2026-11-22

### Lobsters
- lanes: general-tech, webdev, data, homelab
- rule: "Self-promo should be less than a quarter of one's stories and comments in the last year." No self-promo in a new account's first 70 days.
- submit: needs an invite from a member
- note: an Oct 2026 meta thread reportedly removed the `vibecoding` tag and tightened submission rules (secondhand, newsletter digest)
- status: invite (Joe has no account as of 2026-11-22)
- source: https://lobste.rs/about
- verified: 2026-11-22

### Tildes
- lanes: general-tech, film, linguistics
- rule: "Tildes is a community, not a free advertising platform." Own work in moderation alongside real participation.
- status: invite (model not confirmed)
- source: https://docs.tildes.net/policies/code-of-conduct
- verified: 2026-11-22

## Blog platforms (cross-posts)

### DEV
- lanes: webdev, ai, data, homelab, devrel, techwriting
- rule: no content "designed primarily for the purposes of promotion or creating backlinks"; the full text, not a teaser linking out; must "Disclose the fact that they were generated or assisted by AI in the post"; no AI-generated educational content the author doesn't understand. Since Aug 2026 a per-post selector: human-only, AI-assisted, fully autonomous (secondhand).
- format: full repost with `canonical_url` in the front matter; check the canonical in a private window after
- status: active
- source: https://dev.to/terms , https://dev.to/code-of-conduct , https://dev.to/help/writing-editing-scheduling
- verified: 2026-11-22

### Hashnode
- lanes: webdev, ai, data, devrel
- rule: none specific found. One author found Hashnode as the canonical on about a dozen cross-posts (https://dev.to/morinaga/how-i-implemented-the-canonical-url-chain-across-devto-hashnode-and-bluesky-50d).
- format: repost; check the canonical in a private window
- status: active
- source: https://hashnode.com/
- verified: 2026-11-22

## Reddit

Reddit's "9:1" or "90/10" self-promotion ratio isn't in any current official Reddit policy; it lives on in subreddits that write it into their own rules. Read each sub's rules page before posting: `https://www.reddit.com/r/<sub>/about/rules`.

### r/selfhosted
- lanes: selfhosted, homelab
- rule: all posts about self-hosting. Blog posts allowed, "but do not post just a link": say what it's about, why it matters and how it helps (Rule 4). Don't promote your own projects "too much", per Reddit's self-promotion guideline; promoted apps must be production ready with docs (Rule 2). Projects younger than 3 months (first public commit or post) go only in the current New Project Megathread (Rule 6), which carries the AI Involvement field; a blog post needs no AI line. Dashboards and tools that aren't self-hosted: Wednesdays only, flaired (Rule 5).
- format: text post with the explanation and the link in the body
- status: active
- verified: 2026-11-23 (verified-by: Joe, pasted rules page)

### r/homelab
- lanes: homelab
- rule: posts must be homelab related and detailed ("as much detail about your lab as possible"; detail can go in a reply to your own post); low-effort posts removed (Rules 2-4). No monetized referral, affiliate or company ads; non-commercial personal projects are fine (Rule 6). Software projects need "Project: Software" flair, an AI disclosure in the flair and the text, answers to the posting prompt, and minimum sub karma (Rule 7); a write-up of Joe's own lab isn't a software project. No "humble lab" or age-pandering titles (Rule 9).
- format: text post with lab detail, the link in the body
- status: active
- verified: 2026-11-23 (verified-by: Joe, pasted rules page)

### r/programming
- lanes: webdev, general-tech
- rule (news coverage): tightened against "low quality blogspam" (May 2024); LLM content banned as a trial on 2026-04-01, later replaced by quality rules that allow only deep implementation posts about AI.
- status: active
- source: https://tomshardware.com/tech-industry/artificial-intelligence/the-largest-programming-community-on-reddit-just-banned-all-content-related-to-ai-llms-r-programming-is-prioritizing-only-high-quality-discussions-about-ai , https://aiweekly.co/alerts/rprogramming-replaces-ai-ban-with-quality-rules
- verified: never

### r/opensource
- lanes: webdev, general-tech
- rule (news coverage): bans any project that "uses AI, is made by AI, or is intended for AI"; a project must be 1+ year old, actively maintained, "carry an OSI license," have an existing community and "subjectively 3+" contributors; the poster's account must be 1+ year old with "significant Reddit contributions."
- status: dead for Joe's projects (solo, AI-assisted, under a year old)
- source: https://helpnetsecurity.com/2026/10/26/reddit-r-opensource-ai-ban (2026-10-26)
- verified: 2026-11-23 (secondhand)

### r/Proxmox
- lanes: homelab
- rule: self-promotion only on Community Showcase Day, every Monday 00:00-23:59 UTC (Sun 6 PM to Mon 5:59 PM Central); a blog or video post "without raising any discussion points" is removed, and the rule covers comments too (Rule 5). Posts or comments that appear AI-generated are removed, heavy emoji counts as a signal, and posts about AI-assisted sysadmin tooling (MCP servers for Proxmox) are removed (Rule 4). No curl-bash scripts: link the script itself (Rule 3). Stay on Proxmox (Rule 1).
- format: text post on a Monday (UTC), in Joe's own words, ending on a question; keep Claude and AI tooling out of it
- status: active
- verified: 2026-11-23 (verified-by: Joe, pasted rules page)

### r/mikrotik
- lanes: networking, homelab
- rule: not read; Reddit refused the automated read 2026-11-22. Read https://www.reddit.com/r/mikrotik/about/rules before posting.
- format: text post with the link in the body
- status: active
- source: https://www.reddit.com/r/mikrotik/about/rules
- verified: never

### r/Python
- lanes: python
- rule (secondhand, Feb 2024 mod update): Medium.com articles banned; Showcase posts must link a GitHub, GitLab or Bitbucket repo; extra filtering on showcase posts "to minimize the amount of low quality self promotion".
- status: active
- source: https://www.reddit.com/r/Python/about/rules (refused 2026-11-22)
- verified: never

### r/dataengineering
- lanes: data
- rule (secondhand): "Limit Self-Promotion", citing the 9:1 rule of thumb
- status: active
- verified: never

### r/LocalLLaMA
- lanes: ai, homelab
- rule (news coverage): 2026 karma minimums and a stricter Rule 4 on self-promotion
- status: active
- source: https://ai-radar.it/article/qualita-e-controllo-le-nuove-regole-di-r-localllama-migliorano-il-dibattito?lang=en
- verified: never

### r/dataisbeautiful
- lanes: dataviz
- size: 22M members (Wikipedia, Aug 2025)
- rule: a post must be or contain a qualifying data visualization with at least one computer-generated element (Rules 1, 5). "Directly link to the original source article", the full page, not just the image; tag your own work [OC] (Rule 2). [OC] posts state the data source(s) and tool(s) "in the first top-level comment" (Rule 3). Plain titles, no sensational headlines (Rule 7). U.S. politics only on Thursdays ET; personal data only on Mondays ET (Rules 8, 9). No reposts of popular posts within a month (Rule 6).
- format: [OC] link post to the article; Joe's first top-level comment names the data and tools
- status: active
- verified: 2026-11-23 (verified-by: Joe, pasted rules page)

### r/visualization
- lanes: dataviz
- rule (secondhand): wiki welcomes "guides, tutorials… works-in-progress and requests for critiques"
- status: active
- verified: never

### r/blackoutpoetry
- lanes: art, poetry
- rule: no sub-specific rules listed; Reddit's sitewide rules apply
- format: image post of Joe's own work, with a short comment
- status: active
- verified: 2026-11-23 (verified-by: Joe, pasted rules page)

### r/generative
- lanes: genart
- rule (secondhand): "Self-promotion is allowed, but it must be relevant and non-excessive."
- status: active
- verified: never

### r/linguistics
- lanes: linguistics, research
- rule: posts must link "academic linguistics articles or other high quality linguistics content" (lectures, databases, pop-science by or involving specialists, "projects by long-time members of this subreddit") (Rule 1). Questions go in the stickied weekly Q&A thread (Rule 2). No "lay speculation"; claims must be "grounded in a familiarity with relevant research" (Rule 4). No soapboxing (Rule 6).
- format: for Joe today, a question in the weekly Q&A thread; a post only once a piece is an academic article (preprint or journal)
- status: active (Q&A thread only, until Joe has a paper out)
- verified: 2026-11-23 (verified-by: Joe, pasted rules page)

### r/movies
- lanes: film
- rule (secondhand): mods point to the old 10% self-promo guideline; a user reports a permanent ban for posting their own review. High risk for blog links.
- status: active
- verified: never

### Unchecked subreddits worth reading before use
r/homeassistant, r/devops (named in blog-new's old Distribution fit), r/ClaudeAI, r/mcp, r/Database, r/devrel, r/technicalwriting, r/creativecoding, r/proceduralgeneration, r/DigitalArt, r/AskAcademia. (r/TrueFilm has its own entry since 2026-11-24.) No rule text found 2026-11-22; verified: never.

## Forums and communities

### MikroTik Forum (official, Discourse)
- lanes: networking, homelab
- rule: the guidelines' only line on it: "Respect our forum. Don't post spam or otherwise vandalize the forum." No written self-promotion rule. A proposal to ban third-party advertising is open but not adopted. The 2025-10-15 "Forum Rules / Guide Lines" post covers asking questions only.
- format: text post that stands on its own, link at the end. RouterOS > Scripting for scripts and API work (API threads in Nov 2026); 3rd party tools for tools and apps.
- submit: https://forum.mikrotik.com/c/routeros/scripting
- status: active (topics 2026-11-19 and later)
- source: https://forum.mikrotik.com/faq , https://forum.mikrotik.com/t/forum-rules-guide-lines/265622
- verified: 2026-11-22

### Proxmox Support Forum (official, XenForo)
- lanes: homelab
- rule: "referencing or promoting your own work, products, or services is permitted if you clearly disclose your affiliation or authorship in relevant contexts"; no "spamming existing discussion threads solely for the purpose of pitching a product or service"; nothing "spam or spam-like".
- format: a thread that stands on its own, say you wrote the post, link at the end. No tutorials section: tutorials are threads tagged `tutorial` (https://forum.proxmox.com/tags/tutorial/), mostly in Proxmox VE: Installation and configuration.
- submit: https://forum.proxmox.com
- status: active
- source: https://forum.proxmox.com/help/terms/
- verified: 2026-11-23

### Write the Docs Slack
- lanes: techwriting, devrel
- size: 27,000+
- rule: post in #community-showcase and say why it matters to docs people; help others about ten times for each self-promo; no cross-channel posting, bare URLs or shorteners.
- submit: signup form on the page
- status: active
- source: https://www.writethedocs.org/slack/
- verified: 2026-11-22

### DevRel Collective
- lanes: devrel
- rule: full-time DevRel practitioners only; application with job title check
- submit: apply at devrelcollective.fun
- status: active (site had a certificate error 2026-11-22)
- source: https://github.com/devrelcollective
- verified: 2026-11-22

### Processing Discourse (also hosts the p5.js forum)
- lanes: genart
- rule: the Gallery category is for showing work; no written self-promo rule found
- submit: post in Gallery
- status: active (Gallery threads Nov 2026)
- source: https://discourse.processing.org/
- verified: 2026-11-22

### Observable Forum
- lanes: dataviz
- rule: the "Show and tell" category
- submit: https://talk.observablehq.com/c/show-and-tell/7
- status: active
- verified: 2026-11-22

### Data Visualization Society Slack
- lanes: dataviz
- size: "over 14,000" (DVS's own figure, page not opened directly)
- rule: #share-critique is for work in progress and feedback; no rule found for finished links
- submit: join DVS (free) for the invite
- status: active
- source: https://nightingaledvs.com/why-were-all-slackers-in-data-visualization-society/
- verified: 2026-11-22

### vis.social (Mastodon)
- lanes: dataviz, genart
- size: 224 monthly active users
- rule: stay on topic; no text-to-image AI work, NFTs or bots
- submit: apply; the application must explain your interest and mention "Green Apple candy"
- status: active
- source: https://vis.social/api/v2/instance
- verified: 2026-11-22

### genart.social (Mastodon)
- lanes: genart
- size: 70 monthly active users
- rule: disclose any generative AI use in art
- status: invite (registration closed)
- source: https://genart.social/api/v2/instance
- verified: 2026-11-22

### Humanist (digital humanities mailing list)
- lanes: research, linguistics, film
- rule: moderated; members submit posts for moderation
- submit: apply for membership at the site
- status: active
- source: https://dhhumanist.org/
- verified: 2026-11-22

### Language Log
- lanes: linguistics
- rule: group blog with open comments; no tip or submission channel. Comment on a related post or write to a blogger directly.
- status: active (post 2026-11-21)
- source: https://languagelog.ldc.upenn.edu/nll/
- verified: 2026-11-22

## Editorial sites and newsletters

### Nightingale (Data Visualization Society)
- lanes: dataviz, research, film
- pitch-first: yes. Must be original to Nightingale; pieces already on your own blog are "generally not preferred." Three weeks' exclusivity, then repost with a link back. Pays $50, a magazine copy, or a donation to DVS.
- submit: email nightingale@datavisualizationsociety.org with a Google Doc and a Drive folder of images; DVS membership (free); 500-3,000 words
- status: active
- source: https://nightingaledvs.com/article-submission/
- verified: 2026-11-22

### CreativeApplications.Net
- lanes: genart, dataviz
- rule: self-submission expected; can't answer every message
- submit: https://www.creativeapplications.net/submit-project/ (project URL, description, tools, 1200px+ images, video link)
- status: active (9 posts Oct 23-Nov 17, 2026)
- verified: 2026-11-22

### Digital Humanities Now
- lanes: research, linguistics, film, dataviz
- rule: Editors' Choice picks come from subscribed RSS feeds
- submit: the "Nominate an RSS Feed or Source" form, once, for the joekarlsson.com feed
- status: active (newsletters through Feb 2026)
- source: https://tagteam.harvard.edu/hub_feeds/4038/feed_items/17134110
- verified: 2026-11-22

### Self-Host Weekly (selfh.st)
- lanes: selfhosted, homelab
- size: 35,000+
- submit: https://selfh.st/submit/ for self-hosting news and launches
- rule: the submit page's only scope line is "Self-hosted news, content, updates, launches, events, and more" (read 2026-11-23); no written eligibility rules, so a blog post fits as "content"
- note: listings made with AI get an "AI-Assisted" badge, not exclusion; the editor says readers click them "as much as ever" (selfh.st, 2026)
- status: active (issue 2026-11-20)
- verified: 2026-11-23

### Data Engineering Weekly
- lanes: data
- rule: data engineering only, no vendor promotion; op-eds by email
- submit: https://github.com/ananthdurai/dataengineeringweekly#how-can-i-contribute-articles
- status: active (#296, 2026-11-16)
- verified: 2026-11-22

### Python Weekly
- lanes: python
- track record: ran the MikroTik binary API post, #742 (2026-04-23), per coverage.ts
- submit: the homepage names no submission route; hand-curated by Rahul Chaudhary
- status: active (#772, 2026-11-19)
- source: https://www.pythonweekly.com/
- verified: 2026-11-22

### PyCoder's Weekly
- lanes: python
- rule: wants "projects you are working on, conferences you are running, and articles you want to share"; "we cannot guarantee to feature every submitted link"
- submit: the Google Form behind "Submit Your Link" at https://pycoders.com/submit
- status: active
- source: https://pycoders.com/submit
- verified: 2026-11-22

### Python Hub Weekly Digest
- lanes: python
- track record: ran the MikroTik binary API post, 2026-05-03 digest, per coverage.ts
- rule: "Share a news, article or interesting project"; "published after manual review"; description up to 20 words
- submit: https://pythonhub.dev/submit/
- status: active (digest 2026-11-22)
- source: https://pythonhub.dev/
- verified: 2026-11-22

### Cooperpress (JavaScript Weekly, Postgres Weekly and others)
- lanes: webdev, data
- size: JavaScript Weekly 170k+, group 450k+
- submit: no public form; editor@cooperpress.com
- status: active
- source: https://cooperpress.com/publications/
- verified: 2026-11-22

### Write the Docs newsletter
- lanes: techwriting
- size: 12,000+
- submit: nominated in the Write the Docs Slack with the `:suggest-for-newsletter:` emoji
- status: active, monthly
- source: https://www.writethedocs.org/slack/
- verified: 2026-11-22

### Console.dev
- lanes: webdev, devrel
- rule: 2-3 dev tools a week; useful to developers, self-service signup, maintained, documented; beta section needs a pre-1.0 or beta label: "Any GA or stable releases are not eligible." No sponsored reviews; no articles
- submit: hello@console.dev, for a tool
- status: active
- source: https://console.dev/selection-criteria
- verified: 2026-11-22

### Hacker Newsletter
- lanes: general-tech
- size: 60,000+
- rule: hand-picked from HN; the way in is doing well on HN
- status: active
- verified: 2026-11-22

### Data Elixir
- lanes: dataviz, data
- size: 45,000+
- submit: only a general contact form, https://dataelixir.com/contact/
- status: active (#597, 2026-11-10)
- verified: 2026-11-22

### Visualising Data (Andy Kirk)
- lanes: dataviz
- submit: no suggestion process stated
- status: active, monthly
- source: https://visualisingdata.com/
- verified: 2026-11-22

### TLDR, Pointer.io, Bytes
- lanes: general-tech, webdev
- rule: no submission route found (TLDR sells ads only)
- status: active
- verified: 2026-11-22

## Dead, paused or unclear (don't recommend; kept so nobody re-adds them)

- **DB Weekly**: dead. "No longer published," archive of 360 issues. https://dbweekly.com/ (2026-11-22). It ran Joe's work twice (#351, #320).
- **Data Science Weekly**: paused. The archive stops at #484, 2023-03-02. https://datascienceweekly.org/newsletters (2026-11-22)
- **Data Is Plural**: paused. Last edition 2025-08-27, no notice. https://www.data-is-plural.com/archive/ (2026-11-22)
- **Changelog News**: unclear. The editor wrote that he "shipped [his] final News" (https://jerodsanto.net/2026/03/so-long-changelog) but the site lists #185 dated 2026-04-29.
- **DevRel Weekly (Mary Thengvall)**: unclear. The site errored and no 2025-26 issues were found (2026-11-22).
- **GitHub Discussions "Show and tell" in bpg/terraform-provider-proxmox and opentofu/opentofu**: quiet. Both categories exist, but every recent thread has 0 comments (checked 2026-11-23 via the GitHub API).
- **awesome-opentofu (virtualroot)**: no fit for posts. It lists tools, courses, conference talks and podcasts; no section for single blog posts (README read 2026-11-23).
- **FlowingData**: unclear. A /suggest/ page exists but refused automated reads (2026-11-22).

## Added 2026-11-23 from the distribution research

### Hackaday
- lanes: hardware, homelab, genart
- rule: projects that teach: "We want you to document what you're doing"; "There's tons to learn from failures!" No press releases. Selection is "hit-or-miss"; resubmitting is fine.
- format: what it is, why, how; an overview photo with "plenty of space around the project"; "A descriptive subject line will help us get to your hack quickly"; a Hackaday.io project page helps
- submit: tips@hackaday.com or https://hackaday.com/submit-a-tip/
- status: active
- source: https://hackaday.com/submit-a-tip/ , https://hackaday.com/2021/04/27/how-best-to-get-your-project-on-hackaday
- verified: 2026-11-23

### kottke.org
- lanes: general-tech, art, dataviz, film, essay
- rule: "Sending links is appreciated! If you have a project or video you're proud of, send it along." "I read everything I receive."
- submit: email from https://kottke.org/about
- status: active
- source: https://kottke.org/about
- verified: 2026-11-23

### Changelog News
- lanes: webdev, ai, general-tech
- rule: "if your fellow devs will find it interesting, submit it." No "How-tos and tutorials", no commercial products. "Submitting your own work is also encouraged." The form asks "What's interesting about it?"
- submit: https://changelog.com/news/submit (account needed)
- status: unclear (its editor wrote he shipped his final issue in March 2026; check for a recent issue first)
- source: https://changelog.com/news/submit
- verified: 2026-11-23

### The Public Domain Review
- lanes: research, linguistics, film, essay
- pitch-first: yes (proposal and short bio; drafts slightly preferred; ~2,500 words; pays $500)
- rule: overlooked public-domain subjects (95+ years old), "against-the-grain angles". "We do not accept queries or submissions that feature or adapt AI-generated text." Joe's own words only.
- submit: submissions@publicdomainreview.org
- status: active
- source: https://publicdomainreview.org/about/submissions
- verified: 2026-11-23

### Colossal
- lanes: art, genart
- rule: project or exhibition-based art with imagery; "unlikely to cover speculative work... AI-generated imagery... literature, or guest posts"; can't reply personally
- submit: https://www.thisiscolossal.com/submissions/ (a few hi-res images or a link)
- status: active
- verified: 2026-11-23

### The Pudding
- lanes: dataviz, research, film, linguistics
- pitch-first: yes; wants "a thesis that invites debate" and a plain data source
- rule: "We do not accept pitches solely from AI agents."
- status: paused (pitches closed for the rest of 2026; try January 2027)
- source: https://pudding.cool/pitch/
- verified: 2026-11-23

### Zenodo and Rogue Scholar
- lanes: research
- rule: Zenodo issues DOIs with no affiliation; Rogue Scholar archives scholarly blogs from their RSS feed, registers Crossref DOIs and tracks citations
- format: day 0 for every research piece, so it can be cited
- status: active
- source: https://zenodo.org/ , https://rogue-scholar.org/
- verified: 2026-11-23

### Awesome Proxmox VE (Corsinvest/awesome-proxmox-ve)
- lanes: homelab
- size: 1,168 stars; PRs merged within days (latest 2026-11-22)
- rule: "Append your entry at the end of its category"; "One suggestion per pull request"; "If you are the author of the project, say so in the description: self-submissions are welcome." Wants a direct link and a short description ending in a period. Guides get in: "Add Move from VMware to Proxmox guide to Migration" merged 2026-11-18.
- format: one list line in "Tutorials, Blogs & Video" (or Migration for a migration guide), via a pull request on day 7
- submit: https://github.com/Corsinvest/awesome-proxmox-ve
- status: active
- source: https://github.com/Corsinvest/awesome-proxmox-ve/blob/master/CONTRIBUTING.md
- verified: 2026-11-23

### arXiv
- lanes: research, linguistics
- rule: an unaffiliated author needs a personal endorsement in the category; since 2026-01-21 an institutional email alone doesn't count. CS review and position papers need documented peer review; original empirical work is still accepted.
- format: only with an endorser Joe knows lined up first
- status: active
- source: https://info.arxiv.org/help/endorsement.html
- verified: 2026-11-23

### IndieWeb Carnival
- lanes: essay, art
- rule: a monthly prompt from a rotating host, who links every response in a roundup
- format: write to the month's prompt, then send the host the link
- status: active
- source: https://indieweb.org/IndieWeb_Carnival
- verified: 2026-11-23

### Kagi Small Web
- lanes: essay, art, general-tech
- rule: personal blogs; add your own only alongside "at least 2 other sites that are not yours"; a post in the last 12 months; "no forms of advertisements"; "No popups, such as newsletter signups or cookie prompts"; no "Auto-generated, LLM-generated" content, though content "heavily guided by and reviewed by humans" is OK and "Effort should be made to acknowledge heavier LLM usage"
- submit: a pull request to https://github.com/kagisearch/smallweb
- status: active (check joekarlsson.com for popups first)
- verified: 2026-11-23

### Are.na Annual
- lanes: essay, art
- rule: yearly book with a theme; "No particular writing experience is required"; essays and text with images; pays $200; pitch rooted in an Are.na channel
- status: closed until the next call (opens around March)
- source: https://www.are.na/editorial
- verified: 2026-11-23


## Added 2026-11-24 for script-vs-screen

### Scriptnotes (John August and Craig Mazin's podcast)
- lanes: film
- rule: "Please include your first name and location (i.e. Tom in Bristol, England)." "Your question may show up on the site, or be answered in the podcast." "Craig and I can't answer every question." "We won't read your script, your treatment, your query letter, etc." "We almost never answer private emails."
- format: a question for the show, built on the finding; not a pitch
- submit: ask@johnaugust.com
- status: active
- source: https://johnaugust.com/ask
- verified: 2026-11-24

### Data Vis Dispatch (Datawrapper)
- lanes: dataviz
- rule: weekly on Tuesdays, "the best of last week's big and small data visualizations," "especially from news organizations"; the editors find most work themselves. Readers are invited to "Write us at hello@datawrapper.de"
- format: a short email before the Tuesday after publishing (it covers the last seven days only)
- submit: hello@datawrapper.de
- status: active
- source: https://www.datawrapper.de/blog/data-vis-dispatch-march-18-2025
- verified: 2026-11-24

### r/Screenwriting
- lanes: film
- rule: not read; Reddit refuses automated reads. Read https://www.reddit.com/r/Screenwriting/about/rules before posting.
- format: text post with the findings as bullets, link at the bottom
- status: active
- verified: never

### r/TrueFilm
- lanes: film
- rule: not read; Reddit refuses automated reads. Read https://www.reddit.com/r/TrueFilm/about/rules before posting.
- format: discussion text post ending on a question, link at the bottom
- status: active
- verified: never

### No Film School
- lanes: film
- rule: no tip or submission route found (search 2026-11-24); a Contact link exists, contents unread
- status: unclear
- source: https://nofilmschool.com/about
- verified: 2026-11-24
