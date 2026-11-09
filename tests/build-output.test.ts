import { readFileSync, existsSync, readdirSync } from 'fs';
import { filteredAreaRatio, MAX_FILTERED_AREA_PER_FIGURE } from './svg-filter-area';
import { resolve } from 'path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { halftoneMode } from '../src/utils/halftone';

const dist = resolve(import.meta.dirname, '..', 'dist');

function readDist(path: string): string {
	return readFileSync(resolve(dist, path), 'utf-8');
}

describe('robots.txt', () => {
	const content = readDist('robots.txt');

	it('exists in dist/', () => {
		expect(existsSync(resolve(dist, 'robots.txt'))).toBe(true);
	});

	it('allows all user agents', () => {
		expect(content).toContain('User-agent: *');
		expect(content).toContain('Allow: /');
	});

	it('blocks search and query paths', () => {
		expect(content).toContain('Disallow: /search/');
		expect(content).toContain('Disallow: /?s=');
	});

	it('references the sitemap with correct URL', () => {
		expect(content).toMatch(/Sitemap:\s*https:\/\/www\.joekarlsson\.com\/sitemap-index\.xml/);
	});

	it('references llms.txt files', () => {
		expect(content).toMatch(/# LLMs-Txt:\s*https:\/\/www\.joekarlsson\.com\/llms\.txt/);
		expect(content).toMatch(/# LLMs-Full-Txt:\s*https:\/\/www\.joekarlsson\.com\/llms-full\.txt/);
	});

	it('does not block critical paths', () => {
		expect(content).not.toContain('Disallow: /blog');
		expect(content).not.toContain('Disallow: /about');
		expect(content).not.toContain('Disallow: /rss.xml');
	});
});

describe('sitemap', () => {
	it('sitemap-index.xml exists', () => {
		expect(existsSync(resolve(dist, 'sitemap-index.xml'))).toBe(true);
	});

	it('sitemap-0.xml exists', () => {
		expect(existsSync(resolve(dist, 'sitemap-0.xml'))).toBe(true);
	});

	it('sitemap index references sub-sitemaps', () => {
		const index = readDist('sitemap-index.xml');
		expect(index).toContain('<sitemapindex');
		expect(index).toContain('sitemap-0.xml');
	});

	it('sitemap-0 contains blog URLs', () => {
		const sitemap = readDist('sitemap-0.xml');
		expect(sitemap).toContain('https://www.joekarlsson.com/blog/');
	});

	it('sitemap-0 contains main pages', () => {
		const sitemap = readDist('sitemap-0.xml');
		expect(sitemap).toContain('https://www.joekarlsson.com/about/');
		expect(sitemap).toContain('https://www.joekarlsson.com/work/');
		expect(sitemap).toContain('https://www.joekarlsson.com/uses/');
		expect(sitemap).toContain('https://www.joekarlsson.com/contact/');
	});

	it('all sitemap URLs use the correct domain', () => {
		const sitemap = readDist('sitemap-0.xml');
		const urls = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
		expect(urls.length).toBeGreaterThan(0);
		for (const url of urls) {
			expect(url).toContain('https://www.joekarlsson.com/');
		}
	});

	it('sitemap has a reasonable number of URLs', () => {
		const sitemap = readDist('sitemap-0.xml');
		const urls = sitemap.match(/<loc>/g) || [];
		// Should have at least the main pages + blog posts
		expect(urls.length).toBeGreaterThan(10);
	});
});

describe('RSS feed', () => {
	const content = readDist('rss.xml');

	it('exists in dist/', () => {
		expect(existsSync(resolve(dist, 'rss.xml'))).toBe(true);
	});

	it('is valid XML with RSS structure', () => {
		expect(content).toContain('<?xml');
		expect(content).toContain('<rss');
		expect(content).toContain('<channel>');
	});

	it('has correct title and description', () => {
		expect(content).toContain('<title>Joe Karlsson</title>');
		expect(content).toContain('<description>');
	});

	it('contains blog post items', () => {
		const items = content.match(/<item>/g) || [];
		expect(items.length).toBeGreaterThan(5);
	});

	it('items have required fields', () => {
		// Check first item has all required RSS fields
		expect(content).toContain('<title>');
		expect(content).toContain('<link>');
		expect(content).toContain('<pubDate>');
	});

	it('links use correct domain', () => {
		const links = content.match(/<link>(.*?)<\/link>/g) || [];
		for (const link of links) {
			if (link.includes('http')) {
				expect(link).toContain('https://www.joekarlsson.com/');
			}
		}
	});

	it('references the XSL stylesheet', () => {
		expect(content).toContain('rss-style.xsl');
	});
});

describe('llms.txt', () => {
	const content = readDist('llms.txt');

	it('exists in dist/', () => {
		expect(existsSync(resolve(dist, 'llms.txt'))).toBe(true);
	});

	it('starts with a heading', () => {
		expect(content).toMatch(/^# Joe Karlsson/);
	});

	it('contains key sections', () => {
		expect(content).toContain('## Pages');
		expect(content).toContain('## Areas of Expertise');
		expect(content).toContain('## Selected Works');
		expect(content).toContain('## Newsletter');
	});

	it('references all main pages', () => {
		expect(content).toContain('joekarlsson.com/blog');
		expect(content).toContain('joekarlsson.com/about');
		expect(content).toContain('joekarlsson.com/work');
		expect(content).toContain('joekarlsson.com/uses');
		expect(content).toContain('joekarlsson.com/contact');
	});

	it('links to llms-full.txt', () => {
		expect(content).toContain('llms-full.txt');
	});
	it('lists every indexed top-level page', () => {
		const pages = readdirSync(dist, { withFileTypes: true })
			.filter((d) => d.isDirectory() && existsSync(resolve(dist, d.name, 'index.html')))
			.filter((d) => !readDist(`${d.name}/index.html`).includes('noindex'))
			.map((d) => `joekarlsson.com/${d.name}/)`);
		expect(pages.length).toBeGreaterThan(5);
		expect(pages.filter((page) => !content.includes(page))).toEqual([]);
	});
});

describe('llms-full.txt', () => {
	const content = readDist('llms-full.txt');

	it('exists in dist/', () => {
		expect(existsSync(resolve(dist, 'llms-full.txt'))).toBe(true);
	});

	it('is longer than llms.txt', () => {
		const short = readDist('llms.txt');
		expect(content.length).toBeGreaterThan(short.length);
	});

	it('contains detailed sections', () => {
		expect(content).toContain('## About Joe Karlsson');
		expect(content).toContain('## Professional Experience');
		expect(content).toContain('## Blog Topics');
		expect(content).toContain('### Most Read');
		expect(content).toContain('### All Posts');
	});

	// Built from the site, so a new post, issue or page shows up without a hand edit
	it('links every blog post and newsletter issue', () => {
		const slugsIn = (dir: string) =>
			readdirSync(resolve(dist, dir), { withFileTypes: true })
				.filter((d) => d.isDirectory() && existsSync(resolve(dist, dir, d.name, 'index.html')))
				.map((d) => `/${dir}/${d.name}/`);
		const missing = [...slugsIn('blog'), ...slugsIn('newsletter')]
			.filter((path) => !/\/(category|written-for)\//.test(path))
			.filter((path) => !content.includes(`joekarlsson.com${path})`));
		// TL;DR in Tech back issues are noindex and only counted
		const unlisted = missing.filter(
			(path) => !readDist(`${path.slice(1)}index.html`).includes('noindex'),
		);
		expect(unlisted).toEqual([]);
	});

	it('names no GitHub or container count by hand', () => {
		expect(content).not.toMatch(/\d+\+ (stars|containers|followers on GitHub)/);
	});
});

describe('Markdown copies for agents', () => {
	it('writes the page as Markdown with its title, description and URL', () => {
		const about = readDist('about.md');
		expect(about).toMatch(
			/^---\ntitle: "About"\ndescription: ".+"\nurl: https:\/\/www\.joekarlsson\.com\/about\/\n---/,
		);
		expect(about).toContain('# About');
		expect(about).not.toMatch(/<script|<svg|<button/);
		expect(existsSync(resolve(dist, 'index.md'))).toBe(true);
		expect(existsSync(resolve(dist, 'work/mikrotik-api-client.md'))).toBe(true);
		expect(readDist('about/index.html.md')).toBe(about);
	});

	it('turns each diagram into its label once, not once per desktop and phone drawing', () => {
		const post = readDist('blog/homelab-two-years-later.md');
		const labels = post.match(/^_Diagram: .{40}/gm) ?? [];
		expect(labels.length).toBeGreaterThan(0);
		expect(new Set(labels).size).toBe(labels.length);
		expect(post).toMatch(/^\| .+ \|$/m);
		expect(post).not.toMatch(/\[\]\(/);
	});

	// Boxes the layout places apart (a date, then a title) have no space between them in
	// the HTML, so the copies used to read "2026My Homelab" or "LinkedInProfessional"
	it('keeps text from separate boxes apart', () => {
		expect(readDist('contact.md')).toContain(
			'[LinkedIn](https://www.linkedin.com/in/joekarlsson/): Professional inquiries & speaking',
		);
		expect(readDist('resume.md')).toMatch(/2024 - 2026 Remote/);
		for (const page of ['blog.md', 'work.md', 'newsletter.md', 'index.md', 'about.md']) {
			const text = readDist(page);
			expect(text.match(/[\w.,:]\[(?!\])|\)\[/g), page).toBeNull();
			expect(text, page).not.toMatch(/\b\d{4}[A-Z][a-z]/);
		}
	});

	it('links every indexed page to a Markdown copy that exists, and skips noindex pages', () => {
		for (const page of [
			'index.html',
			'about/index.html',
			'blog/homelab-two-years-later/index.html',
		]) {
			const href = readDist(page).match(
				/<link rel="alternate" type="text\/markdown" href="([^"]+)"/,
			)?.[1];
			expect(href, page).toBeDefined();
			expect(existsSync(resolve(dist, new URL(href!).pathname.slice(1))), href).toBe(true);
		}
		expect(readDist('404.html')).not.toContain('text/markdown');
		expect(existsSync(resolve(dist, '404.md'))).toBe(false);
	});
});

describe('critical pages exist', () => {
	const requiredPages = [
		'index.html',
		'blog/index.html',
		'about/index.html',
		'work/index.html',
		'work/adult-swim-bumper/index.html',
		'work/followspot/index.html',
		'uses/index.html',
		'contact/index.html',
		'talks/index.html',
		'privacy-policy/index.html',
		'404.html',
	];

	for (const page of requiredPages) {
		it(`${page} exists`, () => {
			expect(existsSync(resolve(dist, page))).toBe(true);
		});
	}
});

describe('site.webmanifest', () => {
	it('is valid JSON', () => {
		const raw = readDist('site.webmanifest');
		expect(() => JSON.parse(raw)).not.toThrow();
	});

	it('has required PWA fields', () => {
		const manifest = JSON.parse(readDist('site.webmanifest'));
		expect(manifest.name).toBe('Joe Karlsson');
		expect(manifest.short_name).toBeDefined();
		expect(manifest.icons).toBeInstanceOf(Array);
		expect(manifest.icons.length).toBeGreaterThan(0);
		expect(manifest.display).toBeDefined();
		expect(manifest.theme_color).toBeDefined();
		expect(manifest.background_color).toBeDefined();
	});

	it('pins its identity and start page, and offers a maskable icon for Android', () => {
		const manifest = JSON.parse(readDist('site.webmanifest'));
		expect(manifest.id).toBe('/');
		expect(manifest.start_url).toBe('/');
		expect(manifest.scope).toBe('/');
		expect(manifest.description).toBeTruthy();
		const purposes = manifest.icons.map((icon: { purpose?: string }) => icon.purpose);
		expect(purposes).toContain('maskable');
	});

	it('icon files actually exist', () => {
		const manifest = JSON.parse(readDist('site.webmanifest'));
		for (const icon of manifest.icons) {
			const iconPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
			expect(existsSync(resolve(dist, iconPath))).toBe(true);
		}
	});
});

describe('SEO meta tags', () => {
	const homepage = readDist('index.html');

	it('homepage has title tag', () => {
		expect(homepage).toMatch(/<title>.*Joe Karlsson.*<\/title>/);
	});

	it('homepage has meta description', () => {
		expect(homepage).toMatch(/<meta\s+name="description"\s+content="[^"]+"/);
	});

	it('homepage has canonical URL', () => {
		expect(homepage).toMatch(/<link\s+rel="canonical"\s+href="https:\/\/www\.joekarlsson\.com/);
	});

	it('homepage has Open Graph tags', () => {
		expect(homepage).toMatch(/<meta\s+property="og:title"/);
		expect(homepage).toMatch(/<meta\s+property="og:description"/);
		expect(homepage).toMatch(/<meta\s+property="og:url"/);
	});

	it('homepage links to RSS feed', () => {
		expect(homepage).toMatch(/<link[^>]*type="application\/rss\+xml"/);
	});

	it('homepage links to sitemap', () => {
		expect(homepage).toMatch(/<link[^>]*rel="sitemap"/);
	});

	it('blog posts have meta descriptions', () => {
		const blogDir = resolve(dist, 'blog');
		const posts = readdirSync(blogDir, { withFileTypes: true })
			.filter((e) => e.isDirectory() && e.name !== 'category')
			.map((e) => e.name)
			// Redirect stubs for retired slugs (astro.config.mjs redirects) aren't posts
			.filter((post) => existsSync(resolve(blogDir, post, 'index.html')))
			.filter((post) => !readDist(`blog/${post}/index.html`).includes('<title>Redirecting to:'));
		// Spot-check first 5 blog posts
		for (const post of posts.slice(0, 5)) {
			const postHtml = readDist(`blog/${post}/index.html`);
			expect(postHtml).toMatch(/<meta\s+name="description"/);
			expect(postHtml).toMatch(/<title>/);
		}
	});
});

describe('build output structure', () => {
	it('has _astro directory for assets', () => {
		expect(existsSync(resolve(dist, '_astro'))).toBe(true);
	});

	it('has favicon files', () => {
		expect(existsSync(resolve(dist, 'favicon.svg'))).toBe(true);
		expect(existsSync(resolve(dist, 'favicon-32x32.png'))).toBe(true);
	});

	it('has site.webmanifest', () => {
		expect(existsSync(resolve(dist, 'site.webmanifest'))).toBe(true);
	});

	it('blog posts have been generated', () => {
		const blogDir = resolve(dist, 'blog');
		const entries = readdirSync(blogDir).filter((e) => e !== 'index.html');
		expect(entries.length).toBeGreaterThan(10);
	});

	it('redirect directories exist', () => {
		// WordPress redirects should generate redirect pages
		expect(existsSync(resolve(dist, 'feed'))).toBe(true);
		expect(existsSync(resolve(dist, 'speaking'))).toBe(true);
		expect(existsSync(resolve(dist, 'portfolio'))).toBe(true);
	});
});

const builtPages = (readdirSync(dist, { recursive: true, encoding: 'utf-8' }) as string[]).filter(
	(file) => file.endsWith('.html'),
);

describe('iframe embeds', () => {
	// Local dev and preview send no CSP, so an iframe whose origin is missing from
	// frame-src looks fine everywhere except production. The deployed CSP lives in
	// the OpenTofu provision template; validate-caddyfile.sh keeps this reference
	// Caddyfile in sync with it.
	const caddyfile = readFileSync(resolve(import.meta.dirname, '..', 'Caddyfile'), 'utf-8');
	const frameSources =
		caddyfile
			.match(/frame-src ([^;"]+)/)?.[1]
			.trim()
			.split(/\s+/) ?? [];

	// Matches an exact origin, or a wildcard like https://*.tiktok.com by scheme and host suffix
	function isAllowedByFrameSrc(origin: string): boolean {
		const { protocol, hostname } = new URL(origin);
		return frameSources.some((source) => {
			const [sourceScheme, sourceHost] = source.split('://');
			if (!sourceHost?.startsWith('*.')) return origin === source;
			return protocol === `${sourceScheme}:` && hostname.endsWith(sourceHost.slice(1));
		});
	}

	it('finds frame-src in the Caddyfile CSP', () => {
		expect(frameSources.length).toBeGreaterThan(0);
	});

	it('every built iframe loads from an origin frame-src allows', () => {
		const blocked: string[] = [];
		for (const page of builtPages) {
			for (const [, src] of readDist(page).matchAll(
				/<iframe\b[^>]*?\s(?:data-desktop-)?src="([^"]+)"/g,
			)) {
				const origin = new URL(src, 'https://www.joekarlsson.com').origin;
				if (!isAllowedByFrameSrc(origin)) blocked.push(`${page}: ${src}`);
			}
		}
		expect(blocked).toEqual([]);
	});

	// A CSS-hidden iframe still loads, so a game hidden on phones still runs there:
	// the Connect AI × DOOM embed crashed an iPhone that way. Anything but a video
	// player uses data-desktop-src, which src/scripts/load-desktop-embeds.ts turns
	// into src only on wide screens.
	// A light embed checked at phone size opts in with embedOnPhones, which marks it
	// data-phone-ok.
	it('only video and data-phone-ok embeds load on phones; the rest use data-desktop-src', () => {
		const loadsOnPhones: string[] = [];
		for (const page of builtPages) {
			for (const [tag, src] of readDist(page).matchAll(/<iframe\b[^>]*?\ssrc="([^"]+)"[^>]*>/g)) {
				const { hostname } = new URL(src, 'https://www.joekarlsson.com');
				if (
					!/\sdata-phone-ok\b/.test(tag) &&
					!/(^|\.)(youtube(-nocookie)?|tiktok)\.com$/.test(hostname)
				) {
					loadsOnPhones.push(`${page}: ${src}`);
				}
			}
		}
		expect(loadsOnPhones).toEqual([]);
	});

	// Screenshots of a site embedded right above them look like a second player, so
	// they show only on phones, where a desktop-only embed doesn't load
	it('a project page with a desktop-only embed shows its screenshots only on phones', () => {
		const html = readDist('work/rose-hobart/index.html');
		expect(html).toMatch(
			/<section[^>]*class="[^"]*\bembed-large:hidden\b[^"]*"[^>]*aria-labelledby="screenshots"/,
		);
		expect(html).not.toContain('href="#screenshots"');
	});
});

describe('in-page anchor links', () => {
	// Renaming a heading changes its slug and silently breaks any #fragment link
	// to it. Lychee runs without fragment checking, so this is the only guard.
	const idsByPage = new Map<string, Set<string>>();
	function idsOn(page: string): Set<string> | undefined {
		if (!idsByPage.has(page)) {
			if (!existsSync(resolve(dist, page))) return undefined;
			idsByPage.set(
				page,
				new Set([...readDist(page).matchAll(/\s(?:id|name)="([^"]+)"/g)].map(([, id]) => id)),
			);
		}
		return idsByPage.get(page);
	}

	it('every internal #fragment link points at an id that exists', () => {
		const broken: string[] = [];
		for (const page of builtPages) {
			for (const [, href] of readDist(page).matchAll(/\shref="([^"]*#[^"]+)"/g)) {
				const url = new URL(href.replace(/&amp;/g, '&'), `https://www.joekarlsson.com/${page}`);
				if (url.origin !== 'https://www.joekarlsson.com') continue;
				const path = url.pathname.replace(/^\/|\/$/g, '');
				const targetPage = path.endsWith('.html')
					? path
					: path
						? `${path}/index.html`
						: 'index.html';
				const fragment = decodeURIComponent(url.hash.slice(1));
				const ids = idsOn(targetPage);
				if (ids && !ids.has(fragment)) broken.push(`${page}: ${href}`);
			}
		}
		expect(broken).toEqual([]);
	});

	it('no FAQ <summary> holds a link (axe nested-interactive)', () => {
		const nested = builtPages.filter((page) =>
			/<summary>(?:(?!<\/summary>).)*<a\s/s.test(readDist(page)),
		);
		expect(nested).toEqual([]);
	});
});

describe('share links', () => {
	const pages = {
		'blog post': 'blog/how-to-get-started-building-a-homelab-server/index.html',
		'project page': 'work/pixelpane/index.html',
		'newsletter issue':
			'newsletter/can-open-knowledge-format-make-claude-code-more-accurate-and-cheaper-i-tested-it/index.html',
	};

	for (const [kind, path] of Object.entries(pages)) {
		describe(kind, () => {
			const html = readDist(path);

			// [network, share endpoint, query parameter that carries the post]
			for (const [network, endpoint, param] of [
				['Hacker+News', 'https://news.ycombinator.com/submitlink', 'u'],
				['Bluesky', 'https://bsky.app/intent/compose', 'text'],
				['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/', 'url'],
				['X', 'https://x.com/intent/post', 'text'],
			]) {
				it(`links to ${network} with a tracked Share Click event`, () => {
					const link = html.match(
						new RegExp(
							`<a href="([^"]+)"[^>]*plausible-event-name=Share\\+Click plausible-event-network=${network.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} `,
						),
					);
					expect(link).toBeTruthy();
					const url = new URL(link![1].replace(/&amp;/g, '&'));
					expect(url.origin + url.pathname).toBe(endpoint);
					expect(url.searchParams.has(param)).toBe(true);
				});
			}
		});
	}

	it('submits a recap newsletter issue as its canonical blog post with the short shareTitle', () => {
		const html = readDist(pages['newsletter issue']);
		const hnUrl = new URL(
			html
				.match(/href="(https:\/\/news\.ycombinator\.com\/submitlink[^"]+)"/)![1]
				.replace(/&amp;/g, '&'),
		);
		expect(hnUrl.searchParams.get('u')).toBe(
			'https://www.joekarlsson.com/blog/claude-md-open-knowledge-format/',
		);
		expect(hnUrl.searchParams.get('t')!.length).toBeLessThanOrEqual(80);
	});
});

// LinkedIn previews don't render WebP, so every share image is a JPEG built under /og/
describe('link preview meta', () => {
	const pages = readdirSync(dist, { recursive: true })
		.filter((f) => typeof f === 'string' && f.endsWith('index.html'))
		.map((f) => f as string);

	const metaContent = (html: string, key: string) =>
		html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];

	it('every og:image is a JPEG that exists in the build', () => {
		const broken = pages.flatMap((page) => {
			const ogImage = metaContent(readDist(page), 'og:image');
			if (!ogImage) return [];
			const path = new URL(ogImage).pathname;
			if (!path.endsWith('.jpg') || !existsSync(resolve(dist, path.slice(1)))) {
				return [`${page}: ${ogImage}`];
			}
			return [];
		});
		expect(broken).toEqual([]);
	});

	it('og:title and twitter:title drop the " | Joe Karlsson" suffix', () => {
		const suffixed = pages.filter((page) => {
			const html = readDist(page);
			return [metaContent(html, 'og:title'), metaContent(html, 'twitter:title')].some((t) =>
				t?.endsWith(' | Joe Karlsson'),
			);
		});
		expect(suffixed).toEqual([]);
	});

	it("a blog post's og:image:alt is its hero image alt text, not its title", () => {
		const html = readDist('blog/local-voice-ai-home-assistant-gpu/index.html');
		const alt = metaContent(html, 'og:image:alt');
		expect(alt).toMatch(/^Home Assistant local voice pipeline architecture/);
		expect(metaContent(html, 'twitter:image:alt')).toBe(alt);
	});
});

describe('post suggestions', () => {
	it("homepage Recent posts lists only Joe's own posts, never employer posts", () => {
		const homepage = readDist('index.html');
		const recent = homepage.slice(homepage.indexOf('Recent posts'), homepage.indexOf('posts →'));
		expect(recent).toContain('href="/blog/');
		expect(recent).not.toContain('Written for');
	});
});

describe('scribbles keep their shape', () => {
	// Only marks that trace a target (underlines, the three lines, boxes) and hover
	// rings may stretch; coils, bursts, tallies and the rest keep their proportions
	const STRETCHING_VIEWBOXES = ['0 0 600 60', '0 0 600 300', '0 0 900 200'];

	it('every self-drawing mark keeps its proportions unless it traces a target', () => {
		const squashable = ['index.html', 'about/index.html', 'blog/index.html'].flatMap((page) =>
			[...readDist(page).matchAll(/<svg class="redraw[^>]*>/g)]
				.map(([tag]) => ({
					viewBox: tag.match(/viewBox="([^"]+)"/)![1],
					fit: tag.match(/preserveAspectRatio="([^"]+)"/)![1],
				}))
				.filter(({ viewBox, fit }) =>
					STRETCHING_VIEWBOXES.includes(viewBox) ? fit !== 'none' : fit !== 'xMidYMid meet',
				)
				.map((mark) => `${page}: ${mark.viewBox} ${mark.fit}`),
		);
		expect(squashable).toEqual([]);
	});

	it('neighbouring cards draw different hover boxes', () => {
		const grid = readDist('work/index.html').split('id="era-2026"')[1];
		// Each card draws its box from a shared definition (#hover-box-N in BaseLayout)
		const boxes = [...grid.matchAll(/<svg class="hover-ring[^]*?<use href="#(hover-box-\d+)"/g)]
			.slice(0, 6)
			.map(([, id]) => id);
		expect(new Set(boxes).size).toBe(6);
	});
});

describe('device and identity meta', () => {
	const homepage = readDist('index.html');

	it('ships /favicon.ico for clients that skip the link tags', () => {
		expect(existsSync(resolve(dist, 'favicon.ico'))).toBe(true);
	});

	it('declares the site dark-only and names the iOS home-screen bookmark', () => {
		expect(homepage).toContain('<meta name="color-scheme" content="only dark">');
		expect(homepage).toContain('<meta name="apple-mobile-web-app-title" content="Joe Karlsson">');
		expect(homepage).toContain('<meta name="format-detection" content="telephone=no">');
	});

	it('links every profile with rel="me", matching the Person sameAs', () => {
		const relMe = [...homepage.matchAll(/<link rel="me" href="([^"]+)"/g)].map((m) => m[1]);
		expect(relMe.length).toBeGreaterThan(0);
		const graph = JSON.parse(
			homepage.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1],
		)['@graph'];
		const person = graph.find((node: { '@type': string }) => node['@type'] === 'Person');
		expect(person.sameAs).toEqual(relMe);
	});

	it('leaves out tags no major browser or platform reads', () => {
		expect(homepage).not.toMatch(/<meta name="title"/);
		expect(homepage).not.toMatch(/<meta name="keywords"/);
		expect(homepage).not.toMatch(/<meta name="twitter:url"/);
	});

	it('tags posts with their section and categories, and /about as a profile', () => {
		const post = readDist('blog/opentofu-proxmox-immutable-homelab/index.html');
		expect(post).toMatch(/<meta property="article:section" content="[^"]+">/);
		expect(post).toMatch(/<meta property="article:tag" content="[^"]+">/);
		const about = readDist('about/index.html');
		expect(about).toContain('<meta property="og:type" content="profile">');
		expect(about).toContain('<meta property="profile:last_name" content="Karlsson">');
	});
});

describe('security.txt', () => {
	const content = readDist('.well-known/security.txt');

	it('has a contact and at least 30 days before it expires (RFC 9116: renew Expires yearly)', () => {
		expect(content).toMatch(/^Contact: https:\/\//m);
		const expires = new Date(content.match(/^Expires: (.+)$/m)![1]);
		const thirtyDaysOut = Date.now() + 30 * 24 * 60 * 60 * 1000;
		expect(expires.getTime()).toBeGreaterThan(thirtyDaysOut);
	});
});

// The launch checklist over every built page, not a sample: content pages break these
// one at a time (a Markdown "# " heading adds a second h1, imported posts bring
// 200-character descriptions, Markdown images arrive without sizes).
describe('every page', () => {
	const pages = builtPages
		.map((file) => ({ file, html: readDist(file) }))
		// Redirect stubs carry their own minimal head
		.filter(({ html }) => !html.slice(0, 400).includes('http-equiv="refresh"'));
	const isNoindex = (html: string) => /<meta name="robots" content="noindex/.test(html);
	const indexable = pages.filter(({ html }) => !isNoindex(html));
	// A recap whose canonical points at another page shares that page's title and stays out of the sitemap
	const canonicalElsewhere = (file: string, html: string) => {
		const path = html.match(
			/<link rel="canonical" href="https:\/\/www\.joekarlsson\.com\/([^"]*)"/,
		)?.[1];
		return path !== undefined && `${path}index.html` !== file;
	};

	it('locks out Dark Reader and names the author', () => {
		const missing = pages
			.filter(({ file }) => file !== 'resume-pdf/index.html')
			.filter(
				({ html }) =>
					!html.includes('<meta name="darkreader-lock">') ||
					!html.includes('<meta name="author" content="Joe Karlsson">'),
			)
			.map(({ file }) => file);
		expect(missing).toEqual([]);
	});

	it('keeps indexable descriptions to 160 characters', () => {
		const long = indexable
			.map(({ file, html }) => {
				const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
				return { file, length: description.replace(/&(#\d+|\w+);/g, 'x').length };
			})
			.filter(({ length }) => length > 160);
		expect(long).toEqual([]);
	});

	it('gives every indexable page its own title', () => {
		const byTitle = new Map<string, string[]>();
		for (const { file, html } of indexable) {
			if (canonicalElsewhere(file, html)) continue;
			const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
			byTitle.set(title, [...(byTitle.get(title) ?? []), file]);
		}
		expect([...byTitle].filter(([, files]) => files.length > 1)).toEqual([]);
	});

	it('has exactly one h1', () => {
		const wrong = pages
			.map(({ file, html }) => ({ file, h1s: (html.match(/<h1[\s>]/g) ?? []).length }))
			.filter(({ h1s }) => h1s !== 1);
		expect(wrong).toEqual([]);
	});

	it('sizes every image in a post body', () => {
		const unsized = pages.flatMap(({ file, html }) =>
			[...(html.match(/<div class="prose[\s\S]*?<\/article>/)?.[0] ?? '').matchAll(/<img\b[^>]*>/g)]
				.map((m) => m[0])
				.filter((img) => !/\bwidth=/.test(img) || !/\bheight=/.test(img))
				.map((img) => `${file}: ${img.slice(0, 100)}`),
		);
		expect(unsized).toEqual([]);
	});

	it('lists exactly the indexable pages in the sitemap', () => {
		const listed = new Set(
			readdirSync(dist)
				.filter((f) => /^sitemap-\d+\.xml$/.test(f))
				.flatMap((f) => [
					...readDist(f).matchAll(/<loc>https:\/\/www\.joekarlsson\.com\/([^<]*)<\/loc>/g),
				])
				.map((m) => `${m[1]}index.html`),
		);
		const missing = indexable
			.filter(({ file, html }) => file !== '404.html' && !canonicalElsewhere(file, html))
			.filter(({ file }) => !listed.has(file))
			.map(({ file }) => file);
		const unindexed = pages
			.filter(({ file, html }) => listed.has(file) && isNoindex(html))
			.map(({ file }) => file);
		expect({ missing, unindexed }).toEqual({ missing: [], unindexed: [] });
	});
});

describe('performance guards', () => {
	it('blog post heroes reserve their real size, so the title never jumps when they load', async () => {
		const posts = readdirSync(resolve(dist, 'blog'), { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => `blog/${entry.name}/index.html`)
			.filter((page) => existsSync(resolve(dist, page)));
		const wrong: string[] = [];
		for (const page of posts) {
			const article = readDist(page).split('<article')[1] ?? '';
			// \s before src: the hero's srcset comes first and must not match
			const hero = article.match(
				/<img\b[^>]*?\ssrc="(\/images\/[^"]+)"[^>]*width="(\d+)" height="(\d+)"/,
			);
			if (!hero) continue;
			const [, src, width, height] = hero;
			const real = await sharp(resolve(dist, src.slice(1))).metadata();
			if (Number(width) !== real.width || Number(height) !== real.height) {
				wrong.push(`${page}: ${width}x${height}, file is ${real.width}x${real.height}`);
			}
		}
		expect(wrong).toEqual([]);
	});

	it('hover rings draw a shared path instead of carrying their own copy', () => {
		const html = readDist('uses/index.html');
		const rings = [...html.matchAll(/<svg class="hover-ring[^]*?<\/svg>/g)].map(([svg]) => svg);
		expect(rings.length).toBeGreaterThan(10);
		const inline = rings.filter((svg) => svg.includes('<path'));
		expect(inline).toEqual([]);
		for (const [, id] of html.matchAll(/<use href="#(hover-ring-\d+)"/g)) {
			expect(html).toContain(`id="${id}"`);
		}
	});

	// Astro caches rendered markdown without tracking the inlined SVG files, so a stale
	// cache can ship diagrams the source no longer has (see tests/svg-filter-area.ts)
	it('diagrams inlined in built posts keep their filters small enough for iPhone Safari', () => {
		const tooMuch: string[] = [];
		let figures = 0;
		for (const page of builtPages.filter((p) => /^(blog|newsletter)\//.test(p))) {
			for (const [svg] of readDist(page).matchAll(/<svg\b[^>]*viewBox="0 0 [^"]+"[^]*?<\/svg>/g)) {
				if (!svg.includes('-crayon')) continue;
				figures++;
				const ratio = filteredAreaRatio(svg);
				if (ratio > MAX_FILTERED_AREA_PER_FIGURE) tooMuch.push(`${page}: ${ratio.toFixed(1)}x`);
			}
		}
		expect(figures).toBeGreaterThan(100);
		expect(tooMuch).toEqual([]);
	});

	// What a phone pays for on one page: each data-halftone image or clip is a live WebGL
	// canvas copy, autoplaying clips decode at once, and every filtered or boiling SVG
	// element keeps an offscreen buffer that redraws each frame. Posts that blew past this
	// (2026-11-07) ran iPhone Safari out of memory and reloaded forever. Limits sit about
	// 1.5x above the heaviest page at the time, so a page that suddenly doubles fails here
	// before it crashes a phone. Raise one only after loading that page on an iPhone.
	const PHONE_BUDGET = {
		'live pink images and clips': 100, // blog index: 65
		'autoplaying clips': 25, // /work: 17
		'filtered SVG elements': 250, // the AI gateway post: 169 (desktop and phone diagrams)
		'boiling SVG elements': 250, // the linked lists post: 161
	};
	it('no page goes over the phone budget', () => {
		const over: string[] = [];
		for (const page of builtPages) {
			const html = readDist(page);
			const cost = {
				'live pink images and clips':
					html.match(/<(?:img|video)\b[^>]*data-halftone/g)?.length ?? 0,
				'autoplaying clips':
					html.match(/<video\b[^>]*(?:\sautoplay|data-autoplay-in-view)/g)?.length ?? 0,
				'filtered SVG elements': html.match(/filter="url\(/g)?.length ?? 0,
				'boiling SVG elements':
					html.match(/class="[^"]*\b(?:d-flow|d-callout|d-paper|redraw|redraw-strokes)\b/g)
						?.length ?? 0,
			};
			for (const [what, count] of Object.entries(cost)) {
				const limit = PHONE_BUDGET[what as keyof typeof PHONE_BUDGET];
				if (count > limit) over.push(`${page}: ${count} ${what} (limit ${limit})`);
			}
		}
		expect(over).toEqual([]);
	});

	// iPhone Safari never repaints when an element switches to a different filter, so a
	// CSS animation that swaps filter: url(#a) for url(#b) froze every wobble on the
	// phone. Wobbles animate the noise inside one filter instead (BaseLayout).
	it('no animation swaps between SVG filters, and the boil and warble filters animate themselves', () => {
		const css = readdirSync(resolve(dist, '_astro'))
			.filter((file) => file.endsWith('.css'))
			.map((file) => readDist(`_astro/${file}`))
			.join('\n');
		const keyframes = [
			...css.matchAll(/@keyframes\s*([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g),
		];
		expect(keyframes.length).toBeGreaterThan(5);
		const swapping = keyframes
			.filter(([, , body]) => /filter:\s*url\(/.test(body))
			.map(([, name]) => name);
		expect(swapping).toEqual([]);
		const home = readDist('index.html');
		for (const id of ['boil', 'warble']) {
			expect(home, id).toMatch(
				new RegExp(
					`<filter id="${id}"[^>]*>\\s*<feTurbulence[^>]*>\\s*<animate attributeName="seed"`,
				),
			);
		}
	});

	// Cards load the .400w/.800w copies, and sharp reads only an animated WebP's first
	// frame unless told otherwise, which froze the boiling diagram thumbnail
	it('resized copies of an animated thumbnail stay animated', () => {
		const hero = 'images/blog/complete-guide-node-client-server-communication';
		const animated = readdirSync(resolve(dist, hero)).filter((file) =>
			/^thumb-[0-9a-f]{8}\.(400w|800w)\.webp$/.test(file),
		);
		expect(animated.length).toBe(2);
		for (const file of animated) {
			// An animated WebP carries an ANIM chunk in its RIFF header
			expect(
				readFileSync(resolve(dist, hero, file))
					.subarray(0, 64)
					.includes('ANIM'),
				file,
			).toBe(true);
		}
	});

	it('project screenshots and gallery stills keep their own colors', () => {
		for (const page of ['work/followspot/index.html']) {
			const html = readDist(page);
			const stills = [...html.matchAll(/<img[^>]*src="(\/images\/[^"]+)"[^>]*>/g)].filter(
				([, src]) => /column-(wide|narrow)/.test(src),
			);
			expect(stills.length, page).toBeGreaterThan(0);
			for (const [tag, src] of stills) expect(tag, src).not.toContain('data-halftone');
		}
	});

	it('Around the house clips get the live halftone, flat where they show text', () => {
		const clips = [
			...readDist('index.html').matchAll(/<video[^>]*src="(\/images\/home\/[a-z-]+\.mp4)"[^>]*>/g),
		];
		expect(clips.length).toBeGreaterThanOrEqual(4);
		for (const [tag, src] of clips) {
			expect(tag, src).toContain(`data-halftone="${halftoneMode(src)}"`);
		}
		expect(halftoneMode('/images/home/kindle.mp4')).toBe('flat');
	});

	it("a project's light poster is what its video waits on, and its share image stays full size", () => {
		const featured = readDist('work/index.html');
		expect(featured).toContain('poster="/images/projects/connect-ai-doom-poster.webp"');
		const page = readDist('work/connect-ai-doom/index.html');
		expect(page).toContain('poster="/images/projects/connect-ai-doom-poster.webp"');
		expect(page).toContain('og/images/projects/connect-ai-doom.jpg');
	});
});
