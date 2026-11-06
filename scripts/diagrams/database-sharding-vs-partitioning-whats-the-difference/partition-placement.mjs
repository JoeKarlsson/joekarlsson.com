export const alt =
	'Load-balanced partition placement. Availability group 1 holds nodes 1 and 3, and availability group 2 holds nodes 2 and 4. Each node has four master partitions and four replica partitions. Node 1 and node 2 replicate their masters to each other’s replicas, and so do node 3 and node 4, so every partition has a copy in the other availability group.';

/** A node: its name, then a row of master partitions and a row of dashed replicas. */
function node(f, { x, y, w, name, cell, gap, labelAbove }) {
	const rowsTop = labelAbove ? y + 58 : y + 46;
	const rowGap = labelAbove ? 64 : 52;
	const h = labelAbove ? 186 : 160;
	f.box({ x, y, w, h, label: undefined });
	f.text(x + 14, y + 22, name, { font: 'display', size: 20, anchor: 'start', upper: true });
	const cellsX = labelAbove ? x + 12 : x + w - 12 - (4 * cell + 3 * gap);
	['masters', 'replicas'].forEach((row, r) => {
		const rowY = rowsTop + r * rowGap;
		if (labelAbove) f.note(cellsX, rowY - 12, row, { size: 13 });
		else f.note(x + 14, rowY + cell / 2, row, { size: 14 });
		for (let i = 0; i < 4; i++) {
			f.box({
				x: cellsX + i * (cell + gap),
				y: rowY,
				w: cell,
				h: cell,
				kind: r === 0 ? 'chalk' : 'dashed',
			});
		}
	});
	return { masters: rowsTop + cell / 2, replicas: rowsTop + rowGap + cell / 2, h };
}

export const desktop = {
	height: 500,
	draw(f) {
		f.group({ x: 16, y: 34, w: 280, h: 446, label: 'Availability group 1' });
		f.group({ x: 344, y: 34, w: 280, h: 446, label: 'Availability group 2' });
		const spec = { w: 252, cell: 30, gap: 8 };
		const n1 = node(f, { x: 30, y: 56, name: 'Node 1', ...spec });
		const n3 = node(f, { x: 30, y: 300, name: 'Node 3', ...spec });
		node(f, { x: 358, y: 56, name: 'Node 2', ...spec });
		node(f, { x: 358, y: 300, name: 'Node 4', ...spec });
		// Each node's masters are copied to the replicas on its partner in the other group:
		// one arrow each way, on parallel tracks so they cross only once
		[n1, n3].forEach((n) => {
			f.arrow([
				[284, n.masters],
				[312, n.masters],
				[312, n.replicas - 6],
				[356, n.replicas - 6],
			]);
			f.arrow([
				[356, n.masters],
				[330, n.masters],
				[330, n.replicas + 6],
				[284, n.replicas + 6],
			]);
		});
		f.note(320, 486, 'masters copy to the partner node’s replicas', { anchor: 'middle', size: 14 });
	},
};

export const phone = {
	height: 560,
	draw(f) {
		f.group({ x: 4, y: 34, w: 162, h: 480, label: 'Group 1' });
		f.group({ x: 194, y: 34, w: 162, h: 480, label: 'Group 2' });
		const spec = { w: 146, cell: 26, gap: 6, labelAbove: true };
		const n1 = node(f, { x: 12, y: 52, name: 'Node 1', ...spec });
		const n3 = node(f, { x: 12, y: 300, name: 'Node 3', ...spec });
		node(f, { x: 202, y: 52, name: 'Node 2', ...spec });
		node(f, { x: 202, y: 300, name: 'Node 4', ...spec });
		[n1, n3].forEach((n) => {
			f.arrow([
				[160, n.masters],
				[172, n.masters],
				[172, n.replicas - 5],
				[200, n.replicas - 5],
			]);
			f.arrow([
				[200, n.masters],
				[186, n.masters],
				[186, n.replicas + 5],
				[160, n.replicas + 5],
			]);
		});
		f.note(180, 538, 'masters copy to the partner’s replicas', { anchor: 'middle', size: 14 });
	},
};
