// Shared by this post's three "approach" figures: the trade-offs panel beside each.

/** A container listing what an approach is good for and where it falls short. */
export function tradeoffs(f, { x, y, w, good = [], bad = [], size = 15 }) {
	const rows = (good.length ? good.length + 1 : 0) + bad.length + 1;
	const h = 34 + rows * (size + 9) + (good.length ? 10 : 0);
	f.group({ x, y, w, h, label: 'Trade-offs' });
	let rowY = y + 26;
	const section = (title, items) => {
		f.text(x + 14, rowY, title, { size, anchor: 'start', weight: 700 });
		rowY += size + 9;
		items.forEach((item) => {
			f.note(x + 14, rowY, item, { size });
			rowY += size + 9;
		});
		rowY += 10;
	};
	if (good.length) section('Good for', good);
	section('Falls short', bad);
	return h;
}
