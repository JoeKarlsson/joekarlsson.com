---
title: 'A tour of my recording setup in 2027, all on one standing desk that rolls'
seoTitle: 'My Recording Setup Tour for 2027'
date: 2026-11-09T10:24:19Z
slug: 'recording-setup-tour'
description: 'A tour of my home recording setup: Sony ZV-E10, teleprompter and mic on one rolling desk, a Home Assistant recording mode, and lighting I got wrong twice.'
categories: ['Life', 'Homelab']
tags:
  [
    'video production',
    'recording setup',
    'teleprompter',
    'Home Assistant',
    'lighting',
    'Sony ZV-E10',
  ]
tldr: 'My whole recording setup lives on one FlexiSpot standing desk on casters: a Sony ZV-E10 behind an Elgato Prompter on one Elgato arm, a Wave:3 mic on another, a softbox on a stand and a NEEWER spotlight on a tripod. One Thunderbolt 5 cable connects my laptop to all of it, one smart switch powers it, and telling Home Assistant "I''m recording" sets up the room. It cost about $2,700 at November 2026 prices. Lighting was the hard part: a ring light blew me out, and going dark and moody made the image fall apart. What worked was lighting my face first and adding the mood around it.'
faq:
  - question: 'Should I light my face or the room first for video?'
    answer: 'Your face first. A ring light blew my face out, and a dark, moody room made the footage noisy and soft. What worked was a softbox on my face until the camera got a clean image, then colored lights and a gelled spotlight behind me for the mood.'
  - question: 'Can a mic arm hold a camera and a teleprompter?'
    answer: "On paper, yes. The Elgato Wave Low Profile arm is rated for 2 kg, and my Elgato Prompter (0.69 kg) plus a Sony ZV-E10 with its kit lens (about 0.45 kg) fit under that. It still sags and needs readjusting now and then, so I'd use an arm built to hold a camera next time."
  - question: 'How does Home Assistant set up the room for recording?'
    answer: 'I say "I''m recording" to my Home Assistant voice assistant. An Assist automation runs a script that turns on the recording desk''s smart plug, sets a Hue scene, pauses every media player, turns off the TVs, mutes the office voice assistant and turns on my 3D printer for its LEDs.'
heroImage: '/images/blog/recording-setup-tour/thumb-a60218b7.webp'
heroAlt: "Roger Fenton's 1855 photographic van, a horse-drawn darkroom wagon with PHOTOGRAPHIC VAN painted on the side and his assistant sitting on the driver's seat"
---

My whole recording setup lives on one standing desk that rolls. A camera, a teleprompter and a mic ride on it, the lights follow on stands, one Thunderbolt cable connects my laptop to everything, and when I tell Home Assistant "I'm recording," the room sets itself up. When I'm done, I push the desk into the corner. Most of the gear went together without much trouble, but lighting took weeks of experimenting, and I'm still working on it.

Here's a quick tour:

<video data-autoplay-in-view data-phone-still muted playsinline controls preload="none" poster="/images/blog/recording-setup-tour/tour-poster-wide.webp" src="/images/blog/recording-setup-tour/tour.mp4" aria-label="A one-minute tour of my recording desk, with burned-in captions: I show the single cable into my laptop, the camera behind the teleprompter, the mic, the lights I reposition, and how the whole desk moves around my small recording nook">
</video>

For years my videos were selfies on my iPhone or a webcam in the living room. I'd talk, trim the ends on my phone, and post it the same day. That's fine for a quick take. Then I started recording a lot more video for work at CData, and those needed to look and sound professional. One of the first I made at this desk was a walkthrough of [ChatGPT dots](/blog/how-to-use-chatgpt-dots/) in October.

## One desk on wheels

I had four goals for this setup:

- **Make recording as easy as possible:** walk over, plug in, start.
- **Move the whole rig to find a better shot** without unclamping anything.
- **Keep it a usable desk** when I'm not recording.
- **Get it out of the way** when I'm done.

<video data-autoplay-in-view data-phone-still loop muted playsinline controls preload="none" poster="/images/blog/recording-setup-tour/working-at-desk.webp" src="/images/blog/recording-setup-tour/working-at-desk.mp4" aria-label="Me working on my laptop at the recording desk, shot from a tripod in the corner, with the spotlight in the foreground and the LED panel lit behind the desk"></video>

_When I'm not recording, it's a normal desk._

The space is a small nook off my office, so the whole thing had to be compact. I didn't want a studio that took over the room, or a camera on a tripod that I'd have to reframe every time it got bumped.

So the camera, teleprompter and mic clamp to one desk: a [FlexiSpot E6 MAX](https://www.amazon.com/dp/B0HCNVWH1D), 48 by 24 inches, on FlexiSpot's W1 casters. The camera and teleprompter sit on one arm and the mic sits on the other, so when I roll the desk two feet to the left, the shot comes with it. The lights don't clamp. The softbox is on a light stand and the spotlight is on a lightweight tripod, so they're easy to drag along after the desk.

![My recording desk from the front: an acacia standing desk under kitchen cabinets with a green cutting mat, a gridded softbox on a stand at the left, a mic on a low-profile arm, and a camera behind a teleprompter on a second arm at the right](/images/uses/recording-studio-front.webp)
_Pushed back into its corner of the nook, with a painting drying on the mat._

## Camera, prompter and mic

The camera is a **Sony ZV-E10** with the 16-50mm kit lens. It sits behind an [Elgato Prompter](https://www.elgato.com/us/en/p/prompter), so I can read a script while looking straight into the lens. I run the script in [FollowSpot](/work/followspot/), the teleprompter app I wrote that [follows my voice](/blog/followspot-local-whisper-teleprompter/), with a live camera feed on the Prompter so I can see myself while I read.

![The Sony ZV-E10 seen from behind, mounted behind the Elgato Prompter's hood on the arm, over the green cutting mat](/images/blog/recording-setup-tour/camera-behind-prompter.webp)

_The ZV-E10 from behind, tucked into the Prompter's hood._

Two cheap accessories made the camera usable for this:

- **An [Elgato Cam Link 4K](https://www.elgato.com/us/en/p/cam-link-4k)** takes the camera's clean HDMI out and hands it to my Mac as a video source.
- **A [Kimaru dummy battery](https://www.amazon.com/dp/B08BCRSV4H)** runs the camera off wall power. A real NP-FW50 doesn't last long, and I don't want to find that out halfway through a take.

The camera and Prompter ride on an [Elgato Wave Low Profile arm](https://www.elgato.com/us/en/p/wave-mic-arm-lp), which is asking a lot of a mic arm. Elgato [rates it for 2 kg](https://www.elgato.com/us/en/p/wave-mic-arm-lp). The [Prompter](https://www.elgato.com/us/en/p/prompter) is 0.69 kg and the camera with its kit lens is about 0.45 kg, so it's inside the rating on paper, but the arm sags a little. I have to readjust it now and then, and it has held for a couple of months.

The second Low Profile arm holds an [Elgato Wave:3](https://www.elgato.com/us/en/p/wave-3) (the MK.2) in Elgato's shock mount. I went with Elgato because I already had a Wave:3 at my main desk, and both mics show up in the same Wave Link software, so the audio chain is the same at either desk.

I'm not an audio guy, so this part has been a learning curve. What I wanted was a voice that sounds rich, deep and full. Here's where the MK.2 is set right now, after a lot of fiddling:

- **Gain at 8 out of 40**, locked, with Clipguard on so a loud laugh doesn't clip.
- **The 120 Hz low cut on**, to drop desk thumps and room rumble.
- **A noise gate** (Wave Link calls it an expander) at -44 dB, so the room goes quiet between sentences.
- **EQ:** +3.25 dB around 227 Hz for warmth, -3 dB around 860 Hz to take out the boxy sound, and +1.75 dB around 10 kHz for a little clarity.
- **Bettermaker all the way up, and Voice Focus on.** The compressor is set up but switched off.

Both clips below are set to the same loudness. The first is a TikTok from my phone days, recorded on my iPhone with a small clip-on mic:

<audio controls preload="none" src="/images/blog/recording-setup-tour/audio-before-phone.m4a" aria-label="Audio from a phone-era TikTok, recorded on an iPhone with a clip-on mic"></audio>

<!-- vale JoeKarlsson.FillerWords = NO -->

_"Yes, I totally agree. Your stack can really affect the programming languages you use. No language is better than another. It depends on the project and what you're trying to solve and what your needs are."_

<!-- vale JoeKarlsson.FillerWords = YES -->

The second is the Wave:3 MK.2 on the recording desk, from the ChatGPT dots video, before any editing:

<audio controls preload="none" src="/images/blog/recording-setup-tour/audio-after-wave3.m4a" aria-label="Audio from the ChatGPT dots video, recorded on the Wave:3 MK.2 at the recording desk"></audio>

_"The apps your job runs on, and right now, it can't see any of them. Let's fix that now. Today, I'm going to connect a dot to hundreds of apps with a single plugin."_

## Light your face first

I figured lighting would be easy: buy a light, point it at my face, done.

I started with a ring light, and it blew my face out, with everything flat and evenly bright.

What I wanted was the opposite: a dark, moody room full of colored LEDs, with my face sharp in the middle of it. So I turned everything down, and the image went to hell. When I recorded too dark, the camera had less light to work with, the picture got noisy and soft, and the compression turned my face to mush.

These are ungraded clips from each stage:

<video data-autoplay-in-view data-phone-still loop muted playsinline controls preload="none" poster="/images/blog/recording-setup-tour/lighting-1-webcam-aug.webp" src="/images/blog/recording-setup-tour/lighting-1-webcam-aug.mp4" aria-label="Late August, the webcam era: me in a hat and headphones in my bright living room, lit flat by daylight from a window"></video>

_August: a webcam in the living room, with lots of light and no mood._

<video data-autoplay-in-view data-phone-still loop muted playsinline controls preload="none" poster="/images/blog/recording-setup-tour/lighting-2-first-studio-oct.webp" src="/images/blog/recording-setup-tour/lighting-2-first-studio-oct.mp4" aria-label="Mid-October, my first take on the new desk: the room is deep blue, an orange spotlight hits the wall, and my face is dark and soft"></video>

_October 15: plenty of mood, and my face is the darkest thing in the frame._

<video data-autoplay-in-view data-phone-still loop muted playsinline controls preload="none" poster="/images/blog/recording-setup-tour/lighting-3-dots-oct.webp" src="/images/blog/recording-setup-tour/lighting-3-dots-oct.mp4" aria-label="Late October, the ChatGPT dots video: a softbox lights my face warm and even, with the dark blue room and an orange spotlight on the wall behind me"></video>

_October 30: the softbox on my face, and the mood behind me._

The fix was to stop treating the face and the mood as one problem. The ring light is gone. A [NEEWER softbox](https://www.amazon.com/dp/B0CJM6G7JR) is my key light now, and it's there to light my face well enough that the camera is happy. The mood comes from everything behind me: colored LEDs, the 3D printer's lights, and a [NEEWER FL20 spotlight](https://www.amazon.com/dp/B0H38M1N96) with a colored gel that I move around to throw a hard pool of orange on the wall.

![Wide shot of the recording nook from the corner: the spotlight on its tripod in the foreground, the orange chair, the desk with the LED panel and the Prompter, plants and a striped rug](/images/blog/recording-setup-tour/nook-wide.webp)

_The nook from the corner, with the spotlight on its tripod in front._

On the camera, I'm still experimenting, but right now it's in aperture priority, recording XAVC S 4K at 25p and 60 Mbps, with SteadyShot on. Aperture priority lets the camera pick the shutter speed and ISO, which is part of why underexposing went so badly: when there wasn't enough light, the camera made up the difference with gain.

My footage also looks a little stuttery, and I think 25p is why. 25 frames a second doesn't divide evenly into the 30 and 60 fps that everything downstream of the camera runs at, so frames get repeated unevenly. At 25p the camera also tends to pick a 1/50 shutter, which can [flicker under 60Hz LED lighting](https://www.dvxuser.com/threads/25p-in-united-states-lighting-advice.340752/) here in the US. Next I'm switching the camera to NTSC and shooting 30p at 1/60, which I haven't tested yet.

In editing, I grade the camera track with a soft film LUT in [Screencast Director, the screen recorder I built that drafts the edit for me](/blog/screencast-director-screen-recorder/), but a LUT can't bring back detail the camera never captured.

If you're starting out, light your face first, until the camera gets a clean image at a low ISO, and only then add color and shadows around it. I do a quick light check before I record, to make sure everything looks good.

![Buff Doge vs. Cheems meme: a muscular Buff Doge labeled 'Me shooting a video on my iPhone in 5 minutes' next to a small crying Cheems labeled 'Me with a teleprompter, a softbox and a 4K camera, still adjusting the lights'](/images/blog/recording-setup-tour/meme-buff-doge-cheems.webp)

## One cable and one switch

The laptop side is one cable. An [Anker Prime TB5 dock](https://www.amazon.com/dp/B0DSVVJXK5) lives on the recording desk, and the Cam Link, the Wave:3 and the Prompter all plug into it. When I walk over with my laptop, I plug in one Thunderbolt 5 cable, and I get the camera, the mic, the prompter screen and up to 140W of charging.

The power side is one switch. Everything on the desk plugs into a single [Sengled smart plug](https://www.amazon.com/dp/B092DBFFBY), an energy-monitoring plug that Home Assistant controls. With everything on, the plug has never read more than about 112W, well under its 1800W rating.

![How the recording desk is wired: my laptop connects to an Anker Prime TB5 dock with one Thunderbolt 5 cable. The Cam Link 4K and the Wave:3 MK.2 send video and audio into the dock, and the dock drives the Elgato Prompter. The Sony ZV-E10 feeds the Cam Link over HDMI. The dock, the camera, the softbox and the spotlight all sit on one smart plug that Home Assistant switches.](/images/blog/recording-setup-tour/one-cable-one-plug.svg)

## Recording mode in Home Assistant

I start recording mode by voice. I say "I'm recording" to the [Home Assistant voice assistant](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/) in my office, and an Assist automation catches it:

```yaml
triggers:
  - trigger: conversation
    command:
      - '(start|begin|activate|turn on) recording [mode]'
      - "(i'm|im|i am) recording"
      - 'set up [for] recording'
actions:
  - action: script.turn_on
    target:
      entity_id: script.office_recording_mode_on
  - set_conversation_response: 'Recording mode activated. Lights are set, media is paused, and distractions are off. Good luck!'
```

The script it runs does the rest:

- **Turns on the desk's smart switch**, so the camera, dock and lights power up.
- **Sets a Hue scene** called Video Recording for the room lights.
- **Pauses every media player** in the house and turns off both TVs in the great room.
- **Mutes the office voice assistant**, so it doesn't wake up mid-take while I read a script out loud.
- **Turns off the office subwoofer.**
- **Turns on the 3D printer**, though not to print anything. My Prusa has great LEDs, and it looks good glowing on the shelf behind me, so it's a prop now.

With the voice assistant muted, I don't turn it off by voice. My Home Assistant dashboard is always open on my laptop, so when I'm done I flip the Recording toggle there, and a second script unmutes the voice assistant and cuts power to the desk. My [Meeting Mode](/blog/best-home-assistant-automations/) handles video calls on its own, triggered by the Mac's camera, so recording mode is only for the big setup.

## What it costs: about $2,700

These are prices as of November 2026.

| Gear                                   | Price      |
| -------------------------------------- | ---------- |
| Sony ZV-E10 with 16-50mm lens (bundle) | $865       |
| Kimaru NP-FW50 dummy battery           | $26        |
| Elgato Cam Link 4K                     | $86        |
| Elgato Prompter                        | $300       |
| Elgato Wave Low Profile arm (x2)       | $200       |
| Elgato Wave:3 MK.2                     | $170       |
| Elgato shock mount                     | $40        |
| Anker Prime TB5 dock                   | $350       |
| NEEWER NS4S softbox                    | $36        |
| SMALLRIG light stand                   | $35        |
| NEEWER FL20 spotlight                  | $39        |
| FlexiSpot E6 MAX 48x24 + W1 casters    | $515       |
| Sengled smart plug (4-pack, I use one) | $45        |
| **Total**                              | **$2,707** |

The dock and the desk are the two costs most people could skip. A desk you already own and a cable per device work fine, as long as you don't mind plugging in four things and leaving the rig where it is.

## What I'd change

The first thing I'd change is the camera arm. A Low Profile arm holding a camera and a Prompter is inside its rating, but it's a lot of weight hanging off the end of a mic arm, and it drifts. The upgrade I'm looking at is Elgato's [Wave Mic Arm Pro](https://www.markertek.com/product/ego-wavemicarmpr/elgato-wave-mic-arm-pro-360-degree-low-profile-microphone-boom-arm-with-gas-spring-suspension-black). Retailers list it at 3 kg with 75 cm of reach, which leaves real headroom for my roughly 1.1 kg of camera and Prompter, and it still swings out of the way like the arm it replaces. The Low Profile arm would go back to holding only the mic. Elgato's [Master Mount L](https://www.markertek.com/product/ego-10aab9901/elgato-master-mount-l-multi-stand-mount-modular-rigging-system-for-lights-cameras-and-elagato-prompter), a rigid desk-clamped pole, couldn't sag at all, but I'd lose the swing-away.

The second is the lighting, which isn't finished. Next I want a better softbox in front of my face, so the light wraps around a bit more instead of coming from one side.

Someday I might need to record in a bigger space, or grow out of the nook. For now it works great for what I need, and I can't recommend a rolling, one-cable setup enough. The rest of my gear, from the main desk to the keyboard, is on [my uses page](/uses/).
