// The MikroTik Native API Client's project page How it's made figure (src/data/projects.ts):
// the script and RouterOS over raw TCP, time running down, and how one word goes out as bytes.

export const alt =
	'How the MikroTik API client talks to RouterOS. The Python script, using only socket and struct, opens a raw TCP connection to RouterOS on port 8728. It sends a /login sentence with =name= and =password= words, and RouterOS answers !done. Then it sends a command such as /interface/bonding/print, and RouterOS answers with one !re sentence per record, then !done, or !trap on an error. On the wire, each word goes out as its length and then its bytes: 06 and the six bytes of /login, 0b and the eleven bytes of =name=admin, and a 00 byte ends the sentence. The length byte works like UTF-8: its high bits say how many more length bytes follow.';

const CLIENT = {
	kind: 'pink',
	label: 'mikrotik-api.py',
	font: 'mono',
	sub: 'socket + struct',
	logo: 'python',
};
const ROUTER = { kind: 'chalk', label: 'RouterOS', sub: 'port 8728, raw TCP', logo: 'mikrotik' };

// What goes over the connection, top to bottom; `up` is the script sending
const MESSAGES = [
	{ up: true, label: '/login =name=admin =password=…' },
	{ up: false, label: '!done' },
	{ up: true, label: '/interface/bonding/print' },
	{ up: false, label: '!re  one per bond' },
	{ up: false, label: '!re' },
	{ up: false, label: '!done, or !trap on an error' },
];

/** Both lifelines and the messages between them, from `top` down `step` apart */
function exchange(f, { cx, sx, top, step, size }) {
	const bottom = top + MESSAGES.length * step;
	for (const x of [cx, sx])
		f.line(
			[
				[x, top - 14],
				[x, bottom],
			],
			{ color: '#a3a3a3', width: 1.5 },
		);
	MESSAGES.forEach((m, i) => {
		const y0 = top + 18 + i * step;
		f.arrow([
			[m.up ? cx + 4 : sx - 4, y0],
			[m.up ? sx - 6 : cx + 6, y0 + step * 0.32],
		]);
		f.text(m.up ? cx + 8 : sx - 8, y0 - 12, m.label, {
			font: 'mono',
			size,
			anchor: m.up ? 'start' : 'end',
			color: '#ff4fd8',
		});
	});
	return bottom;
}

export const desktop = {
	height: 620,
	draw(f) {
		f.box({ x: 20, y: 16, w: 240, h: 80, size: 18, subSize: 14, ...CLIENT });
		f.box({ x: 380, y: 16, w: 240, h: 80, size: 18, subSize: 14, ...ROUTER });
		const bottom = exchange(f, { cx: 140, sx: 500, top: 118, step: 50, size: 14 });
		f.note(20, bottom + 34, 'One word on the wire: its length, then its bytes');
		f.code({
			x: 20,
			y: bottom + 52,
			w: 600,
			lines: [
				'06  2f 6c 6f 67 69 6e                  /login',
				'0b  3d 6e 61 6d 65 3d 61 64 6d 69 6e   =name=admin',
				'00                                     end of sentence',
			],
		});
		f.note(20, bottom + 176, "The length byte's high bits say how many more follow, as in UTF-8", {
			size: 14,
		});
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.box({ x: 8, y: 16, w: 166, h: 104, size: 15, subSize: 13, stack: true, ...CLIENT });
		f.box({ x: 186, y: 16, w: 166, h: 104, size: 16, subSize: 13, stack: true, ...ROUTER });
		const bottom = exchange(f, { cx: 40, sx: 320, top: 146, step: 52, size: 13 });
		f.note(8, bottom + 32, 'One word on the wire:', { size: 14 });
		f.note(8, bottom + 52, 'its length, then its bytes', { size: 14 });
		f.code({
			x: 8,
			y: bottom + 68,
			w: 344,
			size: 14,
			lines: ['06 + 6 bytes    /login', '0b + 11 bytes   =name=admin', '00              end'],
		});
	},
};
