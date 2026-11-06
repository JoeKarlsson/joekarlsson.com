// Shared by this post's figures: a linked-list node drawn as a chalk scrap with a
// value cell and a pointer cell (and a prev cell for doubly linked lists).

export const NODE_H = 56;
const CELL = 40;
const INK = '#000000';

/**
 * A node with its left edge at x. kind changes the paper (pink for a new node,
 * dashed for a removed one). Returns its edges and the centres of its pointer dots.
 */
export function node(f, { x, y, value, w = 136, prev = false, kind = 'chalk', label }) {
	f.box({ x, y, w, h: NODE_H, kind });
	const ink = kind === 'dashed' ? '#ededed' : INK;
	const valueLeft = prev ? x + CELL : x;
	const valueWidth = w - CELL - (prev ? CELL : 0);
	f.text(valueLeft + valueWidth / 2, y + NODE_H / 2, `"${value}"`, {
		font: 'mono',
		size: 16,
		color: ink,
	});
	f.line(
		[
			[x + w - CELL, y + 6],
			[x + w - CELL, y + NODE_H - 6],
		],
		{ color: ink },
	);
	f.dot(x + w - CELL / 2, y + NODE_H / 2, 5, ink);
	if (prev) {
		f.line(
			[
				[x + CELL, y + 6],
				[x + CELL, y + NODE_H - 6],
			],
			{ color: ink },
		);
		f.dot(x + CELL / 2, y + NODE_H / 2, 5, ink);
	}
	if (label) f.note(x + w / 2, y - 14, label, { anchor: 'middle', size: 14 });
	return {
		left: x,
		right: x + w,
		top: y,
		bottom: y + NODE_H,
		mid: y + NODE_H / 2,
		next: [x + w - CELL / 2, y + NODE_H / 2],
		prev: [x + CELL / 2, y + NODE_H / 2],
		ink,
	};
}

/** The end of a list: a black box that says null. */
export function nil(f, { x, y, w = 64, h = NODE_H }) {
	f.box({ x, y, w, h, label: 'null', font: 'mono', size: 15 });
	return { left: x, right: x + w, top: y, bottom: y + h, mid: y + h / 2, cx: x + w / 2 };
}

/** A next pointer to the right: from the dot to the node's edge, then an arrow on to `to`. */
export function pointRight(f, from, toX) {
	f.line([from.next, [from.right, from.mid]], { color: from.ink });
	f.arrow([
		[from.right + 2, from.mid],
		[toX - 2, from.mid],
	]);
}

/** A next pointer downward: from the dot to the node's bottom, then an arrow along `path`. */
export function pointDown(f, from, path) {
	f.line([from.next, [from.next[0], from.bottom]], { color: from.ink });
	f.arrow([[from.next[0], from.bottom + 2], ...path]);
}
