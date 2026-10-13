---
title: 'Ship the Ugly Pot'
date: 2026-09-11
slug: 'ship-the-ugly-pot'
description: 'Quantity beats quality as a learning strategy: the Art & Fear pottery story, DORA deploy data, and how to tell a kiln from a gate in your org.'
categories: ['Career']
heroImage: '/images/blog/ship-the-ugly-pot/hero.webp'
heroAlt: 'Split image: left side labeled QUALITY shows one small clay pot alone; right side labeled QUANTITY shows a pile of many clay pots'
tldr: 'Quantity beats quality as a learning strategy because each finished piece of work gives you feedback for the next one. In DORA data, the teams that deploy most often also have the lowest change failure rates. Shipping a lot without that feedback just builds debt, and most slow review cultures are a symptom of fragile infrastructure.'
faq:
  - question: 'Does quantity actually beat quality, or is that oversimplified?'
    answer: 'Yes in iterative work like software, writing, and design, where each finished piece teaches you something about the next one. No in safety-critical work like aviation and medical devices, where quality-first is legally required. Quantity only wins when each piece goes through a feedback loop.'
  - question: 'Is the pottery class experiment a real study?'
    answer: "No. It's an anecdote from Art & Fear (Bayles and Orland, 1993), not a controlled study. Orland has said it's based on Jerry Uelsmann's photography class at the University of Florida, retold with ceramics. The closest large-scale evidence in software is the DORA State of DevOps research."
  - question: 'What is the perfection trap?'
    answer: 'Confusing planning for quality with producing quality. Both take careful thought and both feel like work, but only producing something gets you feedback. The quality group in the pottery story fell into it.'
  - question: "What's the difference between a kiln and a gate?"
    answer: 'A kiln tests work against reality and makes it better: automated tests, monitoring, real user feedback, retros. A gate adds latency and rewards safe, easy-to-approve proposals. Review can be either. Keep the kilns, remove the gates, and if a gate exists because the infrastructure is fragile, fix the infrastructure.'
  - question: 'What did the 2025 DORA report say about AI coding tools and quality?'
    answer: "AI adoption went with higher throughput and, on average, lower delivery stability. The report ties the difference to the basics teams already had in place, such as automated testing, mature version control, and fast feedback loops. AI makes more clay. It doesn't build the kiln."
---

Ship the ugly pot. Ship it before it's good and before you're proud of it, because the way to good work runs through a pile of bad work, not around it.

That sounds like an argument for volume, and it isn't. The pottery story everyone quotes from _Art & Fear_ is about feedback. Each finished pot taught the quantity group something about the next one. More pots without that feedback just means more bad pots. Artists have known this for a long time, and I think most of tech is still relearning it one DevOps report at a time.

Here's the story, from David Bayles and Ted Orland's [_Art & Fear_](https://www.amazon.com/Art-Fear-Observations-Rewards-Artmaking/dp/0961454733):

> "The ceramics teacher announced on opening day that he was dividing the class into two groups. All those on the left side of the studio, he said, would be graded solely on the quantity of work they produced, all those on the right solely on its quality. His procedure was simple: on the final day of class he would bring in his bathroom scales and weigh the work of the 'quantity' group: fifty pounds of pots rated an 'A', forty pounds a 'B', and so on. Those being graded on 'quality', however, needed to produce only one pot - albeit a perfect one - to get an 'A'. Well, came grading time and a curious fact emerged: the works of highest quality were all produced by the group being graded for quantity. It seems that while the 'quantity' group was busily churning out piles of work - and learning from their mistakes - the 'quality' group had sat theorizing about perfection, and in the end had little more to show for their effort than grandiose theories and a pile of dead clay."

It's an anecdote, not a controlled study. Orland [has said](https://kottke.org/09/02/art-and-fear) it's based on Jerry Uelsmann's photography class at the University of Florida, retold with ceramics.

![Squidward Window meme: Squidward, labeled 'Quality group, week 11 of the perfect pot design doc', stares out the window at SpongeBob and Patrick, labeled 'Quantity group, on pot #83'.](/images/blog/ship-the-ugly-pot/meme-squidward-window.webp)

The quality group fell into what I call the **perfection trap**: they confused planning for quality with producing it. Both take careful thought and both feel like work, but only producing something gets you feedback.

![They're The Same Picture meme: Pam from The Office is asked to find the differences between 'Planning a perfect pot' and 'Making a perfect pot'. Labeled 'The quality group', she answers 'They're the same picture.'](/images/blog/ship-the-ugly-pot/meme-same-picture.webp)

## Why the quantity group won

The quantity group didn't win because they made pots fast. They won because they made pots fast _and ran each one through the kiln._

The kiln is the feedback. Take it away and you have a pile of unfired clay. In software, shipping without feedback loops (no tests, no real users, no retros, no monitoring) doesn't get you the quantity group's result. It gets you tech debt and a team that's busy without learning anything.

So the lesson is to learn faster, and shipping is the fastest way I know to do that, as long as something tells you how the shipped thing did.

Get changes in front of real users instead of letting them sit in staging, behind a feature flag and with a way to roll back. Staging doesn't have production data, production load, or production edge cases. Every week a feature sits there is a week you're not running pots through the kiln.

## What the DORA data shows

The DORA research behind [_Accelerate_](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339) (Nicole Forsgren, Jez Humble, and Gene Kim, 2018) is built on years of State of DevOps survey data. The top-performing teams in that data deployed on demand, often several times a day, and also had the lowest change failure rates and the fastest recovery times. [DORA's own metrics guide](https://dora.dev/guides/dora-metrics/) puts it plainly: speed and stability aren't tradeoffs.

<div class="pull-quote">

In DORA's data, the teams that deploy most often also break things the least.

</div>

The teams that ship most often are in a faster feedback cycle with production, and small batches mean a small blast radius when something goes wrong. DORA says the same thing about software that the pottery class said about pots, with survey data instead of bathroom scales.

Maybe elite teams deploy often _because_ they're already good at testing and monitoring, and not the other way around. DORA is survey data, so it can't rule that out. But the [2025 DORA report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) points the same direction as the kiln. AI adoption went with higher throughput and, on average, lower delivery stability. The teams that avoided the instability had strong automated testing, mature version control, and fast feedback loops. More clay without a kiln made things worse.

<div class="callout">

Case study: [How I built feedback discipline into an AI-assisted writing workflow](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/).

</div>

If you track deploy frequency, track change failure rate next to it. Frequency on its own is easy to game, and a team that ships a lot without a kiln is just making the debt pile faster. I wrote more about [measuring whether your work is converting](/blog/proving-my-work-mattered/) separately, and about a real version of this loop: [putting up SEO fixes the same afternoon and tracking what each one did](/blog/reversing-seo-traffic-decline-ai-overviews/).

## Slow review comes from fragile infrastructure

I've worked on both sides of this, at two different places.

At one, a change had to go past every department that might have an opinion on it. Everyone had to read it and buy in. Review mostly meant poking holes and adjusting, and a single no anywhere in the chain blocked the whole thing until you got that person on board, or got their boss on board. A change to the website or to how the review process itself worked could take forever to land. The content system underneath had no version control, no linting, no automated link checking, and no rollback, so every change was effectively permanent. Of course everything went through that many rounds. The tooling made every change feel like open-heart surgery, and the review culture grew up around that.

![Flex Tape meme: a tank leaking water is labeled 'Content system with no version control and no rollback', and the hand slapping Flex Tape over the leak is labeled 'Four rounds of review'.](/images/blog/ship-the-ugly-pot/meme-flex-tape.webp)

The other place had version control, protected branches, automated tests, redirects, monitoring, and easy rollback. We shipped tens of changes a day and adjusted based on what we saw. It was a little ridiculous how much we got done. I broke things there too. When I did, the fix was quick: roll back or patch it, add a test so the same regression would get caught next time, and get the fix reviewed fast. Review was still there, but it was a checkpoint, because no single change could do much damage.

The second place produced work that was more timely and more tied to what users needed right now. People there developed better taste over time, because taste comes from feedback and feedback comes from shipping. The first place produced grandiose theories and a pile of dead clay.

What I took from it: review-heavy culture is mostly about taking ideas apart, and that makes a generative, fast-moving team hard to sustain. But going rogue in an org without the foundation doesn't work either. Without version control, tests, measurement, and team buy-in, moving fast means breaking things with no way back. You need [a completion standard the team holds](/blog/an-engineers-guide-to-knowing-if-you-are-done-with-a-project/), built for iteration.

I'm not arguing against review. Review is part of the kiln. The argument is about order and weight: build the infrastructure first, then use light review early and heavier review before major decisions, instead of heavy review before anything moves.

**If you're a manager:** audit your review cycles. For each one, ask whether it's a kiln or a gate. A kiln tests the work against reality and makes it better. A gate adds latency and teaches people to propose only safe, easy-to-approve ideas. Remove the gates and keep the kilns. If a gate exists because the infrastructure is fragile, fix the infrastructure.

**If you're an IC in a gated org:** ship the smallest thing that doesn't need the gate, and use the result as your argument for removing it. If you're new to the org, [audit first](/blog/running-devrel-2026/#the-first-90-days) so you know which gates are worth fighting.

AI raises the stakes here. It lets you write content, generate code, and make broad changes faster than ever, which is more clay produced faster. If your review process is still a gate, you've just moved the bottleneck. Orgs with version control, rollback, and automated checks can absorb that speed. The ones without it will drown in it.

## Don't ship the ugly pot into a radiation therapy machine

If you're writing flight control software or code for a radiation therapy machine, quality-first is legally required and morally necessary, and standards like [DO-178C](https://en.wikipedia.org/wiki/DO-178C) for avionics and [IEC 62304](https://en.wikipedia.org/wiki/IEC_62304) for medical device software exist for good reasons. "Ship and learn" breaks down when learning means someone gets hurt.

Safety-critical teams still have kilns, though. Simulation rigs, hardware-in-the-loop testing, and formal verification are all feedback loops. They just cost a lot more to fire. If you work in one of those domains, spend on cheaper, faster kilns before you add another sign-off stage.

Most software teams aren't in those domains. If you are, you already know this.

## What tech can learn from art school

I've been reading [_The Artist's Way_](https://www.amazon.com/Artists-Way-25th-Anniversary/dp/0143129252) lately, and the idea I keep coming back to is that making things and paying attention to how they turn out makes you better faster than planning to make them. That's held up for me. Everything I make has gone up since I started working this way: blog posts here and at work, art, writing, video. More of it ships, and each round is faster than the last, because I'm making a lot and looking hard at what came out instead of waiting until I feel ready.

Art has always known you build voice and craft through volume and attention, not by waiting until you know enough to start. Tech mostly treats that as a DevOps finding. There's a lot we could take from the softer disciplines, and I think this is the most transferable thing.

It shows up outside art too. A [2010 study of 1,258 psychology professors](https://www.sciencedaily.com/releases/2010/11/101112094532.htm) in the _Canadian Journal of Behavioural Science_ found perfectionism went with fewer publications, fewer citations, and lower-impact journals. It's a correlation, but it points the same way.

Sister Corita Kent taught at Immaculate Heart College in Los Angeles from 1947 to 1968 and [chaired its art department](https://en.wikipedia.org/wiki/Corita_Kent) from 1964. Rule 7 from the [Immaculate Heart College Art Department rules](https://www.corita.org/tenrules) she popularized is the bluntest version of this I've found:

![Immaculate Heart College Art Department Rules poster showing all ten rules in colorful handwritten text, with Rule 7 reading 'The only rule is work'](/images/blog/ship-the-ugly-pot/immaculate-heart-rules.webp)

> "The only rule is work. If you work it will lead to something. It's the people who do all of the work all the time who eventually catch on to things."

The "catch on" part is the kiln. You do the work, and you pay attention to what it teaches you.

![Bell Curve meme: the low end says 'just make stuff', the crying middle says 'I need to read 12 books on creativity and build a craft framework before I start', and the hooded monk at the high end says 'The only rule is work.'](/images/blog/ship-the-ugly-pot/meme-bell-curve.webp)

The pottery story, the DORA data, _The Artist's Way_, and Corita Kent's rule 7 all point at the same thing: _you don't think your way to quality. You ship, look at what came out, and ship again._

I've written about the other half of this, the psychological safety and conditions that make fast iteration possible, in [The Cognitive Case for Play in Technical Work](/blog/cognitive-case-for-play-in-technical-work/).

---

## FAQ

**Does quantity actually beat quality, or is that oversimplified?**

Yes in iterative work like software, writing, and design, where each finished piece teaches you something about the next one. No in safety-critical work like aviation and medical devices, where quality-first is legally required. Quantity only wins when each piece goes through a feedback loop.

**Is the pottery class experiment a real study?**

No. It's an anecdote from _Art & Fear_ (Bayles and Orland, 1993), not a controlled study. Orland has said it's based on Jerry Uelsmann's photography class at the University of Florida, retold with ceramics. The closest large-scale evidence in software is the DORA State of DevOps research.

**What is the perfection trap?**

Confusing planning for quality with producing quality. Both take careful thought and both feel like work, but only producing something gets you feedback. The quality group in the pottery story fell into it.

**What's the difference between a kiln and a gate?**

A kiln tests work against reality and makes it better: automated tests, monitoring, real user feedback, retros. A gate adds latency and rewards safe, easy-to-approve proposals. Review can be either. Keep the kilns, remove the gates, and if a gate exists because the infrastructure is fragile, fix the infrastructure.

**What did the 2025 DORA report say about AI coding tools and quality?**

AI adoption went with higher throughput and, on average, lower delivery stability. The report ties the difference to the basics teams already had in place, such as automated testing, mature version control, and fast feedback loops. AI makes more clay. It doesn't build the kiln.
