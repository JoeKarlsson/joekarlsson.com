---
paths:
  - 'public/images/**'
  - 'scripts/convert-*'
  - 'scripts/resize-webp.mjs'
  - 'scripts/validate-images.sh'
  - 'src/plugins/rehype-*.mjs'
---

# Images

Stills are WebP; animations are MP4. A raw GIF or animated WebP over 256KB fails validation.

## Automatic conversion

Drop the raw PNG/JPG/GIF in `public/images/blog/{slug}/`, reference it normally, and commit. The pre-commit hook runs `scripts/convert-staged-images.sh`, which converts anything staged under `public/images`:

- **PNG/JPG** -> WebP via `scripts/convert-images-to-webp.mjs`, which also repoints every reference across `src/`. Rewritten files are staged for you, unless they already had unstaged edits - then the commit stops so you can review.
- **GIF at/over 256KB** -> gains an `.mp4` sibling via `scripts/convert-gifs-to-video.sh` (requires `ffmpeg`; without it you get a warning and pre-push fails instead). Markdown keeps referencing the `.gif`; `src/plugins/rehype-gif-video.mjs` swaps in a `<video>` at build time. Smaller GIFs are left alone.
- **Animated WebP at/over 256KB** -> same treatment via `scripts/convert-animated-webp-to-video.mjs`. Still WebP is left alone; the two are told apart by the `ANIM` chunk in the RIFF header. ffmpeg cannot decode animated WebP at all ("image data not found"), so frames come out through sharp and go into ffmpeg as a concat list carrying each frame's delay.

Only an `.mp4` sibling makes the plugin swap an `<img>` for a `<video>`, which is what keeps the site's ~770 still WebPs untouched.

To convert by hand (whole tree or specific paths):

```bash
node scripts/convert-images-to-webp.mjs [--dry-run] [paths...]
./scripts/convert-gifs-to-video.sh --min 256 [--dry-run] [paths...]
node scripts/convert-animated-webp-to-video.mjs --min 256 [--dry-run] [paths...]
```

## Astro caching gotcha

`rehype-gif-video` probes the filesystem, which Astro does not track as a dependency of the markdown it caches. Converting an animation without clearing `node_modules/.astro` makes the next build re-emit `<img src="...gif">` for a file that no longer exists. Both video converters clear that cache themselves, `validate-images.sh` fails on any built `<img>`/`<video>` whose source is missing from `dist/`, and `deploy.sh` runs that check before shipping. CI never hits this (cold cache); local `./deploy.sh` would have.

## Size gates

Gates in `validate-images.sh` are all ratchets - tighten them as the backlog shrinks, never loosen:

- `MAX_IMAGE_KB=500` - hard fail. Worst offender is currently 424KB (as of 2026-10-30).
- `MAX_NON_WEBP=0` - any PNG/JPG under `public/images` fails.
- `GIF_MP4_MIN_KB=256` - any GIF or animated WebP at/over this with no `.mp4` sibling fails.
- Over 200KB warns only. 14 images sit there (as of 2026-10-30), all genuine stills.

## Resizing

`convert-images-to-webp.mjs` only reads PNG/JPG, so a file that arrived already as `.webp` never had the 1920px cap or quality setting applied to it. `blog/running-devrel-2026/hero.webp` is 2240px wide for that reason, deliberately left full size.

To cap an existing WebP's dimensions, `scripts/resize-webp.mjs` re-encodes in place. It requires explicit paths - some images are deliberately large, and only you know which:

```bash
node scripts/resize-webp.mjs --max-width 1200 [--quality 82] [--dry-run] <paths...>
```

Check what the page actually renders at before picking a width. The crop-art gallery on `/about` declares `width="300"` with `object-cover` and links out to cropart.com rather than to a full-size image, so 1200px is already generous there.
