---
title: 'I compared 2,112 movie scripts with what was actually said on screen. Bad movies threw theirs out.*'
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
  - type: 'quote'
    at: 'the losses are forgotten'
    text: 'Survivorship bias is your tendency to focus on survivors instead of whatever you would call a non-survivor.'
    by: 'David McRaney, You Are Not So Smart, 2013'
    url: 'https://youarenotsosmart.com/2013/05/23/survivorship-bias/'
  - type: 'see'
    at: 'my favorites are full of miracles'
    text: 'my review of The Truman Show, five stars and 19% of its script'
    post: 'reviews/the-truman-show'
  - type: 'see'
    at: 'I remember the ones that pulled it off'
    text: 'my review of Jaws, five stars and 26% of its script'
    post: 'reviews/jaws'
  - type: 'quote'
    at: 'rewrite a scene the night before'
    text: 'He was on set every day and would literally rewrite a scene the night before they shot it.'
    by: 'Edwin Cannistraci on Carl Gottlieb, Final Draft, 2025'
    url: 'https://www.finaldraft.com/blog/jaws-masterpiece-created-collaboration-deadline'
  - type: 'aside'
    at: 'Who came up with it is disputed'
    text: 'Gottlieb has also said the line started as a crew joke about the producers'' undersized support boat, and Scheider later said he wasn''t sure he was the one who said it first.'
    url: 'https://bostonmagazine.com/?p=2009170'
  - type: 'aside'
    at: 'called the scripted speech opera talk'
    text: 'Hauer told the story in Channel 4''s On the Edge of Blade Runner and in his 2007 autobiography, titled All Those Moments. David Peoples, who rewrote Fancher''s draft, confirms in the documentary Dangerous Days that Hauer changed the speech.'
    url: 'https://en.wikipedia.org/wiki/Tears_in_rain_monologue'
  - type: 'see'
    at: 'originally developed the film with Steven Spielberg'
    text: 'my review of Interstellar'
    post: 'reviews/interstellar'
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
    at: 'animate a scene'
    text: 'You can have two animators working for three and half months to animate a scene.'
    by: 'Pierre Perifel, director of The Bad Guys, in TV Tech, 2022'
    url: 'https://www.tvtechnology.com/news/the-making-of-dreamworks-animations-the-bad-guys'
  - type: 'quote'
    at: 'until I know where I''m shooting'
    text: 'If we sat around and waited for the script to be finished, we''d still be developing this movie.'
    by: 'Christopher McQuarrie on Mission: Impossible – Fallout, Collider, 2018'
    url: 'https://collider.com/christopher-mcquarrie-interview-mission-impossible-fallout-top-gun-2/'
  - type: 'see'
    at: 'checks 3,711 movies against the Bechdel test'
    text: 'how the script parser behind the site started, in 2015'
    post: 'bechdel-test-script-parser-works'
---

A movie script is a plan, and nobody follows the plan exactly. Actors improvise, directors rewrite on set, and editors cut whole scenes. I wanted to know how much of the plan survives, so I lined up 2,112 screenplays, word by word, with the English subtitles of the films they became.

The typical movie keeps 42% of its script word for word. And the less a movie kept, the worse people tend to think it is.

![Scatter chart of 2,112 films: IMDb rating against the share of the script's dialogue said word for word on screen. The median rises with the rating: 30% for films rated under 6, 38% for 6 to 7, 47% for 7 to 8 and 50% for 8 and up. Big exceptions both ways: Interstellar (rated 8.7, 9% kept) and Bridesmaids (6.8, 6%) near the bottom, The Princess Bride (8.0, 97%) at the top. Hover over a dot to see the film.](/images/blog/script-vs-screen/chart-rating.svg)

Movies rated under 6 on IMDb kept 30% of their scripts. Movies rated 8 or higher kept 50%. It's a correlation of 0.26, a real tendency with plenty of exceptions. Hover over any dot to find a film.

## \*So did Jaws

That's the asterisk in the title. Look at the bottom of that chart. _Jaws_ kept 26% of its script. _Apocalypse Now_ kept 10%. _Interstellar_ kept 9%. Some of the best movies ever made threw out most of their scripts, and they sit right next to _Inspector Gadget_. So does _Bridesmaids_ at 6%, which isn't a masterpiece but is a lot better than _Inspector Gadget_.

I don't think that breaks the pattern. I think it explains it.

_Jaws_ was written while it was shot. The mechanical shark kept breaking down (during the shoot, American Cinematographer reported a week's delay "while Bruce got a nose job"), and Carl Gottlieb would rewrite a scene the night before they shot it. Its most famous line isn't in [the script I have](https://imsdb.com/scripts/Jaws.html). Gottlieb says Roy Scheider ad-libbed "You're gonna need a bigger boat" on set. Who came up with it is disputed, but every version of the story has it coming from the set, not the page.

https://www.youtube.com/watch?v=qCzncv0ISaE

Going off the page is a gamble. On average it loses: the rewrite on set, the reshoot, the ending that tested badly and got replaced. That's what the chart is measuring. But once in a while it pays off big, and those are the movies we tell stories about. Nobody tells stories about what got rewritten on _Inspector Gadget_. The wins are famous and the losses are forgotten, so going off script looks a lot better than it is. It's survivorship bias, the same mistake as studying only the planes that made it home.

I'm as guilty of this as anyone. I've reviewed 127 of these films on this site, and my favorites are full of miracles. Nine of the 32 I gave four and a half stars or more kept less than 30% of their scripts, including _Jaws_, _The Truman Show_, _Alien_ and _Interstellar_. Across those 127 films, the link between rating and how much of the script survived is 0.21 for IMDb voters and 0.14 for me. My favorites keep about as much of their scripts as the movies I liked less, 45% against 47%. I don't remember the average movie that went off script. I remember the ones that pulled it off.

When it does work, it's close to a miracle, and you can't count on it happening twice. It takes a director who can hold a sprawling, improvised, constantly changing shoot together and still come out with a movie. Some directors can. Most can't, and the ones who can don't always manage it either.

## What a miracle looks like

Here's the end of _Blade Runner_ (19% kept). The script in the study is [Hampton Fancher's draft](https://imsdb.com/scripts/Blade-Runner.html), and in it Roy Batty never gives a speech. He pulls a nail out of the wall, hands it to Deckard, and tells him what to do with it.

Deckard shoots him a few lines later. Here's the same scene, script against screen:

![Blade Runner's ending, script against screen. In Hampton Fancher's draft, Batty says "It's time to die," hands Deckard a nail ("Stick it in your ear and push"), and Deckard shoots him dead. In the film, Batty saves Deckard and says: I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time like tears in the rain. Time to die. Of the draft's lines, only "time to die" is said on screen.](/images/blog/script-vs-screen/chart-blade-runner.svg)

Three words made it: "time to die." David Peoples rewrote Fancher's script and gave Batty a speech. Then Rutger Hauer called the scripted speech opera talk, cut it down the night before they filmed, and added the line about tears in rain. The result is one of the most quoted speeches in film.

https://www.youtube.com/watch?v=jvFYgELj2X0

You can't plan for that. You can only make room for it and hope.

The other famous outliers have the same shape when you look at which script I had.

**_Apocalypse Now_ (10%).** The [script in the study](https://imsdb.com/scripts/Apocalypse-Now.html) is Coppola's draft from December 1975, before a shoot planned for five months ran 238 days. Brando showed up overweight, and Coppola has said he had no ending because Brando couldn't play the scenes as written, so they rewrote it there. At Cannes in 1979 Coppola said, "We had access to too much money, too much equipment, and little by little we went insane." The making of it became a film of its own, the documentary _Hearts of Darkness_.

![The title page of the Apocalypse Now draft: A P O C A L Y P S E N O W. Original screenplay by John Milius. Inspired by Joseph Conrad's "HEART OF DARKNESS". This draft by Francis Ford Coppola. December 3, 1975.](/images/blog/script-vs-screen/apocalypse-now-title-page.webp 'margin: The title page of the Apocalypse Now script in the study.')

![Willard's head rising out of a dark, misty river at night, his face painted in camouflage.](/images/blog/script-vs-screen/apocalypse-now-river.webp)
_The ending they worked out on location: Willard rises from the river on his way to Kurtz. Frame from Movieclips' official clip._

**_Interstellar_ (9%, and four and a half stars from me).** The [script in the study](https://imsdb.com/scripts/Interstellar.html) is Jonathan Nolan's. Christopher Nolan has said Paramount "originally developed the film with Steven Spielberg" and "hired my brother to come up with a story and a script." The finished film credits both brothers, and Jonathan has said his original ending was "much more straightforward."

**_Taxi Driver_ (27%).** De Niro's own copy of [Paul Schrader's script](https://imsdb.com/scripts/Taxi-Driver.html), now at the Harry Ransom Center, has his handwritten note "Mirror thing here?" The archive says the note confirms he improvised the "You talkin' to me?" bit in rehearsal.

![Travis Bickle in his army jacket, facing the mirror in his apartment.](/images/blog/script-vs-screen/taxi-driver-mirror.webp)
_“You talkin’ to me?”, the bit De Niro worked out in rehearsal. Frame from Movieclips' official clip._

**_The Truman Show_ (19%).** Andrew Niccol's first draft was a science fiction thriller set in New York City. Niccol rewrote it twelve times for Peter Weir, who said, "where [Niccol] had it depressing, I could make it light." The film ends with Truman taking a bow and walking out of the dome. The [script in the study](https://imsdb.com/scripts/Truman-Show,-The.html) kept 19% of its words on the way there.

![Truman standing in the open door in the painted sky wall, arms spread, taking his bow.](/images/blog/script-vs-screen/truman-show-door.webp)
_Weir's lighter ending: Truman takes his bow at the door in the sky. Frame from Movieclips' official clip._

These aren't sloppy movies. They kept being written after the script was done, and each had someone who could steer that.

## And what a loss looks like

The flops that lost their scripts don't get documentaries, but some left a trail.

_Inspector Gadget_ kept 7%. Rupert Everett, who played the villain, wrote in his memoir that "a string of writers had written version after version, each adding to our scripts on a different-colored paper," for "a panel of executives, each with their own theory and agenda." After the first test screenings went badly, the film was cut from 110 minutes to 78.

_Battlefield Earth_ (rated 2.5, 17% kept) went through ten revisions before another writer was brought in. When the original writer, J.D. Shapiro, accepted its Razzie for Worst Picture of the Decade, he thanked that writer for "rewriting my script in a way I never, ever, ever — could have imagined or conceived of myself."

The difference between those and _Jaws_ isn't that _Jaws_ stuck to the plan. It didn't. It's who was making the changes and whether they could hold the movie together while they did.

## It isn't just which scripts are online

You might think famous movies just have better scripts floating around online. Studios publish polished final versions of their prestige films, and those match the screen better than an early draft would. If that were the whole story, the pattern would vanish once you compare like with like.

It doesn't. The study has 640 shooting scripts and 131 early drafts, and the climb shows up inside each:

![Line chart: median share of the script said word for word, by IMDb rating band. Shooting scripts: 32% (under 6), 38% (6 to 7), 47% (7 to 8), 51% (8 and up). All films: 30%, 38%, 47%, 50%. Early drafts: 15%, 23%, 35%, 45%. Every line climbs with the rating.](/images/blog/script-vs-screen/chart-drafts.svg)

It also holds for films from before 1990, from 1990 to 2009, and from 2010 on.

## The directors who can wrangle it

If going off script takes a rare director, you'd expect it to show up director by director. It does. Hover over a dot to see the film.

![Dot chart: share of each film's script said word for word, for six directors. Joel Coen, 19 films: median 73%. Billy Wilder, 5 films: median 81%. Christopher Nolan, 11 films: median 67%, from Interstellar at 9% to Dunkirk at 80%. Quentin Tarantino, 9 films: median 48%. Martin Scorsese, 16 films: median 48%. Steven Spielberg, 21 films: median 37%, from The Post at 7% to War Horse at 96%.](/images/blog/script-vs-screen/chart-directors.svg)

The Coens and Billy Wilder wrote what they directed and shot what they wrote, and their dots bunch up. Across the whole study, when the writer also directs, 49% of the script survives, against 37% when someone else directs. That lines up with the best data I could find on writer-directors: Stephen Follows found their films rate a bit higher on average, but also that the worst movies also come from writer-directors. Directing your own script makes a movie more of one person's vision, for better or worse.

Spielberg is the opposite case. His dots are all over the chart, from _The Post_ at 7% to _War Horse_ at 96%, and he's made great movies at both ends. On _Jaws_ he called the shoot "a mathematician's dream and a filmmaker's horror," and came out with a classic anyway.

https://www.youtube.com/watch?v=2DeOnb2DvdY

One caution: a single film's score depends on which version of the script is online. Judd Apatow's _Knocked Up_ scores 96% and his _Funny People_ scores 11%, and the _Knocked Up_ script online is probably a transcript. Trust the patterns more than any one dot.

## Why action rewrites and animation doesn't

You'd guess improv comedies throw out the most dialogue. They don't. Comedy keeps 42%, right at the average. The genres at the bottom are action, war and sport, and animation is way out at the top.

![Bar chart: median share of the script said word for word, by genre. Animation 88%, History 52%, Biography 47%, Fantasy 47%, Romance 47%, Drama 46%, Family 44%, Adventure 43%, Comedy 42%, Mystery 42%, Music 40%, Thriller 39%, Crime 39%, Sci-Fi 39%, Horror 35%, Action 33%, Sport 31%, War 31%.](/images/blog/script-vs-screen/chart-genres.svg)

**Animation keeps 88% because it's made backwards.** Ken Schretzmann, who edited _Toy Story 3_, put it this way: "In live-action, you shoot first and edit later. In animation, you edit first and shoot later." The rewriting still happens, and a lot of it, but it happens in story reels: Pete Docter has described filming the storyboards, putting in temporary dialogue and music, and watching it change again. Once a scene has its real dialogue recorded, it goes to the animators, and from then on every change is expensive, because it can take two animators months to animate a scene. By the time anyone posts a script, the lines have been locked for a long time. Even Robin Williams's famous improvising on _Aladdin_ happened in the recording booth, before a frame was animated.

**Action keeps 33% because the script often isn't finished when shooting starts.** Christopher McQuarrie, who wrote and directed the recent _Mission: Impossible_ films, says "Screenplays are the afterthought to the decision to make a movie," and on _Fallout_: "I'm not going to start writing until I know where I'm shooting." On _Rogue Nation_, he says he wrote a scene during the day and shot it that night. Kevin Feige has said Marvel shoots additional material on all of its movies after the main shoot. When the stunts and locations come first, the dialogue is written around them, late, and keeps changing.

**Comedy lands at the average because the scripted take still gets shot.** On Judd Apatow's productions, the rule is to shoot at least one take of a scene as scripted and then keep the cameras rolling for variations, and Adam McKay says he makes sure "to have alts no matter what." The structure stays, and the jokes get swapped out. _Bridesmaids_ ([6%](https://imsdb.com/scripts/Bridesmaids.html)) is what happens when the alternates win: Paul Feig has said, "I like when they will just go off."

I couldn't find a good explanation for why war and sport movies sit down at the bottom with action.

## Why I ran this

I didn't set out to study script rewrites. I run [Bechdel Script Test](https://bechdel.joekarlsson.com/), which checks 3,711 movies against the Bechdel test by reading their scripts, and the first thing anyone says about it is that the script isn't the movie. This was my way of checking. The words change a lot, but the verdict mostly doesn't: it holds for about 95% of films, checked against [bechdeltest.com](https://bechdeltest.com/) readers who rated the released movies.

## How I counted

For each film I took the share of the script's dialogue words that turn up in the English subtitles in the same order. A reworded line counts as lost, so this measures exact wording, not plot. To check that subtitles weren't just shortening lines, I listened to 100 lines my tool called cut or reworded, in the films themselves; about nine in ten really were.

The limits: subtitles aren't a transcript, and "not in the script" means not in the draft I had. Scripts online skew popular, American and recent. Ratings are IMDb's. The method and every check are in [METHODS.md](https://github.com/JoeKarlsson/bechdel-test/blob/main/docs/page-vs-screen/METHODS.md).

## Sources

- American Cinematographer, ["On Location With Jaws"](https://theasc.com/articles/on-location-with-jaws), March 1975.
- Boston Magazine, [Carl Gottlieb interview](https://bostonmagazine.com/?p=2009170), 2015.
- Final Draft, ["Jaws: a masterpiece created by collaboration and deadline"](https://www.finaldraft.com/blog/jaws-masterpiece-created-collaboration-deadline), 2025.
- Harry Ransom Center, ["You talkin' to me?"](https://sites.utexas.edu/ransomcentermagazine/2016/10/13/you-talkin-to-me/), 2016.
- No Film School, ["Who wrote Interstellar?"](https://nofilmschool.com/who-wrote-interstellar), 2024, quoting The Hollywood Reporter; /Film, ["Interstellar's original ending"](https://www.slashfilm.com/536845/original-interstellar-ending/), 2015.
- Wikipedia, [Apocalypse Now](https://en.wikipedia.org/wiki/Apocalypse_Now), [The Truman Show](https://en.wikipedia.org/wiki/The_Truman_Show), [Battlefield Earth](https://en.wikipedia.org/wiki/Battlefield_Earth_(film)) and [Tears in rain monologue](https://en.wikipedia.org/wiki/Tears_in_rain_monologue), and the sources they cite.
- Den of Geek, ["1999's Inspector Gadget"](https://www.denofgeek.com/movies/1999-s-inspector-gadget-and-its-hugely-underappreciated-gag/), 2017, quoting Rupert Everett's memoir.
- Stephen Follows, ["Do writer-directors make better movies?"](https://stephenfollows.com/do-writer-directors-make-better-movies-than-directors-who-dont-also-write/), 2021.
- Frame.io Insider, ["Edit First, Shoot Later"](https://blog.frame.io/2019/07/15/animation-editing/), 2019; A.V. Club, [Pete Docter interview](https://www.avclub.com/pete-docter-1798216800), 2009; TV Tech, ["The making of The Bad Guys"](https://www.tvtechnology.com/news/the-making-of-dreamworks-animations-the-bad-guys), 2022; Variety, [Ron Clements on Robin Williams](https://www.yahoo.com/entertainment/aladdin-director-remembers-robin-williams-175618298.html), 2021.
- Collider, [Christopher McQuarrie interview](https://collider.com/christopher-mcquarrie-interview-mission-impossible-fallout-top-gun-2/), 2018; ComicBook.com, [McQuarrie on Rogue Nation](https://comicbook.com/news/mcquarrie-reveals-how-involved-tom-cruise-was-in-mission-impossi), 2017; CinemaBlend, [Kevin Feige on reshoots](https://cinemablend.com/news/2448060/why-reshoots-for-marvel-movies-arent-a-big-deal-according-to-kevin-feige), 2018.
- DGA Quarterly, ["Apatow & Friends"](https://www.dga.org/craft/dgaq/issues/0902-summer-2009/apatow-and-friends), 2009; Paste, [Adam McKay interview](https://www.pastemagazine.com/comedy/catching-up-with-adam-mckay), 2013; CinemaBlend, [Paul Feig interview](https://cinemablend.com/new/Exclusive-Interview-Bridesmaids-Director-Paul-Feig-24650.html), 2011.
- David McRaney, ["Survivorship Bias"](https://youarenotsosmart.com/2013/05/23/survivorship-bias/), 2013.
