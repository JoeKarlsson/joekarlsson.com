/**
 * The animated issue card's timeline: where every crayon mark, the crayon texture and the
 * photo sit at each frame of the loop. scripts/generate-issue-cards.mjs poses the card with it
 * and screenshots each frame into card.gif (email) and card.mp4 (social uploads).
 *
 * Number cards: the marks lift off, redraw stroke by stroke, and boil (swap crayon textures)
 * the whole time. Photo cards: the photo eases in and back out while the marks redraw; the GIF
 * holds the photo still, since a zoom repaints every pixel and took the GIF from 99KB to 2MB.
 * Both loops start and end on the still card, since link previews and Outlook show frame 1 only.
 */

export const FPS = 15;
// 64 frames is 8 full boil cycles (2 frames on each of 4 textures), so the loop has no seam
const LOOP_FRAMES = { number: 64, photo: 78 };
// Seed 4 is the still card's texture (the #crayon filter in generate-issue-cards.mjs)
const BOIL_SEEDS = [4, 11, 23, 37];
const FADE_MS = 200;
const REDRAW = {
	number: { liftAt: 1400, drawAt: 1700, staggerMs: 350, drawMs: 700 },
	photo: { liftAt: 1500, drawAt: 1700, staggerMs: 300, drawMs: 900 },
};

const clamp = (x) => Math.min(Math.max(x, 0), 1);
const progress = (t, from, to) => clamp((t - from) / (to - from));
const easeOut = (x) => 1 - (1 - x) ** 3;

export const frameCount = (kind) => LOOP_FRAMES[kind];

/** The card's pose at one frame: each mark's drawn share (0-1) and opacity, the texture seed, the photo zoom */
export function cardPose(kind, frame, markCount, { stillPhoto = false } = {}) {
	const t = (frame * 1000) / FPS;
	const { liftAt, drawAt, staggerMs, drawMs } = REDRAW[kind];
	const marks = Array.from({ length: markCount }, (_, i) => {
		if (t < liftAt + FADE_MS)
			return { drawn: 1, opacity: 1 - progress(t, liftAt, liftAt + FADE_MS) };
		const start = drawAt + i * staggerMs;
		return { drawn: easeOut(progress(t, start, start + drawMs)), opacity: 1 };
	});
	if (kind === 'number') {
		return { marks, seed: BOIL_SEEDS[Math.floor(frame / 2) % BOIL_SEEDS.length], photoScale: 1 };
	}
	if (stillPhoto) return { marks, seed: BOIL_SEEDS[0], photoScale: 1 };
	const swell = Math.sin((Math.PI * frame) / LOOP_FRAMES.photo) ** 2;
	return { marks, seed: BOIL_SEEDS[0], photoScale: 1 + 0.07 * swell };
}
