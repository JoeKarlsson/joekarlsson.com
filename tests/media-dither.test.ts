import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';

const PINK = [0xff, 0x4f, 0xd8];
const FIXTURE = join(process.cwd(), 'tests/fixtures/gradient.png');

/** Distance from a pixel to the nearest point on the black-to-pink line. */
function distanceFromBlackPinkLine(r: number, g: number, b: number): number {
	const lengthSquared = PINK[0] ** 2 + PINK[1] ** 2 + PINK[2] ** 2;
	const t = Math.min(1, Math.max(0, (r * PINK[0] + g * PINK[1] + b * PINK[2]) / lengthSquared));
	return Math.hypot(r - t * PINK[0], g - t * PINK[1], b - t * PINK[2]);
}

describe('halftone ditherer', () => {
	it('turns a 96x64 gradient into a 192x128 image of pink dots on black', async () => {
		const out = join(mkdtempSync(join(tmpdir(), 'dither-')), 'out.png');
		execFileSync('python3', ['scripts/media/halftone.py', FIXTURE, out, '--width', '96']);

		const { data, info } = await sharp(out).raw().toBuffer({ resolveWithObject: true });
		expect([info.width, info.height]).toEqual([192, 128]);

		let black = 0;
		let pink = 0;
		let offPalette = 0;
		for (let i = 0; i < data.length; i += info.channels) {
			const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
			if (r + g + b < 30) black++;
			if (Math.hypot(r - PINK[0], g - PINK[1], b - PINK[2]) < 30) pink++;
			// Dot edges blend toward black, and the Lanczos downsample overshoots a
			// little past pink (up to ~44 away). White, gray or any other hue is far
			// further off the line than that.
			if (distanceFromBlackPinkLine(r, g, b) > 48) offPalette++;
		}
		const pixels = info.width * info.height;
		expect(black / pixels).toBeGreaterThan(0.2);
		expect(pink / pixels).toBeGreaterThan(0.1);
		expect(offPalette).toBe(0);
	});
});
