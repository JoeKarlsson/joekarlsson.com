import { test, expect } from '@playwright/test';

test.describe('Header Navigation', () => {
	test('desktop nav links are visible and work', async ({ page }) => {
		await page.goto('/');

		// Check all nav links exist
		const nav = page.locator('header nav');
		await expect(nav.getByRole('link', { name: 'Joe Karlsson' })).toHaveAttribute('href', '/');
		await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Works' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Uses' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();

		// Click Blog and verify navigation
		await nav.getByRole('link', { name: 'Blog' }).click();
		await expect(page).toHaveURL(/\/blog/);
	});

	test('marks the current page with aria-current', async ({ page }) => {
		await page.goto('/about/');

		const nav = page.locator('header nav');
		await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
		await expect(nav.getByRole('link', { name: 'Blog' })).not.toHaveAttribute('aria-current');
	});
});

test.describe('Mobile Navigation', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test('the MENU sticker opens every section link', async ({ page }) => {
		await page.goto('/');

		const nav = page.locator('header nav');
		await expect(nav.getByRole('link', { name: 'Joe Karlsson', exact: true })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Blog', exact: true })).toBeHidden();
		const menu = nav.locator('[data-nav-menu-toggle]');
		await expect(menu).toHaveAccessibleName('Menu');
		await menu.click();
		await expect(menu).toHaveAttribute('aria-expanded', 'true');
		// Its name follows the word it shows (WCAG 2.5.3)
		await expect(menu).toHaveAccessibleName('Close');
		for (const name of [
			'Joe Karlsson',
			'Blog',
			'About',
			'Works',
			'Newsletter',
			'Uses',
			'Contact',
		]) {
			await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
		}
		await nav.getByRole('link', { name: 'About' }).click();
		await expect(page).toHaveURL(/\/about/);
	});
});

test.describe('Pause motion', () => {
	test('freezes animations and videos, and resumes them', async ({ page }) => {
		await page.goto('/');
		// A playing video stands in for the hero and collage loops that arrive in Phase 2
		await page.evaluate(() => {
			const video = document.createElement('video');
			video.id = 'test-video';
			let paused = false;
			Object.defineProperty(video, 'paused', { get: () => paused });
			video.pause = () => {
				paused = true;
			};
			video.play = async () => {
				paused = false;
			};
			document.body.append(video);
		});

		const button = page.getByRole('button', { name: 'Pause motion' });
		const echo = page.locator('footer .echo > span[aria-hidden="true"]').first();
		await expect(echo).toHaveCSS('animation-play-state', 'running');

		await button.click();
		await expect(button).toHaveAttribute('aria-pressed', 'true');
		await expect(echo).toHaveCSS('animation-play-state', 'paused');
		expect(
			await page.evaluate(() => (document.getElementById('test-video') as HTMLVideoElement).paused),
		).toBe(true);

		await button.click();
		await expect(echo).toHaveCSS('animation-play-state', 'running');
		expect(
			await page.evaluate(() => (document.getElementById('test-video') as HTMLVideoElement).paused),
		).toBe(false);
	});

	test('stays paused on the next page until resumed', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Pause motion' }).click();

		await page.goto('/about/');
		const resume = page.getByRole('button', { name: 'Pause motion' });
		await expect(resume).toHaveAttribute('aria-pressed', 'true');
		const echo = page.locator('footer .echo > span[aria-hidden="true"]').first();
		await expect(echo).toHaveCSS('animation-play-state', 'paused');
		// The header clip is on screen, but in-view-play doesn't start it while paused
		const clip = page.locator('header video');
		await page.waitForTimeout(1000);
		expect(await clip.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);

		await resume.click();
		await expect(echo).toHaveCSS('animation-play-state', 'running');
		await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);

		await page.goto('/blog/');
		await expect(page.getByRole('button', { name: 'Pause motion' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
	});
});

test.describe('Footer', () => {
	test('footer links are functional', async ({ page }) => {
		await page.goto('/');

		const footer = page.locator('footer');

		// Check key footer links exist
		await expect(footer.getByRole('link', { name: /rss/i })).toBeVisible();

		// Check copyright year
		const currentYear = new Date().getFullYear().toString();
		await expect(footer).toContainText(currentYear);
	});

	test('newsletter CTA posts to listmonk', async ({ page }) => {
		await page.goto('/');

		const form = page.locator('footer form.newsletter-signup');
		await expect(form).toHaveAttribute(
			'action',
			'https://newsletter.joekarlsson.com/subscription/form',
		);
		await expect(form.locator('input[name="l"]')).toHaveValue(/^[0-9a-f-]{36}$/);
		await expect(form.getByRole('button', { name: /subscribe/i })).toBeVisible();
	});
});

test.describe('Page Navigation', () => {
	test('can navigate through all main pages', async ({ page }) => {
		const pages = [
			{ path: '/', title: /joe karlsson/i },
			{ path: '/blog', title: /blog/i },
			{ path: '/about', title: /about/i },
			{ path: '/work', title: /works/i },
			{ path: '/uses', title: /uses/i },
			{ path: '/contact', title: /contact/i },
		];

		for (const p of pages) {
			await page.goto(p.path);
			await expect(page).toHaveTitle(p.title);
		}
	});

	test('404 page displays for invalid routes', async ({ page }) => {
		await page.goto('/this-page-does-not-exist-xyz');
		// Page should contain 404 somewhere
		await expect(page.locator('body')).toContainText('404');
	});
});

test.describe('Homepage montage', () => {
	test('starts again after a pause the browser made', async ({ page }) => {
		await page.goto('/');
		const montage = page.locator('video[aria-label^="Montage"]');
		await expect.poll(() => montage.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);

		// Chrome pauses muted video in a hidden tab; that isn't the viewer stopping it
		await montage.evaluate((v: HTMLVideoElement) => {
			v.pause();
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await expect.poll(() => montage.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
	});
});
