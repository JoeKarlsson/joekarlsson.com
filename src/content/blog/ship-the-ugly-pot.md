---
title: 'Ship the Ugly Pot'
date: 2026-09-11
slug: 'ship-the-ugly-pot'
description: 'Your org is the quality group from the pottery parable. They were told to make one perfect pot. They made worse pots.'
categories: ['Career']
heroImage: '/images/blog/ship-the-ugly-pot/hero.webp'
heroAlt: 'Split image: left side labeled QUALITY shows one small clay pot alone; right side labeled QUANTITY shows a pile of many clay pots'
tldr: 'Quantity beats quality as a learning strategy - not because volume matters, but because each completed artifact generates feedback the next one benefits from. Elite teams ship most frequently AND have the lowest failure rates. Quantity without feedback infrastructure just builds debt.'
faq:
  - question: 'Does quantity actually beat quality, or is that oversimplified?'
    answer: 'It depends on the domain. In iterative creative and technical work - software, writing, design - quantity beats quality as a learning strategy because feedback compounds. Each completed artifact teaches you something the next one benefits from. In safety-critical domains like aviation, medical devices, and nuclear software, quality-first constraints are legally and morally required.'
  - question: 'Is the pottery class experiment a real study?'
    answer: "No, it's a parable from Art & Fear (Bayles and Orland, 1993). The original was Jerry Uelsmann's photography class at the University of Florida. Ted Orland replaced the medium with ceramics when retelling it. The DORA State of DevOps research provides large-scale empirical support for the same conclusion in software engineering."
  - question: 'What is a deployment-quality loop?'
    answer: 'The feedback cycle where frequent small deployments to production generate learning that improves the next deployment. DORA research shows elite teams that deploy on-demand have lower change failure rates and faster recovery times than teams that deploy infrequently. Speed and quality correlate positively.'
  - question: 'What is the perfection trap?'
    answer: 'When a team or individual confuses planning for quality with producing quality. Both feel like work from the inside, but only production generates feedback. The quality group in the pottery parable fell into the perfection trap: they theorized about a perfect pot instead of making pots.'
  - question: "What's the difference between a kiln and a gate?"
    answer: 'A kiln runs work through production reality and makes it better - tests, observability, real user feedback, retros. A gate just adds latency and incentivizes safe, review-passable proposals over good ideas. Review cycles can be either. Auditing which type each review cycle is helps teams keep the kilns and remove the gates.'
  - question: 'What did the 2025 DORA data say about AI coding tools and quality?'
    answer: "Teams that adopted AI code assistants saw throughput increase. But delivery stability was determined by teams' existing feedback infrastructure - testing, observability, deployment practices. AI made it easier to produce clay. Whether teams ran it through the kiln was the variable that mattered."
---

Ship the ugly pot. Ship it before it's ready, before it's good, before you're proud of it. The path to good work runs directly through a pile of bad work - not around it, not after some undetermined future point when you've "figured it out." Through it.

Here's the experiment that convinced me quantity beats quality - and why that's almost the opposite of what it sounds like.

From David Bayles and Ted Orland's [_Art & Fear_](https://www.amazon.com/Art-Fear-Observations-Rewards-Artmaking/dp/0961454733):

> "The ceramics teacher announced on opening day that he was dividing the class into two groups. All those on the left side of the studio, he said, would be graded solely on the quantity of work they produced, all those on the right solely on its quality. His procedure was simple: on the final day of class he would bring in his bathroom scales and weigh the work of the 'quantity' group: fifty pounds of pots rated an 'A', forty pounds a 'B', and so on. Those being graded on 'quality', however, needed to produce only one pot - albeit a perfect one - to get an 'A'. Well, came grading time and a curious fact emerged: the works of highest quality were all produced by the group being graded for quantity. It seems that while the 'quantity' group was busily churning out piles of work - and learning from their mistakes - the 'quality' group had sat theorizing about perfection, and in the end had little more to show for their effort than grandiose theories and a pile of dead clay."

The quality group's mistake has a name: call it the **perfection trap**. They confused planning for quality with producing quality. Both require thinking carefully. Both feel like work. But only one generates feedback. Without feedback, you're theorizing in a vacuum.

<div class="callout">

**Perfection trap:** Confusing planning for quality with producing quality. Both feel like work from the inside. Only production generates feedback.

</div>

## The mechanism: it's the kiln, not the clay

The quantity group didn't win because they made pots fast. They won because they made pots fast _and ran each one through the kiln._

The kiln is the feedback mechanism. Take it away and you just have unfinished, untested clay. In software, shipping without feedback loops - no tests, no real users, no retros, no monitoring - doesn't produce the quantity group's outcome. It produces tech debt and a team that's busy but not learning.

There are two versions of quantity here, and only one of them works: quantity in service of output, and quantity in service of learning. The pottery group's result came from the second one.

"Ship more" is not the lesson. "Learn faster" is. Shipping is just the fastest path to learning there is.

**The call:** Ship to production, not to staging. Real feedback comes from real users doing real things. A staging environment doesn't have production data, production load, or production edge cases. Every week a feature sits in staging instead of production is a week you're not running pots through the kiln.

## DORA confirms it: quantity beats quality in software

The DORA research - [_Accelerate_](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339), from Nicole Forsgren, Jez Humble, and Gene Kim - synthesized years of State of DevOps survey data across thousands of teams. The finding is clear and has held up every year since: elite software teams deploy on-demand, multiple times per day, and have _lower_ change failure rates and _faster_ recovery times than low-performing teams.

<div class="pull-quote">

Elite teams deploy most often and have the lowest failure rates. Speed and quality don't trade off - they correlate.

</div>

Call this the **deployment-quality loop**: the teams who ship most often aren't cutting corners - they're in a faster feedback cycle with production. Each deployment is a learning event. Small batches mean small blast radius when something goes wrong. [DORA says the same thing about software](https://dora.dev/guides/dora-metrics/) that the pottery class said about pots, with survey data instead of bathroom scales.

<div class="callout">

**Deployment-quality loop:** The feedback cycle where frequent small deployments generate learning that improves the next one. More shipping means more learning events, smaller blast radius per change, and faster recovery when something breaks.

</div>

The obvious objection: maybe elite teams deploy often _because_ they're already good at testing and observability - not the other way around. The [2025 State of DevOps report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) is about as close as we get to a natural experiment. AI coding assistants increased throughput broadly across teams. But delivery stability moved with teams' existing feedback infrastructure - testing, observability, deployment practices - not with how often teams had shipped before. The causal variable wasn't shipping history. It was whether the kiln existed.

<div class="callout">

Case study: [How I built feedback discipline into an AI-assisted writing workflow](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/) - the practice version of this argument.

</div>

Perfectionism has the same data problem. A [2010 study of academic psychologists](https://www.sciencedaily.com/releases/2010/11/101112094532.htm) published in the _Canadian Journal of Behavioural Science_ found self-oriented perfectionism negatively correlated with publication count, citations, and journal impact. The prolific researchers had more influence. The quality group sat theorizing and produced less impact.

**The call:** If you track one metric, track deploy frequency. It's both a leading indicator of quality and a forcing function for the feedback loops that produce it. Teams that deploy rarely are optimizing for something other than quality, whether they know it or not. For a longer look at [measuring whether your work is actually converting](/blog/proving-my-work-mattered/), that post gets into the mechanics.

## Too many gates, not enough kilns

I've seen this play out at previous jobs. Two orgs, same pattern, opposite outcomes.

Some orgs have content systems with no version control, no linting, no automated link checking, no rollback. Every change is irreversible. Of course those teams run everything through four rounds of review before it touches a user - the cost of a mistake is enormous, and the tooling makes every change feel like open-heart surgery. That's not a review culture. It's a fragile infrastructure that forced a review culture.

The orgs that grade on output have built different tooling: version control, automated tests, monitoring, rollback capability, analytics. Review exists as a checkpoint, not a gate, because the blast radius of any individual change is small and reversible. The iteration speed isn't a cultural stance. It's an infrastructure consequence.

Going rogue in an org without that foundation doesn't work - I've seen that fail too. Without version control, tests, measurement, and team buy-in, moving fast just means breaking things with no way back. You need [a completion standard that the team actually holds](/blog/an-engineers-guide-to-knowing-if-you-are-done-with-a-project/) - but one built for iteration, not for permanence.

The first type of org produces work that's more timely, more tied to what users actually need right now. They develop better taste over time, because taste comes from feedback, and feedback comes from shipping.

The second type produces grandiose theories and a pile of dead clay.

I'm not arguing against review. Review cycles are part of the kiln. The argument is about sequence and weight: build the infrastructure first, then use light review early and heavier review before major decisions. Not heavy review before anything moves, in a system where every change is irreversible.

**The call, if you're a manager:** Audit your review cycles. For each one, ask: is this a kiln or a gate? A kiln runs the work through production reality and makes it better. A gate adds latency and creates incentives to propose only safe, review-passable ideas. Kill the gates. Keep the kilns. And if the gates exist because the infrastructure is fragile - fix the infrastructure.

**The call, if you're an IC in a gated org:** Ship the smallest thing that doesn't require the gate. Use the result as the argument for removing it. One deployed experiment that didn't break anything is worth more than six months of process debate.

<div class="callout">

**AI makes this more urgent, not less.** AI tools let you write content, generate code, and make broad changes faster than ever - more clay, produced faster. But if your review infrastructure is still a gate, you've just moved the bottleneck. The orgs with version control, rollback, and automated checks will absorb that speed; the ones without will drown in it. The gap between high-infra and low-infra teams is going to widen as AI adoption grows. The philosophy hasn't changed. The stakes have.

</div>

## Don't ship the ugly pot into a radiation therapy machine

Aviation. Medical devices. Nuclear.

If you're writing software for cancer radiation therapy equipment, quality-first isn't wrong - it's legally required and morally necessary. [DO-178C](https://en.wikipedia.org/wiki/DO-178C) exists for reasons. The argument for shipping fast breaks down completely when "ship and learn" means "someone dies."

But here's how safety-critical domains actually work: the kiln doesn't disappear. It gets more expensive. Simulation rigs, hardware-in-the-loop testing, formal verification - those are kilns that cost a million dollars to fire. The feedback loop is still the mechanism. It just moved and got priced accordingly.

Most software teams aren't in those domains. If you are, you already know this.

## The only rule is work

I've been reading [_The Artist's Way_](https://www.amazon.com/Artists-Way-25th-Anniversary/dp/0143129252) lately, and the thing I keep noticing - in my writing, in my creative work, in how I show up at work - is that the act of producing and paying attention makes you better faster than planning to produce. The skills I've built by making a lot of work quickly show up as confidence, as speed, as the ability to articulate what actually works and why. Because I'm running things through the kiln and observing what comes out.

What I keep returning to: most of what the art world figured out about how to get good at making things, the tech world hasn't fully absorbed. Art has always known you develop voice and craft through volume and attention - not by waiting until you know enough to start. There's a lot tech could learn from the softer disciplines, and this is probably the most transferable thing.

Sister Corita Kent taught in the [Immaculate Heart College Art Department](https://www.corita.org/tenrules) from 1947 to 1968 and chaired it in its most influential years. Rule 7 from her department's list is the bluntest version of this I've found:

![Immaculate Heart College Art Department Rules poster showing all ten rules in colorful handwritten text, with Rule 7 reading 'The only rule is work'](/images/blog/ship-the-ugly-pot/immaculate-heart-rules.webp)

> "The only rule is work. If you work, it will lead to something. It's the people who do all of the work all of the time who eventually catch on to things."

No caveats. No "but make sure it's good first." **Just: work.**

The pottery group. Rule 7. The DORA data. The Artist's Way. All pointing at the same underlying mechanism: _you don't think your way to quality. You ship your way there._

I've written more about the environment side of this - the psychological safety and conditions that make fast iteration possible - in [The Cognitive Case for Play in Technical Work](/blog/cognitive-case-for-play-in-technical-work/). This post is about the practice. That one's about the conditions.

Make the pots. Run them through the kiln. Learn. Make better pots.

---

## FAQ

**Does quantity actually beat quality, or is that oversimplified?**

It depends on the domain. In iterative creative and technical work - software, writing, design - quantity beats quality as a _learning strategy_ because feedback compounds. Each completed artifact teaches you something the next one benefits from. In safety-critical domains (aviation, medical devices, nuclear), quality-first constraints are legally and morally required and this framing doesn't apply the same way.

**Is the pottery class experiment a real study?**

No, it's a parable from _Art & Fear_ (Bayles and Orland, 1993). The original was Jerry Uelsmann's photography class at the University of Florida. Ted Orland replaced the medium with ceramics when retelling it. No peer-reviewed study replicated the exact setup - but the DORA State of DevOps research provides large-scale empirical support for the same conclusion in software engineering.

**What is a deployment-quality loop?**

The feedback cycle where frequent small deployments to production generate learning that improves the next deployment. DORA research shows elite teams that deploy on-demand have lower change failure rates and faster recovery times than teams that deploy infrequently. Speed and quality correlate positively - they don't trade off.

**What is the perfection trap?**

When a team or individual confuses planning for quality with producing quality. Both feel like work from the inside, but only production generates feedback. The quality group in the pottery parable fell into the perfection trap: they theorized about a perfect pot instead of making pots.

**What's the difference between a kiln and a gate?**

A kiln runs work through production reality and makes it better - tests, observability, real user feedback, retros. A gate just adds latency and incentivizes safe, review-passable proposals over good ideas. Review cycles can be either. Auditing which type each review cycle is helps teams keep the kilns and remove the gates.

**What did the 2025 DORA data say about AI coding tools and quality?**

Teams that adopted AI code assistants saw throughput increase. But delivery stability was determined by teams' existing feedback infrastructure - testing, observability, deployment practices - not by how often they'd shipped before. AI made it easier to produce clay. Whether teams ran it through the kiln was the variable that mattered.
