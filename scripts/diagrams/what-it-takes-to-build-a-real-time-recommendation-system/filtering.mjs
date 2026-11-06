export const alt =
	'Content-based versus collaborative filtering. Content-based: a user consumes content, the recommendation system finds similar content, and recommends it back to the same user. Collaborative: similar users consume content, the recommendation system sees what they enjoyed, and recommends that content to the user.';

/** One kind of filtering: who consumes, what the recommender finds, and what comes back. */
function kind(f, { x, y, w, label, who, found, phone }) {
	const h = phone ? 300 : 286;
	f.group({ x, y, w, h, label });
	const cx = x + w / 2;
	const bw = w - 40;
	f.box({ x: x + 20, y: y + 20, w: bw, h: 52, size: 14, ...who });
	f.arrow([
		[cx, y + 74],
		[cx, y + 100],
	]);
	f.note(cx + 12, y + 87, 'consumes', { size: 13 });
	f.box({ x: x + 20, y: y + 102, w: bw, h: 52, label: 'Content', icon: 'film', size: 14 });
	f.arrow([
		[cx, y + 156],
		[cx, y + 182],
	]);
	f.note(cx + 12, y + 169, 'events', { size: 13 });
	f.box({
		x: x + 20,
		y: y + 184,
		w: bw,
		h: phone ? 96 : 84,
		kind: 'pink',
		label: 'Recommender',
		sub: found,
		size: 14,
		subSize: 13,
	});
}

const CONTENT = {
	label: 'Content-based',
	who: { label: 'You', icon: 'user' },
	found: ['finds content like', 'what you liked'],
};
const COLLAB = {
	label: 'Collaborative',
	who: { label: ['Similar', 'users'], icon: 'users' },
	found: ['finds what similar', 'users liked'],
};

export const desktop = {
	height: 356,
	draw(f) {
		kind(f, { x: 16, y: 36, w: 296, ...CONTENT });
		kind(f, { x: 328, y: 36, w: 296, ...COLLAB });
		f.note(320, 344, 'Both send their recommendation back to you.', { anchor: 'middle', size: 14 });
	},
};

export const phone = {
	height: 720,
	draw(f) {
		kind(f, { x: 8, y: 36, w: 344, phone: true, ...CONTENT });
		kind(f, { x: 8, y: 376, w: 344, phone: true, ...COLLAB });
		f.note(180, 704, 'Both send their pick back to you.', { anchor: 'middle', size: 14 });
	},
};
