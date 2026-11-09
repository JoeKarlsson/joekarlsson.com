import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects';

const projectsWithPages = projects.filter((p) => p.page);

test.describe('Work Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/work');
	});

	test('links to every project that has its own page', async ({ page }) => {
		expect(projectsWithPages.length).toBeGreaterThan(0);
		for (const project of projectsWithPages) {
			await expect(
				page.locator(`main a[href="/work/${project.page!.slug}/"]`).first(),
			).toBeAttached();
		}
	});

	// The category filters were removed (f97b903d): projects are grouped by era instead, and
	// a row of links under the hero (where the first selected work plays) indexes those sections
	test('the section index jumps to each era, and its counts match the section', async ({
		page,
	}) => {
		await expect(
			page.locator('header a[href^="/work/"] video, header a[href^="/work/"] img'),
		).toHaveCount(1);
		const index = page.locator('nav[aria-label="Sections"] a');
		const eraLinks = index.filter({ hasNot: page.locator('[href="#selected"]') });
		expect(await eraLinks.count()).toBeGreaterThan(1);
		let listed = 0;
		for (const link of await index.all()) {
			const id = (await link.getAttribute('href'))!.slice(1);
			const count = Number(
				(await link.locator('span').last().textContent())!.match(/^(\d+) pieces?$/)![1],
			);
			const section = page.locator(`section[id="${id}"]`);
			const cards =
				id === 'selected' ? section.locator(':scope > div > a') : section.locator('.project-card');
			await expect(cards, id).toHaveCount(count);
			listed += count;
		}
		expect(listed).toBe(projects.length);

		const last = index.last();
		const id = (await last.getAttribute('href'))!.slice(1);
		await last.click();
		await expect(page).toHaveURL(new RegExp(`#${id}$`));
		await expect(page.locator(`section[id="${id}"] h2`)).toBeInViewport();
	});

	test('the GitHub link opens in a new tab', async ({ page }) => {
		const github = page.getByRole('link', { name: /all repos on GitHub/i });
		await expect(github).toHaveAttribute('href', /github\.com/);
		await expect(github).toHaveAttribute('target', '_blank');
		await expect(github).toHaveAttribute('rel', /noopener/);
	});
});

test.describe('Project page', () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	for (const project of projectsWithPages) {
		// Every #fragment pointing at a real id is checked in tests/build-output.test.ts
		test(`${project.page!.slug} has its title and an "On this page" list that scrolls to a section`, async ({
			page,
		}) => {
			await page.goto(`/work/${project.page!.slug}/`);
			await expect(page.locator('main h1')).toContainText(project.title, { ignoreCase: true });

			// A page with a single section gets no "On this page" list (work/[slug].astro)
			const toc = page.getByRole('navigation', { name: 'Table of contents' });
			if ((await page.locator('article h2[id]').count()) < 2) {
				await expect(toc).toHaveCount(0);
				return;
			}
			const lastLink = toc.getByRole('link').last();
			const id = (await lastLink.getAttribute('href'))!.slice(1);
			await lastLink.click();
			await expect(page.locator(`[id="${id}"]`)).toBeInViewport();
		});
	}
});
