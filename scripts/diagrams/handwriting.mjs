// Handwritten callouts: pink Kalam that writes itself in stroke by stroke, then its crayon
// arrow draws on (DECISIONS 2026-11-27). The letters are the font's own outlines, revealed
// by a fat mask stroke along each glyph's centre line (handwriting/kalam-bold.json, from
// handwriting-glyphs.mjs), so no font loads in the page. Each pen move speeds up and brakes
// like a plotter's (Lemo-Opuscar, styles/pen-plotter/demo/plot.js, MIT). On twos, like the
// site's other animated figures; .anim-live and .anim-still swap under reduced motion.
import { readFileSync } from 'node:fs';

const GLYPHS = JSON.parse(
	readFileSync(new URL('./handwriting/kalam-bold.json', import.meta.url), 'utf8'),
).glyphs;

export const FPS = 12;
// Quick enough to finish while a reader scrolls past (Joe, 2026-11-27: the first cut, about
// 4 s a note, was "way too slow if you're scrolling through it")
const START = 0.15; // a beat before the pen lands
const ARROW_GAP = 0.1;
const ARROW = 0.3;
const NEXT = 0.15; // between one callout and the next
/** Seconds to write a note: about 45 letters a second, 0.5 s to 1.2 s a note. */
export const writeTime = (chars) => Math.min(1.2, Math.max(0.5, chars * 0.022));

const n = (v) => Math.round(v * 100) / 100;

/** Seconds to cover length L at cruise speed v and acceleration a, from rest to rest. */
export const moveTime = (L, v, a) =>
	L <= 0 ? 0 : L >= (v * v) / a ? L / v + v / a : 2 * Math.sqrt(L / a);

/** Distance covered after tau seconds of that move. */
export function moveDistance(L, v, a, tau) {
	if (L <= 0) return 0;
	const T = moveTime(L, v, a);
	tau = Math.max(0, Math.min(T, tau));
	const ta = L >= (v * v) / a ? v / a : Math.sqrt(L / a);
	if (tau < ta) return 0.5 * a * tau * tau;
	if (tau > T - ta) return L - 0.5 * a * (T - tau) ** 2;
	return 0.5 * a * ta * ta + a * ta * (tau - ta);
}

/** Width of a line of handwriting at this size. */
export function handwritingWidth(content, size) {
	return [...content].reduce((w, ch) => w + glyph(ch).advance * size, 0);
}

function glyph(ch) {
	const g = GLYPHS[ch];
	if (!g) throw new Error(`handwriting has no glyph for "${ch}"`);
	return g;
}

/** The letters and pen strokes of one line, its left end on the baseline at (x, y). */
function layout(content, x, y, size) {
	const letters = [];
	const strokes = [];
	for (const ch of content) {
		const g = glyph(ch);
		if (ch !== ' ') {
			letters.push(
				`<path d="${g.outline}" transform="translate(${n(x)} ${n(y)}) scale(${size})"/>`,
			);
			for (const s of g.strokes) {
				const pts = [];
				for (let i = 0; i < s.length; i += 2) pts.push([x + s[i] * size, y + s[i + 1] * size]);
				const len = pts
					.slice(1)
					.reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
				strokes.push({ pts, len: len || 0.5, half: g.half * size });
			}
		}
		x += g.advance * size;
	}
	return { letters, strokes };
}

/** One SMIL animation stepping through a value per drawing; nothing when it never changes. */
function stepped(values, dur, attr) {
	const keep = values.map((v, i) => i === 0 || v !== values[i - 1]);
	if (keep.filter(Boolean).length === 1) return '';
	const vals = values.filter((_, i) => keep[i]).join(';');
	const times = values
		.map((_, i) => (i / values.length).toFixed(4))
		.filter((_, i) => keep[i])
		.join(';');
	return `<animate attributeName="${attr}" calcMode="discrete" values="${vals}" keyTimes="${times}" dur="${n(dur)}s" repeatCount="indefinite"/>`;
}

/**
 * The live and still layers for a figure's callouts, written in the order given.
 * Each callout: { x, y (baseline), content, size, color, arrow: { d, markup } }, where
 * arrow.d is the curve the arrow follows and arrow.markup the crayon arrow itself.
 * The loop holds the finished frame long enough to read every callout, then clears.
 */
export function handwritingLayers(callouts, { id, width, height }) {
	// A note is its lines up to the one with the arrow (or the last): the whole note shares one
	// writeTime, so a three-line note is as quick as a one-line one
	const chars = (c) => c.content.replace(/\s/g, '').length;
	const noteChars = [];
	let run = [];
	callouts.forEach((c, i) => {
		run.push(i);
		if (c.arrow || i === callouts.length - 1) {
			const total = run.reduce((sum, k) => sum + chars(callouts[k]), 0);
			for (const k of run) noteChars[k] = total;
			run = [];
		}
	});
	let t = START;
	const timed = callouts.map((c, i) => {
		const { letters, strokes } = layout(c.content, c.x, c.y, c.size);
		const write = (writeTime(noteChars[i]) * chars(c)) / noteChars[i];
		const ink = strokes.reduce((sum, s) => sum + s.len, 0);
		// Each stroke gets its share of the time by length, and speeds up and brakes within it
		for (const s of strokes) {
			const T = (write * s.len) / ink;
			const ramp = T * 0.2;
			s.t0 = t;
			s.v = s.len / (T - ramp);
			s.a = s.v / ramp;
			t += T;
		}
		const arrowAt = t + ARROW_GAP;
		// The next line of the same note follows at once; a new note waits for this one's arrow
		const endsNote = c.arrow || i === callouts.length - 1;
		if (endsNote) t = arrowAt + (c.arrow ? ARROW : 0) + NEXT;
		return { ...c, letters, strokes, arrowAt, chars: chars(c) };
	});
	const readAll = timed.reduce((sum, c) => sum + c.chars / 15, 0) + 1.5;
	const frames = Math.ceil((t + Math.max(4, readAll)) * FPS);
	const dur = frames / FPS;
	const at = (i) => i / FPS;
	const over = (pick) => Array.from({ length: frames }, (_, i) => pick(at(i)));

	const live = timed.map((c, k) => {
		const reveal = c.strokes
			.map((s) => {
				const d = 'M' + s.pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' L');
				const offset = over((time) => n(1 - moveDistance(s.len, s.v, s.a, time - s.t0) / s.len));
				const shown = over((time) => (time >= s.t0 ? 'visible' : 'hidden'));
				return `<path d="${d}" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1" visibility="hidden" fill="none" stroke="#fff" stroke-width="${n(s.half * 3.4 + 1)}" stroke-linecap="round" stroke-linejoin="round">${stepped(offset, dur, 'stroke-dashoffset')}${stepped(shown, dur, 'visibility')}</path>`;
			})
			.join('');
		const arrowOffset = over((time) =>
			n(1 - moveDistance(1, 1 / (ARROW * 0.8), 1 / (ARROW * 0.8 * ARROW * 0.2), time - c.arrowAt)),
		);
		const arrowHead = over((time) => (time >= c.arrowAt + ARROW ? 'visible' : 'hidden'));
		const box = `maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"`;
		return [
			`<mask id="${id}-write-${k}" ${box}>${reveal}</mask>`,
			`<g mask="url(#${id}-write-${k})" fill="${c.color}">${c.letters.join('')}</g>`,
			c.arrow &&
				`<mask id="${id}-arrow-${k}" ${box}><path d="${c.arrow.d}" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round">${stepped(arrowOffset, dur, 'stroke-dashoffset')}</path><circle cx="${c.arrow.tip[0]}" cy="${c.arrow.tip[1]}" r="20" fill="#fff" visibility="hidden">${stepped(arrowHead, dur, 'visibility')}</circle></mask>`,
			c.arrow && `<g mask="url(#${id}-arrow-${k})">${c.arrow.markup}</g>`,
		]
			.filter(Boolean)
			.join('');
	});
	const still = timed.map(
		(c) => `<g fill="${c.color}">${c.letters.join('')}</g>${c.arrow ? c.arrow.markup : ''}`,
	);
	return {
		live: `<g class="anim-live">${live.join('')}</g>`,
		still: `<g class="anim-still" display="none">${still.join('')}</g>`,
	};
}
