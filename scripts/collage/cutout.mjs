#!/usr/bin/env node
// Turns a photo or scan into a collage element: the subject lifted out with Apple Vision,
// trimmed, toned, and given a thin white paper keyline like a hand-cut print.
// The pasteup recipe (vendored in .claude/skills/explainers/vendor/tmoody1973__pasteup) without
// its paid image model or rembg: any public-domain photo, or one of Joe's, works as the source.
//
//   node scripts/collage/cutout.mjs <in> <out.png> [--tone mono|pink|none] [--keyline 6] [--width 900] [--person]
//
// No shadow and no background go into the element: the compositor adds them, so they match
// across every piece in a scene. Needs macOS (Vision) for the cut.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

import sharp from 'sharp';

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		tone: { type: 'string', default: 'mono' },
		keyline: { type: 'string', default: '6' },
		width: { type: 'string', default: '900' },
		person: { type: 'boolean', default: false },
	},
});
const [input, output] = positionals;
if (!input || !output || !['mono', 'pink', 'none'].includes(values.tone)) {
	console.error(
		'Usage: node scripts/collage/cutout.mjs <in> <out.png> [--tone mono|pink|none] [--keyline 6] [--width 900] [--person]',
	);
	process.exit(2);
}

// Same binary and rebuild rule as scripts/youtube-thumbnail.mjs
const CUTOUT_SRC = new URL('../youtube-thumbnail-cutout.swift', import.meta.url).pathname;
const CUTOUT_BIN = path.join(os.homedir(), '.cache', 'joekarlsson', 'youtube-thumbnail-cutout');
if (
	!fs.existsSync(CUTOUT_BIN) ||
	fs.statSync(CUTOUT_BIN).mtimeMs < fs.statSync(CUTOUT_SRC).mtimeMs
) {
	fs.mkdirSync(path.dirname(CUTOUT_BIN), { recursive: true });
	execFileSync('swiftc', ['-O', CUTOUT_SRC, '-o', CUTOUT_BIN]);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'collage-cut-'));
const lifted = path.join(tmp, 'lifted.png');
execFileSync(CUTOUT_BIN, [input, lifted, ...(values.person ? [] : ['subject'])]);
const liftedBuffer = fs.readFileSync(lifted);
fs.rmSync(tmp, { recursive: true, force: true });

const PINK = [255, 79, 216];
const keyline = Number(values.keyline);
const piece = sharp(await sharp(liftedBuffer).trim({ threshold: 1 }).toBuffer()).resize({
	width: Number(values.width),
	withoutEnlargement: true,
});
const { data, info } = await piece.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// Tone the pixels the way the site grades photos: mono is the pasteup black-and-white print,
// pink scales grey onto the site pink (scripts/generate-work-thumbnails.mjs, tone())
for (let i = 0; i < data.length; i += 4) {
	// A cut edge, not Vision's feathered mask: a soft edge reads as a glow, not paper
	data[i + 3] = data[i + 3] > 127 ? 255 : 0;
}
if (values.tone !== 'none') {
	for (let i = 0; i < data.length; i += 4) {
		const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
		const v = Math.min(255, Math.max(0, (grey - 128) * 1.25 + 128)) / 255;
		const target = values.tone === 'pink' ? PINK : [255, 255, 255];
		for (let c = 0; c < 3; c++) data[i + c] = target[c] * v;
	}
}
const toned = sharp(data, { raw: info });

// The keyline: the cut's own shape grown by `keyline` pixels (a max filter across, then down),
// in paper white, under the piece
const pad = keyline;
const W = info.width + pad * 2;
const H = info.height + pad * 2;
const across = new Uint8Array(W * H);
for (let y = 0; y < info.height; y++)
	for (let x = 0; x < info.width; x++)
		if (data[(y * info.width + x) * 4 + 3])
			across.fill(255, (y + pad) * W + x, (y + pad) * W + x + pad * 2 + 1);
const grown = new Uint8Array(W * H);
for (let x = 0; x < W; x++)
	for (let y = 0; y < H; y++)
		if (across[y * W + x])
			for (let dy = -pad; dy <= pad; dy++)
				if (y + dy >= 0 && y + dy < H) grown[(y + dy) * W + x] = 255;
const paper = await sharp({ create: { width: W, height: H, channels: 3, background: '#f4f1ea' } })
	.joinChannel(
		await sharp(grown, { raw: { width: W, height: H, channels: 1 } })
			.png()
			.toBuffer(),
	)
	.png()
	.toBuffer();
const top = await toned.png().toBuffer();
await sharp(keyline > 0 ? paper : top)
	.composite(keyline > 0 ? [{ input: top, left: pad, top: pad }] : [])
	.png()
	.toFile(output);
console.log(`${output} (${info.width + (keyline > 0 ? pad * 2 : 0)} wide, tone ${values.tone})`);
