# Length

Core file (`.claude/blog-core.md`). **Set a word budget at the outline gate** (the angle block's last line, `angle-and-outline.md`) and write to it. Topical depth from research decides what the post covers; the budget decides how long it runs. A post that covers what the top results cover in fewer words is the better post. Never pad to hit a number: padding dilutes the piece and reads as AI filler.

Each site sets its default budgets and its ceiling (below for joekarlsson.com; an adapter sets its own). Past the ceiling, give the reason in the angle block and let Joe approve it at the outline gate. Why budgets exist at all: on 2026-11-18 Joe called a 3,100-word tutorial "way too long" and approved the same post at about 2,000.

## The cut pass

Run it when the first draft is done, and again after the reviewers' edits are in, because review fixes add words. Cut in this order until the draft is within budget, and keep cutting what fails a test even when it's already under:

1. **Warm-ups.** A first sentence or paragraph that clears its throat before the point. Start on the point.
2. **Sections that exist because the author did the work**, not because the reader needs them: shrink to a sentence or cut.
3. **Anything said twice.** Keep the better version. The intro doesn't preview the sections, the body doesn't restate the summary box (a TL;DR or an At a glance), and the ending isn't a recap.
4. **Caveat stacks, every-field config tours, alias tables and setup trivia** the reader won't act on.
5. **Demo detail past what the steps need.** The example carries the steps; it doesn't get its own extra paragraphs.

**Every addition pays for itself.** When a reviewer asks for a new paragraph, cut an equal amount elsewhere or tell Joe the post grew and why. Report the count at the draft gate as `Words: <count> (budget <n>)`.

## Personal site only

- The budget is the Phase 1a length estimate: short (800-1,200 words), medium (1,500-2,500) or long (3,000+). A long post names its reason in the angle block.
- Count the body without front matter: `awk '/^---$/{n++; next} n>=2' src/content/blog/{slug}.md | wc -w`.
