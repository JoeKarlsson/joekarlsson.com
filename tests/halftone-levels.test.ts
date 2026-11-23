import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	levelsStyle,
	measureLevels,
	withHalftoneLevels,
} from '../src/integrations/halftone-levels.mjs';

const dark = { mean: 0.2, low: 0.1, high: 0.5 };
const light = { mean: 0.9, low: 0.7, high: 1 };
const levels: Record<string, typeof dark> = { '/a.webp': dark, '/light.webp': light, '/a-poster.webp': dark };
const levelsFor = async (src: string) => levels[src] ?? null;

describe('halftone levels', () => {
	it('is the straight-line stretch of low..high to 0..1 that CSS brightness then contrast makes', () => {
		const { low, high } = dark;
		const [, b, c] = levelsStyle(dark).match(/--halftone-b:([\d.]+);--halftone-c:([\d.]+)/)!.map(Number);
		const css = (v: number) => (v * b - 0.5) * c + 0.5;
		expect(css(low)).toBeCloseTo(0, 2);
		expect(css(high)).toBeCloseTo(1, 2);
		expect(css((low + high) / 2)).toBeCloseTo(0.5, 2);
	});

	it('writes levels on an img from its src and a video from its poster, keeping its own style', async () => {
		const html = await withHalftoneLevels(
			'<img src="/a.webp" data-halftone="flat" alt="x"><video poster="/a-poster.webp" style="color:red" data-halftone="flat"></video>',
			levelsFor,
		);
		expect(html).toContain(`<img style="${levelsStyle(dark)}" src="/a.webp"`);
		expect(html).toContain(`style="color:red;${levelsStyle(dark)}"`);
		expect(html).not.toContain('data-halftone-invert');
	});

	it('inverts a mostly white picture unless it opts out', async () => {
		const html = await withHalftoneLevels(
			'<img src="/light.webp" data-halftone="flat"><img src="/light.webp" data-halftone="flat" data-halftone-no-invert>',
			levelsFor,
		);
		expect(html.match(/data-halftone-invert/g)).toHaveLength(1);
	});

	it('never inverts a clip with controls, whose controls the filter would invert too', async () => {
		const html = await withHalftoneLevels(
			'<video poster="/light.webp" controls data-halftone="flat"></video><video poster="/light.webp" data-halftone="flat"></video>',
			levelsFor,
		);
		expect(html.match(/data-halftone-invert/g)).toHaveLength(1);
		expect(html).toMatch(/<video data-halftone-invert style="[^"]*" poster="\/light.webp" data-halftone/);
	});

	it('leaves pictures without data-halftone, and a clip with no poster, as they are', async () => {
		const page = '<img src="/a.webp" alt=""><video src="/a.mp4" data-halftone="flat"></video>';
		expect(await withHalftoneLevels(page, levelsFor)).toBe(page);
	});

	it('measures a file like the browser did: transparent counts as black', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'levels-'));
		const file = join(dir, 'half.png');
		// Left half white, right half transparent
		const width = 64;
		const pixels = Buffer.alloc(width * width * 4);
		for (let y = 0; y < width; y++)
			for (let x = 0; x < width / 2; x++) pixels.fill(255, (y * width + x) * 4, (y * width + x) * 4 + 4);
		await sharp(pixels, { raw: { width, height: width, channels: 4 } }).png().toFile(file);
		const measured = await measureLevels(file);
		expect(measured.mean).toBeCloseTo(0.5, 1);
		expect(measured.low).toBe(0);
		expect(measured.high).toBe(1);
	});
});
