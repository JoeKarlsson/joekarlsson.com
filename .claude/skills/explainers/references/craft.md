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
5. **Frame it for a phone too.** "central subject within the middle 70 percent; generous clean
   color-field negative space; 3–6 large separable paper groups" (`VOX-COLLAGE-BROLL`).
6. **Depth needs a foreground.** "Every scene is three layers... A scene missing the foreground
   looks like a slide." (`vox-editorial: vox-skill/SKILL.md`) A piece that overlaps another
   (the guest in front of the couch) is the cheapest depth there is.
7. **Gauges and clocks get plain ticks**, "never Roman numerals or digits", and no "Zzz" marks
   (`VOX-COLLAGE-BROLL`).
8. **Halftone, if used, is a medium, not a filter.** "Shading is never a gradient: it is
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
5. **Clean cuts**: no halo, no leftover background, no hair or glass matte pretending to be
   fine.
6. **The deletion test** on every word in the label: what does the viewer lose without it?
   (adapted from `video-director-workflow: references/text-selection.md`)
7. **The still holds the point** on its own: it's what phones, reduced motion, the pause button
   and the poster show (`anidoodle: workflows/site-art.md`, "build frame 0 as a finished picture
   in its own right").
