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
		location: {
			origin: new URL(page).origin,
			hostname: new URL(page).hostname,
			href: page,
			pathname: new URL(page).pathname,
		},
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

	it('ignores the noise live visitors sent in November 2026', () => {
		const { fire, sent } = load();
		// Chrome's page translator and font-injecting extensions
		fire('securitypolicyviolation', {
			...csp('style-src-elem', ''),
			blockedURI:
				'https://www.gstatic.com/_/translate_http/_/ss/k=translate_http.tr.QqIH6p_rMO8.L.W1.O/am=AAAAMA/d=0',
		});
		fire('securitypolicyviolation', {
			...csp('script-src-elem', ''),
			blockedURI: 'https://www.gstatic.com/_/translate_http/_/js/k=translate_http.tr.es_419',
		});
		fire('securitypolicyviolation', {
			...csp('font-src', ''),
			blockedURI:
				'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPN.woff2',
		});
		// A resize callback that ran on to the next frame
		fire('error', {
			message: 'ResizeObserver loop completed with undelivered notifications.',
			filename: PAGE,
			lineno: 0,
		});
		// View transitions the browser dropped
		for (const message of [
			'Transition was aborted because of invalid state. Viewport size changed',
			'Transition was aborted because of invalid state. Snapshot capture failed',
			'Transition was aborted because of invalid state',
		])
			fire('unhandledrejection', { reason: { name: 'InvalidStateError', message } });
		fire('unhandledrejection', { reason: 'AbortError: Transition was skipped' });
		expect(sent).toEqual([]);
	});

	it('ignores everything on Google Translate’s proxy, like its injected _DumpExc script', () => {
		const proxied =
			'https://www-joekarlsson-com.translate.goog/blog/how-to-get-started-building-a-homelab-server/';
		const { fire, sent } = load(proxied);
		fire(
			'securitypolicyviolation',
			csp('script-src-elem', "(function() {\n      if(!window['_DumpExc", proxied),
		);
		fire('error', { message: 'TypeError: x is undefined', filename: proxied, lineno: 9 });
		expect(sent).toEqual([]);
	});

	it('still reports a blocked font or script of the site’s own, and other InvalidStateErrors', () => {
		for (const fire_ of [
			(f: ReturnType<typeof load>['fire']) =>
				f('securitypolicyviolation', {
					...csp('font-src', ''),
					blockedURI: 'https://www.joekarlsson.com/fonts/anton.woff2',
				}),
			(f: ReturnType<typeof load>['fire']) =>
				f('unhandledrejection', {
					reason: { name: 'InvalidStateError', message: 'The object is in an invalid state.' },
				}),
		]) {
			const { fire, sent } = load();
			fire_(fire);
			expect(sent).toHaveLength(1);
		}
	});

	it('reports the first error from the site itself, and only the first', () => {
		const { fire, sent } = load();
		fire('error', {
			message: 'TypeError: x is undefined',
			filename: 'https://www.joekarlsson.com/_astro/in-view-play.js',
			lineno: 12,
		});
		fire('securitypolicyviolation', csp('script-src-elem', 'theme()'));
		expect(sent).toEqual([
			{
				props: {
					message: 'TypeError: x is undefined',
					source: 'https://www.joekarlsson.com/_astro/in-view-play.js:12',
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
