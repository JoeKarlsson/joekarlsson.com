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

## Code Quality

- **Prettier** formats all code (`npm run format`). Config: `.prettierrc`
- **ESLint** lints TS/Astro files (`npm run lint`). Config: `eslint.config.mjs`
- **Vitest** tests build output and content schema (`tests/`). Config: `vitest.config.ts`
- **Knip** detects unused dependencies and exports (`npm run test:unused`). Config: `knip.config.ts`
- **Pre-commit hook** (husky + lint-staged) auto-formats and lints staged files on commit
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
