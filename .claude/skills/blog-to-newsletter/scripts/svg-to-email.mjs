// Rasterizes a post's SVG diagram into an email JPEG: 528px wide at 2x (1056px),
// on the site's black, with the fonts the diagrams use (Anton, Hanken Grotesk,
// Fraunces). Gmail and Outlook don't show SVG, so every diagram needs this copy.
//
//   node .claude/skills/blog-to-newsletter/scripts/svg-to-email.mjs <in.svg> <out.jpg>
//
// Use the desktop SVG, not the .phone.svg (too tall for an email). Needs ffmpeg and the network.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const [svgPath, out] = process.argv.slice(2);
if (!svgPath?.endsWith('.svg') || !out?.endsWith('.jpg')) {
	console.error('usage: svg-to-email.mjs <in.svg> <out.jpg>');
	process.exit(1);
}
const fonts = 'family=Anton&family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Hanken+Grotesk:wght@400;600;700';
const work = mkdtempSync(join(tmpdir(), 'svg-to-email-'));
const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 528, height: 600 }, deviceScaleFactor: 2 });
	await page.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=block">
<style>:root{--font-anton:Anton,sans-serif;--font-hanken-grotesk:'Hanken Grotesk',sans-serif}
body{margin:0;background:#0a0a0a}svg{width:528px;height:auto;display:block}</style>${readFileSync(svgPath, 'utf8')}`);
	await page.evaluate(() => document.fonts.ready);
	const png = join(work, 'diagram.png');
	await page.locator('svg').first().screenshot({ path: png });
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-q:v', '3', out]);
} finally {
	await browser.close();
	rmSync(work, { recursive: true, force: true });
}
console.log(out);
