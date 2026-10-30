---
paths:
  - 'package.json'
  - 'package-lock.json'
  - '.lychee.toml'
  - '.github/workflows/deps.yml'
  - '.github/workflows/links.yml'
---

# Dependencies

## Lockfile and npm versions

- CI uses the npm 10 bundled with Node 22. npm 12 can write a lockfile that npm 10's `npm ci` rejects (it dropped puppeteer's nested proxy-agent tree). After changing dependencies, regenerate with `npx npm@10 install --package-lock-only --ignore-scripts`; npm 12 accepts the result too. The pre-push hook checks this.
- npm 12 blocks install scripts unless they're listed in `allowScripts` in `package.json`. puppeteer (downloads headless Chrome for pa11y, Lighthouse, resume PDF) and fsevents are approved by name, so version bumps don't re-block them.

## Weekly CI issues

- `deps.yml` (Mondays) opens "Outdated npm dependencies detected" and "npm security vulnerabilities detected" issues. Re-check after a fix with `gh workflow run deps.yml`. Despite `update-existing: true` it has opened a new issue while an old one was open, so close duplicates by hand. The security issue auto-closes when `npm audit` runs clean.
- `links.yml` (weekly) opens "Broken external links detected" issues for 404/timeout/503 URLs.
- CI's audit gate is `npm audit --omit=dev` (`.github/workflows/ci.yml`), so dev-only advisories never fail CI.

## Not-actionable audit items

Don't try to force-fix these:

- `esbuild` CVE - Windows-only dev server issue, needs Astro v8+.
- `brace-expansion` GHSA-mh99-v99m-4gvg (dev-only, via `pa11y-ci` and `serve` through `minimatch@3`). Overriding to `^5` silently breaks brace patterns: v5's CJS entry exports an object, so minimatch 3 throws `expand is not a function`. `npm test` never exercises pa11y-ci or serve, so it won't catch the break.
- `extract-zip` <=2.0.1 (dev-only via `@lhci/cli` > `lighthouse@12.6.1` > `@puppeteer/browsers@2`), only unzips Chrome from Google's CDN. The real fix is `@puppeteer/browsers` 3.x, but don't override it in: Lighthouse isn't exercised by `npm test` either. Dismissed as tolerable risk 2026-10-28; recheck when `@lhci/cli` moves past lighthouse 12.6.1.
- `typescript` 7 - blocked by `@astrojs/check`, which peers on `^5 || ^6`, so `typescript` stays pinned at `^6`.

Prefer `overrides` in `package.json` over `npm audit fix` when audit fix would downgrade a package (it once tried to take `@lhci/cli` from 0.15 to 0.6).

## CI tool installs

Vale is pinned via `VALE_VERSION` in `ci.yml` because its release assets are versioned, so a `latest/download/` URL 404s. Bump the pin by hand. Any `apt-get install` step needs `apt-get update` first, or a stale runner index 404s.

## Lychee exclusions

`.lychee.toml` excludes domains that are alive but hostile to automated checkers. Prefer deleting a genuinely dead link over adding an exclusion: an exclusion hides it from CI but still ships a broken link to readers.
