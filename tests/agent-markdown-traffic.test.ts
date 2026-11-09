import { describe, expect, it } from 'vitest';
import {
	AI_SEARCH,
	ASKED_BY_A_PERSON,
	TRAINING,
	agentName,
	aiAgent,
} from '../scripts/agent-markdown-traffic.mjs';

describe('aiAgent', () => {
	it('sorts AI bots by why they come, ignoring case', () => {
		expect(
			aiAgent('Mozilla/5.0 ... compatible; ChatGPT-User/1.0; +https://openai.com/bot'),
		).toEqual({
			name: 'ChatGPT-User',
			kind: ASKED_BY_A_PERSON,
		});
		expect(aiAgent('Mozilla/5.0 (compatible; OAI-SearchBot/1.3)')?.kind).toBe(AI_SEARCH);
		expect(aiAgent('Meta-ExternalAgent/1.1 (+https://developers.facebook.com)')).toEqual({
			name: 'meta-externalagent',
			kind: TRAINING,
		});
		expect(aiAgent('Mozilla/5.0 (Macintosh) Firefox/159.0')).toBeNull();
	});
});

describe('agentName', () => {
	it('names AI bots, other crawlers, tools and browsers', () => {
		expect(agentName('Claude-User/1.0 (+Claude-User@anthropic.com)')).toBe('Claude-User');
		expect(
			agentName(
				'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
			),
		).toBe('bingbot');
		expect(agentName('curl/8.7.1')).toBe('curl');
		expect(
			agentName(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:159.0) Gecko/20100101 Firefox/159.0',
			),
		).toBe('Browser');
		expect(agentName('')).toBe('(none)');
	});
});
