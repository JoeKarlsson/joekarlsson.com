---
title: 'Bechdel.io - How We Used JavaScript To Help Make Film More Inclusive'
seoTitle: 'Bechdel.io: JavaScript for Inclusive Film'
date: 2020-05-16
slug: 'bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive'
description: 'My talk on bechdel.io, the tool my sister Laurel and I built to check film scripts for the Bechdel Test: what the test is, how the code reads a script, and where it gets things wrong.'
categories: ['Web Dev']
heroImage: '/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/thumb-13e27d52.webp'
heroAlt: 'A packed movie theater audience watching the screen'
tldr: "The Social Network, Harry Potter and Citizen Kane all fail the Bechdel Test. bechdel.io splits a film script into scenes, looks up each character's gender on IMDb and checks whether two women talk about something other than a man. The hard part is that patriarchal words are deeply ingrained in our vocabulary."
---

What do The Social Network, Lord of the Rings, Harry Potter and Citizen Kane have in common? They're some of the most beloved films of all time, and none of them pass the Bechdel Test. My sister Laurel Karlsson and I built bechdel.io to check film scripts for it automatically, and this talk is how it works and what we learned. Laurel is an American Studies scholar and has used the code in her research. This recording is the two of us at MongoDB World 2020.

[Watch Bechdel.io: How We Used MongoDB To Help Make Film More Inclusive on YouTube](https://www.youtube.com/watch?v=4W5fJTyfj1Q)

## What the talk covers

**What the Bechdel Test is.** It comes from "The Rule," a 1985 strip in Alison Bechdel's comic Dykes to Watch Out For. Two women are deciding which movie to see, and one of them only goes if it meets three rules:

1. It has at least two women in it,
2. who talk to each other,
3. about something other than a man or men.

![Comic strip explaining the Bechdel Test rule: a movie must have two women who talk to each other about something other than a man](/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/download-1-765x1024.webp)

**What the test is and isn't.** Did you enjoy Return of the Jedi but hate the Ewoks? Then you understand feminist film criticism: a film can still be good despite its weaker elements. The Bechdel Test is one lens for looking at a film and analyzing it. That's it. It isn't a perfect test, either. Like any metric, it can be gamed: two women talking about a lamp or a salad technically pass. It's the bare minimum. And it only considers women, so it says nothing about non-binary characters.

**How bechdel.io reads a script.** You upload a film script and it tells you whether the film passes. It also runs gender analytics on the film: the gender of the director, writers and producers, and how much dialogue goes to each gender. Film scripts follow a strict format, which makes them easy for code to read:

1. **Split the script into scenes.** Each scene starts with a heading keyword like `INT.`, so the code looks for those to find where scenes begin and end. That tells us which characters share a conversation.
2. **Find each character's gender.** The code looks up the film on IMDb, finds who plays each character, and uses the actor's gender from their IMDb page.
3. **Check whether the women talk about a man.** This is the hard part. The code looks for keywords that mean the scene is about a man or men.

The example in the talk is a kitchen scene from a 2015 Best Picture nominee, with Samantha, Mason and Mom. Two women, so the first rule passes. But Mom and Samantha are talking about Dad, so the scene fails.

## Lessons learned

- **Patriarchal words are deeply ingrained in our vocabulary.** In that same scene, Samantha jokes "Yes, sir" to her mom. Nobody's talking about a man, but the keyword says otherwise. I have ideas for fixing it, and it's still a hard problem.
- **It doesn't work for transgender characters.** Gender comes from the actor's IMDb page, so it breaks when an actor plays a character of another gender, like Jeffrey Tambor in Transparent.
- **Digital humanities needs developers.** Everyone's building a to-do app or a restaurant finder. Find a new way to analyze Shakespeare instead, or a data visualization nobody thought of. A lot of people in the humanities don't have the technical skills, and they're looking for developers who do.

![Tweet by Laurie Voss about applying the Bechdel test to code](/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/download-1024x586.webp)

I end with Laurie Voss's Bechdel Test for code: a function written by a woman calls another function written by a woman. Does your company's code base pass? If it doesn't, that's a problem.

For the parsing algorithm in more detail, I wrote up [how the Bechdel Test script parser works](/blog/bechdel-test-script-parser-works/). The project has its own page on my [work page](/work/bechdel-io/).

## Where I've given it

Laurel and I gave it together as Bechdel.io: The Future of Film and Feminism at the Association for Computers and the Humanities in Pittsburgh (July 2019), and again at MongoDB World 2020. I gave a 15-minute solo version at the CascadiaJS August 2020 meetup and DevFest Wisconsin 2020. Other recordings:

- [CascadiaJS August 2020 meetup](https://www.youtube.com/watch?v=KDH4esqOezA)
- [DevFest Wisconsin 2020](https://www.youtube.com/watch?v=7az78FYgwx4)
- [ACH 2019, with Laurel](https://www.youtube.com/watch?v=m0GWc5qw32w)

## Slides and resources

The bechdel.io domain is gone, but the site lives on at bechdel.joekarlsson.com.

- [Try bechdel.io](https://bechdel.joekarlsson.com/)
- [Laurel's case study](https://bechdel.joekarlsson.com/case-study/)
- [Slides on Speaker Deck](https://speakerdeck.com/joekarlsson/bechdel-dot-io-how-we-used-javascript-to-help-make-film-more-inclusive)
- [Source code on GitHub](https://github.com/JoeKarlsson/bechdel-test)
- ["The Rule," the original 1985 Dykes to Watch Out For strip](https://dykestowatchoutfor.com/the-rule/)
- [bechdeltest.com](https://bechdeltest.com/)
- [If You Like Return of the Jedi but Hate the Ewoks, You Understand Feminist Criticism (AV Club)](https://www.avclub.com/if-you-like-return-of-the-jedi-but-hate-the-ewoks-you-1798284198)
