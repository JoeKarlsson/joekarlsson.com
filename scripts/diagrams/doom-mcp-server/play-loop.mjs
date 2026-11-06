export const alt =
	'Claude’s play loop: go_to keycards, then go_to the next room, attacking the closest monsters first if they block the way. In each room, look, then attack the urgent record first; each kill makes Connect AI read that record again, live. Repeat until the room is clear. Sometimes, after a few kills, Claude makes one Connect AI check in another app. When no rooms are left, go_to the vault, where Connect AI Data Security refuses the red door, and write the summary. Every look, go_to and attack costs 1 of 100 moves; Connect AI calls cost none.';

const LEGEND = [
	['pink', 'tool call to Doom'],
	['logo:cdata', 'Connect AI step'],
];

export const desktop = {
	height: 1100,
	draw(f) {
		const call = (y, label, sub) =>
			f.box({
				x: 120,
				y,
				w: 260,
				h: sub ? 62 : 50,
				kind: 'pink',
				label,
				font: 'mono',
				size: 15,
				sub,
				subSize: 14,
			});
		f.legend(LEGEND);
		f.group({ x: 100, y: 316, w: 532, h: 296, label: 'In each room' });
		f.pill({ x: 200, y: 50, w: 100, h: 40, label: 'start' });
		f.arrow([
			[250, 92],
			[250, 118],
		]);
		call(120, 'go_to("keycards")');
		f.note(396, 145, 'pick up a keycard for each door');
		f.arrow([
			[250, 172],
			[250, 208],
		]);
		call(210, 'go_to(next room)', 'blocked? attack(closest_pids)');
		f.arrow([
			[250, 274],
			[250, 326],
		]);
		f.note(262, 296, 'arrived');
		call(328, 'look');
		f.arrow([
			[250, 380],
			[250, 416],
		]);
		call(418, 'attack(urgent pid first)');
		f.arrow([
			[382, 443],
			[418, 443],
		]);
		f.note(400, 424, 'killed', { anchor: 'middle' });
		f.box({
			x: 422,
			y: 408,
			w: 198,
			h: 70,
			kind: 'chalk',
			label: ['Connect AI reads', 'the record again'],
			size: 15,
			logo: 'cdata',
		});
		f.arrow([
			[250, 470],
			[250, 514],
		]);
		f.diamond({ cx: 250, cy: 558, w: 210, h: 84, label: 'room clear?' });
		f.arrow([
			[145, 558],
			[90, 558],
			[90, 353],
			[116, 353],
		]);
		f.note(100, 540, 'no');
		f.arrow([
			[250, 600],
			[250, 684],
		]);
		f.note(262, 628, 'yes');
		f.arrow(
			[
				[254, 660],
				[420, 660],
			],
			{ heads: 'none', dashed: true },
		);
		f.box({
			x: 422,
			y: 622,
			w: 198,
			h: 76,
			kind: 'dashed',
			label: ['sometimes:', 'one check in', 'another app'],
			size: 14,
			logo: 'cdata',
		});
		f.diamond({ cx: 250, cy: 728, w: 210, h: 84, label: 'more rooms?' });
		f.arrow([
			[145, 728],
			[50, 728],
			[50, 241],
			[116, 241],
		]);
		f.note(60, 710, 'yes');
		f.arrow([
			[250, 770],
			[250, 812],
		]);
		f.note(262, 791, 'no');
		call(814, 'go_to("vault")');
		f.arrow([
			[250, 866],
			[250, 902],
		]);
		f.note(262, 884, 'the red door');
		f.box({
			x: 120,
			y: 904,
			w: 260,
			h: 60,
			kind: 'chalk',
			label: ['Connect AI Data', 'Security refuses'],
			size: 15,
			logo: 'cdata',
		});
		f.arrow([
			[250, 966],
			[250, 994],
		]);
		f.pill({ x: 190, y: 996, w: 120, h: 40, label: 'summary' });
		f.note(
			320,
			1072,
			'Every look, go_to and attack costs 1 of 100 moves. Connect AI calls cost none.',
			{ anchor: 'middle' },
		);
	},
};

export const phone = {
	height: 1170,
	draw(f) {
		const call = (y, label, sub) =>
			f.box({
				x: 50,
				y,
				w: 290,
				h: sub ? 62 : 48,
				kind: 'pink',
				label,
				font: 'mono',
				size: 15,
				sub,
				subSize: 14,
			});
		f.legend([LEGEND[0]], { right: 344, y: 22 });
		f.legend([LEGEND[1]], { right: 344, y: 46 });
		f.group({ x: 40, y: 330, w: 312, h: 338, label: 'In each room' });
		f.pill({ x: 145, y: 72, w: 100, h: 38, label: 'start' });
		f.arrow([
			[195, 112],
			[195, 132],
		]);
		call(134, 'go_to("keycards")', 'pick up a keycard per door');
		f.arrow([
			[195, 198],
			[195, 222],
		]);
		call(224, 'go_to(next room)', 'blocked? attack(closest_pids)');
		f.arrow([
			[195, 288],
			[195, 340],
		]);
		f.note(207, 312, 'arrived');
		call(342, 'look');
		f.arrow([
			[195, 392],
			[195, 416],
		]);
		call(418, 'attack(urgent pid first)');
		f.arrow([
			[195, 468],
			[195, 494],
		]);
		f.note(207, 481, 'killed');
		f.box({
			x: 50,
			y: 496,
			w: 290,
			h: 60,
			kind: 'chalk',
			label: ['Connect AI reads the', 'record again, live'],
			size: 15,
			logo: 'cdata',
		});
		f.arrow([
			[195, 558],
			[195, 580],
		]);
		f.diamond({ cx: 195, cy: 620, w: 190, h: 76, label: 'room clear?' });
		f.arrow([
			[100, 620],
			[32, 620],
			[32, 366],
			[46, 366],
		]);
		f.note(42, 604, 'no');
		f.arrow([
			[195, 658],
			[195, 690],
		]);
		f.note(207, 678, 'yes');
		f.box({
			x: 50,
			y: 692,
			w: 290,
			h: 64,
			kind: 'dashed',
			label: ['sometimes, after a few kills:', 'one check in another app'],
			size: 14,
			logo: 'cdata',
		});
		f.arrow([
			[195, 758],
			[195, 782],
		]);
		f.diamond({ cx: 195, cy: 822, w: 190, h: 76, label: 'more rooms?' });
		f.arrow([
			[100, 822],
			[14, 822],
			[14, 255],
			[46, 255],
		]);
		f.note(24, 806, 'yes');
		f.arrow([
			[195, 860],
			[195, 890],
		]);
		f.note(207, 875, 'no');
		call(892, 'go_to("vault")');
		f.arrow([
			[195, 942],
			[195, 970],
		]);
		f.note(207, 956, 'the red door');
		f.box({
			x: 50,
			y: 972,
			w: 290,
			h: 60,
			kind: 'chalk',
			label: ['Connect AI Data', 'Security refuses'],
			size: 15,
			logo: 'cdata',
		});
		f.arrow([
			[195, 1034],
			[195, 1058],
		]);
		f.pill({ x: 135, y: 1060, w: 120, h: 38, label: 'summary' });
		f.note(180, 1124, 'Every look, go_to and attack costs', { anchor: 'middle' });
		f.note(180, 1146, '1 of 100 moves. Connect AI calls cost none.', { anchor: 'middle' });
	},
};
