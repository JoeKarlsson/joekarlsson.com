# Collage craft: the merged rulebook

The rules behind every collage explainer, merged from the vendored repos (`../vendor/`,
licenses and commits in `../vendor/SOURCES.md`). Quotes are verbatim; the source follows each
one, shortened to `repo: file`. Pasteup's own rules (`tmoody1973__pasteup`) are the base and
win any conflict; the rest fill in what pasteup doesn't cover.

## Story: show the mechanism

1. **The object is the explanation.** "Build a thing whose working is the idea."
   (`hyperframes: references/story.md`) "A mechanism beats a diagram." (`anidoodle:
   workflows/explainer.md`)
2. **Find a made object that does the action**, "a turnstile for 'one at a time', a sieve for
   a filter" (`anidoodle: workflows/machines.md`). "Prefer metaphors a viewer recognizes from
   everyday life (a kettle, a snowball, a photo booth) over abstract ones" (`VOX-COLLAGE-BROLL:
   SKILL.md`). The same instinct as the site's metaphor thumbnails.
3. **The pictures carry it alone.** "Read the lines alone: a stranger gets the pitch. Watch
   the pictures alone: they tell the same story." (`hyperframes: references/story.md`) If the
   label is doing the explaining, the scene has failed (Joe's rejection of the GSAP mock: it
   narrated in headlines).
4. **The named object moves ON its name**, and "Payoffs resolve WITH their reasoning, never
   before." (`animated-explainer-skills: gsap-explainer/SKILL.md`)
5. **One sharp idea per scene** (pasteup), with "one main reading focus per beat" (adapted
   from `video-director-workflow: references/text-selection.md`, in Chinese).

## Collage art direction

1. **Element-first.** "The finished frame is composed, not generated." No shadow or background
   in an element; the compositor adds both, so they match across a scene. (pasteup)
2. **A small palette with meaning.** Field, paper, ink, "one primary accent, and at most one
   supporting accent" (`voxstylehub: references/visual-language.md`); "never color for color's
   sake" (`VOX-COLLAGE-BROLL`). "Do not add a colour." (`vox-editorial:
   vox-skill/references/visual-system.md`)
3. **One shadow family.** "`shadow_logic`: one direction, one depth range, one softness
   family" (`voxstylehub: visual-language.md`). Keep pasteup's dx/dy/blur/opacity the same for
   every piece at one depth; vary them only to say a piece floats higher.
4. **Pieces sit on the field.** "Do not wrap every asset in another paper card." "Keep
   evidence larger and quieter than decoration." (`voxstylehub: visual-language.md`)
5. **Balance the weight.** Joe judges a frame by visual weight first (2026-11-10, "the balance is
   wrong, like weight-wise"). The hero piece anchors the center; supporting pieces carry matching
   mass on either side at similar heights; a label spans the frame centered (`"align": "center"`,
   with `x` as its center) instead of sitting in one corner. A color piece among mono ones is
   heavy: put it in the middle.
6. **Messy edges are fine.** Ragged cuts and stray bits of keyline read like the site's
   scribbles; Joe said "it can look messy" (2026-11-10). Don't smooth them away. Fix what's
   unbalanced or unclear, not what's handmade.
7. **One piece in color is a punchline.** Keep the scene mono and leave only the thing the joke is
   about in full color (the glowing Prusa in "It's a prop now").
8. **Frame it for a phone too.** "central subject within the middle 70 percent; generous clean
   color-field negative space; 3–6 large separable paper groups" (`VOX-COLLAGE-BROLL`).
9. **Depth needs a foreground.** "Every scene is three layers... A scene missing the foreground
   looks like a slide." (`vox-editorial: vox-skill/SKILL.md`) A piece that overlaps another
   (the guest in front of the couch) is the cheapest depth there is.
10. **Gauges and clocks get plain ticks**, "never Roman numerals or digits", and no "Zzz" marks
   (`VOX-COLLAGE-BROLL`).
11. **Halftone, if used, is a medium, not a filter.** "Shading is never a gradient: it is
   halftone dots" (`lemo-opuscar: styles/halftone-dossier/STYLE.md`); keep the dots pinned to the
   object as it moves, or the texture swims (`riso-windowseat: docs/quality-bar.md`). Mono
   prints read as collage without it.

## Motion

Pasteup's cadence is the base (`pasteup: references/motion-recipes.md`): on twos, per-pose
jitter of about 1.5 px and 0.4 degrees, an easeOutBack snap of about 8%, the shadow settling
after the piece, one piece at a time 0.35-0.6 s apart, structure first and the decisive detail
last, the label after everything, and the finished frame held at least 1.2 s.

1. **An order that tells the story**: base structure, then the figure or key piece, then
   connectors, then the action, then the result (`gbro-collage-broll: SKILL.md`).
2. **A lead and its reactions**, "at uneven offsets... never an even stagger" (`motion-kit:
   motion-designer/SKILL.md`). Vary the gaps between pieces.
3. **Duration from distance**: a piece that travels farther takes longer (`motion-kit`). "Easing
   is a claim about mass" (`riso-windowseat: docs/motion.md`): a heavy couch lands slower than a
   paper label.
4. **Restraint.** "A device... earns its place by carrying the story. About one signature
   transition per piece." (`motion-kit`) "One native move: a moment only this medium can do...
   Put it at the emotional peak." (`lemo-opuscar: DIRECTOR.md`) In collage it's the decisive
   piece arriving last.
5. **No AI looks**: "fade-everything, blur-in type, drifting glow orbs, shimmer text"
   (`motion-kit`). Never scale from zero: "Do not use `scale(0)`" (`voxstylehub:
   references/remotion-scene-contract.md`). Banned looks by default include "glass cards" and
   glow (`hyperframes: references/spec.md`).
6. **Two to four things move at once, at most.** "If everything moves, the scene loses the
   approved composition" (`Paper-Cut: references/image-led-production.md`).
7. **Words hold still once landed**: "a landed title is dead still" (`hyperframes:
   references/motion.md`). A label stays up at least "`max(0.7 s, 0.3 s per word)`"
   (`anidoodle: references/craft-bar.md`).
8. **Animate data by its own logic**: "bars grow from baseline, lines draw left to right"
   (`lottie: references/motion-taste.md`).

## Model post: Ralph Ammer

Joe holds up Ralph Ammer's [The Creative Playground](https://ralphammer.com/how-to-get-started/)
as the way posts should use animation (2026-11-10). Its drawings are black line art. Our look
stays pasteup collage, so take his motion grammar, not his drawing style. All 11 GIFs were
pulled and read frame by frame on 2026-11-10:

| GIF | What moves | Length |
|---|---|---|
| Basketball cage | The cage and the two players inside barely move; small figures walk past outside it | 5 s |
| Game = Goal + Rules | "Game" is scribbled out and rewritten as "Fun" in orange, then back | 2.5 s |
| Playing field | One rectangle's lines turn from one sport's court into another's and end on basketball | 14 s |
| Oneliners | One unbroken line draws a bunny, then glasses, then a glass, at hand speed | 13 s |
| Focus, time limit, format, skill | A 220x100 icon with a handwritten word; only the line boils | 2 s each |
| Origami | One square folds into a crane, then a rabbit, then a paper plane, and back to the square | 21 s |
| Japanese wood joints | Two plain blocks are cut and slot together into a different joint each time | 17 s |
| Four tips | A still: four icons with labels, summing up the list | still |

What to take from it:

1. **Animate a change, never a picture.** Each of his loops shows something becoming
   something else. If nothing in the scene changes state, it's a still.
2. **Same material, different results, back to the start.** The origami, the joints and the
   field all reset to the blank first frame, so the loop itself makes the argument: the
   same limits, many results. When the claim is "one thing, many outcomes", build the loop
   to land back on its first frame.
3. **Show the process at its real speed.** Oneliners draws at hand speed instead of showing
   the finished drawing. When the claim is about doing something, show it being done.
4. **The idea holds still; life moves at the edges.** In the cage scene the cage and the
   game barely move and only the passers-by walk. This is the same rule as "two to four
   things move at once" above.
5. **The cheapest punchline is a word that changes.** "Game" crossed out and rewritten as
   "Fun" is one word in one accent color, used once in the whole post. A label that
   rewrites itself can land a reveal without a full scene.
6. **Small, silent, looping, no controls.** Most are under 400 px wide and the icons are
   220x100, the size of a word. None is wider than the text column, none has sound, and
   every loop is 2 to 21 s.
7. **The picture comes first, then the words.** Each one sits directly above the paragraph
   that bolds the term it shows. The text never says "as you can see"; the two say the same
   thing on their own.
8. **One accent color for the whole post** (his orange appears once). That matches rule 7 of
   the art direction above: one piece in color is a punchline.

**Tiny icons are a second kind, and Joe wants them** (2026-11-10, "I'd love to try out his
format of using tiny icons"). Ammer's focus, time limit, format and skill icons are a few
lines and one handwritten word, about 220x100, where nothing changes and only the line
boils. They mark the key terms of a list or a run of short sections, so they may show a
routine point, unlike a collage scene. Use them as a set (three to five in a post, one per
term, the same size and stroke), each above the paragraph that bolds its word. The word
holds still; only the lines boil (the site rule). The look is still being picked, and
there is no tool to make them yet.

## Sequences (not built yet; for when scenes get cut together)

1. "no two adjacent beats use the same camera move... reserve `static` for the payoff/quote
   beat" (`vox-director: references/beat-layer.md`).
2. "Overlap outgoing and incoming scene bodies." (`Paper-Cut: references/hyperframes-assembly.md`)
3. A scene change should carry something across (an object, a rail, a color) or reset on
   purpose (`voxstylehub: references/visual-qa.md`).
4. "Sequential occupancy": a zone is vacated before it's reused (`animated-explainer-skills`).
5. Keep 0.1-0.3 s of empty field before the first entrance (`Paper-Cut:
   references/storyboard-schema.md`).

## QA, before Joe sees it

1. **Watch it three ways**: "Watch once at normal speed, once muted, and once
   frame-by-frame" (`voxstylehub: references/visual-qa.md`). Silent clips skip "muted".
2. **The build, not just the end**: "Do not judge from the end frame alone — check the assembly
   progression and the final landing" (`VOX-COLLAGE-BROLL`). Make a contact sheet: first frame
   (must be the empty field), every landing, last frame.
3. **Phone size**: downsample the still to 360 px wide; a subject that reads as a "postage
   stamp" gets bigger (`voxstylehub: visual-qa.md`).
4. **Not a slide**: would it read "as a slide deck with transitions removed"? Then it isn't
   telling the story with the pieces (`voxstylehub: visual-qa.md`).
5. **Cuts that read as the object**: messy edges are fine, but the subject must be whole and
   recognizable (a missing leg or a chair that came out as a shelf gets recut or dropped).
6. **The deletion test** on every word in the label: what does the viewer lose without it?
   (adapted from `video-director-workflow: references/text-selection.md`)
7. **The still holds the point** on its own: it's what phones, reduced motion, the pause button
   and the poster show (`anidoodle: workflows/site-art.md`, "build frame 0 as a finished picture
   in its own right").
