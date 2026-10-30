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

- **Content deploy**: `./deploy.sh` (builds + runs `tofu apply` which detects `dist/index.html` changed)
- **Caddyfile changes**: Edit `~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl`, then run `tofu apply` from that directory. The `Caddyfile` in this repo is kept as a reference but is **not deployed by deploy.sh**.
- **Deploying from a worktree** ships the main checkout's `dist` (`site_dist_path` in terraform.tfvars is hardcoded) and skips the Cloudflare purge (no `.env`), yet the smoke check still passes. Run tofu with `-var "site_dist_path=$PWD/dist" -replace=null_resource.push_content`, purge with the main checkout's `.env`, then curl the live page for a changed sentence.
- **Approved content changes**: commit, push, then `npm run deploy` and curl the live page. Don't stop at push. Still ask before Caddyfile or infra changes.

## Blog Posts

- All images need descriptive alt text.
- Drop raw PNG/JPG/GIF images in; the pre-commit hook converts them (details in `.claude/rules/images.md`).
- A new iframe origin must be added to CSP `frame-src` in `provision.sh.tpl` and `Caddyfile`, or the embed is silently blocked in production (`.claude/rules/embeds.md`).

## Checks

The pre-commit hook formats and lints staged files; the pre-push hook runs the full `npm test`.
