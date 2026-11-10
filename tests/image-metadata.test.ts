import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Security audit run-1: a newsletter photo shipped with the phone model and the
// time it was taken. Published images carry no camera, GPS or serial metadata.
// EXIF stores these as TIFF tags: Make 0x010F, Model 0x0110, GPS IFD 0x8825,
// BodySerialNumber 0xA431. Looked up in the image's Exif block, either byte order.
const PRIVATE_TAGS = [0x010f, 0x0110, 0x8825, 0xa431];

function exifBlock(bytes: Buffer): Buffer | null {
	const at = bytes.indexOf('Exif\0\0', 0, 'latin1');
	if (at < 0 || at > 1 << 20) return null;
	return bytes.subarray(at + 6, at + 6 + 65536);
}

function privateTags(file: string): number[] {
	const tiff = exifBlock(readFileSync(file));
	if (!tiff || tiff.length < 8) return [];
	const little = tiff.toString('latin1', 0, 2) === 'II';
	const u16 = (o: number) => (little ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
	const u32 = (o: number) => (little ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));
	const ifd = u32(4);
	if (ifd + 2 > tiff.length) return [];
	const found: number[] = [];
	for (let i = 0, n = u16(ifd); i < n && ifd + 2 + i * 12 + 2 <= tiff.length; i++) {
		const tag = u16(ifd + 2 + i * 12);
		if (PRIVATE_TAGS.includes(tag)) found.push(tag);
	}
	return found;
}

function images(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const file = join(dir, name);
		if (statSync(file).isDirectory()) return images(file);
		return /\.(jpe?g|webp|png|avif|tiff?)$/i.test(name) ? [file] : [];
	});
}

describe('published image metadata', () => {
	it('no public image names the camera, its location or serial', () => {
		const leaks = images('public')
			.map((file) => [file, privateTags(file)] as const)
			.filter(([, tags]) => tags.length > 0)
			.map(([file, tags]) => `${file}: ${tags.map((t) => `0x${t.toString(16)}`).join(', ')}`);
		expect(leaks).toEqual([]);
	});
});
