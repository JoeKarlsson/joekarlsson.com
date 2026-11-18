---
title: 'How I use AI (November 2026)'
date: 2026-11-17T10:14:17Z
slug: 'how-i-use-ai-2026'
description: 'How I use AI in November 2026: agents help run my house and homelab, and six layers, from a short CLAUDE.md down to Claude Code hooks, decide what they can touch.'
categories: ['AI']
tags: ['Claude Code', 'AI agents', 'CLAUDE.md', 'hooks', 'subagents', 'Home Assistant', 'homelab']
tldr: 'A lot of my AI use runs my house and homelab. What makes that safe is a stack of six layers: rules every session reads, knowledge it reads only when a task needs it, skills, subagents, memory, and hooks at the bottom for what has to hold. When a rule keeps failing where it is, it moves down the stack, and by the third repeat it is a hook. My AI policy is four lines, and code enforces two of them.'
faq:
  - question: 'How do you use AI agents day to day?'
    answer: 'As of November 2026, besides writing and code, a lot of my Claude Code sessions run my house and homelab: morning health checks, Home Assistant alerts, Plex problems and decommissioning services.'
  - question: 'What is the difference between CLAUDE.md, skills and hooks?'
    answer: 'CLAUDE.md is advice every session reads and the agent usually follows. A skill is a written workflow the agent loads when a task matches it. A hook is code that runs on a Claude Code event, such as a tool call or the end of a turn, and can block the agent no matter what it decided.'
  - question: 'How do you organize CLAUDE.md, skills, subagents and hooks?'
    answer: 'As six layers. Rules every session needs go in a short global CLAUDE.md. Rules for one kind of task go in knowledge files the agent reads only when an index says to. Repeated workflows are skills, independent reviews are subagents, judgment calls go in memory with the reason attached, and anything that must never happen is a hook.'
  - question: 'When should a CLAUDE.md rule become a hook?'
    answer: "When breaking it once would cost something you can't undo, or when you have typed the same correction about three times. A rule in CLAUDE.md is a suggestion the agent usually follows; a hook runs on the event you attach it to (a tool call, the end of a turn, a compaction) and can block it."
  - question: 'How do you let an AI agent manage a homelab safely?'
    answer: 'Start read-only. My health check investigates freely, reports every finding, proposes a fix and waits for my go-ahead. Anything irreversible, like writing inside an immutable container or restoring a Home Assistant backup, is blocked by a hook no matter what the agent thinks.'
heroImage: '/images/blog/how-i-use-ai-2026/thumb-a244ed5a.webp'
heroAlt: 'An 1855 engraving of the Erie Canal locks at Lockport, men leaning on a lock gate with the flight of locks stepping down behind them'
mastheadImage: '/images/blog/how-i-use-ai-2026/masthead-8d318eef.webp'
---

A prompt I type a lot: "Why is Plex down?" A lot of my AI use goes to my house and homelab, and it's the part I rarely see in other people's "how I use AI" posts. Letting agents work on a homelab taught me that one instruction file isn't enough. My setup is now a stack of six layers, from a short file every session reads to hooks that can block a command before it runs, and the most useful question I ask about any rule is which layer it belongs in.

The shape of this post comes from Ben Stolovitz's [How I use AI (Oct 2026)](https://ben.stolovitz.com/posts/how-use-ai-oct-2026/ 'cite: Ben Stolovitz, October 2026'), so you can read the two side by side. Claude wrote the first draft from my outline, notes and session logs, and I edited it.

## Background

I do developer relations at a data company, I paint, and I run a homelab in my attic where OpenTofu manages every container and Home Assistant runs the house. The terminal, voice dictation and git worktrees behind all this are in [my 2026 development setup](/blog/my-development-setup-2026/), and why I moved everyday coding to open models is in [Breaking up with Claude Code](/blog/breaking-up-with-claude-code/). Everything in this post still runs in Claude Code (version 2.1.327 as I write this), and it's about what sits on top of the tools.

## Running my house

![Collage animation: an old computer terminal lands in the middle of the frame, then a 1710 dollhouse drops in, the big terminal falls away and a small one slides into one room. A 1950 TV and a pink Edison bulb fill the rooms beside it, and the label reads "Not all of it is code."](/images/blog/how-i-use-ai-2026/not-all-code.svg)

One prompt from earlier this month: "On Home Assistant, I just got a critical alert. Heat safeguard failed. What's going on?" Agents run my homelab health check, clean up Home Assistant automations, sort media libraries and walk me through decommissioning services I've stopped using.

A bad command in a homelab deletes real things, so the house runs on a ladder. Each rung can do more damage than the one before it:

1. **Read anything.** Logs, configs, `journalctl`, backup reports. Reading never needs my OK.
2. **Propose, then wait.** My health check's instructions say to report every finding with its root cause, propose a fix for each, and wait for my go-ahead before changing anything, "even for fixes that seem obviously safe."
3. **Change it after I say yes.**
4. **Some things never happen, whatever I say in chat.** OpenTofu manages every container, and they're supposed to be immutable, so a hook blocks any write inside one and lets read-only commands through. Other hooks stop an agent from restoring a Home Assistant backup or deleting a certificate on my reverse proxy.

## The six layers

![My AI setup as a stack of six layers, from the top: always-on rules ("Don't hide failures"), knowledge read on demand (design rules, read before building a page), skills (the health check, decommissioning a service), subagents (reviewers who never compare notes), memory and decisions ("Never swap the site font unasked") and, at the bottom in pink, hooks (no writes inside an immutable container). An arrow down the side says a rule that keeps failing moves down a layer.](/images/blog/how-i-use-ai-2026/layer-stack.svg)

### 1. Always-on rules

My global `CLAUDE.md` is 55 lines, and every Claude session on every machine reads it first. It only holds what's true everywhere: test the change yourself, don't hide failures, read a subagent's diff before believing it, stay in the repo you were asked to work in. When my notes grew past that, every session paid for rules it didn't need, and [splitting my homelab notes by concept](/blog/claude-md-open-knowledge-format/) cut startup context in half.

### 2. Knowledge read on demand

Long rule sets live in separate files: 36 banned AI design patterns, 19 UX laws, a website launch checklist, motion rules. An index tells the agent when to read each one, in its own terms: "Read before designing or styling any website, web page, HTML artifact..." The index line is the part that matters, since the agent only opens a file when a line tells it to.

### 3. Skills

A skill is a workflow I'd otherwise explain again every time: the health check, decommissioning a service, writing a blog post, `/grill-me` for stress-testing a plan before I commit to it. Skills fail by not firing. My "lazy senior dev" skill, meant for every coding task, loaded zero times in 1,550 sessions in my logs because its trigger never matched. Now a hook reminds the agent to load it on the first code edit.

### 4. Subagents

A subagent gets one job and its own context. My site's design review runs four reviewers in parallel, and none of them sees what the others found, because in my runs reviewers who read each other's notes tended to agree with what was already there. They have their own failure: they drift toward convention and sand the personality off a page, so each one now gets a list of the quirks to leave alone.

### 5. Memory and decisions

This layer holds judgment calls: "never swap the site font unasked," "employer posts never use the employer's stock art." My site's memory has about 60 of them, and each one carries a dated "Why" in my own words, so an agent can tell a hard rule from a one-off preference. Design verdicts go in a `DECISIONS.md` in the repo.

Verdicts kept getting lost when a long session compacted its context. My logs had 17 messages like "This is the fourth time I've told you" in a month. A hook now reloads `DECISIONS.md` after every compaction.

### 6. Hooks

A hook is code that runs on a Claude Code event, and some of them can stop the agent. One runs before every shell command and blocks writes inside an immutable container. One runs when the agent tries to end its turn, and another reloads `DECISIONS.md` when a session starts or compacts. Not every hook blocks: the one for my lazy senior dev skill only reminds, and the agent can still ignore it.

Blocking hooks fail by blocking too much. In October the container guard made me use its override for a plain `SELECT` on my analytics database, and on November 12 I replayed 337 blocked SSH commands from my session history and let through the harmless reads among them. Hooks also only see what goes through Claude Code, so a command I type in my own terminal skips all of them. I covered [what hooks and mods can and can't catch](/blog/claude-code-mods-first-impressions/) in October.

## How a rule moves down

![Animation: an agent sends the same wrong action at my repo three times. The first time, a chat bubble says "No, not like that" and the action gets through anyway. The second time, the rule is a line in CLAUDE.md and it still gets through. The third time, the rule is a hook: a pink gate drops across the path and the action stops at it.](/images/blog/how-i-use-ai-2026/third-repeat.svg)

Most rules start as something I say once in chat. If I have to say it again, it goes into memory or `CLAUDE.md`. If I have to say it a third time, it becomes a hook.

The clearest case was mockups. I want to see a design on my screen before an agent builds it, and agents kept handing me a file path instead. The rule sat in my homelab project's memory, where agents in my other repos never saw it, and in the four weeks before the fix I typed some version of "open it" about 45 times. On November 9 I typed "I always have to remind you, and then tell you to make a skill or a hook or a memory." The hook shipped on November 12: when an agent makes a page and tries to end its turn without opening it, the hook stops it and hands it the paths to open. In the five days since, I've had to ask once, which is a short window.

Mitchell Hashimoto [described the same instinct](https://mitchellh.com/writing/my-ai-adoption-journey 'cite: Mitchell Hashimoto, February 2026') in February: when an agent repeats a mistake, build something so it can't.

## Where does a rule go: CLAUDE.md, skill or hook?

When I'm about to tell an agent something for the second time, I go down six questions and stop at the first yes. They don't follow the stack's order: what a mistake would cost comes first, then what kind of rule it is.

![Flowchart for deciding where a rule goes, asked in order and stopping at the first yes. Would breaking it once cost something I can't undo, or have I said it three times? A hook. Does every session in every repo need it? The global CLAUDE.md. Is it a judgment call with a reason? Memory or DECISIONS.md. Is it steps I'd explain again? A skill. Does it need fresh eyes? A subagent. Does it only matter for one kind of task? A knowledge file with an index line. No to all of them: leave it in chat.](/images/blog/how-i-use-ai-2026/where-does-it-go.svg)

## My AI policy

![Jacob Appel's painting of Petronella Oortman's dollhouse, a tall cabinet with nine open rooms full of tiny furniture and figures](/images/blog/how-i-use-ai-2026/petronella-oortman-dollhouse.webp "margin: Jacob Appel's painting of Petronella Oortman's dollhouse, c. 1710, the house in this post's collage. Wikimedia Commons")

Ben is drafting a personal AI policy. Mine is four lines, and the layer that enforces each one matters more than the wording:

1. **I don't generate images, music or video.** Pictures here are public-domain photos, meme templates and my own recordings. A test fails any thumbnail whose photo lacks a Wikimedia Commons credit.
2. **What I say in chat stays in chat.** An agent hears a lot about my life while it works on my house. That rule lives in its memory.
3. **Nothing irreversible happens without me.** Hooks block it.
4. **AI drafts and I edit.** The pipeline for that is a skill, and I wrote about [building it in 2025](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/).

Code enforces two of the four. The other two depend on the agent remembering.

## What I'd copy first

1. Count your repeats. The third time you type the same correction, make it a hook.
2. Start your agents read-only, and make them propose before they change anything.
3. Write down why with every correction, so the next session knows how hard the rule is.
