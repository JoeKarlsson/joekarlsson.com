import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

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
		expect(content).toMatch(/LLMs-Txt:\s*https:\/\/www\.joekarlsson\.com\/llms\.txt/);
		expect(content).toMatch(/LLMs-Full-Txt:\s*https:\/\/www\.joekarlsson\.com\/llms-full\.txt/);
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
		expect(content).toContain('## Featured Projects');
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
		expect(content).toContain('## Recent Posts');
	});

	it('lists recent blog posts dynamically', () => {
		// Recent posts section should have markdown links
		const recentSection = content.split('### Recent Posts')[1]?.split('###')[0] || '';
		const links = recentSection.match(/- \[/g) || [];
		expect(links.length).toBeGreaterThan(0);
	});
});

describe('critical pages exist', () => {
	const requiredPages = [
		'index.html',
		'blog/index.html',
		'about/index.html',
		'work/index.html',
		'uses/index.html',
		'contact/index.html',
		'talk-archive/index.html',
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
		const posts = readdirSync(blogDir).filter((e) => e !== 'index.html' && e !== 'category');
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
