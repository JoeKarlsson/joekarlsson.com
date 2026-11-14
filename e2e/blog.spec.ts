import { test, expect } from '@playwright/test';

// Post rows the list script is currently showing (it hides the rest with display: none)
const SHOWN_ROWS = '#posts-grid > li:visible';
const POSTS_PER_PAGE = 12;

test.describe('Blog Index Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog');
	});

	test('shows the first page of posts, and more load on scroll', async ({ page }) => {
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(POSTS_PER_PAGE);

		await page.locator('#load-more-sentinel').scrollIntoViewIfNeeded();
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(POSTS_PER_PAGE * 2);
	});

	test('search narrows the list to matching posts and counts them', async ({ page }) => {
		await page.getByPlaceholder(/search/i).fill('homelab');

		await expect(page.locator('#results-count')).toHaveText(/^\d+ posts? found$/);
		const rows = page.locator(SHOWN_ROWS);
		expect(await rows.count()).toBeGreaterThan(0);
		expect(await rows.count()).toBeLessThanOrEqual(POSTS_PER_PAGE);
	});

	test('search forgives spacing and typos', async ({ page }) => {
		const search = page.getByPlaceholder(/search/i);
		const firstRow = page.locator(SHOWN_ROWS).first();
		for (const query of ['open tofu', 'opne tofu', 'opentofu proxmx']) {
			await search.fill(query);
			await expect(firstRow).toContainText(/opentofu/i);
		}
	});

	test('search shows no results message for invalid query', async ({ page }) => {
		await page.getByPlaceholder(/search/i).fill('xyznonexistentpost123');
		await expect(page.getByText(/no posts match that search/i)).toBeVisible();
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(0);
	});

	test('Popular sort puts a most-read post first, and ten posts carry the flame', async ({
		page,
	}) => {
		const flame = 'One of my 10 most-read posts';
		await expect(page.locator('#posts-grid').getByText(flame, { exact: true })).toHaveCount(10);

		const popular = page.getByRole('button', { name: 'Popular' });
		await popular.click();
		await expect(popular).toHaveAttribute('aria-pressed', 'true');
		await expect(page.getByRole('button', { name: 'Newest' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
		// Rows are reordered with CSS order, so find the one placed first
		const firstShown = page.locator('#posts-grid > li[style*="order: 0"]');
		await expect(firstShown.getByText(flame, { exact: true })).toBeAttached();
	});

	test('a category link opens its page with that category marked current', async ({ page }) => {
		const categories = page.getByRole('navigation', { name: 'Blog categories' });
		const category = categories.locator('a[href^="/blog/category/"]').first();
		const href = await category.getAttribute('href');

		await category.click();
		await expect(page).toHaveURL(href!);
		await expect(
			page.getByRole('navigation', { name: 'Blog categories' }).locator(`a[href="${href}"]`),
		).toHaveAttribute('aria-current', 'page');
		expect(await page.locator(SHOWN_ROWS).count()).toBeGreaterThan(0);
	});

	test("category and written-for pages don't repeat their own tag on every row", async ({
		page,
	}) => {
		await page.goto('/blog/category/ai/');
		await expect(page.locator('#posts-grid').getByText('AI', { exact: true })).toHaveCount(0);
		await page.goto('/blog/written-for/cdata/');
		await expect(page.locator('#posts-grid').getByText('Written for CData')).toHaveCount(0);
	});
});

test.describe('Individual Blog Post', () => {
	test("a post's clips play one at a time, the one most in view", async ({ page }) => {
		await page.goto('/blog/recording-setup-tour/');
		const lighting = (name: string) => page.locator(`.prose video[src*="${name}"]`);
		// Center the middle lighting clip; its neighbors are partly on screen too
		await lighting('lighting-2').evaluate((video) => video.scrollIntoView({ block: 'center' }));
		await expect
			.poll(() => lighting('lighting-2').evaluate((v: HTMLVideoElement) => !v.paused))
			.toBe(true);
		for (const name of ['lighting-1', 'lighting-3'])
			expect(await lighting(name).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
	});

	test('blog post page loads correctly', async ({ page }) => {
		// Go to blog and click first post
		await page.goto('/blog');
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		// Should have a title (h1)
		await expect(page.locator('h1')).toBeVisible();

		// Should have prose content
		const content = page.locator('.prose, main p').first();
		await expect(content).toBeVisible();
	});

	test('blog post has readable content', async ({ page }) => {
		await page.goto('/blog');
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		// Should have substantial content
		const mainContent = page.locator('main, article').first();
		const textContent = await mainContent.textContent();
		expect(textContent?.trim().length).toBeGreaterThan(200);
	});

	test('a picture opens full size in a lightbox and Escape closes it', async ({ page }) => {
		await page.goto('/blog/why-clickhouse-should-be-your-next-database/');
		// A keyboard reaches a real button after the picture; a mouse clicks the picture
		const opener = page.getByRole('button', { name: 'Enlarge image', exact: true }).first();
		const lightbox = page.locator('#image-lightbox');
		await opener.focus();
		await expect(opener).toBeInViewport();
		await page.keyboard.press('Enter');
		await expect(lightbox).toBeVisible();
		await expect(lightbox.locator('img')).toHaveAttribute('src', /\.webp$/);
		await page.keyboard.press('Escape');
		await expect(lightbox).toBeHidden();
		await expect(opener).toBeFocused();
		await page.locator('.prose img.cursor-zoom-in').first().click();
		await expect(lightbox).toBeVisible();
	});

	test('between two clips fully on screen, the one nearer the middle plays', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 1100 });
		await page.goto('/blog/recording-setup-tour/');
		const lighting = (name: string) => page.locator(`.prose video[src*="${name}"]`);
		// Both lighting-2 and lighting-3 fully on screen, lighting-3 a little nearer the middle
		await page.evaluate(() => {
			const [two, three] = ['lighting-2', 'lighting-3'].map((name) =>
				document.querySelector(`.prose video[src*="${name}"]`)!.getBoundingClientRect(),
			);
			const centers = (two.top + two.bottom + three.top + three.bottom) / 4 + scrollY;
			scrollTo(0, centers + 60 - innerHeight / 2);
		});
		await expect
			.poll(() => lighting('lighting-3').evaluate((v: HTMLVideoElement) => !v.paused))
			.toBe(true);
		expect(await lighting('lighting-2').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
	});

	test('a double-tap zooms the enlarged picture and a swipe down closes it', async ({ page }) => {
		await page.goto('/blog/why-clickhouse-should-be-your-next-database/');
		const picture = page.locator('.prose img.cursor-zoom-in').first();
		await picture.scrollIntoViewIfNeeded();
		await picture.click();
		const lightbox = page.locator('#image-lightbox');
		const enlarged = lightbox.locator('img');
		await expect(lightbox).toBeVisible();
		// The opening morph takes input only once it has landed
		await expect(lightbox).not.toHaveAttribute('data-morph');
		const { width, height } = page.viewportSize()!;
		await page.mouse.dblclick(width / 2, height / 2);
		await expect(enlarged).toHaveCSS('transform', /matrix\(2\.5,/);
		await page.mouse.dblclick(width / 2, height / 2);
		await expect(enlarged).toHaveCSS('transform', 'none');
		await page.mouse.move(width / 2, height / 3);
		await page.mouse.down();
		await page.mouse.move(width / 2, height / 3 + 200, { steps: 8 });
		await page.mouse.up();
		await expect(lightbox).toBeHidden();
	});

	test('closing the lightbox while it opens still shrinks the picture back', async ({ page }) => {
		await page.goto('/blog/why-clickhouse-should-be-your-next-database/');
		const picture = page.locator('.prose img.cursor-zoom-in').first();
		await picture.scrollIntoViewIfNeeded();
		await picture.click();
		// Close it during the 250ms grow: the picture should still shrink back into the
		// post (the morph group), not cut to a page fade. Waits on the animations, not a
		// fixed delay: on a slow machine the dialog isn't open yet 100ms after the click.
		const morphs = await page.evaluate(async () => {
			const morphing = () =>
				document
					.getAnimations()
					.filter(
						(a) =>
							(a.effect as KeyframeEffect).pseudoElement ===
							'::view-transition-group(lightbox-morph)',
					).length;
			const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
			while (!morphing()) await frame();
			document.querySelector<HTMLButtonElement>('#image-lightbox button')!.click();
			// The grow is skipped at once; the shrink starts a frame or more later
			for (const until = performance.now() + 2000; performance.now() < until;) {
				await frame();
				if (morphing()) return morphing();
			}
			return 0;
		});
		expect(morphs).toBeGreaterThan(0);
	});

	test('an enlarged collage gets its own ids, so its shadows still point at its own filters', async ({
		page,
	}) => {
		await page.goto('/blog/sentence-length-semicolons-punctuation/');
		const collage = page
			.locator('.prose .diagram', {
				has: page.getByRole('img', { name: /^Paper collage on black/ }),
			})
			.getByRole('button', { name: 'Enlarge diagram' });
		await collage.focus();
		await page.keyboard.press('Enter');
		const copy = page.locator('#image-lightbox .diagram-enlarged svg');
		await expect(copy).toBeVisible();
		const { repeated, broken } = await page.evaluate(() => {
			const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
			const refs = [...document.querySelectorAll('#image-lightbox svg [filter]')].map((element) =>
				element.getAttribute('filter')!.slice(5, -1),
			);
			return {
				repeated: ids.filter((id, i) => ids.indexOf(id) !== i),
				broken: refs.filter((id) => !document.querySelector(`#image-lightbox #${CSS.escape(id)}`)),
			};
		});
		expect(repeated).toEqual([]);
		expect(broken).toEqual([]);
	});
});
