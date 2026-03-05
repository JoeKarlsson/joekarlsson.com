---
title: 'Bechdel.io - How We Used JavaScript To Help Make Film More Inclusive'
date: 2020-05-16
slug: 'bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive'
description: 'Thanks for coming to my talk, Bechdel.io - How We Used JavaScript To Help Make Film More Inclusive. Here you will find all the resources discussed during the talk. About What do The Social Network,...'
categories: ['Film']
heroImage: '/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/Bechdel.io-Blog-Banner.webp'
heroAlt: 'Bechdel.io blog banner showing the project logo'
tldr: 'My sister and I built bechdel.io, a JavaScript tool that automatically parses film scripts to check if they pass the Bechdel Test. I cover how it works and what we learned from the data.'
---

Thanks for coming to my talk, Bechdel.io - How We Used JavaScript To Help Make Film More Inclusive. Here you will find all the resources discussed during the talk.

## About

What do The Social Network, Harry Potter, The Original Star Wars Trilogy, and Toy Story all have in common? None of these great films pass the Bechdel Test. The Bechdel Test asks whether a film meets all of the following criteria:

- It includes at least two women.
- Who have at least one conversation.
- About something other than a man or men.

In this talk, we will discuss how a brother and sister team created, bechdel.io, a film script parsing tool that automatically tests film scripts to determine whether or not they pass the Bechdel Test in a fraction of a second. If you want to dig into the technical details of the parsing algorithm, I wrote a separate post about [how the Bechdel Test script parser works](/blog/bechdel-test-script-parser-works/). We discuss the technical details of how we created the tools, including how we used MongoDB to help us scale and create new insights and discoveries. We will also cover highlights from our academic research that has emerged as a result of this software.

## Source Code

[JoeKarlsson/bechdel-test on GitHub](https://github.com/JoeKarlsson/bechdel-test)

## Slides

[View the slides on SpeakerDeck](https://speakerdeck.com/joekarlsson/bechdel-dot-io-how-we-used-javascript-to-help-make-film-more-inclusive)

## Notes

This collaborative digital humanities project is the product of a shared passion for film, feminism, and the creative potential of technology. By combining the talents and interests of an American Studies scholar and an independent software engineer, we’ve created an innovative data mining tool for feminist film analysis.

The importance of this tool lies in its ability to analyze films on the macro-level. While anyone can sit through a film with a notebook and pencil in order to determine if it passes the Bechdel Test, this is a slow and cumbersome process. With the tool we’ve created, the process is automated, which allows massive amounts of data to be generated with ease. Thus, data can be produced for large bodies of film, i.e. a certain director’s filmography, a certain actress’ body of work, or for the films released in a specific year.

We view this tool as a form of feminist activism. As such, the software is open-source and available for use by anyone and everyone. You can find Bechdel.io and my other [projects on my work page](/work/).

Outline:

- Introduction - What is the Bechdel test?
  - The film must pass these three Rules:
    - The film must have two or more named female characters
    - Who have a conversation with each other
    - About something that is NOT a man or men
  - Origin of the Bechdel Test
- An origin story - how did this project get started and created?
  - Combining the talents and interests of an American Studies scholar and an independent software engineer
- How the heck does it work?
  - Step through how the algorithm works (w/o any code)
- Highlights from our academic study of the 2015 Oscar Best Picture Nominees
- Lessons Learned?
  - Patriarchal words are deeply ingrained in our vocabulary
  - Our app does not [currently] work with transgender characters
  - Lots of cool opportunities in the DIGITAL HUMANITIES for engineers
- Additional applications:
  - Bechdel test for software engineering - A function written by a female dev must call a function written by another female dev.
- Questions/Recap
- End!

## Video

[Watch the talk on YouTube](https://www.youtube.com/watch?v=4W5fJTyfj1Q)

![Comic strip explaining the Bechdel Test rule: a movie must have two women who talk to each other about something other than a man](/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/download-1-765x1024.webp)

![Tweet by Laurie Voss about applying the Bechdel test to code](/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/download-1024x586.webp)

## Related Links

Note: The bechdel.io site is no longer live. The links below point to archived versions.

- Bechdel.io: [http://www.bechdel.io](https://web.archive.org/web/20211222040320/http://www.bechdel.io/)
- Case Study: [http://www.bechdel.io/case-study](https://web.archive.org/web/20211222040320/http://www.bechdel.io/)
- Source Code: [https://github.com/JoeKarlsson/bechdel-test](https://github.com/JoeKarlsson/bechdel-test)
- Bechdel Test Movie List: [https://bechdeltest.com](https://web.archive.org/web/20240527030511/https://bechdeltest.com/)
- Original Bechdel Test Comic: [https://dykestowatchoutfor.com/the-rule](https://dykestowatchoutfor.com/the-rule)
- [If you Like Return of the Jedi, but Hate Ewoks, then you Understand Feminist Criticism (AV Club)](https://www.avclub.com/if-you-like-return-of-the-jedi-but-hate-the-ewoks-you-1798284198)
- [MongoDB University](https://learn.mongodb.com)
