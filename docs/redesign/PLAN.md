# Site redesign plan (November 2026)

The new look: a dark, art house, slightly weird personal site. It is hot pink on black, with dithered video of Joe, poster headlines, crayon scribbles in the spirit of Cy Twombly, and a calm serif for reading. The rollout reskins and reuses the existing Astro site rather than rewriting it. Each phase ships on its own: code cleanup and tests go in with the work, and every phase deploys.

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

- **Treatment:** pink halftone dots on black, kept light and legible (cell size 3, contrast 1.15). The photocopy treatment is used sparingly.
- **Motion over stills:** moving loops instead of still photos where possible. Stills get the "living photocopy" loop.

### Hero

1. **Montage:** about 20 seconds of short clips of Joe, all moving and all with Joe in them. No stills, no clips of a screen alone, and no lifestyle-only filler beyond one or two shots. Joe's face is centered horizontally on the top third at a consistent size of about 30–40% of the frame height. Hard cuts, about 2 seconds per clip, 8 fps.
2. **Pink ticker:** decorative only. It is not a link and sits in front of screen readers' attention as `aria-hidden`.
3. **Panel:** the intro sentence, the short bio, and "JOE KARLSSON" sized to fill the panel width.
4. **Nav:** a sticky floating bar with a black `joekarlsson.com` chip, the current page in pink, and a "Pause motion" button.

### Homepage order

1. Hero.
2. Recent posts: a dithered hero thumbnail on the left of each row, plus date, category and title.
3. "SHIP THE UGLY POT" band, using the slot-machine animation: "Ship the" stays put while the last words roll.
4. Projects: a huge text-only index list. Each row links to its project page and gets a pink ring drawn around it on hover.
5. "Make a mark" drawing board: pre-drawn scribbles plus pink and chalk crayons. Strokes fade on their own.
6. Writing by topic: a huge index list of categories with counts, each linking to its category page.
7. Collage: a few tilted moving photos, including the server rack and the cat.
8. Second ticker, running in the opposite direction.
9. Footer:
   - "WORKS ON MY MACHINE" with the stacked echo animation.
   - The newsletter form and fine print.
   - Footer links, ©, and social icons.

### Scribbles

- Static crayon texture.
- They draw themselves in once and redraw on a slow loop.
- They are never jittered, wobbled or nudged, and have no drips.
- Joe's own scanned marks replace the generated ones later (Phase 6).

### Linking

- Every section heading links to its section page, and every row links to its target.
- Sections end with a "more" link, such as "All 178 posts →".

### Accessibility, already met in mock-r

1. A visible pause-motion control, plus `prefers-reduced-motion` support.
2. The drawing board only draws while pressed, so touch scrolling still works.
3. Landmarks: a header (the hero), `<main>` and a footer.
4. The decorative drawing board is hidden from assistive tech and from keyboard focus.
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
| Category counts (inline in `blog/index.astro`, and again in `blog/category/[category].astro`)          | Extract `getCategoryCounts()` into `src/utils/posts.ts`. The homepage makes a third copy, so it becomes a helper with a unit test.                                                                        |
| `src/data/projects.ts`                                                                                 | Feeds the Projects index (title, year, stack, slug or blog URL).                                                                                                                                          |
| `ProjectCard.astro`, `BlogCard.astro`                                                                  | Reskin into index and post rows where layouts match. Delete either one once nothing uses it.                                                                                                              |
| `now-feed.json`                                                                                        | Feeds the container count in the hero bio and the tickers.                                                                                                                                                |
| `RightNow.astro`, `NowFeed.astro`                                                                      | Leave the homepage (the Now row was rejected). Keep them on /about if they're still used there.                                                                                                           |
| `CatChase.astro`                                                                                       | **Delete** with its spec (`e2e/cat-chase.spec.ts`).                                                                                                                                                       |
| Homepage terminal (`index.astro`), `src/lib/terminal-core.ts`, `styles/terminal.css`, the 404 terminal | **Delete** in Phase 2, together with `tests/terminal-core.test.ts`, `e2e/terminal.spec.ts` and `e2e/terminal-easter-eggs.spec.ts`. The /uses apt view goes too (Phase 5).                                 |
| `scripts/validate-images.sh`, `tests/bundle-size.test.ts`                                              | Extend with video budgets (Phase 3).                                                                                                                                                                      |

## Phases

### Phase 0: Foundation

1. **Design tokens in `tailwind.config.mjs`:** `ink`, `paper`, `pink`, `muted`. Remove `coral` once nothing uses it.
2. **Fonts:** Anton, Fraunces and Hanken Grotesk, loaded via Google Fonts (CSP already allows them). Swap `fontFamily.sans` and add `display` and `serif`.
3. **Media scripts:** move `halftone.py`, `vid2.sh` and `boil.sh` into `scripts/media/` and add npm scripts for them (`media:dither`, `media:loop`). Add a small test that runs the ditherer on a fixture image and checks the output size and colors.
4. **Motion helpers:** a shared stylesheet with the redraw scribble animation, slot machine, stacked echo and tickers, plus the pause-motion script. Reduced motion is respected everywhere.

Done when: the build and `npm test` pass, the CSS budget holds, and the live site looks unchanged.

### Phase 1: Global chrome (header, footer, layout)

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

Blog index, category pages, `/work` and `/work/[slug]`, about, uses (drop the terminal-style apt view toggle and its code), resume, contact, newsletter, talk archive, and 404. Same rules: reskin the existing pages and use index lists where they fit. Rethink each layout with the new approach rather than copying the homepage.

Done when: every page uses the new system, and the old styles and dead components are gone.

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

No open decisions.
