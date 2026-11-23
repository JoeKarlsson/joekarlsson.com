# joekarlsson.com - Claude Instructions

## Site Overview

Astro v7 static site. Served by Caddy on an immutable homelab container (its ID and IP are in claude-skills, not here), managed by OpenTofu at `~/claude/opentofu/services/joekarlsson-astro/`.

## Writing Content

**Read `STYLE_GUIDE.md` before writing any content** (Joe's voice, prohibited language, formatting). Key rules: no em dashes (use regular dashes or rewrite); no AI-sounding words (delve, realm, comprehensive, robust, etc.); first-person singular ("I", not "we"); opinionated, specific, honest about limitations.

## Build & Deploy

```bash
npm run build      # Build static site to ./dist/ (local dev/preview only)
npm run deploy     # Build + deploy via OpenTofu (tofu apply) + purge Cloudflare cache
./deploy.sh        # Same as npm run deploy (called directly)
```

**The serving container is immutable.** Never SSH/rsync/scp directly to it.

- **Content deploy**: `./deploy.sh` ships the newest origin/main, so one deploy ships every session's pushed commits. It stops if HEAD has commits not on origin/main (push first); waits for CI on that commit; takes the deploy lock (a second deploy waits its turn); stops with "Already live" if the live `deployed-commit.txt` already includes it (`FORCE_DEPLOY=1` deploys anyway). It builds a clean copy of the commit in a temporary worktree (cold Astro cache), never the working tree, so uncommitted files can't ship; plans `tofu apply` with that copy's `dist` and stops if the plan changes anything besides the content push and purge (apply infra changes from the OpenTofu directory first); purges Cloudflare; and checks the heaviest pages as an iPhone in WebKit (`scripts/smoke-phone.mjs`: crashes, reload loops, script errors, desktop-only games loading on a phone). Works the same from a worktree.
- **Caddyfile changes**: edit `~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl`, then `tofu apply` from that directory. This repo's `Caddyfile` is a reference, **not deployed by deploy.sh**, but must match the template line for line or every deploy stops: update and push it first, since a claude-skills commit of the template is blocked until they match.
- **CI gates the deploy**: `deploy.sh` waits for the GitHub CI run on its commit (`scripts/wait-for-ci.sh`, about 4 minutes, E2E last, so run it in the background) and stops if any job but Lighthouse failed. A red Lighthouse doesn't hold the deploy but is still red CI. Build, e2e, Pa11y and Lighthouse run only in CI (not pre-push): if CI goes red, fix it in that session, push and deploy again; never leave CI red. To check a risky change before pushing: `npm run build` and `PORT=46xx npx playwright test`. If CI is red only because GitHub's runners are down, `SKIP_CI=1 npm run deploy` ships without waiting.
- **Approved content changes**: commit, push, then `npm run deploy` and curl the live page. Don't stop at push. Still ask before Caddyfile or infra changes.
- **Now-feed snapshot**: `deploy.sh` first runs `npm run update:now` inside the build copy: recent commits (GitHub, via `gh auth token`), Letterboxd, Audiobookshelf podcasts and Proxmox stats from Prometheus into `src/data/now-feed.json` + `public/images/now/`. Nothing is committed (it used to commit `chore: Refresh now-feed snapshot`, which collided with rebases). Needs the home LAN and `AUDIOBOOKSHELF_*` / `PROMETHEUS_URL` in `.env`; any failing source stops the deploy. Off-network or a source down: `SKIP_NOW_REFRESH=1 npm run deploy` ships the committed snapshot. Every page's live container count comes from this file; never hard-code it.

## Blog Posts

- All images need descriptive alt text. Drop raw PNG/JPG/GIF images in; the pre-commit hook converts them (`.claude/rules/images.md`).
- Newsletter issues get a generated header card, still plus `card.gif`/`card.mp4` (pre-commit hook; photo card via `cardPhoto` + `cardPhotoAlt`; after a title change, `npm run newsletter:cards -- <slug>`). Details: the header of `scripts/generate-issue-cards.mjs`.
- Thumbnails: `.claude/rules/metaphor-thumbnails.md`. Employer posts never use the employer's stock art: the post's own meme, else the metaphor photo; plain app screenshots and diagrams don't count. Clear backups: `media-sources/work-thumbnails/clear/`.
- Post-layout pages open with the masthead (`src/layouts/BlogPost.astro`, `src/utils/masthead.ts`; DECISIONS.md 2026-11-15). Animated thumbnails ship as their still there (`data-still-only`).
- A new iframe origin must be added to CSP `frame-src` in `provision.sh.tpl` and `Caddyfile`, or the embed is silently blocked in production (`.claude/rules/embeds.md`).

## Metadata

Every head tag, manifest field and well-known file, who reads it, and how to test it: `docs/METADATA.md`. Update it when you change `BaseHead.astro`. `public/.well-known/security.txt` needs its `Expires` renewed yearly (a test fails 30 days out).

## Checks

**CSS lives with the page type that uses it.** `src/styles/global.css` (every page) holds only site-wide rules; reading text goes in `prose.css`, the article frame in `article.css` (ArticleFrame imports it, and it pulls in `prose.css`), reviews in `reviews.css`, papers in `papers.css`. `tests/bundle-size.test.ts` budgets the gzipped CSS each page type loads; when one trips, it's Joe's trade-off to record in DECISIONS.md, never a quiet raise.

The pre-commit hook formats and lints staged files; the pre-push hook runs `npm run test:prepush` (about a minute): `npm test` without the build, and the unit tests that don't read `dist/`.

A Stop hook (`scripts/design-review-gate.mjs`, wired in the git-ignored `.claude/settings.json`) holds a session's finish while unpushed changes to `src/layouts`, `src/components`, `src/styles` or a page's `.astro` file have no design review. A `design-reviewer`, `design-critic`, `design-evidence` or `typography-reviewer` run records one; `node scripts/design-review-gate.mjs waive "<reason>"` skips it when nothing visible changed (5 waivers at most); it lets the finish through after 3 blocks.

Web standards (`~/.claude/knowledge/modern-web-guidance.md`): every page enforces a script CSP with Trusted Types (`src/integrations/script-csp.mjs`), so browser code never writes HTML strings (ESLint bans `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`). e2e runs on the dev server and can't see the policy; CI's "Script Policy (built site)" job (`scripts/check-script-policy.mjs`) loads the built pages and fails on anything blocked. Monthly, `.github/workflows/standards.yml` runs Google's legacy-scan and checks for newer guides, flagging both in one "Modern Web Guidance check" issue; when it says new guides are out, run the full `web-standards-reviewer`. Its field job checks real visitors' Core Web Vitals from the Chrome UX Report (`scripts/crux-report.mjs`, secret `CRUX_API_KEY`, the same key as `.env`) and keeps a "Field speed check" issue open while any metric on phone or desktop is past "good"; run `performance-reviewer` when it opens.

In a worktree, make `node_modules` a real folder that links each package (`mkdir node_modules; for e in ../joekarlsson.com/node_modules/* ../joekarlsson.com/node_modules/.bin; do ln -s "../$e" node_modules/; done`), never a symlink to the main checkout's: the caches inside it (`node_modules/.cache/responsive-images`) would be shared, and two checkouts' builds collide on the same files. Astro's own content cache is `.astro/` or `node_modules/.astro/` in each checkout (clear both after a plugin change: `rm -rf .astro node_modules/.astro`).

Run e2e on your own port (`PORT=46xx npx playwright test ...`): without PORT the config reuses any server on 4321, often another session's checkout, so its failures look like yours. With PORT set it never reuses a server, so a busy port fails loudly; pick another.

**Pink pictures are CSS** (global.css, "Pink pictures"; DECISIONS.md 2026-11-22). An `img` or `video` with `data-halftone` is filtered gray at its own levels (measured from its file at build time by `src/integrations/halftone-levels.mjs`) and its parent multiplies pink over it, so the parent must be exactly the picture's box: no caption or text inside it (wrap the picture in its own `<span class="relative block">` if needed). `e2e/halftone.spec.ts` checks every picture on each page type in Chromium and Firefox; add a page there when a new page type gets pink pictures.

**One frame for every article page.** Blog posts, reviews, talks (`BlogPost.astro`), newsletter issues (`newsletter/[...slug].astro`) and project pages (`work/[slug].astro`) all render through `src/components/ArticleFrame.astro`, which owns the masthead, the `.margin-column` with "On this page", the end mark and the ending (`NewsletterAsk`, `ShareLinks`, `AuthorBio`). A template passes only its own pieces: the kicker, notes above the text, the body and its "more" section (Keep reading / More reviews / More works). Change the shared frame in `ArticleFrame`, never in one template, and never build an article page outside it. `e2e/consistency.spec.ts` loads one page of each type in Chromium and Firefox and fails CI on drift; extend it when the frame gains a piece.

Reviews before shipping; fix each agent's High and Medium findings. Plain post and newsletter text changes skip the first two.

- A new page, or a change to a layout, component, nav, form or the 404: `design-reviewer` (global, `~/.claude/agents/`) on the built page. Start `npx astro preview` (it picks a free port and prints it; another session may hold 4391) and give it those URLs and this repo. It checks the UX laws (`~/.claude/knowledge/ux-laws.md`), the AI-slop rules and the launch checklist's phone/big-screen/accessibility parts.
- The same changes, plus any change to `src/scripts/`, `src/styles/` or `BaseHead.astro`: `web-standards-reviewer` (global) in diff mode, in parallel; give it this repo, the built `dist/` and the preview URL. It checks against Google's Modern Web Guidance (`~/.claude/knowledge/modern-web-guidance.md`, which also sets the Baseline support policy). Served headers live in `provision.sh.tpl`, so a header finding needs Joe's OK like any infra change.
- A type change (fonts, font sizes, spacing, letter-spacing or line length in `src/styles/`, the `@theme` in `src/styles/global.css`, `astro.config.mjs` fonts, or a layout's headings and captions): `typography-reviewer` (project, `.claude/agents/`) on the built page, in parallel. It checks against 57 independent sources in `docs/typography-sources.md` and measures in Firefox, Chromium and WebKit. For a whole-site type audit, run it with "whole site".
