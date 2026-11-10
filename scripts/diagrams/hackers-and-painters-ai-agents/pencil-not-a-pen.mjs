// "It should be a pencil, not a pen": a pencil draws a sun, rubs it out, draws a star over
// the faint ghost, rubs that out, and draws a house. The erased drawings stay as ghosts, the
// way an x-ray finds the limbs a painter moved. Then it all clears and the loop starts over.
import { COLORS } from '../draw.mjs';
import {
	FPS,
	eraserOn,
	loop,
	n,
	partOf,
	pathOf,
	pencil,
	pencilLayer,
	scrubAt,
	stepped,
	timeline,
	travel,
} from './_sketch.mjs';

export const alt =
	'A pencil draws a circle, rubs it out until only a faint ghost is left, draws a star over the ghost, rubs that out too, and draws a house over both ghosts. Then the page clears and it starts again.';

const GHOST = 0.22;

function shapes(cx, cy, s) {
	const circle = loop(cx, cy, () => 58 * s, 72, 1.5 * s);
	const star = loop(
		cx,
		cy,
		(a) => (Math.round(((a + Math.PI / 2) * 5) / Math.PI) % 2 ? 28 : 68) * s,
		10,
	);
	const p = (x, y) => ({ x: cx + x * s, y: cy + y * s });
	const house = [
		[p(-55, 55), p(-55, -5), p(0, -60), p(55, -5), p(55, 55), p(-55, 55)],
		[p(-15, 55), p(-15, 15), p(15, 15), p(15, 55)],
	];
	return [[circle], [star], house];
}

function figure(f, { cx, cy, s, rest, scale }) {
	const drawings = shapes(cx, cy, s);
	const center = { x: cx, y: cy };
	const scrubStart = eraserOn(scrubAt(center, 40 * s, 8 * s, 0), scale);
	const segs = [
		{ k: 'rest', d: 0.4 },
		...[0, 1, 2].flatMap((i) => [
			{ k: 'move', to: drawings[i][0][0], flip: 0, d: 0.3 },
			{ k: 'draw', i, d: 1.4 },
			{ k: 'hold', d: i === 2 ? 2.0 : 0.7 },
			...(i < 2
				? [
						{ k: 'move', to: scrubStart, flip: 1, d: 0.3 },
						{ k: 'erase', i, d: 0.7 },
					]
				: []),
		]),
		{ k: 'reset', d: 0.5 },
		{ k: 'rest', d: 0.25 },
	];
	const initial = { frac: [0, 0, 0], op: [1, 1, 1], all: 1, tip: rest, flip: 0 };
	const apply = (seg, u, st) => {
		if (seg.k === 'move') {
			st.flip = seg.flip;
			travel(st, seg.to, u);
		} else if (seg.k === 'draw') {
			st.frac[seg.i] = u;
			st.tip = partOf(drawings[seg.i], u).tip;
		} else if (seg.k === 'erase') {
			// The eraser scrubs across the drawing while it fades to a ghost
			st.op[seg.i] = 1 - (1 - GHOST) * u;
			const frame = Math.floor(u * seg.d * FPS + 1e-9);
			st.tip = eraserOn(scrubAt(center, 40 * s, 8 * s, frame), scale);
		} else if (seg.k === 'reset') {
			st.all = 1 - u;
			travel(st, rest, u);
			if (u === 1) Object.assign(st, structuredClone(initial));
		}
	};
	const { states, dur } = timeline(segs, initial, apply);
	const over = (pick, opts) => stepped(states.map(pick), dur, opts);
	const lines = (st, anim) =>
		drawings
			.map(
				(d, i) =>
					`<path d="${pathOf(partOf(d, st.frac[i]).strokes)}" fill="none" stroke="${COLORS.chalk}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="${n(st.op[i])}">${anim ? over((x) => pathOf(partOf(d, x.frac[i]).strokes), { attr: 'd' }) + over((x) => n(x.op[i]), { attr: 'opacity' }) : ''}</path>`,
			)
			.join('');
	const live = `<g opacity="1">${over((x) => n(x.all), { attr: 'opacity' })}${lines(states[0], true)}</g>${pencilLayer(states, over, scale)}`;
	// The still: the house drawn over the two ghosts, pencil at rest
	const done = { frac: [1, 1, 1], op: [GHOST, GHOST, 1], all: 1, tip: rest };
	const still = `${lines(done, false)}<g transform="translate(${n(rest.x)} ${n(rest.y)})">${pencil(scale)}</g>`;
	f.raw(`<g class="anim-live">${live}</g>`);
	f.raw(`<g class="anim-still" display="none">${still}</g>`);
}

export const desktop = {
	height: 290,
	draw(f) {
		figure(f, { cx: 300, cy: 160, s: 1.3, rest: { x: 470, y: 245 }, scale: 1.2 });
	},
};

export const phone = {
	height: 250,
	draw(f) {
		figure(f, { cx: 160, cy: 134, s: 1.1, rest: { x: 280, y: 215 }, scale: 1 });
	},
};
