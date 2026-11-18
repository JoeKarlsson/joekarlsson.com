# Angle, hook and outline

Core file (`.claude/blog-core.md`). The hook, the thesis and the scope are decided at the outline gate, in writing, before a word of the draft exists. Review passes can't fix them later. On 2026-11-18 a tutorial passed fact-check, voice, SEO/AEO, positioning, E-E-A-T, flow, a tutorial run and the humanizer, and Joe still rejected it: "the hook sucks", 3,100 words was "way too long", and it framed the whole post around the demo's leaked Social Security number, "missing the forest for the trees." The revision that worked set these first.

## Show it, then ask

Write what Joe approves at each gate to a file and open it on his screen before asking: text he edits (the pitch, the outline, the draft) with `code`, anything visual as a local HTML page with `open`. A chat summary or a question box is not something he can review. He answers hook options by letter and visuals by number.

## The angle block

Five lines at the top of the outline file, one sentence each:

1. **Reader and their real problem.** Who reads this and the problem or question they bring, in their words (a cost, a failure, access they can't grant, a thing that keeps breaking). When Joe gave his own description (a talk abstract, a ticket brief, a message, his notes on why he built it), build from it; it beats the volume of notes or the demo's detail. Ask what matters to him rather than inferring priority from what the notes spend the most words on.
2. **Thesis.** The one claim the reader knows by the end of the intro, stated plainly enough that someone could disagree. Lead with the conclusion (`.claude/commands/blog-new.md`, **Analytical structure**).
3. **What it adds.** What this post has that none of the top results from research do. If there's no sentence to write, say so and suggest dropping the post or narrowing it to what is new.
4. **Scope.** What range the post covers, and the demo's example named as "the example for this post" (`demo-and-how-to-posts.md`, **Posts built on a demo**).
5. **Word budget.** From `length.md`, with any reason to exceed the site's ceiling for Joe to approve.

The thesis, "what it adds" and scope lines start from `blog-positioning-reviewer`'s OUTLINE-mode read (its proposed thesis, whitespace and scope check). Where the outline departs from it, say why in the angle block.

## Hook options

Write the opening paragraph two or three ways (A, B, C), each a real draft paragraph, not a description of one, and recommend one. Each option:

- Opens on the reader's problem or question from the angle block, then says what they will have or know by the end.
- Is not the demo's example. The example arrives after the problem is set, labeled as the example.
- Is not a definition, a rhetorical question, a teaser, a warm-up or a stat with no point.
- Varies the framing, not just the wording: the failure the reader fears, the cost or time they lose today, the question they keep asking.

**Test each option as a stranger:** someone who has never seen the demo, the talk or Joe's setup reads only this paragraph. Do they know what problem it solves, whether it's theirs, and what they'll get? Would they read the second paragraph?

Skip the hook options when Joe brings his own written draft: it has its hook.

## Outline format

Per H2, in the order the reader needs them:

- Two to four bullets with the section's points.
- Where a first-hand beat goes (Joe's experience as evidence), where code or config goes, and which claims need a source.
- The numbered visual marks (`visuals.md`, **Visuals travel with the text**).
- A word budget. Section budgets add up to the post's budget and differ visibly; not every section is three paragraphs.

## Check the outline before showing it

- **Headers only.** Cover the bullets and read the H2s alone: do they give the gist of the post? Each says what's in the section or states its answer, with no teasers, and most are short plain labels; a claim header in one or two sections at most (`STYLE_GUIDE.md`, **Headers**).
- **Story, not encyclopedia.** It reads as one problem moving to a result, not a tour of features.
- **The demo is the spine, not the scope.** Without the example, does the outline still cover the range the title promises?
- **Sections vary in length.** Not every section is the same size.
