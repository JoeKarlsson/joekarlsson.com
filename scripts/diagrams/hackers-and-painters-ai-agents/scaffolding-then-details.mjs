// "Scaffolding is easy. The details are the tricky part": a whole scaffold goes up in two
// beats, then the pencil spends the rest of the loop on one window, drawing it crooked,
// rubbing it out, trying again, and finally getting it square.
import { COLORS } from '../draw.mjs';
import {
	layers,
	FPS,
	eraserOn,
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
	'A scaffold of poles and planks appears in two quick beats. Then a pencil draws one window in a single bay, crooked, rubs it out, draws it crooked again, rubs it out, and finally draws it square with a cross in the middle. Then everything clears and it starts again.';

function figure(f, { phone, x0, x1, ground, top, cols, rows, bay, rest, scale }) {
	const xs = Array.from({ length: cols }, (_, i) => x0 + ((x1 - x0) * i) / (cols - 1));
	const ys = Array.from({ length: rows }, (_, i) => top + ((ground - top) * i) / rows);
	const poles = [
		`M${x0 - 30},${ground} H${x1 + 30}`,
		...xs.map((x) => `M${n(x)},${ground} V${top}`),
	];
	const planks = [
		...ys.map((y) => `M${x0},${n(y)} H${x1}`),
		...xs.slice(1).map((x, i) => `M${n(xs[i])},${n(ys[1])} L${n(x)},${n(ys[0])}`),
	];
	// The window sits in one bay; `bay` is its column and row
	const L = xs[bay[0]];
	const R = xs[bay[0] + 1];
	const T = ys[bay[1]];
	const B = ys[bay[1] + 1] ?? ground;
	const w = (R - L) * 0.68;
	const h = (B - T) * 0.74;
	const cx = (L + R) / 2;
	const cy = (T + B) / 2;
	const p = (dx, dy) => ({ x: cx + dx * w, y: cy + dy * h });
	const tries = [
		[[p(-0.5, -0.42), p(0.45, -0.58), p(0.55, 0.5), p(-0.42, 0.44), p(-0.5, -0.42)]],
		[[p(-0.55, -0.5), p(0.5, -0.45), p(0.42, 0.55), p(-0.5, 0.48), p(-0.55, -0.5)]],
		[
			[p(-0.5, -0.5), p(0.5, -0.5), p(0.5, 0.5), p(-0.5, 0.5), p(-0.5, -0.5)],
			[p(0, -0.5), p(0, 0.5)],
			[p(-0.5, 0), p(0.5, 0)],
		],
	];
	const center = { x: cx, y: cy };
	const scrubStart = eraserOn(scrubAt(center, w * 0.45, h * 0.15, 0), scale);
	const segs = [
		{ k: 'rest', d: 0.4 },
		{ k: 'poles', d: 0.25 },
		{ k: 'planks', d: 0.5 },
		...[0, 1, 2].flatMap((i) => [
			{ k: 'move', to: tries[i][0][0], flip: 0, d: 0.3 },
			{ k: 'draw', i, d: i === 2 ? 2.2 : 1.7 },
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
	const initial = {
		poles: 0,
		planks: 0,
		frac: [0, 0, 0],
		op: [1, 1, 1],
		all: 1,
		tip: rest,
		flip: 0,
	};
	const apply = (seg, u, st) => {
		if (seg.k === 'poles') st.poles = 1;
		else if (seg.k === 'planks') st.planks = 1;
		else if (seg.k === 'move') {
			st.flip = seg.flip;
			travel(st, seg.to, u);
		} else if (seg.k === 'draw') {
			st.frac[seg.i] = u;
			st.tip = partOf(tries[seg.i], u).tip;
		} else if (seg.k === 'erase') {
			st.op[seg.i] = 1 - u;
			const frame = Math.floor(u * seg.d * FPS + 1e-9);
			st.tip = eraserOn(scrubAt(center, w * 0.45, h * 0.15, frame), scale);
		} else if (seg.k === 'reset') {
			st.all = 1 - u;
			travel(st, rest, u);
			if (u === 1) Object.assign(st, structuredClone(initial));
		}
	};
	const { states, dur } = timeline(segs, initial, apply);
	const over = (pick, opts) => stepped(states.map(pick), dur, opts);
	const chalk = `fill="none" stroke="${COLORS.chalk}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
	const scaffold = (st, anim) =>
		`<path d="${poles.join(' ')}" ${chalk} opacity="${st.poles}">${anim ? over((x) => x.poles, { attr: 'opacity' }) : ''}</path>` +
		`<path d="${planks.join(' ')}" ${chalk} opacity="${st.planks}">${anim ? over((x) => x.planks, { attr: 'opacity' }) : ''}</path>`;
	const windows = (st, anim) =>
		tries
			.map(
				(d, i) =>
					`<path d="${pathOf(partOf(d, st.frac[i]).strokes)}" ${chalk} opacity="${n(st.op[i])}">${anim ? over((x) => pathOf(partOf(d, x.frac[i]).strokes), { attr: 'd' }) + over((x) => n(x.op[i]), { attr: 'opacity' }) : ''}</path>`,
			)
			.join('');
	const live = `<g opacity="1">${over((x) => n(x.all), { attr: 'opacity' })}${scaffold(states[0], true)}${windows(states[0], true)}</g>${pencilLayer(states, over, scale)}`;
	// The still: the scaffold with the finished window, the two crooked tries rubbed out
	const done = { poles: 1, planks: 1, frac: [0, 0, 1], op: [0, 0, 1], tip: rest };
	const still = `${scaffold(done, false)}${windows(done, false)}<g transform="translate(${n(rest.x)} ${n(rest.y)})">${pencil(scale)}</g>`;
	layers(f, phone, live, still);
}

export const desktop = {
	height: 260,
	draw(f) {
		figure(f, {
			x0: 120,
			x1: 480,
			ground: 225,
			top: 35,
			cols: 4,
			rows: 3,
			bay: [1, 1],
			rest: { x: 545, y: 205 },
			scale: 1.2,
		});
	},
};

export const phone = {
	height: 240,
	draw(f) {
		figure(f, {
			phone: true,
			x0: 50,
			x1: 270,
			ground: 205,
			top: 30,
			cols: 4,
			rows: 3,
			bay: [1, 1],
			rest: { x: 294, y: 234 },
			scale: 0.8,
		});
	},
};
