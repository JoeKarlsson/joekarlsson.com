import { DESKTOP, PHONE, callout, doc, docHeight, id } from './_doc.mjs';

export const alt =
	'One-to-many: a product document in the products collection, the left-handed smoke shifter from Acme Corp, catalog number 1234, holds a parts array of three ObjectIds. Each id points to its own document in the parts collection, starting with part 123-aff-456, a #4 grommet. The product keeps the ids, not the parts themselves.';

const PRODUCT = [
	'name: "left-handed smoke shifter"',
	'manufacturer: "Acme Corp"',
	'catalog_number: "1234"',
	'parts: [',
	{ chip: id('0101'), to: 'right' },
	{ chip: id('0102'), to: 'right' },
	{ chip: id('0103'), to: 'right' },
	']',
];
const PARTS = [
	[`_id: ${id('0101')}`, 'partno: "123-aff-456"', 'name: "#4 grommet"', '…'],
	[`_id: ${id('0102')}`, '…'],
	[`_id: ${id('0103')}`, '…'],
];

/** The parts collection: its documents stacked from y, 12 apart. */
function partsCollection(f, { x, y, w, s }) {
	const h = PARTS.reduce((sum, rows) => sum + docHeight(rows, s) + 12, -12);
	f.group({ x, y: y - 10, w, h: h + 20, label: 'parts' });
	return PARTS.map((rows) => {
		const part = doc(f, { x: x + 10, y, w: w - 20, rows, s });
		y = part.bottom + 12;
		return part;
	});
}

export const desktop = {
	height: 446,
	draw(f) {
		const s = DESKTOP;
		f.group({ x: 16, y: 40, w: 330, h: docHeight(PRODUCT, s) + 20, label: 'products' });
		const product = doc(f, { x: 26, y: 50, w: 310, rows: PRODUCT, s });
		// The first part's _id lines up with the first id, so that arrow runs straight
		const top = product.chips[0].y - s.pad - s.line / 2;
		const parts = partsCollection(f, { x: 396, y: top, w: 228, s });
		const lanes = [null, 380, 362];
		product.chips.forEach((chip, i) => {
			const to = [parts[i].x - 2, parts[i].idY];
			f.arrow(
				i === 0
					? [[chip.edge, chip.y], to]
					: [[chip.edge, chip.y], [lanes[i], chip.y], [lanes[i], to[1]], to],
			);
		});
		callout(f, 26, 336, ['An array of ids,', 'not the parts themselves'], {
			arrow: [[200, 322], [170, product.bottom + 6], -16],
		});
	},
};

export const phone = {
	height: 690,
	draw(f) {
		const s = PHONE;
		f.group({ x: 16, y: 40, w: 328, h: docHeight(PRODUCT, s) + 20, label: 'products' });
		const product = doc(f, { x: 26, y: 50, w: 308, rows: PRODUCT, s });
		callout(f, 16, product.bottom + 34, ['An array of ids, not the parts'], {
			arrow: [[250, product.bottom + 24], [200, product.bottom + 6], 12],
		});
		const parts = partsCollection(f, { x: 16, y: product.bottom + 104, w: 288, s });
		// On a phone the ids share one line down the right edge, branching to each part
		product.chips.forEach((chip, i) =>
			f.arrow([
				[chip.edge, chip.y],
				[348, chip.y],
				[348, parts[i].idY],
				[parts[i].right + 2, parts[i].idY],
			]),
		);
	},
};
