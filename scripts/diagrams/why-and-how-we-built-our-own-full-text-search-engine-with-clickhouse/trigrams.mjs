export const alt =
	'Splitting the word "search" into trigrams: a window three letters wide slides along s, e, a, r, c, h one letter at a time, giving sea, ear, arc and rch.';

const LETTERS = ['s', 'e', 'a', 'r', 'c', 'h'];
const TRIGRAMS = ['sea', 'ear', 'arc', 'rch'];

/** The letters in cells, each trigram a bracket under its three letters, then the list. */
function trigrams(f, { x, cell, gap, y }) {
	const step = cell + gap;
	LETTERS.forEach((l, i) =>
		f.box({
			x: x + i * step,
			y,
			w: cell,
			h: cell,
			kind: 'chalk',
			label: l,
			font: 'mono',
			size: 20,
		}),
	);
	TRIGRAMS.forEach((t, i) => {
		const left = x + i * step + 4;
		const right = x + (i + 2) * step + cell - 4;
		const by = y + cell + 22 + i * 30;
		f.line(
			[
				[left, by - 10],
				[left, by],
				[right, by],
				[right, by - 10],
			],
			{ color: '#ff4fd8', width: 2.5 },
		);
		f.text(right + 12, by, `"${t}"`, { font: 'mono', size: 15, anchor: 'start', color: '#ededed' });
	});
	return y + cell + 22 + TRIGRAMS.length * 30;
}

export const desktop = {
	height: 300,
	draw(f) {
		f.note(16, 30, 'word', { size: 14, weight: 700 });
		const end = trigrams(f, { x: 120, cell: 56, gap: 10, y: 48 });
		f.note(16, end + 24, 'trigrams', { size: 14, weight: 700 });
		f.text(120, end + 24, '["sea", "ear", "arc", "rch"]', {
			font: 'mono',
			size: 16,
			anchor: 'start',
			color: '#ededed',
		});
	},
};

export const phone = {
	height: 330,
	draw(f) {
		f.note(16, 24, 'word', { size: 14, weight: 700 });
		const end = trigrams(f, { x: 16, cell: 40, gap: 6, y: 40 });
		f.note(16, end + 24, 'trigrams', { size: 14, weight: 700 });
		f.text(16, end + 48, '["sea", "ear", "arc", "rch"]', {
			font: 'mono',
			size: 15,
			anchor: 'start',
			color: '#ededed',
		});
	},
};
