---
title: 'My Personal Claude Code Skills Repo Accidentally Became Internal Tooling'
date: 2026-04-07
slug: 'my-personal-claude-code-skills-repo-accidentally-became-internal-tooling'
description: 'I built a few Claude Code skills for myself because I was tired of copy-pasting the same prompts. Then my coworkers started asking questions. Here is what happened when a personal productivity tool became team infrastructure.'
categories: ['DevRel', 'Dev Tools']
tags: ['Claude Code', 'AI', 'devrel', 'automation', 'internal tooling', 'marketing']
heroImage: '/images/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/claude-code-skills-repo-internal-tooling.webp'
heroAlt: 'Three monitors showing code in a dark office overlooking the New York City skyline with a purple tint'
tldr: 'Skills are just markdown files you can share via git. CLAUDE.md is the part nobody explains properly and it matters more than the skills themselves. Onboarding non-technical people is harder than building the thing. Start for yourself, share when a coworker asks.'
---

I'm a developer on the marketing team at CloudQuery, where I also lead DevRel. That's a slightly unusual combination - technical enough to be dangerous, embedded in a non-technical team that has real content needs every week. Which is probably why I ended up here.

I didn't set out to build internal tooling. I built a few Claude Code skills for myself because I was tired of copy-pasting the same prompts over and over, and repeating myself endlessly is the particular kind of pain that eventually makes you do something about it.

Then my coworkers started asking questions.

---

## Why Claude Code Specifically

Before getting into how, I want to address the obvious question: why not just use ChatGPT, or Cursor, or a shared Notion page full of prompts?

The honest answer is that none of those are actually shareable in the way this is. A Notion prompt library requires people to find the page, copy the prompt, paste it somewhere, and remember to update it when things change. ChatGPT has no concept of project context - every session starts fresh, every person has their own conversation history, nothing is shared. Cursor is great but it's built for code, not for a team that's mostly writing blog posts and pulling SEO reports.

What Claude Code has that nothing else has in quite the same way: skills are files. They live in a git repo. They version-control exactly like code. The `CLAUDE.md` gives Claude project context that travels automatically with every session. And the permission system means I can give a non-technical teammate access to a skill that calls external APIs and runs Python scripts without worrying that they'll accidentally do something destructive.

The other thing is that skills can actually do things - they're not just prompts, they're workflows. A skill can read files, call APIs, run scripts, check a schedule, write output somewhere. That's a different category of tool than a saved ChatGPT prompt. It's closer to automation than to chat.

It's not perfect. The CLI is a real barrier for non-technical users. There's no GUI. But the tradeoffs make sense for a team that's going to be running the same workflows every week and needs the output to be consistent.

---

## It Started Selfish (That's Fine)

When Claude Code dropped slash commands - custom `/commands` you define in markdown files - I immediately got it. Write a skill once, give it the context it needs, invoke it any time with a slash command. No more re-explaining our brand voice. No more pasting the same "you are a marketing writer for a B2B data platform" preamble into every session.

So I built a few things for myself. `/social` to turn blog posts into LinkedIn copy. `/seo-analysis` to pull traffic data from Plausible and GSC without manually querying three different tools. Stuff I was doing every week that I hated doing every week.

The thing that makes skills shareable - and this is the part that unlocked everything - is that they're just markdown files. A skill is a prompt with some frontmatter. It lives in `.claude/commands/`. You can read it, version control it, share it with `git clone`. It's basically a documented runbook that Claude executes.

So when a coworker said "hey, can you show me how you do that LinkedIn thing?" - the answer wasn't a Notion doc or a prompt to paste somewhere. It was "clone this repo."

---

## CLAUDE.md: The Thing Most Posts Don't Explain

Every tutorial about Claude Code explains slash commands. Almost none of them explain `CLAUDE.md`, which is honestly the more important piece.

It's a file at the root of your repo that Claude reads automatically at the start of every session. Your team's standing context, always loaded, never forgotten. We put things like: never schedule posts on weekends, Plausible is our primary traffic source not GA4, brand voice lives in `BRAND_VOICE.md` and should be checked before writing anything, never auto-schedule without user approval. Team conventions that used to live in someone's head or a Notion page nobody reads.

When a new teammate opens the project and runs a skill for the first time, Claude already knows all of it. They don't have to learn it. They don't have to ask me. It's just there.

If you only take one thing from this post: write a solid `CLAUDE.md` before you write your third skill. The skills are the features. The `CLAUDE.md` is the foundation.

---

## Nobody Warned Me About the Terminal Problem

Here's the part nobody writes about.

I'm on a marketing team. My coworkers are great at their jobs - writing, strategy, campaigns, all of it. Most of them had never opened a terminal. The gap between where they were and "clone a repo and run a command" was not small, and pretending it was small would have killed adoption before it had a chance.

We ran a lot of training sessions. Not one big "here's how this works" meeting - those don't stick. Short, focused sessions on specific workflows. Not "here's what Claude Code is," but "here's how to turn a blog post into scheduled social content in ten minutes." The tool is secondary. The workflow is what people remember.

I also built a `/setup` wizard - a skill whose entire job is onboarding. It runs a setup checker, and instead of dumping raw error output at someone, it explains each failure in plain English and either fixes it automatically or tells you exactly who to ask. The instructions inside that skill literally say: be friendly, patient, avoid jargon. Because I wrote it knowing I wasn't the one who'd be running it.

There's also an init script that outputs `[OK]`, `[WARN]`, and `[FAIL]` lines so anyone can immediately see their status without having to understand what any of it means. Small thing. Huge difference in how people felt about whether the thing was "working."

The reframe that helped me most: the product isn't the skills. It's the experience of getting someone from zero to their first successful run. That's what determines whether they come back.

---

## Documentation Is the Whole Thing

I'll be direct about this because it's the thing people skip: documentation isn't optional. It's not polish. It's the product.

Every skill in the repo has a corresponding doc in a `docs/` folder. Not a README, an actual guide - what the skill does, what it needs configured, what good output looks like, what to do when something breaks. The structure is pretty simple:

```
.claude/
  commands/          # The skills (markdown files Claude executes)
    social.md
    seo-analysis.md
    setup.md
    ...
docs/                # Guides for humans
  social.md
  seo-analysis.md
  adding-skills.md
scripts/             # Python scripts the skills call out to
CLAUDE.md            # Auto-loaded project context
BRAND_VOICE.md       # Referenced by every content skill
.env.example         # Key template - never commit .env
```

The separation between `.claude/commands/` and `docs/` is intentional. Skills are dense - they're instructions written for Claude, not for people. The docs are for the human who runs the skill and has no idea what's happening underneath.

A skill without documentation gets used once.

---

## Here's What It Actually Saved Me

Concrete example: we publish a blog post, and then someone needs to write LinkedIn copy that matches our brand voice, check the length, pick a publish date that doesn't collide with anything else we have scheduled, and get it into our scheduling tool. That's writing, review, and three different tabs. On a busy week it just didn't happen, and the post would sit there, unshared.

Now it's `/social blog-slug`. Claude fetches the post, writes platform-specific copy in our voice, checks the schedule for open slots, drafts everything for review. The whole thing takes a few minutes, most of which is me actually reading the output.

I'm not going to pretend I measured this rigorously. But the qualitative shift is real: things that required dedicated time now happen as a side effect of other work. The bigger win isn't the time saved, it's the stuff that was getting skipped that now actually happens.

---

## Shared Context Is Underrated

The most valuable file in the repo isn't a skill. It's `BRAND_VOICE.md`.

Brand voice, messaging framework, the words we're not allowed to use ("unlock," "seamless," "game-changer," a long list), current product positioning - all of it checked in, all of it referenced automatically by every content-generating skill. When someone runs `/social` or `/rewrite` or `/blog`, Claude already knows how we talk about our product. The output sounds like us rather than like every other AI-generated B2B marketing piece on the internet.

The other thing: updating the brand voice is a PR. One PR, and every skill picks it up on the next `git pull`. That's a sentence that would have sounded like nonsense two years ago and now it's just how we work.

---

## Who Owns This When You're On Vacation?

This is the question most posts about internal AI tooling don't touch.

Skills drift. Model updates happen quietly and sometimes change how instructions are interpreted - a skill that worked great in January might produce subtly worse output in March for no obvious reason. Someone needs to be watching for that. There's a Slack channel where people report weird behavior. There's an owner (me, for now, ideally not just me forever) who watches for regressions and reviews PRs. The `/update` skill exists specifically because non-technical users shouldn't have to know what `git pull` is just to get the latest version of the tools.

Every serious writeup on AI adoption at scale talks about designating an "AI champion" - someone in each team who owns the tooling, fields questions, and keeps things from rotting. I ended up in that role by accident. If you're doing this intentionally, name it explicitly and give that person time to actually do it.

---

## When It Goes Wrong

This stuff breaks. Worth being honest about that.

The most common failure: a model update ships and a skill starts producing something subtly off. Not broken obviously - just slightly wrong tone, or it stopped following a rule it used to follow. You might not catch it immediately. Someone on the team will notice and report it as "the LinkedIn skill is acting weird." This happened to us - an update changed how the model handled long context, and one of our skills started ignoring word count guidelines that were buried near the bottom of its instructions. The fix was moving them to the top. Ten minutes to diagnose, two to fix. But you have to be watching.

The other failure modes: skills that depend on external APIs break when those APIs change. An endpoint moves, a rate limit gets hit, a response format changes. Build in graceful failures - if a script errors, the skill should explain what broke in plain English rather than dumping a stack trace at someone who doesn't know what a stack trace is.

And documentation rot. A skill evolves, the doc doesn't, six months later someone follows stale instructions and gets confused. Keep docs in the same PR as skill changes. Make it a rule before you have to learn it the hard way.

None of this is catastrophic. It's just maintenance, same as any other piece of infrastructure. Plan for it and you won't be surprised by it.

---

## How It Actually Got Good

I didn't start small on purpose - that was just the reality. A handful of skills, a few people using them, enough surface area to figure out what was broken.

The things I learned from actual usage that I never would have figured out in advance: people needed a way to update the repo without knowing git, so `/update` exists. Raw Python error messages meant nothing to non-technical users, so the setup wizard learned to translate every failure into a plain sentence plus a next action. API keys are confusing - which key does what, where do you get it, who do you ask - so the setup flow answers all of it before people have to ask. People wanted to know if something was configured and working before they tried to use it, so `/status` exists.

Every single one of those improvements came from someone running into something and telling me. The only reason the feedback loop worked is that the team felt comfortable saying "this is confusing" instead of quietly giving up and going back to the old way. That's harder to engineer than any of the actual tooling.

---

## Yes, I Thought About Security

Three quick things since developers will ask: API keys live in `.env`, which is gitignored - there's a `.env.example` with the template, every machine keeps its own copy. Skills can declare which tools they're allowed to use via `allowed-tools` frontmatter, so a skill that only needs to read files can't accidentally run shell commands. And Claude Code will ask before doing anything destructive - don't route around those prompts, they exist for a reason and they're especially important when non-technical users are running things they don't fully understand.

---

## Getting People to Contribute

Getting people to use the repo is one problem. Getting people to actually add to it is a different one.

Making it easy helps - a skill is a markdown file, not a coding project, and I built `/new-skill` to scaffold the structure so you don't have to remember the frontmatter format. But what's helped more than anything is being specific. "Hey, could you write a skill for the discovery questions you use on sales calls?" lands completely differently than "feel free to contribute if you want to." Specific ask, clear outcome, obvious value. That's the thing that gets PRs opened.

---

## This Is a Living Thing, Not a Project

I want to be clear about something that doesn't come through in most "here's how I built X" posts: this repo is not done. There is no done.

Almost every day I'm making some adjustment. A skill that needed tweaking based on feedback from the team. A new tool we adopted that needed a skill built around it. A workflow that changed and quietly broke something that was working fine the week before. The model updates and sometimes that shifts behavior in ways you don't notice until someone mentions it. The team's needs evolve. The product evolves.

That's not a flaw in the approach - it's the nature of it. This is infrastructure, not a project you ship and walk away from. If you go into it expecting to build it once and be done, you'll be disappointed. If you go in expecting to tend it the way you'd tend anything that needs to stay useful over time - small adjustments often, paying attention, fixing things when they break - it compounds in ways that are hard to fully appreciate until you're six months in and your team is doing in ten minutes what used to take most of a morning.

---

## This Isn't Just a Marketing Thing

I built this for a marketing team because that's where I work, but I want to say clearly: the pattern generalizes. Any team with repeated workflows, shared context, and people with varying technical comfort levels can do this. Sales. DevRel. Support. Engineering onboarding. If your team does the same thing more than once a week and it involves writing, researching, or pulling data from somewhere - there's probably a skill for that.

---

## The Checklist I Wish I'd Had

Before you hand the repo to your team:

- [ ] `CLAUDE.md` exists and covers team conventions, key rules, and where things live
- [ ] Every skill has a corresponding doc in `docs/` - not just a README, an actual guide
- [ ] `.env.example` has all required keys with a comment explaining what each one is for
- [ ] A `/setup` skill or init script exists, runs clean, and produces human-readable output
- [ ] Skills use `allowed-tools` frontmatter to limit what they can access
- [ ] There's a `/update` command so non-technical users can pull changes without knowing git
- [ ] Someone is named as the owner - even if that's just you for now
- [ ] You've run at least one training session focused on a specific workflow, not the tool itself

---

## If I Were Starting Over

Build it for yourself first. The first skills should solve your actual problems, not problems you imagine your team will have. You'll learn the constraints faster.

Write a `CLAUDE.md` before your third skill. The shared context is what makes the output actually good at scale, not the individual skills.

Invest in onboarding before you invest in more features. A skill nobody can set up is worthless.

Train on workflows, not the tool. Nobody needs to understand how Claude Code works. They need to know how to do the thing they were already trying to do, but faster.

Name an owner. Someone needs to watch for regressions and field questions. "Anyone can contribute" means nobody is responsible, and eventually something breaks and stays broken.

And make it easy to say "this is confusing." That's the whole feedback loop right there.

---

The honest version of how this started: I built something for myself, it turned out other people had the same problems, and a coworker asked if they could use it. That's it. No grand vision, no roadmap, no stakeholder buy-in.

That's how most good internal tools start. The ones that get built on purpose, designed for everyone from the beginning, usually end up designed for nobody.

If you want to try this yourself, [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) is the best place to start - it's a community-maintained collection of skills, hooks, and `CLAUDE.md` examples that'll save you from reinventing a lot of wheels. And if you build something worth sharing, open a PR. That's how the good stuff spreads.

---

## Resources

- [Extend Claude with Skills - Official Docs](https://code.claude.com/docs/en/skills) - the authoritative reference for how skills and slash commands work
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - community-curated skills, hooks, CLAUDE.md examples. Very active.
- [How to Build Claude Code Skills That Actually Work](https://dev.to/whoffagents/how-to-build-claude-code-skills-custom-slash-commands-that-actually-work-1nje) - solid technical walkthrough on DEV Community
- [Claude Code Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/) - deep dive on CLAUDE.md, subagents, frontmatter
- [Why Top Marketers Are Building With Claude Code](https://medium.com/@tentenco/why-top-marketers-are-building-with-claude-code-90a2aaaf613f) - useful if you're trying to convince non-technical teammates
- [MKT1: The Secret to Making Claude Better at Marketing](https://newsletter.mkt1.co/p/build-marketing-strategy-skill-in-claude-code) - Emily Kramer's breakdown of real tools built by real marketers
