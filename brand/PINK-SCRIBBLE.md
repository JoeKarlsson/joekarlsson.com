# Pink Scribble: the look in one page

> Black paper, one hot pink, Anton shouting in caps, and crayon marks that never sit still. Hand-made on purpose, but sharp: a graphic magazine somebody drew on, not a craft project.

This is the look of joekarlsson.com, its post diagrams and animations, and Joe's personal videos (the Pink Scribble profile). It collects rules that already exist elsewhere; each one names where it comes from. When this page and a source disagree, the source wins: `DECISIONS.md` in this repo for the site, the private video pack's `DECISIONS.md` for videos. Add new verdicts there first, then update this page.

The site's goal, in Joe's words, is to convey "smarts, taste, vision, optimism, punk attitude" (DECISIONS 2026-11-15). Judge anything new against that.

Section layout after the `STYLE.md` files in [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) by Lemomo (LemoLab). Only the layout is borrowed; the words are ours.

## 1. What it is, and what it isn't

- **It is** pure black pages, paper-white text, gray metadata and a single hot pink accent (`src/styles/global.css`, "Black ink, paper-white text, gray metadata, one hot pink accent").
- **It is** marks drawn by hand: crayon underlines, arrows, bursts and doodles that draw themselves in and boil while they hold (`src/components/Scribble.astro`, `src/styles/motion.css`).
- **It is** cut paper for explaining things: torn scraps with a slight tilt, real logos, chalk arrows (`.claude/skills/diagrams/SKILL.md`, style rule 1).
- **It is not a zine.** Joe passed on issue covers, ransom-note titles, gig flyers, ticket stubs, stamps and label tape: "less zine-inspired... more like graphic magazine, design magazine, high-end art magazine" (DECISIONS 2026-11-15). Kinetic Collage (spray marks, type walls, sliced mastheads) is also out (DECISIONS 2026-11-19).
- **It is not a UI kit.** Components ported from UI libraries "don't feel like they fit"; an idea has to come from what a page needs (DECISIONS 2026-11-15, Kokonut UI round).
- **It is not smooth.** Reviews must never sand the personality off: "My fear is that we smooth off stuff until it like becomes homogeneous" (DECISIONS 2026-11-17).

## 2. Materials and rendering

- **Paper** is black `#000000`. Panels step up through `#111111`, `#1a1a1a`, `#222222`, `#3a3a3a` (`global.css`, `@theme`).
- **Cut-paper scraps** (diagrams): each part is a closed shape whose edge points are nudged a little, so it reads as torn, and the whole part tilts slightly. Pink scraps are the post's own system, chalk scraps are what it talks to, black scraps with a chalk edge are people, prompts and plain steps, dashed edges mean "sometimes". No tape (diagrams SKILL, rule 1; `scrap()` in `scripts/diagrams/draw.mjs`).
- **Crayon** is an SVG filter: fine fractal noise displaces the stroke's edge, and a second noise punches waxy gaps in it (`#crayon` in `src/layouts/BaseLayout.astro`; `crayonFilter()` in `draw.mjs`, one filter per stroke and sized to that stroke, because a figure-sized filter crashed iPhone Safari).
- **Crayon on phones** draws 1.5x thicker under 48rem so marks still read, but small packed marks stay small, or a fat line turns them into a blob (DECISIONS 2026-11-24; `global.css`, "Crayon line on phones").
- **Pictures are pink**: every photo and clip is turned gray, its levels stretched to black and white, then pink is multiplied over it. Black stays black, white becomes pink, nothing is dithered. It's done in CSS, not WebGL (DECISIONS 2026-11-22; `global.css`, "Pink pictures"). The look must stay "crystal clear": no halftone dots, though the darkening is fine (DECISIONS 2026-11-15). The pink grade is never dropped (DECISIONS 2026-11-06, 2026-11-09).
- **Exceptions to the pink**: frames inside a film review stay natural color, because the color is often the point (DECISIONS 2026-11-13). Review share cards do get the pink (DECISIONS 2026-11-15).
- **Collage explainers** use cut-out photos with a thin white paper keyline and a soft shadow on one flat bold field (`.claude/skills/explainers/SKILL.md`, after pasteup).

## 3. Colour

| Name  | Hex       | Use                                    | Source                              |
| ----- | --------- | -------------------------------------- | ----------------------------------- |
| Ink   | `#000000` | the page, black scraps                 | `global.css`                        |
| Paper | `#ededed` | text, paper-white stickers             | `global.css`                        |
| Muted | `#a3a3a3` | metadata, notes beside lines           | `global.css`                        |
| Pink  | `#ff4fd8` | the one accent                         | `global.css`, `brand/README.md`     |
| Chalk | `#ece6da` | flow arrows, hover boxes, chalk scraps | `src/data/scribbles.ts`, `draw.mjs` |

- **One accent, on the thing that matters.** In an animation, pink goes to the one thing that moves on its own (diagrams SKILL, "Animated figures"; `.claude/blog-core/visuals.md`, "One accent color").
- **Pink crayon is for callouts, chalk is for flow.** A callout never looks like a flow line (diagrams SKILL, rule 6).
- **Headers are one font, one color**: pink Anton, no white-plus-pink mix (DECISIONS 2026-11-16, reversing 2026-11-15).

## 4. Type

- **Anton**, caps, for names, headers and labels; **Hanken Grotesk** for phrases and body; **Fraunces** (italic) for reading voice, pull quotes and interludes; **JetBrains Mono** for code (`global.css`, `@theme inline`; diagrams SKILL, rule 2: the kit switches from Anton to Hanken at 24 characters).
- **Section headers** are pink Anton with a crayon line drawn the full width under them, on every page (DECISIONS 2026-11-16).
- **Big type moments**: once per long post, one of Joe's own lines alone between two sections in big white Fraunces italic; a quote gets one huge pink Fraunces quote mark in the left margin (DECISIONS 2026-11-19, 4A and 9A).
- **Words never boil.** Text, logos and icons hold still while the marks around them wobble (diagrams SKILL, rule 13; `motion.css`). In animations, words hold still once they land (visuals.md).
- **Phone text** is 13 px or more at 360 px wide (`draw.mjs` enforces it; visuals.md). See the open question below about 14 px.
- **No captions that explain a slogan.** Lines stand alone (DECISIONS 2026-11-15, "No explainer subtext"). No big numbers with a caption under them: "It feels very AI slop" (DECISIONS 2026-11-15).
- **Video**: titles in Anton, captions in Hanken Grotesk ExtraBold, paper white on black with pink for the highlighted word (Pink Scribble profile). On a peak beat one big word in the emphasis color sits behind Joe's cutout at the top of the frame, at most one per sentence, never two in a row (video decisions 2026-11-18). Title cards are small and low and never cover Joe's face (video decisions 2026-11-06).

## 5. Motion

- **Draw in, hold, erase.** A scribble draws itself along its path, holds, then erases, on a slow loop (7 s by default); a `once` mark draws in and stays. Multi-stroke marks draw like one pen, each stroke starting as the last ends (`motion.css`, "Scribbles" and "Multi-stroke marks").
- **Boil.** Marks are never perfectly still: one filter steps its noise seed through three values, about 6 times a second (3 seeds over 0.5 s) for scribbles, hover rings and diagram arrows; hovered links warble faster and finer (3 seeds over 0.36 s) (`BaseLayout.astro`, `#boil` and `#warble`). It's one animated filter, never CSS swapping between filters, which froze on iPhone Safari (`motion.css`). Doodles on thumbnails get a thicker, faster ink boil (DECISIONS 2026-11-19).
- **What boils**: arrows, callouts and paper edges. **What never boils**: words, logos, icons (diagrams SKILL, rule 13).
- **Stepped animation.** Animated figures are SMIL stepped at 12 fps with `calcMode="discrete"` and loop on an empty first frame (diagrams SKILL, "Animated figures"). Collage scenes animate on twos with per-pose jitter and a snap with about 8% overshoot, one piece at a time 0.35-0.6 s apart, label last, then at least 1.2 s of the finished frame (explainers SKILL, gate 3; `scripts/collage/collage.cjs`).
- **Small, silent, looping, no controls**: a few seconds up to about 20, two to four things moving at once, never a video with a play bar in a post (visuals.md; DECISIONS 2026-11-10 in the diagrams SKILL).
- **Animate a change, never a picture.** An animation is punctuation for the post's sharpest moment (visuals.md; explainers SKILL, gate 1).
- **Charts build in** as they scroll into view, with no overshoot past a data value (DECISIONS 2026-11-14). Animated figures wait at their empty first frame until mostly on screen (DECISIONS 2026-11-13).
- **Hover is the sticker peel**: buttons and pills peel up at a slight tilt and squash when pressed; cards draw a crayon box and their title turns pink (`motion.css`, "Buttons and nav pills act like stickers"; DECISIONS 2026-11-15).
- **Reduced motion and the pause button** show the finished frame: a still layer swaps in for the live one, and the boil stops (`motion.css`, `.anim-live` / `.anim-still`).
- **Video graphics stay alive** (drift, jitter, shimmer), while footage stays subtle (video decisions 2026-11-04). Squiggles in video are pink crayons that boil and draw in, like on the site (video decisions 2026-11-05, 2026-11-11).

## 6. Framing

- **Site**: pictures and clips sit at the text-column width on every article page (DECISIONS 2026-11-15). The masthead header: a kicker between a thick pink rule and a thin one, the title fitted to the column, then the picture with no tilt or tape (DECISIONS 2026-11-15). Crayon marks may run past the screen edge (`overflow-x: clip`, DECISIONS 2026-11-22).
- **Diagrams**: 640 wide on desktop, 360 on phones, and the phone one is its own layout, not a shrunk desktop (diagrams SKILL, rule 11 and kit reference). Joe's JK mark sits at 40% opacity in the clearest corner inside the frame (DECISIONS 2026-11-24).
- **Video**: show the screen, not his face, while Joe demos an app; the cutout never cuts off his shoulders; zoom goes to where the cursor is now; Punch In is one push through the cut (video decisions 2026-11-02, 2026-11-18). Vertical videos keep text and faces inside the TikTok and Instagram safe zones (video decisions 2026-11-04).

## 7. Sound (video only)

- **A sound lands on something that visibly appears**: a card, a sticker, a title, an animation beat. No whooshes on cuts or punch-ins (Joe, 2026-11-02: a whoosh on a punch-in "doesn't feel connected to anything").
- **Writing sounds fit this look**: a pencil scribble for chapter cards, a sticky-note peel for animation stickers, a page turn for a cold-open jump back, a keyboard burst for typing (picked 2026-11-05 on the Kindle video).
- **Fewer pop-ups, and varied**, so effects don't get samey (video decisions 2026-11-02, 2026-11-04). Real YouTuber and meme sounds are fine (video decisions 2026-11-04). Memes sit slightly rotated, pop in with a pop, then shrink away (video decisions 2026-11-10).
- **Music** dips in the voice's bands while Joe talks, with a lighter -10 dB duck (video decisions 2026-11-18).

## 8. Signature moves

- **The crayon line under a header**, drawn the full width (DECISIONS 2026-11-16).
- **A pink crayon arrow from a note to exactly what it explains**, only when it says something the boxes don't (diagrams SKILL, rule 7).
- **The off-register JK**: pink Anton caps with a wobbly outline knocked up and left, boiling through three frames (`brand/README.md`).
- **Pink pictures**: any photo or clip made black and pink (§2).
- **The copy stamp**: copy buttons are a pink ink stamp (DECISIONS 2026-11-19, 7B); a copy also draws a loose 12-ray starburst once (DECISIONS 2026-11-13).
- **Margin doodles** that grow from small icons into line figures, in three clearly different sizes, and the homepage's one long crayon line drawn as you scroll (DECISIONS 2026-11-19, 2026-11-24, 2026-11-16).
- **Stick figures and drawings**, bigger than redrawing the post's diagrams (DECISIONS 2026-11-10; see open question 5).
- **The cut-paper envelope** that seals with the crayon asterisk after subscribing (DECISIONS 2026-11-13).

## 9. Pitfalls (what Joe has turned down)

- Crayon circles around content: "they always cut stuff off and aren't centered right." Arrows and underlines are fine (DECISIONS 2026-11-16). No crayon box around posters on hover (DECISIONS 2026-11-13).
- The cloud scribble (overlapping loops): "I do not like this scribble" (DECISIONS 2026-11-24).
- Margin doodles that all look the same size: "they all look kind of samey" (DECISIONS 2026-11-24).
- Halftone dots and heavy dithering on pictures (DECISIONS 2026-11-15, overriding 2026-11-05 and 2026-11-10).
- Wavy or warping effects on hero videos, datamosh, pixel-sort, shader warps (DECISIONS 2026-11-05, 2026-11-24).
- Beveled or notched nav pills and buttons: "YUCK" (DECISIONS 2026-11-14).
- A paste-down animation on just one photo per page (DECISIONS 2026-11-15).
- Stat numbers with a caption under them, and exact visitor numbers anywhere public (DECISIONS 2026-11-15).
- The same picture twice within a screen: "Everything needs to FIGHT for why it's included" (DECISIONS 2026-11-24).
- A diagram played step by step, crayon stick figures as a collage substitute, and a slick GSAP piece with serif headlines and glass cards, all rejected before the collage look was picked (explainers SKILL, 2026-11-10).
- An MP4 with a play bar for a post animation (diagrams SKILL, 2026-11-10).
- Video: blue corner bars or corner shapes in any profile; a grade that's too green or too warm; heavy scan lines (video decisions 2026-11-04).

## 10. Engine

| What                                                | Where                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Colors and fonts                                    | `src/styles/global.css` (`@theme`), `astro.config.mjs` (font loading)                                              |
| Crayon, boil and warble filters                     | `src/layouts/BaseLayout.astro` (the hidden `data-motion-filters` SVG)                                              |
| Draw-in, boil targets, reduced motion, sticker peel | `src/styles/motion.css`                                                                                            |
| Scribble marks and their paths                      | `src/components/Scribble.astro`, `src/data/scribbles.ts`                                                           |
| Hover boxes and rings                               | `src/components/HoverBox.astro`, `BOXES` / `RINGS` in `src/data/scribbles.ts`                                      |
| Margin doodles and the scroll line                  | `src/components/MarginDoodles.astro`, `src/scripts/margin-doodles.ts`                                              |
| Pausing motion                                      | `src/scripts/pause-motion.ts`, `pause-offscreen-scribbles.ts`, `filter-animations.ts`                              |
| Pink pictures                                       | `global.css` ("Pink pictures"), `src/integrations/halftone-levels.mjs` (the name predates the no-halftone verdict) |
| Diagrams and animated figures                       | `scripts/diagrams/draw.mjs`, `scripts/diagrams/render.mjs`, `.claude/skills/diagrams/SKILL.md`                     |
| Collage explainers                                  | `scripts/collage/` (`collage.cjs`, `cutout.mjs`, `svg.mjs`, `render.mjs`), `.claude/skills/explainers/SKILL.md`    |
| Logo                                                | `brand/` (`brand/README.md`)                                                                                       |
| Video look                                          | the Pink Scribble profile and the `zine` animation theme in Joe's private Screencast Director pack                 |

## 11. Room to vary

Fixed: black, paper, one pink, Anton for names, marks that boil and words that don't. Free:

- **Field color** for a collage scene: pink, black, chalk, or one bold color that means something (explainers SKILL, gate 1).
- **Which marks**: any doodle Joe has kept (thought bubble, spark, hearts, waving hand, sleeping cat, rubber duck, paper plane; DECISIONS 2026-11-19), or a new one shown to him first.
- **How playful**: section header videos may go "fun and playful, blobby, maybe sketchy", like Slicer Studio's cells, keeping the pink grade (DECISIONS 2026-11-24).
- **Figure or scene**: an animated cut-paper figure for how something works, a collage scene for a punch (diagrams SKILL, explainers SKILL).

## Open questions for Joe

1. **Phone text in diagrams: 13 or 14 px?** The diagrams skill's rule 11 says "keep text at 14px or more", while `draw.mjs`, the skill's last section and `.claude/blog-core/visuals.md` say 13 px.
2. **Halftone in videos?** The site has no halftone anywhere (DECISIONS 2026-11-15, 2026-11-24), but the Pink Scribble video profile's camera room is set to `halftone`. Is halftone fine in videos, or should the video match the site?
3. **Crayon rings in videos?** The site dropped crayon circles around content (DECISIONS 2026-11-16), but the video `zine` theme still draws crayon rings (`.ringmark`) in animations. Keep them in video or drop them?
4. **Is "zine" still the right name?** Joe asked for "less zine-inspired... more like graphic magazine" (DECISIONS 2026-11-15), but the video animation theme is still called `zine`, and older notes call this the zine look.
5. **Crayon stick figures: in or out?** DECISIONS 2026-11-10 says animations should think bigger, with "stick figures, drawings, the scribbly pink crayon style", but the explainers skill says the collage look was picked on 2026-11-10 after Joe rejected crayon stick figures. Were stick figures out only as a collage scene, or out everywhere?
