---
title: 'Can Open Knowledge Format make Claude Code more accurate and cheaper? I tested it'
date: 2026-10-30T11:17:52Z
slug: 'claude-md-open-knowledge-format'
description: 'I moved the CLAUDE.md files and memory Claude Code reads into Open Knowledge Format and tested three versions. Restructuring halved startup context.'
categories: ['Dev Tools', 'Homelab']
tags:
  [
    'Claude Code',
    'CLAUDE.md',
    'Open Knowledge Format',
    'OKF',
    'context engineering',
    'AI coding agents',
    'Claude Code memory',
  ]
heroImage: '/images/blog/claude-md-open-knowledge-format/hero.webp'
heroAlt: 'Two featureless mannequin heads back to back in profile, each with a pink brain on top, the one on the right taller with a larger brain, against a red-to-purple gradient'
tldr: "I converted the ~200 markdown files Claude Code reads for my homelab (CLAUDE.md files, rules and auto-memory) to Google's Open Knowledge Format and tested three versions on 44 questions. Adding OKF metadata to the existing files changed nothing measurable. Adopting OKF's structure, one concept per file behind an index with thin CLAUDE.md stubs, cut the notes Claude loads every session from about 16,000 tokens to 8,500 and cost per question by about 30%, and accuracy held (97% to 99%, within noise). I switched over the same day."
faq:
  - question: 'What is Open Knowledge Format (OKF)?'
    answer: 'An open spec from Google Cloud for agent knowledge: a folder of markdown files, one concept per file, each with YAML frontmatter where only `type` is required. `index.md` and `log.md` are reserved names. The idea is progressive disclosure: the agent reads an index, then opens only the concept it needs.'
  - question: 'Does adding OKF frontmatter to CLAUDE.md files save tokens?'
    answer: "No, and it isn't meant to. Frontmatter labels the files without changing what loads. In my test, files with OKF frontmatter added performed the same as the originals on accuracy, tokens and search. The frontmatter also cost nothing at startup: Claude Code strips it from rules files (documented) and, in my measurement, from CLAUDE.md and MEMORY.md too."
  - question: 'How do I reduce the tokens my CLAUDE.md files use?'
    answer: 'Split big docs into one-concept files behind an index, and shrink each CLAUDE.md to the rules that must always apply plus a pointer to that index. Keep small tables that get asked about constantly, and safety rules, always-on. Measure a "Reply with just OK" session before and after.'
  - question: 'How long should a CLAUDE.md file be?'
    answer: "Under 200 lines, per Anthropic's memory docs, and shorter is better. Keep only what Claude needs on nearly every task: how you want work done, short rules, and a pointer to an index for everything else."
  - question: 'Does Claude Code read Open Knowledge Format natively?'
    answer: 'No. Claude Code loads CLAUDE.md files, rules and MEMORY.md as usual. OKF helps because each CLAUDE.md becomes a short stub that points to an index.md, and Claude opens only the concept files it needs.'
---

I'd been hearing about Google's [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (OKF) and wanted to know whether it could do anything for my Claude Code second brain. That's the pile of CLAUDE.md files, rules and auto-memory that teaches Claude how my homelab works. My question going in was simple: would converting it to OKF make Claude more accurate, or cheaper to run, or neither?

So I designed a test. I made three copies of Claude's markdown brain: one as-is, one with OKF metadata added to every file, and one fully restructured the way OKF lays knowledge out, with one concept per file behind an index. Then I asked all three the same 44 questions, three times each.

Adding OKF's metadata on its own didn't move the numbers, which makes sense, since it's labels on the same files. Adopting OKF's structure, one concept per file behind an index, is what paid off:

- **Startup context dropped by about half**, from 16,000 tokens of my notes to 8,500.
- **Cost per question fell about 30%**, from 4.3 cents to 3 cents on Sonnet, and by about a third on Opus.
- **Accuracy held**, going from 97% to 99%. On a test this small that's within noise, so I'd call it a tie.

I switched my real setup over the same day. The method and the full results are at the bottom if you want to check my work.

## What Open Knowledge Format is

OKF is an open spec from Google Cloud. It's a folder of markdown files, one concept per file, each with a little YAML frontmatter where only `type` is required, and an `index.md` in each folder listing what's there. The idea is progressive disclosure: the agent reads the index, then opens only the concept it needs. If you've seen [Karpathy's LLM wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), it's that idea with a spec. [Sébastien Dubois has a good explainer](https://www.dsebastien.net/open-knowledge-format-okf/) if you want the full tour.

Here's roughly what a bundle looks like. File names say what's inside, and every folder's index describes each file in one line, so the agent can pick the right one without opening the rest:

```
knowledge/
├── index.md                          one line per folder
├── log.md                            dated changes
├── home-assistant/
│   ├── index.md                      one line per concept below
│   ├── critical-alerts-to-phone.md
│   ├── dashboard-conventions.md
│   └── voice-assistant-setup.md
├── proxmox/
│   ├── index.md
│   ├── container-backup-schedule.md
│   └── gpu-passthrough-gotchas.md
└── services/
    ├── index.md
    └── media-server-ai-tagging.md
```

A line in `home-assistant/index.md` looks like this:

```markdown
- [Critical alerts to phone](critical-alerts-to-phone.md) - how a critical alert reaches my phone, and which automation sends it
```

Claude Code's [auto-memory](https://code.claude.com/docs/en/memory) already works this way. `MEMORY.md` is an index with one line per memory, and each memory is its own file with frontmatter. Converting mine took one extra line per file.

## How my CLAUDE.md got fat

The notes live in [my Claude Code skills repo](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/), the same one that runs my house. They grew the way I think everyone's do: Claude gets something wrong, so I add a line to make sure it doesn't happen again. A year of that across [my 70+ service homelab](/blog/homelab-two-years-later/) left me with about 200 files, and my Home Assistant doc alone had hit 65 KB. Every session started with about 16,000 tokens of my notes before I typed a word.

I assumed the problem was duplication, but hardly anything was repeated. It was all **always-on**, so Proxmox and Home Assistant details rode along in sessions where I was fixing a typo on my blog. Against my test questions, about a third of the always-on text never got used.

![Charlie Conspiracy meme: Charlie from It's Always Sunny in Philadelphia pointing at a wall of papers and red string, captioned "Me explaining how the 200 markdown files I wrote for my AI agent connect to each other"](/images/blog/claude-md-open-knowledge-format/meme-charlie-conspiracy.webp)

## Adding the metadata

The copy with OKF metadata got frontmatter on every file and nothing else. It performed the same as the original on everything I measured. That's what metadata should do: the content didn't change, and Claude still loaded the same 16,000 tokens.

The metadata is free, at least. Claude Code [strips frontmatter from rules files](https://code.claude.com/docs/en/memory) before loading them, and in my measurement CLAUDE.md and MEMORY.md didn't cost a single extra token either. So add it if it's useful to you. Just write the descriptions yourself, because the ones my script generated were mostly junk.

## Splitting into concepts

The restructured copy is where OKF's structure came in. I had subagents split the big docs into small concept files with an index per folder, and every CLAUDE.md shrank to a stub: the few rules that must apply every session, plus a pointer to the right index. They moved text word for word and never rewrote it, and a script checked that every original line still existed somewhere.

```
Before                                After
home-assistant/                       home-assistant/
  CLAUDE.md     65 KB, always-on        CLAUDE.md       2 KB: rules + pointer
                                      knowledge/home-assistant/
                                        index.md        one line per concept
                                        voice-agent.md  1-2 KB each,
                                        dashboards.md   opened on demand
                                        alerting.md
                                        ...
```

That halved what loads at startup, and every question got a little cheaper because there was less context to carry on each turn. The biggest wins were facts buried in huge docs. Instead of reading a 36 KB file to find one setting, the agent opened a 1 KB file, and my most expensive question dropped to about a third of its old cost.

![Pawn Stars Best I Can Do meme: Rick Harrison behind the pawn shop counter, captioned "Me: read the file I pointed you to" and "Claude: best I can do is answer from vibes"](/images/blog/claude-md-open-knowledge-format/meme-pawn-stars.webp)

## Preloading made Sonnet lazy

One of my 44 questions asked Claude to trace a critical alert from Home Assistant all the way to my phone. With everything preloaded, Sonnet answered in one turn from what was already in context, never opened the actual doc, and got a key detail wrong every single time. With only a pointer, it went and read the file, and got it right every time. Opus looked it up even with everything preloaded.

That's one question, so I'm not building a theory on it. But it lines up with [Anthropic's own advice](https://code.claude.com/docs/en/best-practices) that every line in CLAUDE.md takes a little of Claude's attention on every task. When the context looked like it already had the answer, Sonnet didn't go check.

![Futurama Fry meme: Fry squinting suspiciously, captioned "Not sure if Claude read the docs or just remembered them confidently"](/images/blog/claude-md-open-knowledge-format/meme-futurama-fry.webp)

## What broke

The experiment took a morning. Switching my real setup over is where I found the problems:

1. **Claude Code's memory writer and OKF both want a `type` key.** Minutes after I added OKF frontmatter to my memories, another Claude session saved a memory and rewrote my frontmatter, moving my `type` into the slot Claude Code uses for its own memory categories. The fix was making the OKF `type` the same value as Claude's category, so a rewrite changes nothing. Nothing I tested offline would have caught this one.
2. **Splitting surfaced a stale fact.** Two docs disagreed about where one of my services lived, and I never noticed until they were small files side by side.

## How to set up your own

You can get most of this in an afternoon with any agent that reads markdown. This is the order I'd do it in:

1. **Snapshot first:** a git tag, plus a copy of your memory folder (`~/.claude/projects/<project>/memory/`).
2. **Grep for anything that reads your docs** (scripts, tests, hooks, slash commands) before you move a file.
3. **Split your big docs into one concept per file**, with an `index.md` per folder. Move the text word for word, and check afterward that every original line still exists somewhere.
4. **Turn each CLAUDE.md into a stub:** the rules that must apply every session, plus a pointer to the index. Keep small, constantly used tables always-on.
5. **If you use auto-memory, set the OKF `type` to the memory's category** so Claude Code's rewrites don't fight you.
6. **Add a pre-commit check** that keeps the stubs small and every concept listed in its index. Without one, the stubs grow right back.

Once your docs are already lean, this buys you little. I split my global `~/.claude/CLAUDE.md` the same way afterward and saved 312 tokens, because nearly all of it is rules that apply everywhere. Most of an empty session is Claude Code's own system prompt and tool list.

## How I write a CLAUDE.md now

Short, and only what Claude needs on nearly every task. Anthropic's [own guidance](https://code.claude.com/docs/en/memory) is to keep each CLAUDE.md under 200 lines, and after this experiment I'd go further. Every line rides along on every turn, whether the task needs it or not.

What goes in mine:

- **How I want work done:** testing, code style, git workflow. These apply to almost everything I ask for.
- **Rules, not essays.** One or two sentences per rule. If the reason changes how Claude should act, I keep it; otherwise it goes.
- **A pointer to everything else.** Situational stuff lives in a knowledge folder, and the last line tells Claude where the index is.

What stays out: anything about one project or one service, long examples, anything Claude can figure out by reading the code, and anything a hook can enforce instead.

Here's my global `~/.claude/CLAUDE.md`, the one that [loads in every session on every machine](/blog/my-development-setup-2026/). It's about 1,600 tokens:

<details>
<summary>My global CLAUDE.md</summary>

```markdown
# Global instructions

## Testing

**Test the change you made.** Before calling it done, run the specific feature, fix, or test once and confirm it works. Don't claim something works without running it. If it fails, fix it and run it again. Don't ask me to check something you could check yourself.

**Past that, use your judgment.** Match the effort to the risk. Speed matters, so don't be cautious just for the sake of it.

- **Tests:** run the tests for the area you changed, not the whole suite by default. If existing tests check behavior you changed, update them. Add a test for new logic that's non-trivial and likely to break later; skip it for small or obvious changes.
- **End-to-end and downstream checks:** do these when the change touches something shared (a module, schema, template, or config other things read), or when a failure would be silent or costly. Skip them for contained changes.
- Check once. Don't confirm the same thing several different ways.

**Reporting:** briefly say what you ran and what happened. **Text-only edits** (skills, CLAUDE.md, docs, READMEs, comments) need no test runs: re-read the section you edited and report what changed.

## Code design

- **Build only what was asked.** No speculative options, flags, or abstractions. Write the obvious solution; optimize only when there's a measured need.
- **Don't hide failures.** No swallowed errors, silent fallbacks, or `|| true` without a stated reason. An explicit error beats a silent success.
- **Rule of three.** Duplicate once; extract a shared helper when the third copy appears.
- **Clean up as you go.** In the same change, delete code your change made dead or replaced: unused functions, variables, imports, files, stale comments, and debug leftovers. If you spot other clearly dead code nearby, grep for callers and remove it too. Less code is better; don't leave cleanup for later.
- **Descriptive names over short ones.** Name variables, functions, parameters, and endpoints so they explain themselves to a human or an LLM (`waitUntilObjectIsSaved`, not `wait`). Keep the file's casing convention.

## Git Workflow

This is my personal computer: do NOT open pull requests by default.

1. Always fetch the latest changes from the remote repository before making any changes.
2. Commit messages (and any PR titles) should follow the format `feat: <Summary>`, `fix: <Summary>`, or `chore: <Summary>`, where the summary starts with an uppercase letter. Use `chore:` for non user-facing changes.
3. When a change is ready, commit it directly **and push**; always keep the remote up to date without being asked. Don't create a PR unless I explicitly request one.
4. Only when I explicitly ask for a PR: open it as a draft with a concise single-sentence description.

## Parallel sessions: one worktree each

- **Before the first edit in a git repo, run ListAgents.** If another session is working in the same repo (session names start with the repo's directory name), call **EnterWorktree** and do all the work there.
- **Never touch another session's files or staged changes.** Outside a worktree, always commit with explicit paths: `git commit -- <paths>`.
- **Working in a worktree** (shipping with `push origin HEAD:main`, gitignored files, removing it when done): read `~/.claude/knowledge/worktree-workflow.md` first.

Other situational rules live in `~/.claude/knowledge/index.md` (an Open Knowledge Format bundle): read the index line, open only the concept you need.

## Word documents (.docx)

Before reading or editing any .docx, load the local `docx` skill (`~/.agents/skills/docx`), not the `anthropic-skills:docx` plugin variant, which lacks the Word workflow. An edit isn't done until you've read it back from Word.
```

</details>

## Takeaways

Most of what I learned doesn't depend on OKF or on Claude Code. If you keep any kind of notes for a coding agent:

1. **Treat always-on context as a budget.** Every line loads on every turn of every session, whether the task needs it or not.
2. **Point, don't preload.** Give the agent an index and let it open what it needs. Preload only what's small, used constantly, or a safety rule.
3. **One idea per file, named for what's in it.** File names and index lines are how the agent decides what to open, so `critical-alerts-to-phone.md` beats `notes-3.md`.
4. **Write the index descriptions yourself.** The generated ones were the weakest part of my conversion.
5. **Don't let a model rewrite your notes while it reorganizes them.** Move the text as-is. An [ETH Zurich study](https://arxiv.org/abs/2602.11988) found that LLM-generated context files didn't improve coding agents' success and added cost.
6. **If a rule must never break, make it a hook.** Text is a suggestion the agent can talk itself out of.
7. **Your docs might be code.** If a script or test parses a file, moving it is a code change.
8. **Facts go stale.** Put a date on the ones that will (OKF has a `stale_after` field for this), so something reminds you to check them.

What OKF gave me was a clear structure to follow and a spec I could lint against. The structure is what made the difference, and it's what I'd copy.

## How I tested

I made three copies of my skills repo, each with the files at their real paths, so CLAUDE.md files and memory auto-loaded the way they do in the real thing:

- **As-is:** the original files.
- **Metadata:** OKF frontmatter added to every file, content unchanged.
- **Restructured:** one concept per file behind an index, thin CLAUDE.md stubs.

I wrote 44 questions from the docs, each with a known answer. Some were facts that were already always-on, some were buried deep in big docs, and some were safety rules where the right answer is "no." Each copy got every question three times through headless `claude -p` on Sonnet 5.5, plus a smaller Opus 5.5 spot check. A script and a cheap judge model graded the answers, and I read every failure myself. The whole thing cost about $21.

|                                | As-is  | Metadata | Restructured |
| ------------------------------ | ------ | -------- | ------------ |
| Tokens loaded at session start | 16,237 | 16,237   | 8,505        |
| Accuracy (Sonnet)              | 97%    | 98%      | 99%          |
| Cost per question (Sonnet)     | $0.043 | $0.042   | $0.030       |
| Cost per question (Opus)       | $0.201 | $0.203   | $0.133       |

Some caveats. 44 questions is a small set, and the accuracy ranges overlap, so read accuracy as "held," not "improved." I overturned one grade by hand, where the judge misread a correct refusal. I measured whether Claude could find and use what's in the docs, not whether it follows instructions better. That's a separate question, and a [study of 1,650 Claude Code sessions](https://arxiv.org/abs/2605.10039) found no detectable effect from CLAUDE.md length or file structure.

<details>
<summary>More results and lessons from building the test</summary>

Accuracy and tokens per question by question type (Sonnet):

| Question type          | As-is        | Metadata     | Restructured |
| ---------------------- | ------------ | ------------ | ------------ |
| Already always-on      | 100% / 31.9k | 100% / 31.9k | 100% / 40.9k |
| In memory files        | 96% / 42.8k  | 100% / 49.5k | 100% / 42.3k |
| Buried in big docs     | 100% / 96.9k | 100% / 88.2k | 98% / 66.6k  |
| Spans several files    | 50% / 31.9k  | 50% / 31.9k  | 100% / 49.9k |
| Safety rules           | 100% / 36.3k | 100% / 36.3k | 100% / 48.0k |
| Out-of-date fact traps | 100% / 48.5k | 100% / 48.4k | 100% / 37.3k |

The "already always-on" and "safety rules" rows are where splitting went too far: those questions cost more once their tables weren't preloaded. After the experiment I put those tables back in the always-on files, and both kinds of question went back to one turn.

If you build your own test:

- `--allowedTools` pre-approves tools; it doesn't restrict them. Use `--tools` to restrict what the agent can call.
- Read your failures by hand. My grader was wrong more often than the agents were: a too-strict regex and one reference answer that only listed one of two valid answers.
- Run every version in its own folder with the same flags, so nothing from your real setup leaks in.

</details>
