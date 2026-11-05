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

	test('a category filter shows only that category and is kept in the URL', async ({ page }) => {
		const cells = page.locator('#projects-grid > [data-category]');
		const total = await cells.count();
		const filter = page.locator('.project-filter:not([data-filter="all"])').first();
		const category = await filter.getAttribute('data-filter');

		await filter.click();
		await expect(filter).toHaveAttribute('aria-pressed', 'true');
		await expect(page).toHaveURL(new RegExp(`#${category}$`));
		const visible = cells.locator('visible=true');
		expect(await visible.count()).toBeGreaterThan(0);
		expect(await visible.count()).toBeLessThan(total);
		for (const cell of await visible.all()) {
			await expect(cell).toHaveAttribute('data-category', category!);
		}

		// The hash survives a reload
		await page.reload();
		await expect(page.locator(`.project-filter[data-filter="${category}"]`)).toHaveAttribute(
			'aria-pressed',
			'true',
		);

		await page.locator('.project-filter[data-filter="all"]').click();
		await expect(cells.locator('visible=true')).toHaveCount(total);
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

			const lastLink = page
				.getByRole('navigation', { name: 'Table of contents' })
				.getByRole('link')
				.last();
			const id = (await lastLink.getAttribute('href'))!.slice(1);
			await lastLink.click();
			await expect(page.locator(`[id="${id}"]`)).toBeInViewport();
		});
	}
});
