export const alt =
	'The same job done by a hook and by a mod: when I mention Home Assistant, hand Claude my notes on it. The hook sent the notes, but one formatting mistake meant Claude Code dropped them, so Claude never saw them, and nothing on my screen said so, broken or fixed. The mod hands Claude the notes and pops up a message on my screen saying it did.';

function column(f, { x, y, w, title, tool, icon, dropped, screen }) {
	const bx = x + 16;
	const bw = w - 32;
	const cx = x + w / 2;
	f.group({ x, y, w, h: 396, label: title });
	f.box({
		x: bx,
		y: y + 16,
		w: bw,
		h: 58,
		kind: 'outline',
		label: 'I mention',
		sub: 'Home Assistant',
		logo: 'homeassistant',
		size: 15,
	});
	f.arrow([
		[cx, y + 76],
		[cx, y + 100],
	]);
	f.box({
		x: bx,
		y: y + 102,
		w: bw,
		h: 60,
		kind: 'pink',
		label: tool,
		sub: 'hands Claude my notes',
		subSize: 14,
		icon,
	});
	if (dropped) {
		f.arrow([
			[cx - 40, y + 164],
			[cx - 40, y + 180],
		]);
		f.box({
			x: cx - 110,
			y: y + 182,
			w: 140,
			h: 32,
			kind: 'ink',
			label: 'dropped',
			icon: 'x',
			size: 14,
		});
		f.note(cx + 42, y + 198, 'bad format', { size: 14 });
	} else {
		f.arrow([
			[cx, y + 164],
			[cx, y + 230],
		]);
	}
	f.box({
		x: bx,
		y: y + 232,
		w: bw,
		h: 60,
		kind: 'chalk',
		label: 'Claude',
		sub: dropped ? 'never sees them' : 'has the notes',
		subSize: 14,
		logo: 'claude',
	});
	f.box({
		x: bx,
		y: y + 318,
		w: bw,
		h: 60,
		kind: dropped ? 'dashed' : 'outline',
		label: 'My screen',
		sub: screen,
		subSize: 14,
		icon: 'monitor',
	});
	return { right: bx + bw, mid: y + 132, screen: y + 348 };
}

const HOOK = {
	title: 'A hook',
	tool: 'Hook',
	icon: 'file-cog',
	dropped: true,
	screen: 'nothing, broken or fixed',
};
const MOD = {
	title: 'A mod',
	tool: 'Mod',
	icon: 'plug',
	dropped: false,
	screen: 'a pop-up says so',
};

export const desktop = {
	height: 450,
	draw(f) {
		column(f, { x: 8, y: 36, w: 302, ...HOOK });
		const m = column(f, { x: 330, y: 36, w: 302, ...MOD });
		f.arrow([
			[m.right + 2, m.mid],
			[m.right + 12, m.mid],
			[m.right + 12, m.screen],
			[m.right + 2, m.screen],
		]);
	},
};

export const phone = {
	height: 880,
	draw(f) {
		column(f, { x: 8, y: 34, w: 344, ...HOOK });
		const m = column(f, { x: 8, y: 470, w: 344, ...MOD });
		f.arrow([
			[m.right + 2, m.mid],
			[m.right + 10, m.mid],
			[m.right + 10, m.screen],
			[m.right + 2, m.screen],
		]);
	},
};
