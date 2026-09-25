---
title: 'I Made Adult Swim Bumpers for My Plex Server'
date: 2026-09-25
slug: 'adult-swim-bumpers-plex-pre-rolls'
description: 'I grew up on Toonami and Adult Swim, so I built a little CLI that makes Adult Swim-style bumpers and now every movie on my Plex server opens with one.'
categories: ['Homelab', 'Film']
tags: ['Plex', 'pre-roll', 'NeXroll', 'ffmpeg', 'Python']
heroImage: '/images/blog/adult-swim-bumpers-plex-pre-rolls/hero.webp'
heroVideo: '/images/blog/adult-swim-bumpers-plex-pre-rolls/hero.mp4'
heroAlt: 'A jellyfish drifting in dark blue water while white text cards read "no ads." then "no algorithm." then "no idea what you should watch." and finally "[joeflix]"'
tldr: 'I grew up on Toonami and Adult Swim, and the bumpers stuck with me more than most of the shows. So I built a small CLI that turns a few lines of YAML into Adult Swim-style bumpers, loaded 121 of them into NeXroll, and now every movie on my Plex server Joeflix opens with one.'
---

I grew up on Toonami after school, and later on staying up way too late for Adult Swim, which was the first TV I ever watched that seemed like weirdos made it for other weirdos. I loved it. The bumpers stuck with me longer than most of the shows did.

You know the ones. Black screen, plain white text, one card at a time. Sometimes a joke, sometimes weirdly sincere, and then `[adult swim]` and you're back in the show.

Now I'm an adult (allegedly) and I run a Plex server called **Joeflix** for my friends and family. So I built the thing younger me would have lost it over: a little CLI that makes Adult Swim-style bumpers. Every movie on Joeflix now opens with a personal message from me to my friends. The jellyfish at the top of this post is one of them.

## Why does a Plex server need bumpers?

Plex is great at playing movies and has zero personality. You hit play and it could be anyone's server.

But Plex will play a pre-roll video before every movie, and that's your one chance for the server to say something. I wanted it to sound like me.

## Most of them are about Minnesota or my hard drives

I have 121 of them in rotation right now. Here are a couple that I made.

![Close-up of a bubbling hotdish while white text cards read "a hotdish" then "is just a casserole" then "made with more intention." and finally "[joeflix]"](/images/blog/adult-swim-bumpers-plex-pre-rolls/hotdish.gif)

![An aerial view of downtown St. Paul while white text cards read "St. Paul" then "has always let Minneapolis" then "have the attention." then "we don't mind." and finally "[joeflix]"](/images/blog/adult-swim-bumpers-plex-pre-rolls/st-paul.gif)

My friends and family know exactly how much I spend on hard drives. Now the server makes fun of me for it too.

![A lake covered in fallen autumn leaves while white text cards read "joe bought a bigger hard drive." then "for you." then "he didn't tell you." and finally "[joeflix]"](/images/blog/adult-swim-bumpers-plex-pre-rolls/bigger-hard-drive.gif)

![A plain black screen with white text cards reading "somewhere, someone is paying $22 a month." then "not you." then "enjoy." and finally "[joeflix]"](/images/blog/adult-swim-bumpers-plex-pre-rolls/twenty-two-dollars.gif)

![A plain black screen with white text cards reading "dear joeflix, why is it buffering?" then "it isn't. i just checked." and finally "[joeflix]"](/images/blog/adult-swim-bumpers-plex-pre-rolls/dear-joeflix-buffering.gif)

And some of them are just dumb. I'm fine with that. Adult Swim was dumb sometimes too.

![A plain black screen with white text cards reading "This server has seen things." then "Mostly Nicolas Cage." then "And regret." and finally "[joeflix]"](/images/blog/adult-swim-bumpers-plex-pre-rolls/server-has-seen-things.gif)

## It's just YAML and ffmpeg

The tool is [adult-swim-bumper](https://github.com/JoeKarlsson/adult-swim-bumper), a small Python CLI on top of ffmpeg. Each bumper is a few lines of YAML with the cards, a background clip, and a music track:

```yaml
- name: hotdish
  cards:
    - 'a hotdish'
    - 'is just a casserole'
    - 'made with more intention.'
  video: videos/hotdish.mp4
  music: music/ambient-01.mp3
```

Run `bumper render` and you get a ten-second MP4 with the cards fading through one at a time, a little music underneath, and your server name in brackets at the end.

I didn't build the Plex side, and you shouldn't either. [NeXroll](https://github.com/JFLXCLOUD/NeXroll) is a self-hosted pre-roll manager that already does it well. I dumped the rendered bumpers into an "Adult Swim" category, and NeXroll shuffles through them before every movie, next to the seasonal ones it plays around Christmas and Halloween.

One catch: Plex only plays pre-rolls before movies, so TV episodes still start cold. Half of Joeflix has no personality yet.

## Nobody compliments my transcoding settings

I get compliments on the bumpers all the time from people who join the server. Nobody has ever said a word about my transcoding settings. But a jellyfish telling them there's no algorithm? That gets brought up.

If you run a server for your own people, [steal the code](https://github.com/JoeKarlsson/adult-swim-bumper). Set your server name and write some bad jokes. Building the rest of the setup? Start with my [homelab starter guide](/blog/how-to-get-started-building-a-homelab-server-in-2024/). [Two years later](/blog/homelab-two-years-later/) is what it turned into.

sit back. breathe. it's just a movie.

`[joeflix]`
