import { describe, expect, it } from 'vitest';
import { bibtexPost, chicagoPost, outletFor } from '../src/utils/post-citation';

const url = 'https://www.joekarlsson.com/blog/x/';

describe('post-citation', () => {
	it('cites a repost at its original outlet and date, then gives the joekarlsson.com URL', () => {
		const post = {
			title: 'Event sourcing with Kafka',
			date: new Date('2023-09-27'),
			outlet: outletFor('Tinybird'),
		};
		expect(chicagoPost(post, url)).toBe(
			`Karlsson, Joe. 2023. “Event sourcing with Kafka.” Tinybird Blog, September 27, 2023. Reposted at ${url}.`,
		);
		expect(bibtexPost(post, url, 'event-sourcing-with-kafka')).toContain(
			'howpublished = {Tinybird Blog}',
		);
		expect(bibtexPost(post, url, 'event-sourcing-with-kafka')).toContain(
			'note         = {Reposted on joekarlsson.com}',
		);
	});

	it('cites a post that first ran on joekarlsson.com as a blog post, with no repost note', () => {
		const post = { title: 'Why does it work?', date: new Date('2016-07-23') };
		expect(chicagoPost(post, url)).toBe(
			`Karlsson, Joe. 2016. “Why does it work?” Joe Karlsson (blog), July 23, 2016. ${url}.`,
		);
		expect(bibtexPost(post, url, 'why-does-it-work')).not.toContain('note');
		expect(
			bibtexPost(post, url, 'what-it-takes-to-build-a-real-time-recommendation-system'),
		).toMatch(/^@misc\{karlsson2016recommendation,/);
	});

	it('fails loudly on an employer with no outlet', () => {
		expect(() => outletFor('Initech')).toThrow(/No outlet/);
	});
});
