// Shared by this post's animated figures: a pink pencil that draws chalk lines at hand speed.
// Motion is worked out as a timeline, sampled once per drawing at 12 fps, and emitted as
// discrete SMIL animations (the same approach as doom-mcp-server/go-to-walk.mjs), with the
// .anim-live / .anim-still layers that motion.css swaps under reduced motion and pause.
import { COLORS } from '../draw.mjs';

export const FPS = 12;

/** The moving pieces: on desktop a live layer plus its still, on a phone the still alone
 *  (phones get the finished drawing, never the motion, like the site's other post figures). */
export function layers(f, phone, live, still) {
	if (phone) {
		f.raw(still);
		return;
	}
	f.raw(`<g class="anim-live">${live}</g>`);
	f.raw(`<g class="anim-still" display="none">${still}</g>`);
}
export const n = (v) => Math.round(v * 10) / 10;

/** One SMIL animation stepping through a value per drawing; nothing when it never changes. */
export function stepped(values, dur, { attr, type }) {
	const keep = values.map((v, i) => i === 0 || v !== values[i - 1]);
	if (keep.filter(Boolean).length === 1) return '';
	const vals = values.filter((_, i) => keep[i]).join(';');
	const times = values
		.map((_, i) => (i / values.length).toFixed(4))
		.filter((_, i) => keep[i])
		.join(';');
	const tag = type
		? `animateTransform attributeName="transform" type="${type}"`
		: `animate attributeName="${attr}"`;
	return `<${tag} calcMode="discrete" values="${vals}" keyTimes="${times}" dur="${n(dur)}s" repeatCount="indefinite"/>`;
}

const strokeLength = (pts) =>
	pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

/** The first `frac` of a drawing made of strokes (the pencil lifts between strokes). */
export function partOf(strokes, frac) {
	const total = strokes.reduce((sum, s) => sum + strokeLength(s), 0);
	let left = total * Math.min(1, Math.max(0, frac));
	const out = [];
	let tip = strokes[0][0];
	for (const s of strokes) {
		if (left <= 0) break;
		const done = [s[0]];
		tip = s[0];
		for (let i = 1; i < s.length && left > 0; i++) {
			const leg = Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
			const u = Math.min(1, left / leg);
			tip = {
				x: s[i - 1].x + (s[i].x - s[i - 1].x) * u,
				y: s[i - 1].y + (s[i].y - s[i - 1].y) * u,
			};
			done.push(tip);
			left -= leg;
		}
		out.push(done);
	}
	return { strokes: out, tip };
}

export const pathOf = (strokes) =>
	strokes.length && strokes[0].length > 1
		? strokes.map((s) => 'M' + s.map((p) => `${n(p.x)},${n(p.y)}`).join(' L')).join(' ')
		: 'M0,0';

/** A closed loop of points around a center, with a slow hand wobble. */
export function loop(cx, cy, radiusAt, steps = 72, wobble = 0) {
	return Array.from({ length: steps + 1 }, (_, i) => {
		const a = -Math.PI / 2 + (i / steps) * Math.PI * 2;
		const r = radiusAt(a) + wobble * (Math.sin(3 * a) + 0.5 * Math.sin(5 * a));
		return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
	});
}

const TILT = (-40 * Math.PI) / 180;
const ERASER = 76; // the eraser's center along the pencil's body

/** The pencil, tip at the origin, body up and to the right. */
export function pencil(scale) {
	const ink = COLORS.ink;
	const pink = COLORS.pink;
	return `<g transform="rotate(-40) scale(${scale})" stroke="${pink}" stroke-width="2" stroke-linejoin="round"><path d="M0 0 L16 -6 L16 6 Z" fill="${ink}"/><path d="M0 0 L5 -2 L5 2 Z" fill="${pink}"/><rect x="16" y="-6" width="54" height="12" fill="${ink}"/><rect x="70" y="-6" width="12" height="12" fill="${pink}"/></g>`;
}

/** Where the tip goes so that, flipped over, the eraser sits on point p. */
export const eraserOn = (p, scale) => ({
	x: p.x + ERASER * scale * Math.cos(TILT),
	y: p.y + ERASER * scale * Math.sin(TILT),
});

/** Scrub positions, one per drawing (left, center, right, center), so 12 fps can't strobe it. */
export const scrubAt = (center, ax, ay, frame) => {
	const k = [-1, 0, 1, 0][frame % 4];
	return { x: center.x + ax * k, y: center.y + ay * k };
};

/** Move the tip from where it is toward `to`, lifting off the paper on the way. */
export function travel(st, to, u) {
	const from = st.tip;
	st.tip = {
		x: from.x + (to.x - from.x) * u,
		y: from.y + (to.y - from.y) * u - 18 * Math.sin(Math.PI * u),
	};
}

/** The pencil layer: translated to the tip, flipped over to erase. */
export function pencilLayer(states, over, scale) {
	const at = (st) => `${n(st.tip.x)} ${n(st.tip.y)}`;
	const flip = (st) => String(st.flip ? 180 : 0);
	return `<g transform="translate(${at(states[0])})">${over(at, { type: 'translate' })}<g transform="rotate(${flip(states[0])})">${over(flip, { type: 'rotate' })}${pencil(scale)}</g></g>`;
}

/** Walk a list of timed segments; `apply(seg, u, state)` updates the state for a segment at progress u. */
export function timeline(segs, initial, apply) {
	const total = segs.reduce((sum, s) => sum + s.d, 0);
	const frames = Math.round(total * FPS);
	const states = [];
	for (let i = 0; i < frames; i++) {
		let t = i / FPS;
		const state = structuredClone(initial);
		for (const seg of segs) {
			const u = Math.min(1, t / seg.d);
			apply(seg, u, state);
			if (t < seg.d) break;
			t -= seg.d;
		}
		states.push(state);
	}
	return { states, dur: frames / FPS };
}
