---
name: distribute
description: Find where else a finished joekarlsson.com post belongs - subreddits, forums, Slack and Discord communities, Mastodon servers, link aggregators and newsletters that take submissions - with each community's rules read today, a title and first comment written for each, and a skip list. Covers every lane Joe writes in (homelab, data, AI, web dev, dataviz, generative and digital art, academic research, tech writing, work posts). Use after a post ships (blog-new Phase 9), before drafting when a venue wants the piece first (blog-new Phase 1), on any old post, or when Joe asks "where should I post this", "distribution plan", "which subreddits", "who would run this", /distribute.
---

# Distribute a post

Given a post slug, produce a ranked plan of the communities and newsletters where the post belongs, every rule read today, with copy ready to paste. Joe submits; the skill never does.

`channels.md` (next to this file) is the registry: every channel checked so far, its lanes, rule, submission route, status and the date it was verified. It's a starting list, not the truth: subreddits rewrote their rules all through 2026 (r/programming, r/homelab, r/selfhosted, r/LocalLLaMA), and newsletters stop quietly (DB Weekly, Data Science Weekly). So every run re-reads the rules of every channel it recommends.

## Modes

- **After publishing** (default): the full plan below.
- **Before drafting** (`--early`, blog-new Phase 1): only the channels marked `pitch-first` that fit the topic. Nightingale, for one, takes only pieces it publishes first, with three weeks' exclusivity. If one fits, tell Joe before the post goes up on the site, since publishing kills the pitch.

## 1. Read the post

Read `src/content/blog/<slug>.md` (or the newsletter, paper or work page): frontmatter (`categories`, `writtenFor`, `canonicalUrl`, `tags`, `title`, `description`) and the whole body. Name its lanes from the body, not the tags (most personal posts have none). A post can sit in two or three lanes: the Bechdel work is dataviz, film and academic research at once.

Note what kind of thing it is, since communities treat these differently: a write-up, original data or a chart (`[OC]` subs), a runnable tool or repo (Show HN, project megathreads), a how-to, an essay, research.

**Work posts** (`writtenFor` set): the link is the canonical employer URL, every draft says "I wrote this for <employer>" up front, and communities that ban company content go in Skip. This plan covers communities only; the employer runs its own social.

## 2. Pick candidates

1. Every `active` channel in `channels.md` whose lanes match.
2. A web search per lane for communities the registry lacks: `"<topic>" subreddit`, `<topic> forum`, `<topic> newsletter submit`, `<topic> discord`. Add each real find to `channels.md` with its source and today's date. Narrow finds (r/mikrotik for a MikroTik post) still get an entry; the lanes field keeps them out of unrelated plans.
3. Joe's track record: `src/data/coverage.ts` newsletter and thread entries (outlets that already ran his work rank higher), and his HN history: `curl -s "https://hn.algolia.com/api/v1/search?query=joekarlsson.com&restrictSearchableAttributes=url"`. Search the topic on HN Algolia too, to see what scored and what was already posted.

## 3. Read every candidate's rules today

Open each candidate's rules or submission page (its `source` in `channels.md`) and compare it with the entry. Update the rule text, status and `verified` date. A newsletter whose newest issue is over six months old is `paused`; one that says it stopped is `dead` and stays listed so nobody re-adds it.

Reddit refuses automated reads of its pages. Try the rules page once with WebFetch; if it's refused, the row says **unverified: read the rules before posting** and links `https://www.reddit.com/r/<sub>/about/rules`. Never guess a rule, never read Reddit through mirrors or a disguised browser, and never mark an unread rule as checked.

## 4. Write the plan

Rank by fit (would this community's regulars upvote or reply?), then reach, then rule risk. For each recommended channel:

- **Channel** and link, with its type and size
- **Why this post fits**, in one line
- **The rule**, quoted, with its URL and `verified` date, or the unverified flag
- **Format**: link post or text post with the link in the body, flair, `[OC]` and source line, megathread, `canonical_url`
- **Title** for that community. HN: the post's own title, unchanged. Reddit: the angle that sub votes on. Never the same title in two places.
- **First comment or pitch.** HN: an author comment (who I am, why I wrote it, what I'd like feedback on; 3-5 sentences). Reddit text post: the findings in 3-6 bullets, link at the bottom. Newsletter: 2-3 sentences on why their readers want it, sent only through their stated route.
- **Timing and order**: communities where Joe already takes part go first. Title and content matter far more than the hour; the HN timing studies disagree with each other.

Then:

- **Skip**: channels that look right but aren't, each with its reason (Show HN for a blog post; a dead newsletter; a sub whose rules ban blogs or AI-assisted posts; Lobsters without an invite and 70 days).
- **Cross-posts**: Dev.to with `canonical_url` set to joekarlsson.com. Google (2023) no longer promises to honor canonical on syndicated copies, and Hashnode has been seen taking the canonical, so check each copy in a private window after posting.
- **Before posting**: take part in a community before linking your own work there; disclose AI help where the rules ask (r/selfhosted, r/homelab, DEV, Write the Docs); no link shorteners or tracking parameters.

## 5. Review and show

Run every title, first comment and pitch through the `reader-reviewer` agent, then the humanizer and Vale. Fix their findings.

Write the plan as a local HTML page at `.mockups/distribute-<slug>/index.html` (a copy button per draft, the rule and its date beside each) and `open` it. Commit the updated `channels.md` (`chore: Distribution channels re-checked for <slug>`).

**Never submit, vote, or ask anyone to upvote.** HN penalizes the account and the site for voting rings; Reddit bans vote manipulation.

## Hand-offs

- LinkedIn, Bluesky, Threads and X: `/social` after this.
- A launch (a repo, a series): `marketing-strategist` builds the dated plan; this skill supplies the communities.
- Titles: `blog-headline-tester` already writes HN and Reddit title candidates during blog-new; start from those.
