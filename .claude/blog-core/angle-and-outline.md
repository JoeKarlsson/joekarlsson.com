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

**What a hook is (Joe, 2026-11-19):** a question or a statement, and the rest of the piece answers that question or proves that statement. For a post that means the intro poses the reader's question (angle block line 1) or states the thesis (line 2), and every section is a step toward the answer or a piece of evidence for the claim. A section that does neither gets cut or moves to the repo docs. It's looser than in a social post: the question can be implied by the problem the intro describes instead of asked word for word, and the statement can take the whole first paragraph to land instead of one line. The ending settles it: the answer, or what the claim means now that it's proven. Examples:

- Question: "Why does my agent have to read every table just to answer one question about a customer?" The post answers it: what the agent pulls today, what changes when it doesn't have to, and how to set that up.
- Statement: "I could have bought a Pixoo, but it couldn't do what I wanted, so I built PixelPane." The post proves it: what the Pixoo does, where it fell short for Joe, what the build does instead.

Write the opening paragraph two or three ways (A, B, C), each a real draft paragraph, not a description of one, and recommend one. Mix the two kinds across options. Each option:

- Opens on the reader's question or the thesis from the angle block, then says what they will have or know by the end.
- Is not the demo's example. The example arrives after the problem is set, labeled as the example.
- Is not a definition, a teaser, a warm-up or a stat with no point. A question is fine when the post answers it; a rhetorical question the post never answers isn't.
- A question names exactly what's missing, so the reader can see the gap (Golman and Loewenstein, CMU, 2021). For an essay, the strongest question is about something developers take for granted (Paul Graham, "The Best Essay": "merely having questions about something other people take for granted can be edge enough").
- A statement opens on what broke or what happened, not a warning ("Is your agent leaking data?"). In about 105,000 Upworthy headline tests, negative words raised clicks and fear and hype words lowered them (Robertson et al., Nature Human Behaviour, 2023).
- **Bug hunts are the one place to hold the answer back** (Sarna and Dunlop, *Writing for Developers*). Most posts give the conclusion up front; a debugging story opens on the symptom and keeps the cause for the end, and its TL;DR names the symptom and the fix area without spoiling the cause. Example from Joe's own Mac: "Every few days my Mac's internet died and every app hung. It wasn't the Wi-Fi."
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
