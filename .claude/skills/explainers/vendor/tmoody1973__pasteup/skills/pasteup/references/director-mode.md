# Director Mode: The Guided Interview

A staged interview that walks a user from "I want a video" to a complete, confirmed spec. Consult this whenever director mode triggers. The output of a completed interview is the standard collage JSON spec plus a director's summary, then straight into Phase B.

## When director mode triggers

- The user asks for it: "director mode", "guide me", "interview me", "help me figure out what I want", "I don't know where to start".
- The brief is vague: "make me something cool", "I need a video for my brand" with no idea, style, or reference attached.
- The user seems stuck after a first attempt: "this isn't it but I don't know why".

If the user gives a complete brief or a reference, do NOT force the interview. Director mode is for filling gaps, never for re-asking what is already answered.

## The prime directive

**Propose, never just ask.** Every question comes with concrete options or a recommended default. Reacting is easier than inventing. "What color should the background be?" is a bad question. "For a sake tasting night I would go deep indigo, warm terracotta, or cream. Which pulls at you, or name your own?" is a good one.

## Rules of the interview

- Maximum 3 questions per message, presented as short lettered options where possible.
- Every question carries a default marked "(my pick)". The user can answer any question with "you decide" and the default locks in.
- Skip any round whose answers are already known from the conversation, attachments, or an earlier decode.
- Offer the escape hatch up front and keep it available: "Say 'quick mode' any time and I will decide everything remaining; you just veto."
- Never run more than 5 rounds. Momentum beats completeness; anything undecided falls to defaults.
- Track answers as you go. At the end, read the whole thing back before generating anything.

## The rounds

### Round 0: Silent inventory (no questions)

Before asking anything, inventory what is already known: attached product photo or logo, attached reference, stated platform, stated occasion, brand colors visible in attachments, anything from earlier in the conversation. Open the interview by stating what you already have, so the user sees you paying attention: "You gave me the product shot and said Instagram, so format and subject are locked. Three things left to decide."

### Round 1: Purpose

Establish what the clip is FOR, because it drives every default downstream.

1. What is this promoting or announcing? (one sentence)
2. Where will it live? a) Instagram/TikTok vertical 9:16, b) feed square 1:1, c) YouTube/web 16:9, d) several. Placement sets format and duration defaults: vertical 10s, square 8s, horizontal 12s.
3. What should someone DO after seeing it? (buy, show up, listen, remember the name)

### Round 2: The idea (the most important round)

Each scene carries exactly one concept. This round exists to find it.

- If they have an idea: sharpen it. Ask them to say it in one sentence. If the sentence contains "and", it is two ideas; help them pick one.
- If they do not: propose exactly three concept directions built from Round 1, one of each type, each in one sentence with a mini visual description:
  a) A literal metaphor (something conducting, holding, unlocking the subject)
  b) A visual pun (wordplay made physical)
  c) A process (stacking, lifting off, assembling, counting up)
  Ask them to pick one, remix two, or bounce all three for a new set. Never propose more than three at once.

### Round 3: Style

1. The look, offered as a menu with one-line vibes:
   a) Editorial halftone (premium, restrained) (my pick for most brands)
   b) Risograph (playful, indie, 2 to 3 inks)
   c) Torn paper (warm, handmade)
   d) Bauhaus paper (modernist, geometric)
   e) Vintage magazine (nostalgic, aged)
2. The color field: propose three specific hexes derived from their brand assets if attached, or from the mood if not, each with a one-word vibe. Let them pick or supply their own.
3. Mood word check: offer two or three (premium / playful / bold) so the halftone density and cut style calibrate correctly.

### Round 4: Content

1. The pieces: propose the element list yourself from the idea (3 to 4 elements maximum, each named with its role: the anchor, the payoff, the accent). Ask only "anything to add, cut, or swap?"
2. The label: propose two or three options, 2 to 4 words each, drawn from their answer to "what should someone do". Ask which, or take their wording.
3. Product lock: if a product or logo is attached, confirm it appears and whether it is the payoff piece (usually yes: it should land last with the biggest shadow).

### Round 5: Motion feel

Usually a single question with defaults for the rest:

1. Build feel: a) smooth craft (refined, on twos) (my pick), b) chunky handmade (charming, on threes), c) snappy (fast, hard snaps).
Defaults applied silently unless the user objects: pieces enter one at a time from their nearest edge, anchor first, payoff second to last, label last, 1.2s end hold. Mention looping only if the placement was social ("want it to loop cleanly?").

## Synthesis and confirmation

Read it back in two forms before generating anything:

1. **The director's summary**, five lines of plain language: what it is, the idea in one sentence, the look, the pieces in entry order, the label.
2. **The JSON spec** (standard schema from SKILL.md), every field filled.

Ask one final question: "Lock it and generate, or change something?" On lock, proceed to Phase B2 with no further questions until the elements are shown for approval.

## Quick mode

If the user invokes quick mode at any point: fill every remaining field with the defaults above, show the director's summary only (skip the JSON unless asked), and ask the single lock question. One message, then build.

## Tone

Sound like a director's collaborator, not a form. Short, warm, opinionated. Every proposal shows taste; the user should feel like they are art-directing with someone who already has a point of view they can push against.
