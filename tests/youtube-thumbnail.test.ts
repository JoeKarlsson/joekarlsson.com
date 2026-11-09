import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { pinkPrint } from '../scripts/youtube-thumbnail.mjs';

describe('pinkPrint', () => {
	it('crops to a square and grades dark to black and bright to the site pink', async () => {
		// A 200x100 frame: black left half, white right half. Crop the middle square.
		const file = path.join(os.tmpdir(), 'youtube-thumbnail-test.png');
		await sharp({ create: { width: 200, height: 100, channels: 3, background: '#000' } })
			.composite([
				{
					input: { create: { width: 100, height: 100, channels: 3, background: '#fff' } },
					left: 100,
					top: 0,
				},
			])
			.png()
			.toFile(file);
		const png = await pinkPrint(file, [0.25, 0, 0.5, 1]);
		const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
		expect([info.width, info.height]).toEqual([900, 900]);
		const pixel = (x: number) => [...data.subarray(x * 3, x * 3 + 3)];
		expect(pixel(10)).toEqual([0, 0, 0]);
		expect(pixel(890)).toEqual([255, 0x4f, 0xd8]);
	});
});
