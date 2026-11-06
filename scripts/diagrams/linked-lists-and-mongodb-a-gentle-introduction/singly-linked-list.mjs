import { nil, node, pointDown, pointRight } from './_list.mjs';

export const alt =
	'A singly linked list: "Cat" points to "Dog", "Dog" points to "Bird", and "Bird" points to null. "Cat" is the head and "Bird" is the tail.';

export const desktop = {
	height: 190,
	draw(f) {
		const cat = node(f, { x: 16, y: 40, value: 'Cat' });
		const dog = node(f, { x: 196, y: 40, value: 'Dog' });
		const bird = node(f, { x: 376, y: 40, value: 'Bird' });
		const end = nil(f, { x: 556, y: 40 });
		pointRight(f, cat, dog.left);
		pointRight(f, dog, bird.left);
		pointRight(f, bird, end.left);
		f.arrow([
			[64, 150],
			[64, 100],
		]);
		f.note(64, 166, 'head', { anchor: 'middle', weight: 700 });
		f.arrow([
			[424, 150],
			[424, 100],
		]);
		f.note(424, 166, 'tail', { anchor: 'middle', weight: 700 });
	},
};

export const phone = {
	height: 400,
	draw(f) {
		const cat = node(f, { x: 112, y: 20, value: 'Cat' });
		const dog = node(f, { x: 112, y: 120, value: 'Dog' });
		const bird = node(f, { x: 112, y: 220, value: 'Bird' });
		const end = nil(f, { x: 148, y: 320 });
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
			[bird.next[0], 298],
			[180, 298],
			[180, end.top - 2],
		]);
		f.note(40, cat.mid, 'head', { weight: 700 });
		f.arrow([
			[78, cat.mid],
			[108, cat.mid],
		]);
		f.note(40, bird.mid, 'tail', { weight: 700 });
		f.arrow([
			[72, bird.mid],
			[108, bird.mid],
		]);
	},
};
