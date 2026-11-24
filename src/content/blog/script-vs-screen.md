---
title: 'I compared 2,112 movie scripts with what was actually said on screen. Bad movies threw theirs out.'
shareTitle: 'I compared 2,112 movie scripts with what was said on screen'
seoTitle: 'Movie scripts vs. what was said on screen'
date: 2026-11-24
slug: 'script-vs-screen'
description: 'I lined up 2,112 screenplays with the subtitles of the finished films. On average, the further a movie strays from its script, the worse it''s rated. Jaws, Apocalypse Now and Interstellar strayed anyway.'
categories: ['Web Dev']
tags: ['bechdel', 'digital-humanities', 'data-analysis', 'film', 'screenplays']
tldr: 'I lined up 2,112 screenplays, word for word, with the subtitles of the films they became. Films rated under 6 on IMDb kept 30% of their scripts, and films rated 8 or more kept 50%. Some of the best movies ever made threw their scripts out anyway. My read: going off the page is a gamble that usually loses, and the wins need a rare kind of director.'
marginNotes:
  - type: 'term'
    at: 'English subtitles'
    text: 'from OpenSubtitles. A word counts as said only when most of a film''s subtitle versions (up to nine) have it, so one sloppy subtitler can''t make a line look cut.'
    term: 'The subtitles'
  - type: 'term'
    at: 'a correlation of 0.26'
    text: 'Spearman''s rank correlation, from -1 to 1, where 0 means no relationship. 0.26 is a real but modest tendency (95% interval 0.22 to 0.30), so there are plenty of exceptions.'
    term: 'Correlation'
  - type: 'see'
    at: 'Some of the best movies ever made'
    text: 'my review of Interstellar, four and a half stars and 9% of its script'
    post: 'reviews/interstellar'
  - type: 'aside'
    at: "Hampton Fancher's draft"
    text: 'David Peoples rewrote Fancher''s script before the shoot. Rutger Hauer has said he cut part of Peoples''s version of the speech and added the "tears in rain" line himself.'
    url: 'https://en.wikipedia.org/wiki/Tears_in_rain_monologue'
  - type: 'term'
    at: 'shooting scripts'
    text: 'the version a production films from, usually with numbered scenes and colored revision pages. The final edit can still change a lot of it.'
    term: 'Shooting script'
  - type: 'aside'
    at: 'probably a transcript'
    text: 'Studios post "For Your Consideration" scripts during awards season, and fan sites post transcripts typed from the film. Both match the screen almost perfectly, which is why the very top of every list here is suspect.'
  - type: 'see'
    at: 'kept 19% of its script'
    text: 'my review of The Truman Show'
    post: 'reviews/the-truman-show'
  - type: 'see'
    at: 'My favorites don''t follow'
    text: 'my review of Jaws, five stars and 26% of its script'
    post: 'reviews/jaws'
  - type: 'see'
    at: 'checks 3,711 movies against the Bechdel test'
    text: 'how the script parser behind the site started, in 2015'
    post: 'bechdel-test-script-parser-works'
---

A movie script is a plan, and nobody follows the plan exactly. Actors improvise, directors rewrite on set, and editors cut whole scenes. I wanted to know how much of the plan survives, so I lined up 2,112 screenplays, word by word, with the English subtitles of the films they became.

The typical movie keeps 42% of its script word for word. And the less a movie kept, the worse people tend to think it is.

![Scatter chart of 2,112 films: IMDb rating against the share of the script's dialogue said word for word on screen. The median rises with the rating: 30% for films rated under 6, 38% for 6 to 7, 47% for 7 to 8 and 50% for 8 and up. Big exceptions both ways: Interstellar (rated 8.7, 9% kept) and Bridesmaids (6.8, 6%) near the bottom, The Princess Bride (8.0, 97%) at the top.](/images/blog/script-vs-screen/chart-rating.svg)

Movies rated under 6 on IMDb kept 30% of their scripts. Movies rated 8 or higher kept 50%. It's a correlation of 0.26: a tendency, not a law.

## The asterisk

Now look at the bottom of that chart. _Jaws_ kept 26%. _Apocalypse Now_ kept 10%. _Interstellar_ kept 9%. _Bridesmaids_ kept 6%. Some of the best movies ever made threw out most of their scripts, and they sit right next to _Inspector Gadget_.

I don't think that breaks the pattern. I think it explains it.

Going off the page is a gamble. On average it loses: the rewrite on set, the reshoot, the ending that tested badly and got replaced. That's what the chart is measuring. But once in a while it pays off big, and those are the movies we tell stories about. Everybody has heard that "You're gonna need a bigger boat" was an ad-lib. Nobody tells stories about what got rewritten on _Inspector Gadget_. The wins are famous and the losses are forgotten, so going off script looks a lot better than it is.

When it does work, it's close to a miracle, and you can't count on it happening twice. It takes a director who can hold a sprawling, improvised, constantly changing shoot together and still come out with a movie. Some directors can. Most can't, and the ones who can don't always manage it either.

## What a miracle looks like

Here's the end of _Blade Runner_ (19% kept). The script I have is Hampton Fancher's draft, and in it Roy Batty never gives a speech. He hands Deckard a nail, tells him to stick it in his ear, and Deckard shoots him.

![Blade Runner's ending, script against screen. In Hampton Fancher's draft, Batty says "It's time to die," hands Deckard a nail ("Stick it in your ear and push"), and Deckard shoots him dead. In the film, Batty saves Deckard and says: I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time like tears in the rain. Time to die. Of the draft's lines, only "time to die" is said on screen.](/images/blog/script-vs-screen/chart-blade-runner.svg)

Three words made it: "time to die." Everything else got rewritten, more than once and by more than one person, and the result is one of the most quoted speeches in film. You can't plan for that. You can only make room for it and hope.

The other famous outliers have the same shape when you look at which script I had. The _Apocalypse Now_ file is Coppola's draft from December 1975, before a shoot that became its own legend. The _Interstellar_ file is credited to Jonathan Nolan alone; the finished film credits him and his brother Christopher. These aren't sloppy movies. They're movies that kept being written after the script was done, and happened to have someone who could steer that.

## It isn't just which scripts are online

You might think famous movies just have better scripts floating around online. Studios publish polished final versions of their prestige films, and those match the screen better than an early draft would. If that were the whole story, the pattern would vanish once you compare like with like.

It doesn't. The study has 640 shooting scripts and 131 early drafts, and the climb shows up inside each:

![Line chart: median share of the script said word for word, by IMDb rating band. Shooting scripts: 32% (under 6), 38% (6 to 7), 47% (7 to 8), 51% (8 and up). All films: 30%, 38%, 47%, 50%. Early drafts: 15%, 23%, 35%, 45%. Every line climbs with the rating.](/images/blog/script-vs-screen/chart-drafts.svg)

It also holds for films from before 1990, from 1990 to 2009, and from 2010 on.

## The directors who can wrangle it

If going off script takes a rare director, you'd expect it to show up director by director. It does.

![Dot chart: share of each film's script said word for word, for six directors. Joel Coen, 19 films: median 73%. Billy Wilder, 5 films: median 81%. Christopher Nolan, 11 films: median 67%, from Interstellar at 9% to Dunkirk at 80%. Quentin Tarantino, 9 films: median 48%. Martin Scorsese, 16 films: median 48%. Steven Spielberg, 21 films: median 37%, from The Post at 7% to War Horse at 96%.](/images/blog/script-vs-screen/chart-directors.svg)

The Coens and Billy Wilder wrote what they directed and shot what they wrote. Their dots bunch up. That's the safe way to make a film, and across the whole study, when the writer also directs, 49% of the script survives against 37% when someone else directs.

Spielberg is the opposite. His dots are all over the chart, from _The Post_ at 7% to _War Horse_ at 96%, and he's made great movies at both ends. _Jaws_ kept 26%. He's one of the few directors who can take a shoot that's coming apart and come out with a classic, and even he doesn't do it every time.

One caution: a single film's score depends on which version of the script is online. Judd Apatow's _Knocked Up_ scores 96% and his _Funny People_ scores 11%, and the _Knocked Up_ script online is probably a transcript. Trust the patterns more than any one dot.

## Action movies rewrite the most

You'd guess improv comedies throw out the most dialogue. They don't. Comedy keeps 42%, right at the average. The genres at the bottom are action, war and sport.

![Bar chart: median share of the script said word for word, by genre. Animation 88%, History 52%, Biography 47%, Fantasy 47%, Romance 47%, Drama 46%, Family 44%, Adventure 43%, Comedy 42%, Mystery 42%, Music 40%, Thriller 39%, Crime 39%, Sci-Fi 39%, Horror 35%, Action 33%, Sport 31%, War 31%.](/images/blog/script-vs-screen/chart-genres.svg)

Animation keeps 88%, because the voices are recorded before anyone draws a frame and there's no set to wander off on. My guess for action is that those movies get rebuilt around stunts, locations and reshoots, and the dialogue goes along for the ride.

## My own ratings

I review a lot of movies, and 132 of the films I've rated are in the study. My favorites don't follow the crowd's pattern at all. _The Truman Show_ (five stars) kept 19% of its script. _Jaws_ (five stars) kept 26%. _Alien_ and _Anchorman_ (four and a half) kept 22% and 18%. I like the miracles more than the average IMDb voter does.

## Why I ran this

I didn't set out to study script rewrites. I run [Bechdel Script Test](https://bechdel.joekarlsson.com/), which checks 3,711 movies against the Bechdel test by reading their scripts, and the first thing anyone says about it is that the script isn't the movie. This was my way of checking. The words change a lot, but the verdict mostly doesn't: it holds for about 95% of films, checked against [bechdeltest.com](https://bechdeltest.com/) readers who rated the released movies.

## How I counted

For each film I took the share of the script's dialogue words that turn up in the English subtitles in the same order. A reworded line counts as lost, so this measures exact wording, not plot. To check that subtitles weren't just shortening lines, I listened to 100 lines my tool called cut or reworded, in the films themselves; about nine in ten really were.

The limits: subtitles aren't a transcript, and "not in the script" means not in the draft I had. Scripts online skew popular, American and recent. Ratings are IMDb's. The method and every check are in [METHODS.md](https://github.com/JoeKarlsson/bechdel-test/blob/main/docs/page-vs-screen/METHODS.md).
