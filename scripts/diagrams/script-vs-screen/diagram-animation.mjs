// Live action shoots, then edits; animation edits (in story reels), then "shoots" (animates).
// Pink marks the steps where the dialogue still changes. Sources: Ken Schretzmann via Frame.io,
// Pete Docter in the A.V. Club, Pierre Perifel in TV Tech (all cited in the post).
export const alt =
	'Two pipelines. Live action: script, then the shoot, then the edit; the dialogue changes during the shoot and the edit. Animation: script, then story reels with temporary voices, where the rewriting happens; then the real voices are recorded; then the scenes are animated, and by then a changed line means re-animating a scene that took months.';

function rowDesktop(f, y, steps) {
	const w = 136;
	const gap = (600 - steps.length * w) / (steps.length - 1);
	steps.forEach(([label, sub, icon, kind], i) => {
		const x = 20 + i * (w + gap);
		f.box({ x, y, w, h: 100, kind, label, sub: sub ?? undefined, icon, stack: true, size: 17 });
		if (i)
			f.arrow([
				[x - gap + 4, y + 50],
				[x - 4, y + 50],
			]);
	});
}

export const desktop = {
	height: 480,
	draw(f) {
		f.group({ x: 6, y: 34, w: 628, h: 176, label: 'Live action' });
		rowDesktop(f, 58, [
			['Script', null, 'file-text', 'outline'],
			['Shoot', 'lines change', 'film', 'pink'],
			['Edit', 'scenes cut', 'split', 'pink'],
		]);
		f.note(20, 186, 'Shoot first, edit later: the words keep changing to the end.');

		f.group({ x: 6, y: 258, w: 628, h: 212, label: 'Animation' });
		rowDesktop(f, 282, [
			['Script', null, 'file-text', 'outline'],
			['Story reels', 'temp voices', 'grid-3x3', 'pink'],
			['Record', 'real voices', 'mic', 'outline'],
			['Animate', 'slow to redo', 'image', 'outline'],
		]);
		f.note(20, 410, 'Edit first, shoot later: the rewriting happens in the story reels.');
		f.note(20, 434, 'Once a scene is animated, changing a line means animating it again.');
	},
};

function rowPhone(f, y, steps) {
	steps.forEach(([label, sub, icon, kind], i) => {
		const top = y + i * 74;
		f.box({
			x: 30,
			y: top,
			w: 300,
			h: 56,
			kind,
			label: sub ? `${label}: ${sub}` : label,
			icon,
			size: 16,
		});
		if (i)
			f.arrow([
				[180, top - 16],
				[180, top - 3],
			]);
	});
	return y + steps.length * 74;
}

export const phone = {
	height: 700,
	draw(f) {
		f.group({ x: 10, y: 34, w: 340, h: 270, label: 'Live action' });
		const end1 = rowPhone(f, 56, [
			['Script', null, 'file-text', 'outline'],
			['Shoot', 'lines change', 'film', 'pink'],
			['Edit', 'scenes cut', 'split', 'pink'],
		]);
		f.note(30, end1 + 6, 'The words change to the end.', { size: 14 });

		f.group({ x: 10, y: 350, w: 340, h: 340, label: 'Animation' });
		const end2 = rowPhone(f, 372, [
			['Script', null, 'file-text', 'outline'],
			['Story reels', 'temp voices', 'grid-3x3', 'pink'],
			['Record', 'real voices', 'mic', 'outline'],
			['Animate', 'slow to redo', 'image', 'outline'],
		]);
		f.note(30, end2 + 6, 'Rewrites happen in the story reels.', { size: 14 });
	},
};
