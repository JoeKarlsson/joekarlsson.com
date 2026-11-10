// Dickens, 0 of 20: each of his books flies from his shelf to the author its punctuation was
// taken for. Seven land on Robert E. Howard.
import {
	COLORS,
	DATA,
	MUTED,
	PANEL,
	easeOutBack,
	label,
	layers,
	n,
	panel,
	prog,
} from './_chart.mjs';

const D = DATA.dickens;
const WHO = Object.entries(D.mistaken_for); // largest first, as the data lists them
const T0 = 0.5;
const EACH = 0.16;

export const alt =
	'Charles Dickens is 0 of 20: going by punctuation alone, none of his 20 books is matched to him. Each book flies from his shelf to the author it was taken for: Robert E. Howard 7, Alexandre Dumas 3, Fyodor Dostoyevsky 2, and one each to Jules Verne, Robert Louis Stevenson, Homer, Edgar Allan Poe, Jacob Grimm, Leo Tolstoy, John Milton and Bertrand Russell.';

function chart(f, { W, H, phone }) {
	const bw = phone ? 9 : 14;
	const bh = phone ? 13 : 20;
	const step = phone ? 13 : 20;
	// Dickens's shelf: a grid of his 20 books
	const srcCols = phone ? 10 : 4;
	const srcX = phone ? (W - srcCols * step) / 2 : 84;
	const srcY = phone ? 104 : 160;
	const src = (k) => [
		srcX + (k % srcCols) * step + bw / 2,
		srcY + Math.floor(k / srcCols) * (bh + 6) + bh / 2,
	];
	// Where they land: one row per author
	const rowTop = phone ? 186 : 92;
	const rowH = phone ? 26 : 30;
	const nameR = phone ? 196 : 400;
	const rowY = (i) => rowTop + i * rowH;
	const slot = (i, j) => [nameR + 16 + j * step + bw / 2, rowY(i)];

	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'Dickens: 0 of 20' : 'Dickens: 0 of 20, and 7 went to Robert E. Howard',
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	f.text(
		phone ? 20 : 16,
		phone ? 37 : 62,
		phone
			? 'Who his books were taken for'
			: 'Going by punctuation alone, who each of his 20 books was taken for',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
		},
	);
	f.text(srcX, srcY - (phone ? 20 : 24), 'Charles Dickens', {
		font: 'display',
		size: phone ? 16 : 18,
		anchor: 'start',
		upper: true,
		color: COLORS.pink,
	});
	WHO.forEach(([name, count], i) => {
		f.text(nameR, rowY(i), name, {
			size: 13,
			anchor: 'end',
			weight: count > 1 ? 700 : 600,
			color: count > 1 ? COLORS.paper : MUTED,
		});
	});

	let k = 0;
	const books = [];
	WHO.forEach(([, count], i) => {
		for (let j = 0; j < count; j++)
			books.push({ k: k++, to: slot(i, j), row: i, last: j === count - 1 });
	});
	const doneAt = T0 + (books.length - 1) * EACH + 0.5;

	layers(f, phone, (el) => {
		const out = [];
		// Where each book stood: an empty outline once it has flown
		books.forEach(({ k }) => {
			const [x, y] = src(k);
			out.push(
				`<rect x="${n(x - bw / 2)}" y="${n(y - bh / 2)}" width="${bw}" height="${bh}" fill="none" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="2 2"/>`,
			);
		});
		books.forEach(({ k, to, row, last }) => {
			const from = src(k);
			const at = T0 + k * EACH;
			const p = (t) => easeOutBack(prog(t, at, 0.5));
			out.push(
				el(
					'rect',
					{
						x: n(-bw / 2),
						y: n(-bh / 2),
						width: bw,
						height: bh,
						fill: COLORS.pink,
						stroke: PANEL,
						'stroke-width': 1,
					},
					{
						translate: (t) =>
							`${n(from[0] + (to[0] - from[0]) * p(t))} ${n(from[1] + (to[1] - from[1]) * p(t))}`,
					},
				),
			);
			if (last) {
				const count = WHO[row][1];
				out.push(
					label(el, to[0] + bw / 2 + 8, to[1], String(count), {
						size: 14,
						anchor: 'start',
						color: COLORS.pink,
						anims: { opacity: (t) => (t >= at + 0.5 ? 1 : 0) },
					}),
				);
			}
		});
		const [, lastY] = src(19);
		out.push(
			label(
				el,
				phone ? W / 2 : srcX + (srcCols * step) / 2 - 2,
				lastY + (phone ? 26 : 34),
				phone ? '0 named Dickens' : '0 named Dickens',
				{
					size: phone ? 15 : 17,
					color: COLORS.pink,
					anims: { opacity: (t) => (t >= doneAt ? 1 : 0) },
				},
			),
		);
		return out.join('');
	});
}

export const desktop = { height: 440, draw: (f) => chart(f, { W: 640, H: 440, phone: false }) };
export const phone = { height: 490, draw: (f) => chart(f, { W: 360, H: 490, phone: true }) };
