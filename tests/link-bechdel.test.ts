import { describe, expect, it } from 'vitest';
import { addBechdelUrl, findFilm } from '../scripts/link-bechdel.mjs';

const shelf = [
	{ slug: 'cape-fear-1962', title: 'Cape Fear', year: 1962 },
	{ slug: 'memento-2001', title: 'Memento', year: 2001 },
	{ slug: 'charlie-s-angels-2000', title: "Charlie's Angels", year: 2000 },
	{ slug: 'planes-trains-and-automobiles-1987', title: 'Planes, Trains & Automobiles', year: 1987 },
];

describe('findFilm', () => {
	it('matches on title and a year at most one off', () => {
		expect(findFilm(shelf, 'Memento', 2000)?.slug).toBe('memento-2001');
		expect(findFilm(shelf, 'Charlie’s Angels', 2000)?.slug).toBe('charlie-s-angels-2000');
		expect(findFilm(shelf, 'Planes, Trains and Automobiles', 1987)?.slug).toBe(
			'planes-trains-and-automobiles-1987',
		);
	});

	it('skips a remake with the same title', () => {
		expect(findFilm(shelf, 'Cape Fear', 1991)).toBeUndefined();
	});
});

it('addBechdelUrl puts the link after the Letterboxd one', () => {
	expect(addBechdelUrl("letterboxdUrl: 'https://l/x/'\nposter: 'p'", 'https://b/x/')).toBe(
		"letterboxdUrl: 'https://l/x/'\nbechdelUrl: 'https://b/x/'\nposter: 'p'",
	);
});
