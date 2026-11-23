import { test, expect, type Page } from '@playwright/test';

// The pink tone is CSS (global.css, "Pink pictures"): each img or video[data-halftone] is
// filtered gray and its frame, the element right around it, multiplies pink over it. That
// only looks right when the frame is positioned and exactly the picture's box, corners
// included; a frame any bigger tints whatever else is in it (a caption turns pink).
// One page of each type that has pink pictures, at desktop and phone widths.
const PAGES = [
	'/',
	'/work/',
	'/work/adult-swim-bumper/',
	'/about/',
	'/blog/',
	'/blog/doom-mcp-server/',
	'/talks/',
	'/talks/an-introduction-to-iot-internet-of-toilets/',
	'/reviews/',
	'/reviews/28-years-later/',
	'/reviews/stats/',
	'/newsletter/',
	'/uses/',
	'/resume/',
	'/contact/',
];

/** Every shown pink picture whose frame doesn't fit it, and why */
async function badFrames(page: Page) {
	return page.$$eval('img[data-halftone], video[data-halftone]', (pictures) =>
		pictures.flatMap((picture) => {
			// Hidden on purpose (the other screen size's copy) is fine; shown at no size isn't
			if (!picture.checkVisibility()) return [];
			const box = picture.getBoundingClientRect();
			if (box.width === 0 || box.height === 0)
				return [`${picture.getAttribute('src') ?? picture.getAttribute('poster')}: shown at 0 size`];
			const parent = picture.parentElement!;
			const frame = parent.tagName === 'PICTURE' ? parent.parentElement! : parent;
			const frameStyle = getComputedStyle(frame);
			const pink = getComputedStyle(frame, '::after');
			const frameBox = frame.getBoundingClientRect();
			// The corners you see: a frame that clips rounds both the picture and the pink
			const clip =
				frameStyle.overflow !== 'visible' ? parseFloat(frameStyle.borderTopLeftRadius) : 0;
			const corner = (radius: string) => `${Math.max(parseFloat(radius), clip)}px`;
			const problems = [
				!getComputedStyle(picture).filter.includes('grayscale') && 'no gray filter',
				pink.mixBlendMode !== 'multiply' && 'frame has no pink layer',
				frameStyle.position === 'static' && 'frame not positioned',
				(['x', 'y', 'width', 'height'] as const).some(
					(side) => Math.abs(box[side] - frameBox[side]) > 1,
				) &&
					`frame ${Math.round(frameBox.width)}x${Math.round(frameBox.height)} around a ${Math.round(box.width)}x${Math.round(box.height)} picture`,
				corner(getComputedStyle(picture).borderTopLeftRadius) !==
					corner(pink.borderTopLeftRadius) &&
					`corners ${corner(getComputedStyle(picture).borderTopLeftRadius)} vs pink ${corner(pink.borderTopLeftRadius)}`,
			].filter(Boolean);
			return problems.length
				? [
						`${picture.getAttribute('src') ?? picture.getAttribute('poster')}: ${problems.join(', ')}`,
					]
				: [];
		}),
	);
}

test.describe('Pink pictures', () => {
	for (const width of [1440, 390]) {
		test(`every picture sits in a frame that fits it exactly, ${width}px wide`, async ({
			page,
		}) => {
			test.setTimeout(120_000);
			await page.setViewportSize({ width, height: 900 });
			const bad: string[] = [];
			let checked = 0;
			for (const path of PAGES) {
				await page.goto(path);
				checked += await page.locator('img[data-halftone], video[data-halftone]').count();
				bad.push(...(await badFrames(page)).map((problem) => `${path} ${problem}`));
			}
			expect(checked).toBeGreaterThan(100);
			expect(bad).toEqual([]);
		});
	}

	test('a picture is pink before any script runs', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/blog/doom-mcp-server/');
		const picture = page.locator('.masthead img[data-halftone]');
		await expect(picture).toBeVisible();
		expect(await picture.evaluate((img) => getComputedStyle(img).opacity)).toBe('1');
		expect(await badFrames(page)).toEqual([]);
		await context.close();
	});
});
