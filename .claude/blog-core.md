# Blog writing core

This repo owns the blog-writing core: the craft rules and review agents every blog workflow Joe runs is built on. joekarlsson.com's `/blog-new` uses all of it. Joe's other blog setups are adaptations: the CData repo (`~/Documents/dev/cdata/skills`) reads these files by absolute path, keeps only its CData-specific rules, and runs a drift check (`scripts/blog_core_drift.py` there) before each new post, which lists the core commits since each adaptation was last reviewed. Joe's decision, 2026-11-18: "have my website own the blog writing core and then we adapt it and put the adaptions in the CDATA directory only."

## How an adapter reads a core file

- Paths inside core files are relative to this repo's root.
- Skip every section marked personal site only: an H2 named **Personal site only** (it runs to the next H2), or a `> Personal site only` line right under a heading (that heading's section). In `.claude/commands/blog-new.md`, which is mostly the personal workflow, it's the reverse: only sections marked `> Core craft` apply.
- The adapter's own voice authority wins over the core's voice and prohibited-language rules (for CData posts, `mktg-brand-voice`).
- Never copy core text into an adapter. Link the file and section, and write only what differs.

## Changing the core

Generic craft (a lesson that would hold on any blog) goes here, in a joekarlsson.com worktree; a site-specific rule goes in that site's section or adapter. Renaming a core heading breaks adapters that link it, and the CData drift check reports it.

## Core files

| File | What it covers | Adapters may override |
|---|---|---|
| `.claude/blog-core/angle-and-outline.md` | Show-then-ask gates, the angle block, hook options and the stranger test, outline format, outline checks | Outline file path, header phrasing (search phrasing for SEO posts) |
| `.claude/blog-core/length.md` | Word budget at the outline gate, the cut pass, every addition pays for itself | Default budgets and ceiling, the word-count command |
| `.claude/blog-core/humanizer-pass.md` | When the humanizer runs, what's locked, rhythm unlocked, revision rounds, report format | Extra locked structure, the voice sample |
| `.claude/blog-core/demo-and-how-to-posts.md` | Lead with the demo, posts built on a demo, default path first, define and link at first mention, recap don't dump, prompt priming, the author's own take | How the site's own product is named and linked |
| `.claude/blog-core/visuals.md` | Visuals planned at the outline gate and shown with the draft, supporting materials, screenshots and clips, animations, diagrams, charts, interactive embeds | Tools that render them, file formats, column width, palette |
| `.claude/blog-core/sourcing.md` | Inline primary sources, competitor docs, dated snapshots, exact quotes, link checks, cut what can't be verified | Citation markup, a site's references rules |
| `STYLE_GUIDE.md` | Core: **Headers**, **Structure**, **Lists**, **Moves that read as AI even in my voice**, **Prohibited Language**, **Technical Writing Patterns** (incl. **Writing About Infrastructure and Technical Decisions**, **Writing research posts**, **Honesty About Limitations**), the stranger reread | Prohibited language and voice (adapter's voice authority wins) |
| `.claude/commands/blog-new.md` | Core craft sections only: **Analytical structure (Thompson / McKenzie)**, **Anti-AI structural patterns (CRITICAL)**, **4c. Sentence craft**, **4d. Specificity Check** | Everything else is the personal workflow |
| `.claude/agents/blog-competitor-analyst.md` | SERP and gap analysis | Competitor exclusions, query variations |
| `.claude/agents/blog-source-researcher.md` | Current versions, names and dates | Product naming sources |
| `.claude/agents/blog-positioning-reviewer.md` | Whitespace, thesis, hook and scope, POV, consistency | Product fit and positioning framework |
| `.claude/agents/blog-fact-checker.md` | Claims, commands, links, numbers that agree | Own-site link checks |
| `.claude/agents/blog-voice-reviewer.md` | Analytical structure, AI-pattern audit, sentence craft | Layer 1 voice rules and voice sample |
| `.claude/agents/blog-seo-aeo-reviewer.md` | SEO, AEO extractability, closing | Meta limit, required structure, CTA, internal-link method |
| `.claude/agents/blog-eeat-reviewer.md` | Originality, author signal, sourcing, freshness, honest limitations | What counts as the original element, byline |
| `.claude/agents/blog-headline-tester.md` | Title ranking and angles | Title length and suffix rules |

Personal site only, with no core part: `.claude/agents/blog-internal-link-scout.md`, the `diagrams`, `explainers` and `blog-to-newsletter` skills, `.claude/rules/embeds.md`, `.claude/rules/images.md`, `.claude/rules/metaphor-thumbnails.md` and `DECISIONS.md`.
