// Bigger Whisper models stop getting more terms right at small.en, while latency keeps
// climbing (still under the browser's 250 ms tick on an M5 Max).
import { COLORS } from '../draw.mjs';

export const alt =
	"Two line charts across five Whisper models, smallest to largest. Tech terms heard right, of 16: tiny.en 9, base.en 13, small.en 14, medium 14, large-v3-turbo 14, so accuracy stops improving at small.en. Median latency per request on an M5 Max: 28, 33, 66, 147 and 184 ms, rising with size but staying under the browser's 250 ms listen tick.";

const SHORT = ['tiny', 'base', 'small', 'medium', 'turbo'];
const TERMS = [9, 13, 14, 14, 14];
const LATENCY = [28, 33, 66, 147, 184];
const SMALL = 2; // where accuracy stops improving

function panel(f, { x, y, w, h, title, values, yMax, yTicks, format, names, size, tick }) {
	f.text(x, y, title, { size: size + 1, anchor: 'start', weight: 700 });
	const top = y + 16;
	f.lineChart({
		x,
		y: top,
		w,
		h,
		xMin: 0,
		xMax: values.length - 1,
		yMax,
		nameW: 24,
		size,
		xTicks: names.map((l, i) => [i, l]),
		yTicks,
		series: [{ name: '', points: values.map((v, i) => [i, v]) }],
	});
	// The same scale lineChart uses
	const plotW = w - 44 - 24;
	const px = (i) => x + 44 + (i / (values.length - 1)) * plotW;
	const py = (v) => top + h - 22 - (v / yMax) * (h - 34);
	if (tick) {
		f.raw(
			`<path d="M${px(0)},${py(tick)} L${px(values.length - 1)},${py(tick)}" stroke="${COLORS.pink}" stroke-width="2" stroke-dasharray="7 6" fill="none"/>`,
			'groups',
		);
		f.text(px(0) + 4, py(tick) - 12, "browser's 250 ms tick", {
			size,
			anchor: 'start',
			color: COLORS.pink,
			weight: 600,
		});
	}
	values.forEach((v, i) => {
		const pink = i === SMALL;
		f.dot(px(i), py(v), 5, pink ? COLORS.pink : COLORS.chalk);
		f.text(px(i), py(v) - 14, format(v), {
			size,
			weight: 700,
			color: pink ? COLORS.pink : COLORS.paper,
		});
	});
}

const termsSpec = {
	title: 'Tech terms heard right, of 16',
	values: TERMS,
	yMax: 16,
	yTicks: [0, 8, 16].map((v) => [v, String(v)]),
	format: String,
};
const latencySpec = {
	title: 'Median latency, M5 Max',
	values: LATENCY,
	yMax: 260,
	yTicks: [0, 100, 200].map((v) => [v, `${v}`]),
	format: (v) => `${v} ms`,
	tick: 250,
};

export const desktop = {
	height: 300,
	draw(f) {
		const common = { y: 20, w: 300, h: 260, names: SHORT, size: 13 };
		panel(f, { ...common, x: 8, ...termsSpec });
		panel(f, { ...common, x: 330, ...latencySpec });
	},
};

export const phone = {
	height: 560,
	draw(f) {
		const common = { x: 0, w: 350, h: 240, names: SHORT, size: 13 };
		panel(f, { ...common, y: 16, ...termsSpec });
		panel(f, { ...common, y: 296, ...latencySpec });
	},
};
