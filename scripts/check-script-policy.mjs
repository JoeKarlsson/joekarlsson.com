// Loads the built site the way visitors get it, with its per-page script policy and Trusted
// Types (src/integrations/script-csp.mjs), and fails on anything the policy blocks or any
// script error. e2e can't catch these: it runs on the dev server, which has no policy.
//
//   node scripts/check-script-policy.mjs http://localhost:4321
import { chromium } from 'playwright';

const base = process.argv[2];
if (!base) throw new Error('usage: node scripts/check-script-policy.mjs <base-url>');

// One page per layout or script-heavy feature: lightbox, collages, code blocks, folds,
// search, the newsletter form, the 404
const PAGES = [
	'/',
	'/blog/',
	'/about/',
	'/talks/',
	'/work/',
	'/work/connect-ai-doom/',
	'/uses/',
	'/reviews/stats/',
	'/newsletter/',
	'/blog/sentence-length-semicolons-punctuation/',
	'/blog/recording-setup-tour/',
	'/blog/why-clickhouse-should-be-your-next-database/',
	'/404.html',
];

const problems = [];
const browser = await chromium.launch();
for (const viewport of [
	{ width: 1440, height: 900 },
	{ width: 390, height: 844 },
]) {
	const context = await browser.newContext({ viewport });
	await context.addInitScript(() => {
		window.__violations = [];
		document.addEventListener('securitypolicyviolation', (event) =>
			window.__violations.push(`${event.violatedDirective} ${event.blockedURI} ${event.sample}`),
		);
	});
	for (const path of PAGES) {
		const where = `${viewport.width}px ${path}`;
		const page = await context.newPage();
		page.on('pageerror', (error) => problems.push(`${where}: script error: ${error.message}`));
		await page.goto(base + path, { waitUntil: 'load' });
		// Scroll through, so lazy scripts (collages, posters, doodles) run too
		await page.mouse.wheel(0, 6000);
		await page.waitForTimeout(800);
		const opener = page.locator('.lightbox-opener').first();
		if (await opener.count()) {
			await opener.focus();
			await page.keyboard.press('Enter');
			await page.waitForTimeout(400);
			await page.keyboard.press('Escape');
		}
		for (const violation of await page.evaluate(() => window.__violations))
			problems.push(`${where}: blocked by the script policy: ${violation}`);
		await page.close();
	}
	await context.close();
}
await browser.close();

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`Script policy: ${PAGES.length} pages at 2 widths, nothing blocked, no script errors`);
