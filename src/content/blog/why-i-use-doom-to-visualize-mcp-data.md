---
title: 'Why I use DOOM to visualize MCP data'
date: 2026-10-16T14:47:57Z
slug: 'why-i-use-doom-to-visualize-mcp-data'
description: 'MCP data is just rows and JSON, so I built Doom out of it: an AI agent pulls live records through an MCP server, and each one becomes a monster.'
categories: ['Dev Tools', 'DevRel']
tags: ['MCP', 'Doom', 'CData Connect AI', 'Claude', 'developer marketing', 'demos']
heroImage: '/images/blog/why-i-use-doom-to-visualize-mcp-data/game-and-panel.webp'
heroAlt: 'Connect AI × DOOM: a pink demon labeled with an urgent Salesforce deal for European Financial Holdings, next to a side panel showing the Salesforce, Zendesk and Stripe rooms, the red door PII vault, and Claude heading into room 1'
tldr: "Data is hard to show off. Databases are rows and columns, and MCP servers hand back JSON. So I built Connect AI × DOOM: you ask Claude a business question, it pulls the answer out of your apps through the CData Connect AI MCP server, and the answer becomes a Doom level where every monster is a live record. I built the first version in one night without asking anyone, showed it around, and it's now the foundation of my team's developer marketing and event plans. KubeDOOM and doom-mcp came first, but as far as I can find, nobody had put MCP data inside a Doom level before. It's open source."
faq:
  - question: 'What is Connect AI × DOOM?'
    answer: 'A version of Doom built from live business data. Claude answers a question through the CData Connect AI MCP server, each app it uses becomes a room, each record becomes a monster, and data Connect AI blocked sits behind a red door with no key.'
  - question: 'Does Connect AI × DOOM change data in my apps?'
    answer: 'No. Every call goes through the Connect AI MCP server with read-only tools only, so shooting a monster reads the record again instead of changing it.'
  - question: 'How is this different from KubeDOOM or doom-mcp?'
    answer: 'KubeDOOM turns Kubernetes pods into monsters, and doom-mcp lets an AI agent play Doom. Connect AI × DOOM builds the level itself from the data an agent found over MCP.'
  - question: 'Do I need a Connect AI account to try Connect AI × DOOM?'
    answer: 'Not for the offline demo. Running ./raid.sh offline plays a level built from made-up data with no account. Live data needs a Connect AI account.'
  - question: 'Can an AI agent play Doom over MCP?'
    answer: 'Yes. doom-mcp by Gunnar Grosch lets an agent play Doom, and Connect AI × DOOM gives Claude a second MCP server that controls the marine while a side panel shows every tool call.'
---

I've been a database developer advocate for years, and the hard part of the job has never been explaining databases. It's making them look like anything. Data is rows and columns (like a boring Excel spreadsheet), and MCP servers, which is what I work with now, hand back JSON. Put a chat window on a projector at a conference booth and let an AI agent query five apps, and to everyone walking past, it looks like someone reading their email.

So I put the data in Doom. **Connect AI × DOOM** turns an AI agent's MCP calls into a Doom level. You ask Claude a question, it pulls the answer out of your apps through the [CData Connect AI](https://www.cdata.com/ai/) MCP server (I work at CData, which makes it), and every monster in the level is a live record it found. I'd mentioned the idea before and nobody cared. I built the first version in one night, people saw it running and loved it, and it's now how my team shows off Connect AI. The code is [on GitHub](https://github.com/CDataSoftware/connect-ai-doom), and there's a short overview on the [project page](/work/connect-ai-doom/).

![Claude playing a Doom level built from live Connect AI data: shooting Salesforce deals, passing the blocked PII vault and heading for the Zendesk tickets, with the side panel logging every kill](/images/blog/why-i-use-doom-to-visualize-mcp-data/claude-plays.gif)

_Claude playing a level built from live data. The side panel logs every tool call._

## Data is hard to show

Every data demo I've given ends the same way: a query, a result set, and me saying "and that's live" while the room takes my word for it, because a table of rows looks the same whether it's live or not.

MCP makes it harder, because now there's an agent in the middle. Connect AI sits between AI agents and hundreds of data sources, so a real demo is an agent deciding which apps to look in, writing the queries, getting JSON back, and getting told no when it asks for something it shouldn't have. That all happens in tool calls nobody sees. (If you want the serious version, I wrote about [what teams are building on live enterprise data through an AI gateway](/blog/ai-gateway-for-developers/).)

I wanted something you could follow from across a room: which sources the agent can reach, what came back, what the agent did with it, and what it wasn't allowed to touch.

## Why DOOM

Doom came out in 1993, and ever since id Software [released the source code](https://doomwiki.org/wiki/Doom_source_code) in 1997, people have been porting it to things that shouldn't run Doom: a [pregnancy test](https://www.ubergizmo.com/2020/09/doom-running-on-pregnancy-test/) (Foone swapped in a new screen and chip, but still), a [John Deere tractor](https://mezha.ua/en/2022/08/16/the-hacker-ran-doom-on-a-john-deere-tractor-and-showed-how-the-game-works/) at DEF CON, and enough others to fill a whole subreddit, [r/itrunsdoom](https://www.reddit.com/r/itrunsdoom/). "But can it run Doom?" is the oldest joke in computing that still gets a laugh, and when I first showed this off, the opening line was "But can it run Connect AI?"

The joke gets people to look. What makes Doom work for data is that everyone already knows how to read it. I've started calling this **borrowed literacy**, because I don't have to explain anything. A monster is a problem you have to deal with, and a pink demon is a worse one. A keycard means you're allowed in. A locked door means you're not. Nobody walking past needs a legend for that, and a chat window full of JSON doesn't.

![Trade Offer meme: the trade offer guy in a suit, with i receive: 30 seconds of your attention at the booth, and you receive: shooting a Salesforce deal in the face](/images/blog/why-i-use-doom-to-visualize-mcp-data/meme-trade-offer.webp)

## KubeDOOM and doom-mcp got there first

I'm not the first person to wire a real system into Doom, and they deserve credit. [psDooM](https://psdoom.sourceforge.net/), from the late '90s, turned your Unix processes into monsters, and shooting one killed the process. [KubeDOOM](https://github.com/storax/kubedoom) did the same for Kubernetes pods in 2019. I'd heard of KubeDOOM from [an article about using it for chaos engineering](https://k8s.co.il/infrastructure/deploying-kubedoom-for-chaos-engineering-in-kubernetes/). Then in March 2026, Gunnar Grosch released [doom-mcp](https://github.com/gunnargrosch/doom-mcp), an MCP server that lets an AI agent play Doom.

What I hadn't seen was anyone putting MCP data inside the level. doom-mcp hands the agent a game. I wanted the game to show what the agent found. As far as I can find, nobody had done that.

## I built the MVP in one night

I'd mentioned the idea offhand a couple of times before, and it didn't get much of a reaction. So I didn't ask anyone. I was sitting at home one evening after work, and I realized I could just build it and show people.

![Waiting Skeleton meme: a skeleton slumped on a park bench, captioned Me if I'd waited for approval to build the Doom demo](/images/blog/why-i-use-doom-to-visualize-mcp-data/meme-waiting-skeleton.webp)

The first version used unpaid invoices as the monsters. About twenty minutes later I'd swapped them for Salesforce deals. Coding agents did most of the setup, which is how one night was enough.

That's been the biggest perk of coding agents for me. I know what software can do, and now almost anything I can picture, I can build quickly. That makes them great for prototyping, and even better for getting people on board with an idea, and it's changed my career.

![The Salesforce room: Claude walking into a hall of pink demons, each labeled with a Salesforce deal name, while the HUD shows the urgent deal for Sunshine State University and its amount](/images/blog/why-i-use-doom-to-visualize-mcp-data/salesforce-room.gif)

_The Salesforce room. Every monster is a deal, with its name and amount over its head._

The next afternoon I recorded a quick demo and sent it around. In it I call the whole thing "just an experiment." The same idea that got shrugs as a sentence got a different reaction once people saw it running, and they fell in love with it. I wrote about a version of this in [Ship the Ugly Pot](/blog/ship-the-ugly-pot/): you learn what's good by finishing things and putting them in front of people.

![The Doom main menu with a large Connect AI logo above New Game, Options, Load Game, Save Game and Quit Game](/images/blog/why-i-use-doom-to-visualize-mcp-data/branded-menu.gif)

_I couldn't resist a little Connect AI branding._

## How it works

The short version, without getting into the build:

- **You ask a question**, like "Which customers are at risk right now?"
- **Claude explores your apps** through the Connect AI MCP server, with read-only tools only, and picks the three apps that answer it.
- **Each app becomes a room**, and each record it found becomes a monster. Urgent records are pink demons.
- **Keycards are your permissions**: blue for apps you can only read, yellow for read and write.
- **The red door is data Connect AI blocked**, like a lookup by Social Security number. There's no key. Try the door and it asks Connect AI again, live, and gets refused again.

![The full Connect AI × DOOM screen: Doom on the left with a Salesforce deal labeled over a pink demon, and a side panel on the right showing 3 apps, 70 records, 1 blocked, the Salesforce, Zendesk and Stripe rooms, the red door PII vault, and Claude's feed of decisions and tool calls](/images/blog/why-i-use-doom-to-visualize-mcp-data/game-and-panel.webp)

Shoot a monster and the game reads that record again from the source app, so what's on screen stays current. You can play it yourself, or let Claude play through a second MCP server that controls the marine, while the side panel shows every decision and tool call it makes. Nothing in your apps ever changes. I'm saving the full build story for the CData blog.

![Claude clearing the Salesforce room, shooting deal after deal while the HUD names each one and its amount](/images/blog/why-i-use-doom-to-visualize-mcp-data/kills.gif)

_Every kill is a live read through Connect AI._

## Where it's at now

It's early, but the buzz has been good, and Connect AI × DOOM is now the foundation of my team's developer marketing campaign and our event strategy.

What changed for me is how I think about demos. For years I tried to make data interesting by explaining it better, and I'd tried pitching this idea with words too. Neither worked as well as showing people something they already knew how to read. So if you're stuck explaining your data, look for a picture your audience already understands, and sometimes you just have to go build the thing.

If you want to try it, the [repo](https://github.com/CDataSoftware/connect-ai-doom) sets everything up on a Mac in about ten minutes. Live data needs a Connect AI account, and `./raid.sh offline` plays with made-up data if you don't have one.
