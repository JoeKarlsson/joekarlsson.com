// Break-even: net savings climb toward the $7,200 of hardware. With the $80 security
// plan they cross at about 4.6 years; without it, at about 11.8.
import { COLORS } from '../draw.mjs';

export const alt =
	'Line chart of what the homelab has saved over time against the $7,200 it cost in hardware. Netting about $131 a month (subscriptions killed, minus electricity and backups), savings cross the hardware line at about 4.6 years. Take out the $80-a-month security monitoring plan and it nets about $51 a month, crossing at about 11.8 years.';

const HARDWARE = 7200;
const WITH_PLAN = 131;
const WITHOUT_PLAN = 51;
const Y_MAX = 8000;
const yearsAt = (perMonth, dollars) => dollars / perMonth / 12;

function chart(f, { x, y, w, h, nameW, size, phone }) {
	f.lineChart({
		x,
		y,
		w,
		h,
		xMin: 0,
		xMax: 12,
		yMax: Y_MAX,
		nameW,
		size,
		xTicks: [0, 2, 4, 6, 8, 10, 12].map((v) => [v, phone ? `${v}` : `${v} yr`]),
		yTicks: [0, 2000, 4000, 6000].map((v) => [v, v ? `$${v / 1000}k` : '$0']),
		series: [
			{
				name: '',
				points: [
					[0, 0],
					[12, WITHOUT_PLAN * 144],
				],
			},
			{
				name: '',
				points: [
					[0, 0],
					[yearsAt(WITH_PLAN, Y_MAX), Y_MAX],
				],
				highlight: true,
			},
		],
	});
	// The same scale lineChart uses
	const plotW = w - 44 - nameW;
	const px = (v) => x + 44 + (v / 12) * plotW;
	const py = (v) => y + h - 22 - (v / Y_MAX) * (h - 34);
	f.raw(
		`<path d="M${px(0)},${py(HARDWARE)} L${px(12)},${py(HARDWARE)}" stroke="${COLORS.muted}" stroke-width="2" stroke-dasharray="7 6" fill="none"/>`,
		'groups',
	);
	f.text(px(0) + 6, py(HARDWARE) - 14, 'Hardware: $7,200', {
		size,
		anchor: 'start',
		color: COLORS.muted,
		weight: 600,
	});
	const pinkYears = yearsAt(WITH_PLAN, HARDWARE);
	const chalkYears = yearsAt(WITHOUT_PLAN, HARDWARE);
	f.dot(px(pinkYears), py(HARDWARE), 6, COLORS.pink);
	f.dot(px(chalkYears), py(HARDWARE), 6, COLORS.chalk);
	f.text(px(pinkYears) + 12, py(HARDWARE) + 16, '4.6 years', {
		size: size + 2,
		anchor: 'start',
		weight: 700,
		color: COLORS.pink,
	});
	f.text(px(chalkYears) - 8, py(HARDWARE) - 16, '11.8 years', {
		size: size + 2,
		anchor: 'end',
		weight: 700,
		color: COLORS.paper,
	});
	// Each line's name, beside it where there's room
	const pinkAt = phone ? 2.3 : 2.6;
	f.text(px(pinkAt) - 10, py(WITH_PLAN * 12 * pinkAt), phone ? '$131/mo' : '$131/mo net', {
		size,
		anchor: 'end',
		weight: 700,
		color: COLORS.pink,
	});
	const chalkAt = phone ? 5.2 : 6.5;
	f.text(
		px(chalkAt) + 4,
		py(WITHOUT_PLAN * 12 * chalkAt) + 20,
		phone ? '$51/mo, no $80 plan' : '$51/mo without the $80 plan',
		{ size, anchor: 'start', weight: 700, color: COLORS.paper },
	);
}

export const desktop = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'When the rack pays for itself', { size: 22 });
		f.note(16, 52, 'Subscriptions saved, minus power and backups, against the hardware', {
			size: 14,
		});
		chart(f, { x: 8, y: 76, w: 620, h: 270, nameW: 16, size: 14 });
	},
};

export const phone = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'When it pays for itself', { size: 20 });
		f.note(16, 50, 'Savings against $7,200 of hardware', { size: 14 });
		chart(f, { x: 0, y: 72, w: 350, h: 270, nameW: 8, size: 13, phone: true });
	},
};
