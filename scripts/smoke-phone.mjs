#!/usr/bin/env node
// After a deploy, loads the heaviest pages in WebKit (Safari's engine) as an iPhone,
// scrolls each one top to bottom, and fails on a crash, a reload loop or a script
// error. Run by deploy.sh against production.
//
// It can't reproduce iPhone Safari's memory limit, so tests/build-output.test.ts keeps
// the phone budget and diagram filter area in check before anything ships. This catches
// what those can't: a page that crashes the engine outright, keeps reloading, throws,
// or loads a desktop-only game on a phone turned sideways.
//
// Usage: node scripts/smoke-phone.mjs https://www.joekarlsson.com
import { devices, webkit } from 'playwright';

const site = process.argv[2];
if (!site) {
	console.error('Usage: node scripts/smoke-phone.mjs <site url>');
	process.exit(2);
}

const IPHONE = devices['iPhone 15 Pro Max'];
const SIDEWAYS = { ...IPHONE, viewport: { width: 932, height: 430 } };
const PAGES = [
	['/', IPHONE],
	['/blog/', IPHONE],
	['/work/', IPHONE],
	// The heaviest diagram posts, which crashed iPhone Safari on 2026-11-07
	['/blog/homelab-two-years-later/', IPHONE],
	['/blog/why-i-use-doom-to-visualize-mcp-data/', IPHONE],
	['/blog/ai-gateway-data-access-layer/', IPHONE],
	// A desktop-only game, upright and sideways: neither may load it
	['/work/connect-ai-doom/', IPHONE],
	['/work/connect-ai-doom/', SIDEWAYS],
];

const browser = await webkit.launch();

/** Loads one page as a phone, scrolls it through, and returns what went wrong */
async function checkPage(path, device) {
	const context = await browser.newContext(device);
	const page = await context.newPage();
	const problems = [];
	let loads = 0;
	page.on('crash', () => problems.push('the page crashed'));
	page.on('pageerror', (error) => problems.push(`script error: ${error.message}`));
	page.on('load', () => loads++);
	try {
		await page.goto(site + path, { waitUntil: 'load', timeout: 45_000 });
		const height = await page.evaluate(() => document.body.scrollHeight);
		for (let y = 0; y < height; y += 600) {
			await page.evaluate((top) => window.scrollTo(0, top), y);
			await page.waitForTimeout(100);
		}
		await page.waitForTimeout(1500);
		if (loads > 1) problems.push(`reloaded ${loads - 1} time(s) on its own`);
		const gameLoaded = await page.evaluate(() =>
			Boolean(document.querySelector('iframe[data-desktop-src][src]')),
		);
		if (gameLoaded) problems.push('loaded a desktop-only embed on a phone');
	} catch (error) {
		problems.push(error.message.split('\n')[0]);
	}
	await context.close();
	return problems;
}

const failures = [];
try {
	for (const [path, device] of PAGES) {
		const label = `${path} (${device === SIDEWAYS ? 'sideways' : 'upright'})`;
		let problems = await checkPage(path, device);
		// Right after a deploy, Cloudflare can briefly fail a file the new build added
		// (seen 2026-11-07). A real crash or broken page fails again; a hiccup doesn't.
		if (problems.length) {
			console.log(`  retrying ${label}: ${problems.join('; ')}`);
			await new Promise((resolve) => setTimeout(resolve, 20_000));
			problems = await checkPage(path, device);
		}
		if (problems.length) failures.push(`${label}: ${problems.join('; ')}`);
		else console.log(`  ok  ${label}`);
	}
} finally {
	await browser.close();
}

if (failures.length) {
	console.error('Phone check failed:');
	for (const failure of failures) console.error(`  ${failure}`);
	process.exit(1);
}
console.log('  every page held up on an iPhone');
