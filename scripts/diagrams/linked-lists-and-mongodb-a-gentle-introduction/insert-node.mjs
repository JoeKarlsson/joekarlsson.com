import { node, pointDown, pointRight } from './_list.mjs';

export const alt =
	'Inserting a node. Before: "Cat" points to "Bird", and a new node "Dog" waits on its own. After: "Cat" points to the new "Dog", and "Dog" points to "Bird". Only two pointers change; nothing else moves.';

export const desktop = {
	height: 360,
	draw(f) {
		f.group({ x: 16, y: 40, w: 608, h: 100, label: 'Before' });
		const cat = node(f, { x: 40, y: 62, value: 'Cat' });
		const bird = node(f, { x: 252, y: 62, value: 'Bird' });
		pointRight(f, cat, bird.left);
		node(f, { x: 464, y: 62, value: 'Dog', kind: 'pink' });
		f.note(532, 132, 'new node', { anchor: 'middle', size: 14 });

		f.group({ x: 16, y: 188, w: 608, h: 100, label: 'After' });
		const cat2 = node(f, { x: 40, y: 210, value: 'Cat' });
		const dog2 = node(f, { x: 252, y: 210, value: 'Dog', kind: 'pink' });
		const bird2 = node(f, { x: 464, y: 210, value: 'Bird' });
		pointRight(f, cat2, dog2.left);
		pointRight(f, dog2, bird2.left);
		f.note(320, 316, 'Two pointers change. Nothing else moves.', { anchor: 'middle' });
	},
};

export const phone = {
	height: 520,
	draw(f) {
		f.group({ x: 4, y: 40, w: 166, h: 330, label: 'Before' });
		const cat = node(f, { x: 18, y: 64, value: 'Cat' });
		const bird = node(f, { x: 18, y: 172, value: 'Bird' });
		pointDown(f, cat, [
			[cat.next[0], 142],
			[86, 142],
			[86, bird.top - 2],
		]);
		node(f, { x: 18, y: 280, value: 'Dog', kind: 'pink' });
		f.note(86, 350, 'new node', { anchor: 'middle', size: 14 });

		f.group({ x: 186, y: 40, w: 170, h: 330, label: 'After' });
		const cat2 = node(f, { x: 194, y: 64, value: 'Cat' });
		const dog2 = node(f, { x: 194, y: 172, value: 'Dog', kind: 'pink' });
		const bird2 = node(f, { x: 194, y: 280, value: 'Bird' });
		pointDown(f, cat2, [
			[cat2.next[0], 142],
			[262, 142],
			[262, dog2.top - 2],
		]);
		pointDown(f, dog2, [
			[dog2.next[0], 250],
			[262, 250],
			[262, bird2.top - 2],
		]);
		f.note(180, 410, 'Two pointers change.', { anchor: 'middle' });
		f.note(180, 432, 'Nothing else moves.', { anchor: 'middle' });
	},
};
