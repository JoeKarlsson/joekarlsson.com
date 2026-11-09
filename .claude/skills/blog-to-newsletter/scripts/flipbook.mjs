// Draws a flipbook GIF for an email: each frame is a picture on a rounded card
// over black, an Anton label bottom-left and a pink note bottom-right, in the
// style of the gift guide's picks.gif. Email can't play video, so this is how a
// post's clips or a set of pictures make it into an issue.
//
//   node .claude/skills/blog-to-newsletter/scripts/flipbook.mjs <out.gif> <seconds-per-frame> \
//     'path/to/a.webp|Label one|Note' 'path/to/b.webp|Label two|Note' ...
//
// Paths are relative to the repo root. Needs ffmpeg and the network (Google Fonts).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const [out, secondsPerFrame, ...frames] = process.argv.slice(2);
if (!out?.endsWith('.gif') || !Number(secondsPerFrame) || frames.length < 2) {
	console.error('usage: flipbook.mjs <out.gif> <seconds-per-frame> "image|label|note" ... (2+ frames)');
	process.exit(1);
}
const escapeHtml = (s = '') => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const work = mkdtempSync(join(tmpdir(), 'flipbook-'));
const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 600, height: 420 } });
	for (const [i, frame] of frames.entries()) {
		const [image, label, note] = frame.split('|');
		const type = extname(image).slice(1).replace('jpg', 'jpeg');
		const src = `data:image/${type};base64,${readFileSync(image).toString('base64')}`;
		await page.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@700&display=block">
<style>body{margin:0;background:#0a0a0a;width:600px;height:420px}
.c{position:absolute;left:20px;top:20px;width:560px;height:315px;border-radius:10px;overflow:hidden;background:#fff}
.c img{width:100%;height:100%;object-fit:cover;display:block}
.l{position:absolute;left:20px;bottom:22px;font:400 34px/1 Anton,sans-serif;text-transform:uppercase;color:#ededed}
.n{position:absolute;right:20px;bottom:26px;font:700 22px/1 'Hanken Grotesk',sans-serif;color:#ff4fd8}</style>
<div class="c"><img src="${src}"></div><div class="l">${escapeHtml(label)}</div><div class="n">${escapeHtml(note)}</div>`);
		await page.evaluate(() => document.fonts.ready);
		await page.screenshot({ path: join(work, `frame-${i}.png`) });
	}
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(1 / Number(secondsPerFrame)), '-i', join(work, 'frame-%d.png'),
		'-vf', 'split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', '-loop', '0', out]);
} finally {
	await browser.close();
	rmSync(work, { recursive: true, force: true });
}
console.log(out);
