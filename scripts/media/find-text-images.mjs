// Finds which post hero images and videos, project images and project clips, and the
// homepage's Around the house clips have text in them,
// with macOS Vision (count-text.swift), and writes them to
// src/data/images-with-text.json. The live halftone (src/scripts/halftone.ts) draws
// those as a flat pink-and-black tone instead of dots, which make text unreadable.
// A clip is judged by one frame a second in.
//
// Usage: npm run media:text (macOS only; re-run after adding a post or project)
import { execFile } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { projects } from '../../src/data/projects.ts';

const run = promisify(execFile);
const CONTENT_DIRS = ['src/content/blog', 'src/content/newsletter'];
const DEFAULT_HERO = '/images/og-default-pink.webp'; // DEFAULT_HERO_IMAGE in src/consts.ts
const OUTPUT = 'src/data/images-with-text.json';
// Fewer characters than this is a stray watermark or a logo, not text to read
const MIN_CHARACTERS = 10;

function postHeroes() {
	const heroes = [DEFAULT_HERO];
	for (const dir of CONTENT_DIRS) {
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const text = readFileSync(join(dir, file), 'utf8');
			for (const field of ['heroImage', 'heroVideo']) {
				const match = text.match(new RegExp(`^${field}:\\s*['"]?([^'"\\n]+)['"]?\\s*$`, 'm'));
				if (match && match[1].startsWith('/')) heroes.push(match[1].trim());
			}
		}
	}
	return heroes;
}

function projectMedia() {
	return projects.flatMap((p) => [
		p.image,
		p.video,
		...(p.page?.gallery ?? []).flatMap((clip) => [clip.poster, clip.video]),
		...(p.page?.screenshots ?? []).map((shot) => shot.poster),
	]);
}

// Around the house on the homepage (the montage is a face, never text)
function homeClips() {
	return readdirSync('public/images/home')
		.filter((f) => f.endsWith('.mp4') && !f.startsWith('montage'))
		.map((f) => `/images/home/${f}`);
}

const sources = [...new Set([...postHeroes(), ...projectMedia(), ...homeClips()].filter(Boolean))];
const work = mkdtempSync(join(tmpdir(), 'find-text-'));
try {
	const counter = join(work, 'count-text');
	await run('swiftc', ['-O', 'scripts/media/count-text.swift', '-o', counter]);

	// Vision reads stills; a clip gets a frame grabbed first
	const files = await Promise.all(
		sources.map(async (source, i) => {
			if (!source.endsWith('.mp4')) return join('public', source);
			const frame = join(work, `${i}.png`);
			await run('ffmpeg', [
				'-v',
				'error',
				'-ss',
				'1',
				'-i',
				join('public', source),
				'-frames:v',
				'1',
				frame,
			]);
			return frame;
		}),
	);
	const { stdout } = await run(counter, files, { maxBuffer: 8 * 1024 * 1024 });
	const counts = new Map(
		stdout
			.trim()
			.split('\n')
			.map((line) => line.split('\t'))
			.map(([characters, file]) => [file, Number(characters)]),
	);
	const withText = sources.filter((_, i) => counts.get(files[i]) >= MIN_CHARACTERS).sort();
	writeFileSync(OUTPUT, `${JSON.stringify(withText, null, '\t')}\n`);
	console.log(`${withText.length} of ${sources.length} images and clips have text (${OUTPUT}).`);
} finally {
	rmSync(work, { recursive: true, force: true });
}
