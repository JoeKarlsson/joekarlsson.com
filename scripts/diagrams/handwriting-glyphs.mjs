#!/usr/bin/env node
// Pen paths for writing text in stroke by stroke, in a real font's own letter shapes.
//
//   node scripts/diagrams/handwriting-glyphs.mjs <font.woff2|ttf> <out.json>
//
// For every glyph: draw it big, thin it to a one-pixel centre line (Zhang-Suen), then
// walk that line the way a pen would: start at the top-left free end, keep going in the
// smoothest direction, and when a stroke ends lift the pen and jump to the nearest free
// end left. A figure reveals each glyph by drawing a fat mask stroke along these paths,
// so the letters appear stroke by stroke but stay the real font.
// Adapted from Lemo-Opuscar's styles/sketchnote/demo/tools/skeleton.py (MIT,
// github.com/lemomo-ai/lemo-opuscar), ported from Python to Node.
//
// Output: { unitsPerEm, ascent, descent, glyphs: { char: { advance, outline, strokes, half } } }
// in em units, origin at the glyph's left end of the baseline, y down. outline is SVG
// path data; strokes are [x, y, x, y, ...] polylines in drawing order; half is the
// half-width of the font's stroke, the mask stroke's minimum half-width.

import { readFileSync, writeFileSync } from 'node:fs';

import { create } from 'fontkitten';
import sharp from 'sharp';

const SIZE = 220; // pixels per em when tracing
const PAD = 12;
const CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '’‘“”–';

/** Zhang-Suen thinning, in place. img: Uint8Array of 0/1, w x h, with a 1-px empty border. */
export function thin(img, w, h) {
	const at = (x, y) => img[y * w + x];
	let changed = true;
	while (changed) {
		changed = false;
		for (const step of [0, 1]) {
			const remove = [];
			for (let y = 1; y < h - 1; y++) {
				for (let x = 1; x < w - 1; x++) {
					if (!at(x, y)) continue;
					const p = [
						at(x, y - 1),
						at(x + 1, y - 1),
						at(x + 1, y),
						at(x + 1, y + 1),
						at(x, y + 1),
						at(x - 1, y + 1),
						at(x - 1, y),
						at(x - 1, y - 1),
					];
					const neighbours = p.reduce((a, b) => a + b, 0);
					if (neighbours < 2 || neighbours > 6) continue;
					let transitions = 0;
					for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) transitions++;
					if (transitions !== 1) continue;
					const [p2, , p4, , p6, , p8] = p;
					if (step === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue;
					remove.push(y * w + x);
				}
			}
			for (const i of remove) img[i] = 0;
			if (remove.length) changed = true;
		}
	}
	return img;
}

const STEPS = [
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1],
	[0, -1],
	[1, -1],
];

/** Walk a thinned image into pen strokes: lists of [x, y] pixels in drawing order. */
export function walk(img, w, h) {
	const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && img[y * w + x] === 1;
	const seen = new Uint8Array(w * h);
	const free = (x, y) => on(x, y) && !seen[y * w + x];
	const degree = (x, y) => STEPS.filter(([dx, dy]) => on(x + dx, y + dy)).length;
	const pixels = [];
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (on(x, y)) pixels.push([x, y]);
	const strokes = [];
	let pen = [0, 0];
	for (;;) {
		const left = pixels.filter(([x, y]) => !seen[y * w + x]);
		if (!left.length) break;
		// Prefer a free end (one neighbour); a closed loop like "o" has none, so take its top-left
		const ends = left.filter(([x, y]) => degree(x, y) <= 1);
		const pool = ends.length ? ends : left;
		const first = strokes.length
			? pool.reduce((best, p) =>
					Math.hypot(p[0] - pen[0], p[1] - pen[1]) < Math.hypot(best[0] - pen[0], best[1] - pen[1])
						? p
						: best,
				)
			: pool.reduce((best, p) => (p[0] + p[1] < best[0] + best[1] ? p : best));
		const stroke = [first];
		seen[first[1] * w + first[0]] = 1;
		let [x, y] = first;
		let heading = null;
		for (;;) {
			const options = STEPS.filter(([dx, dy]) => free(x + dx, y + dy));
			if (!options.length) break;
			// The smoothest next step: the one that turns least from where the pen is heading
			const turn = ([dx, dy]) =>
				heading === null
					? 0
					: Math.abs(
							Math.atan2(
								Math.sin(Math.atan2(dy, dx) - heading),
								Math.cos(Math.atan2(dy, dx) - heading),
							),
						);
			const [dx, dy] = options.reduce((best, s) => (turn(s) < turn(best) ? s : best));
			// A 2-px-thick corner leaves a stair-step pixel beside the next one; mark it seen so it
			// isn't drawn later as a stub stroke. Only a dead end: one that leads on is the path.
			for (const [ox, oy] of options) {
				if ((ox === dx && oy === dy) || Math.abs(ox - dx) > 1 || Math.abs(oy - dy) > 1) continue;
				const [rx, ry] = [x + ox, y + oy];
				// It leads on if it reaches a free pixel the pen can't reach from here or the next one
				const near = (nx, ny, px, py) => Math.abs(nx - px) <= 1 && Math.abs(ny - py) <= 1;
				const leadsOn = STEPS.some(([sx, sy]) => {
					const [nx, ny] = [rx + sx, ry + sy];
					return free(nx, ny) && !near(nx, ny, x, y) && !near(nx, ny, x + dx, y + dy);
				});
				if (!leadsOn) seen[ry * w + rx] = 1;
			}
			x += dx;
			y += dy;
			seen[y * w + x] = 1;
			// Heading smoothed over the last few pixels, so pixel stair-steps don't steer the pen
			stroke.push([x, y]);
			const back = stroke[Math.max(0, stroke.length - 5)];
			heading = Math.atan2(y - back[1], x - back[0]);
		}
		pen = [x, y];
		// A full stop or an i's dot thins to a pixel or two: keep it as a dot the pen taps down
		strokes.push(stroke.length > 1 ? stroke : [first, first]);
	}
	return strokes;
}

/** Ramer-Douglas-Peucker: drop points within eps of the line. */
export function simplify(points, eps) {
	if (points.length < 3) return points;
	const [ax, ay] = points[0];
	const [bx, by] = points[points.length - 1];
	const len = Math.hypot(bx - ax, by - ay) || 1;
	let far = 0;
	let index = 0;
	for (let i = 1; i < points.length - 1; i++) {
		const [px, py] = points[i];
		const d = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len;
		if (d > far) [far, index] = [d, i];
	}
	if (far <= eps) return [points[0], points[points.length - 1]];
	return [
		...simplify(points.slice(0, index + 1), eps).slice(0, -1),
		...simplify(points.slice(index), eps),
	];
}

/** Largest distance from the centre line to the glyph's edge: half the font's stroke width. */
function halfWidth(fill, skeleton, w, h) {
	let half = 0;
	for (let y = 0; y < h; y++)
		for (let x = 0; x < w; x++) {
			if (!skeleton[y * w + x]) continue;
			let r = 1;
			while (r < 60) {
				let hit = false;
				for (let a = 0; a < 16 && !hit; a++) {
					const px = Math.round(x + Math.cos((a / 16) * Math.PI * 2) * r);
					const py = Math.round(y + Math.sin((a / 16) * Math.PI * 2) * r);
					if (px < 0 || py < 0 || px >= w || py >= h || !fill[py * w + px]) hit = true;
				}
				if (hit) break;
				r++;
			}
			half = Math.max(half, r);
		}
	return half;
}

async function traceGlyph(font, glyph) {
	const scale = SIZE / font.unitsPerEm;
	const top = font.ascent * scale;
	const w = Math.ceil(glyph.advanceWidth * scale) + PAD * 2;
	const h = Math.ceil((font.ascent - font.descent) * scale) + PAD * 2;
	const outline = glyph.path.toSVG();
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#000"/><path fill="#fff" transform="translate(${PAD} ${PAD + top}) scale(${scale} ${-scale})" d="${outline}"/></svg>`;
	const { data } = await sharp(Buffer.from(svg))
		.greyscale()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const fill = Uint8Array.from(data, (v) => (v > 127 ? 1 : 0));
	const skeleton = thin(Uint8Array.from(fill), w, h);
	const em = ([x, y]) => [
		Math.round(((x - PAD) / SIZE) * 1000) / 1000,
		Math.round(((y - PAD - top) / SIZE) * 1000) / 1000,
	];
	const strokes = walk(skeleton, w, h).map((s) => simplify(s, 0.8).map(em).flat());
	// The outline flipped to y down, in em units, for the visible letter
	const flipped = glyph.path.scale(1 / font.unitsPerEm, -1 / font.unitsPerEm).toSVG();
	return {
		advance: Math.round((glyph.advanceWidth / font.unitsPerEm) * 1000) / 1000,
		outline: flipped.replace(/-?\d*\.\d+/g, (v) => String(Math.round(Number(v) * 1000) / 1000)),
		strokes,
		half: Math.round((halfWidth(fill, skeleton, w, h) / SIZE) * 1000) / 1000,
	};
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const [fontPath, outPath] = process.argv.slice(2);
	if (!fontPath || !outPath) {
		console.error('Usage: node scripts/diagrams/handwriting-glyphs.mjs <font> <out.json>');
		process.exit(2);
	}
	const font = create(readFileSync(fontPath));
	const glyphs = {};
	for (const char of CHARS) {
		const [glyph] = font.glyphsForString(char);
		if (!glyph || (glyph.id === 0 && char !== ' '))
			throw new Error(`${fontPath} has no glyph for "${char}"`);
		glyphs[char] = await traceGlyph(font, glyph);
	}
	writeFileSync(
		outPath,
		JSON.stringify({
			unitsPerEm: font.unitsPerEm,
			ascent: font.ascent / font.unitsPerEm,
			descent: font.descent / font.unitsPerEm,
			glyphs,
		}),
	);
	console.log(`${Object.keys(glyphs).length} glyphs → ${outPath}`);
}
