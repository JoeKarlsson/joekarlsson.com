---
name: explainers
description: Storyboard, test and build animated scenes for joekarlsson.com posts and pages - stick figures, cut-paper puppets, props and Joe's own scribbles acting out a moment from the post, in the site's crayon-and-torn-paper look. Use in /write-post's storyboard phase, or when Joe asks for an animation, an animated explainer or "make this move".
---

# Animated explainers

An explainer is a moment in a post that lands better moving than still, acted out as a
drawn scene: stick figures, cut-paper puppets, props and Joe's own scribbles doing the
thing the post describes. It shares the site's design language (crayon, torn paper, tape,
pink and black, the stepped boil), not the diagrams' look.

**An explainer is not a diagram.** Boxes, arrows, logos and labelled layers belong to the
`diagrams` skill. Playing a diagram one step at a time is still a diagram, and Joe rejected
exactly that for the Doom post: "You're just copying my diagrams. I want to think bigger
than that." If a board's frames could pass for a figure from the diagrams skill, redraw it
as a scene: who is in it, where are they, and what do they do?

Each one goes
through the same four gates: pick the moment, storyboard it, test its hardest second,
build it. Joe approves the storyboard before any build work starts, and nothing ships
without a still fallback.

## 1. Pick the moments

Name each section's one claim in plain words, then find the scene in it: a person, an
animal or a thing doing something the reader can picture. The best moments are already
in Joe's own lines: "everyone learned to wave their arms like they were landing a plane",
"nothing kills a movie like the kitchen lighting up because you went for popcorn". Posts
about software still have scenes: the agent as a character walking into a locked door,
the server as a bouncer, a request as a courier who arrives too late. Pick two or three
per post at most, and never one for decoration.

Ways to stage it (vary them across a post):

1. **Stop-motion scene.** Characters and props acted out frame by frame, each frame its
   own drawing on `steps()`. The default.
2. **Then and now.** The same scene twice: how it went wrong, then the fix.
3. **Physics.** Characters or props fall, pile up and collide. For overload and sorting
   many things.
4. **Toy.** The reader drags or slides something in the scene (the time of day, the number
   of guests) and the characters react.
5. **Wipe.** Before and after behind a `clip-path` reveal, for a redesign or refactor.

## 2. Storyboard

One board per moment in `scripts/storyboards/<slug>/<nn-name>.mjs`. Copy the shape of
`scripts/storyboards/best-home-assistant-automations/`. A board exports:

- `board`: `title`, `section` (the heading it sits under), `form`, `claim` (what the reader
  should get, one or two sentences), `trigger`, `library`, `still`, `test`.
- `frames`: 4-6 keyframes, each `{ at, note, draw(f) }`. `at` is a time (`0.5s`) or a step
  (`Step 3`); `note` says in one line what moves. Drawn at 640 wide, 360 tall by default.
- `phone`: `{ note, height, draw(f) }`, the still that phones, reduced motion and the pause
  button get, drawn at 360 wide as its own layout.
- `kit = 'sketch'`, and `board.look`: `crayon` (chalk crayon on black), `puppet` (cut-paper
  strips pinned at the joints) or `sketchbook` (black crayon on a taped-in chalk page).

Frames draw with the scene kit, `scripts/storyboards/sketch.mjs`: `figure(x, y, pose)`
(poses in `POSES`: stand, sit, walk, wave, carry...; `facing: -1` mirrors), props (`lamp`
with a light level, `couch`, `tv`, `cat`, `sensor`, `counter`, `popcorn`), `chip` for a
caption on a torn pink scrap, and `mark` for any of Joe's traced scribbles in
`src/data/scribbles.ts` (face, devil, cloud, spiral, star...). Add a prop or pose to the
kit when a scene needs one; keep it drawn the same crayon way. Pink marks what the reader
should watch in that frame: the light, the sensor seeing, the thing that changed. Every
fact in a frame (numbers, timings, what happens) comes from the post.

For a new post, or when the look is still open, start with a look sheet: a board with
`pick: true` drawing one frame in each look (`look` per frame). Joe picks the look before
the rest of the boards are drawn in it.

```bash
npm run storyboard -- <slug> <scratchpad>/<slug>-storyboards.html
```

It fails on text running off a frame or phone text under 13px. Fix the layout, never the
check. Then look at it yourself before Joe does: screenshot the page with headless Chrome
(`--headless=new --window-size=1300,9000 --screenshot=...`), crop it with ffmpeg, Read the
crops, and fix anything sitting on a label. Then open it for Joe (`open -a Firefox <file>`)
and ask, by board number, whether to approve, change a frame or cut it. Don't build
anything a board hasn't been approved for. Check every board against the rule above: no
frame should look like a diagram.

Every board follows these rules:

1. **The reader starts it** with Play, Next or a control. It never starts on page load or
   on scroll. (Decoration that draws itself once may start when scrolled into view, as in
   `~/.claude/knowledge/web-motion.md`, but that isn't an explainer.)
2. **The last frame holds the whole point by itself.** It's usually the still.
3. **Stepped timing** (8-12fps, `steps()`) for anything that moves. Smooth easing is only
   for the controls, per web-motion.md.
4. **Words hold still:** captions don't wobble or slide while being read.
5. **Every board has a still.** Phones, `prefers-reduced-motion`, the pause button, Save-Data
   and 2g/3g connections all get it. A "then and now" pair stacked in two panels makes a
   good still.

## 3. One-second test

For each approved board, build only the effect named in `test`, about one second of it,
as a standalone page in the scratchpad: the real library, real kit SVG parts and the
real timing. Check it at 1280 and 390 wide, and open it for Joe. Iterate on the motion
here, where it's cheap, and not in the post.

## 4. Build

- **Library, in this order:** CSS `steps()` and the Web Animations API; then
  [Anime.js](https://animejs.com/) for timelines you need to seek (a toy's slider,
  Replay from the middle) and characters moving together; then [Matter.js](https://brm.io/matter-js/) for
  physics. Install with npm under `.claude/rules/dependencies.md` and import it only from
  the explainer's own module, so it's split out and loads on the post that uses it, and
  not before the reader presses Play. Physics never loads on a phone.
- **Markup:** every drawing comes from the same `sketch.mjs` code as the approved board,
  rendered to SVG at build time: the still inline in the post, the other drawings beside
  it. The animation module goes in `src/scripts/explainers/<slug>-<name>.ts` and swaps
  drawings on `steps()`, so a failed script leaves the still. The first explainer built defines how a
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
| Anime.js       | Use for choreography: timelines that seek, staggers, SVG line draws.                     |
| Matter.js      | Use for physics moments, desktop only, loaded on Play.                                   |
| Rough.js       | Untested. Might add hatching to the kit at build time; compare one side by side first.   |
| p5.brush       | Offline only, to make textures. Too heavy to run on the page.                            |
| PixiJS filters | No. WebGL, heavy, generic glitch and glow, and it fights the site's own halftone.         |
| thinking-orbs  | No. Glowing AI orbs are the stock look the site avoids.                                  |

The same page's 400-video gallery of Claude-made motion is worth browsing for a reveal or
a timing pattern. The one-second test above comes from its "test one second first" tip.
