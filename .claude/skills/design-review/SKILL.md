---
name: design-review
description: Design review of one joekarlsson.com page or component - screenshots it on desktop and phone, runs two isolated reviewers in parallel (a design-director critique scored on Nielsen's heuristics, and the Impeccable detector's findings sorted into real, deliberate and false positive), then merges them into one numbered report and asks Joe what to fix. Use when Joe asks to review, critique or audit the design of a page, section or component, or before shipping a new page.
---

# Design review

Two reviewers look at the same page without seeing each other's work, then you merge them. The split matters: a detector's findings anchor whoever reads them, so the design judgment happens first and alone. Adapted from Impeccable's critique command (github.com/pbakaus/impeccable, Apache 2.0).

## 1. Pick the target

Resolve what Joe named to a URL and the source files that build it ("the homepage" is `/` and `src/pages/index.astro`; "the blog cards" is `/blog/` plus the card component). Narrow beats broad: one section reviewed closely is worth more than a whole site at a glance. For several pages, run this once per page.

Review production (`https://joekarlsson.com/...`) when the page is live and unchanged. To review unshipped work, build and preview from your worktree on its own port (other sessions own 4321):

```bash
npm run build && npx astro preview --port 4400   # in the background; stop it before you report
```

## 2. Screenshot it

```bash
node scripts/design-shots.mjs "<url>" "<scratchpad>/design-review/<page>"
```

That writes `desktop.png`, `desktop-full.png`, `phone.png` and `phone-full.png` with reduced motion on. Look at them yourself before going on; a blank or wrong page means fix the URL and retake, not review.

## 3. Run both reviewers at once

Spawn both agents in one message so they run in parallel. Give each the URL, the source file paths and anything Joe said he wants looked at. Don't pass either one your own opinion of the page.

- `design-critic`: also pass the four screenshot paths.
- `design-evidence`: also pass a scratchpad directory to run the detector in.

If agents can't be spawned, do the design review yourself first, write it down, and only then run the detector; start the report with `Single-context review (<reason>)` so Joe knows.

## 4. Merge them

Don't paste the two reports one after the other. Weave them:

- Where the detector and the reviewer agree, that's the strongest finding; say both caught it.
- Where the detector found something the reviewer missed, add it to the priority list at its own severity.
- Drop the detector's deliberate items and false positives from the findings. Mention their count in one line, and add any new known items the evidence agent reports to its list in `.claude/agents/design-evidence.md`.
- Check every finding against `docs/redesign/PLAN.md`'s decisions log before it reaches Joe. A choice he already made isn't a finding unless something about it is broken.

## 5. Report

In chat, numbered continuously so Joe can answer by number:

1. **Verdict**: the specificity verdict and the heuristic total and band, two or three lines.
2. **Fix first**: the merged priority issues, P0 to P3, each with the fix and which reviewer found it.
3. **Keep**: what's working and must survive the fixes.
4. **Personas**: the red flags, one line per persona.
5. **Smaller things**: minor observations and real detector items that didn't make the priority list.
6. **Heuristics table**.

Open the screenshots on Joe's screen (`open <path>`) when a finding is about something visible. End with one question: which numbers to fix. Then stop any preview server you started and delete the scratchpad screenshots once Joe has answered.
