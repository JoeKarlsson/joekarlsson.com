---
title: 'Can Open Knowledge Format Make Claude Code More Accurate and Cheaper? I Tested It'
date: 2026-10-30T15:09:37Z
slug: 'can-open-knowledge-format-make-claude-code-more-accurate-and-cheaper-i-tested-it'
description: "What I learned moving the notes Claude Code reads for my homelab into Open Knowledge Format, and what I'd copy even without OKF."
recapOf: 'claude-md-open-knowledge-format'
heroImage: '/images/newsletter/can-open-knowledge-format-make-claude-code-more-accurate-and-cheaper-i-tested-it/header.webp'
heroAlt: 'Header for Can Open Knowledge Format Make Claude Code More Accurate and Cheaper? I Tested It from Works on My Machine, with two featureless mannequin heads, each with a pink brain on top, the one on the right taller with a larger brain'
---

I'd been hearing about Google's [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (OKF) and wanted to know whether it could do anything for my Claude Code second brain. That's the pile of CLAUDE.md files, rules and auto-memory that teaches Claude how my homelab works.

So I tested three versions of it on 44 questions. Adding OKF's metadata on its own didn't move the numbers. Adopting OKF's structure, one concept per file behind an index, cut the notes Claude loads every session about in half and the cost per question by about 30%, and accuracy held. I switched my real setup over the same day.

## What OKF is

OKF is an open spec from Google Cloud. It's a folder of markdown files, one concept per file, each with a little YAML frontmatter where only `type` is required, and an `index.md` in each folder listing what's there. The agent reads the index, then opens only the concept it needs.

## How my notes got fat

My notes grew the way I think everyone's do: Claude gets something wrong, so I add a line to make sure it doesn't happen again. A year of that across my homelab left me with about 200 files, and my Home Assistant doc alone had hit 65 KB. Every session started with about 16,000 tokens of my notes before I typed a word.

I assumed the problem was duplication, but hardly anything was repeated. It was all always-on, so Proxmox and Home Assistant details rode along in sessions where I was fixing a typo on my blog.

![Charlie Conspiracy meme: Charlie from It's Always Sunny in Philadelphia pointing at a wall of papers and red string, captioned "Me explaining how the 200 markdown files I wrote for my AI agent connect to each other"](/images/newsletter/can-open-knowledge-format-make-claude-code-more-accurate-and-cheaper-i-tested-it/meme-charlie-conspiracy.webp)

## Splitting into concepts

For the test, I had subagents split the big docs into small concept files with an index per folder, and every CLAUDE.md shrank to a stub: the few rules that must apply every session, plus a pointer to the right index.

## What broke when I switched

1. **Claude Code's memory writer and OKF both want a `type` key.** Minutes after I added OKF frontmatter to my memories, another Claude session saved a memory and rewrote my frontmatter, moving my `type` into the slot Claude Code uses for its own memory categories. The fix was making the OKF `type` the same value as Claude's category, so a rewrite changes nothing.
2. **Splitting surfaced a stale fact.** Two docs disagreed about where one of my services lived, and I never noticed until they were small files side by side.

![Pawn Stars Best I Can Do meme: Rick Harrison and another man behind the pawn shop counter, captioned "Me: read the file I pointed you to" and "Claude: best I can do is answer from vibes"](/images/newsletter/can-open-knowledge-format-make-claude-code-more-accurate-and-cheaper-i-tested-it/meme-pawn-stars.webp)

## What I'd copy

Most of what I learned doesn't depend on OKF or on Claude Code. If you keep any kind of notes for a coding agent:

1. **Treat always-on context as a budget.** Every line loads on every turn of every session, whether the task needs it or not.
2. **Point, don't preload.** Give the agent an index and let it open what it needs. Preload only what's small, used constantly, or a safety rule.
3. **One idea per file, named for what's in it.** File names and index lines are how the agent decides what to open, so `critical-alerts-to-phone.md` beats `notes-3.md`.
4. **Write the index descriptions yourself.** The ones my script generated were the weakest part of my conversion.
5. **If a rule must never break, make it a hook.** Text is a suggestion the agent can talk itself out of.
6. **Facts go stale.** Put a date on the ones that will (OKF has a `stale_after` field for this), so something reminds you to check them.

## How I write a CLAUDE.md now

Short, and only what Claude needs on nearly every task. Anthropic's [own guidance](https://code.claude.com/docs/en/memory) is to keep each CLAUDE.md under 200 lines, and after this experiment I'd go further.

What goes in mine:

- **How I want work done:** testing, code style, git workflow. These apply to almost everything I ask for.
- **Rules, not essays.** One or two sentences per rule. If the reason changes how Claude should act, I keep it; otherwise it goes.
- **A pointer to everything else.** Situational stuff lives in a knowledge folder, and the last line tells Claude where the index is.

What stays out: anything about one project or one service, long examples, anything Claude can figure out by reading the code, and anything a hook can enforce instead.

## Doing it yourself

You can get most of this in an afternoon. [The full post](https://www.joekarlsson.com/blog/claude-md-open-knowledge-format/) has a prompt you can paste into Claude Code from the root of your repo, plus how I tested it. When it finishes, Claude lists what it kept always-on and why. Read that list before you commit. That's where your judgment matters most.

Once your docs are already lean, this buys you little. I split my global `~/.claude/CLAUDE.md` the same way afterward and saved 312 tokens, because nearly all of it is rules that apply everywhere.

<a class="button" href="https://www.joekarlsson.com/blog/claude-md-open-knowledge-format/">Read the full post</a>
