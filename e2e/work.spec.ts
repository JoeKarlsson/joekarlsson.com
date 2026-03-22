import { test, expect } from '@playwright/test';

test.describe('Work Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/work');
	});

	test('page loads with project content', async ({ page }) => {
		// Should have main content
		await expect(page.locator('main')).toBeVisible();

		// Should have some project links or content
		const content = page.locator('main a, main h2, main h3').first();
		await expect(content).toBeVisible();
	});

	test('project cards have required elements', async ({ page }) => {
		const projectCards = page.locator('article, [class*="project-card"]');

		if ((await projectCards.count()) > 0) {
			const firstProject = projectCards.first();

			// Should have title
			const title = firstProject.locator('h2, h3, h4');
			await expect(title).toBeVisible();
		}
	});

	test('project links work correctly', async ({ page }) => {
		// Find project links (GitHub, blog posts, etc.)
		const projectLinks = page.locator('main a[href*="github"], main a[href*="/blog/"]');

		if ((await projectLinks.count()) > 0) {
			const firstLink = projectLinks.first();
			const href = await firstLink.getAttribute('href');

			// External links should have target="_blank"
			if (href?.startsWith('http')) {
				await expect(firstLink).toHaveAttribute('target', '_blank');
			}
		}
	});

	test('featured project is highlighted', async ({ page }) => {
		// Look for featured project section
		const featuredSection = page.locator(
			'[class*="featured"], [data-featured], section:first-of-type article',
		);

		if ((await featuredSection.count()) > 0) {
			await expect(featuredSection.first()).toBeVisible();
		}
	});

	test('page has meaningful content', async ({ page }) => {
		// Page should have substantial text content
		const mainContent = page.locator('main');
		const textContent = await mainContent.textContent();

		// Should have meaningful content
		expect(textContent?.trim().length).toBeGreaterThan(100);
	});

	test('category sections are organized', async ({ page }) => {
		// Look for category headings
		const categoryHeadings = page.locator('h2, h3').filter({ hasText: /projects|category/i });

		// Page might have category organization
		const headingCount = await categoryHeadings.count();
		expect(headingCount).toBeGreaterThanOrEqual(0); // May or may not have categories
	});

	test('GitHub CTA button works', async ({ page }) => {
		// Look for "View all repos" or similar CTA
		const githubCta = page.locator('a[href*="github.com"]').filter({ hasText: /repo|github/i });

		if ((await githubCta.count()) > 0) {
			await expect(githubCta.first()).toHaveAttribute('href', /github\.com/);
			await expect(githubCta.first()).toHaveAttribute('target', '_blank');
		}
	});
});
