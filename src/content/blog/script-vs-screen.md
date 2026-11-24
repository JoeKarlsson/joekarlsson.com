---
title: 'I compared 2,112 movie scripts with what was actually said on screen. Bad movies threw theirs out.'
shareTitle: 'I compared 2,112 movie scripts with what was said on screen'
seoTitle: 'Movie scripts vs. what was said on screen'
date: 2026-11-24
slug: 'script-vs-screen'
description: 'I lined up 2,112 screenplays with the subtitles of the finished films. The typical movie keeps 42% of its script word for word, and the better a movie is rated, the more of its script made it.'
categories: ['Web Dev']
tags: ['bechdel', 'digital-humanities', 'data-analysis', 'film', 'screenplays']
tldr: 'I lined up 2,112 screenplays, word for word, with the subtitles of the films they became. The typical film keeps 42% of its script. Films rated under 6 on IMDb keep 30%, and films rated 8 or more keep 50%, and that holds inside shooting scripts and early drafts alike. When the writer also directs, 49% survives, against 37% when they don''t.'
marginNotes:
  - type: 'term'
    at: 'English subtitles'
    text: 'from OpenSubtitles. A word counts as said only when most of a film''s subtitle versions (up to nine) have it, so one sloppy subtitler can''t make a line look cut.'
    term: 'The subtitles'
  - type: 'aside'
    at: "Hampton Fancher's draft"
    text: 'David Peoples rewrote Fancher''s script before the shoot. Rutger Hauer has said he cut part of Peoples''s version of the speech and added the "tears in rain" line himself.'
    url: 'https://en.wikipedia.org/wiki/Tears_in_rain_monologue'
  - type: 'term'
    at: 'a correlation of 0.26'
    text: 'Spearman''s rank correlation, from -1 to 1, where 0 means no relationship. 0.26 is a real but modest tendency (95% interval 0.22 to 0.30), so there are plenty of exceptions.'
    term: 'Correlation'
  - type: 'term'
    at: 'shooting scripts'
    text: 'the version a production films from, usually with numbered scenes and colored revision pages. The final edit can still change a lot of it.'
    term: 'Shooting script'
  - type: 'aside'
    at: 'probably a transcript'
    text: 'Studios post "For Your Consideration" scripts during awards season, and fan sites post transcripts typed from the film. Both match the screen almost perfectly, which is why the very top of every list here is suspect.'
  - type: 'see'
    at: 'checks 3,711 movies against the Bechdel test'
    text: 'how the script parser behind the site started, in 2015'
    post: 'bechdel-test-script-parser-works'
---

A movie script is a plan, and nobody follows the plan exactly. Actors improvise, directors rewrite on set, and editors cut whole scenes. I wanted to know how much of a script actually survives, so I lined up 2,112 screenplays, word by word, with the English subtitles of the films they became.

The typical movie keeps **42%** of its script, word for word. The part I didn't expect is who keeps more.

![Scatter chart of 2,112 films: IMDb rating against the share of the script's dialogue said word for word on screen. The median rises with the rating: 30% for films rated under 6, 38% for 6 to 7, 47% for 7 to 8 and 50% for 8 and up. Big exceptions both ways: Interstellar (rated 8.7, 9% kept) and Bridesmaids (6.8, 6%) near the bottom, The Princess Bride (8.0, 97%) at the top.](/images/blog/script-vs-screen/chart-rating.svg)

Movies rated under 6 on IMDb kept 30% of their scripts. Movies rated 8 or higher kept 50%. It's a correlation of 0.26, a tendency and not a law: _Interstellar_ kept 9% and it's rated 8.7. But the climb is there, step by step, across all 2,112 films.

## What a lost script looks like

Here's the end of _Blade Runner_ (19% kept). The script I have is Hampton Fancher's draft, and in it Roy Batty never gives a speech. He hands Deckard a nail, tells him to stick it in his ear, and Deckard shoots him.

![Blade Runner's ending, script against screen. In Hampton Fancher's draft, Batty says "It's time to die," hands Deckard a nail ("Stick it in your ear and push"), and Deckard shoots him dead. In the film, Batty saves Deckard and says: I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time like tears in the rain. Time to die. Of the draft's lines, only "time to die" is said on screen.](/images/blog/script-vs-screen/chart-blade-runner.svg)

Three words made it: "time to die." Everything else in the scene was rewritten, and the rewrite is one of the most famous speeches in film. Losing most of a script doesn't doom a movie: _Blade Runner_ is rated 8.1. On average, though, the films that lost the most are the ones people liked least.

## Why bad movies lose their scripts

You might think famous movies just have better scripts floating around online. Studios publish polished final versions of their prestige films, and those match the screen better than an early draft would. If that were the whole story, the pattern would vanish once you compare like with like.

It doesn't. The study has 640 shooting scripts and 131 early drafts, and the climb shows up inside each:

![Line chart: median share of the script said word for word, by IMDb rating band. Shooting scripts: 32% (under 6), 38% (6 to 7), 47% (7 to 8), 51% (8 and up). All films: 30%, 38%, 47%, 50%. Early drafts: 15%, 23%, 35%, 45%. Every line climbs with the rating.](/images/blog/script-vs-screen/chart-drafts.svg)

It also holds for films from before 1990, from 1990 to 2009, and from 2010 on.

What the data can't say is which way it runs. There are two stories, and they're both probably true some of the time:

- **Trouble causes rewrites.** A production that's going badly rewrites on the fly, reshoots the ending and cuts the parts that tested poorly. The rewriting is a symptom. A massive structural change is rare, and when you hear about one, the movie is usually a fiasco.
- **Rewrites cause trouble.** A movie that starts shooting without a finished script ends up being written in the edit, and it shows.

My bet is mostly the first. Either way, a low number is a decent sign that something went sideways between the page and the premiere. _Battlefield Earth_, rated 2.5, kept 17%.

## Writers who direct keep their words

When the person who wrote the script also directs it, **49%** survives. When someone else directs, **37%** does. That gap holds inside shooting scripts and early drafts too.

![Dot chart: share of each film's script said word for word, for six directors. Joel Coen, 19 films: median 73%. Billy Wilder, 5 films: median 81%. Christopher Nolan, 11 films: median 67%, from Interstellar at 9% to Dunkirk at 80%. Quentin Tarantino, 9 films: median 48%. Martin Scorsese, 16 films: median 48%. Steven Spielberg, 21 films: median 37%, from The Post at 7% to War Horse at 96%.](/images/blog/script-vs-screen/chart-directors.svg)

The Coens, who write everything they direct, bunch up near the top. Billy Wilder, who did too, is the most consistent director in the set. Spielberg, who mostly shoots other people's scripts, is all over the place: _The Post_ kept 7% and _War Horse_ kept 96%.

Treat any single film here with suspicion, though. A score depends on which version of the script is online. Judd Apatow's _Knocked Up_ scores 96% and his _Funny People_ scores 11%, and the _Knocked Up_ script online is probably a transcript. The high end of every list here has a few of those.

## Action movies rewrite the most

You'd guess improv comedies throw out the most dialogue. They don't. Comedy keeps 42%, right at the average. The genres at the bottom are action, war and sport.

![Bar chart: median share of the script said word for word, by genre. Animation 88%, History 52%, Biography 47%, Fantasy 47%, Romance 47%, Drama 46%, Family 44%, Adventure 43%, Comedy 42%, Mystery 42%, Music 40%, Thriller 39%, Crime 39%, Sci-Fi 39%, Horror 35%, Action 33%, Sport 31%, War 31%.](/images/blog/script-vs-screen/chart-genres.svg)

Animation is the outlier at 88%. Voices are recorded before anyone draws a frame, so there's no set to wander off on.

Some improvised comedies still land at the very bottom. _Bridesmaids_ kept 6% and _Step Brothers_ kept 15%. Comedy as a whole just isn't where most of the rewriting happens. My guess is that action movies get rewritten around stunts, locations and reshoots, and their dialogue goes with it.

## Why I built this

I didn't set out to study script rewrites. I run [Bechdel Script Test](https://bechdel.joekarlsson.com/), which checks 3,711 movies against the Bechdel test by reading their scripts, and the first thing anyone says about it is that the script isn't the movie. This was my way of checking. The words change a lot, but the verdict mostly doesn't: it holds for about 95% of films, checked against [bechdeltest.com](https://bechdeltest.com/) readers who rated the released movies.

## How I counted

For each film I took the share of the script's dialogue words that turn up in the English subtitles in the same order. A reworded line counts as lost, so this measures exact wording, not plot. To check that subtitles weren't just shortening lines, I listened to 100 lines my tool called cut or reworded, in the films themselves; about nine in ten really were.

The limits: subtitles aren't a transcript, and "not in the script" means not in the draft I had. Scripts online skew popular, American and recent. Ratings are IMDb's. The method and every check are in [METHODS.md](https://github.com/JoeKarlsson/bechdel-test/blob/main/docs/page-vs-screen/METHODS.md).
