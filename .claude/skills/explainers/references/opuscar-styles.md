# Lemo-Opuscar styles to try

Styles from [Lemo-Opuscar](https://lemomo-ai.github.io/lemo-opuscar/) (99 film styles, each a
style prompt plus a short film made in code) that fit the site's paper, chalk and pink crayon
look, picked 2026-11-27 at commit `439b98af08`. Joe asked to keep them for later; none is
approved for a post yet, so each still goes through the gates.

**License.** The style prompts (`STYLE.md`) are CC BY-NC 4.0: read them for ideas, never copy
their text into this repo. The demo code is MIT and can be ported with a credit line.
The summaries below are ours. Links: the gallery page shows the film, the repo folder has
`STYLE.md` and the demo's code.

**Posts vs videos.** A post's animation is an inline SVG stepped by SMIL, no script, no video
(DECISIONS 2026-11-10). Their films draw on canvas or WebGL, so for a post we copy the idea and
redraw it with the diagram kit; for a video (b-roll, Shorts) the canvas code can run as is
through `scripts/collage/render.mjs`-style capture.

| Style | Gallery · repo | What it is | Where it fits | Code worth reading |
|---|---|---|---|---|
| Marker on Paper | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/marker-paper/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/marker-paper) | A felt-tip works a problem out on white paper, letters written stroke by stroke | Posts: callouts and worked numbers | `demo/pen.js` (stroke wobble, ink build-up), `demo/tools/skeleton.py` (glyph centre lines for handwriting) |
| Sketchnote | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/sketchnote/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/sketchnote) | One pen follows a single thing across a page until the page is a poster | Posts: a process from start to end | `demo/tools/skeleton.py`, `demo/index.html` |
| Stick-figure Explainer | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/stick-explainer/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/stick-explainer) | Stick people and rings that grow past the frame to explain a number | Posts: the "think bigger" stick figures (DECISIONS 2026-11-10) | demo code |
| Whiteboard Explainer | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/whiteboard/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/whiteboard) | Classic draw-while-explaining on a whiteboard | Posts and videos: how a system works | `demo/engine/wb.js` (resample, Chaikin smoothing, wobble: the stroke geometry Marker on Paper reuses) |
| Chalkboard | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/chalkboard/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/chalkboard) | Chalk writes a claim, wipes it, writes the real answer | Posts: myth vs fact; matches the chalk arrows | demo code |
| One-line Drawing | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/one-line/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/one-line) | One line that never lifts draws the whole story | Posts: a section break or a short loop | demo code |
| Pen Plotter | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/pen-plotter/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/pen-plotter) | A plotter draws real data with four pens and real acceleration | Posts: homelab and data figures drawn by a machine | `demo/plot.js` (trapezoid speed profile for pen moves) |
| Instruction Manual Art | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/instruction-manual/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/instruction-manual) | Flat-pack manual pages, numbered steps, a step that isn't in the manual | Posts: setup guides and tutorials | `demo/iso.js`, `demo/rig.js` (isometric figures and posing) |
| Line-Art Cutaway | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/hardcore-info/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/hardcore-info) | A product opened up in clean line art to show where a part hides | Posts: hardware (NAS, Pi, server builds) | demo code |
| Color-Coded Mechanism | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/precise-mechanism/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/precise-mechanism) | A cutaway whose systems are coloured one at a time | Posts: a system's parts, one pink at a time | demo code |
| Halftone Dossier | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/halftone-dossier/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/halftone-dossier) | A case file in halftone dots, stamped and filed | Posts and videos: humour, investigations (already quoted in `craft.md`) | demo code |
| Vintage Engraving Collage | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/vintage-collage/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/vintage-collage) | Old engravings cut out and pasted into a new story | Videos and posts: close to pasteup with public-domain art | demo code |
| Risograph Print | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/risograph/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/risograph) | Each scene adds an ink until misregistered plates overprint | Videos; a post hero | `demo/riso.js` (plate offsets and grain) |
| Pictogram Motion | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/pictogram-motion/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/pictogram-motion) | Signs, objects and weather as beat-locked geometric pictograms | Posts: flows told with icons, near the Lucide set the kit uses | demo code |
| Swiss Motion Graphics | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/swiss-motion/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/swiss-motion) | A grid, one signal colour, every move on the beat | Videos: title cards; pink as the signal colour | demo code |
| Data Storytelling | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/dataviz/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/dataviz) | A chart that tells the story by building | Posts: charts (the site's charts already build in) | demo code |
| 1-bit Dither | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/one-bit-dither/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/one-bit-dither) | A picture arriving one printed line at a time in two inks | Posts: screenshots or photos arriving over a slow link | demo code |
| CRT ASCII Terminal | [film](https://lemomo-ai.github.io/lemo-opuscar/styles/ascii-crt/) · [repo](https://github.com/lemomo-ai/lemo-opuscar/tree/439b98af08/styles/ascii-crt) | A terminal that draws in characters | Videos: terminal and agent stories | `core/post/crt.js` (CRT pass, MIT) |

Skipped: the 3D and miniature styles (WebGL only, nothing to port to SVG), the three that need an
image generator (Manga Panels, Text Flash Cuts, Comic History Cartoon), and Mascot Screencast and
OPUSCAR 98, whose Clawd belongs to Anthropic.
