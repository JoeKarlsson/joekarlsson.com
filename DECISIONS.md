# Design decisions

Joe's standing verdicts for this site, one per line, dated. Read before any visual change; add each new verdict the moment Joe gives it. A line here outranks a mockup, a skill default or a design rule.

## Look

- 2026-11-05: No wavy or warping effects on the hero videos. Dithering is fine, varied and light.
- 2026-11-05: Dithering stays light: heavy dithering made the hero videos and blog thumbnails hard to see. 2026-11-10: "Less dithering, but I like the pink and black."
- 2026-11-06: Images and video get the site's pink color grading. Never drop it (2026-11-09: "why did you take the pink off of it?").
- 2026-11-05: No photo board with stickers on the About page.
- 2026-11-10: The resume page uses a still image, not a video clip.
- 2026-11-12: Recently shipped repo names always show in full, never cut off with an ellipsis. Long ones shrink to fit, down to 24px, then wrap at their hyphens.
- 2026-11-12: The resume PDF carries the site's brand on white paper (Anton, Hanken Grotesk, Fraunces, JetBrains Mono, pink rules and bullet markers), not pink on black: it gets printed and pasted into hiring systems.
- 2026-11-11: No date in the corner of blog post or newsletter thumbnails.
- 2026-11-12: Metadata lines (date, reading time, category) keep a visible separator between pieces; with no separator it wasn't clear where pieces start and stop. Of a pink slash, a gray bar and a pink dash, Joe picked the thin gray bar (MetaParts). No middle dots.

## Playful details

- 2026-11-13: Corrections on a post are a dated list in a box at the top; the wrong sentence is replaced, not crossed out in the text.
- 2026-11-13: The terminal card lives at its own address (`curl -L joekarlsson.com/hi`), not on the homepage by user agent.

## Consistency

- 2026-11-05: Consistency across the site comes first. Same column width for a post's text, the footer and the about/keep-reading blocks. Same hero treatment and video formatting on every page. The 404 page matches the rest (2026-11-10).
- 2026-11-10: The bottom of each page shows a next step that fits that page (a featured item worth pushing there), not one list everywhere. The contact page links to no posts.

## Images of Joe

- 2026-11-09: Video thumbnails pulled from Joe's footage: face centered and whole (both eyes, top of head), Joe looking good. Smiling or explaining mid-sentence is fine there. Pick frames for that, not for "clarity". Profile photos and headshots are different: no smiling-at-camera shots (memory feedback-headshots-no-smiling-camera-shots).
- Personal bios say what Joe makes and writes about. No employer or job title.

## Animation

- 2026-11-13: A post's animated figures stay at their empty first frame until they're mostly on screen, so the reader sees each one build from nothing. That's intended, not a blank-figure bug (a motion review flagged it).
- 2026-11-13: Subscribing plays a cut-paper envelope that seals with the crayon asterisk (picked over a rubber "SENT" stamp).

- 2026-11-10: Animations should think bigger than redrawing the post's diagrams: stick figures, drawings, the scribbly pink crayon style.

## Process

- 2026-11-10: Mockups and explainers for review are HTML pages, opened for Joe, not Markdown.
- 2026-11-06: During mockup and iteration rounds, don't deploy after every note. Deploy at the end of a phase; use judgment.
