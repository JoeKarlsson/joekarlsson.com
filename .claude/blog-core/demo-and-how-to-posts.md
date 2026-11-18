# Demo, how-to and build posts

Core file (`.claude/blog-core.md`). Rules for posts where the reader follows along: tutorials, how-tos, build stories and talk recaps built on a demo. The general technical-writing moves (explain the why before the code, every spec gets a because, a specific case before the general rule, building a system up from the naive version, concede the obvious objection) are in `STYLE_GUIDE.md`, **Technical Writing Patterns**.

## Lead with the demo

When the post has something the reader can try or watch (an embed, a short clip of it working, the finished result), put it right after the intro, before any backstory. Why: placing it after "How it works" buried the lead on the DOOM post.

## Posts built on a demo

A talk recap or a tutorial built from a demo repo has one worked example (a leaked Social Security number, one Salesforce table). **The example is the spine, not the scope:** it carries the steps from start to result, and the hook, intro and framing speak to the reader's broad problem and the whole range of what the tool does.

- **Introduce the example after the problem**, labeled as "the example for this post", never as the opening or the frame.
- **Add a short breadth section** after the main path ("What else you can set", "Other policies you can apply"): three or more other cases the same setup handles, one or two lines each, so the post doesn't read as if the demo is all the tool does.
- **One plain scope sentence** where it helps the reader decide: what the post covers and what it leaves out ("This post uses one masking rule; the same policy screen sets rate limits and failover"). A label, not an apology.
- **Show a claim the reader will doubt.** "No code changes" or "one line of config" gets the real code or config next to it, not only the sentence.

Why: on 2026-11-18 Joe rejected a guardrails tutorial that kept returning to the leaked Social Security number: "you're missing the forest for the trees... it makes it feel like you're artificially limiting what's possible." The approved revision opened on the reader's production problem, kept the example as the running thread, added a breadth section and showed the code behind its "no code changes" claim. Set this at the outline gate (`angle-and-outline.md`).

## Default path first, optional extras next, troubleshooting last

A how-to or build post follows the order a developer works in:

1. **The stock setup that works.** The default install and configuration, no customization, ending in a visible first success (the output, the agent's answer, a screenshot of the result). A reader who stops here has something working.
2. **Customization as clearly optional extras**, after the default path, each in its own labeled section or H3 ("Optional: limit the tools the agent can call") that says what it adds and when you'd want it. Never fold an option into a default step.
3. **Troubleshooting and gotchas at the end**, or one link to the official troubleshooting docs. A warning goes inline only when skipping it breaks the very next step.

## Define and link at first mention

The first time the post names a product, tool, protocol or standard, give it a short defining clause and link it to its docs right there. Later mentions stay plain. A links section never replaces the first-mention link: a reader who lands mid-post, or an answer engine quoting one section, needs the term explained where it appears. Define only what the reader needs to follow the build: why a setting matters if the build depends on it, not what an API is.

## Recap, don't dump

Each section lands one idea with one piece of evidence and at most one short code sample. Recap what the author ran and tell readers how to run their own version; don't re-run his benchmarks in the post. A first-hand recap counts as original data. Cut timings, every config field, alias tables, setup walkthroughs, caveat stacks and full data tables unless the reader needs them to decide or to succeed; every number needs a reason the reader cares. One number per point, rounded. Skip table-stakes features and show what's special. Why: Joe called a draft with an alias table and a setup walkthrough "AI slop, garbage, too much detail."

## Prompt priming for coding-agent steps

When a post has the reader change code with a coding agent, include a copy-paste **primer prompt** (Joe calls this prompt priming): a short block that tells the agent the goal, where to look first (the repo's `AGENTS.md` or docs), what to build, and the rules the author learned the hard way, written as rules ("Put new buffers in PSRAM or the board boot-loops"). Use [placeholders] for everything that's the reader's (their board, service, design), with the author's choice as the bracketed example. The lessons in the primer often replace a gotchas section.

## The author's own take

A post with a named author carries that author's real experience and judgment, not only steps. Use "I" for what the author did and saw, "you" for instructions.

- **Impressions from actual use**, short and plain: what worked better than expected, what was annoying, what the author would do differently. They go inside the step they're about or after the build.
- **Praise comes with a receipt and a catch.** "Setup took one OAuth prompt; the one thing I missed was a way to rename tools" beats "easy to set up".
- **Say whether a number was measured, estimated or guessed**, once, where it appears.
- **At least one honest limitation**, and where the post weighs options, the author's call on what to do.
- **Never invent an impression, reaction, scene or quote.** If the notes don't have one, leave a marked placeholder and ask. Joe's word on his own setup and habits is the source: never ask him for proof, transcripts or schedules of his own use.
