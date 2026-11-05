# Site redesign plan (November 2026)

The new look: a dark, art house, slightly weird personal site. It is hot pink on black, with dithered video of Joe, poster headlines, crayon scribbles in the spirit of Cy Twombly, and a calm serif for reading. The rollout reskins and reuses the existing Astro site rather than rewriting it. Each phase ships on its own: code cleanup and tests go in with the work, and every phase deploys.

## Status (2026-11-05)

Phases 0–4 are shipped and live on joekarlsson.com. **Phase 5 (other pages) is next.** Every phase below is marked with its status, and the decisions log at the end records every call made along the way, so read it before changing something that looks odd.

### Handoff: how to work on this

- **Run the dev server** (`npm run dev`, http://localhost:4321) and check every change in a browser at 375px and 1440px. Joe reviews there and sends notes mid-phase.
- **Deploy once per phase, not per note.** Batch Joe's small notes as local commits and ship when the phase wraps (or when he asks): push (the pre-push hook runs the full `npm test`), `npm run deploy`, curl the live page for a changed sentence, then push the `chore: Refresh now-feed snapshot` commit the deploy makes.
- **Commit messages** must be `feat: …`, `fix: …` or `chore: …` with the summary starting in a capital letter; a hook rejects anything else.
- **Design rules:** `~/.claude/knowledge/web-design-no-ai-slop.md` bans pills, ALL CAPS, dithering and so on, but this redesign is a named concept (poster type, halftone, crayon marks) that unlocks exactly those. A design-check hook flags them on every edit; for the concept's own patterns that's expected. Gradients, glows, glassmorphism and scroll-triggered animation stay banned.
- **Copy rules:** first person, no em dashes, no AI vocabulary (`STYLE_GUIDE.md`). Joe rewrites taglines himself; propose options, don't ship new copy unasked.
- **Checks to run before calling a phase done:**
  - `npm test` (format, lint, `astro check`, build, image and video budgets, unit tests).
  - `npx playwright test` (e2e, against the dev server).
  - `npm run test:a11y` (pa11y with axe on 21 pages). If it can't find Chrome: `npx puppeteer browsers install chrome@<version it names>`.
  - `npm run test:lighthouse` (budgets: performance ≥ 0.8, total weight ≤ 1.5MB). `/about/` already fails weight; see Phase 5.
- **Screenshots:** a throwaway Playwright script (`chromium.launch()`, `page.screenshot`) in the repo root works; pass `reducedMotion: 'reduce'` to see every mark fully drawn. Delete the script after.

### Toolkit built in Phases 0–4 (reuse these)

| Piece          | Where                                                     | What it does                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens         | `tailwind.config.mjs`                                     | `bg-ink`, `text-paper`, `text-muted`, `text-pink`; `font-display` (Anton), `font-serif` (Fraunces), `font-sans` (Hanken Grotesk). `coral` and `surface-*` are the old system.                                        |
| `Scribble`     | `src/components/Scribble.astro`                           | A crayon mark. `path` + `color`, or spread a mark: `<Scribble {...MARKS.burst} color={CHALK} class="…" />`. Multi-stroke marks draw one stroke at a time. `ring` draws only on `.index-row` hover.                   |
| Marks          | `src/data/scribbles.ts`                                   | `COIL`, `HERO_COIL`, `ARROW`, `RINGS`, `BOARD_MARKS`, and `MARKS.{hatch, tally, underline, cross, box, lines, check, oval, asterisk, rays, double, pointer, burst, burstDense}`; `CHALK` is the second crayon color. |
| `IndexRow`     | `src/components/IndexRow.astro`                           | One row of a huge Anton index list (label, meta, hover ring). Used for Projects and topics on the homepage.                                                                                                          |
| `DrawingBoard` | `src/components/DrawingBoard.astro`                       | The "Make a mark" board.                                                                                                                                                                                             |
| Motion CSS     | `src/styles/motion.css`                                   | `.redraw`, `.redraw-strokes`, `.hover-ring`, `.slot-window`/`.slot-reel`, `.echo`, `.ticker`/`.ticker-track`/`.ticker-reverse`, `.board-stroke`; all stop under reduced motion and pause with `.motion-paused`.      |
| Pause motion   | `src/scripts/pause-motion.ts`                             | Wires any `button[data-pause-motion]` (the nav has one).                                                                                                                                                             |
| Lazy video     | `src/scripts/in-view-play.ts`                             | `<video data-autoplay-in-view preload="none" poster>` plays only on screen, never under reduced motion or while paused.                                                                                              |
| Categories     | `src/utils/categories.ts`                                 | `getCategoryCounts(posts)`, `categorySlug(name)`.                                                                                                                                                                    |
| Halftones      | `src/utils/thumbnails.ts`, `npm run media:thumbnails`     | `halftoneThumbnail(hero)` → the pink `-halftone.webp` beside every post hero (1120px, dots over duotone). Run the script after adding a post; a test fails if one is missing.                                        |
| Media scripts  | `scripts/media/`                                          | `media:dither` (still), `media:dither:video`, `media:loop`, `media:thumbnails`, `media:flash-check` (WCAG 2.3.1). 4-color lossless WebP is the trick for small halftone stills.                                      |
| Budgets        | `scripts/validate-images.sh`, `tests/bundle-size.test.ts` | CSS ≤ 55KB (about 45KB used), JS, dist ≤ 215MB (about 207MB used), images ≤ 500KB, homepage loops ≤ 3MB each, other video ≤ 14.6MB, homepage first view ≤ 3.5MB and total ≤ 9MB.                                     |

## Where the design lives

- **Reference mock-up:** `~/Documents/dev/joe/joekarlsson-redesign/mockups/mock-r.html`, the final one. Open it in a browser. Mock-ups A–Q show the path there.
- **Type and font labs:** `type-lab.html`, `font-lab-2.html` and `font-lab-3.html` in the same folder.
- **Media and tools:** `~/Documents/dev/joe/joekarlsson-redesign/`
  - `mockups/img/`: every processed loop and photo.
  - `montage-clips/`: the final face-centered hero cuts.
  - `scripts/detect.swift`: macOS Vision face finder used for the hero crops.
  - `sources/`: where every clip came from (Screencast Director projects, the Downloads zip, Immich asset IDs).
- **Media scripts, in this repo's `scripts/media/`** (moved in Phase 0):
  - `npm run media:dither -- in.jpg out.webp`: pink dots or photocopy treatment for a still (`halftone.py`).
  - `npm run media:dither:video -- in.mov out.mp4 START DURATION`: dithers a video clip (`dither-video.sh`).
  - `npm run media:loop -- still.webp out.mp4`: makes a looping "living photocopy" from a still (`loop.sh`).

## Design spec

### Color

- **Base:** black (`#000`).
- **Accent:** one loud color, hot pink `#ff4fd8`.
- **Text:** paper white (`#ededed`) and gray (`#a3a3a3`) for metadata. No second accent, and no red or oxblood fields.

### Type

- **Headlines:** Anton in all caps. This is the poster concept, so all caps is intended.
- **Reading text:** Fraunces for post bodies and long text.
- **Interface:** Hanken Grotesk for nav, dates, buttons and forms.

### Photos and video

- **Treatment:** pink halftone dots on black, kept light and legible (cell size 3, contrast 1.15) for video. Post thumbnails and heroes use finer dots (cell 1.5) over a soft pink duotone so diagrams and screenshots stay readable, and white-background images are inverted first. The photocopy treatment is used sparingly.
- **Motion over stills:** moving loops instead of still photos where possible. Stills get the "living photocopy" loop.

### Hero

1. **Montage:** about 20 seconds of short clips of Joe, all moving and all with Joe in them. No stills, no clips of a screen alone, and no lifestyle-only filler beyond one or two shots. Joe's face is centered horizontally on the top third at a consistent size of about 30–40% of the frame height. Hard cuts, about 2 seconds per clip, 8 fps.
2. **Pink ticker:** decorative only. It is not a link and sits in front of screen readers' attention as `aria-hidden`.
3. **Panel:** the intro sentence, the short bio, and "JOE KARLSSON" sized to fill the panel width.
4. **Nav:** a sticky floating one-row bar with a black "Joe Karlsson" chip that links home (pink on the homepage), the current page in pink, and an icon pause-motion button. It sits below the homepage hero and at the top of every other page.

### Homepage order

1. Hero.
2. Recent posts: a dithered hero thumbnail on the left of each row, plus date, category and title.
3. "SHIP THE UGLY POT" band, using the slot-machine animation: "Ship the" stays put while the last words roll (ugly pot, bad idea, ugly demo, weird idea, homelab).
4. Projects: a huge text-only index list. Each row links to its project page and gets a pink ring drawn around it on hover.
5. "Make a mark" drawing board: pre-drawn scribbles plus pink and chalk crayons. Strokes fade on their own.
6. Writing by topic: a huge index list of categories with counts, each linking to its category page.
7. A row of two bigger clips (the cat on the litter box wiring, Joe pointing at PixelPane), then a collage of five tilted loops including the server rack.
8. Second ticker, running in the opposite direction.
9. Footer:
   - "WORKS ON MY MACHINE" with the stacked echo animation.
   - The newsletter form and fine print.
   - Footer links, ©, and social icons.

### Scribbles

- Static crayon texture.
- They draw themselves in once and redraw on a slow loop.
- They are never jittered, wobbled or nudged, and have no drips.
- They are not contained, but they never cross running text or links (that hurts reading and fails axe contrast). Marks spill past boxes, section edges and the screen edge, across the video, panels and nav, on every page, not just the homepage. Only the page clips sideways (`overflow-x: clip` on `html, body`); no section or card clips its marks.
- A mark with several strokes (tallies, rays, hatching, bursts) draws one stroke at a time, like a single pen, and erases in the same order.
- Kinds of marks, not only coils: hatching, tallies, long lines, underlines, an X, a loose box, a check, an oval around a word, emphasis rays, starbursts, a straight arrow.
- Joe's own scanned marks replace the generated ones later (Phase 6).

### Linking

- Every section heading links to its section page, and every row links to its target.
- Sections end with a "more" link, such as "All 178 posts →".

### Accessibility

1. A visible pause-motion control, plus `prefers-reduced-motion` support.
2. The drawing board only draws while pressed, so touch scrolling still works.
3. Landmarks: the nav's `<header>`, `<main>` and a footer. The homepage hero is a plain `<div>` above the nav (a second `<header>` would be a duplicate banner landmark).
4. The decorative drawing board is hidden from assistive tech and from keyboard focus (`aria-hidden`, swatches `tabindex="-1"`).
5. Animated phrases have real screen-reader text.

### Rejected, so don't bring these back

- Wiggle, jitter, line-boil, glitch or rough-edged type.
- Warp on hover over video.
- Drips.
- Oxblood fields.
- Crop art photos.
- Photos of strangers.
- An "Off the clock" section.
- The Now row.
- Project images.
- Subtitles on the hero.
- Still photos in the montage.
- The boat clip.
- The interactive terminal, which is dropped (see Phase 2).

## Principles for every phase

1. **Reskin before rewriting.** Keep the existing components, data and scripts, and change their markup and styles. Write new code only where nothing exists.
2. **Delete what each phase makes dead,** in the same commit: components, CSS, JS, tests and assets.
3. **Leave tests behind.**
   - Unit tests (vitest) for new logic.
   - Playwright updates for changed pages.
   - An axe check stays clean.
4. **Read real data.** Posts, categories, projects and the container count come from content collections, `src/data/projects.ts` and `now-feed.json`. Nothing on the page is hard-coded.
5. **Budgets hold.**
   - CSS budget (55 KB) and JS budget from `tests/bundle-size.test.ts`.
   - Image limits from `scripts/validate-images.sh`.
   - New video budgets, set in Phase 3.
6. **Ship per phase.** Commit, push, `npm run deploy`, then curl the live page for a changed sentence.

## Reuse map

| Existing                                                                                               | What happens                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BaseLayout.astro`, `BaseHead.astro`                                                                   | Reskin: new fonts, tokens, `<main>` landmark and pause-motion script. Remove the terminal hooks. **Delete** the Cmd+K command palette, the cursor-following ASCII cat and the Konami dashboard (Phase 1). |
| `Header.astro`                                                                                         | Reskin into the floating pill nav plus the pause button. The ticker lives in the homepage hero only.                                                                                                      |
| `Footer.astro`, `NewsletterCTA.astro`, `NewsletterSignup.astro`                                        | Reskin: the stacked-echo title, the existing form and Plausible events, links and socials. Drop "It goes out when I have something to say."                                                               |
| `getFeedPosts()` (`src/utils/posts.ts`)                                                                | Feeds Recent posts as is.                                                                                                                                                                                 |
| Category counts (inline in `blog/index.astro`, and again in `blog/category/[category].astro`)          | Done: `getCategoryCounts()` and `categorySlug()` in `src/utils/categories.ts` (kept out of `posts.ts` so vitest can import it without `astro:content`), unit-tested.                                      |
| `src/data/projects.ts`                                                                                 | Feeds the Projects index (title, year, stack, slug or blog URL).                                                                                                                                          |
| `ProjectCard.astro`, `BlogCard.astro`                                                                  | Reskin into index and post rows where layouts match. Delete either one once nothing uses it.                                                                                                              |
| `now-feed.json`                                                                                        | Feeds the container count in the hero bio and the tickers.                                                                                                                                                |
| `RightNow.astro`, `NowFeed.astro`                                                                      | Leave the homepage (the Now row was rejected). Keep them on /about if they're still used there.                                                                                                           |
| `CatChase.astro`                                                                                       | **Delete** with its spec (`e2e/cat-chase.spec.ts`).                                                                                                                                                       |
| Homepage terminal (`index.astro`), `src/lib/terminal-core.ts`, `styles/terminal.css`, the 404 terminal | **Delete** in Phase 2, together with `tests/terminal-core.test.ts`, `e2e/terminal.spec.ts` and `e2e/terminal-easter-eggs.spec.ts`. The /uses apt view goes too (Phase 5).                                 |
| `scripts/validate-images.sh`, `tests/bundle-size.test.ts`                                              | Extend with video budgets (Phase 3).                                                                                                                                                                      |

## Phases

### Phase 0: Foundation

**Status: shipped.**

1. **Design tokens in `tailwind.config.mjs`:** `ink`, `paper`, `pink`, `muted`. Remove `coral` once nothing uses it.
2. **Fonts:** Anton, Fraunces and Hanken Grotesk, loaded via Google Fonts (CSP already allows them). Swap `fontFamily.sans` and add `display` and `serif`.
3. **Media scripts:** move `halftone.py`, `vid2.sh` and `boil.sh` into `scripts/media/` and add npm scripts for them (`media:dither`, `media:loop`). Add a small test that runs the ditherer on a fixture image and checks the output size and colors.
4. **Motion helpers:** a shared stylesheet with the redraw scribble animation, slot machine, stacked echo and tickers, plus the pause-motion script. Reduced motion is respected everywhere.

Done when: the build and `npm test` pass, the CSS budget holds, and the live site looks unchanged.

### Phase 1: Global chrome (header, footer, layout)

**Status: shipped.**

1. Reskin `Header.astro` into the floating nav with the pause button and `aria-current`.
2. Reskin `Footer.astro` and the newsletter components into the pink footer with the stacked echo.
3. Add `<main>` to `BaseLayout`.
4. Delete the Cmd+K command palette, the cursor-following ASCII cat and the Konami dashboard from `BaseLayout`, with their CSS, scripts and the source-code banner that advertises them.
5. Tests:
   - Update `e2e/navigation.spec.ts`.
   - Add a pause-motion e2e test: click it, check that animations and videos stop.
   - Keep `e2e/accessibility.spec.ts` axe-clean.

Done when: every page has the new header and footer, and the site deploys.

### Phase 2: Homepage

**Status: shipped.**

1. Rebuild `src/pages/index.astro` in the mock-r layout from real data:
   - recent posts from `getFeedPosts()`
   - projects from `projects.ts`
   - topics from `getCategoryCounts()`
   - the container count from `now-feed.json`
2. Delete the terminal and everything it alone used (see Reuse map), plus `CatChase` (and `e2e/cat-chase.spec.ts`) and `RightNow` on the homepage.
3. Port the drawing board (with the touch-scroll fix and the inert wrapper) and the slot-machine band.
4. Tests:
   - Rewrite `e2e/homepage.spec.ts`: hero video present, every section heading links, rows link, the slot machine has screen-reader text, the drawing board doesn't block touch scroll.
   - Unit-test `getCategoryCounts()`.

Done when: the live homepage matches mock-r using real data, and no terminal code is left.

### Phase 3: Media production

**Status: shipped.** PEAT is Windows-only, so the flash check is `npm run media:flash-check` (see the decisions log).

1. **Montage:**
   - Re-encode the hero montage to WebM (VP9) plus an MP4 fallback, targeting 3 MB or less.
   - Add a poster frame.
   - Run a flash/seizure check (PEAT).
2. **Collage:** 4–5 loops. Off-screen videos load only when they scroll into view, using `preload="none"` plus a load-on-visible script. That counts as lazy loading, not a scroll animation.
3. **Dithered post thumbnails:**
   - Generate them with the media script for every post hero image, and commit them next to the originals.
   - Add a test that every post has a dithered thumbnail under the image size limit.
4. **Budgets:** add video budgets to the validation script (per-file and per-page).

Done when: total homepage media is under the budget, and Lighthouse performance holds.

### Phase 4: Blog post template

**Status: shipped.**

1. Reskin `BlogPost.astro`:
   - Fraunces body at reading size with roughly 66-character lines.
   - Hanken Grotesk for metadata.
   - Anton headings.
   - The dithered hero image.
   - Pink links and blockquotes.
2. Keep the TOC, the TL;DR block, related posts, share links and the JSON-LD.
3. Update `global.css` prose styles. Delete prose rules that nothing uses anymore.

Done when: a long post reads comfortably on desktop and phone, and the blog e2e and seo specs pass.

### Phase 5: Other pages

**Status: next.**

Reskin every remaining page into the new system: same rules as before (reskin the existing page, reuse the toolkit, delete what goes dead, tests and axe stay clean). Use index lists where they fit, but rethink each layout for its content rather than copying the homepage. Marks spill across every page, not just the homepage, but stay off running text.

Pages, with what each still carries (counts are `coral` uses as of 2026-11-05):

1. **Blog index** (`src/pages/blog/index.astro`, 9): category filter, search, load-more, featured post, `BlogCard` grid. Its cards can use `halftoneThumbnail()`.
2. **Category pages** (`src/pages/blog/category/[category].astro`, 3): same `BlogCard` grid and filter bar.
3. **`/work`** (`src/pages/work.astro`, 11) and **`/work/[slug]`** (7): `ProjectCard` grid with hover-play clips, featured project, galleries, steps, embeds. Mock-r rejected project _images_ on the homepage; on /work, decide with Joe.
4. **About** (`src/pages/about.astro`, 20): career, recognition, talks, YouTube embeds, `RightNow` and `NowFeed`. Its three YouTube embeds put Lighthouse weight at 1.9MB (cap 1.5MB): replace them with click-to-load facades (thumbnail + play button that swaps in the iframe; keep `youtube-nocookie.com`, already in CSP `frame-src`).
5. **Uses** (`src/pages/uses.astro`, 119, the most): delete the terminal-style `apt list` view and its tab toggle (`#tab-apt`, `#apt-view`, `switchView()`), keep the normal list.
6. **Resume** (`src/pages/resume.astro`, 11): careful, `resume-pdf.astro` and `npm run generate:resume` print it to PDF. Keep print styles readable (dark pink on black won't print); check the PDF after.
7. **Contact** (24), **newsletter index** (`src/pages/newsletter/index.astro`, 2; it also uses the non-footer variant of `NewsletterSignup`, still coral), **newsletter issues** (`[...slug].astro`, 1, uses `BlogPost` already), **talk archive** (18), **privacy policy** (2).
8. **404** (`src/pages/404.astro`): already a plain pink page; Phase 6 may make it a drawing board.
9. **`/man`** (`src/pages/man.astro`): a man-page easter egg not in the original plan. Ask Joe: keep and reskin, or delete.

Site-wide cleanup once the pages are done:

- `global.css` base layer still uses coral for links, `:focus-visible` outlines and `::selection`; switch to pink (check focus outlines on pink backgrounds like the footer).
- `body` is still `bg-surface-0 text-gray-300`; settle on `bg-ink`/`text-paper` (or keep surface-0 if pages need the slight lift) and delete unused `surface-*` steps.
- Remove `coral`, `teal` and `lavender` from `tailwind.config.mjs` once nothing uses them; `@fontsource/inter` and `@fontsource/jetbrains-mono` are unused dependencies too (listed in `knip.config.ts`).
- Delete `BlogCard`, `ProjectCard`, `RightNow`, `NowFeed` if their pages stop using them (`npx knip` finds leftovers).
- The non-footer `NewsletterSignup` variant (coral button, bordered input).

Done when: every page uses the new system, `grep -r coral src` finds nothing, the old styles and dead components are gone, axe passes on all 21 URLs, and `npm run test:lighthouse` passes (including /about).

### Phase 6: Personal layer

1. Joe's scribble scans traced to SVG, replacing the generated marks: loops, rings, underlines, arrows, hatching, cross-outs, a few handwritten words, one or two big gestures and some color fields.
2. Lens wordmarks made in Jitter or Rive, if Joe makes them. Wire them in as WebM or `.riv`.
3. Optional:
   - A drawing board that saves visitors' marks to the homelab.
   - Live homelab data in the tickers (Letterboxd, Home Assistant).
   - A 404 page that's a blank drawing board.

## Decisions log

- 2026-11-05: drop the ASCII cursor cat, the Konami dashboard, the Cmd+K command palette and the /uses apt view.
- 2026-11-05: drop the lens animation (type lab #10). Joe's own Jitter or Rive wordmarks may replace the two phrase animations later.
- 2026-11-05: interface font is Hanken Grotesk (replacing Inter), with Fraunces for reading and Anton for headlines.
- 2026-11-05: the nav is always one row. Its spacing is in em, so from `md` up the type shrinks until the bar fits; on phones it scrolls sideways inside the pill, starting with the current page centered. Sticky at every width. Pause motion is an icon (pause bars, then a play triangle) with the words as its accessible name and tooltip.
- 2026-11-05: the header drops its social icons; they live in the footer only, as in mock-r.

- 2026-11-05: Writing by topic leaves out the catch-all Work and Personal categories (79 and 6 posts), as mock-r did, and lists the top eight subjects.
- 2026-11-05: the drawing board is `aria-hidden` with `tabindex="-1"` swatches rather than `inert`, because `inert` also blocks clicks on the crayon swatches.
- 2026-11-05: Phase 2 ships interim H.264 encodes in `public/images/home/` (montage 3.9 MB at 600px, six collage loops 2.8 MB, `preload="none"`), all played by `in-view-play` so reduced motion shows posters. Phase 3 replaces them with WebM, budgets and the PEAT check. Post thumbnails are still the color hero images until Phase 3 dithers them.

- 2026-11-05: the nav drops Home; the black chip reads "Joe Karlsson", links home, and turns pink on the homepage.
- 2026-11-05 (Phase 3): the hero montage ships as WebM (VP9, 2.3MB) with an MP4 fallback (2.7MB), plus a phone-only 16:9 face crop (0.9MB) picked by `<source media>`. Posters and post thumbnails are 4-color lossless WebP. Thumbnails use a finer dot (cell 1.5) than video (cell 3), because coarse dots made diagrams unreadable at 300px, and `--invert-light` flips white-background heroes so they read as pink on black.
- 2026-11-05 (Phase 3): PEAT runs only on Windows, so `npm run media:flash-check` applies WCAG 2.3.1's general-flash rule (no more than three flashes a second, whole frame and each quarter) to every homepage clip. All pass with at most one.
- 2026-11-05 (Phase 3): Lighthouse on `/about/` is over the 1.5MB weight cap (1.9MB) because of its YouTube embeds, not the redesign. Fix it with click-to-load embeds when Phase 5 reskins /about.

- 2026-11-05 (Phase 4): post heroes use the same halftone as the homepage thumbnails, regenerated at 1120px with fine dots (cell 1.5) over a soft pink duotone (`--duotone`), because dots alone made screenshots and diagrams hard to read. 7.5MB for all 171; the dist budget went from 200MB to 215MB for it. og:image stays the original color image.
- 2026-11-05 (Phase 4): prose is Fraunces at 17-20px, capped at 32em (about 67 characters a line on desktop). Headings are Anton; h4, code labels, captions and tables are Hanken Grotesk. Each post's hero gets one crayon mark, picked by its slug.
- 2026-11-05 (Phase 4): marks may cross boxes and sections but not running text or links. The page leaves a gap above the footer so the footer coil rises into empty space. The footer echo draws its hollow copies with `-webkit-text-fill-color`, so contrast checkers don't read them as invisible text.

No open decisions.
