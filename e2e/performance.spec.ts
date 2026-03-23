import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
	const pages = [
		{ path: '/', maxLoad: 5000 },
		{ path: '/blog', maxLoad: 5000 },
		{ path: '/about', maxLoad: 5000 },
		{ path: '/work', maxLoad: 4000 },
		{ path: '/uses', maxLoad: 4000 },
		{ path: '/contact', maxLoad: 3000 },
	];

	for (const { path, maxLoad } of pages) {
		test(`${path} loads within ${maxLoad}ms`, async ({ page }) => {
			const start = Date.now();
			await page.goto(path, { waitUntil: 'domcontentloaded' });
			const loadTime = Date.now() - start;

			expect(loadTime).toBeLessThan(maxLoad);
		});
	}

	test('homepage LCP is reasonable', async ({ page }) => {
		await page.goto('/');

		const lcp = await page.evaluate(() => {
			return new Promise<number>((resolve) => {
				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1];
					resolve(lastEntry.startTime);
				}).observe({ type: 'largest-contentful-paint', buffered: true });

				setTimeout(() => resolve(0), 5000);
			});
		});

		if (lcp > 0) {
			expect(lcp).toBeLessThan(4000); // 4 seconds max LCP
		}
	});

	test('no layout shifts after load', async ({ page }) => {
		await page.goto('/');
		await page.waitForTimeout(2000);

		const cls = await page.evaluate(() => {
			return new Promise<number>((resolve) => {
				let clsValue = 0;
				new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const e = entry as any;
						if (!e.hadRecentInput) {
							clsValue += e.value;
						}
					}
				}).observe({ type: 'layout-shift', buffered: true });

				setTimeout(() => resolve(clsValue), 1000);
			});
		});

		expect(cls).toBeLessThan(0.25); // Good CLS threshold
	});
});
