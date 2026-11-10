---
name: diagrams
description: Draw or redraw a joekarlsson.com post diagram (architecture map, flowchart, layer stack, request flow) in the site's cut-paper style as inline SVG, with desktop and phone layouts, real logos and the lightbox. Use when a post needs a diagram, when Joe asks to redraw or restyle a post's diagrams, or when converting an old diagram image (PNG/WebP/CData-style boxes) to the site style.
---

# Post diagrams

Diagrams are drawn in code, never exported from a design tool. Each figure is a
small JS file that draws a desktop and a phone layout with the kit in
`scripts/diagrams/draw.mjs`. `npm run diagrams -- <slug>` turns them into SVGs, and
`src/plugins/rehype-inline-diagrams.mjs` inlines them into the post, switching to
the phone layout under 640px. Clicking a diagram opens the lightbox.

## Workflow

1. **Read the post and the old figure.** Know what each figure is there to say.
   Check every fact in it (numbers, names, timings, tool names) against the post
   and the project's code, and fix the figure, not the facts.
2. **Write one file per figure** in `scripts/diagrams/<slug>/<name>.mjs`, exporting
   `alt`, `desktop` and `phone`. Copy the shape of `scripts/diagrams/doom-mcp-server/`.
   A figure that holds two ideas (before/after, build/run) becomes two files.
   Helpers shared by a post's figures go in a file starting with `_`, which the
   render skips.
3. **Preview before touching the post.** Joe reviews mockups before anything is
   built or changed:
   `npm run diagrams -- <slug> --preview <scratchpad>/<slug>.html`, publish it as an
   artifact, and open it in Firefox (`open -a Firefox <url>`). Iterate until he picks.
4. **Render**: `npm run diagrams -- <slug>`. It fails on any text that overflows its
   box or the canvas, and on any arrow or callout that runs over text, runs
   through a box or ends buried inside one, naming the part. Fix layout, never the
   check.
5. **Swap the post's images** for `![alt](/images/blog/<slug>/<name>.svg)`, one per
   figure, alt text written for the post. Delete the old image files in the same
   change once nothing else references them.
6. **Check the built page**: `rm -rf node_modules/.astro` (the plugin reads public/
   from disk, which Astro's cache doesn't track), `npx astro build`, serve `dist/`
   on a free port, and look at the figure at 1280px, at 390px and in the lightbox.

## Style rules

These came out of Joe's review of the Doom MCP post (2026-11-06). Follow them
unless he says otherwise for a specific figure.

1. **Cut paper.** Every part is a torn paper scrap with a slight tilt: pink for the
   post's own system, chalk for what it talks to, black with a chalk edge for
   people, prompts and plain steps, dashed for "sometimes". No tape.
2. **Names in Anton caps, phrases in Hanken.** The kit switches automatically at 24
   characters. Code (tool names, file names, commands) is monospace.
3. **Logos and icons, lots of them, transparent.** A part that names a product
   gets that product's logo: Claude for Claude and Claude Code, the Connect AI
   wordmark, the CData mark, AWS, Salesforce, BigQuery, and so on
   (`scripts/diagrams/logos/`, sources and variants in its README). Everything
   else gets a Lucide icon (`scripts/diagrams/icons/`): `bot` for every AI agent,
   `user` for people, `clock` for schedules, `bell` for alerts, `database` for a
   database without a usable logo, and so on for tools and steps. Pass `logo:` or
   `icon:` to a box; in a box too small for a mark beside the label, pass
   `stack: true` to put it on top. The kit colours each one for its surface.
   Go get any logo that's missing before using an icon in its place: Simple Icons
   first, then the company's own site (the header SVG, `/brand`, `/press`, a media
   kit), then selfh.st icons and Dashboard Icons, then the repo's own copies
   (`public/images/logos/`, the CData brand kit). Record the source in the logos
   README. A new logo can describe itself with a `<name>.json` sidecar
   (`{"color": "#hex"}`, or `{}` for full colour) instead of an entry in `LOGOS`. A product's container can show its wordmark on the tab
   (`f.group({ ..., logo: 'tinybird' })`).
4. **Every connection gets an arrow**, including one-to-many (fan the arrows out
   from one point to each target). One exception: when each line stands for a
   thing rather than a flow ("every line is a custom integration"), draw plain
   lines with `heads: 'none'` and say what a line means in a callout. On a phone,
   many sources can sit in one container with a single arrow out of it.
5. **Arrows show the real direction of data.** A request that gets an answer back
   (an MCP call, a query, a function call) is two-headed. Label what goes over a
   link when it isn't obvious, and label the answer too when it matters ("back:
   arrived, or why not").
6. **Flow arrows are chalk. Pink crayon is only for callouts**, so a callout never
   looks like a flow line.
7. **Crayon callouts only when they add something** the boxes don't say: what
   travels over a link and how often, a refusal, a surprise. Every callout is a
   note plus a crayon arrow pointing at exactly what it explains. No decorative
   rings, underlines or scribbles. Route the crayon arrow so it crosses no text or box;
   the render check can't see that, so look at the preview. Draw callouts last,
   so nothing covers them.
8. **Containers group parts that belong together** ("The game", "Live data", "In
   each room"): a darker sheet with a name tab, drawn before its contents.
9. **A colour key only when colour encodes two or more things the labels don't
   already say.** A one-item key is noise; logos and names usually make keys
   unnecessary.
10. **Name each part the same way in every figure of a post.** If one figure says
    "Doom MCP server" and another says "play.py", show both names where it appears.
11. **Phone layouts are their own layout**, not a shrunk desktop: stack vertically
    in a 360-wide canvas, keep text at 14px or more, route loops along the left
    edge. Collapse side branches into a sub-line on the box when a branch would
    need its own column (`go_to(next room)` / `blocked? attack(closest_pids)`).
12. **Arrows sit on top.** The kit draws containers, then boxes, then arrows,
    then callouts, so an arrowhead is never hidden under a tilted box. End each
    arrow at the box edge, clear of the box's label.
13. **It boils, but the words don't.** On the site, arrows, callouts and paper
    edges wobble through the same boil as the other scribbles (`motion.css`);
    text, logos and icons hold still. Reduced motion and the pause button stop it.
    Opened in the lightbox, the diagram grows out of the post and its `.d-flow`
    arrows redraw 30ms apart (ImageLightbox.astro), so keep every arrow and its
    head in a `d-flow` group, and draw dashed lines with `stroke-dasharray`.
14. **Say it once.** No subtitles restating the post's lead-in, no captions that
    repeat a label. A figure heading inside the SVG only when the post shows two
    related figures in a row.

## Kit reference

`createFigure` is called by render.mjs; figure files only use the methods on `f`:

- `f.box({ x, y, w, h, kind, label, sub, font, size, logo, icon, stack, wordmark })`: kinds
  `pink`, `chalk`, `outline`, `dashed`, `ink` (a chip inside another box).
- `f.arrow(points, { heads: 'end' | 'both' | 'none', dashed })`: right-angle
  polylines of `[x, y]` points.
- `f.group({ x, y, w, h, label })`, `f.pill(...)` (start/end), `f.diamond(...)` (a
  decision), `f.note(x, y, text)` (gray label beside a line), `f.heading(...)`.
- `f.logo(name, x, cy, height, surface)` draws a logo or icon and returns its
  width; `f.logoWidth(name, h)`.
- `f.crayonArrow(from, to, bend)`: the pink callout arrow.
- `f.legend(items)`: `['pink', 'label']` or `['logo:cdata', 'label']`.
- `f.raw(markup)`: SVG markup on top of everything, for an animated figure's moving
  pieces (`doom-mcp-server/go-to-walk.mjs`: SMIL stepped at 12 fps, with the
  `.anim-live` / `.anim-still` layers `motion.css` swaps under reduced motion and pause).
- `f.code({ x, y, w, lines, highlight })`: a code block, highlighted lines pink;
  returns its height.
- `f.table({ x, y, title, columns, rows, colW, highlight })`: a small table,
  the highlighted column pink; returns its height.

Desktop canvases are 640 wide (1:1 with the post column), phone canvases 360.

## Doing the whole site

Check both `src/content/blog` and `src/content/newsletter` (skip the TL;DR in Tech
back issues: their figures belong to the articles they linked). Never trust an
alt-text or filename search alone; it missed diagrams twice. Build a contact sheet
of every candidate image and look at it, and list every unlabelled or `text` code
block and read it. Four kinds of old figure get redrawn:

1. **Diagrams as images.** Screenshots, photos, memes, GIF animations and hero
   images (`heroImage`, which also serve as cards and social previews) stay.
2. **ASCII diagrams** in code blocks: box-drawing characters, `+---+` boxes,
   arrows between lines, and also column layouts and dot-leader legends
   (`RED ....... garage open`). Replace the whole fenced block with the figure.
   File trees, prompts and pseudocode stay as text, because readers copy them.
3. **Charts as images** (bar, line, donut, scatter): redraw with `f.barChart` /
   `f.lineChart`, using numbers from the post text or legible in the image, and
   print every value on the chart. Credit third-party data in a note
   ("Source: Artificial Analysis"). A chart too dense to read exact values from
   (a daily traffic line, a scatter of 50 models) stays as the image: redrawing it
   would invent precision. Screenshots of real tools (Ahrefs, Tinybird, a chat)
   are evidence and stay.
4. **Data tables as images** become Markdown tables in the post, not figures:
   Google and screen readers read the numbers, and readers can copy them.

Phone text is 13px or larger (the render enforces it). Newsletter figures render to
`public/images/newsletter/<slug>/`.

Redraw one post at a time through the workflow above, finishing every diagram in
a post in the same batch so no post mixes old and new.
