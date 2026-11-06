export const alt =
	'A 4-gram window sliding across "Hello_world!" one character at a time: Hell, ello, llo_, lo_w, and so on through orld and rld!. Each 4-character piece becomes its own entry in the index.';

const TEXT = 'Hello_world!';
const GRAMS = [0, 1, 2, 3, 8];

/**
 * One row per step: the text in monospace with the 4-character window in pink and
 * underlined, and the 4-gram it yields at the end of the row.
 */
function windows(f, { x, y, rowH, size }) {
	const ch = size * 0.6;
	GRAMS.forEach((start, row) => {
		const ry = y + row * rowH;
		if (row === GRAMS.length - 1) f.note(x, ry - rowH / 2, '\u2026', { size: 16 });
		const before = TEXT.slice(0, start);
		const win = TEXT.slice(start, start + 4);
		const after = TEXT.slice(start + 4);
		if (before) f.text(x, ry, before, { font: 'mono', size, anchor: 'start', color: '#a3a3a3' });
		f.text(x + before.length * ch, ry, win, {
			font: 'mono',
			size,
			anchor: 'start',
			color: '#ff4fd8',
			weight: 700,
		});
		if (after)
			f.text(x + (start + 4) * ch, ry, after, {
				font: 'mono',
				size,
				anchor: 'start',
				color: '#a3a3a3',
			});
		f.line(
			[
				[x + start * ch, ry + size * 0.75],
				[x + (start + 4) * ch, ry + size * 0.75],
			],
			{ color: '#ff4fd8', width: 3 },
		);
		f.arrow([
			[x + TEXT.length * ch + 14, ry],
			[x + TEXT.length * ch + 50, ry],
		]);
		f.box({
			x: x + TEXT.length * ch + 54,
			y: ry - size,
			w: size * 4,
			h: size * 2,
			kind: 'chalk',
			label: win,
			font: 'mono',
			size,
		});
	});
}

export const desktop = {
	height: 330,
	draw(f) {
		windows(f, { x: 16, y: 40, rowH: 56, size: 24 });
		f.note(16, 316, 'Window of 4, moving one character at a time', { size: 14 });
	},
};

export const phone = {
	height: 300,
	draw(f) {
		windows(f, { x: 8, y: 30, rowH: 48, size: 18 });
		f.note(8, 288, 'Window of 4, one character at a time', { size: 13 });
	},
};
