---
name: distribute
description: Build the distribution plan for a joekarlsson.com post, project, research piece or newsletter issue - one dated calendar from day 0 to day 30 covering social posts (handed to /social to draft and schedule), video (Reels, Shorts and clips, plus what to film while building), Hacker News when the piece fits, subreddits and forums with each one's rules, curators and newsletters with a pitch, follow-ups, and the day 2/7/30 traffic checks that teach the next plan. Runs automatically from blog-new (Phase 1 early mode, Phase 9 after deploy). Use when Joe asks "where should I post this", "distribution plan", "which subreddits", "how do I get this out there", /distribute, or on any old post worth resurfacing.
---

# Distribute a post

Given a slug (or a repo, a research piece, a newsletter issue), produce **one dated plan** Joe can work through: every channel, the date, the copy ready to paste, and how it's measured. Joe submits to communities himself; `/social` schedules the social posts after he approves them. The skill never submits, votes or asks anyone to upvote.

Read first, every run:
- `~/.claude/skills/personal-marketing/references/distribution-evidence.md`: the rules this plan applies and Joe's own numbers. When Joe's data disagrees with a rule there, his data wins; update the file.
- `channels.md` (next to this file): every channel, its lanes, rules, route, track record and the date its rules were checked.

## Joe's standing calls (2026-11-23)

- **Hacker News is a channel**, judged per piece: measured numbers, a method people can check, original research, or Show HN for something runnable. Never essays. Never drop it from a plan wholesale.
- **Claude drafts all copy** (social, Reddit, HN, pitches); the humanizer and `reader-reviewer` check it, and Joe edits. The HN row states HN's rule against generated text so he decides with it in view.
- **AI disclosure only where a venue requires it.** The plan names the venue's rule next to the row.
- **Every link Joe posts is tagged** so Plausible names the channel (`postiz-schedule.py` adds `?ref=<platform>` for social; the plan writes `?ref=newsletter` and `?ref=<curator>` by hand). HN and Reddit links stay untagged.
- **Nothing affiliate goes to a community** (gift guides read as self-promotion).

## 1. Read the piece and name its kind

Read the source in full (frontmatter and body). Name its **kind**, which sets the routing in step 3:

| Kind | Examples | Where it lives |
|---|---|---|
| Build / open source | PixelPane, Followspot, Screencast Director, the bumper CLI | Communities for that product, Show HN, Hackaday, video first |
| Technical post | OpenTofu homelab, HA automations, Claude Code tests | LinkedIn first, niche subs, curators in the lane, HN if measured |
| Research | Punc sentence length, Babel Strip, Bechdel page vs screen | DOI, dataviz/linguistics/film venues, HN, LinkedIn document post |
| Essay / art | The Artist's Way, Hackers and Painters, Ship the Ugly Pot | Newsletter, Bluesky, LinkedIn, art and personal-web venues; no aggregators |
| Work post (`writtenFor`) | CData posts | Canonical employer URL, "I wrote this for <employer>", skip communities that ban company content |

Also note: does it have **something to look at** (a demo, a build, a chart, a painting)? That decides the video track. Is it **affiliate** content? Then no communities.

## 2. Video track (before anything else, because footage can't be made later)

Joe's best-performing work is short vertical video: Reels get 2-7x what the same clip gets on Shorts, and "here's how I built X" is his best format. Consistency is the problem, so the plan makes video cheap:

- **In early mode (blog-new Phase 1, while he's still building):** a **shot list** of 3-6 moments to film now on his phone or with Screencast Director: the thing working, the before/after, the moment it broke, his hands on it. 5-20 seconds each. These are the progress posts before launch and the clip after.
- **At launch:** pick the tier and write it into the plan:
  - **None:** essays and opinion posts with nothing to look at.
  - **One clip (default for anything visible):** a 30-60 second vertical "I built X" video. Write the on-screen hook line, a 3-beat script for Followspot (what it is, the moment it works, where to get it), and the caption. Reel first, then Shorts, LinkedIn, Bluesky, X, TikTok, each uploaded natively; link in the reply, first comment or last part.
  - **Long video:** only for an evergreen tutorial or a project with a story (his only long videos that took off were tutorials). Hand to `/video`, then `video-clips` for 3-5 Shorts spread over the next weeks, each with its Related-video link set.
- Postiz is connected to Instagram (Standalone), YouTube and TikTok, but `postiz-schedule.py` schedules none of them yet: Reels and Shorts go in through Postiz's web UI, and TikTok only as an inbox draft Joe publishes from the app (its app is unaudited). Details: `knowledge/services/postiz/short-form-video.md` in claude-skills.

## 3. Pick channels

1. **Social** (always): LinkedIn, Bluesky, Threads, X through `/social`; Instagram by hand. LinkedIn carries the link for technical and build posts; Bluesky leads for art and dataviz.
2. **Hacker News** when it fits (see Joe's calls). Check `hn.algolia.com/api/v1/search?query=<url>&restrictSearchableAttributes=url` first: one repost is allowed if an earlier submission got no real attention; a real thread means skip.
3. **Communities:** every `active` channel in `channels.md` whose lanes match, plus a web search per lane for ones the registry lacks (`"<topic>" subreddit`, `<topic> forum`, `<topic> newsletter submit`). Add real finds to `channels.md` with source and date. Route by kind and how it was made: a project under 3 months old goes to r/selfhosted's weekly megathread, never a standalone post; r/opensource is closed to Joe's projects (it bans AI-involved projects and wants 1+ year and 3+ contributors).
4. **Curators and newsletters:** the lane's curators in `channels.md`, against their published criteria (Changelog: no tutorials; Console.dev: pre-1.0 dev tools only; Hackaday: builds with a wide photo; kottke: projects and videos; Nightingale: pitch before publishing, 3 weeks exclusive). Outlets that already ran Joe's work rank first (`src/data/coverage.ts`).
5. **Research only:** a DOI on day 0 (Zenodo, or Rogue Scholar for the blog), arXiv only with a personal endorser lined up, the field's mailing lists (Humanist, Digital Humanities Now).
6. **Essays and art only:** the newsletter, IndieWeb Carnival when the month's prompt fits, Kagi Small Web (once, with two other blogs, no popups on the site), Bluesky starter packs, a podcast-guest pitch when the essay could carry a conversation.

Rank by fit (would this community's regulars upvote or reply?), then Joe's track record with the channel, then reach. Cut anything that's a stretch; a short plan Joe finishes beats a long one he doesn't.

## 4. Rules, checked once and reused

For each recommended channel, the plan shows its rule, the URL and the date it was checked.

- **Non-Reddit channels:** re-read the rules page when `channels.md`'s `verified` date is over 90 days old; update the entry.
- **Reddit:** no tool here can read Reddit (it refuses automated reads, Chrome blocks it, and mirrors and disguised browsers are off limits). For each sub with `verified: never` or older than 90 days, the plan's first box lists `https://www.reddit.com/r/<sub>/about/rules` links and asks Joe to paste the rules (or say "checked, nothing new"). Record them in `channels.md` with `verified-by: Joe` and the date. A sub checked in the last 90 days needs nothing from him. Until a sub is checked, its row says **read the rules before posting**; never guess a rule.

## 5. Write the plan

One calendar, day 0 = publish day. Every row: date, channel, what goes there, the copy (with a copy button), the rule and its date, and a blank **result** column.

| When | What |
|---|---|
| Before launch (early mode) | Shot list; pitch-first venues (Nightingale) before the post goes up; progress clips |
| Day 0 | Post live; Wayback save; DOI for research; `/social` launch posts (LinkedIn early on a weekday); the video clip (Reel first); HN if it fits |
| Day 0-2 | Reddit and forum posts, one community a day, each with its own title; reply to everything for 48 hours |
| Day 1-3 | Curator pitches (weekly curators need it before their issue closes); the product's own community (HA forum, Proxmox forum, Discord showcase) |
| Day 3-7 | Second wave with a new angle: a follow-up from `/social`'s Repurpose list, or a clip on its own point |
| Day 7-21 | Remaining follow-ups (each one new point, spaced per `/social`); answer live questions the post answers (forums, Stack Overflow), saying it's his post |
| Day 7 | Awesome-list and handbook pull requests that fit |
| Day 2, 7, 30 | Traffic check (step 6) |

Copy for each row:
- **HN:** the post's own title, unchanged; an author comment (who he is, why he made it, what feedback he wants; 3-5 sentences). Show HN links the repo or the thing to try.
- **Reddit text post:** a title written for that sub's angle (never the blog title, never the same title twice), 3-6 bullets of the actual findings so the post stands on its own, the link at the bottom, flair if the sub wants it, the AI disclosure only if the sub requires it.
- **Curator pitch:** subject line = the finding or build in plain words; under 200 words: what it is, why *their* readers care, one number or image, the tagged link. One curator per email; one follow-up after 3-7 days, then stop.
- **Social:** the angle and media for `/social`, plus each follow-up's point and date. `/social` writes and schedules them.

Run every title, comment and pitch through `reader-reviewer`, then the humanizer and Vale; fix what they find.

Write the plan to `.mockups/distribute-<slug>/plan.md` (the record the checks and `/social` read) and `.mockups/distribute-<slug>/index.html` (rule and date beside each row, a copy button per draft, a checkbox per row), and `open` the page. Commit any `channels.md` changes (`chore: Distribution channels re-checked for <slug>`).

## 6. Check what worked (day 2, 7, 30)

Pull the post's visits by source from Plausible (the `/seo` command's credentials in claude-skills: `PLAUSIBLE_API_KEY`, `PLAUSIBLE_BASE_URL`), filtered to the post's path, by `visit:source` (which picks up `ref` and `utm_source`). For video, Joe reads views and "viewed vs swiped away" in each app. Write the numbers into the plan's result column, and add a one-line track record to each channel's `channels.md` entry (`track record: <slug> <date>: <visits> visits / <comments> comments`). The next plan ranks channels by these lines. Direct / None that stays high after tagging is people forwarding it, which is good news, not a gap.

A post that got nothing anywhere: say so plainly, name the likeliest reason (wrong venue, title, timing, no visual), and don't repost it unchanged; it comes back only with a real update.

## Hand-offs

- Social copy and scheduling: `/social` (claude-skills), using the plan's social rows.
- Video: `/video` for a script, `video-clips` for Shorts, `youtube-upload` (this repo) for YouTube.
- A launch (a repo, a series, a talk): `marketing-strategist` uses this plan as its base and adds the weeks before.
- Titles: in blog-new, `blog-headline-tester` already wrote HN and Reddit title candidates; start from those.
