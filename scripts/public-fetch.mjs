/**
 * fetch() for URLs a third-party page chose (scraped post images, og:image covers).
 * These scripts run on Joe's Mac on the home LAN and commit what they download, so a
 * URL pointing at a LAN service would publish its response (security audit run-1).
 * Only https on a public DNS name is allowed, and every redirect hop is checked.
 */
const PRIVATE_SUFFIXES = ['.local', '.lan', '.home', '.internal', '.home.arpa', '.localhost'];

export function assertPublicHttpsUrl(url, what = 'URL') {
	const { protocol, hostname } = new URL(url);
	const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
	const isIpLiteral = /^\d+(\.\d+){3}$/.test(host) || host.includes(':');
	const isPrivateName =
		host === 'localhost' || !host.includes('.') || PRIVATE_SUFFIXES.some((s) => host.endsWith(s));
	if (protocol !== 'https:' || isIpLiteral || isPrivateName) {
		throw new Error(`${what} must be https on a public host: ${String(url).slice(0, 100)}`);
	}
	return url;
}

export async function fetchPublic(url, options = {}, { what = 'URL', maxRedirects = 5 } = {}) {
	let current = url;
	for (let hop = 0; hop <= maxRedirects; hop++) {
		assertPublicHttpsUrl(current, what);
		const response = await fetch(current, { ...options, redirect: 'manual' });
		const location = response.headers.get('location');
		if (response.status < 300 || response.status >= 400 || !location) return response;
		current = new URL(location, current).href;
	}
	throw new Error(`${what} redirected more than ${maxRedirects} times: ${url}`);
}
