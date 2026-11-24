# Visuals

Core file (`.claude/blog-core.md`). Which visuals a post gets, when Joe sees them, and what makes each one good. How a site renders them (its diagram tool, its file formats, its column width) is in that site's section or adaptation.

## Visuals travel with the text

Visuals are planned with the outline, built while the draft is written, and shown rendered next to the draft, so Joe judges the words and the pictures together. Never hold them until after the text is approved: on 2026-11-18 a post reached its reviewed draft with no mockups, and Joe asked "aren't you supposed to mock up visuals? Why didn't you?"

**At the outline gate:**

1. **Mark every visual spot in the outline**, numbered: the section, what the text claims there, the kind (screenshot, clip, diagram, animation, chart, table, command output, interactive embed) and where it comes from (Joe's capture, a data file, a source URL with its license, or "to make"). For an animation, the change it shows. Aim for a visual or other break at least every three or four paragraphs, and one idea per figure.
2. **Build the visual plan page** at `~/mockups/<slug>-visuals/index.html` (`~/.claude/knowledge/mockups.md`): one numbered card per spot, each with a rough sketch in inline HTML or SVG. A diagram gets a wireframe of its boxes, arrows and labels; a chart gets its form, axes, series and data source, marked "sketch" until the real numbers are in; a screenshot or clip gets its shot-list row (section, what the text claims, what it shows). Where there's a real choice (a bar chart or a table, one diagram or a before/after pair), show options A and B side by side and mark the one you recommend.
3. **`open` the page** next to the outline, look at it yourself first, then ask for approval of both together. If no section needs a visual, the page says so.

**While writing:** start the approved visuals in the same turn as the draft. Replace each sketch on the page with the rendered piece at the text column's width plus a 360 px phone preview, with its alt text and the first words of the paragraph it sits under. Anything that can't be made yet (a capture Joe has to take) stays on the page as a labeled placeholder and is listed at the draft gate.

**At the draft gate:** open the draft and the updated page together. Add the supporting materials pitch (below) as new numbered cards. Check the page yourself first: overlapping or cut-off text, labels unreadable at 360 px. Each revision round updates the same page: drop what Joe rejected, keep his picks, add new versions, and `open` it again. Nothing ships with an unapproved or missing visual.

## Supporting materials

Once the draft exists, pitch supporting materials tied to paragraphs. For each: the paragraph (its first words), what it is, why it proves or sharpens that paragraph's point, and where it comes from (the author's files, a source URL with its license, or "to make"). The menu: a screenshot of the real UI, a short clip of the thing working, a diagram, a chart from real numbers, the command's output, a live embed or small calculator the reader can try, a figure from a primary source (license checked, credited in the caption), an archived snapshot when a paragraph is about what a page used to say (the Wayback Machine copy from that date, with the date in the caption), a before/after pair. Never generic stock, logos as decoration, or a picture per product mentioned. Joe picks by number; add only his picks.

**Every visual fights for its place (Joe, 2026-11-24).** For each one, name the single thing it shows that the text, chart, clip or picture within a screen of it doesn't. If there's nothing, cut it. No still beside a clip whose thumbnail is the same shot, no script page beside a chart quoting the same lines, no portrait beside a clip of the same person. Screenshot the built page and read the media in sequence before showing Joe. Joe, on a Jaws frame sitting right above the Jaws clip: "Everything needs to FIGHT for why it's included. Having nearly the same thumbnail twice in a row does not work."

**Posts about films, books or other works:** the supporting material Joe wants is evidence for the point being made. That means a frame of the scene the paragraph discusses, behind-the-scenes material from the production, links to the primary documents (the screenplay, the draft, an archive's copy), and sourced anecdotes from the work's history that back up the argument. Trailers don't qualify: they show the work, not the point (Joe: "Adding trailers, I don't think, is particularly interesting"). A still of a famous or improvised line gets that line burned in as a subtitle, using the film's own subtitle wording (white, black outline, bottom center, the same rule as review frames).

**Every chart labels both axes, with units** ("Script kept word for word (%)", "IMDb rating (out of 10)"), and a chart with dots readers will want to identify gets hover cards (`data-tips`, `src/scripts/chart-tips.ts`).

## Screenshots and clips

- **Show the product's own UI in use**, under the paragraph whose claim it demonstrates: menus opening, the config screen the step talks about, the agent's answer, the finished result. No title screens, idle start pages, old tour videos, or clips stacked at the end of a section. Skip table-stakes features.
- **Shot list before recording**: section, what the text claims, what the screenshot or clip shows. Get it approved, then record. Change the text to match what was recorded, not the other way around.
- **Clean capture**: demo data or a scratch, de-branded copy, only the app's window or the panel that matters, no personal tabs, tokens, emails or internal hostnames. Trim a clip so its first frame already shows the feature.
- **Readable at the column width.** Crop to the panel that matters so UI text lands near its real size; a full desktop screen shrunk into the column is unreadable. Then check it at 360 px wide: if the key text reads as a postage stamp, crop tighter or split it into two images.
- Animated captures ship as video, never GIF: a 549 KB MP4 became an 11 MB GIF at the same size and frame rate.

## Animations: punctuation, not decoration

- **An animation goes where the post lands a punch**: the reveal, the turn, the number that matters, the before/after. Never on a routine point that reads fine as text. Rank the post's sharpest lines and pitch only the top two or three.
- **Animate a change, never a picture.** Something becomes something else on screen: a tangle of point-to-point integrations collapsing into one hub, a request going out and the answer coming back. If nothing changes state, it's a still.
- **Pitch it as the change the viewer watches**: the claim in one sentence, three to six pieces, and the build order (structure first, then the key piece, then what connects them, then the action and the result, the label last).
- **Small, silent, looping, no controls**, no wider than the text column, a loop of a few seconds up to about 20. Two to four things move at once at most, and words hold still once they land. One accent color, on the one thing that matters.
- **The still holds the point on its own**, because reduced-motion readers, print and poster frames only get the still. Check the build as well as the end frame: the first frame, each landing and the last frame.
- **The picture and the prose each stand alone.** The text never says "as you can see"; it says why the thing works the way the animation shows.

## Diagrams

- **Draw it instead of describing it.** A paragraph explaining how three or more pieces connect is a diagram; cut the paragraph down to the why.
- **Never an ASCII diagram in a code block.** File trees, prompts and pseudocode stay as text, because readers copy them.
- **One idea per figure.** A figure that holds two ideas (before and after, build and run) becomes two figures. Group the parts that belong together so the eye reads the structure first.
- **Check every fact in a figure against the post** (names, numbers, tool names), and name each part the same way in every figure and in the prose.
- **Arrows show the real direction of data.** A request that gets an answer back (an MCP tool call, a query) is two-headed. Label what travels over a link when it isn't obvious.
- **Callouts and color keys only when they add something** the boxes don't already say. No subtitle restating the lead-in and no caption that repeats a label.
- **Phone text stays at 13 px or larger** when the figure is viewed 360 px wide.

## Charts

A chart goes where a paragraph's point rests on numbers the reader should compare: a benchmark, latency or token counts across setups, a count across sources, a before and after.

- **Pick the form.** Compare categories: a bar chart, sorted by value unless the categories have a natural order. Change over time: a line chart. Part of a whole: a stacked bar, no pie or donut. Two or three numbers: no chart, say them in a sentence. Readers need exact values: a Markdown table, never an image of a table.
- **Make it with the `dataviz` skill** on the site's palette, as a standalone SVG (a `viewBox`, `<title>` and `<desc>`, everything inline, no script), designed for the text column with text at 13 px or more when viewed 360 px wide.
- **Print every value** and label series directly instead of using a legend. Bars start at zero. Put the unit and the time period in the title or axis. Credit the source and date under the chart ("Source: <who>, as of YYYY-MM-DD"), and give the base count behind any percentage. The alt text states the finding, not the chart type.
- **Look at it** at full size and at 360 px wide: no overlapping labels, every value readable.
- **Every value traces to a source**: the post's own test (said once as measured), or a primary source linked in the prose. A third-party chart too dense to read exact values from stays the source's image, credited and license-checked, instead of being redrawn with invented precision.
- **Interactive only when the reader finds their own case in it** (pick your data source and see its numbers); then it's an interactive embed (below) with every value already in the markup, pitched as option B next to the static chart.
- **Review:** any post with a chart or stats gets `data-claims-reviewer` (global agent) before the draft gate.

## Interactive embeds

- **When one earns its place**: the reader can run the thing (a live demo, a query playground), or the post's argument rests on a calculation the reader would redo with their own numbers (token spend, hours saved, power cost). It goes right after the intro when it's the demo.
- **Mock it up first** as a working local HTML page on the visual plan page; build it into the post only after Joe approves it.
- **Readable without JavaScript.** It opens on the post's example values, already printed in the markup, so a reader with scripts blocked, an answer engine and any print or document export all see the point. Native form inputs; build DOM nodes with `textContent`, never HTML strings.
- **Check it at the column width and at 360 px**: nothing overflows, tap targets stay usable, text stays at 13 px or more.
- **A heavy embedded app** (a game, a full web app in an `iframe`) gets `loading="lazy"` and a `sandbox` attribute with only the permissions it needs and never `allow-top-navigation`, so a taken-over embed can't send readers elsewhere. Hiding it with CSS still loads it: on joekarlsson.com a hidden embed crashed an iPhone, so a phone gets no embed rather than a hidden one.

## Personal site only

- **Diagrams and animated figures** come from the project `diagrams` skill (cut-paper SVGs with real logos, a phone layout and the boil); **collage scenes** from the `explainers` skill (`/blog-new` Phase 2c). Post animations are inline animated SVGs, never MP4 (Joe doesn't want a play bar, 2026-11-10); clips of the app in use are MP4, stills WebP. Preview each figure with Joe before it goes in.
- **Charts** are drawn with the `diagrams` skill's `f.barChart` and `f.lineChart` in the site style.
- **Memes, public-domain pictures, margins and the 10-item supporting materials pitch**: `/blog-new` Phase 3, **Photos and Visual Content**.
- **Embeds**: a new iframe origin needs CSP `frame-src` (`.claude/rules/embeds.md`); embeds load only at the md breakpoint and up (`data-desktop-src`). A builder or calculator also needs the script CSP and Trusted Types wiring (`src/integrations/script-csp.mjs`), then design and web-standards review.
