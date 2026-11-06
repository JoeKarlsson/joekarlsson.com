export const alt =
	'A fresh RAG pipeline: CloudQuery syncs Confluence, Notion and wiki pages daily into PostgreSQL with pgvector, which the RAG engine searches to answer questions in a knowledge assistant.';

const SOURCES = [
	{ label: 'Confluence', logo: 'confluence' },
	{ label: 'Notion', logo: 'notion' },
	{ label: 'Wiki', icon: 'book-open' },
];

export const desktop = {
	height: 280,
	draw(f) {
		f.group({ x: 16, y: 36, w: 608, h: 72, label: 'Knowledge sources' });
		SOURCES.forEach((s, i) =>
			f.box({ x: 28 + i * 200, y: 52, w: 184, h: 44, kind: 'ink', size: 13, ...s }),
		);
		f.arrow([
			[96, 110],
			[96, 160],
		]);
		f.note(108, 135, 'daily sync', { size: 13, weight: 700 });
		f.box({ x: 16, y: 162, w: 160, h: 84, kind: 'chalk', wordmark: 'cloudquery' });
		f.arrow([
			[178, 204],
			[196, 204],
		]);
		f.box({
			x: 198,
			y: 162,
			w: 150,
			h: 84,
			label: 'PostgreSQL',
			sub: '+ pgvector',
			logo: 'postgresql',
			size: 13,
			subSize: 13,
		});
		f.arrow(
			[
				[350, 204],
				[368, 204],
			],
			{ heads: 'both' },
		);
		f.note(359, 262, 'search', { anchor: 'middle', size: 12 });
		f.box({
			x: 370,
			y: 162,
			w: 120,
			h: 84,
			kind: 'pink',
			label: ['RAG', 'engine'],
			icon: 'brain',
			size: 14,
		});
		f.arrow(
			[
				[492, 204],
				[508, 204],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 510,
			y: 162,
			w: 114,
			h: 84,
			label: 'Assistant',
			icon: 'bot',
			size: 13,
			stack: true,
		});
	},
};

export const phone = {
	height: 600,
	draw(f) {
		f.group({ x: 8, y: 36, w: 344, h: 108, label: 'Knowledge sources' });
		SOURCES.forEach((s, i) =>
			f.box({ x: 18 + i * 110, y: 52, w: 104, h: 80, kind: 'ink', size: 13, stack: true, ...s }),
		);
		f.arrow([
			[180, 146],
			[180, 180],
		]);
		f.note(194, 163, 'daily sync', { size: 13, weight: 700 });
		f.box({ x: 70, y: 182, w: 220, h: 64, kind: 'chalk', wordmark: 'cloudquery' });
		f.arrow([
			[180, 248],
			[180, 282],
		]);
		f.box({
			x: 60,
			y: 284,
			w: 240,
			h: 64,
			label: 'PostgreSQL',
			sub: '+ pgvector',
			logo: 'postgresql',
			size: 14,
			subSize: 13,
		});
		f.arrow(
			[
				[180, 350],
				[180, 394],
			],
			{ heads: 'both' },
		);
		f.note(194, 372, 'search', { size: 13 });
		f.box({
			x: 80,
			y: 396,
			w: 200,
			h: 64,
			kind: 'pink',
			label: ['RAG', 'engine'],
			icon: 'brain',
			size: 15,
		});
		f.arrow(
			[
				[180, 462],
				[180, 496],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 60,
			y: 498,
			w: 240,
			h: 64,
			label: ['Knowledge', 'assistant'],
			icon: 'bot',
			size: 15,
		});
	},
};
