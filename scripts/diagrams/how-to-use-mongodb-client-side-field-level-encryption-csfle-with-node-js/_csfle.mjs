// Shared by the write and read figures: the client app on the left, each step it
// takes as a numbered call to one service on the right, in order.

/**
 * steps: [{ to: { label, icon|logo, kind }, does: 'what the client does there' }].
 * Desktop draws the services in a column with a call into each; phone stacks them.
 */
export function steps(f, { list, phone }) {
	const rowH = phone ? 96 : 74;
	const top = 16;
	if (phone) {
		f.box({ x: 90, y: top, w: 180, h: 56, label: 'Client app', icon: 'terminal', size: 15 });
		f.line(
			[
				[30, top + 28],
				[88, top + 28],
			],
			{ color: '#ece6da', width: 3 },
		);
		list.forEach((s, i) => {
			const y = top + 80 + i * rowH;
			f.text(30, y + 18, `${i + 1}`, { font: 'display', size: 22, color: '#ff4fd8' });
			f.arrow(
				[
					[30, i === 0 ? top + 30 : y - rowH + 34],
					[30, y + 4],
				],
				{ heads: 'none' },
			);
			f.arrow([
				[30, y + 34],
				[64, y + 34],
			]);
			f.box({ x: 66, y: y + 6, w: 282, h: 56, size: 14, ...s.to });
			f.note(66, y + 76, s.does, { size: 13 });
		});
		return;
	}
	const h = list.length * rowH - 14;
	f.box({
		x: 16,
		y: top,
		w: 150,
		h,
		label: ['Client', 'app'],
		icon: 'terminal',
		size: 16,
		stack: true,
	});
	list.forEach((s, i) => {
		const y = top + i * rowH;
		f.arrow([
			[168, y + 30],
			[394, y + 30],
		]);
		f.text(186, y + 14, `${i + 1}`, { font: 'display', size: 18, color: '#ff4fd8' });
		f.note(204, y + 14, s.does, { size: 13 });
		f.box({ x: 396, y, w: 228, h: 60, size: 14, ...s.to });
	});
}
