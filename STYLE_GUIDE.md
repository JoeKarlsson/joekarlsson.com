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

## Formatting Rules

### Typography

- **No em dashes** - use regular dashes `-` or rewrite the sentence
- **No hashtags** ever
- Contractions are good ("don't", "can't", "it's", "I'm")
- Swearing is fine when it fits ("driving me absolutely insane", not gratuitous)

### Structure

- Mix paragraph lengths - some short punchy ones, some longer explanatory ones
- Use bold for emphasis on key phrases, not whole sentences
- Headers as questions or statements, not generic labels ("Why does Lidarr suck?" not "Lidarr Limitations")
- Include TL;DR at the top for longer technical posts
- Code blocks with context - explain what the code does before showing it
- Show expected output for tutorials

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

### Honesty About Limitations

- "The default wake word detection had maybe a 50% success rate"
- "I naively assumed..."
- "The answer, unfortunately, was no."
- Include what didn't work, not just what did

## What Makes Joe's Writing Distinct

1. **Real frustration about real problems** - not manufactured outrage, genuine annoyance at bad UX
2. **Partner/family perspective** - includes how tech decisions affect real people in the household
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
