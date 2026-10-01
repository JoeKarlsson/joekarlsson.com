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

- **Scene-setting:** "Picture this: it's 11 PM on a Tuesday and I'm measuring server racks with a tape measure..."
- **Real dialogue:** Quote yourself, friends, error messages, forum posts. Dialogue creates intimacy. Never invent a quote or a reaction that didn't happen.
- **The setup/punchline:** Build something up, then puncture it. Long technical description followed by "But music? Music is where technical elegance goes to die."
- **Emotional specificity:** Not "it was frustrating" but "I spent two days SSHing into the MikroTik at midnight trying to figure out why half my containers lost network connectivity."
- **The admission:** "I didn't know 19 inches was a standard. I was measuring with a tape measure." Being wrong is endearing.
- **Sensory details:** What did the server sound like? What did a guest say? What time was it? These details separate real stories from spec sheets.

### The energy test:

Read each section aloud. Would you keep reading if this showed up in your RSS feed? If not, it needs more personality, more story, or a complete rewrite.

### Memes

Memes are part of how I write. They go in every post where one fits, including posts I'm sending to Hacker News or Reddit. I'm not cutting them to look more serious. A good meme is a joke about something the post actually found, and that's the same kind of humor that works everywhere else in my writing.

What makes a meme earn its spot:

- **It's about a real line in the post.** The Anakin/Padme one about config drift works because the post just showed 31 threads drifting back to `performance`. A generic "servers go brrr" meme could go in anyone's post, so it doesn't go in mine.
- **It lands after the point, not instead of it.** The paragraph makes the claim with the numbers. The meme is the reaction. If the meme is the only place a fact shows up, the fact needs to be in the text too.
- **It doesn't repeat the header right above it.** If the header already says "Cheap to buy, expensive to run," a meme that says the same thing is an echo, not a joke. Give it a different angle or move it.
- **Rotate formats.** Run `python3 scripts/make-meme.py used` before picking. Anything I've used 3+ times or in the last 5 meme posts is off the table. Never repeat a format within a post.
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
- Use bold for emphasis on key phrases, not whole sentences
- Headers tell you what's in the section or give you the answer - never tease it (see **Headers** below)
- Include a TL;DR for longer technical posts, in the frontmatter `tldr:` field only (the layout renders it; never repeat it as a body blockquote)
- Code blocks with context - explain what the code does before showing it
- Show expected output for tutorials

### Headers

Here's how people actually read my posts: they scroll, read the headers, and decide in about ten seconds whether the thing is worth their time. On Hacker News and Reddit that's everyone. So every header has exactly one job - tell the reader what's in the section.

Two kinds of header work:

- **A plain label that says what's there.** "The hardware." "Backups." "What I'd do differently." Boring is fine. Boring is findable.
- **A claim that gives away the answer.** "Desktop GPUs don't fit in a 2U server." "Immich is actually great." "Why does Lidarr suck?" works too, as long as the section answers it in the first paragraph.

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
- **Measured, estimated, or guessed - say which.** "That's metered" and "my current guess is" are both fine. Presenting a guess like a measurement is not. If I haven't measured something, say so.
- **Numbers beat adjectives.** "The hosts sit around 15% CPU" beats "absurd headroom." "Plex went from choking on two streams to handling six" beats "performance was unreal." Use units, a date or time window, and where the number came from.
- **Claims have to agree with each other.** If one section says I filled the hardware and another says there's tons of headroom, one of them is wrong. Reread the whole post for numbers and claims that contradict each other.
- **Show the real config.** A trimmed resource block, the actual command, the real error message. Engineers trust config more than prose. Strip secrets, hostnames, and anything private before it goes in.
- **Praise comes with a receipt and a catch.** "Immich is great: 40,000 photos, face recognition on the GPU, and the only thing I miss is editing" beats "genuinely excellent." Superlatives stacked on superlatives read as AI-written, and HN says so in the comments.
- **Treat the reader as a peer.** Explain only the concept the argument depends on. Don't explain what a VM is. Do explain why LACP won't speed up a single connection, if the point depends on it.
- **Link the primary source.** Vendor spec sheets, docs, changelogs, the forum thread where I found the fix.
- **Keep private things private.** No public IPs, private domain names, serial numbers, bucket names, tokens, or anything that maps out my house. Private subnets and host nicknames are fine.
- **End with a verdict and what's still missing.** What I'd keep, what's still broken, what's next. No moral, and don't restate the intro.

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
