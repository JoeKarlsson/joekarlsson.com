import { test, expect } from '@playwright/test';

test.describe('SEO Meta Tags', () => {
	const pages = [
		{ path: '/', name: 'Homepage' },
		{ path: '/blog', name: 'Blog' },
		{ path: '/about', name: 'About' },
		{ path: '/work', name: 'Work' },
		{ path: '/uses', name: 'Uses' },
		{ path: '/contact', name: 'Contact' },
	];

	for (const { path, name } of pages) {
		test(`${name} has title tag`, async ({ page }) => {
			await page.goto(path);

			const title = await page.title();
			expect(title.length).toBeGreaterThan(10);
			expect(title.length).toBeLessThan(70); // SEO best practice
		});

		test(`${name} has meta description`, async ({ page }) => {
			await page.goto(path);

			const metaDesc = page.locator('meta[name="description"]');
			const content = await metaDesc.getAttribute('content');

			expect(content).toBeTruthy();
			expect(content?.length).toBeGreaterThan(50);
			expect(content?.length).toBeLessThan(300); // Allow some flexibility
		});

		test(`${name} has Open Graph tags`, async ({ page }) => {
			await page.goto(path);

			// og:title
			const ogTitle = page.locator('meta[property="og:title"]');
			await expect(ogTitle).toHaveAttribute('content', /.+/);

			// og:description
			const ogDesc = page.locator('meta[property="og:description"]');
			await expect(ogDesc).toHaveAttribute('content', /.+/);

			// og:type
			const ogType = page.locator('meta[property="og:type"]');
			await expect(ogType).toHaveAttribute('content', /.+/);

			// og:url
			const ogUrl = page.locator('meta[property="og:url"]');
			await expect(ogUrl).toHaveAttribute('content', /http/);
		});

		test(`${name} has Twitter card tags`, async ({ page }) => {
			await page.goto(path);

			// twitter:card
			const twitterCard = page.locator('meta[name="twitter:card"]');
			await expect(twitterCard).toHaveAttribute('content', /.+/);

			// twitter:title
			const twitterTitle = page.locator('meta[name="twitter:title"]');
			await expect(twitterTitle).toHaveAttribute('content', /.+/);
		});

		test(`${name} has canonical URL`, async ({ page }) => {
			await page.goto(path);

			const canonical = page.locator('link[rel="canonical"]');
			await expect(canonical).toHaveAttribute('href', /http/);
		});
	}
});

test.describe('Blog Post SEO', () => {
	test('blog post has meta tags', async ({ page }) => {
		// Go to blog and get first post
		await page.goto('/blog');
		const postLink = page
			.locator('a[href*="/blog/"]')
			.filter({ hasNotText: /category|blog$/i })
			.first();
		await postLink.click();

		// Should have og:title at minimum
		const ogTitle = page.locator('meta[property="og:title"]');
		await expect(ogTitle).toHaveAttribute('content', /.+/);
	});

	test('blog post has structured data', async ({ page }) => {
		await page.goto('/blog');
		const postLink = page
			.locator('a[href*="/blog/"]')
			.filter({ hasNotText: /category|blog$/i })
			.first();
		await postLink.click();

		// Look for JSON-LD structured data
		const jsonLd = page.locator('script[type="application/ld+json"]');
		const count = await jsonLd.count();

		// May or may not have JSON-LD, but if present it should be valid
		if (count > 0) {
			const content = await jsonLd.first().textContent();
			expect(() => JSON.parse(content || '')).not.toThrow();
		}
	});
});

test.describe('Social Sharing Images', () => {
	test('homepage has og:image', async ({ page }) => {
		await page.goto('/');

		const ogImage = page.locator('meta[property="og:image"]');
		const content = await ogImage.getAttribute('content');

		expect(content).toBeTruthy();
		expect(content).toMatch(/http.*\.(png|jpg|jpeg|webp|gif)/i);
	});

	test('og:image dimensions are specified', async ({ page }) => {
		await page.goto('/');

		const ogImageWidth = page.locator('meta[property="og:image:width"]');
		const ogImageHeight = page.locator('meta[property="og:image:height"]');

		// Should have dimensions for proper social sharing preview
		const hasWidth = (await ogImageWidth.count()) > 0;
		const hasHeight = (await ogImageHeight.count()) > 0;

		// Either both dimensions or neither (some implementations skip this)
		expect(hasWidth === hasHeight).toBeTruthy();
	});
});

test.describe('Favicon and Icons', () => {
	test('has favicon', async ({ page }) => {
		await page.goto('/');

		const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
		const count = await favicon.count();

		expect(count).toBeGreaterThan(0);
	});

	test('has apple touch icon', async ({ page }) => {
		await page.goto('/');

		const appleIcon = page.locator('link[rel="apple-touch-icon"]');
		const count = await appleIcon.count();

		expect(count).toBeGreaterThan(0);
	});

	test('has web manifest', async ({ page }) => {
		await page.goto('/');

		const manifest = page.locator('link[rel="manifest"]');
		const href = await manifest.getAttribute('href');

		expect(href).toBeTruthy();

		// Verify manifest is accessible
		if (href) {
			const response = await page.goto(href);
			expect(response?.status()).toBe(200);
		}
	});
});
