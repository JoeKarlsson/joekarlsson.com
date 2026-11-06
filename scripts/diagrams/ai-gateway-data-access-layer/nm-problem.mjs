export const alt =
	'Three AI agents and five data sources: Salesforce, Snowflake, SAP HANA, PostgreSQL and NetSuite. Every agent connects to every source, 15 crossing lines, and each line is a hand-built custom integration that breaks when the source’s API changes.';

const SOURCES = [
	{ label: 'Salesforce', logo: 'salesforce' },
	{ label: 'Snowflake', logo: 'snowflake' },
	{ label: 'SAP HANA', logo: 'sap' },
	{ label: 'PostgreSQL', logo: 'postgresql' },
	{ label: 'NetSuite', icon: 'building-2' },
];

/** A point part of the way along a straight line, for aiming a callout at it. */
const along = ([x1, y1], [x2, y2], t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];

export const desktop = {
	height: 540,
	draw(f) {
		const agentX = [260, 380, 500];
		const sourceY = [150, 220, 290, 360, 430];
		// Each line is one integration, not a flow of data, so it has no arrowheads
		agentX.forEach((ax) =>
			sourceY.forEach((sy) =>
				f.arrow(
					[
						[ax + 50, 122],
						[208, sy + 26],
					],
					{ heads: 'none' },
				),
			),
		);
		agentX.forEach((x, i) =>
			f.box({
				x,
				y: 30,
				w: 100,
				h: 90,
				label: `Agent ${i + 1}`,
				size: 15,
				icon: 'bot',
				stack: true,
			}),
		);
		SOURCES.forEach((s, i) => f.box({ x: 20, y: sourceY[i], w: 186, h: 52, size: 15, ...s }));
		f.text(330, 470, 'Each line is a custom integration:', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(330, 494, 'hand-built, and it breaks when');
		f.note(330, 514, 'the source’s API changes');
		f.crayonArrow([450, 452], along([550, 122], [208, 456], 0.45), 24);
	},
};

export const phone = {
	height: 520,
	draw(f) {
		// Sources down the left, agents down the right, lines between the columns
		const sourceY = [20, 84, 148, 212, 276];
		const agentY = [24, 134, 244];
		agentY.forEach((ay) =>
			sourceY.forEach((sy) =>
				f.arrow(
					[
						[242, ay + 42],
						[168, sy + 25],
					],
					{ heads: 'none' },
				),
			),
		);
		SOURCES.forEach((s, i) => f.box({ x: 12, y: sourceY[i], w: 154, h: 50, size: 14, ...s }));
		agentY.forEach((y, i) =>
			f.box({
				x: 244,
				y,
				w: 104,
				h: 84,
				label: `Agent ${i + 1}`,
				size: 14,
				icon: 'bot',
				stack: true,
			}),
		);
		f.text(16, 410, 'Each line is a custom integration:', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(16, 434, 'hand-built, and it breaks when the');
		f.note(16, 454, 'source’s API changes');
		f.crayonArrow([200, 394], along([242, 286], [168, 301], 0.5), -16);
	},
};
