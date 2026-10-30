---
paths:
  - 'Caddyfile'
  - 'src/scripts/scale-to-fit-embed.ts'
  - 'src/content/blog/**'
---

# Iframe embeds

The CSP `frame-src` allows only YouTube, TikTok and `cdatasoftware.github.io`. A new embed origin is blocked silently in production (local dev and preview have no CSP, so it looks fine there). Add the origin to `frame-src` in `~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl` (deployed) and in this repo's `Caddyfile` (reference), then deploy. `tests/build-output.test.ts` fails on any built iframe whose origin the `Caddyfile` doesn't allow, and `validate-caddyfile.sh` (run by `deploy.sh`) fails if the two CSPs differ.

For an embed that refuses to run below a minimum window size (the Connect AI × DOOM web build needs 900x560), give the iframe `data-native-width`/`data-native-height` inside an `aspect-video overflow-hidden` wrapper. `src/scripts/scale-to-fit-embed.ts` renders it at that size and scales it down to fit.
