import { node, pointDown, pointRight } from './_list.mjs';

export const alt =
	'Removing a node. Before: "Cat" points to "Dog", which points to "Bird". After: "Cat" points straight to "Bird", skipping "Dog". Nothing points to "Dog" any more, so it is removed from the list.';

export const desktop = {
	height: 420,
	draw(f) {
		f.group({ x: 16, y: 40, w: 608, h: 100, label: 'Before' });
		const cat = node(f, { x: 40, y: 62, value: 'Cat' });
		const dog = node(f, { x: 252, y: 62, value: 'Dog' });
		const bird = node(f, { x: 464, y: 62, value: 'Bird' });
		pointRight(f, cat, dog.left);
		pointRight(f, dog, bird.left);

		f.group({ x: 16, y: 188, w: 608, h: 146, label: 'After' });
		const cat2 = node(f, { x: 40, y: 262, value: 'Cat' });
		node(f, { x: 252, y: 262, value: 'Dog', kind: 'dashed' });
		const bird2 = node(f, { x: 464, y: 262, value: 'Bird' });
		f.line([cat2.next, [cat2.next[0], cat2.top]], { color: cat2.ink });
		f.arrow([
			[cat2.next[0], cat2.top - 2],
			[cat2.next[0], 222],
			[532, 222],
			[532, bird2.top - 2],
		]);
		f.text(16, 372, 'Nothing points to "Dog" now,', { font: 'serif', size: 17, anchor: 'start' });
		f.text(16, 396, 'so it’s gone from the list.', { font: 'serif', size: 17, anchor: 'start' });
		f.crayonArrow([270, 372], [300, 324], -14);
	},
};

export const phone = {
	height: 560,
	draw(f) {
		f.group({ x: 4, y: 40, w: 166, h: 330, label: 'Before' });
		const cat = node(f, { x: 18, y: 64, value: 'Cat' });
		const dog = node(f, { x: 18, y: 172, value: 'Dog' });
		const bird = node(f, { x: 18, y: 280, value: 'Bird' });
		pointDown(f, cat, [
			[cat.next[0], 142],
			[86, 142],
			[86, dog.top - 2],
		]);
		pointDown(f, dog, [
			[dog.next[0], 250],
			[86, 250],
			[86, bird.top - 2],
		]);

		f.group({ x: 186, y: 40, w: 170, h: 330, label: 'After' });
		const cat2 = node(f, { x: 194, y: 64, value: 'Cat' });
		node(f, { x: 194, y: 172, value: 'Dog', kind: 'dashed' });
		const bird2 = node(f, { x: 194, y: 280, value: 'Bird' });
		f.line([cat2.next, [cat2.right, cat2.mid]], { color: cat2.ink });
		f.arrow([
			[cat2.right + 2, cat2.mid],
			[348, cat2.mid],
			[348, bird2.mid],
			[bird2.right + 2, bird2.mid],
		]);
		f.text(16, 420, 'Nothing points to "Dog" now,', { font: 'serif', size: 17, anchor: 'start' });
		f.text(16, 444, 'so it’s gone from the list.', { font: 'serif', size: 17, anchor: 'start' });
		f.crayonArrow([178, 402], [192, 206], -8);
	},
};
