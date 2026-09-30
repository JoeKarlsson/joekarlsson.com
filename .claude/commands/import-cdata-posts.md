---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: [optional post URL(s) to re-import]
description: Crosspost Joe's new CData blog articles (cdata.com/blog/author/joe-karlsson/) into src/content/blog with canonical URLs, local WebP images, FAQ schema, and a frontmatter/lint pass. Skips posts already imported.
---

# Import CData blog posts

Crosspost Joe's articles from https://www.cdata.com/blog/author/joe-karlsson/ into this site. Arguments (optional): $ARGUMENTS

**With no arguments, this is fully automatic.** Scan the author page, import every post that isn't already here, run the editorial pass and lint, then commit, push, and deploy. Don't ask Joe which posts to import. If the scan finds nothing new, say so and stop. Arguments are only for re-importing specific URLs (see `--force` below).

A crosspost is Joe's CData article republished with `canonicalUrl` pointing back at CData. Keep the body faithful to the original. Only change it where site rules require (em dashes, lint), where the CMS mangled something, or to fix an obvious typo that's also on CData's page (tell Joe about those so he can fix the original).

## 1. Import

```bash
git fetch && git status --short   # note anything uncommitted that isn't yours
npm run import:cdata -- --dry-run # scans the author page; lists new posts, skips any whose URL is already a canonicalUrl
npm run import:cdata              # imports them all
```

`scripts/import-cdata-posts.mjs` handles the mechanical work:

- It gets past cdata.com's Cloudflare challenge with headless **system Chrome** (curl and WebFetch get a 403 or a paraphrase). If Chrome isn't installed or the challenge changes, it fails loudly. Don't fall back to WebFetch for the body text, because it paraphrases.
- It writes `src/content/blog/{cdata-slug}.md` with `canonicalUrl`, `contentNotice`, and `faq` (from the `<details>` accordions), with dates from the byline.
- It downloads every image, hero included, to `public/images/blog/{slug}/` as WebP (1920px cap, quality 82). CData heroes are 300x245 transparent line art that disappears on this site's black cards, so the hero is centered at 2x on a 1200x675 off-white (`#f4f4f5`) canvas. That also stops the 16:9 card crop from cutting it off.
- It cleans up CMS markup: header-less tables, loose lists, link titles, zoom links around images, and alt text left as a stub with the real description pasted as a paragraph underneath.

**Never overwrite an existing crosspost casually.** Existing ones carry hand edits. `--force` only works with explicit URLs, and it replaces the file wholesale:

```bash
npm run import:cdata -- --force https://www.cdata.com/blog/<slug>
```

Only do that when Joe asks for a re-import. Afterward, redo step 2 for that post.

If another session has uncommitted work in the repo, leave it alone. Never run `git checkout -- .`, `git restore .`, or `git stash` to clean up. Restore only paths you created or changed.

## 2. Editorial pass, per new post

Read each post in full, then set:

- **`tags`**: replace CData's taxonomy slugs (`industry-insights`, `solutions-and-use-cases`, `data-management`, `cdata-connect-ai`) with topical tags. Examples: `mcp`, `ai`, `enterprise`, `ai-agents`, `tutorial`, `protocol`, plus a product tag when it's the subject (`litellm`, `meta-muse`). Keep `cdata` last.
- **`categories`**: the script defaults to `['Dev Tools']`, which fits most AI/MCP posts. Use `DevRel` or `Career` for posts about the job itself (see `proving-my-work-mattered.md`). Pick from the list in CLAUDE.md.
- **`heroAlt`**: CData's hero alt is just the title. Look at `hero.webp` (convert it to PNG with sharp and Read it) and describe the graphic.
- **`tldr`**: 2-4 plain sentences in Joe's voice (read STYLE_GUIDE.md): the post's actual claims, specific, with no em dashes and no hype words.
- **Image alt text**: `grep -o '!\[[^]]*' <file>` and fix any that are still stubs by looking at the image.
- **Structure**: skim for anything the converter flattened, like a run of `**Label:** ...` pairs collapsed into one paragraph (turn it into a list), or stray HTML.

Don't rewrite CData's prose into Joe's personal-blog voice. It's a crosspost.

## 3. Lint

```bash
F=(src/content/blog/{slug-a,slug-b}.md)   # zsh: use an array, "$F" won't word-split
npx prettier --write $F
npx markdownlint-cli2 $F
npx cspell $F --no-progress
vale --minAlertLevel error $F               # CI runs this on changed posts
```

- **cspell**: product and person names are real. Append them to `cspell-custom.txt`. Fix genuine typos in the post instead.
- **vale**: in a crosspost, hits are usually false positives in CData's wording (`Bedrock` the AWS product, "testing harness", "as an AI project"). Don't reword CData's text to dodge them. Wrap the block in a rule-specific toggle, each comment on its own line with blank lines around it, outside any table:

  ```markdown
  <!-- vale JoeKarlsson.BannedWords = NO -->

  ...the paragraph or whole table...

  <!-- vale JoeKarlsson.BannedWords = YES -->
  ```

  Vale's line numbers skip frontmatter, so find the block by its text. Genuine AI-slop in Joe's own additions (tldr, alt text) gets rewritten, not toggled.

## 4. Verify, ship

```bash
npm test          # format, lint, types, build, images, spelling, markdown, unit
```

Then check the rendered pages in `dist/blog/{slug}/index.html`: canonical link, hero, tables, and FAQ.

Commit only your paths (the posts, their image dirs, `cspell-custom.txt`) as `feat: Crosspost N CData blog posts`, then push, then `npm run deploy`, then curl each live URL and check for a 200 and the canonical tag.

In the report, list what was imported and skipped, plus any content problems on CData's side that Joe may want to fix at the source (typos, broken formatting, factual oddities).
