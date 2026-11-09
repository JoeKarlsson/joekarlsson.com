export const alt =
	'How the recording desk is wired. My laptop connects to an Anker Prime TB5 dock with one Thunderbolt 5 cable, both ways. The Cam Link 4K and the Wave:3 MK.2 send video and audio into the dock, and the dock drives the Elgato Prompter screen. The Sony ZV-E10 feeds the Cam Link over HDMI. The dock, the camera on its dummy battery, the softbox and the spotlight all sit on one Sengled smart plug that Home Assistant switches, and it has never read more than about 112W.';

export const desktop = {
	height: 600,
	draw(f) {
		f.box({ x: 340, y: 24, w: 260, h: 60, kind: 'chalk', label: 'Laptop', icon: 'laptop' });
		f.group({ x: 20, y: 120, w: 600, h: 370, label: 'On one smart plug' });
		f.arrow(
			[
				[470, 86],
				[470, 150],
			],
			{ heads: 'both' },
		);
		f.note(456, 118, 'one Thunderbolt 5 cable', { anchor: 'end' });
		f.box({ x: 180, y: 154, w: 380, h: 60, kind: 'pink', label: 'Prime TB5 dock', logo: 'anker' });
		// What each device sends: video and audio in, the prompter screen out
		f.arrow([
			[125, 290],
			[125, 250],
			[260, 250],
			[260, 218],
		]);
		f.arrow([
			[320, 290],
			[320, 218],
		]);
		f.arrow([
			[400, 218],
			[400, 250],
			[515, 250],
			[515, 290],
		]);
		f.box({ x: 32, y: 294, w: 184, h: 60, kind: 'chalk', label: 'Cam Link 4K', logo: 'elgato' });
		f.box({ x: 228, y: 294, w: 184, h: 60, kind: 'chalk', label: 'Wave:3 MK.2', logo: 'elgato' });
		f.box({ x: 424, y: 294, w: 184, h: 60, kind: 'chalk', label: 'Prompter', logo: 'elgato' });
		f.arrow([
			[125, 410],
			[125, 358],
		]);
		f.note(139, 386, 'HDMI');
		f.box({
			x: 40,
			y: 414,
			w: 250,
			h: 60,
			kind: 'chalk',
			label: 'ZV-E10',
			sub: 'on a dummy battery',
			logo: 'sony',
		});
		f.box({
			x: 320,
			y: 414,
			w: 280,
			h: 60,
			kind: 'chalk',
			label: 'Softbox + spotlight',
			icon: 'lamp',
		});
		f.arrow([
			[110, 520],
			[110, 494],
		]);
		f.box({
			x: 20,
			y: 524,
			w: 180,
			h: 60,
			kind: 'outline',
			label: 'Smart plug',
			logo: 'homeassistant',
		});
		f.text(222, 548, 'Home Assistant flips it with recording mode.', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(222, 572, 'Everything on it together peaks around 112W.');
	},
};

export const phone = {
	height: 820,
	draw(f) {
		f.box({ x: 70, y: 16, w: 220, h: 56, kind: 'chalk', label: 'Laptop', icon: 'laptop' });
		f.arrow(
			[
				[180, 74],
				[180, 136],
			],
			{ heads: 'both' },
		);
		f.note(194, 98, 'one Thunderbolt 5');
		f.note(194, 118, 'cable');
		f.group({ x: 6, y: 126, w: 348, h: 530, label: 'On one smart plug' });
		f.box({ x: 30, y: 140, w: 300, h: 56, kind: 'pink', label: 'Prime TB5 dock', logo: 'anker' });
		// The three devices share one container and one arrow to the dock
		f.arrow(
			[
				[180, 198],
				[180, 246],
			],
			{ heads: 'both' },
		);
		f.group({ x: 20, y: 240, w: 320, h: 214, label: 'Into the dock' });
		f.box({ x: 40, y: 272, w: 280, h: 48, kind: 'chalk', label: 'Prompter', logo: 'elgato' });
		f.box({ x: 40, y: 332, w: 280, h: 48, kind: 'chalk', label: 'Wave:3 MK.2', logo: 'elgato' });
		f.box({ x: 40, y: 392, w: 280, h: 48, kind: 'chalk', label: 'Cam Link 4K', logo: 'elgato' });
		f.arrow([
			[180, 496],
			[180, 444],
		]);
		f.note(166, 474, 'HDMI', { anchor: 'end' });
		f.box({
			x: 40,
			y: 500,
			w: 280,
			h: 60,
			kind: 'chalk',
			label: 'ZV-E10',
			sub: 'on a dummy battery',
			logo: 'sony',
		});
		f.box({
			x: 40,
			y: 580,
			w: 280,
			h: 56,
			kind: 'chalk',
			label: 'Softbox + spotlight',
			icon: 'lamp',
		});
		f.arrow([
			[180, 700],
			[180, 660],
		]);
		f.box({
			x: 70,
			y: 704,
			w: 220,
			h: 56,
			kind: 'outline',
			label: 'Smart plug',
			logo: 'homeassistant',
		});
		f.note(180, 786, 'Flipped by recording mode;', { anchor: 'middle' });
		f.note(180, 806, 'peaks around 112W.', { anchor: 'middle' });
	},
};
