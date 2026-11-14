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

## Reviews

- 2026-11-13: Review spoilers are hidden phrase by phrase, never a whole review or block, and show on hover (tap on phones), like Reddit. Of a gray bar, a blur and a pink crayon scribble, Joe picked the blur. A review that has spoilers gets a spoiler warning up top.
- 2026-11-13: Hovering a spoiler shows just that one; clicking or tapping any spoiler reveals every spoiler in the review. The spoiler warning is "Contains spoilers" in the meta line only: no explainer note telling readers how to reveal them (Joe: "way too verbose", AI slop).
- 2026-11-13: The /reviews/stats/ page combines the dashboard and poster mockups: the dashboard's top numbers bar, then its Ratings and By month charts, then the poster-built stats (every review as a poster tile by rating, decades, directors, five stars).
- 2026-11-13: Posters on the stats page enlarge on hover and show the film's one-line review (the description); clicking one opens the full review.
- 2026-11-13: The decades row runs newest on the left back to oldest on the right.
- 2026-11-13: Stats page motion, all from the site's kit: crayon notes that draw once on the charts, cut-paper bar edges that boil on hover, a dock-style magnifier on the rating wall, Ratings bars that light their wall row, a popcorn-eating stick figure on a bar, KPI numbers that slot-roll on hover, posters that peel like stickers with a pink crayon star on five-star films.
- 2026-11-13: No crayon box drawn around posters on hover: "Those don't work" (it only drew a loop across the top of the poster).

## Consistency

- 2026-11-13: /reviews (Joe's film reviews): the list is a poster wall, and each review page looks exactly like a blog post page. Every page keeps the site's own header; a mockup that left it out read as "a header different than any of my other pages". Reviews stays out of the nav ("no one really cares"): it's linked from the About page and the footer, and the About page's recent movies link to their reviews. A review ends with links to more of Joe's reviews.
- 2026-11-13: Media in a review is a frame that supports the argument: the specific moment the paragraph is making a point about, grabbed from the film itself. Never generic posters or backdrops, and not a picture for every film the review mentions ("You're just grabbing like generic posters... This is like a frame that supports my argument").
- 2026-11-13: Frames in a review stay in natural color, an exception to the pink grading rule: the color is often the point (the Odyssey review's "sandy skin" Cyclops). Picked B, natural, over A, pink graded.
- 2026-11-13: When the line spoken in a review frame is the point, the subtitle is burned into the frame (white, black outline, bottom center, the film's own subtitle wording), and the caption under it doesn't repeat the quote. Review media never gets pink, black or dithering: it looks like a picture in a blog post.

- 2026-11-05: Consistency across the site comes first. Same column width for a post's text, the footer and the about/keep-reading blocks. Same hero treatment and video formatting on every page. The 404 page matches the rest (2026-11-10).
- 2026-11-10: The bottom of each page shows a next step that fits that page (a featured item worth pushing there), not one list everywhere. The contact page links to no posts.

## Images of Joe

- 2026-11-09: Video thumbnails pulled from Joe's footage: face centered and whole (both eyes, top of head), Joe looking good. Smiling or explaining mid-sentence is fine there. Pick frames for that, not for "clarity". Profile photos and headshots are different: no smiling-at-camera shots (memory feedback-headshots-no-smiling-camera-shots).
- Personal bios say what Joe makes and writes about. No employer or job title.

## Animation

- 2026-11-13: A post's animated figures stay at their empty first frame until they're mostly on screen, so the reader sees each one build from nothing. That's intended, not a blank-figure bug (a motion review flagged it).
- 2026-11-13: Subscribing plays a cut-paper envelope that seals with the crayon asterisk (picked over a rubber "SENT" stamp). It plays on listmonk's "check your inbox" page, not on the site's form, so it never holds up the hand-off and plays in full (Joe's call).

- 2026-11-10: Animations should think bigger than redrawing the post's diagrams: stick figures, drawings, the scribbly pink crayon style.
- 2026-11-13: Motion round 2 (motion.dev), all option A: the lightbox swipes down to close and pinches or double-taps to zoom (up to 4x, pan, rubber-band edges; a tap waits ~250ms for a double-tap); a blog thumbnail grows into the post's paper header across the page load (picture only, not the title); a post header's tape and topic scrap drag a short way and spring back with a small overshoot (not left where dropped); the picked drawing-board crayon rises and a mouse over the board draws with a dot in that color that pulses on a switch.
- 2026-11-13: Borrowed-motion round (ideas from motion.dev and bklit.com), all option A: hovering a day on a Now-feed commit strip fades the other days and the caption shows that day's count (no crayon ring per cell, too busy); a code block's Copy draws the loose 12-ray starburst around "Copied!" once, then fades (not the spiky star, which covers the code); Newest/Popular re-sort brings the rows in 30ms apart. Search results stay instant.

## Process

- 2026-11-10: Mockups and explainers for review are HTML pages, opened for Joe, not Markdown.
- 2026-11-06: During mockup and iteration rounds, don't deploy after every note. Deploy at the end of a phase; use judgment.
