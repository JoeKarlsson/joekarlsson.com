import { describe, it, expect } from 'vitest';
import { rankRelatedPosts, type RelatablePost } from '../src/utils/related-posts';

const POOL: RelatablePost[] = [
	{
		slug: 'voice-assistant',
		title: 'I replaced Alexa with a dumber voice assistant',
		body: 'Home Assistant runs a local wake word and Whisper speech model on my GPU, no cloud.',
	},
	{
		slug: 'home-assistant-gpu',
		title: 'Local voice AI on my homelab',
		body: 'Running Whisper speech to text for Home Assistant on a GPU with a local wake word.',
	},
	{
		slug: 'home-assistant-popular',
		title: 'Getting started with Home Assistant',
		body: 'Home Assistant automations, a wake word, Whisper speech and a GPU for local voice.',
	},
	{
		slug: 'clickhouse',
		title: 'Why ClickHouse should be your next database',
		body: 'Columnar storage, fast analytical queries and SQL for event data at scale.',
	},
	{
		slug: 'postgres',
		title: 'Postgres for analytics',
		body: 'Analytical queries in SQL, columnar extensions and event data at scale.',
	},
];

describe('rankRelatedPosts', () => {
	it('matches posts on what they are about, not their titles', () => {
		expect(rankRelatedPosts('voice-assistant', POOL, {}, 2)).toEqual(
			expect.arrayContaining(['home-assistant-gpu', 'home-assistant-popular']),
		);
		expect(rankRelatedPosts('clickhouse', POOL, {}, 1)).toEqual(['postgres']);
	});

	it('breaks near ties toward the post more people read', () => {
		const quiet = rankRelatedPosts('voice-assistant', POOL, {}, 2);
		const popular = rankRelatedPosts(
			'voice-assistant',
			POOL,
			{ [`/blog/${quiet[1]}/`]: 16000, [`/blog/${quiet[0]}/`]: 10 },
			2,
		);
		expect(popular).toEqual([quiet[1], quiet[0]]);
	});

	it('leaves out posts that share nothing with this one', () => {
		expect(rankRelatedPosts('clickhouse', POOL, {}, 5)).not.toContain('voice-assistant');
	});
});
