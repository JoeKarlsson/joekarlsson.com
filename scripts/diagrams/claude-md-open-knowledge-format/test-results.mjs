// The three copies of the docs side by side: metadata changes nothing, restructuring
// halves what loads at startup and cuts cost about a third. Accuracy held.
export const alt =
	'Three bar charts comparing the docs as-is, with metadata added, and restructured. Tokens loaded at session start: 16,237, 16,237 and 8,505. Cost per question on Sonnet: $0.043, $0.042 and $0.030. Cost per question on Opus: $0.201, $0.203 and $0.133. Accuracy on Sonnet held at 97%, 98% and 99%, within the noise of 44 questions.';

const COPIES = ['As-is', 'Metadata', 'Restructured'];
const PANELS = [
	['Tokens loaded at session start', [16237, 16237, 8505], (v) => v.toLocaleString('en-US')],
	['Cost per question, Sonnet', [0.043, 0.042, 0.03], (v) => `$${v.toFixed(3)}`],
	['Cost per question, Opus', [0.201, 0.203, 0.133], (v) => `$${v.toFixed(3)}`],
];

function chart(f, { x, y, w, panelH, labelW, size }) {
	PANELS.forEach(([title, values, format], i) => {
		const top = y + i * panelH;
		f.text(x, top, title, { size: size + 1, anchor: 'start', weight: 700 });
		f.barChart({
			x,
			y: top + 14,
			w,
			h: panelH - 34,
			bars: COPIES.map((label, j) => ({ label, value: values[j], highlight: j === 2 })),
			format,
			horizontal: true,
			labelW,
			size,
		});
	});
}

export const desktop = {
	height: 470,
	draw(f) {
		chart(f, { x: 16, y: 16, w: 608, panelH: 140, labelW: 120, size: 15 });
		f.note(
			16,
			450,
			'Accuracy held: 97%, 98% and 99% on Sonnet, within the noise of 44 questions.',
			{
				size: 14,
			},
		);
	},
};

export const phone = {
	height: 500,
	draw(f) {
		chart(f, { x: 8, y: 16, w: 344, panelH: 146, labelW: 104, size: 14 });
		f.note(8, 460, 'Accuracy held: 97%, 98% and 99%', { size: 13 });
		f.note(8, 480, 'on Sonnet, within the noise.', { size: 13 });
	},
};
