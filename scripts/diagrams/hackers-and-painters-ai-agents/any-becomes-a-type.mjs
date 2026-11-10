// "Static types came back": in a real signature from the Bechdel.io rebuild, the pencil
// scribbles out `any` and writes the real type, ShelfFilm, above it, the way you'd correct
// a word on paper. Then it all clears and the loop starts over.
import { COLORS } from '../draw.mjs';
import { n, partOf, pathOf, pencilLayer, pencil, stepped, timeline, travel } from './_sketch.mjs';

export const alt =
	'The function signature makeTape(template, film: any). A pencil scribbles out the word any and writes ShelfFilm above it, one letter at a time. Then it clears and starts again.';

const MONO = "var(--font-jetbrains-mono, 'JetBrains Mono'), Menlo, monospace";
const BEFORE = 'makeTape(template, film: ';
const TYPE = 'ShelfFilm';

function figure(f, { x, y, size, rest, scale }) {
	const cw = size * 0.6; // JetBrains Mono's advance width
	const anyX = x + BEFORE.length * cw;
	const anyW = 3 * cw;
	// A zigzag across `any`, drawn left to right
	const zig = [
		Array.from({ length: 9 }, (_, i) => ({
			x: anyX - 4 + (i * (anyW + 8)) / 8,
			y: y - size * (i % 2 ? -0.1 : 0.8),
		})),
	];
	const typeX = anyX + anyW / 2 - (TYPE.length * cw) / 2;
	const typeY = y - size * 1.15;
	const letterAt = (k) => ({ x: typeX + (k + 1) * cw, y: typeY });
	const segs = [
		{ k: 'rest', d: 0.5 },
		{ k: 'move', to: zig[0][0], d: 0.3 },
		{ k: 'strike', d: 0.7 },
		{ k: 'hold', d: 0.4 },
		{ k: 'move', to: { x: typeX, y: typeY }, d: 0.3 },
		{ k: 'write', d: TYPE.length / 7 },
		{ k: 'hold', d: 2.0 },
		{ k: 'reset', d: 0.5 },
		{ k: 'rest', d: 0.25 },
	];
	const initial = { strike: 0, letters: 0, all: 1, tip: rest, flip: 0 };
	const apply = (seg, u, st) => {
		if (seg.k === 'move') travel(st, seg.to, u);
		else if (seg.k === 'strike') {
			st.strike = u;
			st.tip = partOf(zig, u).tip;
		} else if (seg.k === 'write') {
			st.letters = Math.min(TYPE.length, Math.floor(u * TYPE.length + 1e-9) + (u === 1 ? 0 : 1));
			st.tip = letterAt(st.letters - 1);
		} else if (seg.k === 'reset') {
			st.all = 1 - u;
			travel(st, rest, u);
			if (u === 1) Object.assign(st, structuredClone(initial));
		}
	};
	const { states, dur } = timeline(segs, initial, apply);
	const over = (pick, opts) => stepped(states.map(pick), dur, opts);
	const text = (content, tx, ty, fill, extra = '') =>
		`<text x="${n(tx)}" y="${n(ty)}" font-family="${MONO}" font-size="${size}" fill="${fill}" xml:space="preserve">${content}${extra}</text>`;
	const strike = (st, anim) =>
		`<path d="${pathOf(partOf(zig, st.strike).strokes)}" fill="none" stroke="${COLORS.chalk}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${anim ? over((s) => pathOf(partOf(zig, s.strike).strokes), { attr: 'd' }) : ''}</path>`;
	const word = (st, anim) =>
		text(
			[...TYPE]
				.map(
					(c, k) =>
						`<tspan visibility="${st.letters > k ? 'visible' : 'hidden'}">${c}${anim ? over((s) => (s.letters > k ? 'visible' : 'hidden'), { attr: 'visibility' }) : ''}</tspan>`,
				)
				.join(''),
			typeX,
			typeY,
			COLORS.pink,
		);
	const signature = text(`${BEFORE}any)`, x, y, COLORS.paper);
	const live = `${signature}<g opacity="1">${over((s) => n(s.all), { attr: 'opacity' })}${strike(states[0], true)}${word(states[0], true)}</g>${pencilLayer(states, over, scale)}`;
	const done = { strike: 1, letters: TYPE.length };
	const still = `${signature}${strike(done, false)}${word(done, false)}<g transform="translate(${n(rest.x)} ${n(rest.y)})">${pencil(scale)}</g>`;
	f.raw(`<g class="anim-live">${live}</g>`);
	f.raw(`<g class="anim-still" display="none">${still}</g>`);
}

export const desktop = {
	height: 180,
	draw(f) {
		figure(f, { x: 122, y: 125, size: 22, rest: { x: 570, y: 185 }, scale: 1.1 });
	},
};

export const phone = {
	height: 190,
	draw(f) {
		figure(f, { x: 45, y: 140, size: 15, rest: { x: 300, y: 180 }, scale: 0.8 });
	},
};
