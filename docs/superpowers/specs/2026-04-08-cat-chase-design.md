# Cat Chase Interactive Element

A cursor-following ASCII animation where a cat chases a computer mouse across a section of the homepage. The surprise is realizing _you_ are the mouse.

## Placement

Between the Featured Posts and Recent Posts sections on the homepage (`src/pages/index.astro`). This is a natural scroll break and doesn't interrupt content flow.

## Visual Design

### Container

- Horizontal band, approximately 80-100px tall
- Terminal-themed background (matches `surface-0` or `surface-1`)
- Subtle top/bottom borders using existing color palette
- Optional: faint comment text like `// cat.exe running...` in dim gray

### ASCII Art

**Mouse** (follows cursor):

```
<:3 )~~
```

**Cat** (chases mouse):

```
=^._.^=
```

Both rendered in monospace font, using the site's existing terminal text colors (coral for cat, teal or gray for mouse).

### Layout

- Both characters positioned absolutely within the band
- Horizontal movement only (vertically centered in the band)
- Characters maintain readable size on all screen widths

## Animation Behavior

### Mouse Movement

- Tracks cursor's X position when cursor is within or near the section
- Smooth easing (not 1:1 snapping) - mouse lags slightly behind cursor
- Constrained to the horizontal bounds of the container (with padding)
- When cursor leaves the section: mouse drifts toward the nearest edge

### Cat Movement

- Chases the mouse's position with additional lag (always behind)
- "Hunting" feel: accelerates when mouse slows or stops
- Never fully catches the mouse while cursor is moving
- When cursor is still for 2+ seconds: cat creeps closer incrementally
- Maintains minimum gap (doesn't overlap the mouse)

### Easing Values (starting points, tune as needed)

- Mouse follow speed: `0.08-0.12` lerp factor
- Cat chase speed: `0.04-0.06` lerp factor
- Cat "creep" when idle: move 5-10px closer every 500ms

## Mobile Behavior

No cursor on mobile devices, so the interaction shifts to autonomous animation:

- Mouse wanders left/right on its own (gentle sine wave or random walk)
- Cat chases autonomously
- Same visual style, just self-driving
- Detect mobile via `window.matchMedia('(hover: none)')` or similar

## Accessibility

- Wrap in a decorative `<div role="presentation">` or `aria-hidden="true"` - this is visual flair, not content
- Respect `prefers-reduced-motion`: show static cat and mouse (no animation)
- No keyboard interaction required (purely decorative)

## Technical Approach

### Implementation

- New Astro component: `src/components/CatChase.astro`
- Inline `<script>` tag (matches existing terminal script pattern in `index.astro`)
- CSS in a scoped `<style>` block or inline styles
- Use `requestAnimationFrame` for smooth animation loop

### State

- `mouseX`: current mouse character position
- `catX`: current cat character position
- `targetX`: cursor X position (or autonomous target on mobile)
- `isIdle`: boolean tracking if cursor has been still
- `idleTimer`: timeout for creep behavior

### Event Listeners

- `mousemove` on document (update `targetX` when cursor is in/near section)
- `mouseleave` on section (trigger edge-flee behavior)
- Visibility/intersection observer to pause when off-screen (performance)

## File Changes

1. **Create** `src/components/CatChase.astro` - the component
2. **Edit** `src/pages/index.astro` - import and place between Featured Posts and Recent Posts sections

## Out of Scope

- Sound effects
- Multiple cats
- Vertical movement
- Touch/drag interaction on mobile (autonomous only)
- Persistent state (cat position resets on page load)

## Success Criteria

- Visitor scrolls to section, moves cursor, and has a "wait, it's following me" moment
- Animation is smooth (60fps) and doesn't impact page performance
- Works gracefully on mobile with autonomous animation
- Respects reduced motion preferences
- Fits the existing terminal/brutalist aesthetic
