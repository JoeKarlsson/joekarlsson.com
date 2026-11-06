// Shared by this post's two charts: one row per Bloom filter configuration.
export const CONFIGS = ['(4, 1024, 1, 0)', '(4, 1024, 2, 0)', '(4, 4096, 1, 0)', '(4, 8192, 1, 0)'];

export function chart(f, { title, values, unit, best, phone }) {
	const bars = CONFIGS.map((label, i) => ({ label, value: values[i], highlight: i === best }));
	const fmt = (v) => `${v.toFixed(1)}${unit}`;
	if (phone) {
		f.text(8, 18, title, { size: 15, anchor: 'start', weight: 700 });
		f.note(8, 38, 'vs. no index; ngrambf_v1 settings', { size: 13 });
		f.barChart({
			x: 8,
			y: 52,
			w: 344,
			h: 220,
			bars,
			format: fmt,
			horizontal: true,
			labelW: 132,
			size: 13,
		});
		return;
	}
	f.text(16, 20, title, { size: 17, anchor: 'start', weight: 700 });
	f.note(
		16,
		42,
		'compared with no index; ngrambf_v1(n-gram size, filter size, hash functions, seed)',
		{ size: 13 },
	);
	f.barChart({
		x: 16,
		y: 58,
		w: 608,
		h: 210,
		bars,
		format: fmt,
		horizontal: true,
		labelW: 150,
		size: 15,
	});
}
