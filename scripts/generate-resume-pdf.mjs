/**
 * Generates public/joe-karlsson-resume.pdf from /resume-pdf/
 *
 * Usage: node scripts/generate-resume-pdf.mjs
 *
 * Requires the dev or preview server to be running, OR pass a URL:
 *   BASE_URL=http://localhost:4321 node scripts/generate-resume-pdf.mjs
 */

import { chromium } from '@playwright/test';
import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

const args = process.argv.slice(2);
const pageArg = args.indexOf('--page');
const outArg = args.indexOf('--out');
const PAGE = pageArg !== -1 ? args[pageArg + 1] : 'resume-pdf';
const FILENAME = outArg !== -1 ? args[outArg + 1] : 'joe-karlsson-resume.pdf';
const OUT = resolve(ROOT, 'public', FILENAME);

async function waitForServer(url, timeout = 15000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			await fetch(url);
			return true;
		} catch {
			await new Promise((r) => setTimeout(r, 300));
		}
	}
	return false;
}

async function generate() {
	let server = null;
	let ownServer = false;

	// Check if a server is already running
	const running = await waitForServer(BASE_URL, 1500);

	if (!running) {
		console.log('No server detected — building and starting preview...');
		execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
		server = spawn('npm', ['run', 'preview'], {
			cwd: ROOT,
			stdio: 'pipe',
			detached: false,
		});
		ownServer = true;
		const ready = await waitForServer(BASE_URL, 20000);
		if (!ready) {
			console.error('Preview server did not start in time.');
			process.exit(1);
		}
	}

	console.log(`Generating PDF from ${BASE_URL}/${PAGE}/ ...`);

	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto(`${BASE_URL}/${PAGE}/`, { waitUntil: 'networkidle' });

	await page.pdf({
		path: OUT,
		format: 'Letter',
		printBackground: true,
		margin: { top: '0.5in', right: '0.6in', bottom: '0.5in', left: '0.6in' },
	});

	await browser.close();

	if (ownServer && server) {
		server.kill();
	}

	console.log(`✓ PDF saved to public/${FILENAME}`);
}

generate().catch((err) => {
	console.error(err);
	process.exit(1);
});
