import { node, pointDown, pointRight } from './_list.mjs';

export const alt =
	'A circular linked list: "Cat" points to "Dog", "Dog" points to "Bird", and "Bird" points back to "Cat", so the list has no end.';

export const desktop = {
	height: 170,
	draw(f) {
		const cat = node(f, { x: 60, y: 30, value: 'Cat' });
		const dog = node(f, { x: 252, y: 30, value: 'Dog' });
		const bird = node(f, { x: 444, y: 30, value: 'Bird' });
		pointRight(f, cat, dog.left);
		pointRight(f, dog, bird.left);
		pointDown(f, bird, [
			[bird.next[0], 130],
			[36, 130],
			[36, cat.mid],
			[cat.left - 2, cat.mid],
		]);
		f.note(320, 150, 'back to the start', { anchor: 'middle', size: 14 });
	},
};

export const phone = {
	height: 360,
	draw(f) {
		const cat = node(f, { x: 112, y: 20, value: 'Cat' });
		const dog = node(f, { x: 112, y: 120, value: 'Dog' });
		const bird = node(f, { x: 112, y: 220, value: 'Bird' });
		pointDown(f, cat, [
			[cat.next[0], 98],
			[180, 98],
			[180, dog.top - 2],
		]);
		pointDown(f, dog, [
			[dog.next[0], 198],
			[180, 198],
			[180, bird.top - 2],
		]);
		pointDown(f, bird, [
			[bird.next[0], 312],
			[70, 312],
			[70, cat.mid],
			[cat.left - 2, cat.mid],
		]);
		f.note(84, 334, 'back to the start', { size: 14 });
	},
};
