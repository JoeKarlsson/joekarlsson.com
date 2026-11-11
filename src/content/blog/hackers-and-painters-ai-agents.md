---
title: 'Rereading Hackers and Painters as a painter who codes with AI agents'
seoTitle: 'Hackers and Painters, reread with AI agents'
date: 2026-11-10T15:53:18Z
slug: 'hackers-and-painters-ai-agents'
description: "I reread Paul Graham's Hackers and Painters as a painter who codes with AI agents. The sketching idea held up. Beautiful code nobody reads is what I miss."
categories: ['AI', 'Career']
tldr: 'In "Hackers and Painters" (2003), Paul Graham argued that programming is sketching: you figure a program out while you write it, so a language should be "a pencil, not a pen." I paint and I write code, and since AI coding agents came along, programming feels more like painting to me, not less. I can explore ideas faster and more iteratively. What I miss is beauty in code nobody reads, though I don''t think AI will kill it any more than photography killed painting.'
heroImage: '/images/blog/hackers-and-painters-ai-agents/thumb-17c4f83f.webp'
faq:
  - question: "What is Paul Graham's Hackers and Painters about?"
    answer: '"Hackers and Painters" is a 2003 essay Paul Graham turned from a Harvard guest lecture. He argued that hackers and painters are both makers ("what hackers and painters are trying to do is make good things") and that programming is sketching: you figure a program out while you write it, so a programming language should be "a pencil, not a pen."'
  - question: 'Do AI coding agents make programming less creative?'
    answer: "Not for me. Since AI coding agents came along, programming feels more like painting to me, not less, because it's easier to explore ideas quickly and iteratively. What I miss is beauty in code nobody reads: with agents, code has become more of a black box, and having beautiful code is less important than it was."
  - question: 'Will AI kill programming?'
    answer: 'I don''t think so. In a footnote to "Hackers and Painters," Paul Graham wrote that the greatest damage photography did to painting may be that "it killed the best day job," since most great painters paid their bills with portraits. Photography didn''t kill painting, and I don''t think AI is going to kill programming, or the art of making beautiful code, either.'
heroAlt: "An X-ray of Vermeer's A Maid Asleep, showing the sleeping maid, a jug on the table, and the shapes Vermeer painted over in the doorway behind her"
---

In 2003 Paul Graham turned a Harvard guest lecture into an essay called [Hackers and Painters](https://www.paulgraham.com/hp.html). He'd finished grad school in computer science and then gone to art school to study painting, and people kept acting surprised that one person would want both. His answer was that hackers and painters are both makers: "what hackers and painters are trying to do is make good things."

I paint and I write code too. I do digital art, oil pastel, watercolor and large color field pieces, some of it subconscious, abstract expressionist work, and I wrote about why I care about both on [my Works page](/work/#statement) and talked about it in my TEDx talk, [The Art of Computer Science](/talks/the-art-of-computer-science/). Since AI coding agents came along, programming has started to feel more like painting to me, not less. It's easier to explore ideas quickly and iteratively, and it has creatively unlocked something big for me.

![Two photos from above. Left: Joe gluing a collage of a jack-o'-lantern, a black cat and a wheat field onto red paper, surrounded by markers and glue jars. Right: Joe sketching in pink watercolor at a marble cafe table next to a paint palette and a plate of oysters.](/images/newsletter/taste-matters-more-with-ai/art.webp)

_A collage and a watercolor sketch, from [my newsletter about taste](/newsletter/taste-matters-more-with-ai/)._

That might be a hot take, because most of what I read this year went the other way. Nolan Lawson wrote [We mourn our craft](https://nolanlawson.com/2026/02/07/we-mourn-our-craft/), and six weeks later, in [The diminished art of coding](https://nolanlawson.com/2026/03/22/the-diminished-art-of-coding/), he gave this advice: "if you're looking for art in coding: stop looking. If you've never taken an interest in poetry, or painting, or dance, or whatever, now would be a good time." Glyph's [Programming Isn't Special](https://blog.glyph.im/2026/10/programming-isnt-special.html) carries the subtitle "Artists understand that AI is bad for art. Why don't programmers understand that we are artists?"

Lawson even guessed at what I'm describing, and doubted it: "maybe I'll be surprised and there will be an artist-in-residence somewhere wielding agent orchestrators like a paintbrush! But I kind of doubt it."

So I reread "Hackers and Painters" against the way I work now.

## Programming is sketching

Graham was taught in college to work a program out completely on paper before going near a computer. He didn't work that way. He'd "spew out code that was hopelessly broken, and gradually beat it into shape," and he felt bad about it for years, until he noticed that painters and architects had a name for what he was doing: sketching.

![A pencil draws a circle, rubs it out until only a faint ghost is left, draws a star over the ghost, rubs that out too, and draws a house over both ghosts. Then the page clears and it starts again.](/images/blog/hackers-and-painters-ai-agents/pencil-not-a-pen.svg)

That's where his most-quoted line comes from. "A programming language is for thinking of programs, not for expressing programs you've already thought of. It should be a pencil, not a pen." He also said hacking at its best is creating the spec, "though it turns out the best way to do that is to implement it."

Countless paintings, he wrote, when you look at them in x-rays, "turn out to have limbs that have been moved or facial features that have been readjusted." The painter changed their mind on the canvas, and the earlier version is still under there.

My git logs look like that now. On November 5, 2026 I built [Nothing But Corners](/work/nothing-but-corners/), a DVD screensaver where the logo hits a corner every single time. Here are 8 of that day's 15 commits, in order:

```text
feat: DVD logo that only hits corners
feat: Rename to Nothing But Corners, add click-to-spawn, bigger corner hits and real cheers
feat: Brake late into corners and ricochet out with squash and stretch
feat: Overload at 50 logos with an anime-style implosion
feat: Replace the implosion with a ki blast that fires a giant logo into a corner
feat: Giant logo hits two corners, with a bigger dome explosion and a shatter explosion
feat: Giant logo tours all four corners, stops in the middle, then crawls into a fifth
feat: After the tour, the giant swells into a leviathan that drifts into two corners at a slow, steady pace
```

Working like this, I can get into an artistic flow. It's about what's being represented and what the impact is, as opposed to the process. It's the same thing I wrote about in [The Cognitive Case for Play](/blog/cognitive-case-for-play-in-technical-work/): the best work happens where mistakes are cheap, and agents make a bad sketch cheap.

[linger](/work/linger/) is a sketch where the code was only there for the poems. It's seven poems that only finish if you scroll slowly. Each line starts as a few words floating in white space, and the rest fills in while you hold still. It's plain HTML, CSS and about a hundred lines of JavaScript.

## Starting over: Bechdel.io

Graham noticed that painters leave a trail of work behind them, and each painting builds on the ones before it. "Maybe it would be good for hackers to act more like painters, and regularly start over from scratch, instead of continuing to work for years on one project, and trying to incorporate all their later ideas as revisions."

In 2015 my sister and I built [Bechdel.io](/work/bechdel-io/), which [reads a movie's screenplay](/blog/bechdel-test-script-parser-works/) and checks it against the Bechdel Test. My commit messages from that December include "editted procfile3", "editted procfile4" and "editted procfile5", which tells you how deploying to Heroku was going. Eventually it died there, like a lot of my old apps (RIP).

This year I started it over. In one day it became a static site, and I deleted the server, MongoDB, the old React app and Docker. One script, `npm run analyze`, turns screenplays into the site's film data, and that's the whole backend now.

Restructuring it and doing data analysis on it felt like painting, like seeing the project in a new light. Getting new data to play with was easier than ever, too, after the small set of films the original covered.

[Punc](/work/punc/), my 2016 art project that strips the words out of books, got the same treatment. I filled its shelf with 1,959 Project Gutenberg books and used it to [test whether English sentences got shorter](/blog/sentence-length-semicolons-punctuation/).

## Ceglowski's objection

Not everyone bought Graham's analogy. In 2005 Maciej Ceglowski, who had painted oils full time and also wrote code, answered him with [Dabblers and Blowhards](https://idlewords.com/2005/04/dabblers_and_blowhards.htm): "So let me say it simply - hackers are nothing like painters." He went after the sketching story too. Fifteenth-century painting, he wrote, had "a superprecise underdrawing and underpainting that were covered with thin glazes of color." That's not spewing broken code and beating it into shape.

Ceglowski is describing how fifteenth-century painters worked. That isn't how I paint. As I wrote in [my newsletter](/newsletter/taste-matters-more-with-ai/), I paint mostly by feel, going by what feels right and looks right, and a lot of the time I keep going until I overwork a piece, just to find out where the limit is.

Some painting is process art, where how it was made is the artistic expression. I don't know if code can be that in the AI era, unless the point you're making is about AI itself.

![A scaffold of poles and planks appears in two quick beats. Then a pencil draws one window in a single bay, crooked, rubs it out, draws it crooked again, rubs it out, and finally draws it square with a cross in the middle. Then everything clears and it starts again.](/images/blog/hackers-and-painters-ai-agents/scaffolding-then-details.svg)

I do plan when I start a new project, but usually at a high level. The devil's in the details, and that was true of infrastructure and code before agents and it's true today. Scaffolding is easy. The details are the tricky part, and that's where I think agents struggle, especially with anything visual.

## Static types came back

Graham's sketching argument came with a jab at static typing. He wanted "a language that lets us scribble and smudge and smear, not a language where you have to sit with a teacup of types balanced on your knee and make polite conversation with a strict old aunt of a compiler."

In August 2025 TypeScript became the most-used language on GitHub by monthly contributors, and [GitHub's Octoverse report](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) tied that to agents: developers are "shifting toward typed languages that make agent-assisted coding more reliable in production." In the [2026 Python typing survey](https://engineering.fb.com/2026/10/27/developer-tools/python-typing-survey-2026-ai-tools-checker-landscape/), the share of respondents who said type hints make AI-generated code more accurate or reliable went from 18.5% to 38.4% in a year.

![The function signature makeTape(template, film: any). A pencil scribbles out the word any and writes ShelfFilm above it, one letter at a time. Then it clears and starts again.](/images/blog/hackers-and-painters-ai-agents/any-becomes-a-type.svg)

I'm using TypeScript more than I used to. It used to be kind of a pain in the ass, even after it got popular, but now it's an easy way to enforce a higher standard.

## Beautiful code nobody reads

Graham's argument for beautiful code starts with a bush. When Leonardo painted the portrait of [Ginevra de' Benci](https://en.wikipedia.org/wiki/Ginevra_de%27_Benci), he put a juniper behind her head and painted every leaf, even though "No one will look that closely at it." Graham's point was that great software works the same way: "If you look inside good software, you find that parts no one is ever supposed to see are beautiful too."

![Leonardo da Vinci's portrait of Ginevra de' Benci: a young woman with pale skin and curled hair, in front of a dark juniper bush painted needle by needle, with a lake and autumn trees to the right](/images/blog/hackers-and-painters-ai-agents/ginevra-de-benci.webp)

_Leonardo da Vinci, Ginevra de' Benci, about 1474-78, National Gallery of Art ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ginevra_de%27_Benci_-_National_Gallery_of_Art.jpg))._

That's the part I miss. With agents, code has become more of a black box to engineers, and having beautiful code is less important than it was, which is a bit of a loss.

I try to read as much of it as I can, but reading every line isn't feasible anymore, especially when you're working on a team or collaborating on code. I read for the big things, I rely on my agents to spot problems too, and I keep backups. What I want is to understand the flow: where things are, and how to solve a problem if something goes wrong.

Clean code still pays off in a practical way. It isn't always shorter, but my coding style has changed to favor token efficiency, which usually means splitting things up, cutting duplication as much as possible and consolidating abstractions. Fewer tokens means a smaller bill, and price was the main reason I [switched my default coding agent](/blog/breaking-up-with-claude-code/).

## How beginners get good

Graham's line on learning:

<div class="pull-quote">

Hackers start original, and get good, and scientists start good, and get original.

</div>

You learn to hack the way you learn to paint, by doing it. Most hackers, he wrote, "learn to hack by writing programs of their own at age thirteen."

I think people vibe coding without understanding programming are going to have a hard time. I feel lucky that I understand what's going on, so I can use agents with confidence and securely, without being oblivious to what's happening.

I don't know how to get good besides going in deep on how things actually work, and I don't think that's changed. It's the argument I made in [Ship the Ugly Pot](/blog/ship-the-ugly-pot/): the way to good work runs through a pile of bad work. But I also don't know if I would be able to resist having an instant cheat button always available to me.

## Photography and painting

Graham ended on a pattern he saw in painting, theater, engraving and the novel: a new medium appears, and people explore most of what it can do in the first couple of generations. He thought hacking was in that phase in 2003. His last line: "How cool hacking turns out to be will depend on what we can do with this new medium."

Graham also has a footnote about photography: "The greatest damage that photography has done to painting may be the fact that it killed the best day job." Most of the great painters in history paid their bills with portraits.

![Robert Cornelius's 1839 self-portrait: a young man with messy hair and crossed arms, looking off to the side, on a scratched and spotted silver plate](/images/blog/hackers-and-painters-ai-agents/robert-cornelius-1839.webp)

_Robert Cornelius's 1839 self-portrait, one of the earliest photographs of a person ([Wikimedia Commons](<https://commons.wikimedia.org/wiki/File:1839_Self-portrait_by_Robert_Cornelius_(cropped).jpg>))._

Photography didn't kill painting, though. I have painter friends, and it's still a viable career, or at least a hobby. I don't think AI is going to kill programming, or the art of making beautiful code, either.
