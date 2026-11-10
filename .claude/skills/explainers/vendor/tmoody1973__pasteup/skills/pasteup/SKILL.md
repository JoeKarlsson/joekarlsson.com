---
name: pasteup
description: >
  Pipeline for halftone paper-collage and stop-motion-graphic ads. Decodes a
  reference image into a field-editable JSON spec, generates cut-out elements directly on
  the Gemini image API (nano-banana line), then assembles them into build-from-empty stop
  motion with code: a bundled Python compositor by default, or OpenMontage's HyperFrames
  (HTML + GSAP) or Remotion runtimes. No paid video model needed; the assembly is
  deterministic. Trigger whenever the user pastes a reference to decode, replicate, or
  make "similar"; asks for a halftone, paper-cut, paper-collage, editorial-collage, or
  stop-motion-graphic look; wants a still or product turned into an animated ad or motion
  graphic; or says "analyze this", "break this down", "animate this", "make a collage
  ad", or "assemble it in". Also trigger for guided creation: "director mode", "guide
  me", "interview me", or a vague ask like "make me something cool for my brand". Use
  even when the user never says "collage" or "stop motion" but the visual is clearly
  this look.
---

# Pasteup

One pipeline, two halves: **analyze** a reference into an editable spec, then **build** on-brand elements and assemble-from-empty motion. Images come from the Gemini API directly. Motion is rendered programmatically, which makes every build guaranteed, repeatable, and free.

The look: one flat bold color field, black-and-white halftone cut-outs with clean cut edges and a soft drop shadow, one sharp idea per scene, and motion that builds the frame piece by piece instead of wobbling a finished image.

Speak in the user's language. No em dashes anywhere in output; use periods or line breaks. Keep labels and copy free of emoji unless asked.

## Architecture (how it works)

- **Images:** each cut-out element is generated separately on the Gemini image API via `scripts/generate_element.py`, then its background is knocked out with `rembg` to produce a transparent PNG.
- **Element-first:** the finished frame is composed, not generated. The color field, drop shadows, and label live in code, so they are pixel-identical across every scene in a set.
- **Motion:** `scripts/assemble.py`, a Pillow + ffmpeg stop-motion compositor. Deterministic build, animates on twos, per-pose jitter, snap with overshoot. Renders in seconds at zero API cost, so iteration is free.
- **Labels:** real typography rendered by the compositor. Any font file, pixel-exact placement, never degrades on reroll.
- **Working files:** local `scenes/<scene>/` directories holding `elements/`, `scene.json`, and rendered output.

Optional routes when the project already lives inside OpenMontage: render the same scene as HTML + GSAP through the **HyperFrames** runtime, or as a React composition through **Remotion**. See `references/motion-recipes.md`. An AI-video escape hatch (Kling or Seedance via fal.ai) exists only for when the user explicitly wants organic handmade wobble and accepts the cost.

## Setup check (run at session start, before any generation)

1. **API key.** `generate_element.py` needs a Gemini API key. Check for it before the first generation:
   ```
   python scripts/generate_element.py --check-key
   ```
   If missing, walk the user through it: get a free key at https://aistudio.google.com/apikey, then either
   - set it for the session: `export GEMINI_API_KEY=their_key` (macOS/Linux) or `setx GEMINI_API_KEY their_key` then reopen the terminal (Windows), or
   - make it permanent for this project: create a `.env` file in the project root containing `GEMINI_API_KEY=their_key`. The script reads `.env` from the current directory and the skill directory automatically. Never ask the user to paste the key into chat if they can set it themselves; if they do paste it, write it into `.env` for them and remind them the file should not be committed to git.
   The script also accepts `GOOGLE_API_KEY` as a fallback name.
2. **Dependencies.** `pip install pillow rembg google-genai` and ffmpeg on PATH. Install what is missing without asking.

## Hard defaults (do not drift)

- **Image model:** the current Gemini image model (nano-banana line). Default id `gemini-3-pro-image-preview`; verify the current id against Google's docs at session start if generation fails, model ids rotate. Requires the API key from the setup check above.
- **Elements are generated WITHOUT drop shadows and WITHOUT the color field.** Prompt each element on a plain white background, flat even lighting, no cast shadow. The compositor applies the field, the shadow, and the label so they stay identical across every element and every scene. A shadow baked into the PNG will double up and break the look.
- **Motion is code by default.** Only reach for an AI video model if the user asks for organic wobble by name and confirms they are fine paying per clip.
- **Labels are typography, never image-model text.** If the user has no brand font, default to a geometric or grotesque sans TTF they supply or a Google Fonts download (Archivo Black, Space Grotesk, and Inter Tight all suit the editorial look).

---

## PHASE A: ANALYZE (decode a reference into an editable spec)

Run this whenever a reference is in play. If the user refers to an image but none is attached, ask for it rather than guessing. This phase is model-agnostic, so specs decoded in other tools or earlier sessions port over directly.

### Mindset

The driving question is: "If I had to regenerate this exact frame from scratch, what would I need to specify?" Over-analyze on purpose, because the next request is almost always a variation ("same look, change the color field", "same style, different idea"), and that only works if every attribute is independently swappable. For every observation, name the technique and the why, not just a label. "Has texture" is nothing. "Visible halftone dot pattern on the black-and-white elements, dense at 45 lpi, which reads as printed-magazine craft instead of flat digital" is reproducible.

### Look in passes before writing

- The medium first: paper-cut, layered collage, halftone print, stop-motion frame, or flat vector pretending to be paper. This decides everything downstream.
- The color field: the single flat background color, exact hex, evenness, any subtle paper grain.
- The elements: each cut-out piece, its outline crispness, the dot pattern inside it, its drop shadow (offset, softness, opacity) that lifts it off the field.
- The idea: the concept or visual pun the scene carries. The part worth protecting in any variation.
- The composition and depth layers: foreground over midground over the flat field.
- Any label: content, font character, weight, placement, treatment.

### Output for each reference, in this exact structure

```
## [Short title describing the frame]

### Breakdown
A walk through the dimensions under clear subheadings (Medium and craft, Color field,
Elements and cut, Composition and depth, Idea, Label, Mood). Every element carries its
technique and why.

### Element prompts
One self-contained natural-language prompt PER ELEMENT, each ready to paste into the
Gemini image model: the subject, its halftone treatment, its cut edge, on a plain white
background, flat even lighting, no cast shadow, no background scene. Plus one optional
full-frame prompt for an approval still.

### JSON spec
The field-by-field collage spec (schema below) as valid JSON.
```

### The collage JSON spec

Valid JSON, no comments, no trailing commas, every field concrete, always self-contained. Never write "same as previous". `style_signature` is one compact liftable line so the user can anchor other prompts to the look without carrying the whole object.

```json
{
  "medium": "",
  "craft_style": "",
  "aspect_ratio": "",
  "style_signature": "",
  "color_field": {
    "background_hex": "",
    "evenness": "",
    "paper_grain": ""
  },
  "elements": [
    {
      "what": "",
      "role": "",
      "halftone": "",
      "cut_edge": "",
      "drop_shadow": "",
      "color_treatment": "",
      "placement": ""
    }
  ],
  "palette_hex": [],
  "composition": {
    "layout": "",
    "depth_layers": "",
    "negative_space": "",
    "balance": ""
  },
  "idea": "",
  "label": {
    "present": "",
    "content": "",
    "font_character": "",
    "weight": "",
    "placement": "",
    "treatment": ""
  },
  "mood": "",
  "references_era": "",
  "negative_prompt": ""
}
```

`references/collage-dimensions.md` holds precise vocabulary for halftone, cut, layer, color-field, and label treatments, plus a fully worked example. Read it the first time you produce a spec so the specificity is calibrated.

Note the spec's `drop_shadow` fields now map directly to compositor parameters (dx, dy, blur, opacity) rather than prompt language. Capture them as numbers where you can.

### Multiple references

Decode each fully and separately, then add one `## Shared style summary` capturing the common system: color-field logic, halftone density, cut and shadow convention, label treatment, idea density. Specific enough to seed a fresh on-brand frame.

### Follow-ups

- "Replicate it": deliver the JSON spec as is, then go to Phase B.
- "Make similar": keep structural fields (medium, craft_style, halftone, cut, color logic, composition) and vary surface ones (elements, idea, label).
- "Keep everything, change only X": rewrite only that block, re-emit the entire JSON.

---

## PHASE B: BUILD (elements, then assemble-from-empty motion)

### B0: Pick the flow

If a reference was decoded in Phase A, the spec is the blueprint. If the user has only a brief or a product, draft the spec fields first (color field, idea, label), then proceed. If the user just wants stills and no motion, stop after B3.

**Director mode.** If the user asks for guidance ("director mode", "guide me", "help me figure out what I want", "I don't know where to start"), or the brief is too vague to draft a spec from ("make me something cool"), read `references/director-mode.md` and run the staged interview it describes instead of B1. It replaces B1 entirely: the interview ends with a confirmed spec, then continue at B2. Never force the interview on a user who gave a complete brief or a reference.

**Help and examples.** If the user asks what the skill can do, wants inspiration, use cases, or example prompts ("what can I make with this", "show me examples", "give me ideas"), pull the relevant section from `references/user-guide.md` (prompt library, use cases, style recipes) and present it conversationally. Offer director mode as the next step if they still seem unsure.

### B1: Brief intake (one message, only if needed)

For users with a mostly-complete brief, fill only the gaps. If the spec and the ask already answer these, skip. Otherwise ask all at once:

1. Assets to lock to? (a product photo or logo to pass as a reference image, or generate fresh)
2. Clip duration: 5s teaser, 10s standard, 15s full.
3. Format: 9:16 vertical, 1:1 square, 16:9 horizontal. All three work; the compositor takes any canvas size.
4. How many scenes in the set?
5. The idea per scene, or "you propose them".
6. Brand font file, or pick a default.

### B2: Generate the elements

For each element in the spec, call:

```
python scripts/generate_element.py \
  --prompt "<element prompt from Phase A>" \
  --out scenes/<scene>/elements/<name>.png \
  --ref <product-or-brand-image, repeatable> \
  --knockout
```

The script hits the Gemini image API, saves the result, and (with `--knockout`) runs `rembg` to produce a transparent-background PNG. Pass the product or brand reference image in every call so subject and palette stay locked across the set.

Element prompt shape (self-contained, every time):

```
A single cut-out collage element on a plain pure-white background: [subject], rendered
as [halftone treatment, e.g. fine black-and-white round-dot halftone, ~70 lpi], with a
[cut edge, e.g. crisp machine-cut edge with a thin white paper keyline]. Flat even
lighting, no cast shadow, no drop shadow, no background scene, no color field, premium
editorial print-craft texture. The element fills most of the frame.
```

Optionally also generate ONE full-frame approval still from the Phase A full-frame prompt, purely so the user signs off on the look before you animate. It is a mood target, not a production asset.

Display each element. Reroll with an adjusted prompt until approved.

### B3: Write the scene file

Translate the collage spec into a `scene.json` for the compositor: canvas size and background hex from the spec, one entry per element with its target position, entry edge, entry time, and shadow numbers, then the label with font, size, tracking, and position. Full schema and a worked example live in `references/motion-recipes.md`. Choreography defaults that make it read as the signature look:

- One element at a time, staggered 0.35 to 0.6s apart, biggest structural piece first, the decisive detail last, label after everything.
- Each element slides in from its nearest frame edge and snaps into place with about 8 percent overshoot.
- Animate on twos (a new pose every 2 frames at 24 fps). Switch to threes for a chunkier handmade feel.
- Per-pose jitter of about 1.5px and 0.4 degrees sells the stop-motion craft. It applies to held poses, not per frame.

### B4: Render the motion

```
python scripts/assemble.py scenes/<scene>/scene.json --out scenes/<scene>/clip.mp4
```

Deterministic, seconds to render, zero API cost. Show the result. Iterate by editing `scene.json` (timing, order, jitter, shadow) and re-rendering; this loop is where the taste goes, and it is free, so use it.

**Alternative render routes** (see `references/motion-recipes.md` for the recipes):

- **HyperFrames (OpenMontage):** express the scene as HTML + GSAP with `SteppedEase` for the stop-motion cadence. Choose when the project already runs OpenMontage or the brief drifts toward kinetic type.
- **Remotion:** React composition with stepped interpolation. Choose when the user already has a Remotion pipeline (OpenMontage's default runtime) or wants the scene as a reusable component.
- **AI-video escape hatch:** Kling or Seedance via fal.ai, prompt-driven from a finished still, only when the user explicitly wants organic AI wobble and accepts per-clip cost and non-determinism. Never silently mix this route into a set rendered by code.

Pick ONE route per delivered set. Mixing renderers breaks the cadence and shadow consistency that makes the set read as a brand.

### B5: Scale

Lock the look once (color field, halftone and cut convention, shadow numbers, label treatment, cadence settings), then vary only the idea and elements per scene. Reuse the same `scene.json` skeleton with new element PNGs and positions. Consistency across scenes is what makes it read as a brand rather than one-offs.

---

## Notes and rules

- **Element-first, always.** The finished frame is composed, not generated. That is what makes shadows, field, and label identical across the whole set.
- **No shadows or fields baked into element PNGs.** If a generation comes back with a shadow or background remnant after knockout, reroll or tighten the prompt.
- **Self-contained prompts always.** The image model has no memory of earlier calls.
- **Reference image in every generation call** to keep subject and palette locked.
- **Verify the Gemini image model id** if a call errors; ids rotate. Never fail silently into a different model family.
- **One render route per delivered set.**
- **No em dashes, minimal emoji** in any drafted copy or label.
- **On failure:** explain briefly, fix the prompt or the scene file, re-render. If ffmpeg or a Python dep is missing, install it and continue.

## Reference files

- `references/collage-dimensions.md`: vocabulary and taxonomies for halftone, cut and edge, drop shadow, color field, paper grain, composition, label treatment, and named collage looks, plus one fully worked decode-and-spec example. Consult when decoding a reference or calibrating a spec.
- `references/motion-recipes.md`: the `scene.json` schema with a worked example, the stop-motion cadence spec, and the HyperFrames/GSAP, Remotion, and fal.ai escape-hatch recipes. Consult before the first render of a session.
- `references/director-mode.md`: the staged interview protocol for guiding a user from a blank page to a confirmed spec. Consult whenever director mode triggers.
- `references/user-guide.md`: the end-user guide with the prompt library, seven worked use cases, style recipes, and FAQ. Consult when the user asks for examples, ideas, or help understanding what is possible.
- `scripts/generate_element.py`: Gemini image generation plus rembg knockout.
- `scripts/assemble.py`: the stop-motion compositor (Pillow + ffmpeg).
