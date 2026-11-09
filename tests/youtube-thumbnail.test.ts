import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { pinkPhoto } from '../scripts/youtube-thumbnail.mjs';

describe('pinkPhoto', () => {
	it('fills the 16:9 card from the crop and grades dark to black and bright to the site pink', async () => {
		// A 400x225 frame: black left half, white right half
		const file = path.join(os.tmpdir(), 'youtube-thumbnail-test.png');
		await sharp({ create: { width: 400, height: 225, channels: 3, background: '#000' } })
			.composite([
				{
					input: { create: { width: 200, height: 225, channels: 3, background: '#fff' } },
					left: 200,
					top: 0,
				},
			])
			.png()
			.toFile(file);
		const png = await pinkPhoto(file, [0, 0, 1, 1]);
		const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
		expect([info.width, info.height]).toEqual([1280, 720]);
		const pixel = (x: number) => [...data.subarray(x * 3, x * 3 + 3)];
		expect(pixel(10)).toEqual([0, 0, 0]);
		expect(pixel(1270)).toEqual([255, 0x4f, 0xd8]);
	});
});
