// Shared by this post's five relationship figures, so they read as a set: a
// collection is a group named for it, a document is a chalk scrap of monospace
// fields, embedded data is a pink scrap inside its document, and a reference is a
// black ObjectId chip with a chalk arrow to the document it points at.

import { COLORS, measure } from '../draw.mjs';

export const DESKTOP = { size: 14, chipSize: 13, line: 22, chip: 34, pad: 12, indent: 18 };
export const PHONE = { size: 13, chipSize: 13, line: 21, chip: 32, pad: 10, indent: 16 };

/** The abbreviated ObjectId the post's examples end in: id('0101') is ObjectId("…0101") */
export const id = (tail) => `ObjectId("…${tail}")`;

const rowHeight = (row, s) =>
	typeof row === 'string' ? s.line : row.chip ? s.chip : row.embed.length * s.line + 14 + 6;

/**
 * One document at x, y, w wide. rows: a field as a string ('name: "Kate"'), a
 * reference as { chip: id('0401'), key: 'host:', to: 'right' } (no key indents it
 * as an array item; `to` runs an ink stub from the chip to that edge, where its
 * arrow starts), or embedded data as { embed: ['street: ...', 'city: ...'] }.
 * Returns its edges, the centre y of its _id row, and each chip's { y, edge }.
 */
export function doc(f, { x, y, w, rows, s }) {
	const h = docHeight(rows, s);
	f.box({ x, y, w, h, kind: 'chalk' });
	const fits = (text, left, right) => {
		if (left + measure(text, s.size, 'mono') > right)
			f.issues.push(`"${text}" runs past its ${w}px document`);
	};
	const field = (text, left, cy, right = x + w - 10) => {
		fits(text, left, right);
		f.text(left, cy, text, { font: 'mono', size: s.size, color: COLORS.ink, anchor: 'start' });
	};
	const out = { x, y, w, h, right: x + w, bottom: y + h, chips: [], idY: null };
	let top = y + s.pad;
	for (const row of rows) {
		const rh = rowHeight(row, s);
		const cy = top + rh / 2;
		if (typeof row === 'string') {
			field(row, x + 12, cy);
			if (row.startsWith('_id')) out.idY = cy;
		} else if (row.chip) {
			let left = x + 12 + (row.key ? 0 : s.indent);
			if (row.key) {
				field(row.key, left, cy);
				left += measure(`${row.key} `, s.size, 'mono');
			}
			const chipW = measure(row.chip, s.chipSize, 'mono') + 24;
			if (left + chipW > x + w - 6) f.issues.push(`the ${row.chip} chip runs past its document`);
			f.box({
				x: left,
				y: cy - (rh - 8) / 2,
				w: chipW,
				h: rh - 8,
				kind: 'ink',
				label: row.chip,
				font: 'mono',
				size: s.chipSize,
			});
			// The stub is part of the document, so the arrow it leads to starts at the edge
			const edge = row.to === 'left' ? x : x + w;
			if (row.to)
				f.line([
					[row.to === 'left' ? left : left + chipW, cy],
					[edge, cy],
				]);
			out.chips.push({ y: cy, edge: row.to === 'left' ? edge - 2 : edge + 2 });
		} else {
			const ex = x + 12 + s.indent;
			const ew = w - 24 - s.indent;
			f.box({ x: ex, y: top + 3, w: ew, h: rh - 6, kind: 'pink' });
			row.embed.forEach((line, i) =>
				field(line, ex + 10, top + 10 + s.line * (i + 0.5), ex + ew - 6),
			);
		}
		top += rh;
	}
	return out;
}

/** A handwritten callout: lines starting at x, y, one under another, the arrow on the last. */
export function callout(f, x, y, lines, { size = 19, arrow } = {}) {
	lines.forEach((line, i) =>
		f.handwrite(x, y + i * (size + 5), line, {
			size,
			arrow: i === lines.length - 1 ? arrow : undefined,
		}),
	);
}

/** Total height of a document with these rows, to lay out before drawing. */
export const docHeight = (rows, s) =>
	s.pad * 2 + rows.reduce((sum, row) => sum + rowHeight(row, s), 0);
