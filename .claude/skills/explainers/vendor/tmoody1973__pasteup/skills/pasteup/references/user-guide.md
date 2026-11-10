# Pasteup: The Complete User Guide

Make halftone paper-collage stop-motion videos with Claude, for free, no subscription. This guide assumes zero technical background. If you can describe what you want in a sentence, you can use this.

---

## 1. What this actually makes

Short animated clips in a specific, premium editorial style:

- One flat, bold color background (the "field")
- Black-and-white cut-out pieces with a printed-dot (halftone) texture, like they were scissored out of a magazine
- Soft shadows under each piece so they float above the background
- Motion that BUILDS the frame: it opens empty, then pieces slide in one by one and snap into place, stop-motion style
- A short text label that sets last

Think Spotify Wrapped meets a 1960s magazine spread, animated by hand. Great for product ads, event promos, episode announcements, explainers, and stat cards.

The magic trick under the hood: the video is not made by an AI video model. The AI only makes the cut-out pieces. The animation is assembled by a small program, which means every build is exact, instant, repeatable, and costs nothing.

---

## 2. One-time setup (about 5 minutes)

If you installed this as the Claude Code plugin, just run `/pasteup:setup` and everything below happens automatically, including adding your API key. You can even pass the key directly: `/pasteup:setup YOUR_KEY`.

Manual setup, if you prefer:

1. Install the skill: drag `pasteup.skill` into Claude Code.
2. Install the helpers. In a terminal:
   ```
   pip install pillow rembg google-genai
   ```
3. Make sure ffmpeg is installed (`ffmpeg -version` to check; on Mac `brew install ffmpeg`, on Ubuntu `sudo apt install ffmpeg`).
4. Add your Gemini API key. This is the only credential the skill needs, and it powers the image generation.

### Getting and adding the Gemini key, step by step

**Get the key (free):**

1. Go to https://aistudio.google.com/apikey
2. Sign in with any Google account.
3. Click "Create API key" and copy the string it gives you. Treat it like a password.

**Add the key. Pick ONE of these:**

**Option A, the easy way (recommended): a `.env` file.** In your project folder, create a plain text file named exactly `.env` containing one line:

```
GEMINI_API_KEY=paste_your_key_here
```

The skill finds it automatically every session. You can even just tell Claude "here is my Gemini key, set it up for me" and it will create the file and add it to `.gitignore` so the key never ends up in your git history.

**Option B: set it in the terminal.**

Mac or Linux:
```
export GEMINI_API_KEY=paste_your_key_here
```
This lasts until you close the terminal. To make it permanent, add that same line to `~/.zshrc` (Mac) or `~/.bashrc` (Linux).

Windows:
```
setx GEMINI_API_KEY paste_your_key_here
```
Then close and reopen the terminal.

**Verify it worked.** Ask Claude to check, or run:
```
python scripts/generate_element.py --check-key
```
You should see "API key found. Ready to generate." If not, it prints exactly what to fix.

Two safety habits: never commit `.env` to git, and never post the key anywhere public. If a key leaks, delete it in AI Studio and make a new one; it takes 30 seconds.

---

## 3. The three ideas worth understanding

You do not need to know how anything works, but these three concepts make you dramatically better at directing it.

**The spec.** When you show Claude a reference image, it decodes it into a structured list of every visual decision: background color, dot density, edge style, shadow depth, layout, the idea, the label. Every field is independently editable. This is why "same look, but make it orange" works perfectly: one field changes, everything else stays locked.

**Element-first.** Instead of generating one finished picture, the skill generates each cut-out piece separately on a white background, then removes the white. The background color, shadows, and text are added by code. Result: your text is always crisp (it is real typography, not AI-drawn letters), and shadows are identical across every scene.

**The scene file.** The choreography lives in a small file called `scene.json`: which piece enters when, from which edge, how the label times in. Editing it and re-rendering takes seconds and costs nothing. This is where taste happens. You never have to touch it directly; you can just tell Claude "make the logo come in last" and it edits the file for you.

---

## 4. The basic workflow (copy this pattern)

**Step 1. Show or tell.** Paste a reference image you like (Pinterest is a goldmine: search "halftone collage poster") or just describe your brief.

**Step 2. Say "analyze this."** Claude returns a plain-language breakdown, ready-to-use element prompts, and the JSON spec.

**Step 3. Say "generate the elements."** Claude creates each cut-out piece and shows them to you. Approve or say what to change ("the hand looks too cartoonish, make the dots finer").

**Step 4. Say "animate it."** Claude writes the choreography and renders the clip in seconds.

**Step 5. Direct.** "Slower." "Chunkier, more handmade." "Label comes in earlier." "Hold the final frame longer." Each note is a free instant re-render.

**Step 6. Scale.** "Now make four more scenes in this exact style, one for each of these ideas: ..." The look stays locked; only the idea changes per scene.

### Don't know what you want yet? Say "director mode."

If you have a product and a deadline but no vision, say "director mode" (or in the plugin, run `/pasteup:director`). Instead of waiting for a brief, Claude interviews you in short rounds: what the clip is for and where it runs, then it PROPOSES three concept directions for you to pick from, then a style menu, a suggested piece list, label options, and a motion feel. Every question comes with a recommended default, you can answer anything with "you decide", and saying "quick mode" at any point makes Claude decide everything remaining so you just veto. It ends by reading the whole plan back for one final "lock it?" before anything generates. Reacting to strong proposals is much easier than inventing from scratch; this mode is often faster than writing a brief even when you DO know what you want.

---

## 5. Prompt examples you can steal

### Starting from a reference

> Here is a collage style I love [image]. Analyze this and break down exactly what makes it work.

> Replicate this look but for my coffee brand. The product is a matte black bag of beans, photo attached.

> Make something similar to this reference but change the idea. Keep the style identical.

> Keep everything about this spec but change only the background to a warm terracotta.

### Starting from nothing

> Make me a 10 second vertical collage stop-motion ad for a vinyl record subscription club. Bold cobalt background, one witty visual idea, label "CRATE DIGGERS WANTED".

> I need a paper-collage promo clip announcing our podcast is back for season 5. Square format, playful, retro print feel.

> Design a halftone collage scene around the idea of "getting your finances in order". Propose three concepts before generating anything.

### Directing the motion

> Animate it, but make the build feel chunkier and more handmade.
(Claude switches from animating on twos to threes.)

> The pieces should enter faster and snap harder.

> Everything enters from the bottom, like the frame is stacking upward.

> Add a full second of the finished frame at the end so it breathes before looping.

### Directing the stills

> The halftone dots are too coarse, I want it to read premium, not comic-book.

> Reroll the hand element, the fingers look wrong.

> Give the main element a thin white paper border around its edge.

### Scaling to a set

> Lock this look. Now give me a 5-scene set: one scene per benefit on this list. Same field, same cadence, same label treatment, new idea each time.

> Render all five scenes and also give me each finished frame as a still for Instagram.

---

## 6. Use cases with full worked prompts

### A. Product ad (the classic)

> Analyze this reference [image]. Then build a 10s vertical ad for my product [photo attached]. The idea: the product is the missing puzzle piece. Pieces of a halftone puzzle slide in, the product lands last in the gap, label "FINALLY FITS".

Best for: DTC products, apps, launches. The product photo is passed as a reference on every generation so it stays recognizable.

### B. Episode or content promo

> Make a square collage stop-motion promo for this week's podcast episode about Milwaukee's best fish fry. Elements: a halftone fish, a fork, a beer glass. Warm mustard field. Label "THIS WEEK: FISH FRY WARS". 6 seconds.

Best for: podcasts, radio shows, YouTube episodes, newsletters. Batch a whole season with one locked look.

### C. Event announcement

> 9:16 collage clip announcing a live show on August 14. Elements assemble into a stage scene: halftone speaker cabinets stack from the bottom, a mic drops from the top, spotlight beam slides in last. Deep violet field. Label "AUG 14. DOORS AT 7."

Best for: concerts, meetups, launches, sales. The stacking build IS the announcement drama.

### D. Explainer / how-it-works

> Three connected 8s scenes explaining how our service works. Scene 1 "YOU UPLOAD" (a halftone document slides in), scene 2 "WE AUDIT" (a magnifying glass lands on it), scene 3 "YOU SAVE" (coins stack up). Same seafoam field across all three so they cut together as one 24s explainer.

Best for: SaaS onboarding, pitch videos, landing page heroes. One idea per scene, never two.

### E. Stat or data card

> A single stat scene: giant halftone "43%" assembles digit by digit from the edges, then a small arrow piece lands pointing up, label "REVENUE, YEAR ONE". Charcoal field, electric orange arrow as the only color accent.

Best for: investor updates, reports, LinkedIn posts. Numbers as live typography always render perfectly.

### F. Music release

> Album promo, 1:1. The cover art [attached] is the final piece. Halftone instruments slide in around an empty center, then the cover lands dead center on top of everything, biggest shadow in the scene. Label is just the release date.

Best for: singles, albums, playlists, radio show branding.

### G. Quote or manifesto card

> Animate this quote as a collage build: each line of text sets like letterpress, one line per beat, with one small halftone illustration entering between lines two and three. Cream field, ink-black type.

Best for: brand values, testimonials, editorial social content.

---

## 7. Style recipes (say the name, get the look)

The skill knows these named looks. Use them as shorthand:

- **"Editorial halftone collage"**: the default. Flat bold field, fine black-and-white dots, crisp cuts, soft shadows. Reads premium.
- **"Risograph collage"**: 2 to 3 ink colors, coarse dots, slightly misaligned. Reads playful and indie.
- **"Torn-paper collage"**: rough fibrous edges, layered scraps. Reads warm and handmade.
- **"Bauhaus paper"**: flat geometric primary shapes, minimal dots, lots of empty space. Reads modernist.
- **"Vintage magazine cut-out"**: aged, yellowed, mixed printed scraps. Reads nostalgic.

Example: "Make the fish fry promo again but as a risograph collage in red and blue ink."

Motion feel is a separate dial:

- **"Smooth craft"**: animate on twos (default). Refined stop motion.
- **"Chunky handmade"**: animate on threes. Fewer poses per second, more charm.
- **"Snappy"**: shorter entrances, harder overshoot.
- **"Gentle"**: longer entrances, softer settle, longer end hold.

---

## 8. Quick answers

**How long can clips be?** As long as you want; there is no model limit because no video model is involved. 5 to 15 seconds is the sweet spot for ads.

**What formats?** Any. 9:16, 1:1, 16:9, even banner shapes. Just say it.

**Can I use my brand font?** Yes. Hand Claude the TTF file once and say "use this for all labels."

**Can I use my logo or product photo?** Yes, attach it and it gets passed as a reference on every generation so it stays consistent.

**What does it cost?** Only the image generations (Gemini API, cents per element, often free tier). The animation itself is free and instant.

**Why does my element have a weird shadow or background chunk?** The AI baked one in. Say "reroll that element, no shadow, clean white background" and the prompt gets tightened.

**Can it look more organic, less precise?** Two options: crank the handmade dials ("on threes, more jitter") for free, or ask for the paid AI-video route (fal.ai) if you truly want unpredictable wobble and accept the cost.

**Can I loop it?** Say "make it loop": the end hold gets trimmed so the final frame cuts cleanly back to the empty field.

---

## 9. A complete session, start to finish

You: *[pastes a Pinterest reference]* Analyze this.

Claude: *[breakdown, element prompts, JSON spec]*

You: Love it. Build a 10s vertical version for my sake tasting event on July 30. Elements: a halftone sake bottle, a small cup, steam curl. Label "SAKE NIGHT. 7.30." Use my logo, attached.

Claude: *[generates 3 elements, shows them]*

You: Bottle is perfect. Cup dots are too coarse, match the bottle. Steam should be thinner.

Claude: *[rerolls, shows again]*

You: Approved. Animate it, bottle first from the left, cup from the bottom, steam last from the top, then the label.

Claude: *[renders clip in seconds, shows it]*

You: Chunkier. And hold the end a full second longer.

Claude: *[re-renders instantly]*

You: Done. Now give me a square version and the finished frame as a still.

Total cost: a few cents of image generation. Total time: minutes.
