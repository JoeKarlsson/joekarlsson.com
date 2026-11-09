import { describe, expect, it } from 'vitest';
import { agentName } from '../scripts/agent-markdown-traffic.mjs';

describe('agentName', () => {
	it('names crawlers, AI fetchers, tools and browsers', () => {
		expect(
			agentName(
				'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
			),
		).toBe('bingbot');
		expect(
			agentName(
				'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
			),
		).toBe('ChatGPT-User');
		expect(agentName('Claude-User/1.0 (+Claude-User@anthropic.com)')).toBe('Claude-User');
		expect(agentName('curl/8.7.1')).toBe('curl');
		expect(
			agentName(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:159.0) Gecko/20100101 Firefox/159.0',
			),
		).toBe('Browser');
		expect(agentName('')).toBe('(none)');
	});
});
