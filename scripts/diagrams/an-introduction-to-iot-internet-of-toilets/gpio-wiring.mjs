export const alt =
	'How the litter box is wired to the Raspberry Pi’s GPIO header. The HX711 load cell amplifier takes VCC from pin 2 (5V) and ground from pin 6, sends data (DT) to pin 29 (GPIO 5) and takes its clock (SCK) from pin 31 (GPIO 6). The four 50 kg load cells under the box connect to the HX711’s E+, E-, A+ and A- inputs. The magnetic reed switch on the lid connects to pin 36 (GPIO 16) and ground on pin 34.';

/** The Pi header pins this build uses, with what each connects to. */
const PINS = [
	{ pin: 2, name: '5V', to: 'HX711 VCC', part: 'hx' },
	{ pin: 6, name: 'Ground', to: 'HX711 GND', part: 'hx' },
	{ pin: 29, name: 'GPIO 5', to: 'HX711 DT', part: 'hx' },
	{ pin: 31, name: 'GPIO 6', to: 'HX711 SCK', part: 'hx' },
	{ pin: 34, name: 'Ground', to: 'reed switch', part: 'reed' },
	{ pin: 36, name: 'GPIO 16', to: 'reed switch', part: 'reed' },
];

/** The pin list inside a Raspberry Pi container. Returns each row's right edge. */
function header(f, { x, y, w }) {
	const rowH = 40;
	f.group({ x, y, w, h: 28 + PINS.length * rowH, label: 'Raspberry Pi GPIO' });
	return PINS.map((p, i) => {
		const ry = y + 16 + i * rowH;
		f.box({
			x: x + 12,
			y: ry,
			w: 48,
			h: 32,
			kind: p.part === 'hx' ? 'chalk' : 'pink',
			label: `${p.pin}`,
			font: 'mono',
			size: 14,
		});
		f.text(x + 72, ry + 16, p.name, { size: 14, anchor: 'start', weight: 700 });
		return [x + w, ry + 16];
	});
}

export const desktop = {
	height: 470,
	draw(f) {
		f.logo('raspberrypi', 16, 22, 22);
		const rows = header(f, { x: 16, y: 60, w: 190 });
		// HX711 amplifier: four wires from pins 2, 6, 29, 31
		f.box({
			x: 300,
			y: 64,
			w: 150,
			h: 172,
			kind: 'chalk',
			label: 'HX711',
			sub: ['load cell', 'amplifier', '', 'VCC  GND', 'DT  SCK'],
			subSize: 13,
			icon: 'cpu',
			size: 16,
			stack: true,
		});
		rows.slice(0, 4).forEach(([x, y], i) =>
			f.arrow(
				[
					[x + 2, y],
					[250 + i * 10, y],
					[250 + i * 10, 90 + i * 36],
					[298, 90 + i * 36],
				],
				{ heads: 'none' },
			),
		);
		// Four load cells into the amplifier's inputs
		f.group({ x: 488, y: 40, w: 136, h: 260, label: 'Load cells' });
		['E+', 'E−', 'A+', 'A−'].forEach((t, i) => {
			const y = 58 + i * 58;
			f.box({
				x: 500,
				y,
				w: 112,
				h: 46,
				label: '50 kg',
				sub: t,
				subFont: 'mono',
				subSize: 13,
				icon: 'weight',
				size: 13,
			});
			f.arrow(
				[
					[498, y + 23],
					[452, y + 23],
				],
				{ heads: 'none' },
			);
		});
		// Reed switch: pins 34 and 36
		f.box({
			x: 300,
			y: 330,
			w: 220,
			h: 72,
			kind: 'pink',
			label: 'Reed switch',
			sub: 'lid open or shut',
			subSize: 13,
			icon: 'magnet',
			size: 15,
		});
		rows.slice(4).forEach(([x, y], i) =>
			f.arrow(
				[
					[x + 2, y],
					[260 + i * 14, y],
					[260 + i * 14, 350 + i * 30],
					[298, 350 + i * 30],
				],
				{ heads: 'none' },
			),
		);
		f.note(16, 450, 'Pin numbers are the physical header positions.', { size: 13 });
	},
};

export const phone = {
	height: 700,
	draw(f) {
		f.logo('raspberrypi', 16, 22, 22);
		const rows = header(f, { x: 8, y: 60, w: 168 });
		f.box({
			x: 214,
			y: 70,
			w: 138,
			h: 150,
			kind: 'chalk',
			label: 'HX711',
			sub: ['amplifier', 'VCC GND', 'DT SCK'],
			subSize: 13,
			icon: 'cpu',
			size: 15,
			stack: true,
		});
		rows.slice(0, 4).forEach(([x, y], i) =>
			f.arrow(
				[
					[x + 2, y],
					[190 + i * 6, y],
					[190 + i * 6, 96 + i * 32],
					[212, 96 + i * 32],
				],
				{ heads: 'none' },
			),
		);
		f.box({
			x: 214,
			y: 256,
			w: 138,
			h: 116,
			kind: 'pink',
			label: ['Reed', 'switch'],
			sub: 'the lid',
			subSize: 13,
			icon: 'magnet',
			size: 14,
			stack: true,
		});
		rows.slice(4).forEach(([x, y], i) =>
			f.arrow(
				[
					[x + 2, y],
					[196 + i * 6, y],
					[196 + i * 6, 296 + i * 24],
					[212, 296 + i * 24],
				],
				{ heads: 'none' },
			),
		);
		f.group({ x: 8, y: 420, w: 344, h: 160, label: 'Load cells into the HX711' });
		const spots = [
			[20, 440],
			[184, 440],
			[20, 508],
			[184, 508],
		];
		['E+', 'E−', 'A+', 'A−'].forEach((t, i) =>
			f.box({
				x: spots[i][0],
				y: spots[i][1],
				w: 156,
				h: 56,
				label: '50 kg',
				sub: t,
				subFont: 'mono',
				subSize: 13,
				icon: 'weight',
				size: 13,
			}),
		);
		f.note(16, 618, 'Each load cell wires to one HX711 input.', { size: 13 });
		f.note(16, 640, 'Pin numbers are physical header positions.', { size: 13 });
	},
};
