---
title: 'My Whole Recording Setup Is One Desk on Wheels'
date: 2026-11-19T08:00:00Z
slug: 'my-recording-setup-is-one-desk-on-wheels'
description: 'How I record video at home: a camera, teleprompter and mic on one rolling desk, one cable to my laptop, a voice command that sets up the room, and lighting I got wrong twice.'
recapOf: 'recording-setup-tour'
cardPhoto: '/images/blog/recording-setup-tour/nook-wide.webp'
cardPhotoAlt: "Joe's recording nook: the rolling desk with its green cutting mat and mic arm, an orange chair, an LED panel on a stand, and a 3D printer glowing on the shelf"
heroImage: '/images/newsletter/my-recording-setup-is-one-desk-on-wheels/card.webp'
heroAlt: "Works on My Machine card for My Whole Recording Setup Is One Desk on Wheels, with Joe's recording nook: the rolling desk with its green cutting mat and mic arm, an orange chair, an LED panel on a stand, and a 3D printer glowing on the shelf framed in a pink crayon box"
---

For years my videos were selfies on my iPhone or a webcam in the living room. I'd talk, trim the ends on my phone, and post it the same day. Then I started recording a lot more video for work at CData, and those needed to look and sound professional.

So over the last couple of months I built a recording setup in the small nook off my office. The camera, a teleprompter and the mic all ride on one standing desk that rolls, and the lights follow on stands. Most of the gear went together without much trouble. Lighting took weeks, and I'm still working on it.

Everything is below. The [blog version](https://www.joekarlsson.com/blog/recording-setup-tour/) also has a one-minute video tour of the desk and before-and-after audio clips, which don't play in email.

## Why it's on wheels

I had four goals:

- **Make recording as easy as possible:** walk over, plug in, start.
- **Move the whole rig to find a better shot** without unclamping anything.
- **Keep it a usable desk** when I'm not recording.
- **Get it out of the way** when I'm done.

The nook is small, so I didn't want a studio that took over the room, or a camera on a tripod I'd have to reframe every time it got bumped. The camera, prompter and mic clamp to a [FlexiSpot E6 MAX](https://www.amazon.com/dp/B0HCNVWH1D) (48 by 24 inches) on FlexiSpot's W1 casters. When I roll the desk two feet to the left, the shot comes with it. The softbox is on a light stand and the spotlight is on a light tripod, so they're easy to drag along after it. When I'm done, I push the desk back into the corner, and it's a normal desk again.

![My recording desk from the front: an acacia standing desk under kitchen cabinets with a green cutting mat, a gridded softbox on a stand at the left, a mic on a low-profile arm, and a camera behind a teleprompter on a second arm at the right](/images/uses/recording-studio-front.webp)

_Pushed back into its corner, with a painting drying on the mat._

## Camera, prompter and mic

The camera is a **Sony ZV-E10** with the 16-50mm kit lens, behind an [Elgato Prompter](https://www.elgato.com/us/en/p/prompter) so I can read a script while looking straight into the lens. The script runs in [FollowSpot](https://www.joekarlsson.com/blog/followspot-local-whisper-teleprompter/), the teleprompter app I wrote that follows my voice, with a live camera feed on the Prompter so I can see myself while I read.

Two cheap accessories made the camera work for this:

- **An [Elgato Cam Link 4K](https://www.elgato.com/us/en/p/cam-link-4k)** turns the camera's clean HDMI out into a video source on my Mac.
- **A [Kimaru dummy battery](https://www.amazon.com/dp/B08BCRSV4H)** runs the camera off wall power. A real NP-FW50 doesn't last long, and I don't want to find that out halfway through a take.

The camera and Prompter sit on an [Elgato Wave Low Profile arm](https://www.elgato.com/us/en/p/wave-mic-arm-lp), which is asking a lot of a mic arm. It's rated for 2 kg. The Prompter is 0.69 kg and the camera with its lens is about 0.45 kg, so it's inside the rating on paper, but the arm sags a little and I readjust it now and then. It has held for a couple of months.

A second Low Profile arm holds an [Elgato Wave:3](https://www.elgato.com/us/en/p/wave-3) (the MK.2) in Elgato's shock mount. I already had a Wave:3 at my main desk, and both mics show up in the same Wave Link software, so the audio chain is the same at either desk.

I'm not an audio guy, so this part has been a learning curve. I wanted a voice that sounds rich, deep and full, and here's where the mic is set after a lot of fiddling:

- **Gain at 8 out of 40**, locked, with Clipguard on so a loud laugh doesn't clip.
- **The 120 Hz low cut on**, to drop desk thumps and room rumble.
- **A noise gate** (Wave Link calls it an expander) at -44 dB, so the room goes quiet between sentences.
- **EQ:** +3.25 dB around 227 Hz for warmth, -3 dB around 860 Hz to take out the boxy sound, and +1.75 dB around 10 kHz for a little clarity.
- **Bettermaker all the way up, and Voice Focus on.** The compressor is set up but switched off.

## Light your face first

I figured lighting would be easy: buy a light, point it at my face, done.

I started with a ring light, and it blew my face out, everything flat and evenly bright. What I wanted was the opposite: a dark, moody room full of colored LEDs, with my face sharp in the middle of it. So I turned everything down, and the image went to hell. With that little light, the picture got noisy and soft, and the compression turned my face to mush.

![Three ungraded stills of me on camera flipping by: August, a webcam in my bright living room lit flat by the window; October 15, a deep blue room with my face dark and soft; October 30, a softbox lighting my face warm and even with the blue room and an orange spotlight behind me](/images/newsletter/my-recording-setup-is-one-desk-on-wheels/lighting.gif)

_August, October 15 and October 30, ungraded._

The fix was to stop treating my face and the mood as one problem. The ring light is gone. A [NEEWER softbox](https://www.amazon.com/dp/B0CJM6G7JR) is my key light now, and its whole job is to light my face well enough that the camera is happy. The mood comes from everything behind me: colored LEDs, my 3D printer's lights, and a [NEEWER FL20 spotlight](https://www.amazon.com/dp/B0H38M1N96) with a colored gel that throws a hard pool of orange on the wall.

The camera is in aperture priority, recording XAVC S 4K at 25p and 60 Mbps, with SteadyShot on. Aperture priority lets the camera pick the shutter speed and ISO, which is part of why going dark went so badly: when there wasn't enough light, the camera made up the difference with gain.

My footage also looks a little stuttery, and I think 25p is why. 25 frames a second doesn't divide evenly into the 30 and 60 fps everything after the camera runs at, so frames get repeated unevenly. At 25p the camera also tends to pick a 1/50 shutter, which can [flicker under 60Hz LED lighting](https://www.dvxuser.com/threads/25p-in-united-states-lighting-advice.340752/) here in the US. Next I'm switching the camera to NTSC and shooting 30p at 1/60. I haven't tested that yet.

In editing, I grade the camera track with a soft film LUT in [Screencast Director](https://www.joekarlsson.com/blog/screencast-director-screen-recorder/), the screen recorder I built that drafts the edit for me. A LUT can't bring back detail the camera never captured, though.

If you're starting out, light your face first, until the camera gets a clean image at a low ISO, and only then add color and shadows around it. I do a quick light check before every recording.

![Buff Doge vs. Cheems meme: a muscular Buff Doge labeled 'Me shooting a video on my iPhone in 5 minutes' next to a small crying Cheems labeled 'Me with a teleprompter, a softbox and a 4K camera, still adjusting the lights'](/images/blog/recording-setup-tour/meme-buff-doge-cheems.webp)

## One cable and one switch

An [Anker Prime TB5 dock](https://www.amazon.com/dp/B0DSVVJXK5) lives on the desk, and the Cam Link, the Wave:3 and the Prompter all plug into it. When I walk over with my laptop, I plug in one Thunderbolt 5 cable and get the camera, the mic, the prompter screen and up to 140W of charging.

Everything on the desk plugs into a single [Sengled smart plug](https://www.amazon.com/dp/B092DBFFBY) that Home Assistant controls. With everything on, it has never read more than about 112W.

![How the recording desk is wired: my laptop connects to an Anker Prime TB5 dock with one Thunderbolt 5 cable. The Cam Link 4K and the Wave:3 MK.2 send video and audio into the dock, and the dock drives the Elgato Prompter. The Sony ZV-E10 feeds the Cam Link over HDMI. The dock, the camera, the softbox and the spotlight all sit on one smart plug that Home Assistant switches.](/images/blog/recording-setup-tour/one-cable-one-plug.svg)

## "I'm recording"

I say "I'm recording" to the Home Assistant voice assistant in my office, and an automation runs a script that:

- **Turns on the desk's smart plug**, so the camera, dock and lights power up.
- **Sets a Hue scene** called Video Recording for the room lights.
- **Pauses every media player** in the house and turns off both TVs in the great room.
- **Mutes the office voice assistant**, so it doesn't wake up mid-take while I read a script out loud.
- **Turns off the office subwoofer.**
- **Turns on the 3D printer**, though not to print anything. My Prusa has great LEDs, and it looks good glowing on the shelf behind me, so it's a prop now.

Since the voice assistant is muted, I can't turn recording mode off by voice. My Home Assistant dashboard is always open on my laptop, so when I'm done I flip the Recording toggle there, and a second script unmutes the voice assistant and cuts power to the desk. The automation YAML is in [the blog post](https://www.joekarlsson.com/blog/recording-setup-tour/#recording-mode-in-home-assistant) if you want to copy it.

## What it cost: about $2,700

Prices as of November 2026.

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

The camera arm, first. It's inside its rating, but that's a lot of weight hanging off the end of a mic arm, and it drifts. I'm looking at Elgato's [Wave Mic Arm Pro](https://www.markertek.com/product/ego-wavemicarmpr/elgato-wave-mic-arm-pro-360-degree-low-profile-microphone-boom-arm-with-gas-spring-suspension-black), which retailers list at 3 kg with 75 cm of reach. That's real headroom for my roughly 1.1 kg of camera and Prompter, and it still swings out of the way. The Low Profile arm would go back to holding only the mic.

Then the lighting, which isn't finished. I want a better softbox in front of my face, so the light wraps around a bit more instead of coming from one side.

Someday I might outgrow the nook. For now it works great for what I need, and I can't recommend a rolling, one-cable setup enough. The rest of my gear, from the main desk to the keyboard, is on [my uses page](https://www.joekarlsson.com/uses/).
