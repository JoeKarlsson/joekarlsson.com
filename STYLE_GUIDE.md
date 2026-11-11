# Joe Karlsson - Personal Site Writing Style Guide

Reference for writing content on joekarlsson.com. This captures Joe's personal voice - more casual and opinionated than corporate writing, but still technically precise.

**Adapted from:** CloudQuery's `marketing-skills/BRAND_VOICE.md` and `WRITING_STYLE.md`, which capture a sanitized version of this voice. This guide is the unfiltered version for personal content.

## Voice

Joe writes like he's explaining something to a friend who's also an engineer. The tone is:

- **First-person singular** ("I", "my") - this is a personal blog, not a company
- **Conversational and opinionated** - real takes, not balanced corporate hedging
- **Technically detailed** - specific tools, versions, error messages, config snippets
- **Honest about frustrations** - "this drove me absolutely insane", "this workflow is barbaric"
- **Self-deprecating humor** - acknowledges mistakes, naive assumptions, things that didn't work
- **Enthusiastic about things that work well** - genuine excitement, not marketing hype

### Voice Examples (From Actual Posts)

**Good (Joe's actual voice):**

> "Look, I need to get something off my chest."
> "Here's the thing that keeps me up at night."
> "It's 2025. This workflow is absolutely barbaric."
> "I naively assumed that migrating from Alexa would involve some configuration tweaking."
> "My partner finds herself walking closer to the device and raising her voice, which feels unnatural."

**Bad (corporate/AI voice to avoid):**

> "In today's rapidly evolving smart home landscape..."
> "This comprehensive guide will walk you through..."
> "Organizations face unprecedented challenges..."

## Energy and Fun (CRITICAL)

The writing MUST be enjoyable to read. Technical accuracy with zero personality is a failure. Every section should have energy - humor, frustration, surprise, specific storytelling details that make you feel like you're in the room.

### Techniques that create energy:

- **Scene-setting:** a real moment, with the real time and place if I gave them. Never a stock opener like "Picture this: it's 11 PM on a Tuesday."
- **Real dialogue:** Quote yourself, friends, error messages, forum posts. Dialogue creates intimacy. Never invent a quote or a reaction that didn't happen.
- **The setup/punchline:** Build something up, then puncture it. "But music? Music is where technical elegance goes to die." Save it for the one or two spots per post that earn it. Every paragraph ending on a punchline reads as AI (see below).
- **Emotional specificity:** Not "it was frustrating" but "I spent two days SSHing into the MikroTik at midnight trying to figure out why half my containers lost network connectivity."
- **The admission:** "I didn't know 19 inches was a standard. I was measuring with a tape measure." Being wrong is endearing when it's a real mistake told plainly. Announcing the honesty ("Full disclosure:", "Two honest footnotes") is not the same thing.
- **Sensory details:** What did the server sound like? What did a guest say? What time was it? These details separate real stories from spec sheets.

### Moves that read as AI even in my voice

These came straight out of the HN thread on the homelab post ("Whole goddamn thing written by a model", October 2026). Each one started as a rule in this guide that a model applied to every paragraph. Once is a voice. Every paragraph is a template.

- **A punchline at the end of every paragraph.** "The PCIe slots were the point. The cores came along for the ride." Read only the last sentence of each paragraph. Most should be plain.
- **Fragment stacks.** "Third time. A week each time. Nobody noticed." One fragment is fine. Two or more in a row is a tell.
- **Performed honesty.** "Full disclosure:", "Two honest footnotes", "I'd rather say so than have you find it", "That's metered. Not estimated." Just state the caveat. Don't announce that you're being honest.
- **Narrating my own rigor.** "I never measured that. For this update, I did." Give the result.
- **Staged reveals.** "The funny part:", "The catch:", "Turns out...", "The result? X." Say the thing.
- **Decorative numbers.** 30-day averages, 7-day averages and decimals in every paragraph. One number per point, rounded, with a plain verdict.
- **Labeled objections.** "The obvious objection:" Answer it in a normal sentence.
- **Invented scenes.** "It was 11 PM on a Tuesday." If it didn't happen, it doesn't go in.

The full list is in the `humanizer` skill, `~/.claude/skills/humanizer/SKILL.md` (source: `~/claude-skills/.claude/skills/humanizer`), patterns 41-53. When a draft needs a voice sample, use `src/content/talks/an-introduction-to-iot-internet-of-toilets.md` (2020, written before I used AI for writing).

### The energy test:

Read each section aloud. Would you keep reading if this showed up in your RSS feed? If not, it needs more personality, more story, or a complete rewrite.

### Memes

Memes are part of how I write. They go in every post where one fits, including posts I'm sending to Hacker News or Reddit. I'm not cutting them to look more serious. A good meme is a joke about something the post actually found, and that's the same kind of humor that works everywhere else in my writing.

What makes a meme earn its spot:

- **It's about a real line in the post.** The Anakin/Padme one about config drift works because the post just showed 31 threads drifting back to `performance`. A generic "servers go brrr" meme could go in anyone's post, so it doesn't go in mine.
- **It lands after the point, not instead of it.** The paragraph makes the claim with the numbers. The meme is the reaction. If the meme is the only place a fact shows up, the fact needs to be in the text too.
- **It doesn't repeat the header right above it.** If the header already says "Cheap to buy, expensive to run," a meme that says the same thing is an echo, not a joke. Give it a different angle or move it.
- **Rotate formats.** Run `python3 scripts/make-meme.py used` before picking, and pitch only formats from a fresh `make-meme.py templates` sample, never the same few favorites. Anything I've used 3+ times or in the last 5 meme posts is off the table. Never repeat a format within a post.
- **Name the format in the alt text** ("Anakin Padme 4 Panel meme: ..."), so the rotation audit can count it.
- **2-4 per long post, 1-2 per short one.** Spread them out at section breaks. Don't force one where nothing fits.

## Formatting Rules

### Typography

- **No em dashes** - use regular dashes `-` or rewrite the sentence
- **No hashtags** ever
- Contractions are good ("don't", "can't", "it's", "I'm")
- Swearing is fine when it fits ("driving me absolutely insane", not gratuitous)

### Structure

- Mix paragraph lengths - some short punchy ones, some longer explanatory ones
- One point per paragraph. If a paragraph makes two points, split it. Most readers come from HN or Reddit on a phone, where a paragraph doing two jobs turns into a wall of text
- Use bold for emphasis on key phrases, not whole sentences. Put the bold at the start of the sentence or bullet, not buried in the middle, so a skimmer reading only the bold still gets the point. If the key phrase lands mid-sentence, rewrite the sentence so it leads
- Headers tell you what's in the section or give you the answer - never tease it (see **Headers** below)
- Include a TL;DR for longer technical posts, in the frontmatter `tldr:` field only (the layout renders it; never repeat it as a body blockquote)
- Code blocks with context - explain what the code does before showing it
- Show expected output for tutorials

### Headers

Here's how people actually read my posts: they scroll, read the headers, and decide in about ten seconds whether the thing is worth their time. On Hacker News and Reddit that's everyone. So every header has exactly one job - tell the reader what's in the section.

Two kinds of header work:

- **A plain label that says what's there.** "The hardware." "Backups." "What I'd do differently." Boring is fine. Boring is findable.
- **A claim that gives away the answer.** "Desktop GPUs don't fit in a 2U server." "Immich is actually great." "Why does Lidarr suck?" works too, as long as the section answers it in the first paragraph.

Default to the plain label. A claim header earns its place in one or two sections, not all of them: a post where every header is a sentence ("The house interrupts for a short list of things", "When the draft is wrong, I ask Claude") reads as a template, and that's AI slop even when each one is accurate. Keep headers short, usually under six words.

What doesn't work is the teaser. "The GPU lesson nobody warned me about" tells you there's a lesson, then makes you read three paragraphs to find out what it was. That's a YouTube thumbnail, not a header. Same goes for drama ("The power bill arrives," "The uncomfortable truth") and vague setup ("The setup," "The services"). The jokes, the story, the "I learned this the expensive way" - all of that is great, and all of it goes in the body. The header just tells you where you are.

Quick checks before I ship:

- **Cover up the body and read only the headers.** Could someone get the gist of the post? If a header is hiding the point, rewrite it so it says the point.
- **Numbers and model names beat adjectives.** "Power: about 500W and $55 a month" beats "Power: The Uncomfortable Math."
- **Sentence case.** "Buying a used Dell R730," not "Buying A Used Dell R730."

H3s have their own rules:

- **Only use H3s when an H2 has two or more real subsections.** An H2 with a single H3 right under it ("The Service Explosion" → "The services") means one of those headers shouldn't exist.
- **An H3 has to belong to its H2.** If a section about adding a rack has an H3 about RAM prices, the H3 is in the wrong place.
- **Don't use an H3 to preview another section.** If it just says "more on this below," cut the header and keep the sentence.
- **If an H3 is one of the most important things in the post, make it an H2.** Home Assistant moving into the rack and every container moving into OpenTofu were both buried as H3s. They're the story.

### Callouts

Use a `<div class="callout">` for inline asides that should visually separate from the prose - related posts, key definitions, or context that enriches the argument without being the argument. Keep them short (1-2 sentences). Don't use them for the main point of a section.

```html
<div class="callout">Related: [Post title](url) - one sentence on why it's relevant.</div>
```

The blank lines inside the div are required for markdown to parse the content.

### Emphasis for scannability

When a sentence is the payoff of a build-up - the conclusion after evidence, the lesson after the parable, the claim the whole section earns - italicize it so it reads as a pull quote for someone scanning.

Pattern: build-up sentence(s), then: _the thing that matters_

Examples:

- "All pointing at the same underlying mechanism: _you don't think your way to quality. You ship your way there._"
- "Speed and quality don't trade off. _They correlate positively._"

Use this sparingly - once or twice per post, at the moments that most deserve to land. If everything is emphasized, nothing is.

### Lists

- Use lists for specs, requirements, and step-by-step instructions
- Don't use lists for opinions or narrative content - write it as prose
- Lists don't all need to be the same length

## Prohibited Language

### AI Detection Red Flags (Never Use)

delve, tapestry, realm, embark, beacon, spearhead, bustling, poised, amidst, testament, hallmark, bedrock, linchpin, crucial, multifaceted, ever-evolving, groundbreaking, meticulous, commendable, plethora, myriad, comprehensive, holistic, paradigm, synergy, leverage, harness, foster, cultivate, streamline, elevate, navigate, underscore, robust, pivotal

### Filler Words (Delete These)

very, really, quite, extremely, incredibly, absolutely (except when used for emphasis in Joe's voice), definitely, certainly, basically, essentially, fundamentally, literally, ultimately

### Banned Openings

- "In this world," "in today's world," "in today's fast-paced world"
- "In the realm of," "in the world of," "when it comes to"
- "It's no secret that," "it goes without saying"
- "In this article, we will explore," "This guide will show you," "Let's take a look at"
- "Before we dive in," "Without further ado," "Let's get started"

### Banned Transitions

- "In fact," "Indeed," "Furthermore," "Moreover," "Additionally"
- "In other words," "To put it simply," "That is to say"
- "In summary," "To sum up," "In conclusion," "All in all"

### Banned Marketing Speak

- "Game-changer," "paradigm shift," "breakthrough"
- "Seamless integration," "effortless setup," "works like magic"
- "Transform your," "revolutionize your," "take your X to the next level"
- "Future-proof," "cutting-edge," "next-generation"

## Content Types

### Personal/Opinion Posts (Smart Home, Homelab, Travel)

- **Tone**: Casual, opinionated, funny
- **First-person**: Heavy - "I", personal anecdotes, partner/family mentions
- **Hedging**: Low - state opinions directly
- **Structure**: Narrative flow, tell a story
- **Example**: "Self-Hosted Music Still Sucks in 2025"

### Technical Tutorials (Databases, Dev Tools)

- **Tone**: Peer-to-peer, instructional but not patronizing
- **First-person**: Moderate - "I" for experience, "you" for instructions
- **Hedging**: Moderate - acknowledge edge cases and limitations
- **Structure**: Problem first, then solution with code
- **Example**: "How to Use MongoDB Client-Side Field Level Encryption"

### DevRel/Career Posts

- **Tone**: Reflective, sharing lessons learned
- **First-person**: Heavy - personal experience is the whole point
- **Hedging**: Low to moderate
- **Structure**: Story-driven with takeaways woven in
- **Example**: "Developer Advocacy in 2023"

### Research Posts (Studies, Data, Experiments)

- **Tone**: Curious and plain, still opinionated about where I land
- **First-person**: Moderate - "I" for why I went digging and where I land; the sources carry the rest
- **Hedging**: Matched to the evidence - flat where it's solid, "I suspect" where it isn't
- **Structure**: Question, what I found, where I land, what's still open (see **Writing research posts** below)
- **Example**: "Are English sentences getting shorter? About 40% of the drop is punctuation"

## Technical Writing Patterns

### Code Integration

- Introduce before showing: "Here's the automation I had to build for basic light control:"
- Explain the WHY, not the WHAT - engineers can read code
- Show expected output for tutorials
- Include specific error messages and version numbers

### Problem-First Approach

- Start with the actual problem, not the solution
- Include the "why" behind decisions
- Reference real scenarios from personal experience
- Compare approaches with honest trade-offs

### Writing About Infrastructure and Technical Decisions

This is what the technical posts that do well on Hacker News and Reddit have in common, and it holds for every post I write, whether that's a homelab build, a database deep dive, or a tool review. The short version: the reader is a smart engineer who will check my work, so I show my work.

- **Every spec gets a "because."** "64GB of RAM" is a spec sheet. "64GB of RAM, so the LLM and Immich's ML models fit at the same time" is a decision. If I can't say why a number matters, it probably doesn't belong in the post.
- **Say what I was trying to do before I say what I bought.** State the goal, the constraints, or the thing that broke first. Every choice later in the post should trace back to it.
- **Name what I didn't pick, and why.** One or two sentences: "A Coral TPU would have fixed Frigate, but not Plex or local LLMs." If I skip this, the comments will ask.
- **Every "this fixed it" comes with what it cost.** Moving Home Assistant into a VM fixed isolation and created a dependency on the host. Say both. A trade-off I name is credibility. A trade-off a commenter finds is a pile-on.
- **Measured, estimated, or guessed - say which.** Say it once, where the number comes from ("the rack runs through a smart plug"), not as a beat ("That's metered. Not estimated."). Presenting a guess like a measurement is not fine. If I haven't measured something, say so.
- **Numbers beat adjectives, but one is enough.** "The hosts sit around 15% CPU" beats "absurd headroom." Don't stack averages, peaks and time windows to sound rigorous. Pick the number that makes the point. "Plex went from choking on two streams to handling six" beats "performance was unreal." Use units, a date or time window, and where the number came from.
- **Claims have to agree with each other.** If one section says I filled the hardware and another says there's tons of headroom, one of them is wrong. Reread the whole post for numbers and claims that contradict each other.
- **Show the real config.** A trimmed resource block, the actual command, the real error message. Engineers trust config more than prose. Strip secrets, hostnames, and anything private before it goes in.
- **Draw it instead of describing it.** If a paragraph is explaining how three or more pieces connect (VLANs, hosts, containers, data flow), draw a diagram and cut the paragraph down to the why. The diagram shows how the pieces connect. The prose says why I built it that way.
- **Praise comes with a receipt and a catch.** "Immich is great: 40,000 photos, face recognition on the GPU, and the only thing I miss is editing" beats "genuinely excellent." Superlatives stacked on superlatives read as AI-written, and HN says so in the comments.
- **Treat the reader as a peer.** Explain only the concept the argument depends on. Don't explain what a VM is. Do explain why LACP won't speed up a single connection, if the point depends on it.
- **Link the primary source.** Vendor spec sheets, docs, changelogs, the forum thread where I found the fix.
- **Keep private things private.** No public IPs, private domain names, serial numbers, bucket names, tokens, or anything that maps out my house. Private subnets and host nicknames are fine.
- **End with a verdict and what's still missing.** What I'd keep, what's still broken, what's next. No moral, and don't restate the intro.

### Writing research posts

This is for posts where the substance is studies, data or an experiment rather than my own build. The model is Michael Nielsen ([michaelnotebook.com](https://michaelnotebook.com/)). His research essays work for the same reason my infrastructure posts do: he shows his work, and he's exact about what he knows versus what he suspects. How each of his essays is put together, with longer excerpts, is in `docs/writing-exemplars/michael-nielsen.md`.

- **Say why I went digging.** One or two sentences of personal stake before the research. Nielsen admits his small-data experiment was partly "an excuse to experiment with the scikit-learn and pytorch libraries." In a post built from other people's findings, that's the first-hand part.
- **One status line on what the post is.** "Status: Exploratory working notes. Intended as preliminary exploration to get familiar with the problem, not as a survey of prior literature." Say once, near the top, whether this is an experiment I ran, a read of the studies, or notes. Then a sentence of scope or assumptions ("For this discussion, we'll assume ASI has been achieved"). It's a label, not a confession: no "caveat emptor", no apology for what I left out.
- **Thesis on the first screen.** His talk essays open with a summary paragraph that gives the answer and its two consequences. My `tldr:` does that job, and the intro still states the claim. A documented scene from a source can open the post (his memory essay opens on the psychologist Luria testing a Moscow reporter's memory in the 1920s) if it's short and real. Never an invented one.
- **Ask the reader's question, then do the arithmetic in the open.** "How much more efficient?" Then: 8 seconds a card, reviewed weekly for 20 years, comes to "just over 2 hours for each card," against 4-7 minutes with Anki. Then a rule anyone can use: "if memorizing a fact seems worth 10 minutes of my time in the future, then I do it." Inputs go in a sentence, the full model goes in an appendix at the end. A question is fine when the answer takes work to reach. "The result? X." is still a staged reveal.
- **Baseline, then the goal, then results.** His small-data post runs simple baselines first and says how little tuning they got ("I put minimal effort into configuring these"). It states the target as a number before any results ("above 95% for RMNIST/1"), then gives one plain-label section per attempt ("Baselines", "Transfer learning", "Concluding thoughts"). The ending reports the best numbers against the target, and he missed. Benchmarks and homelab tests take the same shape.
- **Define shorthand once, where it first shows up.** "RMNIST/N will mean reduced MNIST with N examples for each digit class." After that, never vary the term.
- **Keep what I saw apart from why I think it happened.** "I'm not sure what's responsible for this effect. I suspect it's partly about focus." When nobody has tested it: "As far as I know, the experiment has never been done." Results get stated flat. Explanations get "I suspect."
- **A specific case, then the general rule.** His flashcard for `ln -s filename linkname` kept failing until he split it into two cards, and only then does he generalize to "atomic" questions. His own note on Carl Sagan: "too long at too high an altitude detaches both the author and readers from a sense of what is real." Every general claim gets a concrete case within a paragraph or two.
- **Explain a system by building the naive version and fixing it.** He calls it discovery fiction: start from "an obviously flawed back-of-the-napkin idea," point out the obvious problem, make the obvious fix, and repeat until the real design falls out. He did Bitcoin and Bloom filters this way. It works for protocols, auth flows and data structures.
- **Quote the best people on both sides by name, then say where I land.** His AI-risk essay quotes Hinton, Bengio and Altman against LeCun, Ng and Andreessen in their own words, throws out the cheap explanation as "too glib," and only then picks a side ("Others, myself included"). Objections come from real people (an HN comment, a forum post, a colleague), quoted and linked. Never invent a skeptic.
- **Credit where an idea came from, and where my numbers differ.** "I first saw an analysis along these lines in Gwern Branwen's review... he arrives at a 5-minute rule of thumb, rather than 10 minutes."
- **Disclose in one plain sentence.** "I've no affiliation at all with Anki." Same for any post that touches CData or a vendor I pay.
- **Side paths go in footnotes, the full math in an appendix.** Credits, tangents and the extra caveat go in a footnote (`[^1]`, which the site renders). The main line stays readable on a phone.
- **End on the next open question, and answer critics in a dated update.** The small-data post ends on whether a hand-picked handful of training images could beat his random ones, which he calls "super-trainers". When readers pushed back on his AI-risk essay, he added "Postscript: Critiquing this Essay (added June 3, 2025)" instead of quietly rewriting.

What I don't copy from him, because my rules win:

- **Long intros that preview each part in order** ("In the first part of the essay... The second part..."). That's the outline shape from humanizer pattern 46.
- **"We" and "let's"** ("let's do some rough time estimates"). I write "I".
- **"The punchline is that..." and "Spoiler: We won't get there."** Staged reveals. Say the thing.
- **Stacked hedges.** "Caveat emptor", apologies for citations left out, "a more-than-you-ever-wanted-to-know guide". The one status line covers it.
- **"Indeed", "In fact", "fundamental", "extremely" and en dashes.** Still banned here.
- **150-word paragraphs doing three jobs, and 6,400 words with no headers.** One point per paragraph, and headers stay the skim layer.
- **Length.** His optimism essay runs about 34,000 words, and he says "an ideal public-facing version would be much shorter and more focused." His notes are him thinking out loud. My post is the shorter version.

### Honesty About Limitations

- "The default wake word detection had maybe a 50% success rate"
- "I naively assumed..."
- "The answer, unfortunately, was no."
- Include what didn't work, not just what did

## What Makes Joe's Writing Distinct

1. **Real frustration about real problems** - not manufactured outrage, genuine annoyance at bad UX
2. **The guest test** - how tech decisions affect real people who don't have the app or know the setup (I live alone, so write about guests and past experience, not a current partner)
3. **Specific numbers and specs** - CPU models, RAM amounts, response times, success rates
4. **Architecture diagrams and system design** - thinks in systems, explains how pieces connect
5. **Pop culture references** - casual, not forced
6. **Acknowledges the absurdity** - "this workflow is absolutely barbaric for track-level music discovery"
7. **Strong opinions held loosely** - will state a take confidently but also show when he changed his mind

## Quality Checklist

Before publishing, ask:

- Does this sound like Joe talking, or like an AI wrote it?
- Are there specific examples from real experience?
- Does the confidence level match the certainty of each claim?
- Is the structure varied and natural, not perfectly uniform?
- Are there any em dashes? (remove them)
- Are there any words from the prohibited list?
- Would Joe actually say this out loud?

Then reread it as someone who found it on Hacker News and knows nothing about my setup:

- Where would they get confused? Is there context in my head that never made it onto the page (what a host is, why I already had that hardware, what broke first)?
- What's redundant? Look for anything said twice, not only the ending restating the intro. Keep the better version and cut the other.
- What would they skip? If a section exists only because I did the work, not because the reader needs it, cut it or shrink it to a sentence.
