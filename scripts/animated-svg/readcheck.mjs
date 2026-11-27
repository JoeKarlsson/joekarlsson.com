// Reading-time check for animated SVGs: every text that appears and then goes away must stay
// fully on screen long enough to read. Text still showing when a one-shot animation freezes
// stays forever and passes. The rule is Lemo-Opuscar's readcheck (core/render/readcheck.mjs,
// MIT): non-space characters / 15 a second + 1.5 s, never under 1.5 s.
//
//   node scripts/animated-svg/readcheck.mjs <file.svg> [...] [--step 0.0833]
//
// A text counts as on screen only when every one of its tspans shows (so a typewriter line
// counts from its last letter), its opacity is at least 0.5, and its box is inside the frame.
// Text revealed by a clip path or mask is not seen as hidden: the check misses those.
// Exit 0 all pass, 1 a text is too short, 2 a file has no animation to check.
import { pathToFileURL } from 'node:url';
import { openSvg, seek } from './page.mjs';

export const STEP = 1 / 12;

/** Seconds a text needs: Opuscar's Latin rule. */
export const needs = (text) => Math.max(1.5, text.replace(/\s/g, '').length / 15 + 1.5);

/**
 * Longest run each text spends on screen, from `frames` (one Set of visible text keys per
 * step). On a loop, a run that ends the loop joins the one that starts it; on a one-shot
 * animation, a text still on at the end never leaves.
 */
export function runs(frames, step, loops) {
	const out = new Map();
	const keys = new Set(frames.flatMap((f) => [...f]));
	for (const key of keys) {
		const on = frames.map((f) => f.has(key));
		if (on.at(-1) && !loops) {
			out.set(key, Infinity);
			continue;
		}
		if (on.every(Boolean)) {
			out.set(key, Infinity);
			continue;
		}
		let best = 0;
		let run = 0;
		// On a loop, walk twice round so a run across the seam counts whole
		const walk = loops ? [...on, ...on] : on;
		for (const v of walk) {
			run = v ? run + 1 : 0;
			best = Math.max(best, run);
		}
		out.set(key, Math.min(best, on.length) * step);
	}
	return out;
}

export async function readcheck(file, step = STEP) {
	const { browser, page, end, loops } = await openSvg(file);
	try {
		if (end === 0) return { file, skipped: true };
		const frames = [];
		for (let t = 0; t < end + step / 2; t += step) {
			await seek(page, t);
			frames.push(
				new Set(
					await page.evaluate(() => {
						const svg = document.querySelector('svg');
						const frame = svg.getBoundingClientRect();
						const shown = (el) => {
							let opacity = 1;
							for (let e = el; e && e !== svg; e = e.parentElement) {
								const s = getComputedStyle(e);
								if (s.display === 'none') return false;
								opacity *= parseFloat(s.opacity);
							}
							return getComputedStyle(el).visibility === 'visible' && opacity >= 0.5;
						};
						return [...svg.querySelectorAll('text')]
							.filter((text) => {
								const parts = [text, ...text.querySelectorAll('tspan')];
								if (!parts.every(shown) || !text.textContent.trim()) return false;
								const r = text.getBoundingClientRect();
								// The box is the font's em box: its top and bottom overhang the letters
								const slack = r.height * 0.2;
								return (
									r.left >= frame.left - 1 &&
									r.top >= frame.top - slack &&
									r.right <= frame.right + 1 &&
									r.bottom <= frame.bottom + slack
								);
							})
							.map((text) => text.textContent.trim());
					}),
				),
			);
		}
		const results = [...runs(frames, step, loops)].map(([text, got]) => ({
			text,
			got,
			need: needs(text),
		}));
		return { file, loops, results };
	} finally {
		await browser.close();
	}
}

// Run as a command, not when another script imports it (argv[1] is then that script, or unset)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const args = process.argv.slice(2);
	const stepAt = args.indexOf('--step');
	const step = stepAt >= 0 ? Number(args.splice(stepAt, 2)[1]) : STEP;
	if (!(step > 0)) throw new Error('--step takes seconds, e.g. 0.05');
	let bad = 0;
	let skipped = 0;
	for (const file of args) {
		const r = await readcheck(file, step);
		if (r.skipped) {
			skipped++;
			console.log(`--  ${file}: no animation, not checked`);
			continue;
		}
		for (const { text, got, need } of r.results) {
			if (got >= need - 1e-6) continue;
			bad++;
			console.log(
				`BAD ${file}: "${text.slice(0, 40)}" is on ${got.toFixed(2)}s, needs ${need.toFixed(2)}s`,
			);
		}
	}
	console.log(`${args.length - skipped} checked, ${bad} too short`);
	process.exit(bad ? 1 : skipped === args.length ? 2 : 0);
}
