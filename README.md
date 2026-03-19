# joekarlsson.com

[![CI](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/ci.yml/badge.svg)](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/ci.yml)
[![External Links](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/links.yml/badge.svg)](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/links.yml)
[![Dependency Health](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/deps.yml/badge.svg)](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/deps.yml)

Personal website and blog for Joe Karlsson - software engineer, developer advocate, and homelab enthusiast.

Built with [Astro](https://astro.build) 6, Tailwind CSS 4, and MDX.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server at localhost:4321
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Testing

Run the full local test suite (format, lint, type check, build, and all validations):

```bash
npm test
```

### Individual Test Commands

| Command                     | What it checks                                                            |
| --------------------------- | ------------------------------------------------------------------------- |
| `npm run format:check`      | Prettier formatting                                                       |
| `npm run lint`              | ESLint (TypeScript + Astro)                                               |
| `npm run check`             | Astro type checking                                                       |
| `npm run test:images`       | WebP format, file sizes, heroImage references                             |
| `npm run test:spelling`     | Spell check on blog posts (cspell)                                        |
| `npm run test:markdown`     | Markdown lint on blog posts                                               |
| `npm run test:build-output` | Vitest: robots.txt, sitemap, RSS, llms.txt, SEO meta tags, webmanifest    |
| `npm run test:content`      | Vitest: blog post frontmatter validation (title, date, slug, description) |
| `npm run test:unused`       | Knip: unused dependencies, exports, and files                             |
| `npm run test:feeds`        | RSS and sitemap XML validation                                            |
| `npm run test:caddyfile`    | Security headers in Caddyfile                                             |
| `npm run test:links`        | Internal link check (lychee, requires build)                              |
| `npm run test:a11y`         | Accessibility - WCAG2AA with axe (Pa11y, requires running server)         |
| `npm run test:lighthouse`   | Lighthouse CI - performance, a11y, best practices, SEO                    |
| `npm run test:outdated`     | Check for outdated npm packages                                           |

### CI Pipeline

GitHub Actions runs **15 jobs** on every push to main and every PR:

1. Build & Type Check
2. Markdown Lint
3. Spell Check
4. Lint & Format
5. Image Validation
6. Internal Link Check
7. RSS & Sitemap Validation
8. Accessibility (Pa11y)
9. Lighthouse CI
10. Security Headers Check
11. Build Output Tests (Vitest)
12. Content Schema Validation (Vitest)
13. Unused Dependencies & Exports (Knip)
14. Security Audit (advisory)
15. Failure Notification (ntfy)

### Scheduled Workflows

- **Weekly external link check** (Sundays) - opens GitHub issue if broken links found
- **Weekly dependency health** (Mondays) - opens GitHub issues for outdated packages and security vulnerabilities

## Deploy

The site is self-hosted on a Proxmox LXC container running Caddy. Deploy with:

```bash
./deploy.sh
```

This builds the site, rsyncs to the server, updates the Caddyfile, reloads Caddy, and purges the Cloudflare cache.

## Tech Stack

- **Framework**: Astro 6
- **Styling**: Tailwind CSS 4
- **Content**: MDX blog posts via Astro Content Collections
- **Hosting**: Caddy on Proxmox LXC behind Cloudflare
- **Testing**: Vitest, ESLint, Prettier, Pa11y, Lighthouse CI, cspell, markdownlint, Knip, lychee
- **CI/CD**: GitHub Actions (15 jobs)

## Project Structure

```
src/
  content/blog/    # Blog posts (Markdown/MDX)
  components/      # Astro components
  layouts/         # Page layouts
  pages/           # Route pages
  styles/          # Global CSS
  consts.ts        # Site config (title, URL, nav links)
  env.d.ts         # TypeScript declarations
public/
  images/blog/     # Blog post images (WebP)
tests/             # Vitest test files
scripts/           # Validation and utility scripts
```

## License

Content (blog posts, images) is copyright Joe Karlsson. Source code is MIT.
