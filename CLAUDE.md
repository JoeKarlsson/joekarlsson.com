# joekarlsson.com - Claude Instructions

## Site Overview

Astro v5 static site replacing WordPress. Deployed via rsync to Caddy server at 192.168.0.165.

## Writing Content

**Read `STYLE_GUIDE.md` before writing any content.** It captures Joe's personal voice, prohibited language, and formatting rules. Key rules:

- No em dashes - use regular dashes or rewrite
- No AI-sounding words (delve, realm, comprehensive, robust, etc.)
- First-person singular voice ("I", not "we")
- Opinionated, specific, honest about limitations

## Build & Deploy

```bash
npm run build      # Build static site
./deploy.sh        # Build + rsync to server
```

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
- Run `npm run format:check && npm run lint` before committing
- Both run in CI and will fail the build if issues are found

## CI/CD

- GitHub Actions CI runs on PRs + push to main (`.github/workflows/ci.yml`)
- 10 jobs: build, type check, lint/format, markdown lint, spell check, image validation, internal links (lychee), RSS/sitemap, accessibility (Pa11y), Lighthouse
- Weekly external link check (`.github/workflows/links.yml`)
- Config files: `.markdownlint.jsonc`, `cspell.json`, `cspell-custom.txt`, `.pa11yci.json`, `.lighthouserc.json`, `.lychee.toml`
- Validation scripts: `scripts/validate-images.sh`, `scripts/validate-feeds.sh`, `scripts/validate-caddyfile.sh`
- Run `npm test` locally to check: astro check, build, images, spelling, markdown lint
- Add new tech terms to `cspell-custom.txt` when spell check flags them

## Key Files

- `src/consts.ts` - Site title, URL, social links, nav links
- `src/content.config.ts` - Content collection schemas
- `src/components/BaseHead.astro` - SEO, fonts, analytics
- `src/layouts/BaseLayout.astro` - Page wrapper
- `src/layouts/BlogPost.astro` - Blog post layout
- `src/styles/global.css` - Global styles and prose classes
- `tailwind.config.mjs` - Theme colors, fonts
- `Caddyfile` - Server config, redirects, security headers
- `STYLE_GUIDE.md` - Writing voice and style reference

## Pages

- `/` - Homepage with interactive terminal
- `/blog` - Blog index, `/blog/[slug]` - Individual posts
- `/about`, `/work`, `/uses`, `/contact` - Static pages
- `/talk-archive`, `/privacy-policy` - Content pages
- `/rss.xml`, `/llms.txt`, `/llms-full.txt` - Machine-readable feeds
