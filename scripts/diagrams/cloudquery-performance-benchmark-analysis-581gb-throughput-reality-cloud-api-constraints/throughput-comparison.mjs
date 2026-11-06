export const alt =
	'Data volume throughput in GB per hour: CloudQuery processing file data at 581.6 on an Apple M4 Pro, Fivetran’s published 500+ on a 16-core, 128GB GCP server, and Airbyte’s published 50 to 200, shown at the top of that range.';

const BARS = [
	{ label: 'CloudQuery', value: 581.6, highlight: true },
	{ label: 'Fivetran', value: 500 },
	{ label: 'Airbyte', value: 200 },
];
const format = (v) => (v === 500 ? '500+' : v === 200 ? '50–200' : String(v));

export const desktop = {
	height: 400,
	draw(f) {
		f.heading(16, 24, 'GB per hour', { size: 24 });
		f.note(16, 52, 'Data volume throughput, higher is better', { size: 14 });
		f.barChart({ x: 60, y: 72, w: 520, h: 270, bars: BARS, format, size: 15 });
		f.note(
			16,
			362,
			'CloudQuery: file source, Apple M4 Pro. Fivetran and Airbyte: their published benchmarks.',
			{ size: 13 },
		);
	},
};

export const phone = {
	height: 290,
	draw(f) {
		f.heading(16, 24, 'GB per hour', { size: 20 });
		f.note(16, 52, 'Data volume throughput, higher is better', { size: 14 });
		f.barChart({
			x: 8,
			y: 72,
			w: 344,
			h: 156,
			bars: BARS,
			format,
			horizontal: true,
			labelW: 108,
			size: 14,
		});
		f.note(16, 250, 'Fivetran and Airbyte: their published', { size: 13 });
		f.note(16, 270, 'benchmarks. CloudQuery: file, M4 Pro.', { size: 13 });
	},
};
