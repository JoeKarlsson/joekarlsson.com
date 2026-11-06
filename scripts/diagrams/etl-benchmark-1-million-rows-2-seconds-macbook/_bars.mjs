// Shared by this post's four bar charts: a title, the bars, and the source note.

/** A vertical bar chart on desktop, horizontal on a phone, every value printed. */
export function chart(f, { title, unit, bars, format, max, note, phone }) {
	const w = phone ? 360 : 640;
	f.heading(16, 24, title, { size: phone ? 20 : 24 });
	f.note(16, 52, unit, { size: 14 });
	if (phone) {
		f.barChart({
			x: 8,
			y: 72,
			w: 344,
			h: bars.length * 52,
			bars,
			format,
			max,
			horizontal: true,
			labelW: 108,
			size: 14,
		});
	} else {
		f.barChart({ x: 16, y: 72, w: w - 32, h: 270, bars, format, max, size: 15 });
	}
	const noteY = phone ? 72 + bars.length * 52 + 22 : 366;
	[note].flat().forEach((line, i) => f.note(16, noteY + i * 20, line, { size: 13 }));
}

export const SOURCE =
	'Source: CloudQuery’s benchmark charts; competitor figures as CloudQuery published them.';
