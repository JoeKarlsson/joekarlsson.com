// The public-domain photo the photo looks use: an airman marshalling a C-130J with lit
// wands (US Air Force, PD-USGov-Military-Air Force). Downloaded once into media-sources/.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const FILE =
	'A_Polish_airman_marshals_a_U.S._Air_Force_C-130J_Super_Hercules_aircraft_March_13,_2014,_at_Lask_Air_Base,_Poland_140313-F-BH566-088.jpg';
export const CREDIT = `https://commons.wikimedia.org/wiki/File:${FILE}`;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const local = path.join(root, 'media-sources/storyboards/marshaller.jpg');
if (!existsSync(local)) {
	const response = await fetch(
		`https://commons.wikimedia.org/wiki/Special:FilePath/${FILE}?width=1200`,
		{ headers: { 'User-Agent': 'joekarlsson.com storyboards' } },
	);
	if (!response.ok) throw new Error(`photo download failed: ${response.status}`);
	mkdirSync(path.dirname(local), { recursive: true });
	writeFileSync(local, Buffer.from(await response.arrayBuffer()));
}

// The airman and both wands, from the 1200-wide original
const crop = () =>
	sharp(readFileSync(local)).extract({ left: 380, top: 150, width: 460, height: 700 });
const PINK = [255, 79, 216];
const CHALK = [236, 230, 218];
const uri = async (pipeline) =>
	`data:image/png;base64,${(await pipeline.png().toBuffer()).toString('base64')}`;

/** The photo graded pink the way post thumbnails are: grey levels scaled onto the pink. */
export async function pinkPhoto() {
	const { data, info } = await crop()
		.resize(280)
		.greyscale()
		.normalise()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const out = Buffer.alloc(data.length * 3);
	for (let i = 0; i < data.length; i++)
		for (let c = 0; c < 3; c++) out[i * 3 + c] = PINK[c] * (data[i] / 255);
	return uri(sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } }));
}

/**
 * The photo traced into lines, like rotoscoping: edges in chalk, the lit wands in pink.
 * threshold changes how much of the edge survives, so two traces boil against each other.
 */
export async function tracedPhoto(threshold) {
	const base = crop().resize(280);
	const { data: edges, info } = await base
		.clone()
		.greyscale()
		.blur(1.2)
		.convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const { data: rgb } = await base
		.clone()
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const out = Buffer.alloc(info.width * info.height * 4);
	for (let i = 0; i < info.width * info.height; i++) {
		const [r, g, b] = [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]];
		const wand = r > 200 && g < 150 && b < 120;
		const color = wand ? PINK : CHALK;
		const on = wand || edges[i] > threshold;
		out.set([...color, on ? 255 : 0], i * 4);
	}
	return uri(sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }));
}
