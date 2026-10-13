---
title: 'I hate editing video, so I built a screen recorder that edits for me'
date: 2026-10-12T20:56:41Z
slug: 'screencast-director-screen-recorder'
description: 'Screencast Director is an open source macOS screen recorder that drafts the edit: it cuts dead air, speeds up typing and takes edits from the AI model you pick.'
categories: ['Dev Tools', 'DevRel']
tags: ['video production', 'screen recording', 'macOS', 'Claude', 'whisper.cpp', 'open source']
heroImage: '/images/blog/screencast-director-screen-recorder/hero.webp'
heroAlt: 'I hate editing video. So I built a screen recorder that does it for me: the title next to the Screencast Director editor, with my face filling the preview under a Joe Karlsson, Made Screencast Director lower third, and the camera framing and color controls'
tldr: "Editing is my least favorite part of making videos, so I built Screencast Director, a macOS screen recorder that drafts the edit for me. Talk through a demo once: while you're talking it plays in real time, typing without talking gets sped up, and silence gets cut. It zooms to your clicks, captions what you said, and drops retakes. Then you adjust it on a timeline or tell an AI model what to change, and unlike Descript, Camtasia or Screen Studio, you pick the model, the local Whisper model and the prompts. It's a native Mac app, and it's open source."
---

I don't mind writing a video. I don't even mind recording one. Editing is the part I hate. It means sitting there for hours after the fact, watching myself, scrubbing past every "um," every dead pause, every time I lost my cursor, and every take of a line I flubbed three times.

So I built **Screencast Director**, an open source macOS screen recorder that records your screen and does the boring part of the edit for you. You talk through your demo once. It cuts the dead air, speeds up the typing, zooms in where you click and captions what you said. Then you fix what it got wrong by hand, or you tell an AI model what to change, using the model, the local Whisper model and the prompts you pick. It's [on GitHub](https://github.com/JoeKarlsson/screencast-director), and there's a short overview on the [project page](/work/screencast-director/).

![The Screencast Director editor: playing my intro on camera, then clicking a clip, a layout and a title on the timeline, with the inspector on the right switching to the settings for each one](/images/blog/screencast-director-screen-recorder/sd-tour.gif)

_Click anything on the timeline and the inspector switches to it._

## Why I built it

I've been making a lot more video lately. Some of it needs tight monologues, and I can't memorize lines, so in September I built [FollowSpot, a teleprompter that listens](/blog/followspot-local-whisper-teleprompter/) and follows along as I read. That fixed recording, but every video still turned into an afternoon of watching myself, and I was recording a lot more of them. Editing is the part I'm slowest at, so it's the part I put off.

![Hide the Pain Harold meme: Harold at a laptop with a mug, top caption Watching myself say um, bottom caption so I can cut it, with his strained smile](/images/blog/screencast-director-screen-recorder/meme-hide-the-pain-harold.webp)

## Why not Descript, Camtasia or Screen Studio

There are a few great apps for this, and I use them: [Descript](https://www.descript.com/), [Camtasia](https://www.techsmith.com/camtasia/) and [Screen Studio](https://screen.studio/). Most of them trim silence. Some have nice transitions. Descript lets you edit a video by editing its transcript, which I love. But none of them had everything I wanted in one place, and as of October 2026 I couldn't find a way in any of them to bring my own AI: pick the model, use a local Whisper model, or see and change the prompts it follows.

The pro tools aren't the answer for me either. I'm not a strong enough editor to get much out of Premiere or After Effects, and I don't care enough to become one.

So I took my favorite parts of each and stitched them into a Frankenstein editor built for how I work: edit by transcript, automatic zooms, silence trimming, Screen Studio's keyboard shortcuts, and AI editing that I control. In Screencast Director I can:

- **Pick the model that does the editing**, whether that's Claude, another provider or a model running on my own machine.
- **Transcribe with any whisper.cpp model I install**, so my audio never goes to anyone's cloud.
- **See and change the prompts** the edits go through, including my own rules and taste, so every video gets edited the same way. They're plain files in the repo.

By default the editing runs on your Claude Code login, so there's no API key to paste. Recordings and input logs stay on your Mac, and your video and audio never leave it. The model gets your instruction, the transcript and the edit plan, plus a few still frames if you use Claude Code, so if you want nothing to leave the machine, point it at a local model.

![Opening the AI provider menu in Screencast Director's settings and hovering Claude Code (your Claude login, no API key), Anthropic API, and OpenAI-compatible API (OpenRouter, OpenAI, gateways, Ollama)](/images/blog/screencast-director-screen-recorder/sd-ai-provider.gif)

_The AI provider menu in Settings._

## How it drafts the edit

The draft comes from one rule, which I call the talking rule:

- If you're talking, it plays in real time.
- If you're typing and not talking, it fast-forwards.
- If nothing's happening, it's cut.

When you stop recording, the app transcribes you on your Mac with [whisper.cpp](https://github.com/ggml-org/whisper.cpp), lines that up with a log of when you clicked and typed (never what you typed), and drafts the edit from it. It adds zooms where you clicked and turns what you said into captions. On one of my demos, a 3:36 recording came out at 2:56.

![Hovering across the timeline, clicking a dashed cut and pressing Restore in the inspector so it becomes a restored clip, selecting a clip and setting it to 2x so it turns striped, then pressing Command-slash to open the keyboard shortcuts](/images/blog/screencast-director-screen-recorder/sd-timeline.gif)

_Restoring a cut, then setting a clip to 2x._

The timeline shows what it did. Solid clips play in real time, striped clips are sped up and labeled with their speed, and the dashed boxes are cuts. If it cut something you wanted, you click the cut and press Restore. The keyboard shortcuts match Screen Studio's, because those are the ones my hands already know.

Retakes were the other big time sink. Now, when I flub a line, I press ⌃⌥⌘M and say it again, and the draft cuts the bad take and keeps the redo. If FollowSpot is open while I record, the app saves my script with the recording and keeps only the last take of each line I read more than once.

## Asking AI for edits

The draft gets most of the way there. For the rest, there's a box at the bottom of the editor where you type what you want: "tighten the pauses and add a title at the start," or "side by side for the intro." Claude (or whatever model I've pointed it at) reads the transcript and the edit, changes it, and the timeline highlights what it touched.

![Typing Tighten the pauses and add a title at the start into the Ask Claude box, a Claude is editing badge while it works (sped up), then the edit landing: the title changes to 1:18.5 recorded, 0:45.8 edited, and the timeline gains a new title and tighter clips](/images/blog/screencast-director-screen-recorder/sd-ask.gif)

_The wait while Claude works is sped up 8x._

## Profiles, camera, export and publishing

After the edit, there's still making the thing look like it belongs to you, exporting it in four shapes, and writing the description.

**Profiles** set your background, fonts, colors, logo and frame, so every video looks the same without fiddling.

![Clicking through background gradient swatches in the Background & Frame inspector, with the preview changing color each time, then dragging the padding and corner sliders](/images/blog/screencast-director-screen-recorder/sd-style.gif)

_Swatches, padding and corners, saved in a profile._

**The camera** can be a bubble, side by side or full frame, and you can switch it for any stretch of the video. It centers on your face and has basic color grading.

![The Camera inspector: dragging the camera zoom, clicking Center on My Face, trying the Warm, Punchy, Cool and Natural color presets, then switching the layout between Camera only, Side by side and Screen only](/images/blog/screencast-director-screen-recorder/sd-camera.gif)

_Reframe, center on your face, grade, and change the layout._

**Export** has presets for YouTube, Shorts, square and 4:5, up to 4K, and renders in the background while you keep working. Vertical crops follow your clicks, so code stays readable on a phone.

![Opening the Export menu and hovering Export Current Format, YouTube 4K, YouTube 1080p, Shorts, Reels and TikTok, Square, LinkedIn and Instagram feed, All of the Above, GIF and Upload and Copy Link, then clicking Shorts and watching it render in the Exports popover](/images/blog/screencast-director-screen-recorder/sd-export.gif)

_Picking Shorts from the Export menu and watching it render._

**Publish** writes captions, chapters and a description draft, and picks thumbnail frames where you're smiling.

![Opening Publish and clicking Make Captions, Chapters & Thumbnails: the app finds my best smiling camera frames and lays the title over them in the profile's style, and lists captions.srt and transcript.txt](/images/blog/screencast-director-screen-recorder/sd-publish.gif)

_The thumbnails use my smiling camera frames, with the title laid over them in the profile's style._

## What it doesn't do yet

It's version 0.2.0, and it shows in a few places:

- **It's Mac only.** It needs Apple silicon and macOS 15 or later.
- **It isn't notarized yet.** You can [download the app from GitHub](https://github.com/JoeKarlsson/screencast-director/releases/latest), but the first time you open it, macOS makes you click Open Anyway in System Settings > Privacy & Security. It also needs whisper.cpp from Homebrew.
- **The AI edits aren't always right.** The timeline shows exactly what changed, so I check every one.

If you make screencasts and hate editing as much as I do, [download it from GitHub](https://github.com/JoeKarlsson/screencast-director/releases/latest), tell me what it gets wrong, and if you tune the prompts to your own taste, send me a PR.
