---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch, Agent, AskUserQuestion
argument-hint: [topic or path to notes file]
description: Create blog posts for joekarlsson.com using a multi-agent pipeline: parallel research (source-researcher + competitor-analyst), internal link scouting, positioning review, voice review, fact-checking, and parallel final validation (EEAT + SEO/AEO + positioning draft pass). Includes quick-review mode for existing posts.
---

# joekarlsson.com Blog Post Skill

Create a blog post about: $ARGUMENTS

## Phase 0: Setup

### 0a. Read style guide and project docs

1. Read `STYLE_GUIDE.md` at the repo root - this is NON-NEGOTIABLE. Internalize every rule before writing a single word.
2. Read `CLAUDE.md` for site structure, categories, and CI requirements.
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

**Including family/real-life impact:**

> "My partner finds herself walking closer to the device and raising her voice, which feels unnatural."

**Acknowledging when he changed his mind:**

> "Home Assistant - originally avoided it in the first post, now it's the orchestration hub for the entire lab. Sometimes your concerns change as you learn more."

### 0d. Prepare git branch

```bash
git checkout main && git pull origin main
git checkout -b blog/{slug}
```

---

## Phase 1: Topic Proposal & Research

### 1a. Topic Proposal

If $ARGUMENTS is a file path, read it for notes/plans. Otherwise, use $ARGUMENTS as the topic.

Present the topic to the user with:

- **Working title** (opinionated, Joe's voice - not generic)
- **One-paragraph pitch** - what's the angle? What makes this worth reading?
- **Target audience** - who cares about this?
- **Category** - one of: Databases, Dev Tools, Smart Home, Homelab, Film, DevRel, IoT, Travel, Career, Personal
- **Estimated length** - short (800-1200 words), medium (1500-2500), long (3000+)

Use AskUserQuestion to get approval before proceeding.

### 1a-ii. Headline test

Before moving on, launch **Agent: `blog-headline-tester`** with the working title, primary keyword, and one-sentence thesis. Use the top-scoring title (or a hybrid) as the title going into Phase 2. If the current working title scores highest, keep it.

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

- Are headers questions or opinionated statements? (Good: "Why does Lidarr suck?" Bad: "Lidarr Limitations")
- Does the flow feel like a story or a Wikipedia article? It should feel like a story.
- Is there a strong opening hook?
- Do sections vary in length? (NOT every section should be 3 paragraphs)

### 2b. Internal linking plan

Launch **Agent: `blog-internal-link-scout`** with the post's title, slug, and primary + secondary keywords. The agent searches the full blog corpus and returns:
- **Part A**: 2-5 existing posts the new post should link to, with anchor text and section placement
- **Part B**: 2-4 existing posts that should be edited to link back to the new post (for follow-up after publishing)

Use Part A findings to mark link placements in the outline. Save Part B for after the post ships.

Before presenting the outline for approval, launch **Agent: `blog-positioning-reviewer`** in **OUTLINE mode** with the research brief and proposed outline. Incorporate its findings - sharpening section headers into analytical claims, adding the named frame if one is needed, and adjusting the intro so it leads with the conclusion.

Display the full outline inline (with positioning improvements applied), then use AskUserQuestion:

- Approve outline
- Request changes (specify what)
- Cancel workflow

Do NOT proceed without approval.

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

### Energy, Fun, and Storytelling (CRITICAL - DO NOT SKIP)

The #1 failure mode is writing that's technically correct but has zero personality. Joe's posts are FUN to read. They tell stories. They make you laugh. They make you feel something. If your draft reads like a hardware spec sheet or a Wikipedia article, throw it away and start over.

#### Storytelling techniques Joe actually uses:

- **"Paint a picture" scenes:** "Picture this: I'm sitting at my desk at 11 PM, and I just realized..." Put the reader IN the moment.
- **Real dialogue:** Quote yourself, quote your partner, quote the error message your server threw at you. Dialogue breaks up walls of text and adds humanity.
- **The setup/punchline rhythm:** Build up something serious or technical, then puncture it with humor. "The \*arr ecosystem is an architectural masterpiece... But music? Music is where technical elegance goes to die a slow death."
- **Emotional honesty:** "This drove me insane." "I spent two days debugging this and wanted to throw the server out a window." Don't sanitize the frustration.
- **The "I was wrong" moment:** Joe freely admits when he was wrong or naive. This builds trust and makes the writing relatable.
- **Specific sensory details:** Not "the server was loud" but "the R730 sounds like a jet engine during POST and my partner asked if I was running a wind tunnel in the attic."

#### What makes a section FUN vs BORING:

- **BORING:** "The R730 has dual Xeon E5-2698 v4 processors with 40 cores each." (spec sheet)
- **FUN:** "The R730 has dual Xeon E5-2698 v4s. That's 80 cores. In my attic. My partner asked why the electric bill doubled and I had to explain that I'd installed a small data center upstairs."
- **BORING:** "I set up VLANs for network segmentation." (Wikipedia)
- **FUN:** "I don't want my $15 smart plug from some company I can't pronounce to have network access to my NAS full of family photos. VLANs fix this."

#### Memes and visual humor

Include memes where they fit naturally. Generate them via the ImgFlip API (requires free imgflip.com credentials set as `IMGFLIP_USER` / `IMGFLIP_PASS` env vars) or skip if not configured. Memes should:

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

**Analytical claims, not topic labels.** "What the roadmap won't fix" is a claim the reader leans into. "Gaps in the roadmap" is a label they tune out. Headers and section openers should make claims, not announce categories.

**State opinions plainly.** "Priority 3 is the one that matters" is a take. "Priority 3 is important" is not. Every post should have a point of view, stated directly, not hedged away.

**Name what everyone's thinking but not saying.** If a tool, spec, or decision has a catch, say the catch. "The roadmap addresses one of two auth problems. The other one it leaves to you." Don't bury the thing the reader most needs to hear.

**Specific, named scenarios over categories.** "Salesforce, SQL Server, NetSuite" beats "enterprise data sources." Name the actual system, error, config value, or dollar amount. Specificity is credibility.

**Honest about what doesn't work yet.** "The conformance testing harness doesn't exist yet; watch for it and integrate it when it ships" is a real recommendation. "SDK developer experience improvements are coming" is noise.

**Per-section tactical call.** After explaining a trade-off or priority, tell the reader what to actually do. "Here's what I'd actually do" turns analysis into a recommendation, not a survey. Every major section should land with a concrete action.

---

### Anti-AI structural patterns (CRITICAL)

AI writing has tells beyond word choice. Actively break these patterns. Research shows AI text has remarkably uniform sentence length (15-25 words), predictable paragraph structure, and monotonous cadence. Human writing has HIGH BURSTINESS - dramatic variation in both sentence and paragraph length.

#### Sentence-level rules

- **MEASURE your sentence lengths.** After drafting, count words per sentence in each paragraph. If more than 3 consecutive sentences are within 5 words of each other in length, rewrite. Aim for a mix like: 4 words, 22 words, 8 words, 31 words, 6 words.
- **Use sentence fragments.** "Not even close." "Total game changer." "Which, fair." Real people write fragments constantly. AI almost never does.
- **Start sentences with conjunctions.** "And", "But", "So", "Or". At least 15% of sentences should start this way - it's one of the strongest human-writing signals.
- **Use semicolons and parentheses.** AI avoids these; humans use them naturally. Parenthetical asides (like this one) are a strong human signal.
- **Vary sentence openings.** Never start 3+ consecutive sentences with the same word. Never start 2+ consecutive sentences with "The" or "It" or "I".
- **Include rhetorical questions.** "Know what happened next?" "Sound familiar?" Sprinkle 2-3 per post.

#### Paragraph-level rules

- **Vary paragraph length DRAMATICALLY.** One-sentence paragraphs are powerful. So are 6-sentence paragraphs. AI tends toward uniform 3-4 sentence paragraphs - this is the #1 structural tell.
- **DO NOT** make every section the same length. Some sections should be 1 paragraph, others 5+. Real writing is uneven.
- **DO NOT** follow a predictable internal structure (setup -> explanation -> conclusion). Some sections are just a code block with one sentence of context. Some are long digressions. Some are just a list.
- **DO NOT** wrap up every section with a summary sentence. Just stop when the point is made.
- **DO NOT** balance pros and cons evenly. Joe has opinions. If something sucks, spend 3 paragraphs on why and 1 sentence on the upside.

#### Post-level rules

- **DO NOT** transition smoothly between every section. Sometimes Joe just jumps to the next topic. Real writing has abrupt shifts.
- **Vary section lengths dramatically.** If your longest section is 8 paragraphs, your shortest should be 1-2. Never have all sections within 1-2 paragraphs of each other.
- **Break the pattern.** If you've written 3 sections that each start with a narrative paragraph, make the 4th start with a list or a question or a code block.
- **Include specific numbers and details** that only someone who actually did this would know (exact error messages, specific config values, dollar amounts, timestamps).
- **Use the long-then-short rhythm.** A detailed paragraph followed by a one-liner creates impact. "But music? Music is where technical elegance goes to die a slow death." This is Joe's signature move.

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
date: YYYY-MM-DD
slug: 'url-friendly-slug'
description: 'One-sentence description for SEO/social cards (under 160 chars, include target keyword)'
categories: ['Category']
heroImage: '/images/blog/{slug}/hero.webp'
heroAlt: 'Descriptive alt text for the hero image'
tldr: 'TL;DR summary for the frontmatter field'
---
```

### Structure

- Start with a TL;DR blockquote for longer posts
- Strong opening hook - not a generic intro
- Narrative flow through sections
- Code blocks with context (explain WHY before showing)
- Specific numbers: CPU models, RAM amounts, versions, costs
- End with a real conclusion, not "In conclusion..."
- Include internal links to related joekarlsson.com posts (from Phase 2b)

### Photos and Visual Content (IMPORTANT)

Blog posts need visual breaks. Walls of text kill engagement. Include:

**User photos:** Ask the user if they have photos related to the post topic. Check `~/Downloads/` for photo directories. Convert HEIC to JPEG with `sips`, then to WebP with `cwebp -q 85`. Save to `public/images/blog/{slug}/`. Every photo needs descriptive alt text.

**Memes:** Generate via the ImgFlip API with curl. Common template IDs:

- Drake Hotline Bling: 181913649
- Distracted Boyfriend: 112126428
- Change My Mind: 129242436
- This Is Fine: 55311130
- One Does Not Simply: 61579
- Panik Kalm Panik: 226297822

```bash
curl -s "https://api.imgflip.com/caption_image" \
  -d "template_id=TEMPLATE_ID&username=$IMGFLIP_USER&password=$IMGFLIP_PASS&text0=TOP TEXT&text1=BOTTOM TEXT" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['url'])"
```

Download the URL with `curl -sL`, convert to WebP. If `IMGFLIP_USER`/`IMGFLIP_PASS` aren't set, skip memes and note it for the user. Memes should reference actual post content, not be generic.

**ASCII diagrams:** Use code blocks for architecture diagrams, network topologies, before/after comparisons, and flow charts. These render well in the terminal-aesthetic site and don't require external tools.

**Placement:** Alternate between photos, memes, and diagrams throughout the post. Place them at natural section breaks. Never have more than 3-4 paragraphs of prose without a visual element.

Write the draft to `src/content/blog/{slug}.md` so subsequent phases can grep and edit the file directly.

Display the full draft inline, then use AskUserQuestion:

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
2. Analytical structure check (Thompson/McKenzie - does the intro lead with the conclusion, do headers make claims, are opinions stated plainly)
3. AI-pattern audit (humanizer pass - significance inflation, signposting, uniform rhythm, missing fragments)

Apply every **must-fix** edit before proceeding. Apply **should-fix** edits where they improve the writing. Use the agent's anti-AI audit to find and rewrite the spots that still read as assembled.

**Re-run note:** If the voice reviewer's must-fix list is long (5+ items, or requires restructuring the intro or more than one full section rewrite), re-run `blog-voice-reviewer` after applying those changes before moving on. The Phase 6 agents will run on whatever state the draft is in - don't let them review a pre-fix version.

### 4b. Voice Comparison

Re-read the category-specific posts from Phase 0b. Compare the draft's tone, rhythm, and structure to Joe's actual writing. Identify the 3 weakest sections (the ones that sound least like Joe) and rewrite them.

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

**Agent: `blog-positioning-reviewer`** in **DRAFT mode** - checks that the post delivered its thesis, that the analytical stance is consistent, and that each major section ends with a concrete recommendation.

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
- [ ] Do section headers make analytical claims, not announce categories?
- [ ] Is there a clear point of view, stated plainly - not hedged away?
- [ ] Does each major section end with a concrete "here's what I'd do"?
- [ ] Is structure varied and natural, not perfectly uniform?
- [ ] No em dashes anywhere?
- [ ] No prohibited words?
- [ ] No trailing qualifiers (very, quite, basically, essentially)?
- [ ] Would Joe actually say this out loud?
- [ ] All images have descriptive alt text?
- [ ] TL;DR present for longer posts?
- [ ] At least 2 internal links to other joekarlsson.com posts?
- [ ] Target keyword appears in title, slug, description, and first paragraph?
- [ ] Meta description is under 160 characters?
- [ ] Paragraph lengths vary (not all 3-4 sentences)?
- [ ] Section lengths vary (not all the same)?
- [ ] No two consecutive paragraphs start with the same word?
- [ ] Post ends when it's done - no closing paragraph restating the intro?
- [ ] EEAT: at least one original beat only someone who did this could write?
- [ ] EEAT: at least one honest limitation or "I haven't tested" moment?

### 6f. Spelling Check

Add any new technical terms to `cspell-custom.txt` so spell check won't flag them.

---

## Phase 7: Hero Image

Create the hero image for the blog post. The primary method is a manual Canva step; a Python fallback exists for quick-and-dirty generation.

### 7a. Canva (Primary)

Present the user with an image brief:

```
HERO IMAGE BRIEF
================
Title:    {title}
Subtitle: {one-line summary of the post}
Category: {category}
Slug:     {slug}

Canva template: https://www.canva.com/design/DAHDFzjoHz0/edit
Dimensions: 1280x720 (YouTube thumbnail)

Instructions:
1. Open the Canva template link above
2. Duplicate the template (File > Make a copy)
3. Update the title text and subtitle
4. Swap the image on the right if desired
5. Export as WebP or PNG
6. Save to: public/images/blog/{slug}/hero.webp
```

Use AskUserQuestion to pause and wait for the user to confirm the image is ready.
Once confirmed, verify the file exists at `public/images/blog/{slug}/hero.webp` (or `.png`).
If PNG, convert to WebP:

```bash
python3 -c "from PIL import Image; Image.open('public/images/blog/{slug}/hero.png').save('public/images/blog/{slug}/hero.webp', 'WEBP', quality=85)"
```

### 7b. Python Script (Fallback)

If the user wants to skip Canva, generate a programmatic image instead:

```bash
python3 scripts/generate-hero-image.py "{title}" public/images/blog/{slug}/hero.webp {category}
```

The script creates a 1280x720 brutalist/terminal-aesthetic image with category-themed colors and code fragments. Categories: homelab, smart-home, databases, dev-tools, devrel, iot, career, personal, travel, film.

After either method, verify the image exists and the frontmatter heroImage path is correct.

---

## Phase 8: Final Assembly & CI Check

### 8a. Verify blog post file

Confirm `src/content/blog/{slug}.md` exists and has the final content (written during Phase 3, edited during Phases 4-6).

### 8b. Verify image directory

Confirm `public/images/blog/{slug}/` exists with the hero image.

### 8c. Run local checks

```bash
npm run format:check && npm run lint
```

If format issues: `npm run format` then re-check.

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
git commit -m "feat: add blog post - {title}"
```

Do NOT push unless the user explicitly asks.

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
- Update the frontmatter `date` to today
- Add "Updated <month> <year>" note at top if the post changes significantly

### Verdict
<Light refresh (date + a few facts) | Medium refresh (add 1-2 sections) | Major rewrite (structure needs rethinking)>
```

Present the plan to the user with AskUserQuestion before making any changes.

**Step 4: Apply approved changes, then run `--review` mode.**

Apply the user-approved refresh items, then run the full `--review` agent suite on the updated file. Commit with:

```bash
git commit -m "content: refresh /blog/<slug> - <summary of what changed>"
```

### Tips

- If the user says "skip research" or "I've already verified the facts", skip Phase 1c agents but still run the fact-checker in Phase 5
- If the user provides their own outline, skip Phase 2 but still run the positioning reviewer on it before drafting
- If the user says "I'll do the hero image later", skip Phase 7 and note it in the Phase 8 summary
- The user can interrupt at any checkpoint to adjust course
- After publishing, return to the Phase 8e inbound link list and work through those edits in a separate session
