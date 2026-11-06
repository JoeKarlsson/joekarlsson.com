export const alt =
	"The Great Room nightlight, decoded. Red: the garage has been open more than an hour, a door was left open late, there's a water leak or smoke, or the homelab is down. Orange: the washer finished. Blue, breathing: it just started raining. Its normal glow: everything is fine, go to bed.";

/** The colours are the information here, so the swatches use the light's real colours. */
const STATES = [
	{
		color: '#ff3b30',
		name: 'Red',
		meaning: [
			'garage open more than 1 hour',
			'a door left open late',
			'water leak or smoke',
			'my homelab is down',
		],
	},
	{ color: '#ff9500', name: 'Orange', meaning: ['washer finished'] },
	{ color: '#2f7bff', name: 'Blue', sub: 'breathing', meaning: ['it just started raining'] },
	{ color: '#ece6da', name: 'Normal', meaning: ['everything is fine, go to bed'] },
];

function draw(f, W, phone) {
	const lineH = 22;
	let y = 52;
	const rows = STATES.map((s) => {
		const top = y;
		const h = phone ? 34 + s.meaning.length * lineH : Math.max(54, s.meaning.length * lineH + 18);
		y += h + 10;
		return { ...s, top, h };
	});
	f.group({ x: 8, y: 30, w: W - 16, h: y - 30 + 8, label: 'Great Room nightlight' });
	rows.forEach((s) => {
		const cy = s.top + (phone ? 16 : s.h / 2);
		f.dot(42, cy, 15, s.color);
		f.text(70, cy - (s.sub && !phone ? 9 : 0), s.name, {
			font: 'display',
			size: 20,
			anchor: 'start',
			upper: true,
		});
		// On phones the note sits beside the name, where the meanings below can't crowd it
		if (s.sub) f.note(phone ? 128 : 70, phone ? cy + 1 : cy + 12, s.sub, { size: 13 });
		s.meaning.forEach((m, i) => {
			const my = phone
				? s.top + 40 + i * lineH
				: s.top + s.h / 2 - ((s.meaning.length - 1) * lineH) / 2 + i * lineH;
			f.text(phone ? 70 : 230, my, m, { size: 15, anchor: 'start' });
		});
	});
	f.note(16, y + 22, 'Three colours, so I never have to look one up.', { size: 14 });
}

export const desktop = {
	height: 400,
	draw(f) {
		draw(f, 640, false);
	},
};

export const phone = {
	height: 470,
	draw(f) {
		draw(f, 360, true);
	},
};
