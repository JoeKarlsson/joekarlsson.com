import { describe, expect, it } from 'vitest';
import { annotate, checkAllPlaced, parseProjectNotes } from '../src/utils/project-margin-notes';

describe('project page margin notes', () => {
	it('numbers notes across sections and puts each before the paragraph holding its phrase', async () => {
		const notes = parseProjectNotes('demo', [
			{ type: 'term', at: 'first idea', text: 'one.' },
			{ type: 'aside', at: 'second idea', text: 'two.' },
			{
				type: 'picture',
				at: 'second idea',
				text: 'A poem in progress.',
				image: '/images/projects/linger/a-blackout-poem-in-progress-october.webp',
				alt: 'Hands blacking out words on a page.',
			},
		]);
		const placed = { count: 0, used: new Set<(typeof notes)[number]>() };
		const [intro] = await annotate(['The first idea came fast.'], notes, placed);
		const [made] = await annotate(['Then the second idea.'], notes, placed);
		checkAllPlaced('demo', notes, placed);
		expect(intro).toMatch(/^<div[^>]*id="mn-1"[\s\S]*<\/div><p>/);
		expect(made).toMatch(/^<figure class="margin-figure">[\s\S]*<div[^>]*id="mn-2"[\s\S]*<p>Then/);
	});
	it('fails the build on a note that matches no paragraph, or a quote with no author', () => {
		const notes = parseProjectNotes('demo', [{ type: 'term', at: 'nowhere', text: 'x' }]);
		expect(() => checkAllPlaced('demo', notes, { used: new Set() })).toThrow(/"nowhere"/);
		expect(() => parseProjectNotes('demo', [{ type: 'quote', at: 'a', text: 'b' }])).toThrow(
			/work\/demo marginNotes/,
		);
	});
});
