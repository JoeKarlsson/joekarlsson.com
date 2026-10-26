---
title: 'tl;dr in tech - Issue #69'
date: 2023-03-07
slug: 'tldr-in-tech-issue-69'
description: 'By: Joe Karlsson'
issue: 69
substackUrl: 'https://joekarlsson.substack.com/p/tldr-in-tech-issue-69'
---

Ahoy, mateys! Avast ye and hoist the mainsail, because we're setting course for uncharted digital waters. Here are three tips to help you build a site that'll shiver the timbers of even the toughest recruiters:

1. Keep it simple: No need to hoard all the gold and silver doubloons in your portfolio. Keep things streamlined and easy to navigate, just like the sleek lines of a well-crafted vessel.
2. Highlight your strengths: Just like a captain boasting of their voyages, make sure to showcase your most impressive projects and accomplishments. It'll make you stand out in a sea of bland resumes and profiles.
3. Show off your personality: Aye, there be no need to be a dry landlubber! Let your unique voice and character shine through on your site, whether it be through witty quips or clever design.

So, polish your eyepatches and hoist your colors high, because with these tips, you'll be well on your way to a top-notch portfolio website!

---

![Congestion control graph](/images/newsletter/tldr-in-tech-issue-69/image.webp)

**[HTTP/3 Prioritization Demystified](https://calendar.perfplanet.com/2022/http-3-prioritization-demystified/)**  
\- Robin Marx  
**tl;dr**: "What exactly does prioritization mean? How does it work under the hood? Why is it important to have some control over it? and, crucially, do all browsers agree on which resources are most important?"

---

**[Overcoming The Resistance](https://hagakure.substack.com/p/twh41-overcoming-the-resistance)**  
\- Paulo André

**tl;dr**: Paolo discusses hesitating due to one's imposter syndrome: "How can we create the conditions to just start? How can we feel the fear… and do it anyway?"

1. Create a process… and then trust in it.
2. Use the Procrastination Pomodoro.
3. 80% is good enough.
4. Feed your own feedback loop.
5. Don't seek to make the right decision. Make the decision right.

---

![Animated terminal typing out a let statement](/images/newsletter/tldr-in-tech-issue-69/image-2.gif)

**[What If Writing Tests Was A Joyful Experience?](https://blog.janestreet.com/the-joy-of-expect-tests/)**  
\- James Somers  
**tl;dr**: "At Jane Street we use a pattern / library called "expect tests" that makes test-writing feel like a REPL session, or like exploratory programming in a Jupyter notebook - with feedback cycles so fast and joyful that it feels almost tactile. Having used them for some time now this is the only way I'd ever want to write tests."

---

![McDonald's golden arches sign under a glass atrium roof](/images/newsletter/tldr-in-tech-issue-69/image-3.webp)

**[McDonald's Event-Driven Architecture: The Data Journey And How It Works](https://medium.com/mcdonalds-technical-blog/mcdonalds-event-driven-architecture-the-data-journey-and-how-it-works-4591d108821f)**  
\- Vamshi Krishna Komuravalli, Damian Sullivan

**tl;dr**: Here is a typical data flow of how events are reliably produced and consumed from the platform:

1. Initially, an event schema is defined and registered in the schema registry.
2. Applications that need to produce events leverage producer SDK to publish events.
3. When an application starts up, an event schema is cached in the producing application for high performance. The authors continue to discuss how data flows through the system.

---

![Architecture diagram of the Atlassian Marketplace backend and the services it queries: Commerce, HAMS, Atlassian Identity, People Atlassian Knows Of and Algolia](/images/newsletter/tldr-in-tech-issue-69/image-4.webp)

**[Architecture Diagrams Should Be Code](https://brianmckenna.org/blog/architecture_code)**  
\- Brian McKenna

**tl;dr**: "Architecture code can be versioned with the code which implements it. We can write algorithms to check our architecture. I'd like to see more tools available to describe architecture as part of code, allowing us to generate as many diagrams as we want, for accurate and easy communication."

---

**[Data Engineering Zoomcamp](https://github.com/DataTalksClub/data-engineering-zoomcamp)**  
Free Data Engineering course. 

---

**[What Happens When A CPU Starts](https://web.archive.org/web/20230327194921/https://lateblt.tripod.com/bit68.txt)**

**tl;dr**: "Generally, when a CPU chip first receives power, it must be reset by receiving a pulse on its RESET (or RST) pin. This is because when the power supply is first powering up, even if it only takes a second or two, the CPU has already received "dirty" power, because the power supply was building up a steady stream of electricity."

---

![Painted atom symbol in light blue on a dark blue wall](/images/newsletter/tldr-in-tech-issue-69/image-5.webp)

**[The Ugliest Pattern In React](https://sebastiancarlos.medium.com/the-ugliest-pattern-in-react-%EF%B8%8F-adjusting-state-in-response-to-rendering-e8f651fa958b)**  
\- Sebastian Carlos  
**tl;dr**: "Maybe the ugliness is a virtue, since it encourages us to completely change the code to enable some of the better alternatives mentioned above - After all, "adjusting state in response to rendering" will always result in code that's difficult to understand."
