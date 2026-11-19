import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

// Runs BaseHead's Plausible inline script as shipped, with fake browser globals, and
// returns what each event it listens for would send as "JS Error"
const head = readFileSync(new URL('../src/components/BaseHead.astro', import.meta.url), 'utf8');
const script = head.match(/Plausible Analytics[^\n]*\n<script is:inline>([\s\S]*?)<\/script>/)![1];
const PAGE = 'https://www.joekarlsson.com/blog/homelab-gift-ideas-2026/';

function load(page = PAGE) {
	const listeners: Record<string, (event: unknown) => void> = {};
	const sent: unknown[] = [];
	const window = { trustedTypes: undefined, plausible: (_: string, o: unknown) => sent.push(o) };
	runInNewContext(script, {
		window,
		navigator: { webdriver: false, userAgent: 'Mozilla/5.0', languages: ['en'] },
		location: { origin: new URL(page).origin, href: page, pathname: new URL(page).pathname },
		document: { createElement: () => ({ dataset: {} }), head: { appendChild: () => {} } },
		addEventListener: (type: string, fn: (event: unknown) => void) => (listeners[type] = fn),
	});
	return { fire: (type: string, event: object) => listeners[type](event), sent };
}

const csp = (violatedDirective: string, sample: string, sourceFile = PAGE) => ({
	violatedDirective,
	sample,
	sourceFile,
	blockedURI: violatedDirective === 'trusted-types' ? 'trusted-types-policy' : 'inline',
	lineNumber: 5,
});

describe('JS Error reporting', () => {
	it('ignores extension, cross-origin and injected Trusted Types noise', () => {
		const { fire, sent } = load();
		fire('securitypolicyviolation', csp('trusted-types', 'dompurify'));
		fire('securitypolicyviolation', csp('trusted-types', 'goog#html'));
		fire(
			'securitypolicyviolation',
			csp('script-src-elem', 'x', 'chrome-extension://abc/inject.js'),
		);
		fire('securitypolicyviolation', csp('require-trusted-types-for', 'Element innerHTML|x'));
		fire('error', { message: 'Script error.', filename: '', lineno: 0 });
		fire('error', { message: 'boom', filename: 'moz-extension://abc/content.js', lineno: 3 });
		fire('error', {
			message: 'TypeError: This assignment requires a TrustedScriptURL',
			filename: PAGE,
			lineno: 1,
		});
		fire('unhandledrejection', {
			reason: { name: 'AbortError', toString: () => 'AbortError: Skipping view transition' },
		});
		expect(sent).toEqual([]);
	});

	it('ignores the inline script Google Translate’s proxy adds to the page', () => {
		const proxied = 'https://www-joekarlsson-com.translate.goog/work/';
		const { fire, sent } = load(proxied);
		fire(
			'securitypolicyviolation',
			csp('script-src-elem', 'function gtElInit() {var lib = new googl', proxied),
		);
		expect(sent).toEqual([]);
	});

	it('reports the first error from the site itself, and only the first', () => {
		const { fire, sent } = load();
		fire('error', {
			message: 'TypeError: x is undefined',
			filename: 'https://www.joekarlsson.com/_astro/halftone.js',
			lineno: 12,
		});
		fire('securitypolicyviolation', csp('script-src-elem', 'theme()'));
		expect(sent).toEqual([
			{
				props: {
					message: 'TypeError: x is undefined',
					source: 'https://www.joekarlsson.com/_astro/halftone.js:12',
					path: '/blog/homelab-gift-ideas-2026/',
				},
			},
		]);
	});

	it('reports the site’s own script policy breaking: a blocked inline script or a second plausible policy', () => {
		for (const event of [csp('script-src-elem', 'theme()'), csp('trusted-types', 'plausible')]) {
			const { fire, sent } = load();
			fire('securitypolicyviolation', event);
			expect(sent).toHaveLength(1);
		}
	});
});
