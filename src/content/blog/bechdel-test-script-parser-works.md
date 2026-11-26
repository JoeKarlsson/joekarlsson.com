---
title: 'Bechdel Test Script Parser - How It Works'
date: 2015-12-19
updatedDate: 2026-11-16
slug: 'bechdel-test-script-parser-works'
description: 'How the Bechdel Test Script Parser works - the digital humanities tool my sister Laurel and I built to check whether film scripts pass the Bechdel Test.'
categories: ['Web Dev']
heroImage: '/images/blog/bechdel-test-script-parser-works/thumb-64976f22.webp'
heroAlt: 'Ripley and Lambert side by side in Alien (1979)'
contentNotice: false
tldr: "My sister and I built a tool that parses movie screenplays and tests them against the Bechdel Test using JavaScript and Node.js. Here's how the script parsing actually works under the hood."
marginNotes:
  - type: 'term'
    at: 'collaborative digital humanities project'
    text: 'using computers to study literature, film, history and art, often by counting and charting patterns across many works at once.'
    term: 'Digital humanities'
  - type: 'quote'
    at: 'shared passion for film, feminism'
    text: 'I am pretty certain that my friend Liz Wallace, from whom I stole the idea in 1985, stole it herself from Virginia Woolf.'
    by: 'Alison Bechdel on where the test came from, Testy, 2013'
    url: 'https://dykestowatchoutfor.com/testy/'
corrections:
  - date: 2026-11-16
    note: "I credited a 2011 paper by Murtagh, Ganz and Reddington for lines that came from Hoyt, Ponto and Roy's 2014 ScripThreads paper, and I'd copied several of their sentences nearly word for word. The credit now goes to them, and those sentences are in my own words."
mastheadImage: '/images/blog/bechdel-test-script-parser-works/masthead-9e6f52c4.webp'
---

[The Bechdel Test Script Parser](https://bechdel.joekarlsson.com/) was a collaborative digital humanities project between myself and my sister, Laurel Karlsson. It is the product of a shared passion for film, feminism, and the creative potential of technology. By combining the talents and interests of myself, a software engineer, and my sister, an English Scholar, we’ve been able to create an innovative data mining tool for a film analysis that we hope to continue to work on and improve. You can check out the project on our website, and the open-source code can be viewed [here](https://github.com/JoeKarlsson/bechdel-test). I also gave a [talk about how we used JavaScript to help make film more inclusive](/talks/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/) with this project. In 2026 I [started it over as a static site](/blog/hackers-and-painters-ai-agents/).

This project was born when my sister reached out to me for advice on a few ideas she had been mulling over for a digital humanities project. Hoping to do something related to feminist film analysis, she was feeling limited by her lack of coding experience and hadn’t been able to find an existing data mining tool to accomplish what she was looking to do. I immediately offered up my coding expertise, looking to gain experience by building a tool from scratch which would accomplish the specific needs of the project. After brainstorming several different project ideas, we settled on the one you see here.

## How It Works

![A typed screenplay page in Courier: the scene heading EXT. TROIA - NOX, action lines, and character names like AENEAS centered in capitals above indented lines of dialogue.](/images/blog/bechdel-test-script-parser-works/a-page-in-standard-screenplay-format.webp 'margin: A page in standard screenplay format. Wikimedia Commons, public domain.')

Screenplays are close to ideal material for a computer. Character names are in capitals, dialogue is indented, and the rest of the format follows strict conventions, so a program can work out who is on the page and when. [Eric Hoyt, Kevin Ponto and Carrie Roy](https://dhq.digitalhumanities.org/vol/8/4/000190/000190.html 'cite: Hoyt, Ponto, and Roy, 2014') make this case in their paper on ScripThreads, their screenplay visualization tool. Coupled with massive online movie databases, we can parse through movie scripts and collect insights on a level not yet seen before. In this blog post, I introduce our new web app, Bechdel Test Visualizer. It parses screenplays, puts out gender statistics you can analyze, and draws them as four different kinds of visualization. In this analysis, my sister and I use the Bechdel Test Visualizer to analyze the 2014 Oscar Best Picture Nominees.

## Building Process

Building the prototype showed me how differently a computer reads a screenplay than a person does. We watch a movie and take in its emotion, its tension and the way the characters play off each other. Instead of trying to teach a computer to watch a film the way I do, I'd rather give it the jobs it does well and we do badly. People lose track of timing, and of who enters and leaves, once a film has dozens of characters. A computer can log every one of those details from a structured text. Hoyt, Ponto and Roy [made the same point](https://dhq.digitalhumanities.org/vol/8/4/000190/000190.html 'cite: Hoyt, Ponto, and Roy, 2014') about ScripThreads.

Lev Manovich argues that packing a huge amount of information into a single image makes the works we study in the humanities look unfamiliar again [[Manovich 2012]](https://manovich.net/index.php/projects/cultural-analytics). I hope the Bechdel Test Visualizer does that for film: it should raise new questions about gender and film, and answer some of them with what the human analyst and the computer each do best.

Years later I came back to the same idea with Punc, which strips the words out of 1,959 books, and used it to [test whether English sentences got shorter](/blog/sentence-length-semicolons-punctuation/).

## Parsing Method

The Bechdel Test Visualizer is a web application built entirely using JavaScript and Node.js. This tool uses a combination of online databases manual script parsing in order to collect insights about a film.

![A typed screenplay title page reading SKYFALL, screenplay by Neal Purvis and Robert Wade, revised by John Logan, under a list of colored revision dates.](/images/blog/bechdel-test-script-parser-works/skyfalls-shooting-script-title-page-wikimedia.webp "margin: Skyfall's shooting script title page. Wikimedia Commons, public domain.")

First, the script finds the title of the film, this is generally on the first page, and for the prototype, it is required to be the first line of text in the text file. Once the title of the film has been identified, I make an API call out to [myapifilms.com](https://www.myapifilms.com/). From here, I can collect general information about the film, such as genre, release year, runtime, etc. But the most important information comes from collecting information about the actors and actresses in the film. Using this API, I can collect a list of all of the actors and actresses, their characters’ names in the film, and what gender they are. The character’s gender is the most important bit of information I can collect since it is essential when trying to determine if a scene passes the Bechdel test or not.

Once all of the gender and film data has been collected via the API - I can begin analyzing the script. The first step is to break the script down into scenes in order to tell if two females shared a scene together. Scenes were determined by looking for a user-defined set of keywords, such as “int.” or “ext.”. In practice, it was determined that a list of 10-12 keywords well-captured scene changes.

In the scene, I collected dialogue by character by using simple parsing techniques. I was then able to test if two female character’s shared a scene. If two or more females shared a scene together, I tested their dialogue by checking if their dialogue contained keywords that indicated that they were speaking about a man or men. This list included words like ‘He’, ‘Him’, ‘Father’, ‘King’, etc. This list is basic, and after initial tests, I can see that this list needs additional work, as patriarchal words are ingrained in the English Language, and judging context is very difficult for a computer to do. However, for the context of my experiments, this list has sufficed. This tool, however, is very good at generating data on gender participation in films.

![How the Bechdel Test Visualizer reads a screenplay. It takes the title from the first line of the text file and asks myapifilms.com for the cast, their characters and each one’s gender. Then it splits the script into scenes using 10 to 12 keywords like int. and ext., and collects each character’s dialogue. A scene fails if fewer than two women are in it. If two or more are, it checks their dialogue for words about a man, like he, him, father or king: if it finds one, the scene fails, and if not, the scene passes.](/images/blog/bechdel-test-script-parser-works/parsing-method.svg)
