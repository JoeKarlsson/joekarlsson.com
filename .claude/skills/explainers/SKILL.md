---
name: explainers
description: Storyboard, test and build animated explainers for joekarlsson.com posts and pages (step-through diagrams, stop-motion sequences, physics moments, transcript replays, scrubbable toys, wipes) in the site's cut-paper style. Use in /write-post's storyboard phase, when Joe asks for an animation, an animated explainer or "make this move", or when a diagram should play step by step.
---

# Animated explainers

An explainer is a moment in a post that lands better moving than still. Each one goes
through the same four gates: pick the moment, storyboard it, test its hardest second,
build it. Joe approves the storyboard before any build work starts, and nothing ships
without a still fallback.

## 1. Pick the moments

Name each section's one claim in plain words. A claim earns an explainer when it's about
change over time: a sequence, cause and effect, speed or scale, a before and after,
something being refused. If a still would need a paragraph to describe what happens,
that's a candidate. Pick two or three per post at most, and never one for decoration.

Pick the form that fits the claim, and vary forms across a post:

1. **Step-through diagram.** A diagrams-skill figure with Next and Back: each step lights
   one part pink and moves one thing. For request flows, pipelines and layers. Diagrams
   still go through the `diagrams` skill first; a step-through is a diagram that plays.
2. **Stop-motion sequence.** Paper pieces hop on `steps()`, like the boil. For timing,
   races and "too late".
3. **Physics.** Things fall, pile up and collide. For many things sorted into buckets,
   volume and overload.
4. **Transcript replay.** Tool calls or log lines drop in one at a time and end on a
   result or a stamp. For what an agent did and what it was refused.
5. **Scrub or toy.** A slider or drag the reader controls, with the outcome redrawn as
   they move it. For trade-offs and thresholds.
6. **Wipe.** Before and after behind a `clip-path` reveal. For redesigns and refactors.
7. **Count-up.** A number runs to its value beside what it means. Only when the size is
   the point.

## 2. Storyboard

One board per moment in `scripts/storyboards/<slug>/<nn-name>.mjs`. Copy the shape of
`scripts/storyboards/doom-mcp-server/` (all four forms it uses are there). A board exports:

- `board`: `title`, `section` (the heading it sits under), `form`, `claim` (what the reader
  should get, one or two sentences), `trigger`, `library`, `still`, `test`.
- `frames`: 4-6 keyframes, each `{ at, note, draw(f) }`. `at` is a time (`0.5s`) or a step
  (`Step 3`); `note` says in one line what moves. Drawn at 640 wide, 360 tall by default.
- `phone`: `{ note, height, draw(f) }`, the still that phones, reduced motion and the pause
  button get, drawn at 360 wide as its own layout.

Frames use the diagram kit (`scripts/diagrams/draw.mjs`, methods listed in the diagrams
skill), so they're torn paper with real logos and boil like the post will. Pink marks
what the reader should look at in that frame. Every fact in a frame (names, numbers,
tool calls, error text) comes from the post or the project's code. Where the build will
swap in real data, say so in `trigger` or the frame note.

```bash
npm run storyboard -- <slug> <scratchpad>/<slug>-storyboards.html
```

It fails on the same overflow and arrow checks as a diagram. Fix the layout, never the
check. Then look at it yourself before Joe does: screenshot the page with headless Chrome
(`--headless=new --window-size=1300,9000 --screenshot=...`), crop it with ffmpeg, Read the
crops, and fix anything sitting on a label. Then open it for Joe (`open -a Firefox <file>`)
and ask, by board number, whether to approve, change a frame or cut it. Don't build
anything a board hasn't been approved for.

Every board follows these rules:

1. **The reader starts it** with Play, Next or a control. It never starts on page load or
   on scroll. (Decoration that draws itself once may start when scrolled into view, as in
   `~/.claude/knowledge/web-motion.md`, but that isn't an explainer.)
2. **The last frame holds the whole point by itself.** It's usually the still.
3. **Stepped timing** (8-12fps, `steps()`) for anything that moves. Smooth easing is only
   for the controls, per web-motion.md.
4. **Words hold still**, as in diagrams: text, logos and icons don't wobble or slide while
   being read.
5. **Every board has a still.** Phones, `prefers-reduced-motion`, the pause button, Save-Data
   and 2g/3g connections all get it. Step-throughs keep their buttons on a phone, but each
   step snaps into place instead of moving.

## 3. One-second test

For each approved board, build only the effect named in `test`, about one second of it,
as a standalone page in the scratchpad: the real library, real kit SVG parts and the
real timing. Check it at 1280 and 390 wide, and open it for Joe. Iterate on the motion
here, where it's cheap, and not in the post.

## 4. Build

- **Library, in this order:** CSS `steps()` and the Web Animations API; then
  [Anime.js](https://animejs.com/) for timelines you need to seek (Back buttons,
  scrubbing) and staggered choreography; then [Matter.js](https://brm.io/matter-js/) for
  physics. Install with npm under `.claude/rules/dependencies.md` and import it only from
  the explainer's own module, so it's split out and loads on the post that uses it, and
  not before the reader presses Play. Physics never loads on a phone.
- **Markup:** the still is a kit-drawn figure (`npm run diagrams`, inlined by
  `rehype-inline-diagrams`). The animation module goes in
  `src/scripts/explainers/<slug>-<name>.ts` and moves parts of that figure by id or
  class, so a failed script leaves the still. The first explainer built defines how a
  post loads its module: write that convention into this section when it lands.
- **Motion gates:** use `mayBoil()` from `src/utils/paper-hero-motion.ts` to decide whether
  motion plays, and respect `isMotionPaused()` and `MOTION_RESUMED_EVENT` from
  `src/scripts/pause-motion.ts`.
- **Review:** build the post, run the `motion-reviewer` and `design-reviewer` agents on
  it, and fix their High and Medium findings. `deploy.sh`'s phone smoke test
  (`scripts/smoke-phone.mjs`) has to pass.
- When the explainer ships, delete its board file. The explainer is now the record.

## Libraries looked at (2026-11-10)

From a "Claude Motion Tips" list of open-source effects:

| Library        | Verdict                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- |
| Anime.js       | Use for step-throughs and choreography: timelines that seek, staggers, SVG line draws.   |
| Matter.js      | Use for physics moments, desktop only, loaded on Play.                                   |
| Rough.js       | Untested. Might add hatching to the kit at build time; compare one side by side first.   |
| p5.brush       | Offline only, to make textures. Too heavy to run on the page.                            |
| PixiJS filters | No. WebGL, heavy, generic glitch and glow, and it fights the site's own halftone.         |
| thinking-orbs  | No. Glowing AI orbs are the stock look the site avoids.                                  |

The same page's 400-video gallery of Claude-made motion is worth browsing for a reveal or
a timing pattern. The one-second test above comes from its "test one second first" tip.
