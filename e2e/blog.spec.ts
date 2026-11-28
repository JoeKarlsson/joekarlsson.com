import { test, expect } from '@playwright/test';

// Post rows the list script is currently showing (it hides the rest with display: none)
const SHOWN_ROWS = '#posts-grid > li:visible';
const POSTS_PER_PAGE = 12;

test.describe('Blog Index Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog');
	});

	test('shows the first page of posts, and more on Show more', async ({ page }) => {
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(POSTS_PER_PAGE);

		await page.getByRole('button', { name: 'Show more posts' }).click();
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(POSTS_PER_PAGE * 2);
	});

	test('a row opens its post from anywhere, and its Written for link still opens its own page', async ({
		page,
	}) => {
		const row = page.locator('#posts-grid > li:visible').first();
		const href = await row.locator('a.card-link').getAttribute('href');
		// A real click on the description, which the title link's ::after covers
		await row.scrollIntoViewIfNeeded();
		const box = (await row.locator('p').first().boundingBox())!;
		await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
		await expect(page).toHaveURL(new RegExp(`${href}$`));

		await page.goto('/blog');
		await page.locator('#posts-grid a[href^="/blog/written-for/"]').first().click();
		await expect(page).toHaveURL(/\/blog\/written-for\/[\w-]+\/$/);
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

	test('closing the lightbox while it opens plays the grow backwards', async ({ page }) => {
		await page.goto('/blog/why-clickhouse-should-be-your-next-database/');
		const picture = page.locator('.prose img.cursor-zoom-in').first();
		await picture.scrollIntoViewIfNeeded();
		await picture.click();
		// Close it partway through the 250ms grow: the same morph should run backwards from
		// there, not snap fully open and start a new shrink. Waits on the animation's own
		// clock, not a fixed delay, so a slow machine still closes mid-grow.
		const reversed = await page.evaluate(async () => {
			const group = () =>
				document
					.getAnimations()
					.find(
						(a) =>
							(a.effect as KeyframeEffect).pseudoElement ===
							'::view-transition-group(lightbox-morph)',
					);
			const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
			while (!(Number(group()?.currentTime) >= 100)) await frame();
			const growing = group()!;
			document.querySelector<HTMLButtonElement>('#image-lightbox button')!.click();
			await frame();
			return { sameAnimation: group() === growing, playbackRate: growing.playbackRate };
		});
		expect(reversed).toEqual({ sameAnimation: true, playbackRate: -1 });
		await expect(page.locator('#image-lightbox')).toBeHidden();
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

test.describe('Film review frame pairs', () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test('an early frame pair keeps clear of the credits in the margin', async ({ page }) => {
		await page.goto('/reviews/mutiny-2026/');
		const credits = await page.locator('.review-credits-margin').boundingBox();
		await expect(page.locator('figure.frame-pair').first()).toHaveClass(/beside-credits/);
		for (const pair of await page.locator('figure.frame-pair').all()) {
			const box = (await pair.boundingBox())!;
			const overlaps = box.x + box.width > credits!.x && box.y < credits!.y + credits!.height;
			expect(overlaps).toBe(false);
		}
	});

	test("a comparison's clips play together, in step (Joe, 2026-11-28)", async ({ page }) => {
		await page.goto('/reviews/three-colours-blue/');
		const clips = page.locator('figure.frame-pair video');
		await expect(clips).toHaveCount(2);
		await clips.first().evaluate((video) => video.scrollIntoView({ block: 'center' }));
		const state = () =>
			clips.evaluateAll((videos: HTMLVideoElement[]) => ({
				playing: videos.filter((v) => !v.paused).length,
				apart: Math.abs(videos[0].currentTime - videos[1].currentTime),
				started: videos[0].currentTime > 1,
			}));
		await expect.poll(async () => (await state()).playing).toBe(2);
		await expect.poll(async () => (await state()).started).toBe(true);
		expect((await state()).apart).toBeLessThan(0.3);
		// Pausing one from its controls pauses both
		await clips.first().evaluate((v: HTMLVideoElement) => v.pause());
		await expect.poll(async () => (await state()).playing).toBe(0);
	});

	test('frames in a comparison stack, never side by side (Joe, 2026-11-27)', async ({ page }) => {
		await page.goto('/reviews/street-fighter-2026/');
		const cells = page.locator('figure.frame-pair').first().locator('.frame-pair-cell');
		const [first, second] = [
			(await cells.nth(0).boundingBox())!,
			(await cells.nth(1).boundingBox())!,
		];
		expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
		expect(second.width).toBeGreaterThan(640);
	});
});

test.describe('Blog search analytics', () => {
	// Record what the page sends to Plausible instead of loading it
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			const sent: unknown[] = [];
			Object.defineProperty(window, 'plausibleSent', { value: sent });
			Object.defineProperty(window, 'plausible', {
				get: () => (name: string, options?: { props?: unknown }) =>
					sent.push([name, options?.props]),
				set: () => {},
			});
		});
		await page.goto('/blog');
	});

	const blogSearches = (page: import('@playwright/test').Page) =>
		page.evaluate(() =>
			(window as unknown as { plausibleSent: [string, unknown][] }).plausibleSent.filter(
				([name]) => name === 'Blog Search',
			),
		);

	test('sends whether anything matched, never the words typed', async ({ page }) => {
		const search = page.getByPlaceholder(/search/i);
		await search.fill('homelab');
		await expect.poll(() => blogSearches(page)).toEqual([['Blog Search', { results: 'some' }]]);
		await search.fill('zzqxv nothing matches this');
		await expect.poll(() => blogSearches(page)).toHaveLength(2);
		expect((await blogSearches(page))[1]).toEqual(['Blog Search', { results: 'none' }]);
	});
});

test('a code block Copy names its code, starting with the word on show', async ({ page }) => {
	await page.goto('/blog/aws-identity-center-guide/');
	const copy = page.locator('.prose pre[data-language="bash"] .copy-button').first();
	// "Copy bash code", not a bare "Copy" repeated on every block (WCAG 2.5.3)
	await expect(copy).toHaveAccessibleName('Copy bash code');
	await expect(copy).toHaveText(/^Copy/);
});
