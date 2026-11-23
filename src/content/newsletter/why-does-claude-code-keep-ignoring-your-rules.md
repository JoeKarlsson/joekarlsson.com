---
title: 'Why Does Claude Code Keep Ignoring Your Rules?'
seoTitle: 'Why Claude Code Ignores Your Rules'
date: 2026-12-10T09:00:00Z
slug: 'why-does-claude-code-keep-ignoring-your-rules'
description: 'Six places a rule for an AI agent can live, and how I decide when a rule should stop being advice and become a hook.'
recapOf: 'how-i-use-ai-2026'
cardPhoto: '/images/newsletter/why-does-claude-code-keep-ignoring-your-rules/card-photo.webp'
cardPhotoAlt: 'a c. 1855 lithograph of the Erie Canal locks at Lockport, men leaning on a lock gate with the flight of locks stepping down behind them'
marginNotes:
  - type: see
    at: is 55 lines
    text: When my notes grew past that, every session paid for rules it didn't need. Splitting my homelab notes by concept cut startup context in half.
    post: claude-md-open-knowledge-format
  - type: see
    at: Blocking hooks fail by blocking too much
    text: What hooks and mods can and can't catch, from October.
    post: claude-code-mods-first-impressions
heroImage: '/images/newsletter/why-does-claude-code-keep-ignoring-your-rules/card-7e4915c2.webp'
heroAlt: 'Works on My Machine card for Why Does Claude Code Keep Ignoring Your Rules?, with a c. 1855 lithograph of the Erie Canal locks at Lockport, men leaning on a lock gate with the flight of locks stepping down behind them framed in a pink crayon box'
---

When Claude Code kept ignoring my rules, the rule was usually somewhere the agent couldn't see, or advice when it needed to be code. The clearest case was mockups. I want to see a design on my screen before an agent builds it, and agents kept handing me a file path instead. In the four weeks before the fix, I typed some version of "open it" about 45 times. The rule sat in my homelab project's memory, where agents in my other repos never saw it. On November 9 I typed "I always have to remind you, and then tell you to make a skill or a hook or a memory."

![The same wrong action sent from an agent at my repo three times. The first time, a chat bubble says "No, not like that" and the action gets through anyway. The second time, the rule is a line in CLAUDE.md and it still gets through. The third time, the rule is a hook: a pink gate across the path, and the action is blocked.](/images/blog/how-i-use-ai-2026/third-repeat.svg)

The hook shipped on November 12: when an agent makes a page and tries to end its turn without opening it, the hook stops it and hands it the paths to open. In its first five days I had to ask once, which is a short window.

A rule in `CLAUDE.md` is a suggestion the agent usually follows. A hook is code that runs on a Claude Code event, like a tool call or the end of a turn, and the blocking kind can stop the agent no matter what it decided. Most rules start as something I say once in chat. If I have to say it again, it goes into memory or `CLAUDE.md`. If I have to say it a third time, it becomes a hook.

## Where a rule can live

My setup is now a stack of six layers, from a short file every session reads to hooks that can block a command before it runs. The most useful question I ask about any rule is which layer it belongs in.

![My AI setup as a stack of six layers, from the top: always-on rules ("Don't hide failures"), knowledge read on demand (design rules, read before building a page), skills (the health check, decommissioning a service), subagents (reviewers who never compare notes), memory and decisions ("Never swap the site font unasked") and, at the bottom in pink, hooks (no writes inside an immutable container). An arrow down the side says a rule that keeps failing moves down a layer.](/images/blog/how-i-use-ai-2026/layer-stack.svg)

1. **Always-on rules.** My global `CLAUDE.md` is 55 lines, and every Claude session on every machine reads it first. It only holds what's true everywhere: test the change yourself, don't hide failures, read a subagent's diff before believing it.
2. **Knowledge read on demand.** Long rule sets live in separate files: 36 banned AI design patterns, 19 UX laws, a website launch checklist. An index tells the agent when to read each one, since it only opens a file when a line tells it to.
3. **Skills.** A skill is a workflow I'd otherwise explain again every time. Skills fail by not firing. My "lazy senior dev" skill, meant for every coding task, loaded zero times in 1,550 sessions in my logs because its trigger never matched. Now a hook reminds the agent to load it on the first code edit.
4. **Subagents.** My site's design review runs four reviewers in parallel, and none of them sees what the others found, because in my runs reviewers who read each other's notes tended to agree with what was already there. They have their own failure: they drift toward convention and sand the personality off a page, so each one now gets a list of the quirks to leave alone.
5. **Memory and decisions.** Judgment calls like "never swap the site font unasked," each with a dated "Why" in my own words, so an agent can tell a hard rule from a one-off preference. Verdicts kept getting lost when a long session compacted its context: my logs had 17 messages like "This is the fourth time I've told you" in a month. A hook now reloads `DECISIONS.md`, where my design verdicts live, after every compaction.
6. **Hooks.** Not every hook blocks: the one for my lazy senior dev skill only reminds, and the agent can still ignore it. Blocking hooks fail by blocking too much. In October the container guard made me use its override for a plain `SELECT` on my analytics database, and on November 12 I replayed 337 blocked SSH commands from my session history and let through the harmless reads among them. Hooks also only see what goes through Claude Code, so a command I type in my own terminal skips all of them.

## A permission ladder for my homelab

One prompt from November: "On Home Assistant, I just got a critical alert. Heat safeguard failed. What's going on?" Agents run my homelab health check, clean up Home Assistant automations, sort media libraries and walk me through decommissioning services I've stopped using.

A bad command in a homelab deletes real things, so the house runs on a ladder. Each rung can do more damage than the one before it:

1. **Read anything.** Logs, configs, backup reports. Reading never needs my OK.
2. **Propose, then wait.** My health check's instructions say to report every finding with its root cause, propose a fix for each, and wait for my go-ahead before changing anything, "even for fixes that seem obviously safe."
3. **Change it after I say yes.**
4. **Some things never happen, whatever I say in chat.** OpenTofu manages every container, and they're supposed to be immutable, so a hook blocks any write inside one. Other hooks stop an agent from restoring a Home Assistant backup or deleting a certificate on my reverse proxy.

## My AI policy

Ben Stolovitz, whose [How I use AI (Oct 2026)](https://ben.stolovitz.com/posts/how-use-ai-oct-2026/) gave my post its shape, is drafting a personal AI policy. Mine is four lines, and the layer that enforces each one matters more than the wording:

1. **I don't generate images, music or video.** Pictures here are public-domain photos, meme templates and my own recordings. A test fails any thumbnail whose photo lacks a Wikimedia Commons credit.
2. **What I say in chat stays in chat.** An agent hears a lot about my life while it works on my house. That rule lives in the agent's memory.
3. **Nothing irreversible happens without me.** Hooks block it.
4. **AI drafts and I edit.** The pipeline for that is a skill.

Code enforces two of the four. The other two depend on the agent remembering.

## What I'd copy first

1. Count your repeats. The third time you type the same correction, make it a hook.
2. Start your agents read-only, and make them propose before they change anything.
3. Write down why with every correction, so the next session knows how hard the rule is.

When I'm about to tell an agent something for the second time, I go down six questions and stop at the first yes.

![Flowchart for deciding where a rule goes, asked in order and stopping at the first yes. Would breaking it once cost something I can't undo, or have I said it three times? A hook. Does every session in every repo need it? The global CLAUDE.md. Is it a judgment call with a reason? Memory or DECISIONS.md. Is it steps I'd explain again? A skill. Does it need fresh eyes? A subagent. Does it only matter for one kind of task? A knowledge file with an index line. No to all of them: leave it in chat.](/images/blog/how-i-use-ai-2026/where-does-it-go.svg)

<a class="button" href="https://www.joekarlsson.com/blog/how-i-use-ai-2026/">Read the full post</a>
