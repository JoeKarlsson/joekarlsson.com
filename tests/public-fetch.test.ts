import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertPublicHttpsUrl, fetchPublic } from '../scripts/public-fetch.mjs';

// Security audit run-1: scraped image and og:image URLs are fetched on the home LAN
// and committed, so they must stay on public https hosts through every redirect.
describe('assertPublicHttpsUrl', () => {
	it('allows https on public names', () => {
		expect(assertPublicHttpsUrl('https://www.cdata.com/a.png')).toBeTruthy();
	});

	it('rejects LAN, loopback, IP literals and plain http', () => {
		for (const url of [
			'http://www.cdata.com/a.png',
			'https://192.168.0.165/',
			'https://127.0.0.1/',
			'https://[::1]/',
			'https://localhost/',
			'https://nas/',
			'https://nas.local/x',
			'https://proxmox.home.arpa/',
			'file:///etc/passwd',
		]) {
			expect(() => assertPublicHttpsUrl(url), url).toThrow();
		}
	});
});

describe('fetchPublic', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('re-checks each redirect hop', async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(null, { status: 302, headers: { location: 'http://192.168.0.5/admin.png' } }),
		);
		vi.stubGlobal('fetch', fetchMock);
		await expect(fetchPublic('https://cdn.example.com/a.png')).rejects.toThrow(/public host/);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('returns the final public response', async () => {
		const responses = [
			new Response(null, { status: 301, headers: { location: '/b.png' } }),
			new Response('ok', { status: 200 }),
		];
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => responses.shift()),
		);
		expect(await (await fetchPublic('https://cdn.example.com/a.png')).text()).toBe('ok');
	});
});
