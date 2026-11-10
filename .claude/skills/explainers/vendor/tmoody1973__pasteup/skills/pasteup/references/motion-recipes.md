# Motion Recipes: scene.json, Cadence, and Alternative Render Routes

Consult before the first render of a session. No em dashes in any output you produce from this.

## Table of contents

1. The stop-motion cadence spec
2. scene.json schema
3. Worked example scene.json
4. HyperFrames route (HTML + GSAP, inside OpenMontage)
5. Remotion route
6. AI-video escape hatch (fal.ai)

---

## 1. The stop-motion cadence spec

What makes programmatic motion read as handmade stop motion instead of a slick tween:

- **Animate on twos.** Render at 24 fps but compute a new pose only every 2 frames (12 poses per second). On threes (8 poses per second) reads chunkier and more handmade. Never animate on ones; smooth motion kills the craft.
- **Per-pose jitter.** Each held pose gets a small random offset, about 1.5px translation and 0.4 degrees rotation, seeded so renders are reproducible. The jitter belongs to the pose, not the frame; a pose held for 2 frames shows the same jitter on both.
- **Snap with overshoot.** Elements ease out hard and overshoot their target by roughly 8 percent before settling (easeOutBack). The settle takes 1 to 2 poses.
- **Shadow settles after the piece.** The drop shadow rides slightly wider or softer during flight and contracts to its spec values on landing. Even a single-pose settle sells the paper landing on the field.
- **Stagger, never simultaneous.** One element enters at a time, 0.35 to 0.6s apart. Structural pieces first, the decisive detail second to last, the label last.
- **Hold the finished frame.** End with at least 1.2s of the fully assembled frame, plus jitter still running, so the frame keeps breathing.
- **No camera moves.** No zoom drift, no pan. The field is locked; only the pieces move.

## 2. scene.json schema

```json
{
  "canvas": {
    "width": 1080,
    "height": 1920,
    "fps": 24,
    "background_hex": "#1F3FB0",
    "grain": 0.04
  },
  "cadence": {
    "hold_frames": 2,
    "jitter_px": 1.5,
    "jitter_deg": 0.4,
    "seed": 7
  },
  "duration": 6.0,
  "elements": [
    {
      "image": "elements/hand.png",
      "x": 620, "y": 980,
      "scale": 1.0,
      "rotation": 0,
      "enter_at": 0.5,
      "enter_from": "right",
      "enter_duration": 0.6,
      "shadow": { "dx": 6, "dy": 6, "blur": 10, "opacity": 0.30 }
    }
  ],
  "label": {
    "text": "THE BIG DECISION",
    "font": "fonts/ArchivoBlack-Regular.ttf",
    "size": 88,
    "color": "#0A0A0A",
    "tracking": 6,
    "x": 80, "y": 1560,
    "enter_at": 3.4
  }
}
```

Field notes:

- `x`, `y` are the element's final center position on the canvas. `enter_from` is one of `left`, `right`, `top`, `bottom`, `none` (`none` pops the element in with a one-pose scale settle).
- `enter_path` (optional): a list of `[x, y]` bezier control points for a curved entry, in canvas coordinates. The first point is the start (put it offscreen); the element's own `x`, `y` is appended as the end point. Two points give an arc, three or more an S-curve swoop. Overrides `enter_from`. Example: `"enter_path": [[-200, 900], [400, 100]]` swoops in from the lower left through a high apex. The easeOutBack overshoot rides the path's end tangent, so pieces still snap and settle.
- `enter_spin` (optional): degrees of extra rotation the piece carries at launch, unwinding to its resting `rotation` as it lands. 180 reads as a tossed paper card, 360 as a rolling record.
- `shadow` numbers come straight from the Phase A spec's `drop_shadow` field. Keep them consistent across elements at the same depth layer; vary them only to imply different float heights.
- `grain` is 0 to about 0.08; it overlays fine noise so the field does not read as pure digital flat. 0.03 to 0.05 matches "fine uncoated-paper fiber".
- `label.tracking` is extra pixels between characters. Knockout treatment (field color showing through) is `color` set to the background hex on a solid label plate; for a plain solid label just pick the ink color.
- Everything is optional except canvas, duration, and at least one element; sensible defaults apply.

## 3. Worked example scene.json

The chess-hand frame from the collage-dimensions worked example, choreographed:

```json
{
  "canvas": { "width": 1080, "height": 1920, "fps": 24, "background_hex": "#1F3FB0", "grain": 0.04 },
  "cadence": { "hold_frames": 2, "jitter_px": 1.5, "jitter_deg": 0.4, "seed": 11 },
  "duration": 6.5,
  "elements": [
    {
      "image": "elements/hand.png",
      "x": 660, "y": 1020, "scale": 1.0,
      "enter_at": 0.6, "enter_from": "right", "enter_duration": 0.6,
      "shadow": { "dx": 6, "dy": 6, "blur": 10, "opacity": 0.30 }
    },
    {
      "image": "elements/chess_king.png",
      "x": 700, "y": 760, "scale": 1.0,
      "enter_at": 1.5, "enter_from": "top", "enter_duration": 0.5,
      "shadow": { "dx": 3, "dy": 3, "blur": 5, "opacity": 0.35 }
    }
  ],
  "label": {
    "text": "THE BIG DECISION",
    "font": "fonts/ArchivoBlack-Regular.ttf",
    "size": 84, "color": "#0A0A0A", "tracking": 6,
    "x": 80, "y": 1560, "enter_at": 2.6
  }
}
```

Timeline it produces: empty cobalt field breathing for 0.6s, hand slides in from the right and snaps, king drops from the top and lands on the hand with its tighter sharper shadow, label sets lower-left, then the finished frame holds with jitter to 6.5s.

## 4. HyperFrames route (HTML + GSAP, inside OpenMontage)

HyperFrames is one of OpenMontage's two composition runtimes (the other is Remotion). It renders HTML + CSS + GSAP timelines to video. Choose it when the project already runs inside OpenMontage or the brief drifts toward kinetic typography.

The mapping from scene.json:

- The color field is a full-bleed `div` with `background: <hex>` plus a CSS noise overlay for grain.
- Each element is an absolutely positioned `img` with `filter: drop-shadow(dx dy blur rgba(0,0,0,opacity))`.
- The build is a GSAP timeline. The stop-motion cadence comes from `SteppedEase`:

```js
const tl = gsap.timeline();
tl.from("#hand", {
  x: 900, duration: 0.6,
  ease: SteppedEase.config(7)   // 7 poses over 0.6s, about on twos at 24fps
}, 0.6);
tl.from("#king", { y: -800, duration: 0.5, ease: SteppedEase.config(6) }, 1.5);
tl.from("#label", { y: 24, autoAlpha: 0, duration: 0.25, ease: SteppedEase.config(3) }, 2.6);
```

- Overshoot: wrap the final pose with a short `back.out(1.4)` settle, itself stepped, or add one extra keyframe 8 percent past target.
- Jitter: a repeating stepped micro-timeline per element (`gsap.to(el, { x: "+=1.5", rotation: 0.4, repeat: -1, yoyo: true, ease: SteppedEase.config(1), duration: 0.16 })`).
- Respect OpenMontage's runtime lock: if the proposal locked `render_runtime`, do not swap runtimes silently; surface it and let the user choose.

## 5. Remotion route

Choose when the user already has a Remotion pipeline or wants the scene as a reusable React component. The cadence trick is quantizing the frame before interpolating:

```tsx
const frame = useCurrentFrame();
const pose = Math.floor(frame / 2) * 2;            // on twos
const t = spring({ frame: pose - enterFrame, fps, config: { damping: 9 } }); // overshoot
const x = interpolate(t, [0, 1], [startX, targetX]);
const rand = (n: number) => (noise(seed + poseIndex * n) - 0.5);
// per-pose jitter: rand(1) * 3 px, rand(2) * 0.8 deg
```

Shadow via `filter: drop-shadow(...)` on the layer, label as a real `<h1>` with the brand font loaded through `@remotion/google-fonts` or a local TTF.

## 6. AI-video escape hatch (fal.ai)

Only when the user explicitly wants organic AI wobble and accepts per-clip cost and non-determinism. Generate a finished still first (composite one frame with assemble.py at the final pose, or generate a full-frame still), then drive Kling or Seedance through fal.ai with the finished still as reference and a prompt describing the build:

```
Paper-collage stop-motion assembly. Open on an empty flat [color] field, no elements.
One by one the cut-out halftone pieces slide in from the frame edges and snap into
place with a crisp stop-motion cadence, soft drop shadows settling under each piece as
it lands, until the full composition is assembled: [elements and final layout]. Label
"[label]" appears last. Flat even lighting, premium print-craft texture, slight paper
grain, no camera wobble, no zoom drift.
```

Never silently mix this route into a set rendered by code; the cadence will not match.
