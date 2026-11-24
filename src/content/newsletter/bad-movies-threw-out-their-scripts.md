---
title: 'Bad Movies Threw Out Their Scripts'
date: 2027-01-07T08:00:00Z
slug: 'bad-movies-threw-out-their-scripts'
description: 'I built a tool that checks how much of a script makes it on screen. Movies rated under 6 on IMDb kept 30%, and movies rated 8+ kept 50%.'
recapOf: 'script-vs-screen'
cardPhoto: '/images/newsletter/bad-movies-threw-out-their-scripts/script-meeting.webp'
cardPhotoAlt: 'director Arthur Berthelet and writer Mary MacLane going over a film script together at Essanay Studios in 1918'
heroImage: '/images/newsletter/bad-movies-threw-out-their-scripts/card-8d02af7f.webp'
heroAlt: 'Works on My Machine card for Bad Movies Threw Out Their Scripts, with director Arthur Berthelet and writer Mary MacLane going over a film script together at Essanay Studios in 1918 framed in a pink crayon box'
---

I lined up 2,112 movie scripts, word by word, with the English subtitles of the films they became, to see how much of the plan survives. The typical movie keeps 42% of its script's dialogue word for word. And the less of its script a movie kept, the worse people tend to rate it.

![Scatter chart of 2,112 films: IMDb rating against the share of the script's dialogue said word for word on screen. The median rises with the rating: 30% for films rated under 6, 38% for 6 to 7, 47% for 7 to 8 and 50% for 8 and up. Big exceptions both ways: Interstellar (rated 8.7, 9% kept) and Bridesmaids (6.8, 6%) near the bottom, The Princess Bride (8.0, 97%) at the top.](/images/blog/script-vs-screen/chart-rating.svg)

Going off script is a gamble, and most of the time it loses. The famous wins, like _Jaws_ and _Blade Runner_, are why it looks like a better bet than it is.

A film that kept under 20% of its script is about seven times as likely to be a flop (under 6 on IMDb) as one that kept 80% or more, and about a third as likely to be a classic (8 or higher). It's a real pattern with plenty of exceptions.

I run [Bechdel Script Test](https://bechdel.joekarlsson.com/), which scores 3,711 movies against the Bechdel test by parsing their scripts, and the first thing anyone says about it is that the script isn't the movie. This was my way of checking: [a tool](https://github.com/JoeKarlsson/bechdel-test) that lines up each script with the released film's subtitles, the way `diff` lines up two versions of a file. And I accidentally made some discoveries about how films get made!

[The full post](/blog/script-vs-screen/) has the interactive chart, two clips and the full method.

## Why films leave the page

How much of the script survives depends a lot on what kind of movie it is.

**Animated films keep 88% of their scripts because they're made backwards.** Ken Schretzmann, who edited _Toy Story 3_, [put it this way](https://blog.frame.io/2019/07/15/animation-editing/): "In live-action, you shoot first and edit later. In animation, you edit first and shoot later." Once a scene's dialogue is recorded, it goes to the animators, and from then on changes are expensive.

![Two pipelines. Live action: script, then the shoot, then the edit, and the dialogue changes during the shoot and the edit. Animation: script, then story reels with temporary voices, where the rewriting happens; then the real voices are recorded; then the scenes are animated, and by then changing a line means animating the scene again.](/images/blog/script-vs-screen/diagram-animation.svg)

**Action films keep 33% because the script often isn't finished when shooting starts.** Christopher McQuarrie, who directed _Mission: Impossible - Fallout_, [said](https://collider.com/christopher-mcquarrie-interview-mission-impossible-fallout-top-gun-2/): "I'm not going to start writing until I know where I'm shooting."

**Comedies land in the middle, at 42%, because they keep the scripted take as insurance.** On Judd Apatow's productions, the rule is to shoot at least one take of a scene as scripted. The structure stays, and the jokes get swapped. _Bridesmaids_ kept 6% of its script, which is what happens when the alternates win.

![Bar chart: median share of the script said word for word, by genre. Animation 88%, History 52%, Biography 47%, Fantasy 47%, Romance 47%, Drama 46%, Family 44%, Adventure 43%, Comedy 42%, Mystery 42%, Music 40%, Thriller 39%, Crime 39%, Sci-Fi 39%, Horror 35%, Action 33%, Sport 31%, War 31%.](/images/blog/script-vs-screen/chart-genres.svg)

## When rewrites sink a movie

The flops at the bottom of the rating chart left a trail.

_Inspector Gadget_ kept 7% of its script. Rupert Everett, who played the villain, wrote in his memoir, [as quoted by Den of Geek](https://www.denofgeek.com/movies/1999-s-inspector-gadget-and-its-hugely-underappreciated-gag/), that "a string of writers had written version after version, each adding to our scripts on a different-colored paper," for "a panel of executives, each with their own theory and agenda." After bad test screenings, the film was cut from 110 minutes to 78.

_Battlefield Earth_ kept 17%, and IMDb voters rate it 2.5 out of 10. The script went through ten revisions before another writer was brought in. When the original writer, J.D. Shapiro, accepted its Razzie for Worst Picture of the Decade, he [thanked that writer](<https://en.wikipedia.org/wiki/Battlefield_Earth_(film)>) for rewriting his script in a way he "never, ever, ever" could have imagined.

## The exceptions: classics that went off script

The wins are famous and the losses are forgotten. Nobody tells stories about what got rewritten on _Inspector Gadget_. It's survivorship bias, the same mistake as studying only the planes that made it home. And some of the best movies ever made do sit at the bottom of that first chart. _Apocalypse Now_ kept 10% of its script, _Taxi Driver_ 27% and _The Truman Show_ 19%.

![Travis Bickle in his army jacket, facing the mirror in his apartment, with the subtitle "You talking to me?"](/images/blog/script-vs-screen/taxi-driver-mirror.webp)

_Taxi Driver. Frame from Movieclips' official clip._

_Blade Runner_ is the clearest case. It kept 19% of its script.

![Blade Runner's ending, script against screen. In Hampton Fancher's draft, Batty says "It's time to die," hands Deckard a nail ("Stick it in your ear and push"), and Deckard shoots him dead. In the film, Batty saves Deckard and says: I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time like tears in the rain. Time to die. Of the draft's lines, only "time to die" is said on screen.](/images/blog/script-vs-screen/chart-blade-runner.svg)

Three words made it: "time to die." David Peoples rewrote Fancher's script and gave Batty a speech. Then Rutger Hauer called the scripted speech opera talk, cut it down the night before they filmed, and added the line about tears in rain.

I've [reviewed](/reviews/) 127 of these films on my site, and my favorites are full of these exceptions: _Jaws_, _The Truman Show_, _Alien_ and _Interstellar_ all kept less than a third of their scripts, and I gave _Jaws_ and _The Truman Show_ five stars.

## The directors who can wrangle it

When going off script works, I suspect it takes a director who can hold a sprawling, improvised, constantly changing shoot together and still come out with a movie. Even they don't manage it every time.

_Jaws_ was written while it was shot. The mechanical shark kept breaking down, and Carl Gottlieb would rewrite a scene the night before they shot it. Its most famous line isn't in the script I have. Gottlieb says Roy Scheider ad-libbed it on set. Who came up with it is disputed, but every version of the story has it coming from the set, not the page.

![Chief Brody backing away from the stern of the Orca, cigarette in his mouth, with the subtitle "You're gonna need a bigger boat."](/images/blog/script-vs-screen/jaws-bigger-boat.webp)

_Jaws. Frame from Universal Pictures' official clip._

On _Jaws_, Spielberg [called the shoot](https://theasc.com/article/on-location-with-jaws/) "a mathematician's dream and a filmmaker's horror," and came out with a classic. He doesn't every time. His films run from 7% of the script kept (_The Post_) to 96% (_War Horse_).

## Where I land

What subtitles can't tell me is which way it runs: whether rewriting sinks films, or troubled productions both rewrite and turn out badly. Either way, when you hear that a movie was "found on set" or rewritten through the shoot, the odds are against it.

## How I built the script diff

Bechdel Script Test already parsed the scripts, so the new parts were the screen side and the diff.

### Getting the subtitles

The subtitles come from the English part of the OpenSubtitles corpus, filed by IMDb id. The archive is 36 GB. The tool reads only the files it needs, with HTTP range requests. A film has a median of 17 English subtitle uploads. The tool takes up to nine, and a script word counts as said only when more than half of them have it, so one sloppy subtitler can't make a line look cut.

### Diffing the script against the screen

![How each film is scored, on one line from Blade Runner. The script has Pris say "I have some, but I have to find out where they are staying." The subtitles, up to nine versions per film, have "I have some, but I have to find them." Lined up word by word in order, 8 of the script's 13 words are said; a word counts only if most subtitle versions have it. Blade Runner's whole script scores 19%.](/images/blog/script-vs-screen/diagram-counting.svg)

The diff normalizes both sides first (gonna becomes going to, numbers become words, ums are dropped). Then it anchors on word 4-grams that appear exactly once on each side, like patience diff, recurses into the gaps with shorter n-grams, and runs an exact longest common subsequence on small gaps. A reworded line counts as lost, so this measures exact wording, not plot.

### Checking it

I checked it two ways. First, five lines known to be improvised or rewritten, like "You're gonna need a bigger boat" and "tears in rain," have to come out as not in the script. When a famous line matched anyway (The Shining's script had "Here's Johnny!"), the script was a post-production transcript of the finished film, which is how I spotted transcripts.

Second, I listened to 100 lines the tool called cut or reworded, in the films themselves. About nine in ten really were; the rest were subtitles shortening speech.

### Limits

The correlation is real but modest (Spearman 0.26). Scripts online skew popular, American and recent, and ratings are IMDb's as of November 2026, so trust the patterns more than any one dot. The method and every check are in [METHODS.md](https://github.com/JoeKarlsson/bechdel-test/blob/main/docs/page-vs-screen/METHODS.md).

### Did the Bechdel scores hold up?

Mostly. The words change a lot, but the verdict doesn't. It holds for about 95% of the 1,699 films checked against [bechdeltest.com](https://bechdeltest.com/) readers who rated the released movies.

<a class="button" href="/blog/script-vs-screen/">Read the full post</a>
