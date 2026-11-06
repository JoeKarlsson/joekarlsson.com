export const alt =
	'A people table with columns user, first and last, and shard key (first). Its rows spread across four partitions by first name: people_0 holds the three alex rows and tom, people_1 the two johns, people_2 nancy and people_3 amanda. Rows with the same first name always land on the same partition.';

const SCHEMA = [
	'create table people (',
	'  user varchar(24),',
	'  first varchar(24),',
	'  last varchar(24),',
	'  shard key (first)',
	');',
];
const COLUMNS = ['user', 'first', 'last'];
const PARTITIONS = [
	[
		'people_0',
		[
			['areece', 'alex', 'reece'],
			['anick', 'alex', 'nick'],
			['amace', 'alex', 'mace'],
			['tholmes', 'tom', 'holmes'],
		],
	],
	[
		'people_1',
		[
			['jdoe', 'john', 'doe'],
			['jsmith', 'john', 'smith'],
		],
	],
	['people_2', [['ndrew', 'nancy', 'drew']]],
	['people_3', [['amonson', 'amanda', 'monson']]],
];

export const desktop = {
	height: 580,
	draw(f) {
		f.code({ x: 20, y: 16, w: 300, lines: SCHEMA, highlight: [4] });
		f.text(360, 52, 'Same first name,', { font: 'serif', size: 18, anchor: 'start' });
		f.text(360, 76, 'same partition:', { font: 'serif', size: 18, anchor: 'start' });
		f.note(360, 102, 'all three alex rows sit in people_0');
		f.group({ x: 16, y: 216, w: 608, h: 346, label: 'people' });
		const spots = [
			[40, 236],
			[340, 236],
			[40, 436],
			[340, 436],
		];
		PARTITIONS.forEach(([title, rows], i) =>
			f.table({
				x: spots[i][0],
				y: spots[i][1],
				title,
				columns: COLUMNS,
				rows,
				colW: 82,
				highlight: 1,
			}),
		);
		// Callout last, so it sits on top of the tables
		f.crayonArrow([420, 120], [236, 250], -30);
	},
};

export const phone = {
	height: 860,
	draw(f) {
		f.code({ x: 16, y: 16, w: 328, lines: SCHEMA, highlight: [4] });
		f.text(16, 212, 'Same first name, same partition:', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(16, 236, 'all three alex rows sit in people_0', { size: 14 });
		f.group({ x: 8, y: 274, w: 344, h: 570, label: 'people' });
		let y = 290;
		PARTITIONS.forEach(([title, rows]) => {
			y += f.table({ x: 34, y, title, columns: COLUMNS, rows, colW: 96, highlight: 1 }) + 14;
		});
		f.crayonArrow([290, 246], [240, 298], 10);
	},
};
