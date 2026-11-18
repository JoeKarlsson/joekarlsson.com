# Humanizer pass

Core file (`.claude/blog-core.md`). The review agents only suggest edits. The humanizer pass is the step that rewrites the draft so it reads like a person wrote it, using the global `humanizer` skill (`~/.claude/skills/humanizer/SKILL.md`, source `~/claude-skills/.claude/skills/humanizer`).

## When it runs

Before Joe first sees the draft, and again after every round of edits, before each time the draft is shown or shipped. It is the skill's whole process: fact ledger, voice calibration against a voice sample, rewrite, rubric loop with the quotable-line cap, fact diff. The `ai_tells.py` scanner, Vale and `blog-voice-reviewer` don't count as the humanizer. Why every time: on the recording-setup-tour post (2026-11-09) only the scanner and the voice reviewer ran, the draft reached Joe with a joke and an opinion he never said, and he asked "Wait, why did that not run? That needs to happen every time for these blog posts."

## Locked

- Every heading's wording, the primary keyword's words and position in the intro (the sentence around them can change), tables, images and their alt text, code blocks, every link and URL, and any structure the site requires (adapters list theirs).
- Facts, numbers, dates, hedges, quotes and citations. Add no new claims.
- Length: net word count stays flat or goes down.

## Unlocked: rhythm is the job

Everything else in the body: sentence length and order, how sentences join, paragraph breaks, merging or splitting paragraphs, and cutting a sentence or paragraph that repeats an earlier point or only warms up. Rhythm is where a draft reads as AI, so a pass that only swaps words has not done the job. Never tell the pass to lock structure beyond the list above; if a prompt asks for that, say so in the report and work on rhythm anyway. Why: on 2026-11-18 a humanizer told to lock structure made 7 line edits to a tutorial that Joe then said "reads super AI".

Fix a tell by cutting it or saying the thing plainly, never by adding a joke, a fragment or a feeling.

## Steps

1. Find every line a skeptical reader could quote as proof the post is AI-written, and rewrite those first (the quotable-line cap).
2. Work through the rest: performed candor, staged reveals, quotable closers, "X, not Y" contrasts, rule-of-three lists, stacked anaphora, announcement and section-preview lines, brochure phrasing, and uniform paragraph rhythm. Leave lines that already sound human alone.
3. **Rhythm across the draft.** Read the last sentence of every paragraph on its own: if most are punchlines, morals or reversals, make most of them plain. Where three or more sentences in a row run about the same length, or paragraphs and sections all run the same size, vary them because the thoughts differ, not to make a beat.
4. **Revision rounds.** Name the paragraphs Joe already approved: fix only confirmed tells in them and copy the rest exactly, so a re-run never churns text he signed off on. When Joe says the draft reads as AI, the fix is structure and rhythm, not words: run step 3 on the whole draft with his complaint as the brief.
5. Run the skill's `scripts/ai_tells.py` on the draft (check its usage first) and fix the hits that are real. Number-dense lines of cited facts and required scaffolding lines are fine to leave.
6. Confirm there are no em dashes in the body.

## Voice sample

Calibrate to a sample of the author's own writing from before AI, and take the voice, not the format: rhythm, word choice and plain paragraph endings, never the sample's tics pasted in (in blind testing that read as imitation). Each site names its sample. Leave the author's own jokes and metaphors alone unless they're a hard tell, and list them for Joe instead of rewriting them.

## Report

```
## Humanizer pass: <post title>

Visible word count: <before> → <after>
Humanizer steps run: <fact ledger, voice calibration, rewrite, rubric loop, fact diff>

### Edits
1. [performed candor] "<before>" → "<after>"

### Left alone on purpose
- "<line>": <why it stays>
```

Tags: `[performed candor]`, `[staged reveal]`, `[quotable closer]`, `[X-not-Y]`, `[rule of three]`, `[announcement]`, `[brochure]`, `[rhythm]`, `[voice]`.

## Personal site only

- Run it with the Skill tool on `src/content/blog/{slug}.md` from `/blog-new` Phase 3; the draft summary says which steps ran.
- Voice sample: `src/content/talks/an-introduction-to-iot-internet-of-toilets.md` (2020, written before Joe used AI for writing).
- Also locked: the front matter (`tldr`, `faq`, `marginNotes`), meme images and their alt text, `cite:` and `quote:` link titles, and footnote markers.
