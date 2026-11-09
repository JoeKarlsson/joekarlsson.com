---
name: youtube-upload
description: Package one of Joe's talk, podcast or demo recordings for YouTube with everything filled in - title, description in Joe's voice with event, links and chapters, tags, category, recording date and place, cleaned Whisper subtitles and transcript, and a taped-photo thumbnail - then upload it unlisted in YouTube Studio and add it to src/data/talk-videos.json. Use when Joe asks to upload, re-upload or back up a recording to YouTube, or to write a YouTube description, chapters or subtitles for one of his videos.
---

# YouTube upload package

Every recording Joe puts on YouTube goes up fully featured: nothing left at YouTube's defaults. The masters live on the NAS (`/Volumes/data/media/My Videos/`, organized type then year; SMB mount of the Synology). The package sits beside the video:

```
<video stem>.youtube.json   title, description, tags, settings, thumbnail crop, youtubeId once uploaded
<video stem>.youtube.srt    cleaned captions (upload these)
<video stem>.youtube.txt    cleaned plain transcript (for Joe's talk page later)
<video stem>.youtube.png    1280x720 thumbnail
<video stem>.youtube.frame.png   the still the thumbnail was cut from
```

Uploads are **unlisted**: they don't notify subscribers or sit on the channel page, but they embed on joekarlsson.com. Never private (private can't embed) and never public unless Joe says so.

Only upload recordings Joe owns: his own recordings, pre-recorded conference versions he made, and anything on his own channel. A recording an organizer published stays embedded from the organizer's channel; when it dies, the `talk-videos` health check emails and this skill re-uploads Joe's NAS copy in its place.

## 1. Facts first

Before writing anything, collect and write down:

- **What it is**: title as given (slide 1, the organizer's upload title, or the file name), length (`ffprobe`), date (file name, `.info.json` `upload_date`, or file mtime for a pre-recorded version).
- **The event**: `src/pages/talk-archive.astro` lists every event Joe gave each talk at. For a pre-recorded version, match the recording date and running time against the organizer uploads in `My Videos/Talks/<year>/*.info.json` (a 14-minute recording made three weeks before a conference whose upload runs 14 minutes is that conference's). Only claim what the talk page or an upload proves; "I gave this talk at X and Y in 2020" is safe, "this is the recording X played" needs the match.
- **People**: co-speakers from the title slide (bechdel.io is Joe and his sister Laurel Karlsson). Credit them by name.
- **Links the talk references**: read the resources and "about me" slides (step 2 frames). Resolve every short link (`curl -s -o /dev/null -w '%{redirect_url}' https://bit.ly/...`), follow old `joekarlsson.com/YYYY/MM/<slug>/` URLs to their current `/blog/<slug>/` page, and drop dead links, promo codes and expired hiring/credit offers. Link Joe's own post about the talk when there is one (`ls src/content/blog | grep <topic>`). Point to joekarlsson.com, not old `joekarlsson.dev` short links.
- **The organizer's copy**, if one exists on YouTube: link it in the description.

## 2. Frames and thumbnail

Pull candidate stills from the first and last minute (greetings and thank-yous have the best faces):

```bash
for t in 5 10 15 20 30 40 50 60; do ffmpeg -v error -ss $t -i "$VIDEO" -frames:v 1 -y /tmp/f$t.png; done
```

Read them and pick a frame where Joe's eyes are open and he's smiling or mid-gesture, never mid-blink or mid-word. Webcam corners are small: crop tight and check the crop at thumbnail size. If no frame works, use the headshot from the deck's about-me slide. Copy the still to `<stem>.youtube.frame.png`, set `thumbnail` in the package (`kicker` = "Event · Year", `title` = a short form of the talk title, `box` = crop), and draw it:

```bash
npm run youtube:thumbnail -- "<stem>.youtube.json"
```

Read the PNG. No slide text in the print's corners, no cut-off head. Joe approves the batch's thumbnails before upload.

## 3. Transcript and captions

Local Whisper on the Mac (Apple silicon, large-v3-turbo is cached, ~20s for a 15-minute talk):

```bash
ffmpeg -v error -i "$VIDEO" -vn -ac 1 -ar 16000 -y /tmp/talk.wav
mlx_whisper /tmp/talk.wav --model mlx-community/whisper-large-v3-turbo --language en \
  --output-format all --output-dir /tmp/talk --word-timestamps True \
  --max-line-width 42 --max-line-count 2 \
  --initial-prompt "Joe Karlsson. <names, products and jargon from the slides>"
```

Then proofread the SRT against the slides: names (Karlsson, never Carlson), products (MongoDB, Node.js, Raspberry Pi), code identifiers, co-speakers. Fix words only; keep every timestamp. Mark a speaker change with `>> `. Save it as `<stem>.youtube.srt` and the same text without timings as `<stem>.youtube.txt`.

## 4. Chapters

From the transcript and the slide changes, mark where each section starts. YouTube's rules: the first is `0:00`, at least three, in order, each at least 10 seconds. Use the section names the talk itself uses (its agenda slide), in Joe's words, not "Introduction to X". 4-10 chapters for a 15-50 minute talk.

## 5. Description

Voice: write the way Joe wrote `~/.claude/skills/humanizer/voice-samples/04-mongodb-schema-design-talk-page.md` (his own talk resources page) and talks in the transcript you just cleaned. First person, plain, specific. Reuse lines from the transcript and his original abstract; don't invent jokes, feelings or scenes.

```
<1-2 sentences: what the talk is and who it's for, in Joe's words. This is the part shown above "Show more".>

<Where and when: "I gave this talk at <event>, <city>, <date>." / "I recorded this in May 2020 for the conferences that went virtual that year, and gave it at <events>." Credit co-speakers here.>

<2-4 sentences from the abstract or the talk itself: what you'll see, the project, the punchline it builds to.>

Links from the talk:
<post or resource> <url>
...

Chapters
0:00 <first section>
...

More of my talks: https://www.joekarlsson.com/talk-archive/
<Organizer's upload, if any: "<Event> also posted this talk: <url>">

#<Topic> #<Topic>
```

Limits: 5,000 bytes, no `<` or `>`. At most 3 hashtags, on the last line. No em dashes (STYLE_GUIDE.md). Run `vale` and the full `humanizer` skill (voice sample above) on every draft before Joe sees it; the rubric must clear 42/50.

## 6. Title and settings

- **Title** (max 100 chars, no `<` `>`): the talk's own title, then the event and year: `IoT and JS: A Gentle Introduction to IoT | Byteconf JavaScript 2019`. A pre-recorded version with no single event gets its length instead: `(20 min)`.
- **Tags**: 5-10, mostly product and topic names people search or misspell ("MongoDB", "Mongo DB", "Raspberry Pi", "Joe Karlsson", the event). 500 characters total.
- **Settings** in the package: `"categoryId": 28` (Science & Technology), `"language": "en"`, `"captionsLanguage": "en"`, `"recordingDate"`, `"location"` (city, or omit for a home recording), `"license": "youtube"`, `"madeForKids": false`, `"alteredContent": false`, `"embeddable": true`, `"visibility": "unlisted"`, `"captionCertificate": "never aired on US TV"`, `"playlist": "Talk Archive"` (the playlist is unlisted too).

## 7. Upload

YouTube Studio in Chrome (the claude-in-chrome skill), as Joe, who's signed in. The Data API is not an option: uploads from an unverified API project are locked private, which can't embed.

1. studio.youtube.com, Create, Upload videos, pick the video from the NAS mount.
2. Details: title, description, thumbnail (`.youtube.png`), playlist, not made for kids; Show more: altered content No, tags, language, caption certification, recording date and location, license, category, allow embedding, chapters on.
3. Subtitles: upload `.youtube.srt` as "With timing".
4. Visibility: Unlisted. Save.
5. Copy the video ID into the package as `youtubeId`, and add the video to `src/data/talk-videos.json` (`owner: "joe"`) so the talk page can embed it and the `talk-videos` health check watches it.

Check the watch page loads, the captions show, and the chapters appear on the progress bar before moving to the next video. If YouTube shows a copyright claim, stop and tell Joe; don't dispute it on his behalf.
