export const alt =
	'A ClickHouse materialized view: on every insert into the source table (columns A, B and C), it runs SELECT A, MAX(B) AS D, AVG(C) AS E FROM source GROUP BY A, and writes the result into the target table, whose columns are A, D and E.';

const SQL = [
	'CREATE MATERIALIZED VIEW mv',
	'TO target AS',
	'SELECT A,',
	'  MAX(B) AS D,',
	'  AVG(C) AS E',
	'FROM source',
	'GROUP BY A',
];

function table(f, { x, y, w, title, cols, kind }) {
	f.group({ x, y, w, h: 74, label: title });
	const cw = (w - 24 - 8 * (cols.length - 1)) / cols.length;
	cols.forEach((c, i) =>
		f.box({
			x: x + 12 + i * (cw + 8),
			y: y + 16,
			w: cw,
			h: 44,
			kind,
			label: c,
			font: 'mono',
			size: 15,
		}),
	);
}

export const desktop = {
	height: 370,
	draw(f) {
		table(f, { x: 16, y: 40, w: 220, title: 'source table', cols: ['A', 'B', 'C'], kind: 'chalk' });
		f.arrow([
			[238, 77],
			[276, 77],
		]);
		f.code({ x: 278, y: 20, w: 252, lines: SQL, size: 13, highlight: [3, 4] });
		f.arrow([
			[404, 190],
			[404, 254],
		]);
		f.note(416, 222, 'writes', { size: 13 });
		table(f, {
			x: 294,
			y: 278,
			w: 220,
			title: 'target table',
			cols: ['A', 'D', 'E'],
			kind: 'pink',
		});
		f.note(16, 170, 'Runs on every insert', { size: 14, weight: 700 });
		f.note(16, 192, 'into the source table.', { size: 14 });
	},
};

export const phone = {
	height: 520,
	draw(f) {
		table(f, { x: 8, y: 40, w: 344, title: 'source table', cols: ['A', 'B', 'C'], kind: 'chalk' });
		f.arrow([
			[180, 116],
			[180, 150],
		]);
		f.note(194, 133, 'every insert runs', { size: 13 });
		f.code({ x: 40, y: 152, w: 280, lines: SQL, size: 13, highlight: [3, 4] });
		f.arrow([
			[180, 322],
			[180, 410],
		]);
		f.note(194, 366, 'writes', { size: 13 });
		table(f, { x: 8, y: 436, w: 344, title: 'target table', cols: ['A', 'D', 'E'], kind: 'pink' });
	},
};
