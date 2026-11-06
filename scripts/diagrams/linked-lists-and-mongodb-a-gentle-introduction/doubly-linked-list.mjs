import { nil, node } from './_list.mjs';

export const alt =
	'A doubly linked list: each node holds a pointer to the previous node and one to the next. "Cat" points back to null and forward to "Dog", "Dog" points back to "Cat" and forward to "Bird", and "Bird" points back to "Dog" and forward to null.';

/** Next pointers run along the upper track, prev pointers along the lower one. */
function links(f, a, b) {
	f.line([a.next, [a.right, a.mid - 10]], { color: a.ink });
	f.arrow([
		[a.right + 2, a.mid - 10],
		[b.left - 2, a.mid - 10],
	]);
	f.line([b.prev, [b.left, b.mid + 10]], { color: b.ink });
	f.arrow([
		[b.left - 2, b.mid + 10],
		[a.right + 2, b.mid + 10],
	]);
}

export const desktop = {
	height: 150,
	draw(f) {
		const y = 40;
		const start = nil(f, { x: 2, y, w: 56 });
		const cat = node(f, { x: 82, y, w: 140, value: 'Cat', prev: true });
		const dog = node(f, { x: 248, y, w: 140, value: 'Dog', prev: true });
		const bird = node(f, { x: 414, y, w: 140, value: 'Bird', prev: true });
		const end = nil(f, { x: 580, y, w: 56 });
		f.line([cat.prev, [cat.left, cat.mid + 10]], { color: cat.ink });
		f.arrow([
			[cat.left - 2, cat.mid + 10],
			[start.right + 2, cat.mid + 10],
		]);
		links(f, cat, dog);
		links(f, dog, bird);
		f.line([bird.next, [bird.right, bird.mid - 10]], { color: bird.ink });
		f.arrow([
			[bird.right + 2, bird.mid - 10],
			[end.left - 2, bird.mid - 10],
		]);
		f.note(320, 124, 'upper arrows: next; lower arrows: previous', { anchor: 'middle', size: 14 });
	},
};

export const phone = {
	height: 520,
	draw(f) {
		const start = nil(f, { x: 70, y: 16, w: 60, h: 40 });
		const cat = node(f, { x: 80, y: 100, w: 200, value: 'Cat', prev: true });
		const dog = node(f, { x: 80, y: 220, w: 200, value: 'Dog', prev: true });
		const bird = node(f, { x: 80, y: 340, w: 200, value: 'Bird', prev: true });
		const end = nil(f, { x: 230, y: 460, w: 60, h: 40 });
		const down = (a, toY) => {
			f.line([a.next, [a.next[0], a.bottom]], { color: a.ink });
			f.arrow([
				[a.next[0], a.bottom + 2],
				[a.next[0], toY - 2],
			]);
		};
		const up = (b, toY) => {
			f.line([b.prev, [b.prev[0], b.top]], { color: b.ink });
			f.arrow([
				[b.prev[0], b.top - 2],
				[b.prev[0], toY + 2],
			]);
		};
		up(cat, start.bottom);
		down(cat, dog.top);
		up(dog, cat.bottom);
		down(dog, bird.top);
		up(bird, dog.bottom);
		down(bird, end.top);
		f.note(150, 28, 'left arrows: previous', { size: 14 });
		f.note(150, 48, 'right arrows: next', { size: 14 });
	},
};
