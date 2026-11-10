---
name: explainers
description: Make paper-collage stop-motion explainers for joekarlsson.com posts and Joe's videos, the pasteup look - a flat color field, black-and-white cut-out photos with a paper keyline and soft shadow, built from empty one piece at a time on twos, with a real-type label last. Use in /write-post's animation phase, or when Joe asks for an animation, an animated explainer, a collage, a Vox-style clip, b-roll for a video, or "make this move".
---

# Collage explainers

The look is [pasteup](https://github.com/tmoody1973/pasteup)'s: one flat bold color field,
black-and-white cut-outs with a clean cut and a thin white paper keyline, a soft drop shadow
that lifts each piece off the field, one sharp idea per scene, and motion that builds the frame
piece by piece instead of wobbling a finished image. Joe picked it on 2026-11-10 after
rejecting diagrams played step by step, crayon stick figures, and a slick GSAP piece with
serif headlines and glass cards. The wobble on twos is the point: it matches the site's paper.

Everything is code and free: no image or video model. The rules come from 15 audited repos,
vendored in `vendor/` (licenses and commits in `vendor/SOURCES.md`); `references/craft.md` is
the merged rulebook. Read it before the first scene of a session.

## The tools

| Step | Command |
|---|---|
| Cut an element out of a photo | `npm run collage:cutout -- <in> <out.png> [--tone mono\|pink\|none] [--keyline 6] [--width 900] [--person]` |
| Preview a scene in a browser | `npm run collage -- <scene.json> --preview <scratchpad>/x.html` |
| The finished frame | `npm run collage -- <scene.json> --still <scratchpad>/x.png` |
| A post's copy | `npm run collage -- <scene.json> --post public/images/blog/<slug>/<name>` |
| A video (full size) | `npm run collage -- <scene.json> --out <file>.mp4` |

- `scripts/collage/cutout.mjs` lifts the subject with Apple Vision (the `subject` mode of
  `scripts/youtube-thumbnail-cutout.swift`; `--person` for people only), hardens the edge,
  tones it, and adds the keyline. No shadow and no background go into the element.
- `scripts/collage/collage.cjs` is pasteup's `assemble.py` ported to a canvas: same scene.json
  schema (`vendor/tmoody1973__pasteup/skills/pasteup/references/motion-recipes.md`), with one
  change: the label takes `font_family` (a Google Fonts family, Anton by default for the site)
  instead of a TTF path, and `"align": "center"` centers it on `x`. `tests/collage.test.ts`
  covers the motion math and the cut-out clean-up.
- `scripts/collage/render.mjs` draws each pose in headless Chromium and encodes with ffmpeg.
  `--post` writes `<name>.mp4` (1280 wide), `<name>.webp` and `<name>-poster.webp`; the post
  references `<name>.webp` and `src/plugins/rehype-gif-video.mjs` plays the clip in its place,
  in view, muted, with controls, poster first. Reduced motion and the pause button get the
  finished frame (`src/scripts/in-view-play.ts`). No new site code.

Scenes live in `scripts/collage/<slug>/<scene>/` (`scene.json`, `elements/`,
`sources.json`); originals in `media-sources/collage/<slug>/` (git-ignored). Copy
`scripts/collage/recording-setup-tour/its-a-prop-now/` (the first scene Joe approved and
shipped, 2026-11-10: his own photos, one piece in color, balanced around the center).

## The gates

Joe approves at each gate before the next one starts. Show work as files opened on his screen,
never as paths.

### 1. The idea (nothing made yet)

**An animation is a punctuation mark.** It goes where the post lands a punch: the reveal, the
gut punch, the turn, the payoff, the number that hurts. It makes that moment land harder. It
never illustrates a routine point that reads fine as text. Joe turned down two rounds of tidy
visual metaphors for ordinary points (2026-11-10): "the animation should be like an impactful
moment that needs a punctuation mark to land better... those just don't feel very
interesting to me". Find the moments first: read the post for its sharpest lines (short
standalone sentences, a twist, a reversal, a cost), rank them by how hard they hit, and pitch
only the top two or three. Then make each pitch as bold as the moment: say what the viewer
feels when it lands.

Joe's model for animation in a post is Ralph Ammer's The Creative Playground (`craft.md`,
"Model post: Ralph Ammer"). Pitch each moment as a change the viewer watches happen (a square
folding into a crane, "Game" rewritten as "Fun"), never as a picture that just appears.

For each moment, one short block:

1. **The claim** in one sentence, from the post.
2. **The object that does it.** Find a made, everyday object or scene that performs the
   claim, the way a turnstile does "one at a time" (`craft.md`, Story). Joe's own lines are
   often already the picture: "everyone learned to wave their arms like they were landing a
   plane".
3. **The pieces**: 3-6 cut-outs, each with where it comes from.
4. **Field and accent**: the background hex (site pink `#FF4FD8`, black, chalk, or one bold
   color that means something) and at most one accent.
5. **Assembly order**: structure first, then the figure or key piece, then what connects them,
   then the action, then the result, label last.
6. **The label**: the fewest words that still carry the claim. Run the deletion test on every
   word.

Two or three moments per post. Never one for decoration.

### 2. The elements

Sources, in this order:

1. **Joe's own photos and footage** (Immich, `media-sources/`, the video archive on the NAS).
   Joe picks any frame with his face in it.
2. **Public-domain and CC0 archives**: the Met's open access (studio shots on plain grounds,
   ideal to cut), NASA, the Library of Congress, Wikimedia Commons. Search Commons as in
   `.claude/rules/metaphor-thumbnails.md` and confirm the license on the file page. Old photos
   of whole scenes work: cut one subject out of each.
3. An image model only if Joe asks and has set a key. Pasteup's Gemini route is vendored
   (`generate_element.py`) but not wired in.

Record every source in the scene's `sources.json` (url, license, what it shows, what was done
to it). Cut each with `npm run collage:cutout`, then show Joe a contact sheet of the elements
on the field color. Recut or swap any with a broken matte (hair, glass, smoke): don't ship one.

### 3. The scene and its approval still

Write `scene.json` (pasteup's choreography defaults: one piece at a time 0.35-0.6 s apart,
each slides in from its nearest edge and snaps with about 8% overshoot, on twos, the label
last, then at least 1.2 s of the finished frame still breathing). Render `--still` and
`--preview` and a contact sheet of the build (first frame, every landing, last frame), check
it against `craft.md`'s QA list, and open them for Joe.

### 4. Build and ship

`--post` into the post's image folder and reference the still in the markdown with real alt
text, under the paragraph it shows, or, where the post already embeds clips with `<video
data-autoplay-in-view data-phone-still ...>` tags, use the same tag with the `-poster.webp`
(and delete the unused `.webp`). For a video, `--out` at full size; a vertical cut is the
same scene with a 1080x1920 canvas and new positions. Build the post, run the
`motion-reviewer` and `design-reviewer` agents on it, and fix High and Medium findings.

## Not built yet

Ask before building any of these; each is a real gap, not a nice-to-have:

- Several scenes cut together, with transitions carried by an object (`craft.md`, Sequences).
- Camera push and parallax across depth layers (Vox does this; pasteup locks the field).
- A halftone treatment for elements (optional: mono reads as print already).
- Narration and sound, and timing scenes to them.
