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

- **Content deploy**: `./deploy.sh` builds a clean copy of HEAD in a temporary worktree (cold Astro cache), never the working tree, so other sessions' uncommitted files can't ship. It stops if HEAD has commits not on origin/main (push first), then runs `tofu apply` with that copy's `dist`, purges Cloudflare, and checks the heaviest pages as an iPhone in WebKit (`scripts/smoke-phone.mjs`: crashes, reload loops, script errors, desktop-only games loading on a phone). Works the same from a worktree.
- **Caddyfile changes**: Edit `~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl`, then run `tofu apply` from that directory. The `Caddyfile` in this repo is kept as a reference but is **not deployed by deploy.sh**.
- **Approved content changes**: commit, push, then `npm run deploy` and curl the live page. Don't stop at push. Still ask before Caddyfile or infra changes.
- **Now-feed snapshot**: `deploy.sh` first runs `npm run update:now`, which pulls recent commits (GitHub, via `gh auth token`), Letterboxd, Audiobookshelf podcasts and Proxmox stats from Prometheus into `src/data/now-feed.json` + `public/images/now/`, then commits them as `chore: Refresh now-feed snapshot` (not pushed). Needs the home LAN and `AUDIOBOOKSHELF_*` / `PROMETHEUS_URL` in `.env`; any source failing stops the deploy. Off-network or with a source down: `SKIP_NOW_REFRESH=1 npm run deploy` ships the committed snapshot. The live container count on every page comes from this file, so never hard-code it.

## Blog Posts

- All images need descriptive alt text.
- Drop raw PNG/JPG/GIF images in; the pre-commit hook converts them (details in `.claude/rules/images.md`).
- Newsletter issues get a generated header card (`scripts/generate-issue-cards.mjs`, run by the pre-commit hook for a staged issue with no card; needs the network for Google Fonts). For a photo card set `cardPhoto` + `cardPhotoAlt`; after changing a title, redraw with `npm run newsletter:cards -- <slug>`. Each card also gets an animated `card.gif` (600px, for the top of the listmonk email) and `card.mp4` (for social uploads); the still `card.webp` stays the og:image. Timeline: `scripts/issue-card-motion.mjs`; needs ffmpeg.
- Posts written for an employer get a picture thumbnail, never their employer's stock art: the post's own meme, or else a public-domain photo from Wikimedia Commons as a metaphor (`scripts/work-thumbnail-plan.json`, drawn by `npm run thumbnails:work -- <slug>`). Plain app screenshots and diagrams don't count. Every card gets the site's pink-and-black filter, never dots; neighbors in the feed take different looks (flat or taped). Clear backups of the cards are in `media-sources/work-thumbnails/clear/`.
- A post's hero is a boiling cut-paper collage (`src/components/PaperHero.astro`): torn print, tape, topic scrap, month chip. It renders still; `src/scripts/paper-hero-boil.ts` starts the boil only on a wide screen, with motion allowed, no Save-Data or 2g/3g, and a device holding 40fps. Taped work thumbnails skip the drawn print and tape; animated thumbnails ship as their still there (`data-still-only`).
- A new iframe origin must be added to CSP `frame-src` in `provision.sh.tpl` and `Caddyfile`, or the embed is silently blocked in production (`.claude/rules/embeds.md`).

## Metadata

Every head tag, manifest field and well-known file, who reads it, and how to test it: `docs/METADATA.md`. Update it when you change `BaseHead.astro`. `public/.well-known/security.txt` needs its `Expires` renewed yearly (a test fails 30 days out).

## Checks

The pre-commit hook formats and lints staged files; the pre-push hook runs the full `npm test`.

A new page, or a change to a layout, component, nav, form or the 404, gets the `design-reviewer` agent (global, `~/.claude/agents/`) on the built page before it ships: start `npx astro preview` (it picks a free port and prints it; another session may hold 4391), give the agent those URLs and this repo, and fix its High and Medium findings. It checks the UX laws (`~/.claude/knowledge/ux-laws.md`), the AI-slop rules and the phone/big-screen/accessibility parts of the launch checklist. Plain post and newsletter text changes skip it.
