# Brand

My logo and icons, as files to use anywhere: slides, avatars, stickers, video, other sites.
Open `index.html` in a browser to see every version moving, with links to each file.

## The logo

Pink Anton capitals with a hand-wobbled outline knocked up and to the left, like a misprint
(pick 22 from round four). The outline boils through three wobble frames, the same way links
on the site do.

- **Pink** `#ff4fd8`, **ink** `#000`, **paper** `#ededed`
- **Type**: Anton (`source/Anton-Regular.ttf`, SIL Open Font License in `source/Anton-OFL.txt`)

## What's here

```text
logo/svg/{style}/{mark}-{theme}.svg            static
logo/svg/{style}/{mark}-{theme}-animated.svg   boils; plays in browsers, even in an <img>
logo/png/{style}/{mark}-{theme}.png            static, big (1024 to 2000px wide)
logo/animated/{style}/{mark}-{theme}.webp      animated, for slides, READMEs, chat
logo/animated/{style}/{mark}-on-*.gif          the same as GIF, solid backgrounds only
explorations/round-{1..4}.html                 the option pages that led to the logo
```

- **Marks**: `jk`, `name` (JOE KARLSSON on one line), `stacked` (JOE over KARLSSON)
- **Themes**: `on-black`, `on-pink`, `for-dark` (transparent, dark backgrounds),
  `for-light` (transparent, light backgrounds)
- **Styles**: `off-register` is the logo. `off-register-sparkles` adds twinkling sparkles
  (36) for fun spots. `heavy-wobble` (33) has a thick, loose line that reads from a distance.

The letters are outlines, not text, so the files look the same with no fonts installed.

## Where the site uses it

- Nav: `JOE KARLSSON` from tablet width up, `JK` on phones (`src/components/Logo.astro`)
- Favicons in `public/`, written by the same script
- Footer sign-off, the end of every blog post, newsletter issue cards, the default share image

## Changing it

Edit `scripts/generate-brand.mjs`, then `npm run brand`. It redraws everything here and the
favicons. Don't hand-edit the files in `logo/` or `index.html`; the next run overwrites them.
