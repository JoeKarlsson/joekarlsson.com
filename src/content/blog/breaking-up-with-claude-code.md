---
title: 'Breaking up with Claude Code'
date: 2026-10-06
slug: 'breaking-up-with-claude-code'
description: 'OpenCode with open models, not a one-to-one swap for Claude Code. What broke, what fixed it, and which models I use.'
categories: ['Dev Tools', 'Homelab']
tags:
  [
    'OpenCode',
    'open models',
    'Claude Code',
    'OpenRouter',
    'LiteLLM',
    'DeepSeek',
    'Ollama',
    'Qwen',
    'AGENTS.md',
    'AI coding agents',
  ]
heroImage: '/images/blog/breaking-up-with-claude-code/hero.webp'
heroAlt: '3D illustration of a woman labeled "Me" covering her face with her hand, standing beside a man in a blue jacket with the Claude logo on the back, turned away from her'
tldr: "In October 2026 I moved my default coding agent from Claude Code to OpenCode running open-weight models through OpenRouter and my own LiteLLM gateway. DeepSeek V4.1 Flash passed every run of my own two-task test at about two cents a task. But OpenCode isn't a one-to-one swap for Claude Code: I had to test models on my own work instead of trusting leaderboards, make OpenCode send DeepSeek its reasoning back, force the agent to run its code before saying done, and accept that my homelab GPUs can't run a coding agent. Claude is still my escalation path for the hardest problems."
faq:
  - question: 'Is OpenCode with open models a drop-in replacement for Claude Code?'
    answer: 'No. Claude Code was quietly passing reasoning back between steps, checking its own work, and keeping tools inside the context window. With OpenCode I had to turn on interleaved reasoning for DeepSeek, add a plugin that makes the agent run its code before saying done, and test models on my own tasks.'
  - question: 'Which open model do you use for coding instead of Claude Code?'
    answer: 'DeepSeek V4.1 Flash. It passed every run of my two-task test in OpenCode at about two cents a task. DeepSeek V4 Pro handles harder work, and I still switch to Claude for the hardest problems.'
  - question: 'Why use OpenRouter and LiteLLM together?'
    answer: 'OpenRouter gives me one key for every open model I wanted to try. LiteLLM is my own gateway in front of it, so swapping a model is a one-line change, each app gets its own key and budget (OpenCode gets $20 a month), and local requests fall back to a cloud model if my GPU box is down.'
  - question: 'Can you run an open-model coding agent on a homelab GPU?'
    answer: "Not well. With 24GB of VRAM across two cards, the best coding model I can fit is a heavily quantized Qwen3-Coder 30B, which is stiff and weak in OpenCode. OpenCode's own instructions also take about 9,500 tokens, so small context windows drop the tools. I use my GPUs for Home Assistant voice and camera descriptions instead."
---

I switched my default coding agent from Claude Code to [OpenCode](https://opencode.ai/) running open models. Most of my coding now goes to DeepSeek V4.1 Flash for about two cents a task, and it passes the tests I give it.

But if you're used to Claude Code, **OpenCode with open models isn't a one-to-one swap.** Claude Code was quietly doing work for me that I never noticed until it was gone, like passing the model's reasoning back between steps and checking its own work more often. The model was fine. Everything around it needed work.

I'm early here. I've been at this for days, on two test tasks and a handful of models, so treat this as a field report and not a ranking. And "breaking up" is generous. Claude is the ex I still call when something is hard. I just don't call first anymore.

[Last week](/blog/my-development-setup-2026/) I wrote that local coding agents couldn't touch Claude Code. That's still true. What changed is that the hosted open models got good enough, and cheap enough, that I ran out of excuses.

_Tested with OpenCode 2.0.20, LiteLLM, and OpenRouter in October 2026._

## Why I'm leaving

**Price.** That's the big one. Claude is affordable for me today, but I can see where this is going. OpenAI and Anthropic are both [still burning cash](https://fortune.com/2025/11/12/openai-cash-burn-rate-annual-losses-2028-profitable-2030-financial-documents/), that bill comes due eventually, and I don't want my whole workflow tied to one vendor when they go up again.

And the open models got good:

![Scatter chart of LLM Stats coding rating against price per million tokens on a log scale. Proprietary models are orange squares and open-weight models are blue circles. Claude Opus 5.5 leads at 51.4 and $7.20. DeepSeek V4.1 Flash is the top open-weight model at 42.9 and $0.31, ahead of several proprietary models that cost 5 to 30 times more.](/images/blog/breaking-up-with-claude-code/coding-score-vs-price.webp)

_Built from the [LLM Stats coding leaderboard](https://llm-stats.com/leaderboards/best-ai-for-coding), October 6, 2026._

That chart cuts both ways. Claude Opus 5.5 still leads by 8.5 points. But DeepSeek V4.1 Flash costs 1/23 as much, and it beats several proprietary models that cost 5 to 30 times more. _Open models don't beat the best. They beat most of what's under it, for pocket change._

**Privacy.** Local models never leave my house, and I can turn them off. For hosted models, OpenRouter lets me [refuse any provider that trains on or keeps my prompts](https://openrouter.ai/docs/guides/routing/provider-selection). I feel a lot better pointing an agent at my infrastructure knowing that.

**Control.** With open models I get to choose the knobs: temperature, reasoning effort, whether the model thinks at all, which quantization I run. Claude Sonnet 5.5, by contrast, returns a 400 if you send it a non-default temperature.

**Visibility.** Every request goes through my own gateway and through OpenRouter, so I can see what each app spends, how slow each model is, and when something fell back to a backup model. With a single vendor, I got whatever dashboard they felt like giving me.

**Curiosity.** Kimi, GLM, MiniMax, Qwen, MiMo. I'd been reading about these models on leaderboards for a year without running one on real work.

Also, since February 2026, Anthropic [restricts Claude subscriptions to its own tools](https://www.theregister.com/software/2026/02/20/anthropic-clarifies-ban-on-third-party-tool-access-to-claude/5014546), so OpenCode users bring their own models anyway.

## The gateway

Everything that talks to a model in my house goes through one [LiteLLM](https://docs.litellm.ai/) gateway on my Proxmox cluster: OpenCode on my Mac, Home Assistant, my doorbell camera. Apps ask for a name like `cloud-coder` or `local-fast`, and the gateway decides which model that is today.

```
 OpenCode    Home Assistant    doorbell + other apps
      \             |              /
       +------ LiteLLM gateway ---+
       |  names, fallbacks, budgets
       +--------------------------+
          /                     \
    OpenRouter              my homelab GPUs
  (DeepSeek, GLM, Qwen)     (small local Qwen models)
```

That buys me three things. Swapping a model is a one-line change, and no app notices. If my GPU box is down, local requests fall back to a cloud model, so the doorbell still describes whoever is at the door at 2 AM. And each app gets its own key and [budget](https://docs.litellm.ai/docs/proxy/users): OpenCode gets $20 a month, so a runaway agent loop hits a wall instead of my credit card.

```yaml
- model_name: cloud-coder # what OpenCode asks for
  litellm_params:
    model: openrouter/deepseek/deepseek-v4.1-flash # the one line I change
```

You don't need a gateway to start. Point OpenCode straight at OpenRouter, and add one when a second app needs a model or you want budgets.

I went with OpenRouter on the hosted side because one key reaches every open model I wanted to try. Looks like a lot of developers are moving to open models on it too:

![Line chart from Dirac showing open-weight versus proprietary share of OpenRouter tokens from March 19 to October 5, 2026. Open-weight models start near 40 percent, cross proprietary in late May, and end near 74 percent.](/images/blog/breaking-up-with-claude-code/openrouter-open-weight-share-dirac.webp)

_Source: [Dirac](https://dirac.run/labs-market-share), from OpenRouter's usage data, through October 5, 2026. It tracks 10 labs, not every one._

<div class="callout">

Related: [LiteLLM or CData Connect AI?](/blog/litellm-vs-cdata-connect-ai/) covers what a gateway like this does and doesn't handle beyond a homelab.

</div>

## Picking a model

I didn't pick from a leaderboard. Two reasons.

First, leaderboards get gamed. xAI's Grok 3 launch chart was [accused of leaving out](https://techcrunch.com/2025/02/22/did-xai-lie-about-grok-3s-benchmarks/) the scores that made OpenAI's model look better. OpenAI [funded the FrontierMath benchmark and had access to much of it](https://techcrunch.com/2025/01/19/ai-benchmarking-organization-criticized-for-waiting-to-disclose-funding-from-openai/) before the funding was disclosed. Looking at you, Grok and ChatGPT.

Second, and this matters more: leaderboards are fine for the broad trend, but they test things I don't do. I'm not solving frontier math or competition programming. I do the work of an average software engineer and homelabber. I fix bugs, write small features, and wrangle config files, and I need a model that does that well, fast, and cheap.

So I ran my own bake-off, inside OpenCode, on work that looks like mine. Nine models. Two tasks: a bug fix with visible tests, and a cron expression parser graded by 39 tests the model never saw. Two runs each, every model on the same fixed-up OpenCode config, with the reasoning and verification fixes below turned on.

On my two tasks:

- **DeepSeek V4.1 Flash** passed every run, took about 53 seconds on the hard task, and cost about two cents a task. It's my default now. (It's also #2 on [OpenRouter's rankings](https://openrouter.ai/rankings) this week, so I'm not the only one.)
- **DeepSeek V4 Pro** and **Qwen 3.8 2.4T** also passed every run. Qwen took about 14 minutes and $0.37 to do it.
- **MiniMax M3** failed the hard task both times. It made up a file path and then stopped without writing any code. [Vals.ai scores it at 75% on SWE-bench Verified.](https://www.vals.ai/models/minimax_MiniMax-M3)
- **GLM 5.3** quit on one run right after reading the spec.
- **Claude**, for reference, passed every run too. It just cost more per task.

Two runs per model isn't science. But it was enough to catch a model with a 75% SWE-bench score that couldn't write a cron parser in my agent. _The model you should use is the one that does your work, in your setup, for a price you'll pay._

If you try this yourself, pull two real tasks from your backlog, one easy and one that needs actual thinking. Write tests for the hard one and hide them from the agent. Run each model twice through your own agent and config, and grade pass/fail, time, and cost. It takes an afternoon.

## Reasoning replay

This one drove me nuts.

DeepSeek V4.1 Flash is a thinking model: it reasons, calls a tool, then reasons again. In OpenCode, it kept losing its train of thought every time it ran a tool. I only figured out why by reading my gateway's request logs. OpenCode was sending back the model's earlier tool calls and answers, but not its earlier reasoning. Every tool call wiped out the "why."

[DeepSeek's docs](https://api-docs.deepseek.com/guides/thinking_mode) say that reasoning has to be passed back when tools are involved. Some setups get a hard error for skipping it, and you'll find "reasoning_content in the thinking mode must be passed back to the API" all over [OpenCode's GitHub issues](https://github.com/anomalyco/opencode/issues/24130). Mine didn't error. It just got dumber, which is worse, because nothing tells you.

The fix is one setting per model in `opencode.json`:

```json
"cloud-coder": {
  "interleaved": { "field": "reasoning_content" },
  "options": { "reasoningEffort": "high" }
}
```

![Panik Kalm Panik meme: panic at "DeepSeek forgets its reasoning after every tool call", calm at "One config line fixes it", then panic again at "It never threw an error. What else is quietly running dumber?"](/images/blog/breaking-up-with-claude-code/meme-panik-kalm-reasoning.webp)

DeepSeek V4 Pro had the opposite problem. Through my setup, it didn't reason at all until I explicitly sent a reasoning effort. That's what the `reasoningEffort` line is for.

What I'd do: before you trust any thinking model in any agent, read one logged request and make sure the reasoning goes back. Two minutes, and it's the difference between the model you tested and the one you're running.

## Verification

Claude Code had trained me to expect a model that checks its own work. To be fair, Claude also says "done" about things it never ran. Just less often, in my experience. The open models will happily edit three files, write a confident summary, and stop without running a single command.

![Anakin Padme 4 Panel meme: Anakin says "I edited three files. Task complete." Padme smiles and asks "You ran it, right?" Anakin stares back silently. Padme, no longer smiling: "You ran it... right?"](/images/blog/breaking-up-with-claude-code/meme-anakin-padme-ran-it.webp)

First I moved my rules into OpenCode's global [`AGENTS.md`](https://opencode.ai/docs/rules/). The part that matters:

```markdown
## Done means verified

Before you say a task is done:

1. Run the specific thing you changed with a real input.
2. Paste the 1 to 5 output lines that prove it worked.
3. State the result in one word: PASS or FAIL.
```

That helped, but it didn't fix it. A rule asks nicely. The model can still ignore it.

So I wrote a small [OpenCode plugin](https://opencode.ai/v2/docs/build/plugins/) that watches what the agent does. If it edits code and then finishes without running anything, the plugin sends it back once with this:

```text
[verify-gate] You edited ${files} but ran nothing afterwards. Your work is
judged by running it. Run the specific test or command that exercises this
change now, paste the 1 to 5 output lines that matter, and end with PASS or
FAIL. If it fails, fix it and run it again. If it truly cannot be run, say
exactly why in one line.
```

The [whole plugin](https://github.com/JoeKarlsson/dotfiles/blob/main/home/dot_config/opencode/plugins/verify-gate.js) is about 100 lines in my dotfiles. It catches a model skipping the run a few times a day. The cost is one extra turn each time, and at two cents a task I'll pay that every time.

Copy the rule first. If your model still skips it, add a gate.

## Local models

My homelab GPUs can't run a coding agent. I hoped they could.

I have 24GB of VRAM across two cards, shared with Plex, Frigate, and Immich ([that juggling act is its own post](/blog/proxmox-gpu-passthrough-multi-service/)). The best coding model I can fit is Qwen3-Coder 30B, squeezed down hard, and in OpenCode it's stiff and weak. On [Artificial Analysis's index](https://artificialanalysis.ai/models/open-source), it scores 10. DeepSeek V4.1 Flash scores 39. The good models are hundreds of billions of parameters. They're not fitting in my rack.

Small context windows make it worse. OpenCode's own instructions and tool definitions take about 9,500 tokens before I've typed anything. When I tried a local model with an 8K window, it never called a tool. It answered like a chatbot, because its tools had silently fallen out of the window. Watch out for Ollama here: on a GPU under 24GB, its [default window is 4K](https://docs.ollama.com/context-length).

Could I buy my way out? NVIDIA's 96GB RTX PRO 6000 now lists at [$16,000](https://www.tomshardware.com/pc-components/gpus/nvidia-doubles-rtx-pro-6000-blackwells-msrp-to-a-staggering-usd16-000-96gb-card-started-pre-orders-below-usd8-000-last-year). That's 66 years of my $20-a-month OpenCode budget, and it still couldn't hold DeepSeek V4.1 Flash. Right now, the math isn't close.

So my GPUs do the light work, and they're great at it: [Home Assistant voice](/blog/local-voice-ai-home-assistant-gpu/) on Qwen3 8B, at about 1.3 seconds per command, and doorbell camera descriptions on Qwen3-VL 8B. Both fall back to the cloud when the GPU box is off.

What I'd do: rent the big models for coding. Keep local for things that need to be fast, private, or working when the internet isn't.

## What I use for what

As of October 2026:

| Job                         | Model                      |
| --------------------------- | -------------------------- |
| Everyday coding and homelab | DeepSeek V4.1 Flash        |
| Harder coding               | DeepSeek V4 Pro            |
| The hardest problems        | Claude                     |
| Home Assistant voice        | Qwen3 8B, on my own GPU    |
| Camera descriptions         | Qwen3-VL 8B, on my own GPU |
| Writing                     | Haven't decided yet        |

## Where Claude still wins

The hardest problems: long, multi-step changes across real systems, where one wrong guess early turns into a mess an hour later. When V4 Pro stalls on something like that, I switch to Claude.

![Bernie I Am Once Again Asking meme: Bernie Sanders in a winter coat saying "I am once again asking", captioned "Me, four days after breaking up with Claude, when DeepSeek V4 Pro stalls on the hard one"](/images/blog/breaking-up-with-claude-code/meme-bernie-claude.webp)

The broader data says the same thing:

![Artificial Analysis step chart of the best proprietary and best open-weight model intelligence index scores from November 2022 to September 2026. The open-weight line trails the proprietary line the whole time, most recently around 46 versus 58.](/images/blog/breaking-up-with-claude-code/artificial-analysis-open-vs-proprietary.webp)

_Source: [Artificial Analysis](https://artificialanalysis.ai/models/open-source), October 6, 2026._

Open models have trailed the best closed ones by about 12 points on this index for a while now. The open line just got high enough that most of my work fits under it. So Claude is my escalation path, not my default.

## What's next

Next I want to try more providers directly, pick a writing model with a real test instead of vibes, and find a way to verify agent work that I trust more than a 100-line plugin.

If you're coding with open models or OpenRouter, what's your setup? I'd love to steal your tips, especially on getting agents to run their own code.
