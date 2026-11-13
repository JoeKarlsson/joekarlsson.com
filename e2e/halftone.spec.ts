import { test, expect, type Page } from '@playwright/test';

// src/scripts/halftone.ts draws img/video[data-halftone] in pink on a canvas laid
// over each one, or shows the color originals when it can't.
const UNMASKED_RENDERER_WEBGL = 0x9246;

async function stubRenderer(page: Page, name: string) {
	await page.addInitScript(
		([param, rendererName]) => {
			const getParameter = WebGLRenderingContext.prototype.getParameter;
			WebGLRenderingContext.prototype.getParameter = function (p: number) {
				return p === param ? rendererName : getParameter.call(this, p);
			};
		},
		[UNMASKED_RENDERER_WEBGL, name] as const,
	);
}

async function expectOriginalsShown(page: Page) {
	await expect(page.locator('html')).not.toHaveClass(/halftone-on/);
	await expect(page.locator('canvas[aria-hidden="true"]')).toHaveCount(0);
	await expect(page.locator('video[data-halftone]').first()).toHaveCSS('opacity', '1');
}

test.describe('Halftone', () => {
	test('with no WebGL the color originals show', async ({ page }) => {
		await page.addInitScript(() => {
			const getContext = HTMLCanvasElement.prototype.getContext;
			// @ts-expect-error narrowing the overloads isn't worth it in a stub
			HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
				return type === 'webgl' ? null : getContext.call(this, type, ...rest);
			};
		});
		await page.goto('/about/');
		await expectOriginalsShown(page);
	});

	test('with only software WebGL the color originals show', async ({ page }) => {
		await stubRenderer(
			page,
			'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)',
		);
		await page.goto('/about/');
		await expectOriginalsShown(page);
	});

	test('with a GPU, each canvas covers its original and the original keeps its label', async ({
		page,
	}) => {
		// Headless Chromium only has SwiftShader, which draws correctly, just slowly:
		// name it a GPU so the halftone path runs
		await stubRenderer(page, 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)');
		await page.goto('/about/');

		await expect(page.locator('html')).toHaveClass(/halftone-on/);
		const video = page.locator('video[data-halftone]').first();
		const canvas = video.locator('xpath=following-sibling::canvas[1]');
		await expect(canvas).toHaveAttribute('aria-hidden', 'true');
		const [videoBox, canvasBox] = [await video.boundingBox(), await canvas.boundingBox()];
		expect(canvasBox).toEqual(videoBox);

		// Hidden with opacity, so screen readers still get the alt text and labels
		await expect(video).toHaveCSS('opacity', '0');
		const label = (await video.getAttribute('aria-label'))!;
		await expect(page.getByLabel(label, { exact: true })).toBeAttached();
	});
	test('a lost WebGL context shows the originals, and pink comes back with it', async ({
		page,
	}) => {
		// iOS Safari drops the context to free GPU memory; drawing on with it painted black
		await stubRenderer(page, 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)');
		await page.addInitScript(() => {
			const getContext = HTMLCanvasElement.prototype.getContext;
			// @ts-expect-error narrowing the overloads isn't worth it in a stub
			HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
				const context = getContext.call(this, type, ...rest);
				if (type === 'webgl' && context) Object.assign(window, { halftoneGl: context });
				return context;
			};
		});
		await page.goto('/about/');
		await expect(page.locator('html')).toHaveClass(/halftone-on/);

		const loseContext = () =>
			page.evaluate(() => {
				const gl = (window as unknown as { halftoneGl: WebGLRenderingContext }).halftoneGl;
				const extension = gl.getExtension('WEBGL_lose_context')!;
				Object.assign(window, { halftoneLoseContext: extension });
				extension.loseContext();
			});
		await loseContext();
		await expect(page.locator('html')).not.toHaveClass(/halftone-on/);

		await page.evaluate(() =>
			(
				window as unknown as { halftoneLoseContext: WEBGL_lose_context }
			).halftoneLoseContext.restoreContext(),
		);
		await expect(page.locator('html')).toHaveClass(/halftone-on/);
	});
});
