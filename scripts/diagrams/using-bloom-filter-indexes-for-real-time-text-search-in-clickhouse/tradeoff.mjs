// The one-hash filters at three sizes: 8x the filter scans only about 2x less data,
// runs 3.5x slower and stores 5x the index.
export const alt =
	'Three bar charts for the one-hash ngrambf_v1 filter at 1024, 4096 and 8192 bytes. Query time: 0.127, 0.240 and 0.447 seconds. Data scanned: 0.400, 0.191 and 0.183 GB. Index size: 247.8, 778.4 and 1,280 MB, against about 4 GB of compressed log data. Going from 1024 to 8192 bytes scans about 2.2 times less data but runs 3.5 times slower and stores 5 times the index.';

const SIZES = ['1024', '4096', '8192'];
const PANELS = [
	['Query time', [0.127, 0.24, 0.447], (v) => `${v.toFixed(3)} s`],
	['Data scanned', [0.4, 0.191, 0.183], (v) => `${v.toFixed(3)} GB`],
	['Index size', [247.8, 778.4, 1280], (v) => `${v.toLocaleString('en-US')} MB`],
];

function panel(f, { x, y, w, h, title, values, format, labelW, size }) {
	f.text(x, y, title, { size: size + 1, anchor: 'start', weight: 700 });
	f.barChart({
		x,
		y: y + 14,
		w,
		h,
		bars: SIZES.map((label, i) => ({ label, value: values[i], highlight: i === 2 })),
		// Headroom so the longest value label stays inside its third of the column
		max: Math.max(...values) * 1.5,
		format,
		horizontal: true,
		labelW,
		size,
	});
}

export const desktop = {
	height: 200,
	draw(f) {
		f.note(16, 18, 'Filter size in bytes, one hash function. Lower is better on all three.', {
			size: 14,
		});
		PANELS.forEach(([title, values, format], i) =>
			panel(f, {
				x: 16 + i * 206,
				y: 52,
				w: 196,
				h: 130,
				title,
				values,
				format,
				labelW: 44,
				size: 13,
			}),
		);
	},
};

export const phone = {
	height: 520,
	draw(f) {
		f.note(8, 18, 'Filter size in bytes, one hash function.', { size: 13 });
		f.note(8, 38, 'Lower is better on all three.', { size: 13 });
		PANELS.forEach(([title, values, format], i) =>
			panel(f, {
				x: 8,
				y: 76 + i * 150,
				w: 344,
				h: 110,
				title,
				values,
				format,
				labelW: 50,
				size: 14,
			}),
		);
	},
};
