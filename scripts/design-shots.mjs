#!/usr/bin/env node
// Screenshots one page for a design review (.claude/skills/design-review): the first
// screen and the whole page, on a 1440px desktop in Chromium and an iPhone in WebKit.
// Reduced motion is on, so every crayon mark shows fully drawn and nothing is caught
// mid-animation.
//
// Usage: node scripts/design-shots.mjs <page url> <output dir>
// Writes desktop.png, desktop-full.png, phone.png and phone-full.png.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, devices, webkit } from 'playwright';

const [url, outDir] = process.argv.slice(2);
if (!url || !outDir) {
	console.error('Usage: node scripts/design-shots.mjs <page url> <output dir>');
	process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const VIEWS = [
	['desktop', chromium, { viewport: { width: 1440, height: 900 } }],
	['phone', webkit, devices['iPhone 15 Pro']],
];

for (const [name, engine, device] of VIEWS) {
	const browser = await engine.launch();
	const page = await browser.newPage({ ...device, reducedMotion: 'reduce' });
	const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
	if (!response?.ok()) {
		console.error(`${url} answered ${response?.status()} on ${name}`);
		process.exit(1);
	}
	await page.screenshot({ path: join(outDir, `${name}.png`) });
	// Posters load only near the viewport, so scroll the whole page before the full shot
	const height = await page.evaluate(() => document.body.scrollHeight);
	for (let y = 0; y < height; y += 600) {
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(150);
	}
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForLoadState('networkidle');
	await page.screenshot({ path: join(outDir, `${name}-full.png`), fullPage: true });
	await browser.close();
	console.log(`${name}: ${join(outDir, `${name}.png`)}, ${join(outDir, `${name}-full.png`)}`);
}
