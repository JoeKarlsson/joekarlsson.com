---
title: 'I compared 2,112 movie scripts with what was actually said on screen. Bad movies threw theirs out.*'
shareTitle: 'I compared 2,112 movie scripts with what was said on screen'
seoTitle: 'Movie scripts vs. what was said on screen'
date: 2026-11-24
slug: 'script-vs-screen'
description: "I lined up 2,112 screenplays with the subtitles of the finished films. On average, the further a movie strays from its script, the worse it's rated. Jaws, Apocalypse Now and Interstellar strayed anyway."
categories: ['Web Dev']
tags: ['bechdel', 'digital-humanities', 'data-analysis', 'film', 'screenplays']
tldr: 'I lined up 2,112 screenplays, word for word, with the subtitles of the films they became. Films rated under 6 on IMDb kept 30% of their scripts, and films rated 8 or more kept 50%. Some of the best movies ever made threw their scripts out anyway. My read: going off the page is a gamble that usually loses, and the wins need a rare kind of director.'
faq:
  - question: 'How much of a movie script actually ends up in the film?'
    answer: "Less than half, word for word. Across 2,112 screenplays lined up with the English subtitles of the released films, the median film keeps 42% of its script's dialogue exactly as written. The middle half of films keep between 26% and 61%. A reworded line counts as lost, so this measures exact wording, not plot."
  - question: 'Do better movies stick closer to their scripts?'
    answer: 'On average, yes. Films rated under 6 on IMDb kept a median 30% of their scripts word for word, and films rated 8 or higher kept 50% (Spearman correlation 0.26). The pattern holds within shooting scripts and within early drafts. There are famous exceptions: Jaws kept 26%, Apocalypse Now 10% and Interstellar 9%.'
  - question: 'Why do animated movies keep so much of their script?'
    answer: 'Animated films keep a median 88% of their scripts, the most of any genre, because they are edited before they are animated. As Toy Story 3 editor Ken Schretzmann put it, "In animation, you edit first and shoot later." Dialogue is recorded and the story is reworked in storyboard reels before a scene is animated, and changing lines after that is expensive.'
  - question: 'Why do action movies change their scripts so much?'
    answer: 'Action films keep a median 33% of their scripts, among the lowest of any genre. Big action productions often start shooting before the script is finished and write around stunts and locations. Christopher McQuarrie, who directed Mission: Impossible – Fallout, said, "I''m not going to start writing until I know where I''m shooting."'
  - question: 'Was "You''re gonna need a bigger boat" improvised?'
    answer: 'The line is not in the Jaws script draft by Carl Gottlieb and Peter Benchley. Gottlieb has said Roy Scheider ad-libbed it on set, though the origin is disputed. Jaws as a whole kept 26% of its script word for word, and Gottlieb rewrote scenes during the shoot, often the night before they were filmed.'
marginNotes:
  - type: 'term'
    at: 'English subtitles'
    text: "from OpenSubtitles. A word counts as said only when most of a film's subtitle versions (up to nine) have it, so one sloppy subtitler can't make a line look cut."
    term: 'The subtitles'
  - type: 'aside'
    at: 'plenty of exceptions'
    text: "Measured as a Spearman correlation between IMDb rating and the share of the script kept, it's 0.26 on a scale from -1 to 1 (95% interval 0.22 to 0.30): real, but modest. On the 127 films I've reviewed it's 0.21 for IMDb ratings and 0.14 for mine."
  - type: 'quote'
    at: 'the losses are forgotten'
    text: 'Survivorship bias is your tendency to focus on survivors instead of whatever you would call a non-survivor.'
    by: 'David McRaney, You Are Not So Smart, 2013'
    url: 'https://youarenotsosmart.com/2013/05/23/survivorship-bias/'
  - type: 'quote'
    at: 'rewrite a scene the night before'
    text: 'He was on set every day and would literally rewrite a scene the night before they shot it.'
    by: 'Edwin Cannistraci on Carl Gottlieb, Final Draft, 2025'
    url: 'https://www.finaldraft.com/blog/jaws-masterpiece-created-collaboration-deadline'
  - type: 'aside'
    at: 'Who came up with it is disputed'
    text: "Gottlieb has also said the line started as a crew joke about the producers' undersized support boat, and Scheider later said he wasn't sure he was the one who said it first."
    url: 'https://bostonmagazine.com/?p=2009170'
  - type: 'aside'
    at: 'called the scripted speech opera talk'
    text: "Hauer told the story in Channel 4's On the Edge of Blade Runner and in his 2007 autobiography, titled All Those Moments. David Peoples, who rewrote Fancher's draft, confirms in the documentary Dangerous Days that Hauer changed the speech."
    url: 'https://en.wikipedia.org/wiki/Tears_in_rain_monologue'
  - type: 'aside'
    at: 'too much money, too much equipment'
    text: 'Coppola at the 1979 Cannes press conference. The shoot in the Philippines was planned for five months and ran 238 days.'
    url: 'https://en.wikipedia.org/wiki/Apocalypse_Now'
  - type: 'term'
    at: 'shooting scripts'
    text: 'the version a production films from, usually with numbered scenes and colored revision pages. The final edit can still change a lot of it.'
    term: 'Shooting script'
  - type: 'aside'
    at: 'probably a transcript'
    text: 'Studios post "For Your Consideration" scripts during awards season, and fan sites post transcripts typed from the film. Both match the screen almost perfectly, which is why the very top of every list here is suspect.'
  - type: 'aside'
    at: 'the worst movies also come from writer-directors'
    text: 'Stephen Follows looked at 8,096 live-action features released in US cinemas over two decades. Writer-directors averaged 6.33 on IMDb against 6.18, and 58.7 on Metacritic against 50.4.'
    url: 'https://stephenfollows.com/do-writer-directors-make-better-movies-than-directors-who-dont-also-write/'
  - type: 'quote'
    at: 'months on one scene'
    text: 'You can have two animators working for three and half months to animate a scene.'
    by: 'Pierre Perifel, director of The Bad Guys, in TV Tech, 2022'
    url: 'https://www.tvtechnology.com/news/the-making-of-dreamworks-animations-the-bad-guys'
  - type: 'quote'
    at: "until I know where I'm shooting"
    text: "If we sat around and waited for the script to be finished, we'd still be developing this movie."
    by: 'Christopher McQuarrie on Mission: Impossible – Fallout, Collider, 2018'
    url: 'https://collider.com/christopher-mcquarrie-interview-mission-impossible-fallout-top-gun-2/'
  - type: 'see'
    at: 'checks 3,711 movies against the Bechdel test'
    text: 'how the script parser behind the site started, in 2015'
    post: 'bechdel-test-script-parser-works'
---

A movie script is a plan, and nobody follows the plan exactly. Actors improvise, directors rewrite on set, and editors cut whole scenes. I wanted to know how much of the plan survives, so I lined up 2,112 screenplays, word by word, with the English subtitles of the films they became.

The typical movie keeps 42% of its script's dialogue word for word. And the less of its script a movie kept, the worse people tend to rate it.

![Scatter chart of 2,112 films: IMDb rating against the share of the script's dialogue said word for word on screen. The median rises with the rating: 30% for films rated under 6, 38% for 6 to 7, 47% for 7 to 8 and 50% for 8 and up. Big exceptions both ways: Interstellar (rated 8.7, 9% kept) and Bridesmaids (6.8, 6%) near the bottom, The Princess Bride (8.0, 97%) at the top.](/images/blog/script-vs-screen/chart-rating.svg)

Movies rated under 6 on IMDb kept 30% of their scripts. Movies rated 8 or higher kept 50%. Hover over a dot to find a film. It's a real pattern with plenty of exceptions, and I'll get to those.

## Better movies keep more in every kind of draft

You might think famous movies just have better scripts online. Studios publish polished final versions of their prestige films, and those match the screen better than an early draft would. If that were the whole story, the pattern would disappear once you compare like with like.

It doesn't. The study has 640 shooting scripts and 131 early drafts, and better-rated films keep more of their scripts in both. It holds for films from before 1990, from 1990 to 2009, and from 2010 on, too. Here's the share of the script kept word for word, as a median:

| IMDb rating | Films | All scripts | Shooting scripts | Early drafts |
| ----------- | ----: | ----------: | ---------------: | -----------: |
| Under 6     |   249 |         30% |              32% |          15% |
| 6 to 7      |   768 |         38% |              38% |          23% |
| 7 to 8      |   899 |         47% |              47% |          35% |
| 8 and up    |   196 |         50% |              51% |          45% |

## When rewrites sink a movie

The flops at the bottom of the chart left a trail.

_Inspector Gadget_ kept 7% of its script. Rupert Everett, who played the villain, wrote in his memoir, [_Red Carpets and Other Banana Skins_](https://openlibrary.org/works/OL4281847W) (2006), [quoted by Den of Geek](https://www.denofgeek.com/movies/1999-s-inspector-gadget-and-its-hugely-underappreciated-gag/), that "a string of writers had written version after version, each adding to our scripts on a different-colored paper," for "a panel of executives, each with their own theory and agenda." After bad test screenings, the film was cut from 110 minutes to 78.

_Battlefield Earth_ kept 17%, and IMDb voters rate it 2.5 out of 10. The script went through ten revisions before another writer was brought in. When the original writer, J.D. Shapiro, accepted its Razzie for Worst Picture of the Decade, he [thanked that writer](<https://en.wikipedia.org/wiki/Battlefield_Earth_(film)>) for "rewriting my script in a way I never, ever, ever — could have imagined or conceived of myself."

Both movies had the same problem: a lot of people changing the script, and nobody holding the movie together.

## \*The exceptions: classics that went off script

Some of the best movies ever made sit at the bottom of that first chart, right next to _Inspector Gadget_. <a href="/reviews/jaws/" target="_blank" rel="noopener"><em>Jaws</em></a> kept 26% of its script, _Apocalypse Now_ 10% and <a href="/reviews/interstellar/" target="_blank" rel="noopener"><em>Interstellar</em></a> 9%.

_Jaws_ was written while it was shot. The mechanical shark kept breaking down ([American Cinematographer reported](https://theasc.com/articles/on-location-with-jaws) a week's delay during the shoot "while Bruce got a nose job"), and [Carl Gottlieb](https://www.finaldraft.com/blog/jaws-masterpiece-created-collaboration-deadline) would rewrite a scene the night before they shot it. Its most famous line isn't in [the script I have](https://imsdb.com/scripts/Jaws.html). [Gottlieb says](https://bostonmagazine.com/?p=2009170) Roy Scheider ad-libbed "You're gonna need a bigger boat" on set. Who came up with it is disputed, but every version of the story has it coming from the set, not the page.

https://www.youtube.com/watch?v=qCzncv0ISaE

_Blade Runner_ kept 19% of its script. The one in the study is [Hampton Fancher's draft](https://imsdb.com/scripts/Blade-Runner.html), and in it Roy Batty never gives a speech. He pulls a nail out of the wall, hands it to Deckard, and tells him to stick it in his ear. Deckard shoots him a few lines later.

![Blade Runner's ending, script against screen. In Hampton Fancher's draft, Batty says "It's time to die," hands Deckard a nail ("Stick it in your ear and push"), and Deckard shoots him dead. In the film, Batty saves Deckard and says: I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time like tears in the rain. Time to die. Of the draft's lines, only "time to die" is said on screen.](/images/blog/script-vs-screen/chart-blade-runner.svg)

Three words made it: "time to die." David Peoples rewrote Fancher's script and gave Batty a speech. Then [Rutger Hauer](https://en.wikipedia.org/wiki/Tears_in_rain_monologue) called the scripted speech opera talk, cut it down the night before they filmed, and added the line about tears in rain. It's one of the most quoted speeches in film.

https://www.youtube.com/watch?v=jvFYgELj2X0

The other classics near the bottom have stories like these:

- _Apocalypse Now_: the script in the study is a [Coppola draft](https://imsdb.com/scripts/Apocalypse-Now.html) from 1975. The shoot was planned for five months, ran 238 days, and the ending was rewritten on location. Coppola at Cannes: "We had access to too much money, too much equipment, and little by little we went insane."
- _Interstellar_ started as [Jonathan Nolan's script](https://imsdb.com/scripts/Interstellar.html). Paramount, as Christopher Nolan [put it](https://nofilmschool.com/who-wrote-interstellar), "originally developed the film with Steven Spielberg." Christopher directed the film that got made.
- _Taxi Driver_ (27% kept): De Niro improvised "You talkin' to me?" in rehearsal, according to [his own annotated script](https://sites.utexas.edu/ransomcentermagazine/2016/10/13/you-talkin-to-me/) at the Harry Ransom Center.
- <a href="/reviews/the-truman-show/" target="_blank" rel="noopener"><em>The Truman Show</em></a> (19% kept): Andrew Niccol's first draft was a science fiction thriller. He rewrote it twelve times for Peter Weir, who [said](https://en.wikipedia.org/wiki/The_Truman_Show), "where [Niccol] had it depressing, I could make it light."

![Travis Bickle in his army jacket, facing the mirror in his apartment.](/images/blog/script-vs-screen/taxi-driver-mirror.webp)
_Taxi Driver. Frame from Movieclips' official clip._

Going off the page is a gamble, and on average it loses. But once in a while it pays off big, and those are the movies we tell stories about. Nobody tells stories about what got rewritten on _Inspector Gadget_. The wins are famous and the losses are forgotten, so going off script looks a lot better than it is. It's survivorship bias, the same mistake as [studying only the planes that made it home](https://youarenotsosmart.com/2013/05/23/survivorship-bias/).

I'm as guilty of this as anyone. I've reviewed 127 of these films on this site, and my favorites are full of these miracles: _Jaws_, _The Truman Show_, <a href="/reviews/alien/" target="_blank" rel="noopener"><em>Alien</em></a> and _Interstellar_ all kept less than a third of their scripts. My ratings barely follow the pattern at all. The movies I love kept about as much of their scripts as the ones I didn't.

When it does work, it's close to a miracle, and you can't count on it happening twice. It takes a director who can hold a sprawling, improvised, constantly changing shoot together and still come out with a movie.

## The directors who can wrangle it

If going off script takes a rare director, it should show up director by director. It does.

![Dot chart: share of each film's script said word for word, for six directors. Joel Coen, 19 films: median 73%. Billy Wilder, 5 films: median 81%. Christopher Nolan, 11 films: median 67%, from Interstellar at 9% to Dunkirk at 80%. Quentin Tarantino, 9 films: median 48%. Martin Scorsese, 16 films: median 48%. Steven Spielberg, 21 films: median 37%, from The Post at 7% to War Horse at 96%.](/images/blog/script-vs-screen/chart-directors.svg)

The Coens and Billy Wilder wrote what they directed, and their films stay close to the page. That fits the whole study: when the writer also directs, a film keeps 49% of its script, against 37% when someone else directs. [Stephen Follows has looked at writer-directors](https://stephenfollows.com/do-writer-directors-make-better-movies-than-directors-who-dont-also-write/) too. Their films rate a little higher on average, but the worst movies also come from writer-directors. Directing your own script makes a movie more one person's vision, for better or worse.

Spielberg is the other kind, and he shows it isn't a superpower you either have or don't. His films run from 7% of the script kept (_The Post_) to 96% (_War Horse_). Some of the ones that strayed furthest from the page are among his best, like _Saving Private Ryan_ and _Jaws_. Others, like _The BFG_ and _The Lost World: Jurassic Park_, are among his lowest rated. On _Jaws_ he [called the shoot](https://theasc.com/articles/on-location-with-jaws) "a mathematician's dream and a filmmaker's horror," and came out with a classic. He doesn't every time.

Christopher McQuarrie works the same way. On _Mission: Impossible – Rogue Nation_ he told [Film Comment](https://www.filmcomment.com/interview-christopher-mcquarrie/), "I was constantly rewriting the script and trying to find the end of the movie," and it worked. Simon Pegg [described](https://ca.news.yahoo.com/mission-impossible-star-simon-pegg-210000097.html) the later films as "a fly by the seat of your pants way of working." The last one, _The Final Reckoning_, didn't work for me, and it was the same director working the same way.

https://www.youtube.com/watch?v=2DeOnb2DvdY

One caution: a film's score depends on which version of its script is online. Judd Apatow's _Knocked Up_ kept 96% of its script and his _Funny People_ 11%, and the _Knocked Up_ script online is probably a transcript. Trust the patterns more than any one dot.

## Why action rewrites and animation doesn't

You'd guess improvised comedies throw out the most dialogue. They don't. Comedies keep 42% of their scripts, right at the average. Action, war and sport keep the least, and animation keeps by far the most.

![Bar chart: median share of the script said word for word, by genre. Animation 88%, History 52%, Biography 47%, Fantasy 47%, Romance 47%, Drama 46%, Family 44%, Adventure 43%, Comedy 42%, Mystery 42%, Music 40%, Thriller 39%, Crime 39%, Sci-Fi 39%, Horror 35%, Action 33%, Sport 31%, War 31%.](/images/blog/script-vs-screen/chart-genres.svg)

**Animated films keep 88% of their scripts because they're made backwards.** Ken Schretzmann, who edited _Toy Story 3_, [put it this way](https://blog.frame.io/2019/07/15/animation-editing/): "In live-action, you shoot first and edit later. In animation, you edit first and shoot later." The rewriting happens in story reels: [Pete Docter has described](https://www.avclub.com/pete-docter-1798216800) filming the storyboards with temporary dialogue and music, and watching the story change again. Once a scene's real dialogue is recorded, it goes to the animators, and from then on changes are expensive, since two animators can spend months on one scene. Even [Robin Williams's famous improvising](https://www.yahoo.com/entertainment/aladdin-director-remembers-robin-williams-175618298.html) on _Aladdin_ happened in the recording booth, before anything was animated.

![Two pipelines. Live action: script, then the shoot, then the edit, and the dialogue changes during the shoot and the edit. Animation: script, then story reels with temporary voices, where the rewriting happens; then the real voices are recorded; then the scenes are animated, and by then changing a line means animating the scene again.](/images/blog/script-vs-screen/diagram-animation.svg)

**Action films keep 33% because the script often isn't finished when shooting starts.** Christopher McQuarrie, who wrote and directed the recent _Mission: Impossible_ films, [says](https://collider.com/christopher-mcquarrie-interview-mission-impossible-fallout-top-gun-2/) "Screenplays are the afterthought to the decision to make a movie," and on _Fallout_: "I'm not going to start writing until I know where I'm shooting." On _Rogue Nation_, he [says](https://comicbook.com/news/mcquarrie-reveals-how-involved-tom-cruise-was-in-mission-impossi), he wrote a scene during the day and shot it that night. Kevin Feige [has said](https://cinemablend.com/news/2448060/why-reshoots-for-marvel-movies-arent-a-big-deal-according-to-kevin-feige) Marvel shoots additional material on all of its movies after the main shoot. When the stunts and locations come first, the dialogue gets written around them, late.

**Comedies land in the middle because the scripted take still gets shot.** On Judd Apatow's productions, [the rule is](https://www.dga.org/craft/dgaq/issues/0902-summer-2009/apatow-and-friends) to shoot at least one take of a scene as scripted, then keep the cameras rolling for variations, and Adam McKay [says](https://www.pastemagazine.com/comedy/catching-up-with-adam-mckay) he makes sure "to have alts no matter what." The structure stays, and the jokes get swapped. _Bridesmaids_ kept [6% of its script](https://imsdb.com/scripts/Bridesmaids.html), which is what happens when the alternates win. Paul Feig [has said](https://cinemablend.com/new/Exclusive-Interview-Bridesmaids-Director-Paul-Feig-24650.html), "I like when they will just go off."

I couldn't find a good explanation for why war and sport movies sit down at the bottom with action.

## Why I ran this

I didn't set out to study script rewrites. I run [Bechdel Script Test](https://bechdel.joekarlsson.com/), which checks 3,711 movies against the Bechdel test by reading their scripts, and the first thing anyone says about it is that the script isn't the movie. This was my way of checking. The words change a lot, but the verdict mostly doesn't: it holds for about 95% of films, checked against [bechdeltest.com](https://bechdeltest.com/) readers who rated the released movies.

## How I counted

![How each film is scored, on one line from Blade Runner. The script has Pris say "I have some, but I have to find out where they are staying." The subtitles have "I have some, but I have to find them." Lined up word by word, in order, 8 of the script's 13 words are said; a word counts only if most of the film's subtitle versions have it. Blade Runner's whole script scores 19%.](/images/blog/script-vs-screen/diagram-counting.svg)

For each film I took the share of the script's dialogue words that turn up in the English subtitles in the same order. A reworded line counts as lost, so this measures exact wording, not plot. Subtitles shorten speech, so I listened to 100 lines my tool called cut or reworded, in the films themselves; about nine in ten really were.

The limits: subtitles aren't a transcript, and "not in the script" means not in the draft I had. Scripts online skew popular, American and recent. Ratings are IMDb's. The method and every check are in [METHODS.md](https://github.com/JoeKarlsson/bechdel-test/blob/main/docs/page-vs-screen/METHODS.md).

## The films in this post

<details>
<summary>Show all 17 films</summary>

| Film                     | Year | IMDb rating | Script kept word for word | My review                                                                                             |
| ------------------------ | ---: | ----------: | ------------------------: | ----------------------------------------------------------------------------------------------------- |
| Shrek                    | 2001 |         7.9 |                       97% |                                                                                                       |
| The Princess Bride       | 1987 |         8.0 |                       97% |                                                                                                       |
| Up                       | 2009 |         8.3 |                       96% |                                                                                                       |
| The Dark Knight          | 2008 |         9.1 |                       77% |                                                                                                       |
| The Shawshank Redemption | 1994 |         9.3 |                       71% |                                                                                                       |
| Taxi Driver              | 1976 |         8.2 |                       27% |                                                                                                       |
| Jaws                     | 1975 |         8.1 |                       26% | <a href="/reviews/jaws/" target="_blank" rel="noopener">5 stars</a>                                   |
| Alien                    | 1979 |         8.4 |                       22% | <a href="/reviews/alien/" target="_blank" rel="noopener">4.5 stars</a>                                |
| Blade Runner             | 1982 |         8.1 |                       19% |                                                                                                       |
| The Truman Show          | 1998 |         8.2 |                       19% | <a href="/reviews/the-truman-show/" target="_blank" rel="noopener">5 stars</a>                        |
| Anchorman                | 2004 |         7.1 |                       18% | <a href="/reviews/anchorman-the-legend-of-ron-burgundy/" target="_blank" rel="noopener">4.5 stars</a> |
| Battlefield Earth        | 2000 |         2.5 |                       17% |                                                                                                       |
| Step Brothers            | 2008 |         6.9 |                       15% |                                                                                                       |
| Apocalypse Now           | 1979 |         8.4 |                       10% |                                                                                                       |
| Interstellar             | 2014 |         8.7 |                        9% | <a href="/reviews/interstellar/" target="_blank" rel="noopener">4.5 stars</a>                         |
| Inspector Gadget         | 1999 |         4.2 |                        7% |                                                                                                       |
| Bridesmaids              | 2011 |         6.8 |                        6% |                                                                                                       |

</details>

## Sources

<details>
<summary>Show all 13 sources</summary>

- American Cinematographer, ["On Location With Jaws"](https://theasc.com/articles/on-location-with-jaws), March 1975.
- Boston Magazine, [Carl Gottlieb interview](https://bostonmagazine.com/?p=2009170), 2015.
- Final Draft, ["Jaws: a masterpiece created by collaboration and deadline"](https://www.finaldraft.com/blog/jaws-masterpiece-created-collaboration-deadline), 2025.
- Harry Ransom Center, ["You talkin' to me?"](https://sites.utexas.edu/ransomcentermagazine/2016/10/13/you-talkin-to-me/), 2016.
- No Film School, ["Who wrote Interstellar?"](https://nofilmschool.com/who-wrote-interstellar), 2024, quoting The Hollywood Reporter; /Film, ["Interstellar's original ending"](https://www.slashfilm.com/536845/original-interstellar-ending/), 2015.
- Wikipedia, [Apocalypse Now](https://en.wikipedia.org/wiki/Apocalypse_Now), [The Truman Show](https://en.wikipedia.org/wiki/The_Truman_Show), [Battlefield Earth](<https://en.wikipedia.org/wiki/Battlefield_Earth_(film)>) and [Tears in rain monologue](https://en.wikipedia.org/wiki/Tears_in_rain_monologue), and the sources they cite.
- Rupert Everett, [_Red Carpets and Other Banana Skins_](https://openlibrary.org/works/OL4281847W) (Little, Brown, 2006), as quoted in Den of Geek, ["1999's Inspector Gadget"](https://www.denofgeek.com/movies/1999-s-inspector-gadget-and-its-hugely-underappreciated-gag/), 2017.
- Stephen Follows, ["Do writer-directors make better movies?"](https://stephenfollows.com/do-writer-directors-make-better-movies-than-directors-who-dont-also-write/), 2021.
- Frame.io Insider, ["Edit First, Shoot Later"](https://blog.frame.io/2019/07/15/animation-editing/), 2019; A.V. Club, [Pete Docter interview](https://www.avclub.com/pete-docter-1798216800), 2009; TV Tech, ["The making of The Bad Guys"](https://www.tvtechnology.com/news/the-making-of-dreamworks-animations-the-bad-guys), 2022; Variety, [Ron Clements on Robin Williams](https://www.yahoo.com/entertainment/aladdin-director-remembers-robin-williams-175618298.html), 2021.
- Film Comment, [Christopher McQuarrie interview](https://www.filmcomment.com/interview-christopher-mcquarrie/), 2015; Variety, [Simon Pegg on the Mission: Impossible scripts](https://ca.news.yahoo.com/mission-impossible-star-simon-pegg-210000097.html), 2023.
- Collider, [Christopher McQuarrie interview](https://collider.com/christopher-mcquarrie-interview-mission-impossible-fallout-top-gun-2/), 2018; ComicBook.com, [McQuarrie on Rogue Nation](https://comicbook.com/news/mcquarrie-reveals-how-involved-tom-cruise-was-in-mission-impossi), 2017; CinemaBlend, [Kevin Feige on reshoots](https://cinemablend.com/news/2448060/why-reshoots-for-marvel-movies-arent-a-big-deal-according-to-kevin-feige), 2018.
- DGA Quarterly, ["Apatow & Friends"](https://www.dga.org/craft/dgaq/issues/0902-summer-2009/apatow-and-friends), 2009; Paste, [Adam McKay interview](https://www.pastemagazine.com/comedy/catching-up-with-adam-mckay), 2013; CinemaBlend, [Paul Feig interview](https://cinemablend.com/new/Exclusive-Interview-Bridesmaids-Director-Paul-Feig-24650.html), 2011.
- David McRaney, ["Survivorship Bias"](https://youarenotsosmart.com/2013/05/23/survivorship-bias/), 2013.

</details>
