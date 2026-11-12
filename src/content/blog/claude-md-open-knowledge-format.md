---
title: 'Can Open Knowledge Format make Claude Code more accurate and cheaper? I tested it'
seoTitle: 'Does Open Knowledge Format Help Claude Code?'
shareTitle: 'Does Open Knowledge Format make Claude Code cheaper and more accurate? I tested'
date: 2026-10-30T11:17:52Z
slug: 'claude-md-open-knowledge-format'
description: 'I moved the CLAUDE.md files and memory Claude Code reads into Open Knowledge Format and tested three versions. Restructuring halved startup context.'
categories: ['AI', 'Homelab']
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
heroImage: '/images/blog/claude-md-open-knowledge-format/thumb-1f0b822d.webp'
heroAlt: "A printer's type cabinet with one shallow drawer pulled out, its small compartments full of metal type"
tldr: "I converted the ~200 markdown files Claude Code reads for my homelab to Google's Open Knowledge Format and tested three versions on 44 questions. OKF metadata alone changed nothing. OKF's structure, one concept per file behind an index, halved startup context and cut cost per question by about 30% without losing accuracy."
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

I'd been hearing about Google's [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (OKF) and wanted to try it on my Claude Code second brain. That's the pile of CLAUDE.md files, rules and auto-memory that teaches Claude how my homelab works. Would converting it to OKF make Claude more accurate, or cheaper to run, or neither?

So I designed a test. I made three copies of Claude's markdown brain: one as-is, one with OKF metadata added to every file, and one fully restructured the way OKF lays knowledge out, with one concept per file behind an index. Then I asked all three the same 44 questions, three times each.

Adding OKF's metadata on its own didn't move the numbers, which makes sense, since it's labels on the same files. Restructuring is what paid off:

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

The copy with OKF metadata got frontmatter on every file and nothing else. It performed the same as the original on everything I measured. The content didn't change, and Claude still loaded the same 16,000 tokens.

The metadata is free, at least. Claude Code [strips frontmatter from rules files](https://code.claude.com/docs/en/memory) before loading them, and in my measurement CLAUDE.md and MEMORY.md didn't cost a single extra token either. So add it if it's useful to you. Just write the descriptions yourself, because the ones my script generated were mostly junk.

## Splitting into concepts

For the restructured copy, I had subagents split the big docs into small concept files with an index per folder, and every CLAUDE.md shrank to a stub: the few rules that must apply every session, plus a pointer to the right index. They moved text word for word and never rewrote it, and a script checked that every original line still existed somewhere.

![Before and after splitting into concepts. Before: home-assistant/CLAUDE.md was 65 KB and loaded in every session. After: home-assistant/CLAUDE.md is a 2 KB stub of rules plus a pointer, and knowledge/home-assistant/ holds an index with one line per concept and small concept files like voice-agent.md, dashboards.md and alerting.md, 1 to 2 KB each, opened on demand.](/images/blog/claude-md-open-knowledge-format/before-after.svg)

That halved what loads at startup, and every question got a little cheaper because there was less context to carry on each turn. The biggest wins were facts buried in huge docs. Instead of reading a 36 KB file to find one setting, the agent opened a 1 KB file, and my most expensive question dropped to about a third of its old cost.

![Pawn Stars Best I Can Do meme: Rick Harrison behind the pawn shop counter, captioned "Me: read the file I pointed you to" and "Claude: best I can do is answer from vibes"](/images/blog/claude-md-open-knowledge-format/meme-pawn-stars.webp)

## Preloading vs. pointers

One of my 44 questions asked Claude to trace a critical alert from Home Assistant all the way to my phone. With everything preloaded, Sonnet answered in one turn from what was already in context, never opened the actual doc, and got a key detail wrong every single time. With only a pointer, it went and read the file, and got it right every time. Opus looked it up even with everything preloaded.

That's one question, so I'm not building a theory on it. But it lines up with [Anthropic's own advice](https://code.claude.com/docs/en/best-practices) that every line in CLAUDE.md takes a little of Claude's attention on every task.

![Futurama Fry meme: Fry squinting suspiciously, captioned "Not sure if Claude read the docs or just remembered them confidently"](/images/blog/claude-md-open-knowledge-format/meme-futurama-fry.webp)

## What broke

The experiment took a morning. Switching my real setup over is where I found the problems:

1. **Claude Code's memory writer and OKF both want a `type` key.** Minutes after I added OKF frontmatter to my memories, another Claude session saved a memory and rewrote my frontmatter, moving my `type` into the slot Claude Code uses for its own memory categories. The fix was making the OKF `type` the same value as Claude's category, so a rewrite changes nothing. Nothing I tested offline would have caught this one.
2. **Splitting surfaced a stale fact.** Two docs disagreed about where one of my services lived, and I never noticed until they were small files side by side. OKF has a `stale_after` field for facts like this, so something reminds you to check them.

## How to set up your own

You can get most of this in an afternoon. Here's a prompt you can steal. Paste it into Claude Code from the root of your repo:

```text
Convert my Claude Code notes (every CLAUDE.md, .claude/rules/*.md, and my
auto-memory folder) to Open Knowledge Format:
https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

Before changing anything:
1. Make a git tag and a copy of my memory folder so I can roll back.
2. Find every script, test, hook, and slash command that reads these files.
   List them, and ask me before moving any file they depend on.
3. Measure my startup context: run `claude -p "Reply with just OK"` here and
   in an empty folder, and report the difference in tokens.

Then:
4. Split big docs into one concept per file under knowledge/, with an
   index.md per folder that describes each file in one line. Name each file
   for what's in it.
5. Move text word for word. Don't rewrite, summarize, or "improve" anything.
   Afterward, check that every original line still exists somewhere, and
   show me any that don't.
6. Give each concept OKF frontmatter (type, title, description). Write
   descriptions that say what's in the file.
7. Shrink each CLAUDE.md to a stub: the rules that apply to every task,
   safety rules, and small tables I look things up in constantly, plus a
   pointer to the right index.md.
8. For auto-memory files, set the OKF `type` to the memory's existing
   category so Claude Code's own rewrites don't conflict with it.
9. Re-measure startup context. Show me before and after, and list what you
   kept always-on and why.
10. Suggest a pre-commit check that keeps the stubs short and every concept
    listed in its index.
```

Read the list of what it kept always-on before you commit. That's where my conversion went too far: tables I look up constantly ended up behind pointers, and I had to put them back.

Once your docs are already lean, this buys you little. I split my global `~/.claude/CLAUDE.md` the same way afterward and saved 312 tokens, because nearly all of it is rules that apply everywhere. Most of an empty session is Claude Code's own system prompt and tool list.

## How I write a CLAUDE.md now

Short, and only what Claude needs on nearly every task. Anthropic's [own guidance](https://code.claude.com/docs/en/memory) is to keep each CLAUDE.md under 200 lines. Every line rides along on every turn, whether the task needs it or not.

What goes in mine:

- **How I want work done:** testing, code style, git workflow. These apply to almost everything I ask for.
- **Rules, not essays.** One or two sentences per rule. If the reason changes how Claude should act, I keep it; otherwise it goes.
- **A pointer to everything else.** Situational stuff lives in a knowledge folder, and the last line tells Claude where the index is.

What stays out: anything about one project or one service, long examples, anything Claude can figure out by reading the code, and anything a hook can enforce instead. If a rule must never break, I make it a hook, because the agent can argue its way past text. OKF gave me a structure to follow and a spec I can lint against.

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

![Three bar charts comparing the docs as-is, with metadata added, and restructured. Tokens loaded at session start: 16,237, 16,237 and 8,505. Cost per question on Sonnet: $0.043, $0.042 and $0.030. Cost per question on Opus: $0.201, $0.203 and $0.133. Accuracy on Sonnet held at 97%, 98% and 99%, within the noise of 44 questions.](/images/blog/claude-md-open-knowledge-format/test-results.svg)

Forty-four questions is a small set, and the accuracy ranges overlap, so read accuracy as "held," not "improved." I overturned one grade by hand, where the judge misread a correct refusal. I measured whether Claude could find and use what's in the docs, not whether it follows instructions better. That's a separate question, and a [study of 1,650 Claude Code sessions](https://arxiv.org/abs/2605.10039) found no detectable effect from CLAUDE.md length or file structure.

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

</details>
