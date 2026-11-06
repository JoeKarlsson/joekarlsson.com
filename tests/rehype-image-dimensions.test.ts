import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import rehypeImageDimensions from '../src/plugins/rehype-image-dimensions.mjs';

type HastNode = {
	type: string;
	tagName?: string;
	properties: Record<string, unknown>;
	children: HastNode[];
};

const img = (properties: Record<string, unknown>): HastNode => ({
	type: 'element',
	tagName: 'img',
	properties,
	children: [],
});

let publicDir: string;

beforeAll(async () => {
	publicDir = mkdtempSync(join(tmpdir(), 'image-dimensions-')) + '/';
	await sharp({ create: { width: 640, height: 360, channels: 3, background: '#000' } })
		.webp()
		.toFile(join(publicDir, 'photo one.webp'));
});
afterAll(() => rmSync(publicDir, { recursive: true }));

async function run(...images: HastNode[]) {
	await rehypeImageDimensions({ publicDir })({ type: 'root', properties: {}, children: images });
	return images.map((node) => node.properties);
}

describe('rehype-image-dimensions', () => {
	it('sizes a local image from its file, decoding the URL', async () => {
		const [props] = await run(img({ src: '/photo%20one.webp' }));
		expect(props).toMatchObject({ width: 640, height: 360 });
	});

	it('leaves remote images and explicitly sized ones alone', async () => {
		const [remote, sized] = await run(
			img({ src: 'https://example.com/a.webp' }),
			img({ src: '/photo%20one.webp', width: '300' }),
		);
		expect(remote.width).toBeUndefined();
		expect(sized).toEqual({ src: '/photo%20one.webp', width: '300' });
	});

	it('fails the build on a local image that does not exist', async () => {
		await expect(run(img({ src: '/missing.webp' }))).rejects.toThrow(
			'Image /missing.webp not found',
		);
	});
});
