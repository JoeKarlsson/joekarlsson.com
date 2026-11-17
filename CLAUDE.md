# joekarlsson.com - Claude Instructions

## Site Overview

Astro v7 static site. Served by Caddy on CT 165 (192.168.0.165), managed by OpenTofu at `~/claude/opentofu/services/joekarlsson-astro/`.

## Writing Content

**Read `STYLE_GUIDE.md` before writing any content.** It captures Joe's personal voice, prohibited language, and formatting rules. Key rules:

- No em dashes - use regular dashes or rewrite
- No AI-sounding words (delve, realm, comprehensive, robust, etc.)
- First-person singular voice ("I", not "we")
- Opinionated, specific, honest about limitations

## Build & Deploy

```bash
npm run build      # Build static site to ./dist/ (local dev/preview only)
npm run deploy     # Build + deploy via OpenTofu (tofu apply) + purge Cloudflare cache
./deploy.sh        # Same as npm run deploy (called directly)
```

**CT 165 is immutable.** Never SSH/rsync/scp directly to `192.168.0.165`.

- **Content deploy**: `./deploy.sh` deploys the newest origin/main, so one deploy ships every session's pushed commits. It stops if HEAD has commits not on origin/main (push first), waits for CI on that commit, then takes the deploy lock (a second deploy waits its turn instead of failing) and stops with "Already live" if the live site's `deployed-commit.txt` already includes it (`FORCE_DEPLOY=1` deploys anyway). It builds a clean copy of the commit in a temporary worktree (cold Astro cache), never the working tree, so other sessions' uncommitted files can't ship, then plans `tofu apply` with that copy's `dist` and stops if the plan would change anything besides the content push and purge (apply infra changes from the OpenTofu directory first), purges Cloudflare, and checks the heaviest pages as an iPhone in WebKit (`scripts/smoke-phone.mjs`: crashes, reload loops, script errors, desktop-only games loading on a phone). Works the same from a worktree.
- **Caddyfile changes**: Edit `~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl`, then run `tofu apply` from that directory. The `Caddyfile` in this repo is kept as a reference but is **not deployed by deploy.sh**. It must match the template line for line, or every deploy stops: update and push it first, since a commit of the template in claude-skills is blocked until it matches.
- **CI gates the deploy**: `deploy.sh` waits for the GitHub CI run on the commit it ships (`scripts/wait-for-ci.sh`, about 4 minutes, the last of it E2E, so run it in the background) and stops if any job but Lighthouse failed. Lighthouse doesn't hold the deploy, but a red Lighthouse still means CI is red. The build, e2e, Pa11y and Lighthouse run only in CI (not in the pre-push hook), so a red run means fix it in that session, push, and deploy again; never leave CI red. To check a risky change before pushing, run `npm run build` and `PORT=46xx npx playwright test` yourself. If CI is red only because GitHub's runners are down (not the code), `SKIP_CI=1 npm run deploy` ships without waiting.
- **Approved content changes**: commit, push, then `npm run deploy` and curl the live page. Don't stop at push. Still ask before Caddyfile or infra changes.
- **Now-feed snapshot**: `deploy.sh` first runs `npm run update:now`, which pulls recent commits (GitHub, via `gh auth token`), Letterboxd, Audiobookshelf podcasts and Proxmox stats from Prometheus into `src/data/now-feed.json` + `public/images/now/` inside the build copy, so nothing is committed (it used to commit `chore: Refresh now-feed snapshot` locally, which collided with rebases). Needs the home LAN and `AUDIOBOOKSHELF_*` / `PROMETHEUS_URL` in `.env`; any source failing stops the deploy. Off-network or with a source down: `SKIP_NOW_REFRESH=1 npm run deploy` ships the committed snapshot. The live container count on every page comes from this file, so never hard-code it.

## Blog Posts

- All images need descriptive alt text.
- Drop raw PNG/JPG/GIF images in; the pre-commit hook converts them (details in `.claude/rules/images.md`).
- Newsletter issues get a generated header card (`scripts/generate-issue-cards.mjs`, run by the pre-commit hook for a staged issue with no card; needs the network for Google Fonts). For a photo card set `cardPhoto` + `cardPhotoAlt`; after changing a title, redraw with `npm run newsletter:cards -- <slug>`. Each card also gets an animated `card.gif` (600px, for the top of the listmonk email) and `card.mp4` (for social uploads); the still `card-<hash>.webp` (renamed on every redraw, past the image cache) stays the og:image. Timeline: `scripts/issue-card-motion.mjs`; needs ffmpeg.
- Posts written for an employer get a picture thumbnail, never their employer's stock art: the post's own meme, or else a public-domain photo from Wikimedia Commons as a metaphor (`scripts/work-thumbnail-plan.json`, drawn by `npm run thumbnails:work -- <slug>`). Plain app screenshots and diagrams don't count. Every card gets the site's pink-and-black filter, never dots; neighbors in the feed take different looks (flat or taped). Clear backups of the cards are in `media-sources/work-thumbnails/clear/`.
- A post-layout page (posts, newsletter issues, reviews, talks) opens with a masthead (`src/layouts/BlogPost.astro`, `src/utils/masthead.ts`): kicker line, the title fitted to the column, the picture with no tilt or tape, the description as its caption. Animated thumbnails ship as their still there (`data-still-only`).
- A new iframe origin must be added to CSP `frame-src` in `provision.sh.tpl` and `Caddyfile`, or the embed is silently blocked in production (`.claude/rules/embeds.md`).

## Metadata

Every head tag, manifest field and well-known file, who reads it, and how to test it: `docs/METADATA.md`. Update it when you change `BaseHead.astro`. `public/.well-known/security.txt` needs its `Expires` renewed yearly (a test fails 30 days out).

## Checks

The pre-commit hook formats and lints staged files; the pre-push hook runs `npm run test:prepush` (about a minute): `npm test` without the build, and the unit tests that don't read `dist/`.

A Stop hook (`scripts/design-review-gate.mjs`, wired in the git-ignored `.claude/settings.json`) holds a session's finish while its unpushed changes to `src/layouts`, `src/components`, `src/styles` or a page's `.astro` file have no design review: a `design-reviewer`, `design-critic`, `design-evidence` or `typography-reviewer` run records one, `node scripts/design-review-gate.mjs waive "<reason>"` skips it when nothing visible changed (5 waivers at most), and it lets the finish through after 3 blocks.

Web standards guards (`~/.claude/knowledge/modern-web-guidance.md`): every page enforces a script CSP with Trusted Types (`src/integrations/script-csp.mjs`), so browser code never writes HTML strings (ESLint bans `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`). e2e can't see that policy, since it runs on the dev server; CI's "Script Policy (built site)" job (`scripts/check-script-policy.mjs`) loads the built pages and fails on anything blocked. Monthly, `.github/workflows/standards.yml` runs Google's legacy-scan and checks for newer guides, and flags both in one "Modern Web Guidance check" issue; when it says new guides are out, run the full `web-standards-reviewer`.

In a worktree, don't symlink the whole `node_modules` to the main checkout: Astro keeps its content cache in `node_modules/.astro/data-store.json`, so a shared one serves the main checkout's (or another session's) front matter, and the build renders the wrong hero or fails on an image you deleted. Make `node_modules` a real folder that links each package (`mkdir node_modules; for e in ../joekarlsson.com/node_modules/* ../joekarlsson.com/node_modules/.bin; do ln -s "../$e" node_modules/; done`), so `.astro` stays private.

Run e2e on a port of your own (`PORT=46xx npx playwright test ...`): the config reuses any server already on 4321, which is often another session's checkout, so a default run can test someone else's code and its failures look like yours. With PORT set the config never reuses a server, so a busy port fails loudly; pick another.

**One frame for every article page.** Blog posts, reviews, talks (`BlogPost.astro`), newsletter issues (`newsletter/[...slug].astro`) and project pages (`work/[slug].astro`) share the post's frame: the masthead in `.post-axis`, the `.margin-column` with "On this page", the same pictures and captions, and the same ending (JK mark, `NewsletterAsk`, `ShareLinks`, `AuthorBio`, then Keep reading / More reviews / More works under the arrow). They're three templates, so a change to one is a change to all three: make it in each (or in a shared component) in the same commit. `e2e/consistency.spec.ts` loads one page of each type in Chromium and Firefox and fails CI when one drifts; extend it when the shared frame gains a piece.

A new page, or a change to a layout, component, nav, form or the 404, gets the `design-reviewer` agent (global, `~/.claude/agents/`) on the built page before it ships: start `npx astro preview` (it picks a free port and prints it; another session may hold 4391), give the agent those URLs and this repo, and fix its High and Medium findings. It checks the UX laws (`~/.claude/knowledge/ux-laws.md`), the AI-slop rules and the phone/big-screen/accessibility parts of the launch checklist. Plain post and newsletter text changes skip it.

The same changes, plus any change to `src/scripts/`, `src/styles/` or `BaseHead.astro`, also get the `web-standards-reviewer` agent (global) in diff mode, run in parallel with `design-reviewer`: give it this repo, the built `dist/` and the preview URL. It checks the code against Google's Modern Web Guidance (`~/.claude/knowledge/modern-web-guidance.md`, which also sets the Baseline support policy). Fix its High and Medium findings; served headers live in `provision.sh.tpl`, so a header finding needs Joe's OK like any infra change. Plain post and newsletter text changes skip it too.

A change to type (fonts, font sizes, spacing, letter-spacing or line length in `src/styles/`, `tailwind.config.mjs`, `astro.config.mjs` fonts, or a layout's headings and captions) also gets the `typography-reviewer` agent (project, `.claude/agents/`) on the built page, in parallel with the other two. It checks the setting against 57 independent sources in `docs/typography-sources.md` and measures in Firefox, Chromium and WebKit. Fix its High and Medium findings. For a whole-site type audit, run it with "whole site".
