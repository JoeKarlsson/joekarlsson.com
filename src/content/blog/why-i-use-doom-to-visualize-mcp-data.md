---
title: 'I put an MCP server inside DOOM'
date: 2026-10-16T14:47:57Z
updatedDate: 2026-10-28
slug: 'why-i-use-doom-to-visualize-mcp-data'
description: 'An MCP server inside DOOM: an AI agent pulls live records over MCP and each becomes a monster. The first level built from MCP data, shown at MCPCon 2026.'
categories: ['Dev Tools', 'DevRel']
tags: ['MCP', 'Doom', 'CData Connect AI', 'Claude', 'developer marketing', 'demos']
heroImage: '/images/blog/why-i-use-doom-to-visualize-mcp-data/game-and-panel.webp'
heroAlt: 'Connect AI × DOOM: a pink demon labeled with an urgent Salesforce deal for European Financial Holdings, next to a side panel showing the Salesforce, Zendesk and Stripe rooms, the red door PII vault, and Claude heading into room 1'
tldr: "I put an MCP server inside Doom. Connect AI × DOOM is, as far as I can find, the first Doom level built out of MCP data. You ask Claude a business question, it pulls the answer out of your apps through the CData Connect AI MCP server, and the answer becomes a Doom level where every monster is a live record. KubeDOOM turned pods into monsters and doom-mcp lets an agent play Doom, but I couldn't find anyone who had built the level out of MCP data. I built the first version in one night without asking anyone, and in October 2026 I ran it at the CData booth at AGNTCon + MCPCon North America in San Jose, where hundreds of people stopped by to play it. It's open source, and you can play it in your browser."
faq:
  - question: 'What is Connect AI × DOOM?'
    answer: 'A version of Doom built from live business data. Claude answers a question through the CData Connect AI MCP server, each app it uses becomes a room, each record becomes a monster, and data Connect AI blocked sits behind a red door with no key.'
  - question: 'Does Connect AI × DOOM change data in my apps?'
    answer: 'No. Every call goes through the Connect AI MCP server with read-only tools only, so shooting a monster reads the record again instead of changing it.'
  - question: 'Is Connect AI × DOOM the first MCP server inside Doom?'
    answer: 'It is the first Doom level built from MCP data that I can find. KubeDOOM turns Kubernetes pods into monsters, and doom-mcp lets an AI agent play Doom. Connect AI × DOOM is the first to build the level itself out of the data an agent pulled through an MCP server.'
  - question: 'Do I need a Connect AI account to try Connect AI × DOOM?'
    answer: 'No. The web version at cdatasoftware.github.io/connect-ai-doom plays in your browser with a level built from a demo company, and ./raid.sh offline plays made-up data locally. Live data from your own apps needs a Connect AI account.'
  - question: 'Can an AI agent play Doom over MCP?'
    answer: 'Yes. doom-mcp by Gunnar Grosch lets an agent play Doom, and Connect AI × DOOM gives Claude a second MCP server that controls the marine while a side panel shows every tool call.'
---

I've been a database developer advocate for years, and the hard part of the job has never been explaining databases. It's making them look like anything. Data is rows and columns (like a boring Excel spreadsheet), and MCP servers, which is what I work with now, hand back JSON. Put a chat window on a projector at a conference booth and let an AI agent query five apps, and to everyone walking past, it looks like someone reading their email.

So I put an MCP server inside Doom. **Connect AI × DOOM** turns an AI agent's MCP calls into a Doom level, and as far as I can find, it's the first Doom level built out of MCP data. You ask Claude a question, it pulls the answer out of your apps through the [CData Connect AI](https://www.cdata.com/ai/) MCP server (I work at CData, which makes it), and every monster in the level is a live record it found. I built the first version in one night, and on October 22-23, 2026, it was the centerpiece of our booth at [AGNTCon + MCPCon](#taking-it-to-agntcon--mcpcon) in San Jose. The code is [on GitHub](https://github.com/CDataSoftware/connect-ai-doom), and there's a short overview on the [project page](/work/connect-ai-doom/).

## Play it in your browser

You can play it right here. Claude built this level from a demo company's Salesforce, Zendesk and Stripe through the Connect AI MCP server. Click the game to start. It needs a keyboard and mouse (WASD to move, click to fire, Esc frees the mouse), or you can hit **Watch Claude play** and let the agent drive. It's scaled down to fit this page, so [open it full screen](https://cdatasoftware.github.io/connect-ai-doom/) for the real thing.

<div class="aspect-video overflow-hidden rounded-lg border border-surface-3">
  <iframe src="https://cdatasoftware.github.io/connect-ai-doom/" title="Connect AI × DOOM, playable in the browser: a Doom level built from a demo company's Salesforce, Zendesk and Stripe data" data-embed-project="Connect AI × DOOM" data-native-width="1280" data-native-height="720" style="border:0" allow="fullscreen; gamepad; autoplay" allowfullscreen loading="lazy"></iframe>
</div>

## Data is hard to show

Every data demo I've given ends the same way: a query, a result set, and me saying "and that's live" while the room takes my word for it, because a table of rows looks the same whether it's live or not.

MCP makes it harder, because now there's an agent in the middle. Connect AI sits between AI agents and hundreds of data sources, so a real demo is an agent deciding which apps to look in, writing the queries, getting JSON back, and getting told no when it asks for something it shouldn't have. That all happens in tool calls nobody sees. (If you want the serious version, I wrote about [what teams are building on live enterprise data through an AI gateway](/blog/ai-gateway-for-developers/).)

Here's one row an agent pulled out of a demo Salesforce account, trimmed down. This is what MCP looks like from the outside:

```json
{
	"Id": "…",
	"Label": "European Financial Holdings",
	"Detail": "Urgent: $99,779.00, closed 2026-09-15 passed…",
	"Hot": true
}
```

And here's the same row in Doom:

![A pink demon in Doom standing in a gray hallway, with the caption Salesforce: European Financial Holdings, Urgent: $99,779.00, closed 2026-09-15 passed across the bottom of the screen](/images/blog/why-i-use-doom-to-visualize-mcp-data/one-record.webp)

I wanted something you could follow from across a room: which sources the agent can reach, what came back, what the agent did with it, and what it wasn't allowed to touch.

## Why DOOM

Doom came out in 1993, and ever since id Software [released the source code](https://doomwiki.org/wiki/Doom_source_code) in 1997, people have been porting it to things that shouldn't run Doom: a [pregnancy test](https://www.ubergizmo.com/2020/09/doom-running-on-pregnancy-test/) (Foone swapped in a new screen and chip, but still), a [John Deere tractor](https://mezha.ua/en/2022/08/16/the-hacker-ran-doom-on-a-john-deere-tractor-and-showed-how-the-game-works/) at DEF CON, and enough others to fill a whole subreddit, [r/itrunsdoom](https://www.reddit.com/r/itrunsdoom/). "But can it run Doom?" is the oldest joke in computing that still gets a laugh, and when I first showed this off, the opening line was "But can it run Connect AI?"

The joke gets people to look. What makes Doom work for data is that everyone already knows how to read it. I've started calling this **borrowed literacy**, because I don't have to explain anything. A monster is a problem you have to deal with, and a pink demon is a worse one. A keycard means you're allowed in. A locked door means you're not. Nobody walking past needs a legend for that, and a chat window full of JSON doesn't.

![Trade Offer meme: the trade offer guy in a suit, with i receive: 30 seconds of your attention at the booth, and you receive: shooting a Salesforce deal in the face](/images/blog/why-i-use-doom-to-visualize-mcp-data/meme-trade-offer.webp)

## KubeDOOM and doom-mcp

I'm not the first person to wire a real system into Doom, and they deserve credit. [psDooM](https://psdoom.sourceforge.net/), from the late '90s, turned your Unix processes into monsters, and shooting one killed the process. [KubeDOOM](https://github.com/storax/kubedoom) did the same for Kubernetes pods in 2019. I'd heard of KubeDOOM from [an article about using it for chaos engineering](https://k8s.co.il/infrastructure/deploying-kubedoom-for-chaos-engineering-in-kubernetes/). Then in March 2026, Gunnar Grosch released [doom-mcp](https://github.com/gunnargrosch/doom-mcp), an MCP server that lets an AI agent play Doom.

What I hadn't seen was a level built out of what the agent found. doom-mcp gives the agent a game to play, but the level is still regular Doom. I couldn't find anyone who had built one from MCP data.

## I built the MVP in one night

I'd mentioned the idea offhand a couple of times before, and it didn't get much of a reaction. So I didn't ask anyone. I was sitting at home one evening after work, and I realized I could just build it and show people.

![Waiting Skeleton meme: a skeleton slumped on a park bench, captioned Me if I'd waited for approval to build the Doom demo](/images/blog/why-i-use-doom-to-visualize-mcp-data/meme-waiting-skeleton.webp)

The first version used unpaid invoices as the monsters. About twenty minutes later I'd swapped them for Salesforce deals. Coding agents did most of the setup, which is how one night was enough.

That's been the biggest perk of coding agents for me. I know what software can do, and now almost anything I can picture, I can build quickly. That makes them great for prototyping, and even better for getting people on board with an idea, and it's changed my career.

Then I recorded a quick demo and sent it around. Here's the unedited cut, me included. In it I call the whole thing "just an experiment."

<video controls playsinline preload="none" poster="/images/blog/why-i-use-doom-to-visualize-mcp-data/demo-video-poster.webp" src="/images/blog/why-i-use-doom-to-visualize-mcp-data/demo-video.mp4" aria-label="My first Connect AI × DOOM demo: Claude playing a level built from a test Salesforce account while I explain the rooms, the monsters and the side panel on camera">
  <track kind="captions" srclang="en" label="English" src="/images/blog/why-i-use-doom-to-visualize-mcp-data/demo-video.vtt" />
</video>

_The first demo I sent around._

The same idea that got shrugs as a sentence got a different reaction once people saw it running, and they fell in love with it. I wrote about a version of this in [Ship the Ugly Pot](/blog/ship-the-ugly-pot/): you learn what's good by finishing things and putting them in front of people.

## How it works

The short version, without getting into the build:

- **You ask a question**, like "Which customers are at risk right now?"
- **Claude explores your apps** through the Connect AI MCP server, with read-only tools only, and picks the three apps that answer it.
- **Each app becomes a room**, and each record it found becomes a monster. Urgent records are pink demons.
- **Keycards are your permissions**: blue for apps you can only read, yellow for read and write.
- **The red door is data Connect AI blocked**, like a lookup by Social Security number. There's no key. Try the door and it asks Connect AI again, live, and gets refused again.

![The Zendesk room: Claude walking into a hall of monsters labeled with support tickets like API endpoint returning 500 errors and phone service slow, with the urgent ticket named across the bottom of the screen](/images/blog/why-i-use-doom-to-visualize-mcp-data/zendesk-room.gif)

_The Zendesk room. Every monster is a support ticket._

![Claude walking past the red PII vault sign, Locked by Connect AI Data Security, on the way into the Salesforce deals](/images/blog/why-i-use-doom-to-visualize-mcp-data/red-door.gif)

_The PII vault: data Connect AI refused to hand over, behind a door with no key._

Shoot a monster and the game reads that record again from the source app, so what's on screen stays current. You can play it yourself, or let Claude play through a second MCP server that controls the marine, while the side panel shows every decision and tool call it makes. Nothing in your apps ever changes. I'm saving the full build story for the CData blog.

## Taking it to AGNTCon + MCPCon

On October 22-23, 2026, I took Connect AI × DOOM to [AGNTCon + MCPCon North America](https://events.linuxfoundation.org/agntcon-mcpcon-north-america/) in San Jose, the Linux Foundation's conference for MCP and AI agents, and ran it on the big screen at the CData booth. It went over better than I'd hoped, and it was the most fun I've had at a booth. Hundreds of people stopped by, and a lot of them grabbed the controls and played it while I walked them through it: which app each room came from, which record each monster was, and why the red door won't open.

![Me at the CData booth explaining Connect AI × DOOM to a small crowd while someone films the screen on their phone, with the Doom level and the side panel of MCP tool calls on a big TV behind me](/images/blog/why-i-use-doom-to-visualize-mcp-data/booth-demo.webp)

At an MCP conference, everyone walking the expo floor is looking at chat windows and architecture diagrams all day. A Doom level on a big screen stopped people from across the hall, and once they stopped, I could show them the real thing: an agent hitting an MCP server, getting data back, and getting refused.

![The CData booth from the aisle, with a crowd gathered in front of the Doom demo on the big screen while I talk someone through it](/images/blog/why-i-use-doom-to-visualize-mcp-data/booth-crowd.webp)

We made shirts for it, too: CDATA in the Doom logo lettering, and the whole team wore them at the booth.

![A black t-shirt with CDATA printed in the orange-and-blue lettering of the Doom logo](/images/blog/why-i-use-doom-to-visualize-mcp-data/doom-shirt.webp)

![The CData team posing at the booth in matching CDATA Doom shirts, with the Doom demo running on the screen to the right](/images/blog/why-i-use-doom-to-visualize-mcp-data/team-shirts.webp)

I also wasn't the only one running Doom on the expo floor. Even at an AI conference, "can it run Doom?" still works: I spotted an Arm developer badge with a small screen on it, running Doom.

![An Arm Create developer badge held in someone's hand, with a small built-in screen running Doom](/images/blog/why-i-use-doom-to-visualize-mcp-data/arm-badge-doom.webp)

## Where it's at now

My team built our developer marketing campaign and our event plans around Connect AI × DOOM, and after San Jose I'm sure that was the right call.

For years I tried to make data interesting by explaining it better, and I'd tried pitching this idea with words too. Neither worked as well as showing people something they already knew how to read. If you're stuck explaining your data, look for a picture your audience already understands.

To run it on your own data, the [repo](https://github.com/CDataSoftware/connect-ai-doom) sets everything up on a Mac in about ten minutes. Live data needs a Connect AI account, and `./raid.sh offline` plays with made-up data if you don't have one.
