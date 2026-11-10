// Records become monsters: each app's records fall into its room as paper slips, then turn into monsters.

const APPS = [
	{ x: 20, logo: 'salesforce', label: 'Salesforce', slips: ['Silver State', 'Premier Health'] },
	{ x: 225, logo: 'zendesk', label: 'Zendesk', slips: ['API 500s', 'Phone slow'] },
	{ x: 430, logo: 'stripe', label: 'Stripe', slips: ['Open invoice', 'Open invoice'] },
];

export const board = {
	title: 'Pour the records into the rooms',
	section: 'Visualizing MCP data as a Doom level',
	form: 'Physics',
	claim:
		'Every app Claude used becomes a room and every record a monster. Watching the records fall out of each app and pile into its room says that faster than the mapping table does.',
	trigger: 'A “Build the level” button on the figure, desktop only. Plays once, then Replay.',
	library:
		'Matter.js for gravity and stacking, loaded on the click. The slips are drawn on 12fps steps so it moves like cut paper, not like a physics demo.',
	still:
		'Frame 5: three rooms full of monsters, plus the vault, as a normal diagram. It sits above the mapping table, which stays.',
	test: 'Six paper slips falling and stacking under Matter.js on 12fps steps, with the paper boil on. Does it read as torn paper or as a generic physics toy?',
};

function apps(f) {
	for (const app of APPS)
		f.box({ x: app.x, y: 16, w: 190, h: 52, kind: 'chalk', label: app.label, logo: app.logo });
}

function rooms(f) {
	APPS.forEach((app, i) => f.group({ x: app.x, y: 232, w: 190, h: 112, label: `Room ${i + 1}` }));
}

// One record: a slip of paper, or once it lands, a monster. The first in each room is the urgent one.
function record(f, x, y, label, { monster, urgent }) {
	f.box({
		x,
		y,
		w: urgent ? 170 : 150,
		h: urgent ? 44 : 36,
		kind: monster ? 'pink' : 'outline',
		label,
		size: urgent ? 15 : 13,
	});
}

function piled(f, monster) {
	APPS.forEach((app) => {
		record(f, app.x + 18, 296, app.slips[1], { monster });
		record(f, app.x + 10, 246, app.slips[0], { monster, urgent: true });
	});
}

export const frames = [
	{
		at: '0.0s',
		note: 'Claude picked three apps. Each one gets a room, empty for now.',
		draw: (f) => {
			apps(f);
			rooms(f);
		},
	},
	{
		at: '0.4s',
		note: 'Each app’s records drop out as paper slips, tumbling a little on the way down.',
		draw: (f) => {
			apps(f);
			rooms(f);
			APPS.forEach((app, i) => {
				record(f, app.x + 6 + i * 4, 92, app.slips[0], { urgent: true });
				record(f, app.x + 30, 160, app.slips[1], {});
			});
		},
	},
	{
		at: '1.2s',
		note: 'They pile up in their own room. The urgent record from each app is cut bigger than the rest.',
		draw: (f) => {
			apps(f);
			rooms(f);
			piled(f, false);
		},
	},
	{
		at: '1.8s',
		note: 'The slips flip over into monsters, named after their records. The urgent one is the biggest monster in the room.',
		draw: (f) => {
			apps(f);
			rooms(f);
			piled(f, true);
		},
	},
	{
		at: '2.6s',
		note: 'Last, the SSN lookup Connect AI refused falls, hits the vault and bounces off. A refused request is the red door.',
		draw: (f) => {
			apps(f);
			rooms(f);
			piled(f, true);
			f.box({ x: 30, y: 112, w: 160, h: 44, kind: 'dashed', label: 'SSN lookup', size: 14 });
			f.box({ x: 240, y: 98, w: 170, h: 72, kind: 'chalk', label: 'PII vault', icon: 'lock' });
			f.crayonArrow([194, 126], [236, 126], -18);
			f.note(432, 126, 'refused, so it');
			f.note(432, 148, 'becomes the red door');
		},
	},
];

export const phone = {
	note: 'Frame 5 stacked: each room named after its app, with the vault under them.',
	height: 520,
	draw(f) {
		APPS.forEach((app, i) => {
			const y = 40 + i * 124;
			f.group({ x: 16, y, w: 328, h: 92, label: app.label });
			f.box({ x: 28, y: y + 22, w: 160, h: 48, kind: 'pink', label: app.slips[0], size: 15 });
			f.box({ x: 200, y: y + 28, w: 132, h: 40, kind: 'pink', label: app.slips[1], size: 13 });
		});
		f.box({
			x: 16,
			y: 420,
			w: 328,
			h: 64,
			kind: 'chalk',
			label: 'PII vault: no key',
			icon: 'lock',
		});
	},
};
