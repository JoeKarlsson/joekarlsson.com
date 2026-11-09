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

	// Every project shows once: the selected works in their section, the rest in their era
	test('lists every project once, selected works first', async ({ page }) => {
		const selected = page.locator('section#selected > div > a');
		const eraCards = page.locator('section .project-card');
		expect((await selected.count()) + (await eraCards.count())).toBe(projects.length);
		const ids = await page.locator('main section[id]').evaluateAll((s) => s.map((el) => el.id));
		expect(ids.slice(0, 2)).toEqual(['selected', 'statement']);
	});

	// The hero reel plays each selected work in turn; its caption and link follow the one on screen
	test('the hero reel links to the selected work on screen', async ({ page }) => {
		const reel = page.locator('header a[data-reel-pieces]');
		const pieces: { title: string; href: string }[] = JSON.parse(
			(await reel.getAttribute('data-reel-pieces'))!,
		);
		const slice = Number(await reel.getAttribute('data-reel-slice'));
		await expect(reel).toHaveAttribute('href', pieces[0].href);
		await reel.locator('video').evaluate(
			(v: HTMLVideoElement, t) => {
				Object.defineProperty(v, 'currentTime', { value: t, configurable: true });
				v.dispatchEvent(new Event('timeupdate'));
			},
			slice * 2 + 0.1,
		);
		await expect(reel).toHaveAttribute('href', pieces[2].href);
		await expect(reel.locator('[data-reel-title]')).toHaveText(pieces[2].title);
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
