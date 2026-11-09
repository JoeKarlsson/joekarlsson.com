---
title: 'My Whole Recording Setup Is One Desk on Wheels'
date: 2026-11-19T08:00:00Z
slug: 'my-recording-setup-is-one-desk-on-wheels'
description: 'One cable to plug in, one sentence to set up the room, and the lighting I got wrong twice.'
recapOf: 'recording-setup-tour'
cardPhoto: '/images/blog/recording-setup-tour/nook-wide.webp'
cardPhotoAlt: "Joe's recording nook: the rolling desk with its green cutting mat and mic arm, an orange chair, an LED panel on a stand, and a 3D printer glowing on the shelf"
heroImage: '/images/newsletter/my-recording-setup-is-one-desk-on-wheels/card.webp'
heroAlt: "Works on My Machine card for My Whole Recording Setup Is One Desk on Wheels, with Joe's recording nook: the rolling desk with its green cutting mat and mic arm, an orange chair, an LED panel on a stand, and a 3D printer glowing on the shelf framed in a pink crayon box"
---

For years my videos were selfies on my iPhone or a webcam in the living room. I'd talk, trim the ends on my phone, and post it the same day. Then I started recording a lot more video for work at CData, and those needed to look and sound professional.

So over the last couple of months I built a recording setup in the small nook off my office. The camera, a teleprompter and the mic all ride on one standing desk that rolls. Most of the gear went together without much trouble. Lighting took weeks, and I'm still working on it.

This is the short version. [The full post](https://www.joekarlsson.com/blog/recording-setup-tour/) has a one-minute video tour, before-and-after audio, my mic and camera settings, the Home Assistant YAML and every part with its price.

## Why it's on wheels

I wanted recording to be as easy as walking over and plugging in. I wanted to move the whole rig to find a better shot without unclamping anything, and I wanted it to be a normal desk the rest of the time.

So the camera, prompter and mic clamp to a [FlexiSpot standing desk](https://www.amazon.com/dp/B0HCNVWH1D) on casters. When I roll the desk two feet to the left, the shot comes with it, and the lights on their stands are easy to drag along after it. When I'm done, I push it back into the corner.

![My recording desk from the front: an acacia standing desk under kitchen cabinets with a green cutting mat, a gridded softbox on a stand at the left, a mic on a low-profile arm, and a camera behind a teleprompter on a second arm at the right](/images/uses/recording-studio-front.webp)

_Pushed back into its corner, with a painting drying on the mat._

## Camera, prompter and mic

The camera is a Sony ZV-E10 behind an [Elgato Prompter](https://www.elgato.com/us/en/p/prompter), so I can read a script while looking straight into the lens. The script runs in [FollowSpot](https://www.joekarlsson.com/blog/followspot-local-whisper-teleprompter/), the teleprompter app I wrote that follows my voice. A Cam Link 4K turns the camera into a video source on my Mac, and a dummy battery runs it off wall power, because a real battery doesn't last long and I don't want to find that out halfway through a take.

The camera and Prompter hang off an Elgato mic arm, which is asking a lot of a mic arm. It's inside the weight rating, but it sags a little and I readjust it now and then. A second arm holds an [Elgato Wave:3](https://www.elgato.com/us/en/p/wave-3). I'm not an audio guy, and it took a lot of fiddling to get a voice that sounds rich and full.

## Light your face first

I figured lighting would be easy: buy a light, point it at my face, done.

I started with a ring light, and it blew my face out, everything flat and evenly bright. What I wanted was the opposite: a dark, moody room full of colored LEDs, with my face sharp in the middle of it. So I turned everything down, and the image went to hell. I shoot in aperture priority, so when there wasn't enough light, the camera made up the difference with gain. The picture got noisy and soft, and the compression turned my face to mush.

![Three ungraded stills of me on camera flipping by: August, a webcam in my bright living room lit flat by the window; October 15, a deep blue room with my face dark and soft; October 30, a softbox lighting my face warm and even with the blue room and an orange spotlight behind me](/images/newsletter/my-recording-setup-is-one-desk-on-wheels/lighting.gif)

_August, October 15 and October 30, ungraded._

The fix was to stop treating my face and the mood as one problem. A [softbox](https://www.amazon.com/dp/B0CJM6G7JR) lights my face well enough that the camera is happy, and the mood comes from everything behind me: colored LEDs, my 3D printer's lights, and a cheap spotlight with an orange gel on the wall.

If you're starting out, light your face first, until the camera gets a clean image at a low ISO, and only then add color and shadows around it.

![Buff Doge vs. Cheems meme: a muscular Buff Doge labeled 'Me shooting a video on my iPhone in 5 minutes' next to a small crying Cheems labeled 'Me with a teleprompter, a softbox and a 4K camera, still adjusting the lights'](/images/blog/recording-setup-tour/meme-buff-doge-cheems.webp)

## One cable, one switch, one sentence

A Thunderbolt dock on the desk holds the camera, the mic and the prompter screen, so my laptop plugs in with one cable. Everything on the desk runs off one smart plug.

![How the recording desk is wired: my laptop connects to an Anker Prime TB5 dock with one Thunderbolt 5 cable. The Cam Link 4K and the Wave:3 MK.2 send video and audio into the dock, and the dock drives the Elgato Prompter. The Sony ZV-E10 feeds the Cam Link over HDMI. The dock, the camera, the softbox and the spotlight all sit on one smart plug that Home Assistant switches.](/images/blog/recording-setup-tour/one-cable-one-plug.svg)

Then I say "I'm recording" to my Home Assistant voice assistant, and the room sets itself up. It powers on the desk, sets a Hue scene, pauses every media player in the house, turns off the TVs, and mutes the office voice assistant so it doesn't wake up while I read a script out loud. It also turns on my 3D printer, though not to print anything. My Prusa has great LEDs, and it looks good glowing on the shelf behind me.

## What it cost and what I'd change

The whole setup was about $2,700 at November 2026 prices. The desk and the dock are the two costs most people could skip, as long as you don't mind plugging in four things and leaving the rig where it is.

The first thing I'd change is the camera arm. I'm looking at Elgato's Wave Mic Arm Pro, which has real headroom for a camera and Prompter, so the low-profile arm can go back to holding only the mic. Then a better softbox, so the light wraps around my face instead of coming from one side.

For now it works great for what I need, and I can't recommend a rolling, one-cable setup enough.

<a class="button" href="https://www.joekarlsson.com/blog/recording-setup-tour/">Read the full tour</a>
