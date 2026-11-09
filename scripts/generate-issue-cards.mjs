#!/usr/bin/env node
/**
 * Draws the Poster header card for newsletter issues: public/images/newsletter/{slug}/card.webp,
 * set as the issue's heroImage (which also makes its og:image via src/pages/og/).
 *
 * The card is HTML drawn in headless Chromium with the site's fonts and crayon marks
 * (src/data/scribbles.ts), so it matches the pages it sits on. What it says comes from
 * scripts/issue-card-content.mjs. An essay can name a photo with `cardPhoto` (a path under
 * public/) and must describe it in `cardPhotoAlt`; without one, the card circles the issue number.
 *
 * Each card also gets an animated copy (timeline in scripts/issue-card-motion.mjs): card.gif,
 * 600px wide, for the top of the email, and card.mp4 for attaching to social posts. Both loop
 * from the still card. Needs ffmpeg.
 *
 * Usage:
 *   node scripts/generate-issue-cards.mjs              # every issue that has no card yet
 *   node scripts/generate-issue-cards.mjs <slug...>    # these issues, redrawn
 *   node scripts/generate-issue-cards.mjs --all        # every issue, redrawn
 *   node scripts/generate-issue-cards.mjs --staged     # pre-commit: staged issues with no card, then stages the results
 *
 * Needs the network for Google Fonts; it stops if Anton or Hanken Grotesk fail to load
 * rather than draw a card in a fallback face.
 */
import { execFileSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { cardAlt, cardContent, setFrontmatterFields, splitIssue } from './issue-card-content.mjs';
import { FPS, cardPose, frameCount } from './issue-card-motion.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const ISSUES_DIR = join(ROOT, 'src/content/newsletter');
const PINK = '#ff4fd8';
const cardPath = (slug) => `/images/newsletter/${slug}/card.webp`;
// The JK logo that signs off the card's bottom row, from brand/ (npm run brand draws it)
const LOGO_SVG = readFileSync(join(ROOT, 'brand/logo/svg/off-register/jk-for-dark.svg'), 'utf8');

function loadIssues() {
	return readdirSync(ISSUES_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((file) => {
			const path = join(ISSUES_DIR, file);
			const markdown = readFileSync(path, 'utf8');
			return { path, markdown, ...splitIssue(markdown) };
		});
}

function stagedIssuePaths() {
	const out = execFileSync(
		'git',
		['diff', '--cached', '--name-only', '--diff-filter=ACM', '--', 'src/content/newsletter'],
		{
			cwd: ROOT,
			encoding: 'utf8',
		},
	);
	return new Set(
		out
			.split('\n')
			.filter((f) => f.endsWith('.md'))
			.map((f) => join(ROOT, f)),
	);
}

function pickTargets(issues, args) {
	const hasCard = (issue) => existsSync(join(ROOT, 'public', cardPath(issue.data.slug)));
	if (args.includes('--all')) return issues;
	if (args.includes('--staged')) {
		const staged = stagedIssuePaths();
		return issues.filter((issue) => staged.has(issue.path) && !hasCard(issue));
	}
	const slugs = args.filter((a) => !a.startsWith('--'));
	if (slugs.length) {
		const unknown = slugs.filter((slug) => !issues.some((issue) => issue.data.slug === slug));
		if (unknown.length) throw new Error(`No newsletter issue with slug: ${unknown.join(', ')}`);
		return issues.filter((issue) => slugs.includes(issue.data.slug));
	}
	return issues.filter((issue) => !hasCard(issue));
}

const esc = (s) =>
	String(s).replace(
		/[&<>"]/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
	);

function markSvg(MARKS, name, style, width, stretch = false) {
	const mark = MARKS[name];
	if (!mark) throw new Error(`No mark named ${name} in src/data/scribbles.ts`);
	const fit = stretch ? ' preserveAspectRatio="none"' : '';
	const scale = stretch ? ' vector-effect="non-scaling-stroke"' : '';
	return `<svg class="m" viewBox="${mark.viewBox}"${fit} style="${style}"><path d="${mark.path}" stroke="${PINK}" stroke-width="${width}"${scale}/></svg>`;
}

// Fixed slots around the number, so marks never cross text
const SLOTS = {
	oval: 'right:40px;top:150px;width:460px;height:310px',
	box: 'right:54px;top:150px;width:430px;height:300px',
	asterisk: ['right:34px;top:34px;width:110px;height:110px', 6],
	burstDense: ['right:16px;top:14px;width:150px;height:150px', 5],
	check: ['right:30px;top:44px;width:140px;height:94px', 7],
	tally: ['right:200px;top:470px;width:200px;height:100px', 6],
	double: ['right:96px;top:478px;width:360px;height:36px', 6],
	hatch: ['right:150px;top:466px;width:250px;height:125px', 5],
};

function photoDataUri(photo) {
	const file = join(ROOT, 'public', photo);
	if (!existsSync(file)) throw new Error(`cardPhoto not found: public${photo}`);
	const type = photo.endsWith('.webp') ? 'webp' : photo.endsWith('.png') ? 'png' : 'jpeg';
	return `data:image/${type};base64,${readFileSync(file).toString('base64')}`;
}

function cardHtml(content, MARKS) {
	const date = content.date.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});
	let right;
	if (content.photo) {
		right = `<div class="photo"><img src="${photoDataUri(content.photo)}" alt=""></div>${markSvg(MARKS, 'box', 'right:50px;top:9px;width:410px;height:612px', 6, true)}`;
	} else {
		const { surround, corner, under } = content.marks;
		right = `<div class="numbox"><span class="num" data-fit="200,110">${esc(content.number)}</span></div>
			${markSvg(MARKS, surround, SLOTS[surround], 6, true)}
			${markSvg(MARKS, corner, SLOTS[corner][0], SLOTS[corner][1])}
			${markSvg(MARKS, under, SLOTS[under][0], SLOTS[under][1])}`;
	}
	const echo = '<span>Works on My Machine</span>'.repeat(3);
	return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@600;700&display=block">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #000; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; color: #ededed; font-family: 'Hanken Grotesk', sans-serif; }
.m { position: absolute; overflow: visible; }
.m path { fill: none; stroke-linecap: round; stroke-linejoin: round; filter: url(#crayon); }
.left { position: absolute; left: 64px; top: 104px; bottom: 56px; width: ${content.photo ? 640 : 610}px; display: flex; flex-direction: column; justify-content: space-between; }
.tbox { flex: 1; display: flex; align-items: center; min-height: 0; }
.twrap { position: relative; width: 100%; }
.rays { left: -34px; top: -84px; width: 104px; height: 78px; }
.kick { display: block; font: 700 22px/1 'Hanken Grotesk', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${PINK}; margin-bottom: 18px; }
.t { font: 400 120px/.95 Anton, sans-serif; letter-spacing: .01em; text-transform: uppercase; text-wrap: balance; }
.also { display: block; margin-top: .6em; font: 600 max(20px, .26em)/1.35 'Hanken Grotesk', sans-serif; color: #a3a3a3; text-transform: none; letter-spacing: 0; text-wrap: pretty; }
.foot { display: flex; gap: 28px; align-items: flex-start; padding-top: 28px; }
.echo { display: flex; flex-direction: column; font: 400 28px/.98 Anton, sans-serif; text-transform: uppercase; white-space: nowrap; }
.echo span + span { -webkit-text-fill-color: transparent; -webkit-text-stroke: 1.5px ${PINK}; }
.date { font: 600 20px/1 'Hanken Grotesk', sans-serif; color: #a3a3a3; padding-top: 4px; }
.photo { position: absolute; right: 84px; top: 74px; width: 340px; height: 482px; border-radius: 3px; overflow: hidden; }
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.numbox { position: absolute; right: 110px; top: 190px; width: 330px; height: 230px; display: grid; place-items: center; }
.num { font: 400 200px/1 Anton, sans-serif; color: ${PINK}; white-space: nowrap; width: 100%; text-align: center; overflow: hidden; }
.logo { margin-left: auto; height: 62px; }
.logo svg { height: 100%; width: auto; display: block; }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></svg>
<div class="card">
	<div class="left">
		<div class="tbox"><div class="twrap">${markSvg(MARKS, 'rays', '', 6).replace('class="m"', 'class="m rays"')}${content.kicker ? `<span class="kick">${esc(content.kicker)}</span>` : ''}<div class="t" data-fit="120,48">${esc(content.title)}${content.also ? `<span class="also">${esc(content.also)}</span>` : ''}</div></div></div>
		<div class="foot"><span class="echo">${echo}</span><span class="date">${date}</span><div class="logo">${LOGO_SVG}</div></div>
	</div>
	${right}
</div></body></html>`;
}

// Shrinks the title (and the number) until they fit their boxes; runs in the page
function fitText() {
	const title = document.querySelector('.t');
	const box = document.querySelector('.tbox');
	let size = 120;
	while (
		size > 48 &&
		(title.parentElement.offsetHeight > box.clientHeight ||
			title.scrollWidth > title.clientWidth + 1)
	) {
		size -= 2;
		title.style.fontSize = `${size}px`;
	}
	const num = document.querySelector('.num');
	if (num) {
		let numSize = 200;
		while (numSize > 110 && num.scrollWidth > num.clientWidth + 1) {
			numSize -= 4;
			num.style.fontSize = `${numSize}px`;
		}
	}
	return { titleFits: title.parentElement.offsetHeight <= box.clientHeight };
}

// Puts the card in one frame's pose (from cardPose); runs in the page
function applyPose(pose) {
	document.querySelector('#crayon feTurbulence').setAttribute('seed', String(pose.seed));
	const photo = document.querySelector('.photo img');
	if (photo) {
		photo.style.transformOrigin = '55% 40%';
		photo.style.transform = `scale(${pose.photoScale})`;
	}
	document.querySelectorAll('.card svg.m path').forEach((path, i) => {
		path.setAttribute('pathLength', '1');
		path.style.strokeDasharray = '1 2';
		path.style.strokeDashoffset = String(1 - pose.marks[i].drawn);
		path.style.opacity = String(pose.marks[i].opacity);
	});
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-nostdin', '-loglevel', 'error', '-y', ...args]);

async function screenshotFrames(page, kind, markCount, options) {
	const dir = mkdtempSync(join(tmpdir(), 'issue-card-'));
	for (let frame = 0; frame < frameCount(kind); frame++) {
		await page.evaluate(applyPose, cardPose(kind, frame, markCount, options));
		await page.screenshot({
			type: 'png',
			path: join(dir, `${String(frame).padStart(3, '0')}.png`),
		});
	}
	return dir;
}

// Screenshots every frame of the loop, then encodes the email GIF and the social MP4
async function recordAnimation(page, kind, gifOut, mp4Out) {
	const markCount = await page.evaluate(() => document.querySelectorAll('.card svg.m path').length);
	const mp4Frames = await screenshotFrames(page, kind, markCount);
	const gifFrames =
		kind === 'photo'
			? await screenshotFrames(page, kind, markCount, { stillPhoto: true })
			: mp4Frames;
	const input = (dir) => ['-framerate', String(FPS), '-i', join(dir, '%03d.png')];
	try {
		ffmpeg([
			...input(gifFrames),
			'-vf',
			'scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
			'-loop',
			'0',
			gifOut,
		]);
		ffmpeg([
			...input(mp4Frames),
			'-c:v',
			'libx264',
			'-pix_fmt',
			'yuv420p',
			'-crf',
			'20',
			'-movflags',
			'+faststart',
			mp4Out,
		]);
	} finally {
		for (const dir of new Set([mp4Frames, gifFrames]))
			rmSync(dir, { recursive: true, force: true });
	}
}

async function main() {
	const args = process.argv.slice(2);
	const targets = pickTargets(loadIssues(), args);
	if (!targets.length) return;

	const staged = args.includes('--staged');
	if (staged) {
		// Writing heroImage into an issue with unstaged edits would sweep those edits into the commit
		const dirty = targets.filter((issue) => {
			try {
				execFileSync('git', ['diff', '--quiet', '--', issue.path], { cwd: ROOT });
				return false;
			} catch {
				return true;
			}
		});
		if (dirty.length) {
			throw new Error(
				`These issues need a card but have unstaged edits; stage them or run the generator by hand:\n${dirty.map((i) => `  ${i.path}`).join('\n')}`,
			);
		}
	}

	try {
		execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
	} catch {
		throw new Error('ffmpeg is needed for the animated cards (brew install ffmpeg)');
	}

	const [{ chromium }, { default: sharp }, { MARKS }] = await Promise.all([
		import('playwright'),
		import('sharp'),
		import('../src/data/scribbles.ts'),
	]);
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
	const written = [];
	try {
		for (const issue of targets) {
			const { slug } = issue.data;
			const content = cardContent(issue);
			const alt = cardAlt(content, issue.data);
			await page.setContent(cardHtml(content, MARKS), { waitUntil: 'networkidle' });
			// A face only downloads once something asks for it, so ask for each one the card uses
			const fontsLoaded = await page.evaluate(async () => {
				const faces = ['40px Anton', '600 20px "Hanken Grotesk"', '700 22px "Hanken Grotesk"'];
				await Promise.all(faces.map((face) => document.fonts.load(face)));
				return faces.every((face) => document.fonts.check(face));
			});
			if (!fontsLoaded)
				throw new Error(
					'Anton or Hanken Grotesk did not load from Google Fonts; is the network up?',
				);
			const { titleFits } = await page.evaluate(fitText);
			if (!titleFits)
				throw new Error(`${slug}: the title does not fit the card even at the smallest size`);

			const png = await page.screenshot({ type: 'png' });
			const out = join(ROOT, 'public', cardPath(slug));
			mkdirSync(join(out, '..'), { recursive: true });
			writeFileSync(out, await sharp(png).webp({ quality: 82 }).toBuffer());
			const gifOut = out.replace(/\.webp$/, '.gif');
			const mp4Out = out.replace(/\.webp$/, '.mp4');
			await recordAnimation(page, content.photo ? 'photo' : 'number', gifOut, mp4Out);
			writeFileSync(
				issue.path,
				setFrontmatterFields(issue.markdown, { heroImage: cardPath(slug), heroAlt: alt }),
			);
			written.push(out, gifOut, mp4Out, issue.path);
			console.log(`card: ${slug}`);
		}
	} finally {
		await browser.close();
	}
	if (staged) execFileSync('git', ['add', '--', ...written], { cwd: ROOT });
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
