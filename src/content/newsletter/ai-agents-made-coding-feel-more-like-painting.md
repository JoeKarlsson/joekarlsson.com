---
title: 'AI Agents Made Coding Feel More Like Painting'
seoTitle: 'AI Agents Made Coding Feel Like Painting'
date: 2026-12-17T08:00:00Z
slug: 'ai-agents-made-coding-feel-more-like-painting'
description: 'Nolan Lawson told programmers to stop looking for art in coding. A 2003 Paul Graham essay and the way I work now say otherwise.'
recapOf: 'hackers-and-painters-ai-agents'
cardPhoto: '/images/blog/hackers-and-painters-ai-agents/van-eycks-unfinished-saint-barbara-1437.webp'
cardPhotoAlt: "Jan van Eyck's unfinished Saint Barbara, 1437: a finely drawn woman reading in front of a Gothic tower under construction, still mostly underdrawing"
heroImage: '/images/newsletter/ai-agents-made-coding-feel-more-like-painting/card-f189e3f4.webp'
heroAlt: "Works on My Machine card for AI Agents Made Coding Feel More Like Painting, with Jan van Eyck's unfinished Saint Barbara, 1437: a finely drawn woman reading in front of a Gothic tower under construction, still mostly underdrawing framed in a pink crayon box"
---

I paint and I write code. Since AI coding agents came along, programming has started to feel more like painting to me, not less. It's easier to explore ideas quickly and iteratively. That might be a hot take, because most of what I read this year went the other way.

![A hand holding a sheet of pink paper covered in red oil pastel flowers with green stems, clipped to a clipboard](/images/blog/hackers-and-painters-ai-agents/an-oil-pastel-of-red-flowers.webp)

_An oil pastel of red flowers, September 2026._

Nolan Lawson wrote [We mourn our craft](https://nolanlawson.com/2026/02/07/we-mourn-our-craft/), and six weeks later, in [The diminished art of coding](https://nolanlawson.com/2026/03/22/the-diminished-art-of-coding/), he gave this advice: "if you're looking for art in coding: stop looking. If you've never taken an interest in poetry, or painting, or dance, or whatever, now would be a good time."

Lawson even guessed at what I'm describing, and doubted it: "maybe I'll be surprised and there will be an artist-in-residence somewhere wielding agent orchestrators like a paintbrush! But I kind of doubt it."

So I reread Paul Graham's 2003 essay [Hackers and Painters](https://www.paulgraham.com/hp.html) against the way I work now.

## Programming is sketching

Graham was taught in college to work a program out completely on paper before going near a computer. He didn't work that way. He'd "spew out code that was hopelessly broken, and gradually beat it into shape," and he felt bad about it for years, until he noticed that painters and architects had a name for what he was doing: sketching. That's where his best-known line comes from: a programming language "should be a pencil, not a pen."

Working like this, I can get into an artistic flow. It's about what's being represented and what the impact is, as opposed to the process. It's the same thing I wrote about in [The Cognitive Case for Play](/blog/cognitive-case-for-play-in-technical-work/): the best work happens where mistakes are cheap, and agents make a bad sketch cheap.

I paint mostly by feel, going by what feels right and looks right, and a lot of the time I keep going until I overwork a piece, just to find out where the limit is.

I do plan when I start a new project, but usually at a high level. Scaffolding is easy, and it was before agents too. The details are the tricky part, and that's where I think agents struggle, especially with anything visual.

## Starting over: Bechdel.io

Graham noticed that painters leave a trail of work behind them, and each painting builds on the ones before it. "Maybe it would be good for hackers to act more like painters, and regularly start over from scratch, instead of continuing to work for years on one project, and trying to incorporate all their later ideas as revisions."

In 2015 my sister and I built [Bechdel.io](/work/bechdel-io/), which reads a movie's screenplay and checks it against the Bechdel Test. My commit messages from that December include "editted procfile3", "editted procfile4" and "editted procfile5", which tells you how deploying to Heroku was going. Eventually it died there, like a lot of my old apps (RIP).

This year I started it over. In one day it became a static site, and I deleted the server, MongoDB, the old React app and Docker. One script, `npm run analyze`, turns screenplays into the site's film data, and that's the whole backend now. Restructuring it and doing data analysis on it felt like painting, like seeing the project in a new light.

## Beautiful code nobody reads

Graham's argument for beautiful code starts with a bush. When Leonardo painted the portrait of Ginevra de' Benci, he put a juniper behind her head and painted every leaf, even though "No one will look that closely at it." Graham's point was that great software works the same way: "If you look inside good software, you find that parts no one is ever supposed to see are beautiful too."

![Leonardo da Vinci's portrait of Ginevra de' Benci: a young woman with pale skin and curled hair, in front of a dark juniper bush painted needle by needle, with a lake and autumn trees to the right](/images/blog/hackers-and-painters-ai-agents/ginevra-de-benci.webp)

_Leonardo da Vinci, Ginevra de' Benci, about 1474-78, National Gallery of Art._

That's the part I miss. With agents, code has become more of a black box to engineers, and having beautiful code is less important than it was.

I try to read as much of it as I can, but reading every line isn't feasible anymore, especially when you're working on a team or collaborating on code. I read for the big things, I rely on my agents to spot problems too, and I keep backups. What I want is to understand the flow: where things are, and how to solve a problem if something goes wrong.

Clean code still pays off in a practical way. It isn't always shorter, but my coding style has changed to favor token efficiency, which usually means splitting things up, cutting duplication as much as possible and consolidating abstractions. Fewer tokens means a smaller bill, and price was the main reason I [switched my default coding agent](/blog/breaking-up-with-claude-code/).

## Photography and painting

Graham has a footnote about photography: "The greatest damage that photography has done to painting may be the fact that it killed the best day job." Most of the great painters in history paid their bills with portraits.

![Robert Cornelius's 1839 self-portrait: a young man with messy hair and crossed arms, looking off to the side, on a scratched and spotted silver plate](/images/blog/hackers-and-painters-ai-agents/robert-cornelius-1839.webp)

_Robert Cornelius's 1839 self-portrait, one of the earliest photographs of a person._

Photography didn't kill painting, though. I have painter friends, and it's still a viable career, or at least a hobby. I don't think AI is going to kill programming, or the art of making beautiful code, either.

The full post also covers Maciej Ceglowski's 2005 rebuttal, why static types came back, and how beginners get good.

<a class="button" href="/blog/hackers-and-painters-ai-agents/">Read the full post</a>
