---
title: 'I run eight Claude Code panes at once, and my brain is melting'
date: 2026-11-17T08:45:47Z
slug: 'context-switching-ai-coding-agents'
seoTitle: 'Context switching with AI coding agents'
description: "Coding agents made my context switching worse. What's helped is talking to one orchestrator agent that runs the rest."
cardPhoto: '/images/newsletter/context-switching-ai-coding-agents/card-photo-plates.webp'
cardPhotoAlt: 'circus performers spinning plates on tall sticks under a spotlight, seen from above'
heroImage: '/images/newsletter/context-switching-ai-coding-agents/card-61b4e5d7.webp'
heroAlt: 'Works on My Machine card for I run eight Claude Code panes at once, and my brain is melting, with circus performers spinning plates on tall sticks under a spotlight, seen from above framed in a pink crayon box'
interlude:
  after: 'One pane instead of eight'
  line: "A summary hides detail, and I've caught myself approving work I never read."
---

Most days I have six to eight terminal panes open, each one a Claude Code session working through a problem. Some are in different projects. A few are in the same repo, working on different parts of it. Switching between those panes is what I do all day, every day.

In [my 2026 development setup post](https://www.joekarlsson.com/blog/my-development-setup-2026/) I wrote that I usually have "three to six Claude Code sessions going at once, on different tasks, until my brain starts to melt from the context switching." It's six to eight now.

I expected coding agents to cut down on my context switching, and they've made it worse. It's been one of the most unexpected parts of this era of coding for me. What's helped most is talking to one Claude session and letting it hand the work out to the others, so most of my attention goes to one pane instead of eight. It hasn't solved the problem, though, and I'd like to know what's working for you.

![A Ghostty window split into five panes, each running its own Claude Code session on a different task, with a status line under each pane naming the task](/images/blog/my-development-setup-2026/ghostty-claude-code-splits.webp)

## Why agents make context switching worse

An agent takes a few minutes (to several hours) to do anything real. Sitting there watching it feels like a waste, so I start another one on something else, and then another. Now I'm running work in parallel, and every few minutes I also have to check what each agent did, figure out where it was, and decide what it should do next.

I'm not the only one. In [Anthropic's study of how its own engineers use Claude](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic 'cite: Anthropic, December 2025'), one says they "constantly have at least a few [Claude] instances running."

People have always been bad at this, and it's been one of the biggest problems in programming for as long as I've been doing it. Psychologists have measured it for decades. In [Rubinstein, Meyer and Evans's task-switching experiments](https://doi.org/10.1037/0096-1523.27.4.763 'cite: Rubinstein, Meyer & Evans, 2001'), every switch cost time, the cost grew with how complicated the rules were, and it shrank when people got a cue telling them which task came next.

The study that sounds most like my day is Gloria Mark's. In [The cost of interrupted work](https://interruptions.net/literature/Mark-CHI08.pdf 'cite: Mark, Gudith & Klocke, CHI 2008'), people who got interrupted finished their work faster, at the same quality, and reported more stress, frustration and time pressure, which is the same trade I make with agents every day.

For my ADHD brain, it's not terrible, since jumping around is how I already work. But I've noticed it getting worse in this era, and some days my brain melts down by the end of the day.

## One pane instead of eight

What's helped the most is an orchestrator. I talk to one Claude Code session, and my CLAUDE.md tells it to hand the work out to subagents, keep going while they run, and come back with short summaries of what each one did. It's like being a general in an army: I give orders to one officer, and the officer runs the troops, so most of my attention goes to the orchestrator.

![Before: a pink arrow from me jumps between eight Claude Code panes, one after another. After: the panes fold into one orchestrator pane I talk to, with seven small subagent panes behind it, and the subagents' summaries travel back through the orchestrator to me.](/images/newsletter/context-switching-ai-coding-agents/one-pane.svg)

Here's the kind of instruction that does it:

```markdown
## Subagents

- I talk to you, and you run the work. Hand each independent
  task to a subagent and keep going while it runs. <!-- [!margin] Everything else runs behind this one pane. -->
- When one finishes, tell me in two or three lines what it
  did, what it changed, and anything that needs me. <!-- [!margin] Short on purpose: a quick cue to switch back. -->
- Stop me only for a decision that's mine to make.
```

Claude Code's subagents are built for this. Each one works in [its own context window and returns only the summary](https://code.claude.com/docs/en/sub-agents 'cite: Anthropic, Claude Code docs'), so the long, messy work never lands in the pane I'm reading. The skills and agents it hands work to live in [my personal skills repo](https://www.joekarlsson.com/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/).

![Xzibit Yo Dawg meme: "Yo dawg, I heard you hate context switching, so I put an agent in your agent so it can switch for you"](/images/newsletter/context-switching-ai-coding-agents/meme-yo-dawg.webp)

I think this works for the same reason the cue helped in Rubinstein's experiments. A summary that says what happened and what's next is a cue. I read three lines and know where I am, instead of scrolling back through a pane trying to remember what I asked for an hour ago. I haven't measured it, but it's cut my context switching within a project a lot. I still switch between projects, but there are fewer panes to switch between.

It isn't free. A summary hides detail, and I've caught myself approving work I never read. That same study calls this [the paradox of supervision](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic 'cite: Anthropic, December 2025'): checking the work takes the skills that handing off the work lets slip.

Orchestration also burns tokens. Anthropic says its multi-agent research system uses [about 15 times as many tokens as a chat](https://www.anthropic.com/engineering/multi-agent-research-system 'cite: Anthropic, June 2025').

I'd heard that Anthropic knows about this context-switching problem and tells Claude to keep its replies simple so people can follow along. I couldn't find Anthropic saying that. Claude Code does have a [Concise output style](https://code.claude.com/docs/en/output-styles 'cite: Anthropic, Claude Code docs') that leads with the result and drops the recap, Whatever the reason, simplicity is the name of the game for me in this era, and short replies are a big part of that.

If you want to try this, pick one session to be the one you talk to and let it delegate the rest.

A side note on personas. I used to give my subagents names, describe what they looked like and what they wore, and give them a little bit of a life. It felt like it made them more opinionated and better, but the research says otherwise. The [Principled Personas](https://arxiv.org/abs/2508.19764 'cite: EMNLP 2025') study found that details with nothing to do with the task, like a name, change results unpredictably, and often for the worse. [A 2026 study of agents](https://arxiv.org/abs/2602.12285 'cite: AAAI 2026 TrustAgent Workshop') doing planning and technical work found the same drop, plus less consistent runs.

The only persona I kept is on my reader reviewer, an agent that reads my drafts as the stranger they're written for. It gets a specific kind of reader and no name at all:

> **What they already know:** a working developer who uses git, Docker, APIs and an AI coding tool every day. …
>
> **What they're scanning for:** something they could use or borrow this week, or a surprising result with the proof attached. …
>
> **What makes them leave:** not knowing what the thing is by the second sentence, a sales tone, or a term they'd have to look up.

## Where I'm still stuck

Some of the advice I've read says to cap yourself at two or three agents. I get why, but that treats the number of agents as the problem, and I think the problem is the number of panes I have to talk to. I still haven't gotten that down to one.

I don't know if there's a fix, so I want to hear from you. How are you dealing with this? Has a pane manager like [claude-squad](https://github.com/smtg-ai/claude-squad), [workmux](https://github.com/raine/workmux) or [CCManager](https://github.com/kbwo/ccmanager) actually cut down your switching, or does it just make eight panes easier to look at? What open source tools are you using? Hit reply, and it comes straight to me.
