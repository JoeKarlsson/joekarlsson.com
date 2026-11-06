// Shared by this post's three search-strategy figures: search terms at the top,
// then a column of steps they flow through, as chips in a container.

/**
 * terms: how many search-term boxes; perTerm: steps each term runs on its own
 * (drawn under each term); shared: steps all terms go through together.
 */
export function strategy(f, { terms = 3, perTerm = [], shared, width, note }) {
	const phone = width < 400;
	const gap = 12;
	const termW = (width - 32 - gap * (terms - 1)) / terms;
	const xs = Array.from({ length: terms }, (_, i) => 16 + i * (termW + gap));
	let y = 16;
	xs.forEach((x, i) =>
		f.box({
			x,
			y,
			w: termW,
			h: phone ? 96 : 56,
			label: ['Search', `term ${i + 1}`],
			icon: 'search',
			size: 14,
			stack: phone,
		}),
	);
	y += phone ? 96 : 56;
	perTerm.forEach((step) => {
		xs.forEach((x) =>
			f.arrow([
				[x + termW / 2, y + 2],
				[x + termW / 2, y + 30],
			]),
		);
		y += 32;
		xs.forEach((x) =>
			f.box({
				x,
				y,
				w: termW,
				h: 52,
				kind: 'ink',
				size: 13,
				...step,
				sub: phone ? undefined : step.sub,
			}),
		);
		y += 52;
	});
	const cx = width / 2;
	const boxW = Math.min(280, width - 80);
	xs.forEach((x) =>
		f.arrow([
			[x + termW / 2, y + 2],
			[x + termW / 2, y + 22],
			[cx, y + 22],
			[cx, y + 44],
		]),
	);
	y += 46;
	shared.forEach((step, i) => {
		const last = i === shared.length - 1;
		f.box({
			x: cx - boxW / 2,
			y,
			w: boxW,
			h: 56,
			kind: last ? 'pink' : 'chalk',
			size: 15,
			...step,
		});
		y += 56;
		if (!last) {
			f.arrow([
				[cx, y + 2],
				[cx, y + 30],
			]);
			y += 32;
		}
	});
	if (note) note.forEach((line, i) => f.note(16, y + 28 + i * 20, line, { size: 14 }));
}
