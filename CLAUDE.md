# joekarlsson.com - Claude Instructions

## Site Overview

Astro v6 static site. Served by Caddy on CT 165 (192.168.0.165), managed by OpenTofu at `~/claude/opentofu/services/joekarlsson-astro/`.

## Writing Content

**Read `STYLE_GUIDE.md` before writing any content.** It captures Joe's personal voice, prohibited language, and formatting rules. Key rules:

- No em dashes - use regular dashes or rewrite
- No AI-sounding words (delve, realm, comprehensive, robust, etc.)
- First-person singular voice ("I", not "we")
- Opinionated, specific, honest about limitations

## Build & Deploy

```bash
npm run build      # Build static site to ./dist/
./deploy.sh        # Build + deploy via OpenTofu (tofu apply) + purge Cloudflare cache
```

**CT 165 is immutable.** Never SSH/rsync/scp directly to `192.168.0.165`.

- **Content deploy**: `./deploy.sh` (builds + runs `tofu apply` which detects `dist/index.html` changed)
- **Caddyfile changes**: Edit `~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl`, then run `tofu apply` from that directory. The `Caddyfile` in this repo is kept as a reference but is **not deployed by deploy.sh**.

## Blog Posts

- Content: `src/content/blog/*.md`
- Images: `public/images/blog/{slug}/`
- Schema: `src/content.config.ts` (title, date, slug, description, categories, tags, heroImage)
- Categories: Databases, Dev Tools, Smart Home, Homelab, Film, DevRel, IoT, Travel, Career, Personal
- All images should be WebP (except GIFs for animation)
- All images must have descriptive alt text

### Image conversion (automatic)

Drop the raw PNG/JPG/GIF in `public/images/blog/{slug}/`, reference it normally, and commit. The pre-commit hook runs `scripts/convert-staged-images.sh`, which converts anything staged under `public/images`:

- **PNG/JPG** -> WebP via `scripts/convert-images-to-webp.mjs`, which also repoints every reference across `src/`. Rewritten files are staged for you, unless they already had unstaged edits - then the commit stops so you can review.
- **GIF at/over 256KB** -> gains an `.mp4` sibling via `scripts/convert-gifs-to-video.sh` (requires `ffmpeg`; without it you get a warning and pre-push fails instead). Markdown keeps referencing the `.gif`; `src/plugins/rehype-gif-video.mjs` swaps in a `<video>` at build time. Smaller GIFs are left alone.

To convert by hand (whole tree or specific paths):

```bash
node scripts/convert-images-to-webp.mjs [--dry-run] [paths...]
./scripts/convert-gifs-to-video.sh --min 256 [--dry-run] [paths...]
```

**Astro caching gotcha**: `rehype-gif-video` probes the filesystem, which Astro does not track as a dependency of the markdown it caches. Converting a GIF without clearing `node_modules/.astro` makes the next build re-emit `<img src="...gif">` for a file that no longer exists. `convert-gifs-to-video.sh` clears that cache itself, and `validate-images.sh` fails on any built `<img>`/`<video>` whose source is missing from `dist/`. CI never hits this (cold cache); local `./deploy.sh` would.

## Code Quality

- **Prettier** formats all code (`npm run format`). Config: `.prettierrc`
- **ESLint** lints TS/Astro files (`npm run lint`). Config: `eslint.config.mjs`
- **Vitest** tests build output and content schema (`tests/`). Config: `vitest.config.ts`
- **Knip** detects unused dependencies and exports (`npm run test:unused`). Config: `knip.config.ts`
- **Pre-commit hook** (husky) converts staged images, then lint-staged auto-formats and lints staged files
- **Pre-push hook** runs the full `npm test`, so an unconverted or oversized image cannot be pushed
- All checks run in CI and will fail the build if issues are found

## CI/CD

- GitHub Actions CI runs on PRs + push to main (`.github/workflows/ci.yml`)
- 15 jobs: build, type check, lint/format, markdown lint, spell check, image validation, internal links (lychee), RSS/sitemap, accessibility (Pa11y), Lighthouse, unit tests (vitest, whole `tests/` dir), unused deps (knip), security audit, E2E (Playwright), failure notification (ntfy)
- Weekly external link check (`.github/workflows/links.yml`)
- Weekly dependency health check (`.github/workflows/deps.yml`) - opens GitHub issues for outdated packages and security vulnerabilities
- Config files: `.markdownlint.jsonc`, `cspell.json`, `cspell-custom.txt`, `.pa11yci.json`, `.lighthouserc.json`, `.lychee.toml`, `vitest.config.ts`, `knip.config.ts`
- Validation scripts: `scripts/validate-images.sh`, `scripts/validate-feeds.sh`, `scripts/validate-caddyfile.sh`
- Run `npm test` locally to run full suite: format, lint, type check, build, images, spelling, markdown, build output, content schema
- Add new tech terms to `cspell-custom.txt` when spell check flags them

## Key Files

- `src/consts.ts` - Site title, URL, social links, nav links
- `src/content.config.ts` - Content collection schemas
- `src/env.d.ts` - TypeScript declarations (Window.plausible type)
- `src/components/BaseHead.astro` - SEO, fonts, analytics
- `src/layouts/BaseLayout.astro` - Page wrapper
- `src/layouts/BlogPost.astro` - Blog post layout
- `src/styles/global.css` - Global styles and prose classes
- `tailwind.config.mjs` - Theme colors, fonts
- `Caddyfile` - Server config, redirects, security headers
- `STYLE_GUIDE.md` - Writing voice and style reference
- `tests/build-output.test.ts` - Vitest tests for robots.txt, sitemap, RSS, llms.txt, SEO meta, webmanifest
- `tests/content-schema.test.ts` - Vitest tests for blog post frontmatter validation
- `tests/rehype-plugins.test.ts` - Vitest tests for the gif-video and lazy-image rehype plugins
- CI runs `npx vitest run` over the whole `tests/` directory - add a file and it runs, no wiring needed

## Pages

- `/` - Homepage with interactive terminal
- `/blog` - Blog index, `/blog/[slug]` - Individual posts
- `/about`, `/work`, `/uses`, `/contact` - Static pages
- `/talk-archive`, `/privacy-policy` - Content pages
- `/rss.xml`, `/llms.txt`, `/llms-full.txt` - Machine-readable feeds
