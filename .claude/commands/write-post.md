---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch, Agent, AskUserQuestion
argument-hint: [topic or path to notes file]
description: Create blog posts for joekarlsson.com using a multi-agent pipeline: parallel research (source-researcher + competitor-analyst), internal link scouting, positioning review, voice review, fact-checking, and parallel final validation (EEAT + SEO/AEO + positioning draft pass). Includes quick-review mode for existing posts.
---

# joekarlsson.com Blog Post Skill

Create a blog post about: $ARGUMENTS

## Ground rules from Joe's feedback

These come from posts Joe sent back. They override defaults elsewhere in this skill.

- **Build on Joe's lived experience, not the notes.** Working notes, benchmarks and session details are evidence, never the spine or the hook. Build the outline on the goals he states and why he works the way he does. Data he asks for goes in one section, not the title. If he says "don't get in the weeds", cap numbers at one or two lines per section. Ask what matters to him instead of inferring priority from the volume of notes, and don't pad with tools he doesn't use. Why: he rejected a dev-setup outline that led with a git-status benchmark, and a Proxmox GPU refresh that turned into a benchmark post.
- **"In the style of <post>" means mirror that post's section structure literally**, even where it conflicts with this skill's header rules. His explicit request wins.
- **Recap, don't dump.** Each section lands one idea with one piece of evidence and at most one short code sample. Recap what Joe ran and tell readers to run their own version; don't re-run his benchmarks. Cut alias tables, setup walkthroughs, every config field, caveat stacks and full data tables. A first-hand recap counts as original data. Why: he called a draft with an alias table and setup walkthrough "AI slop, garbage, too much detail."
- **Experiment posts open with Joe's question and how he tested it**, findings next, methodology and full results at the bottom. Never frame a tool as failing at something it never promised, and give null results neutral labels ("Metadata alone", not "Frontmatter did nothing"). Why: a title saying Open Knowledge Format "didn't shrink my CLAUDE.md" was "a false promise" - OKF never claimed to shrink anything.
- **Lead with the demo.** A playable embed or try-it tool goes right after the intro, before the backstory. Placing it after "How it works" buried the lead on the DOOM post.
- **Employer stories stay vague on purpose.** Generic labels ("a docs team at a database company") are fine. Never ask for company, product, team or people names, don't flag the vagueness as an EEAT must-fix, and don't rewrite it as a composite. Get first-hand texture from process details instead. Why: they're real current and past employers, and naming them burns bridges.
- **Run every phase** for a new post, or a post or project page whose copy changes a lot, even when Joe is iterating fast. Don't draft first and review afterwards. Vale runs as `npm run test:voice` (part of `npm test`). Why: two launch posts skipped the pipeline and shipped headings Joe called "AI-generated slop."
- **Fix AI tells by cutting or saying it plainly**, never by adding jokes, fragments or feelings.
- **Open it before asking for approval, at every gate.** Topic pitch, outline, draft, meme pitches, scenes, charts, hero card, final summary: write what Joe is approving to a file and open it on his screen yourself (`code <file>` for text he edits: the pitch, outline and draft; an HTML page opened in the browser for anything visual: scenes, charts, memes, hero cards), then call AskUserQuestion. A chat summary or a question box is not something he can review. Topic and outline go to `<scratchpad>/{slug}-proposal.md` and `<scratchpad>/{slug}-outline.md`. Why: he was asked to approve a topic pitch that was never opened (2026-11-10): "How can I approve something you never opened?"

### Product posts and project pages

- **A `/work/{slug}` page (`src/data/projects.ts`) is a short overview**: about 2 intro paragraphs, 3 step cards, about 4 visuals, and a GitHub CTA. Config, YAML and install steps stay in the repo docs. The blog post is the story: why Joe built it, build vs buy, how it fits his house and life. Old history gets one line. Project pages get the voice and fact-check reviewers too. Why: the first PixelPane page had "too much going on" and its post was config-heavy.
- **Clips show the app's own UI in use** (menus opening, buttons clicked, things rendering), each placed under the paragraph whose claim it demonstrates. No old tour videos, start-page stills, recordings of playback, or clips stacked at the end of a section. Before recording, get a shot list approved (section | what the text claims | what the clip shows). Record a separate app instance on a scratch, de-branded copy (no CData), capture only the app's windows, and trim so the first frame shows the feature (the video player shows frame 0, no poster). Change the text to match what was recorded. Skip table-stakes features like undo: "talk about what's special."

## Phase 0: Setup

### 0a. Read style guide and project docs

1. Read `STYLE_GUIDE.md` at the repo root before writing. Its hard rules (em dashes, banned words) fail CI via Vale.
2. Posts live in `src/content/blog/{slug}.md` and images in `public/images/blog/{slug}/`. Stills are WebP and animations MP4; drop raw PNG/JPG/GIF in and the pre-commit hook converts them.
3. Read `src/content.config.ts` for the frontmatter schema.

### 0b. Category-specific voice calibration

After determining the post's category (Phase 1a), read 2-3 posts FROM THAT SAME CATEGORY to calibrate voice. Use Grep to find posts by category:

```bash
grep -l "categories:.*'Homelab'" src/content/blog/*.md
```

Read at least the first 100 lines of each matching post. Pay attention to:

- How Joe opens posts in this category (narrative vs technical vs opinion)
- Sentence rhythm and paragraph length patterns
- Level of technical detail vs personal anecdote
- How he handles transitions between sections
- Specific phrases or patterns he reuses

If fewer than 2 posts exist in the category, supplement with posts from related categories.

### 0c. Voice examples to internalize

These are REAL excerpts from Joe's writing. Match this energy, not a sanitized version of it:

**Strong opinionated opening:**

> "Look, I need to get something off my chest."

**Honest frustration:**

> "It's 2025. This workflow is absolutely barbaric."

**Self-deprecating setup:**

> "I naively assumed that migrating from Alexa would involve some configuration tweaking."

**Technical with personality:**

> "The \*arr ecosystem is an architectural masterpiece - Sonarr and Radarr orchestrate complex workflows, Overseerr provides RESTful request management, and the entire stack scales horizontally with Docker compose files that would make infrastructure engineers weep with joy."

**Short punchy paragraph after a long one:**

> "But music? Music is where technical elegance goes to die a slow death."

**Acknowledging when he changed his mind:**

> "Home Assistant - originally avoided it in the first post, now it's the orchestration hub for the entire lab. Sometimes your concerns change as you learn more."

### 0c-ii. Posts Joe holds up as models

Joe named these as blog posts he likes a lot (2026-11-10). Read the one that fits the post before outlining.

- **Paul Graham, [Hackers and Painters](https://www.paulgraham.com/hp.html)**: the model for an essay or opinion post. The first paragraph overturns the reader's picture ("Both of these images are wrong."). The argument moves by concrete people and objects (Leonardo's juniper bush, a pencil versus a pen), never by abstractions. Each section leaves one line worth quoting ("It should be a pencil, not a pen."). First person, plain words, long sentences broken by very short ones, asides pushed into footnotes. It has no images at all: the prose carries everything. Its lack of headings is a choice for an essay; keep this skill's heading rules unless Joe asks for it "in the style of" the essay.
- **Ralph Ammer, [The Creative Playground](https://ralphammer.com/how-to-get-started/)**: the model for how a post uses animation. About 1,000 words carry 11 small looping drawings, each sitting directly above the paragraph whose bolded term it shows. Every one of them shows something changing: a square folds into a crane, then a rabbit, then a plane, and back to a square. The frame-by-frame breakdown and the rules we take from it are in the `explainers` skill (`references/craft.md`, "Model post: Ralph Ammer"). Phase 2c applies them.

### 0d. Sync main

Posts ship straight to main (global Git rule), so there's no post branch:

```bash
git checkout main && git pull origin main
```

---

## Phase 1: Topic Proposal & Research

### 1a. Topic Proposal

If $ARGUMENTS is a file path, read it for notes/plans. Otherwise, use $ARGUMENTS as the topic.

Before proposing, load the **`personal-marketing`** skill (Skill tool) and read its `references/ideas.md`: search the target query, read the top results and note the format that ranks. If the post launches something (a project, repo, series or talk), also read `references/launches.md` and pick the launch tier. Skip both for an employer crosspost (`writtenFor` set): that skill is personal brand only.

Present the topic to the user with:

- **Working title** (opinionated, Joe's voice - not generic)
- **One-paragraph pitch** - what's the angle? What makes this worth reading?
- **What it adds** - one sentence on what this post has that none of the top results do. No sentence: say so, and suggest dropping the idea or making it a share-only piece
- **Launch tier** - only when the post launches something (from `launches.md`)
- **Target audience** - who cares about this?
- **Category** - one or two of: Homelab, Web Dev, Career, AI, Cloud, Life (`BLOG_CATEGORIES` in `src/utils/categories.ts`; anything else fails the build)
- **Written for** - a post written for an employer (a crosspost) sets `writtenFor` to one of `EMPLOYERS` in the same file; personal posts leave it out
- **Estimated length** - short (800-1200 words), medium (1500-2500), long (3000+)

Write the proposal to `<scratchpad>/{slug}-proposal.md`, open it with `code`, then use AskUserQuestion to get approval before proceeding.

### 1a-ii. Headline test

Before moving on, launch **Agent: `blog-headline-tester`** with the working title, primary keyword, and one-sentence thesis. Use the top-ranked title (or a hybrid) as the title going into Phase 2. If the current working title ranks first, keep it.

Also ask the user whether the post is aimed at Hacker News or Reddit. If it is, tell the headline tester, and apply **Distribution fit: Hacker News and Reddit** (Phase 3) while drafting. HN asks submitters to use the original title, so the H1 *is* the HN title. Get it right now, not at submission time.

### 1b. SEO Research

Use WebSearch to research the topic from an SEO angle:

- Search for the primary topic to see what currently ranks
- Identify 2-3 target keywords/phrases people actually search for
- Note what angle competitors take (so we can differentiate)
- Check Google's "People also ask" and related searches for content gaps

The post should target these keywords naturally - never stuff them. Use the primary keyword in:

- The title (H1)
- The slug
- The meta description
- At least one H2
- The first paragraph

### 1c. Independent Research

Launch two sub-agents in parallel to handle research:

**Agent: `blog-source-researcher`** - verifies current versions, dates, product names, and what's changed. Produces a sourced findings list to inform the draft.

**Agent: `blog-competitor-analyst`** - finds the top-ranking competing pages, outlines them, and returns an explicit gap analysis (sections/angles the field covers that this post should address or differentiate from).

Wait for both reports before proceeding to outline. Incorporate their findings into Phase 2.

**Check for restricted content:** If the source notes/plan mention topics marked "DO NOT INCLUDE" or "SENSITIVE", respect those restrictions throughout all phases. Never include restricted topics in the outline or draft.

---

## Phase 2: Outline

Create a detailed outline with:

- H2/H3 section structure
- Key points per section (2-4 bullets each)
- Where personal anecdotes or opinions go
- Where technical details, code blocks, or specs go
- Which claims need source backing from research
- A TL;DR draft (for posts over ~1500 words)
- Where to link to other joekarlsson.com posts (see Phase 2b)

### 2a. Voice check the outline

- Do the headers say what's in each section or give its answer, with no teasers? (Good: "Desktop GPUs don't fit in a 2U server", "Why does Lidarr suck?" Bad: "The GPU lesson nobody warned me about", "Lidarr Limitations".) Read only the headers. Do they give the gist of the post? Are most of them short plain labels, with a full-sentence claim only where the answer is the point? A post where every header is a sentence-length claim reads as a template. Do the H3s follow the H3 rules in STYLE_GUIDE.md **Headers**?
- Does the flow feel like a story or a Wikipedia article? It should feel like a story.
- Is there a strong opening hook?
- Do sections vary in length? (NOT every section should be 3 paragraphs)

### 2b. Internal linking plan

Launch **Agent: `blog-internal-link-scout`** with the post's title, slug, and primary + secondary keywords. The agent searches the full blog corpus and returns:
- **Part A**: 2-5 existing posts the new post should link to, with anchor text and section placement
- **Part B**: 2-4 existing posts that should be edited to link back to the new post (for follow-up after publishing)

Use Part A findings to mark link placements in the outline. Save Part B for after the post ships.

Before presenting the outline for approval, launch **Agent: `blog-positioning-reviewer`** in **OUTLINE mode** with the research brief and proposed outline. Incorporate its findings - making sure headers say what's in the section (not turning every header into a claim), adding the named frame if one is needed, and adjusting the intro so it leads with the conclusion.

Write the full outline (with positioning improvements applied) to `<scratchpad>/{slug}-outline.md`, open it with `code`, then use AskUserQuestion:

- Approve outline
- Request changes (specify what)
- Cancel workflow

Do NOT proceed without approval.

### 2c. Plan the collage scenes

Once the outline is approved, run the project `explainers` skill (Skill tool) on it. Pick two or three moments that are scenes someone can picture (a guest waving at the lights, an agent walking into a locked door) and take each through the skill's gates: the idea (claim, the everyday object that does it, 3-6 pieces, field color, assembly order, label), then the cut-out elements, then an approval still. Joe approves each gate by number. They are paper-collage stop motion in the pasteup look, never diagrams; boxes and arrows belong to the `diagrams` skill. Approved scenes are rendered into the post (`npm run collage -- <scene.json> --post ...`) before Phase 6, so the reviewers see the real thing. Pitch each scene as a change (what the frame turns into), not a picture, the way Ralph Ammer's post does (`craft.md`, "Model post: Ralph Ammer"). A small animation that shows how something in the post works is made as an animated figure with the `diagrams` skill, never a video: Joe's preferred way (its "Animated figures" section). If no section has a scene in it, say so and skip this phase. Why: Joe wants posts to move as more than boiling diagrams, rejected diagram step-throughs, crayon stick figures and a slick serif-and-glass-card mock, and picked pasteup's collage look (2026-11-10).

---

## Phase 3: Draft

Write the complete blog post following these rules strictly:

### Voice Rules (from STYLE_GUIDE.md)

- First-person singular ("I", "my") - this is a personal blog
- Conversational and opinionated - real takes, not corporate hedging
- Technically detailed - specific tools, versions, error messages, config snippets
- Honest about frustrations and limitations
- Self-deprecating humor where natural
- Mix paragraph lengths - some short punchy ones, some longer explanatory ones
- Bold for emphasis on key phrases, not whole sentences
- Contractions are good

### Energy and storytelling

Joe's posts tell stories from things that actually happened to him. A draft that reads like a spec sheet or a Wikipedia article needs real scenes and opinions from his notes, not added jokes.

#### Storytelling techniques Joe actually uses:

- **Real scenes only.** Put the reader in a moment Joe actually described. Never use a stock opener ("Picture this: it's 11 PM...") or invent a time, place, or reaction.
- **Real dialogue:** Quote Joe, a guest, a forum post, or the error message the server threw. Only quotes that exist in his notes or the source. Joe lives alone, so never write "my partner said".
- **The setup/punchline rhythm:** Build up something serious or technical, then puncture it with humor. "The \*arr ecosystem is an architectural masterpiece... But music? Music is where technical elegance goes to die a slow death." One or two per post, where the material earns it. A punchline on every paragraph is the strongest AI tell readers call out.
- **Emotional honesty:** "This drove me insane." "I spent two days debugging this and wanted to throw the server out a window." Don't sanitize the frustration.
- **The "I was wrong" moment:** Joe freely admits when he was wrong or naive. This builds trust and makes the writing relatable.
- **Specific sensory details:** Not "the server was loud" but "the R730 sounds like a jet engine during POST." Only details from Joe's notes.

#### What makes a section FUN vs BORING:

- **BORING:** "The R730 has dual Xeon E5-2698 v4 processors with 20 cores each." (spec sheet)
- **FUN:** "The R730 has dual Xeon E5-2698 v4s, 40 cores in a box that lives in my attic. I bought it for the PCIe slots. The cores average 13% busy."
- **BORING:** "I set up VLANs for network segmentation." (Wikipedia)
- **FUN:** "I don't want my $15 smart plug from some company I can't pronounce to have network access to my NAS full of family photos. VLANs fix this."

#### Memes and visual humor

Include memes where they fit naturally. Make them with the **Meme generation step** below, which enforces format rotation. Memes should:

- Be placed at natural breaks between major sections
- Reference the actual content (not generic tech memes)
- Use the same humor style as Joe's writing (self-deprecating, specific, honest)
- Be saved to the post's image directory and included with descriptive alt text
- Aim for 2-4 memes per long post, 1-2 per short post
- Don't force them - skip if no meme fits naturally

#### The energy test:

Read each section aloud and ask: "Would I keep reading this if it showed up on my RSS feed?" If the answer is no, the section needs more personality, more specific details, or a complete rewrite. Technical accuracy with zero personality is worse than a slightly less detailed post that's actually enjoyable to read.

### PROHIBITED (will fail CI if present)

- NO em dashes - use regular dashes or rewrite
- NO words from the banned list: delve, tapestry, realm, embark, beacon, spearhead, bustling, poised, amidst, testament, hallmark, bedrock, linchpin, crucial, multifaceted, ever-evolving, groundbreaking, meticulous, commendable, plethora, myriad, comprehensive, holistic, paradigm, synergy, leverage, harness, foster, cultivate, streamline, elevate, navigate, underscore, robust, pivotal
- NO filler words: very, really, quite, extremely, incredibly, absolutely (unless for emphasis in Joe's voice), definitely, certainly, basically, essentially, fundamentally, literally, ultimately
- NO banned openings: "In this world," "In today's," "In the realm of," "It's no secret," "In this article we will," "Before we dive in," "Let's get started"
- NO banned transitions: "In fact," "Indeed," "Furthermore," "Moreover," "Additionally," "In other words," "In summary," "To sum up," "In conclusion," "All in all"
- NO marketing speak: "Game-changer," "paradigm shift," "seamless," "revolutionize," "future-proof," "cutting-edge"
- NO hashtags ever

### Analytical structure (Thompson / McKenzie)

These are the moves that separate analysis from topic coverage. They apply to written posts the same way they apply to video.

**Lead with the conclusion, then build the argument.** Open with the insight the post earns, then explain why. Front-load the analytical frame: "There are two distinct trust problems in enterprise MCP deployments. The roadmap solves one of them." The reader knows the thesis before they invest in the detail.

**Name the frame explicitly.** Give recurring concepts a name and use it. "Call this the two-auth-boundary problem." Named frames stick. Repeated gestures at the same idea don't.

**Analytical claims live in the opening sentence, not the header.** A section's first sentence should make a claim, not announce a category. Headers follow the **Headers** rules in STYLE_GUIDE.md, and the default is a short plain label ("The rebuild", "Why not just buy a Pixoo", "What's next"). Use a claim header only for the one or two sections where the answer is the point, and keep it short. Never make every header a full sentence; Joe reads that template as AI slop. A header is either a plain label for what's in the section or a claim that states the section's answer ("Desktop GPUs don't fit in a 2U server"). A claim that holds back its answer ("The GPU lesson nobody warned me about") is a teaser, and teasers fail.

**State opinions plainly.** "Priority 3 is the one that matters" is a take. "Priority 3 is important" is not. Every post should have a point of view, stated directly, not hedged away.

**Name what everyone's thinking but not saying.** If a tool, spec, or decision has a catch, say the catch. "The roadmap addresses one of two auth problems. The other one it leaves to you." Don't bury the thing the reader most needs to hear.

**Specific, named scenarios over categories.** "Salesforce, SQL Server, NetSuite" beats "enterprise data sources." Name the actual system, error, config value, or dollar amount. Specificity is credibility.

**Honest about what doesn't work yet.** "The conformance testing harness doesn't exist yet; watch for it and integrate it when it ships" is a real recommendation. "SDK developer experience improvements are coming" is noise.

**Per-section tactical call.** After explaining a trade-off or priority, tell the reader what to actually do. "Here's what I'd actually do" turns analysis into a recommendation, not a survey.

---

### Anti-AI structural patterns (CRITICAL)

AI writing has tells beyond word choice. Older models wrote uniform 15-25 word sentences in uniform paragraphs. Current models overcorrect: fragment stacks, a punchline closing every paragraph, staged reveals, performed honesty. That's what got the homelab post called "whole goddamn thing written by a model" on HN in October 2026, and several of the old rules in this section caused it. Vary length because the thoughts vary, not to create a beat. The `humanizer` skill (`~/.claude/skills/humanizer/SKILL.md` (source: `~/claude-skills/.claude/skills/humanizer`)), patterns 41-52, is the reference, and STYLE_GUIDE.md **Moves that read as AI even in my voice** has the short list.

#### Sentence-level rules

- **MEASURE your sentence lengths.** After drafting, count words per sentence in each paragraph. If more than 3 consecutive sentences are within 5 words of each other in length, rewrite. Aim for a mix like: 4 words, 22 words, 8 words, 31 words, 6 words.
- **No fragment stacks.** A single fragment is fine where Joe would say it out loud. Two or more in a row ("Third time. A week each time. Nobody noticed.") is a tell.
- **Conjunctions and parentheses are fine where they're natural.** Don't hit a quota.
- **Read the last sentence of every paragraph on its own.** If most of them are punchlines, morals, callbacks, or reversals, make most of them plain.
- **No performed honesty or narrated rigor.** State caveats and results directly. No "Full disclosure:", "I'd rather say so than have you find it", or "I never measured that. For this update, I did."
- **Vary sentence openings.** Never start 3+ consecutive sentences with the same word.
- **No staged reveals.** "Know what happened next?", "The funny part:", "The catch:", "Turns out", "The result? X." Say the thing.

#### Paragraph-level rules

- Let paragraph and section length follow the content; uniform 3-4 sentence paragraphs read as generated.
- Vary how sections are built. Some are a code block with one sentence of context, some a long digression, some a list.
- Stop a section when the point is made, without a summary sentence.
- Weight pros and cons by how Joe actually feels. If something sucks, spend the space on why.

#### Post-level rules

- **DO NOT** transition smoothly between every section. Sometimes Joe just jumps to the next topic. Real writing has abrupt shifts.
- **Say each finding once in the body.** The layout renders the TL;DR right above the intro, so the intro can't restate it: give the evidence or the stakes instead. Don't preview the sections in order, and don't end with a recap of the intro or a "Takeaways"/"Key takeaways" list of bold slogans. End on the last new thing. The frontmatter FAQ may restate answers for search, but don't add a second summary in the body. In Nov 2026 reviews of three recent posts, this repetition was the main reason they read as AI (humanizer pattern 46).
- **Vary section lengths dramatically.** If your longest section is 8 paragraphs, your shortest should be 1-2. Never have all sections within 1-2 paragraphs of each other.
- **Break the pattern.** If you've written 3 sections that each start with a narrative paragraph, make the 4th start with a list or a question or a code block.
- **Include specific numbers and details** that only someone who actually did this would know (exact error messages, specific config values, dollar amounts, timestamps).
- **Use the long-then-short rhythm sparingly.** A detailed paragraph followed by a one-liner creates impact once or twice a post. "But music? Music is where technical elegance goes to die a slow death." Used every section, it turns into the template readers recognize as AI.
- **One number per point.** Original data is the point of these posts, but stacked 7-day and 30-day averages, peaks, and decimals read as a model dumping query results. Pick the number that makes the point and round it.

#### Self-check: The Burstiness Test

After drafting, perform this check:

1. Count sentences per paragraph for the first 10 paragraphs
2. If the standard deviation is less than 2.0, the writing is too uniform - rewrite
3. Count words per sentence for any 5 consecutive sentences
4. If they're all within 5 words of each other, rewrite at least 2
5. Read 3 random paragraphs aloud. If they all have the same rhythm/cadence, rewrite.

### Frontmatter

```yaml
---
title: 'Post Title Here'
date: YYYY-MM-DDTHH:MM:SSZ
slug: 'url-friendly-slug'
description: 'One-sentence description for SEO/social cards (under 160 chars, include target keyword)'
categories: ['Category']
heroImage: '/images/blog/{slug}/thumb-<hash>.webp' # set by npm run thumbnails:work (Phase 7)
heroAlt: 'Descriptive alt text for the hero image'
tldr: 'TL;DR summary for the frontmatter field'
---
```

`date` is the publish time: Central wall-clock time with a `Z` on the end (`date +%Y-%m-%dT%H:%M:%SZ`). The time breaks same-day ties so the newest post sorts first, and the `Z` keeps the shown day right, because the site displays every date in UTC.

### Structure

- Put the TL;DR in the frontmatter `tldr:` field ONLY. The BlogPost layout renders it as a box above the body. Never also add a `> **TL;DR:**` blockquote in the body - that shows up twice (a test in `tests/content-schema.test.ts` fails if you do)
- Strong opening hook - not a generic intro
- Narrative flow through sections
- Code blocks with context (explain WHY before showing)
- Specific numbers: CPU models, RAM amounts, versions, costs
- End with a real conclusion, not "In conclusion..."
- Include internal links to related joekarlsson.com posts (from Phase 2b)

### Distribution fit: Hacker News and Reddit

Apply this section when the post is meant for HN or Reddit. Both audiences are technical and skeptical, and they read the comments before the post. A post does well there when it gives them something they didn't have before, and when it holds up to someone checking the math in the first five minutes.

My track record so far: three joekarlsson.com submissions to HN (MikroTik binary API, DevRel 2026, Ship the Ugly Pot) all stalled at 1 point and 0 comments. Homelab and self-hosting posts that did well in 2026 had plain, specific titles. Examples: "My Homelab Setup" (350 points), "I tested every IP KVM in my Homelab" (312) and "CLI agents make self-hosting on a home server easier and fun" (775). Check `hn.algolia.com` for the topic before writing the title. It shows what has already been posted, and what scored.

#### Titles for Hacker News

- **The title is a plain statement of what the post contains.** HN's guidelines ask for the original title, with no editorializing and no linkbait. Moderators rewrite titles that break this, and baity titles get flagged. Write the H1 so it can be pasted into the submission form unchanged.
- **Specific nouns beat adjectives.** "Running two Dell R730s at home costs me $53 a month" beats "My amazing homelab journey". Numbers, model names and dollar figures do the work. Drop "ultimate", "everything you need", "you won't believe" and similar.
- **No gimmicks.** That means no ALL CAPS, no exclamation points, no emoji, no "(2026 guide)" suffix, and no site name in the title. Leading list numbers like "10 lessons" are a weak frame for HN. HN's software also rewrites some title patterns automatically, so check the live title after submitting and fix it during the edit window.
- **Don't use a colon to bolt a label onto a claim.** "My Homelab Two Years Later: From Desktop Tower to Server Rack" reads as SEO filler on HN. Pick one half, preferably the half with the claim or the number.
- **"Show HN" is only for something people can try.** That means a repo, tool or demo, not a blog post about it. If the post comes with a tool, submit the tool as Show HN and link the post from it.
- **Accurate beats exciting.** If the post is "what my homelab costs", the title should say that. A title that over-promises gets called out in the top comment, and that comment sets the tone of the thread.

#### Titles for Reddit

- **Every subreddit has its own rules, so read them before posting.** r/homelab, r/selfhosted, r/homeassistant, r/Proxmox, r/programming and r/devops all have different self-promotion rules. Some ban blog links outright, some want a text post or a flair, and many expect your account to participate beyond posting your own links (the old guideline was roughly 9 contributions per self-promotion post).
- **Reddit titles can be more personal and descriptive than HN titles.** Write them as a person talking to the sub: "Two years and $7,400 later, here's what my homelab actually costs to run (with metered power data)". A question or an invitation brings in comments, and comments drive ranking.
- **Lead with the thing the sub cares about.** r/homelab votes on rack photos, power numbers and hardware. r/selfhosted votes on the service list and the "what I replaced" angle. r/homeassistant votes on the automation itself. One post can produce several angles, so write a different title for each sub and never cross-post the same title everywhere.
- **Prefer a text post with the substance inline.** Use 3-6 bullets of the actual findings and put the link at the bottom. A bare link to your own blog reads as promotion. A summary that stands on its own reads as a contribution.

#### Content that survives HN and Reddit comments

- **Follow STYLE_GUIDE.md "Writing About Infrastructure and Technical Decisions".** Every spec gets a reason, every fix names its cost, and numbers replace adjectives. Also say whether a number is measured or guessed, and make sure claims don't contradict each other.
- **Original data or first-hand experience is the whole point.** That means metered numbers, real configs, costs, failure stories and benchmarks you ran yourself. Commenters forgive rough writing when the data is real. They don't forgive a well-written summary of things they've already read.
- **Every number must be internally consistent.** HN will multiply your watts by 24 and compare the result to your kWh. It will check core counts against Intel ARK and add up your cost tables. Before shipping, recompute every derived number in the post (totals, averages, break-even, per-month vs per-year) and make sure the spec numbers match the vendor's spec sheet. Cores are not threads.
- **Concede the obvious objection in the post itself.** Every topic has its standard top comment. For homelabs it's "you could do this on a $150 mini PC" and "the power bill makes this a loss". For self-hosting it's "your time isn't free" and "what about backups?". For AI it's "a bigger hosted model would do this better". One plain paragraph that answers it (or concedes it) takes that comment away. Answer it in a normal sentence ("Yes, a couple of mini PCs would run most of this"), don't label it ("The obvious objection:").
- **Be careful with anything that sounds like piracy, security theater or astroturfing.** "Replaced Netflix with Plex plus the \*arr stack" invites a thread about piracy instead of your post. Frame media in terms of what you own, or leave it out. Disclose employer ties and sponsorships up front.
- **Keep the memes, and make them earn it.** Memes are part of Joe's voice and stay in HN- and Reddit-bound posts too. Don't recommend cutting them. On these audiences, each meme has to joke about a specific finding in the post, land after the point instead of replacing it, and not echo the header above it (STYLE_GUIDE.md **Memes**). Keep them out of the first screen so the opening is substance.
- **Headers are the skim layer.** HN and Reddit readers scan the headers before deciding whether to read. Use plain labels or claims that contain the answer ("Desktop GPUs don't fit in a 2U server"), never teasers. Top posts in this space use headers like "The hardware", "Step 4. Backup" and "Immich is actually great". See STYLE_GUIDE.md **Headers**.
- **Open with substance, not a warm-up.** Readers decide within one screen. The first paragraph should state the claim or the headline number, not "Look, when I wrote..." throat-clearing. Use the TL;DR box for the numbers.
- **Date-sensitive claims need dates.** Prices, versions and "currently running" lists go stale. Write "as of <month year>" and link the primary source. A retired project in your "what I run" list (for example, Readarr was retired in June 2025) signals the post is out of date.
- **Make the page easy to load.** The page needs to be fast, readable without JavaScript, free of popups and newsletter modals, and fine on mobile. HN traffic arrives all at once, so check the page and its images before submitting.

#### Submission (for the user, not the agent)

Never submit, vote, or ask anyone to upvote on the user's behalf. HN's voting-ring detection penalizes coordinated upvotes, and Reddit treats them as vote manipulation. When the post is ready, give the user:

- The HN title (normally the H1, unchanged) and 2-3 Reddit titles, each tied to a specific subreddit and a check of that sub's rules
- A first comment for HN from the author: who you are, why you wrote it, and what you'd like feedback on. It should be 3-5 sentences and not a sales pitch.
- The 3 objections most likely to show up in the comments, with a one-line honest answer to each
- A timing note. US weekday mornings Eastern time are the usual advice, and it matters less than the title and the content. If an HN submission gets no traction, HN allows a resubmission after a while, and moderators sometimes put good posts in the second-chance pool.

### Photos and Visual Content (IMPORTANT)

Blog posts need visual breaks. Walls of text kill engagement. Include:

**User photos:** Ask the user if they have photos related to the post topic. Check `~/Downloads/` for photo directories. Convert HEIC to JPEG with `sips` and save the JPEG to `public/images/blog/{slug}/`; the pre-commit hook converts it to WebP. Every photo needs descriptive alt text.

**Memes:** see the Meme generation step below. Never pick templates from memory.

**Diagrams:** Never draw a diagram as ASCII in a code block. Architecture maps, wiring, network topologies, before/after comparisons and flow charts all go through the project `diagrams` skill (Skill tool), which draws them as cut-paper SVGs with real logos, a phone layout and the site's boil on arrows and paper edges. Preview the figure with Joe before it goes in the post. Why: the recording-setup-tour post shipped with an ASCII wiring diagram, and Joe asked for it to be replaced with an animated, boiling one (2026-11-09).

**Animated explainers:** the collage scenes approved in Phase 2c and any animated figures sit under the paragraph whose claim they show, as inline animated SVGs (`![alt](/images/blog/{slug}/<scene>.svg)`), never an MP4: Joe doesn't want a play bar on a post's animation (2026-11-10). Their finished frame is what reduced motion and the pause button get.

**Placement:** Alternate between photos, memes, and diagrams throughout the post. Place them at natural section breaks. Never have more than 3-4 paragraphs of prose without a visual element.

### Meme generation step (format rotation is mandatory)

Memes are a step, not an afterthought. Run this after the draft text exists, so the jokes point at real lines in the post, and before you show the draft.

Past posts leaned on the same few formats over and over (Drake alone showed up six times), and pitches kept circling the same handful of favorites. The rules below exist to stop both.

**1. Audit what the blog already uses.**

```bash
python3 scripts/make-meme.py used
```

It prints how often each format appears across every post, which formats the 5 most recent meme posts used, and an "off the table" list.

**2. Pull a fresh sample to pitch from.**

```bash
python3 scripts/make-meme.py templates
```

It prints 40 formats picked at random from about 275 (ImgFlip's top 100 plus memegen.link's catalog), different every run, with the off-the-table ones already left out. Each line has the id to pass to `make`, the number of text slots, `panels` when the script knows where its text goes, and a Know Your Meme link. Open the link for any format you don't know cold, so the joke uses the format the way people actually read it.

**3. Rotation rules. These are hard rules, not suggestions.**

- **Every format you pitch comes from this run's sample.** Never from memory, never from a past post, never from a list in this file. Why: Joe said the pitches kept recommending "the same five or six memes over and over" (2026-11-10). If nothing in the sample fits a joke, run `templates` again for a new sample instead of reaching for a favorite. `templates --all` is for looking up a format Joe names himself.
- **Never use a format on the off-the-table list.** That's any format used 3 or more times across the blog, or used in any of the 5 most recent posts with memes. The script's live output is the list.
- **Never repeat a format within a post.**
- **Make the joke generally funny.** Captions are about an experience any developer recognizes (agents, docs bloat, "I'll just add one more line"), not Joe's config details or his own numbers. Why: he rejected a set of pitches as "way too specific about my setup."
- **Vary the joke structure, not only the template.** Two "reject this, pick that" comparisons in one post count as a repeat even with different templates. A set of 5 pitches spans at least 4 structures (a choice, an escalation, a plan going wrong, a reaction, a sameness, persistence, a mislabel...).

**4. Pitch before you generate.** Offer at least 5 ideas, each with a different format, and use AskUserQuestion (multiSelect) to let Joe pick. For each idea give the section it goes in, the format, the exact caption for every slot, and one line on why that format fits the joke.

Write out the joke's mapping before you pitch it: "The joke is X. The slots are A, B, C. So A gets ..., B gets ..., C gets ...". If the mapping feels forced, the format is wrong; pick another from the sample. While mapping:

- **One item per slot.** When the joke compares two things and the format shows them on separate panels, each goes on its own panel, never "A vs B" squeezed into one.
- **Check for captions baked into the image.** Some formats already carry their punchline (They're The Same Picture's yellow subtitle). Look at the blank template first (the `image` the script downloads, or the format's Know Your Meme page) and leave that slot empty instead of writing the punchline twice.
- **Short and concrete.** A few words per slot. A sentence-long caption kills the joke.

**5. Generate locally.** No ImgFlip credentials needed; the script downloads the blank template and captions it with Pillow.

```bash
# Captions in the format's own panels, in slot order, tilt included (formats marked "panels")
python3 scripts/make-meme.py make --template <id> --style panels \
  --caption "First slot" --caption "Second slot" --caption "Third slot" \
  --out public/images/blog/{slug}/meme-<format>.webp

# Caption in a white band above the image (works on any template)
python3 scripts/make-meme.py make --template <id> \
  --caption "When Claude offers to run the full test suite to change a comment" \
  --out public/images/blog/{slug}/meme-<format>.webp

# Formats without panels: place text by hand, coordinates as fractions of the image (x0,y0,x1,y1)
python3 scripts/make-meme.py make --template <id> \
  --box "0.28,0.1,0.5,0.3=First panel" --box "0.52,0.1,0.73,0.3=Second panel" \
  --out public/images/blog/{slug}/meme-<format>.webp

# Classic white Impact top/bottom text
python3 scripts/make-meme.py make --template <id> --style impact \
  --caption "Top text" --caption "Bottom text" --out ...
```

With `panels`, pass fewer captions than slots to leave the last ones empty (a baked-in punchline). Text color flips to white with an outline on dark backgrounds. **Open every generated meme with the Read tool and look at it** before placing it: fix text that lands on the wrong panel, captions that wrap badly, or text that's hard to read, then regenerate.

**6. Name the format in the alt text**, e.g. `![Left Exit 12 Off Ramp meme: ...]`. The audit in step 1 only counts formats it can find in alt text, so an unnamed format never gets rotated out.

Write the draft to `src/content/blog/{slug}.md` so subsequent phases can grep and edit the file directly.

**Run the full `humanizer` skill (Skill tool) on the draft before Joe sees it, and again after every round of edits, before each time you show or ship it.** That means the whole process: fact ledger, Joe's voice samples, rewrite, rubric loop with the quotable-line cap, fact diff. The `ai_tells.py` hits from the post-edit hook, Vale and `blog-voice-reviewer` don't count as the humanizer. In the summary, say which humanizer steps ran. On later rounds it should fix only lines with a confirmed tell and copy the rest exactly, so a re-run never churns paragraphs Joe already approved. Why it runs every time: on the recording-setup-tour post (2026-11-09) only the scanner and the voice reviewer ran, and the draft reached Joe with a joke and an opinion he never said. He asked "Wait, why did that not run? That needs to happen every time for these blog posts."

Open the draft in VS Code for Joe to review (`code src/content/blog/{slug}.md`) - do this every time, without asking, and again after any round of changes he requests. Don't paste the full draft inline; give a short summary (word count, sections, memes, anything he needs to confirm) and use AskUserQuestion:

- Approve draft
- Request changes
- Cancel workflow

Do NOT proceed without approval.

---

## Phase 4: Self-Edit Pass

Re-read the entire draft with fresh eyes. This is a REVISION pass, not a proofreading pass.

### 4a. Voice review agent

Launch **Agent: `blog-voice-reviewer`** with the draft file path. The agent applies three layers:
1. Joe's personal voice rules (STYLE_GUIDE.md hard rules - em dashes, banned words, etc.)
2. Analytical structure check (Thompson/McKenzie - does the intro lead with the conclusion, are headers mostly short plain labels with no teasers and no sentence-length claim template, are opinions stated plainly)
3. AI-pattern audit (humanizer pass - fragment stacks, quotable closers, performed candor, staged reveals, decorative numbers, plus the humanizer's rubric with the quotable-line cap and fact diff against Joe's 2020 voice sample)

Apply every **must-fix** edit before proceeding. Apply **should-fix** edits where they improve the writing. Use the agent's anti-AI audit to find and rewrite the spots that still read as assembled.

**Re-run note:** If the voice reviewer's must-fix list is long (5+ items, or requires restructuring the intro or more than one full section rewrite), re-run `blog-voice-reviewer` after applying those changes before moving on. The Phase 6 agents will run on whatever state the draft is in - don't let them review a pre-fix version.

### 4b. Voice Comparison

Re-read the category-specific posts from Phase 0b. Compare the draft's tone, rhythm, and structure to Joe's actual writing. Rewrite only sections where you can name what sounds unlike Joe, and only the sentences that cause it. If nothing does, change nothing. Rewriting sections that were fine is how drafts end up flat and even.

### 4c. Sentence craft

Apply after structure and voice are right. This is where writing earns its keep or doesn't.

- **Strip every sentence.** If a word can be cut without losing meaning, cut it.
- **Use active verbs.** Passive constructions bury the actor. "Astro builds the page" beats "The page is built by Astro."
- **Cut qualifiers.** Very, quite, rather, somewhat, pretty much, basically, essentially - these weaken every sentence they touch. If a fact is true, state it directly.
- **The lead earns the second sentence.** If the first sentence of a section is warming up, cut it and start on the real point.
- **End paragraphs on the strongest point.** Not a vague summary. Not a trailing qualifier. The last sentence of a paragraph should be the one worth keeping.
- **End when you're done.** Don't add a closing paragraph that restates the opening. Stop when the point is made.

### 4d. Specificity Check

Scan the draft for vague claims. Every one of these should be replaced with a specific detail:

- "significantly improved" -> "cut response time from 2.3s to 140ms"
- "several services" -> "47 containers across 2 hosts"
- "it was expensive" -> "my power bill went from $89 to $167/month"
- "after a while" -> "after about three weeks of running 24/7"

If you don't have the specific number, flag it for the user rather than being vague.

Save edits to the file.

---

## Phase 5: Fact Check & Link Verification

This phase is CRITICAL. Every claim and every link must be verified.

### 5a. Launch fact-checker agent

Launch **Agent: `blog-fact-checker`** with the draft file path and the source-researcher's findings from Phase 1c (as additional context, not as a substitute for independent verification).

The agent checks:
- Every factual claim (specs, versions, stats, prices, comparisons) against primary sources
- Every CLI command, config key, and code sample against current docs
- Every URL (external and internal) via HTTP check
- Claims missing inline source links

### 5b. Apply fact-check findings

For every **BLOCK** item in the report:
- Fix incorrect claims immediately using the agent's cited source
- Update broken links to the corrected URL, or remove if no replacement exists
- Soften or flag unverifiable claims for user review

For claims the agent flags as missing an inline source: add the source link at the point of assertion.

### 5c. Present Fact Check Report

Display the agent's report to the user, highlighting any must-fix items that require judgment (claims that can't be verified, links with no good replacement, or claims the user should confirm from personal experience).

Use AskUserQuestion if any claims or links need user input before proceeding.

---

## Phase 6: Voice & Style Validation

Run final review agents in parallel, then apply findings.

### 6a. Launch review agents (run in parallel)

Launch these three agents simultaneously with the final draft file path:

**Agent: `blog-eeat-reviewer`** - checks originality, first-hand experience, expertise signal, sourcing, and trustworthiness. A post that passes fact-check but has zero original insight gets a REVISE verdict here.

**Agent: `blog-seo-aeo-reviewer`** - checks meta description, title, keyword placement, internal links, FAQ/AEO extractability, and that the closing lands well.

**Agent: `blog-positioning-reviewer`** in **DRAFT mode** - checks that the post delivered its thesis and that the analytical stance is consistent.

### 6b. Apply findings

For each **must-fix** item across all three reports:
- Apply immediately (EEAT: add original beat or caveat; SEO: fix meta or keyword; Positioning: sharpen intro or hedged claim)

For **should-fix** items: apply where they strengthen the post.

### 6c. Prohibited Language Scan

Use Grep to search the draft for every prohibited word/phrase from STYLE_GUIDE.md. Fix any violations not already caught by the voice-reviewer agent in Phase 4.

### 6d. Em Dash Check

Search for any em dash characters (the actual em dash character, or triple hyphens ---). Replace with regular dashes or rewrite.

### 6e. Quality Checklist

Final human review before moving on. Verify each item:

- [ ] Does this sound like Joe talking, or like an AI wrote it?
- [ ] Are there specific examples from real experience (error messages, exact versions, costs)?
- [ ] Does confidence match certainty of each claim?
- [ ] Does the post open with its conclusion and build the argument from there?
- [ ] Do headers say what's in the section or state its answer, with no teasers, in sentence case? Do the H3s follow the STYLE_GUIDE.md H3 rules?
- [ ] Is there a clear point of view, stated plainly - not hedged away?
- [ ] Is structure varied and natural, not perfectly uniform?
- [ ] No em dashes anywhere?
- [ ] No prohibited words?
- [ ] No trailing qualifiers (very, quite, basically, essentially)?
- [ ] Would Joe actually say this out loud?
- [ ] All images have descriptive alt text?
- [ ] TL;DR present in frontmatter `tldr:` (and NOT duplicated as a body blockquote)?
- [ ] At least 2 internal links to other joekarlsson.com posts?
- [ ] Target keyword appears in title, slug, description, and first paragraph?
- [ ] Meta description is under 160 characters?
- [ ] Paragraph lengths vary (not all 3-4 sentences)?
- [ ] Section lengths vary (not all the same)?
- [ ] No two consecutive paragraphs start with the same word?
- [ ] Post ends when it's done - no closing paragraph restating the intro?
- [ ] EEAT: at least one original beat only someone who did this could write?
- [ ] EEAT: at least one honest limitation or "I haven't tested" moment?
- [ ] HN/Reddit (if targeted): title is plain and specific with no colon-label, and works pasted unchanged as the HN title?
- [ ] HN/Reddit (if targeted): every derived number recomputed (totals, W vs kWh, per-month vs per-year), and spec numbers match the vendor sheet?
- [ ] HN/Reddit (if targeted): the obvious top-comment objection is named and answered in the post?
- [ ] Memes: each one jokes about a real finding, doesn't echo its header, and isn't in the first screen?

### 6f. Spelling Check

Add any new technical terms to `cspell-custom.txt` so spell check won't flag them.

---

## Phase 7: Hero Image

The hero (also the feed thumbnail and og:image) is a public-domain photo that works as a metaphor for the post, drawn in the site's pink-and-black look. Follow `.claude/rules/metaphor-thumbnails.md`: pick the metaphor from the post's one idea, search Wikimedia Commons for a Public domain or CC0 photo, add it to `scripts/work-thumbnail-plan.json`, and run `npm run thumbnails:work -- {slug}`. The script sets `heroImage` and `heroAlt`.

Show Joe the card, the metaphor in one line, and the Commons link. If he has his own photo for the hero, use it instead (`"picture": { "image": "/images/blog/{slug}/<photo>.webp" }` in the plan, same command).

---

## Phase 8: Final Assembly & CI Check

### 8a. Verify blog post file

Confirm `src/content/blog/{slug}.md` exists and has the final content (written during Phase 3, edited during Phases 4-6).

### 8b. Verify image directory

Confirm `public/images/blog/{slug}/` exists with the `thumb-<hash>.webp` hero that `heroImage` points at.

### 8c. Run local checks

```bash
npm run format:check && npm run lint
```

If format issues: `npm run format` then re-check.

### 8c-ii. Design review (posts with anything beyond text)

If the post has a diagram, embed, interactive piece, wide table or custom component, run `npx astro build && npx astro preview` (note the port it prints) and launch **Agent: `design-reviewer`** on the post's preview URL with this repo. Fix its High and Medium findings (tap targets, phone overflow, unreadable diagrams on a phone, contrast). Skip this for a text-and-images post; the layout is already reviewed. A post with an animated explainer also gets **Agent: `motion-reviewer`** on the same URL.

### 8d. Run full test suite

```bash
npm test
```

Fix any failures (spelling, markdown lint, image validation, etc.)

### 8e. Stage and present summary

Show the user:

- Final post title and slug
- Word count
- Target keywords
- Internal links included
- Fact check summary (all green?)
- Link check summary (all 200s?)
- Voice check summary (all clear?)
- EEAT verdict (PASS / REVISE)
- SEO/AEO verdict (PASS / REVISE)
- CI check results
- Hero image (read the generated image to display it)

**Headline check:** Re-run `blog-headline-tester` with the final post slug, conclusion (as actually written - not the working thesis from Phase 1), and primary keyword. The title often shifts once the post is written. If the tester surfaces a stronger option, use AskUserQuestion to offer the swap before committing. If the current title still wins, move on.

**Inbound link follow-ups (post-publish TODO):** Display the Part B list from the `blog-internal-link-scout` report - these are existing posts that should be edited to link back to the new post. Present them as a numbered action list the user can tackle after the post ships. These don't block the commit.

Use AskUserQuestion for final approval before committing.

---

## Phase 9: Commit

After final approval:

```bash
git add src/content/blog/{slug}.md public/images/blog/{slug}/ cspell-custom.txt
git commit -m "feat: Add blog post - {title}"
```

Then push, run `npm run deploy`, and curl the live page to confirm (see CLAUDE.md Build & Deploy).

Then promotion (personal posts only, never employer crossposts):
- **A launch** (it had a launch tier in Phase 1a): hand the live URL and tier to the **`marketing-strategist`** subagent for the launch plan, show Joe the plan, then run `/social` for its posts.
- **Anything else:** offer `/social` with the live URL.

---

## Command Modes

### Default: Full workflow

Runs all phases sequentially with checkpoints.

### If $ARGUMENTS is a file path (to notes)

Read the file as topic notes/outline and use that as the starting point. Still run all phases but use the file contents to inform Phase 1 and Phase 2.

### Quick-review mode: `--review <path>`

When `$ARGUMENTS` starts with `--review`, skip Phases 0-3 entirely. Run only the review agents against the existing draft at `<path>`:

1. Launch in parallel: `blog-voice-reviewer`, `blog-fact-checker`, `blog-eeat-reviewer`, `blog-seo-aeo-reviewer`, `blog-positioning-reviewer` (draft mode)
2. Also launch `blog-internal-link-scout` to find any missing internal link opportunities
3. Present a consolidated findings report grouped by agent
4. Ask the user which findings to apply
5. Apply approved edits to the file

If the user says the post is headed to Hacker News or Reddit, also check it against **Distribution fit: Hacker News and Reddit**. Tell the `blog-headline-tester` agent the target, and finish with the Submission handoff from that section.

Use this for improving older posts or doing a pre-publish review of a draft written outside this skill.

### Post refresh mode: `--update <slug>`

When `$ARGUMENTS` starts with `--update`, the goal is refreshing an existing post, not writing a new one. The existing post stays as the base; the workflow surfaces what needs to change.

**Step 1: Read the existing post.**

```bash
cat src/content/blog/<slug>.md
```

Note the post's original publish date, primary keyword, thesis, and any explicit version numbers, prices, or dated claims.

**Step 2: Launch research agents in parallel.**

- `blog-source-researcher` - verify every dated/version-sensitive claim against current primary sources; find what has changed since the post was written
- `blog-competitor-analyst` - re-run the SERP for the primary keyword; identify sections or angles the field now covers that this post is missing
- `blog-internal-link-scout` - find new internal linking opportunities from posts published after this one

**Step 3: Build a refresh plan.**

Synthesize the three reports into a prioritized diff:

```
## Refresh plan: /blog/<slug>

### Must update (factually stale)
- <claim>: was "<old>" → now "<new>" (<source>)

### Should add (SERP gaps)
- [High] <section> - covered by N competitors, not in this post
- [Medium] <section>

### Should add (new internal links)
- Link to /blog/<newer-slug> from "<anchor>" in <section>

### Freshness signal
- Update the frontmatter `date` to now (same `YYYY-MM-DDTHH:MM:SSZ` format as a new post)
- Add "Updated <month> <year>" note at top if the post changes significantly

### Verdict
<Light refresh (date + a few facts) | Medium refresh (add 1-2 sections) | Major rewrite (structure needs rethinking)>
```

Present the plan to the user with AskUserQuestion before making any changes.

**Step 4: Apply approved changes, then run `--review` mode.**

Apply the user-approved refresh items, then run the full `--review` agent suite on the updated file. Commit with:

```bash
git commit -m "feat: Refresh /blog/<slug> - <summary of what changed>"
```

### Tips

- If the user says "skip research" or "I've already verified the facts", skip Phase 1c agents but still run the fact-checker in Phase 5
- If the user provides their own outline, skip Phase 2 but still run the positioning reviewer on it before drafting
- If the user says "I'll do the hero image later", skip Phase 7 and note it in the Phase 8 summary
- The user can interrupt at any checkpoint to adjust course
- After publishing, return to the Phase 8e inbound link list and work through those edits in a separate session
