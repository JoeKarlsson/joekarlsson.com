---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, AskUserQuestion
argument-hint: [optional post URL(s) to re-import]
description: Crosspost Joe's new CData blog articles (cdata.com/blog/author/joe-karlsson/) into src/content/blog with canonical URLs and local WebP images, then review the slug, humanize the prose in Joe's voice, redraw the diagrams in the site style, add memes, draw a metaphor thumbnail and pitch ten optional animations, all on one review page before it ships. Skips posts already imported.
---

# Import CData blog posts

Crosspost Joe's articles from https://www.cdata.com/blog/author/joe-karlsson/ into this site. Arguments (optional): $ARGUMENTS

**With no arguments, the import is automatic.** Scan the author page and import every post that isn't already here. Don't ask Joe which posts to import. If the scan finds nothing new, say so and stop. Arguments are only for re-importing specific URLs (see `--force` below). After the import, Joe answers two things: the slug (step 2) and the review page (step 9). Everything else is your call.

A crosspost is Joe's CData article republished with `canonicalUrl` pointing back at CData. It reads in Joe's voice and the site's look (steps 4-8), but it says what CData's page says: the same claims, facts, numbers, code, links and section order. Tell Joe about typos or errors that are also on CData's page so he can fix the original.

## 1. Import

```bash
git fetch && git status --short   # note anything uncommitted that isn't yours
npm run import:cdata -- --dry-run # scans the author page; lists new posts, skips any whose URL is already a canonicalUrl
npm run import:cdata              # imports them all
```

`scripts/import-cdata-posts.mjs` handles the mechanical work:

- It gets past cdata.com's Cloudflare challenge with headless **system Chrome** (curl and WebFetch get a 403 or a paraphrase). If Chrome isn't installed or the challenge changes, it fails loudly. Don't fall back to WebFetch for the body text, because it paraphrases.
- It writes `src/content/blog/{cdata-slug}.md` with `canonicalUrl`, `contentNotice`, and `faq` (from the `<details>` accordions), with dates from the byline.
- It downloads every image, hero included, to `public/images/blog/{slug}/` as WebP (1920px cap, quality 82). CData heroes are 300x245 transparent line art that disappears on this site's black cards, so the hero is centered at 2x on a 1200x675 off-white (`#f4f4f5`) canvas. That's only a placeholder: step 7 replaces it.
- It cleans up CMS markup: header-less tables, loose lists, link titles, zoom links around images, and alt text left as a stub with the real description pasted as a paragraph underneath.

Copy each new post to `<scratchpad>/{slug}.imported.md` right away. Step 9 diffs against it.

**Never overwrite an existing crosspost casually.** Existing ones carry hand edits. `--force` only works with explicit URLs, and it replaces the file wholesale:

```bash
npm run import:cdata -- --force https://www.cdata.com/blog/<slug>
```

Only do that when Joe asks for a re-import. A re-import keeps the local slug. Afterward, redo steps 3-9 for that post.

If another session has uncommitted work in the repo, leave it alone. Never run `git checkout -- .`, `git restore .`, or `git stash` to clean up. Restore only paths you created or changed.

## 2. Review the slug

The file takes CData's slug, and the post's URL becomes `/blog/{slug}`. CData's slug was written for CData's blog, where the product context is implied. Check it against this site's rules:

- **It stands alone.** A reader who has never heard of CData can tell what the post is about (2026-10-26: `muse` became `connect-business-apps-meta-muse`).
- **It carries the primary keyword** the post's title and H1 target, the way `/write-post` 1b puts it in the slug.
- **No year** unless the post is about a dated thing (`mcp-2026-07-28-release-explained` names a release). Evergreen posts lost their years on 2026-11-09, so a refresh only changes the title.
- **Short and plain**: 3-6 lowercase words with hyphens, no stop words or filler (`the`, `a`, `how-to-` when the keyword doesn't need it), and no `cdata` unless CData's product is the subject (`litellm-vs-cdata-connect-ai`).
- **No collision** with an existing file in `src/content/blog/` or a key in `astro.config.mjs` `redirects`.

If the slug passes, say so in the report and move on. If it doesn't, recommend one with a one-line reason, then ask Joe with AskUserQuestion before anything else uses the slug (diagrams, memes and thumbnails are all filed under it). Each question stands alone: name the post's title, the current slug, the recommended slug and why, recommended option first. One question per post, up to four in one call.

On a yes, rename the file, its image dir, the `slug` field and every image path in it. `canonicalUrl` keeps CData's URL. A post that is already live on this site (a `--force` re-import) also gets a redirect from the old path in `astro.config.mjs` `redirects`, next to the 2026-11-05 Meta Muse one.

## 3. Editorial pass, per new post

Read each post in full, then set:

- **`tags`**: replace CData's taxonomy slugs (`industry-insights`, `solutions-and-use-cases`, `data-management`, `cdata-connect-ai`) with topical tags. Examples: `mcp`, `ai`, `enterprise`, `ai-agents`, `tutorial`, `protocol`, plus a product tag when it's the subject (`litellm`, `meta-muse`). Keep `cdata` last.
- **`categories`**: the script defaults to `['AI']`, which fits most AI/MCP posts. Use `Cloud` for cloud infrastructure or security, or `Career` for posts about the job itself (see `proving-my-work-mattered.md`). Only the six in `BLOG_CATEGORIES` (`src/utils/categories.ts`) build.
- **`writtenFor`**: the script sets `'CData'`, which labels the post "Written for CData" and lists it on `/blog/written-for/cdata/`.
- **`tldr`**: 2-4 plain sentences in Joe's voice (read STYLE_GUIDE.md): the post's actual claims, specific, with no em dashes and no hype words. If the body opens with CData's own `**TL;DR:**` paragraph, move that text into `tldr` and delete it from the body, or the page shows two.
- **Image alt text**: `grep -o '!\[[^]]*' <file>` and fix any that are still stubs by looking at the image. Also grep for `cms.cdata.com`. Any hit is an image the importer failed to download.
- **Dropped embeds**: the importer prints `dropped embed, re-add by hand if needed: <src>` for every iframe. Re-add a YouTube video as a linked thumbnail (`[![alt](/images/blog/{slug}/video-thumbnail.webp)](https://www.youtube.com/watch?v=<id>)`, thumbnail from `img.youtube.com/vi/<id>/maxresdefault.jpg` as WebP). A CMS widget that only works on CData (like the Muse API-key generator) gets a link to the original post where the text refers to it.
- **Links to other crossposts**: a link to a CData post that's already crossposted here (its URL is some post's `canonicalUrl`) should point at the local `/blog/{slug}` instead.
- **Structure**: skim for anything the converter flattened, like a run of `**Label:** ...` pairs collapsed into one paragraph (turn it into a list), or stray HTML. Runs of bold-led step paragraphs ("**Sign up.** ...", "**Add your first app.** ...") become numbered lists.

## 4. Humanize the prose in Joe's voice

Run the `humanizer` skill (Skill tool) on the body, the `tldr`, the FAQ answers and the alt text, with STYLE_GUIDE.md as the voice: first-person singular, opinionated, specific, no em dashes, none of its banned words. CData's marketing register (hype words, "seamless", "unlock", stacked benefits, recap closers) is what this pass removes.

This is an edit, not a rewrite:

- Keep every claim, number, product name, link, code block, table and heading, in the same order. Section anchors and the FAQ questions stay as they are.
- Keep CData and Joe's coworkers in a positive light. No shrugs, no jokes at the company's expense.
- Don't invent first-hand experience the original doesn't have. "I" is fine where the post already speaks for Joe.

Then run `vale --minAlertLevel error` on the file and fix what it finds in the new wording. Vale toggles (step 10) are only for words that have to stay, like a product name.

## 5. Redraw the diagrams

Look at every image in the post. Any diagram (architecture map, flow, layer stack, before/after boxes, comparison chart drawn as boxes) gets redrawn through the project `diagrams` skill (Skill tool) in the site's cut-paper style, with real logos and a phone layout. Screenshots of real UI, photos and code stay as they are.

Follow the skill's workflow through step 3, its preview (`npm run diagrams -- <slug> --preview <scratchpad>/<slug>-diagrams.html`): the preview goes on the review page in step 9 instead of its own gate. After Joe approves, render, swap the images in the post for the SVGs, and delete the old diagram files. If the post has no diagrams, say so.

## 6. Memes, where a joke fits

Run `/write-post`'s **Meme generation step** (format rotation, a fresh `templates` sample, never a format from memory or the off-the-table list) for 1-2 memes per post. Each one jokes about a specific line in the post and sits after the point it's about, never in the first screen. If no joke fits, skip it and say so. The joke is never on CData, its customers or Joe's coworkers.

## 7. Thumbnail in the site's look

CData's hero art never ships here. Draw a new thumbnail by following `.claude/rules/metaphor-thumbnails.md`: a public-domain or CC0 photo from Wikimedia Commons that works as a metaphor for the post, in the site's pink-and-black filter, with a look (`flat` or `taped`) and mark that differ from its neighbors in the feed. Add it to `scripts/work-thumbnail-plan.json` and run `npm run thumbnails:work -- <slug>`, which sets `heroImage` and `heroAlt`. If a step 6 meme makes a better card, use it instead (`"picture": { "image": "/images/blog/<slug>/meme-....webp" }`). Never use a big employer logo or CData's stock art. Read the card: if the subject is cut off or the photo turns to mud, fix it before the review.

## 8. Ten animation ideas

Pitch ten animations Joe could add to the post. They are optional: he picks any number, or none, at step 9. Read the `explainers` skill and its `references/craft.md` first, and pitch the way its gate 1 says: each idea is a change the viewer watches happen at a moment where the post lands a punch (the reveal, the turn, the cost, the payoff), never a picture of a routine point.

Ten is more than the skill's usual two or three, on purpose: Joe wants a menu for crossposts. Rank them by how hard the moment hits. Mix the two kinds:

- **Collage scenes** (`explainers`): cut-out photos built piece by piece on a flat field.
- **Animated figures** (`diagrams`, "Animated figures"): a small kit animation that shows how something in the post works.

Each idea is a numbered card with a storyboard strip (one small inline-SVG frame per beat on the scene's field color), then the claim from the post, the object that performs it, the pieces and where they'd come from, the field color, and the label. Note the paragraph it would sit under. Don't cut or render anything yet.

## 9. Joe's review

Build one HTML page per post at `<scratchpad>/<slug>-import-review.html` in the site's look (black ground, pink, chalk, Anton and Hanken), with numbered sections:

1. **Slug**: the final URL, and the step 2 decision.
2. **Prose**: a short list of what the humanizer pass changed most (5-10 before/after lines).
3. **Diagrams**: each old image beside its redrawn preview.
4. **Memes**: each meme with the line it jokes about.
5. **Thumbnail**: the card, the metaphor in one line ("a toll gate: every request pays at one gate") and the Commons link.
6. **Animation ideas**: the ten cards, numbered 1-10.

Open the page in the browser yourself (`open <file>`) and open the full prose diff in VS Code (`code --diff <scratchpad>/{slug}.imported.md src/content/blog/{slug}.md`). Then ask with AskUserQuestion, each question standing alone: whether the diagrams, memes, thumbnail and prose are good to ship (yes, or what to change), and which animation ideas to build by number, or none. Fix what he names and show the changed parts again before moving on.

## 10. Lint

```bash
F=(src/content/blog/{slug-a,slug-b}.md)   # zsh: use an array, "$F" won't word-split
npx prettier --write $F
npx markdownlint-cli2 $F
npx cspell $F --no-progress
vale --minAlertLevel error $F               # CI runs this on changed posts
```

- **cspell**: product and person names are real. Append them to `cspell-custom.txt`. Fix genuine typos in the post instead.
- **vale**: after step 4, most hits should be gone. Words that must stay (`Bedrock` the AWS product, a product's own name) get a rule-specific toggle, each comment on its own line with blank lines around it, outside any table:

  ```markdown
  <!-- vale JoeKarlsson.BannedWords = NO -->

  ...the paragraph or whole table...

  <!-- vale JoeKarlsson.BannedWords = YES -->
  ```

  Vale's line numbers skip frontmatter, so find the block by its text. Anything else gets reworded, not toggled.

## 11. Verify, ship

```bash
npm test          # format, lint, types, build, images, spelling, markdown, unit
```

Then check the rendered pages in `dist/blog/{slug}/index.html`: canonical link, hero, tables, diagrams at 1280px and 390px, and FAQ.

Commit only your paths (the posts, their image dirs, `scripts/diagrams/<slug>/`, `scripts/work-thumbnail-plan.json`, `cspell-custom.txt`, any `astro.config.mjs` redirect) as `feat: Crosspost N CData blog posts`, then push, then `npm run deploy`. Then verify live:

- curl each post URL and check for a 200 and the canonical tag.
- Fetch each `thumb-<hash>.webp` hero on its **plain URL** (no `?query`, which skips caches and proves nothing) and confirm a 200 and `1200 675`.

The animations Joe picked don't hold up the post. Build each through the `explainers` skill's gates 2-4 (or the `diagrams` skill for an animated figure), and ship them in a follow-up commit and deploy.

**Never replace an image in place under a URL that has already been published.** Browsers cache images for about 4 hours, and on 2026-09-30 Cloudflare kept serving the old heroes on their plain URLs even after a successful purge-everything. When an already-live image changes, give it a new filename and update the frontmatter. Thumbnails already handle this: `npm run thumbnails:work` names each card after a hash of its bytes.

In the report, list what was imported and skipped, each post's slug decision, what was redrawn and added, the animations Joe picked, and any content problems on CData's side that Joe may want to fix at the source (typos, broken formatting, factual oddities).
