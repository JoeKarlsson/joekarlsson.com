export const alt =
	'The homelab in 2023 versus 2026. Servers: 1 Lenovo ThinkServer, then 2 Dell R730s. CPU: a quad-core Xeon E3, then 80 cores and 160 threads at about 13% busy. RAM: 32GB, then 256GB with about 72GB used. GPU: none, then 2 NVIDIA GPUs with 24GB of VRAM. Workloads: about 15 containers, then 73 containers and 1 VM. Network: flat with no VLANs, then 4 VLANs with 10G between hosts. Monitoring: none, then Prometheus, Loki and 185 health checks. Config: by hand, then every container in OpenTofu. Power: about 80W estimated, then about 430W average metered. Hardware: $200, then about $7,400. Power cost: about $105 a year, then about $565 a year.';

const ROWS = [
	['Servers', '1 Lenovo ThinkServer', '2 Dell R730s'],
	['CPU', 'Xeon E3 quad-core', '80 cores, 160 threads, ~13% busy'],
	['RAM', '32GB', '256GB, ~72GB used'],
	['GPU', 'none', '2 NVIDIA GPUs, 24GB VRAM'],
	['Workloads', '~15 containers', '73 containers + 1 VM'],
	['Network', 'flat, no VLANs', '4 VLANs, 10G between hosts'],
	['Monitoring', 'none', 'Prometheus, Loki, 185 checks'],
	['Config', 'by hand', 'every container in OpenTofu'],
	['Power draw', '~80W (estimated)', '~430W average (metered)'],
	['Hardware', '$200', '~$7,400'],
	['Power cost', '~$105 a year', '~$565 a year'],
];

export const desktop = {
	height: 470,
	draw(f) {
		const cols = [16, 136, 336];
		f.box({
			x: 128,
			y: 16,
			w: 196,
			h: 54,
			label: '2023',
			sub: 'ThinkServer era',
			subSize: 13,
			icon: 'server',
		});
		f.box({
			x: 328,
			y: 16,
			w: 296,
			h: 54,
			kind: 'pink',
			label: '2026',
			sub: 'server rack era',
			subSize: 13,
			logo: 'dell',
		});
		ROWS.forEach(([k, a, b], i) => {
			const y = 98 + i * 34;
			if (i % 2 === 0)
				f.line(
					[
						[16, y - 17],
						[624, y - 17],
					],
					{ color: '#2a2a2a', width: 1 },
				);
			f.text(cols[0], y, k, { size: 14, anchor: 'start', weight: 700 });
			f.note(cols[1], y, a, { size: 14 });
			f.text(cols[2], y, b, { size: 14, anchor: 'start' });
		});
	},
};

export const phone = {
	height: 820,
	draw(f) {
		ROWS.forEach(([k, a, b], i) => {
			const y = 20 + i * 72;
			f.text(16, y + 10, k, { font: 'display', size: 17, anchor: 'start', upper: true });
			f.note(16, y + 34, `2023: ${a}`, { size: 14 });
			f.text(16, y + 56, `2026: ${b}`, {
				size: 14,
				anchor: 'start',
				color: '#ff4fd8',
				weight: 700,
			});
		});
	},
};
