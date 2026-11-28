import { describe, expect, it } from 'vitest';
import { glyphPath, loopSquiggle, signatureLayout, toIco } from '../scripts/generate-brand.mjs';

// Anton's capitals are 1760 font units tall; the brand script maps them to 100 units,
// with y flipped so the baseline sits at 100
describe('glyphPath', () => {
	it('scales font units to cap units, flips y onto the baseline and shifts x', () => {
		expect(glyphPath('M0 0L1760 1760Q880 880 0 1760Z', 10)).toBe('M10 100 L110 0 Q60 50 10 0 Z');
	});

	it('refuses path commands it does not transform', () => {
		expect(() => glyphPath('M0 0H100', 0)).toThrow('Unexpected path command H');
	});
});

describe('toIco', () => {
	it('writes an icon header and one directory entry per image, pointing past the directory', () => {
		const ico = toIco([Buffer.from('aaaa'), Buffer.from('bbbbbb')], [16, 256]);
		expect([ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([1, 2]);
		expect([ico.readUInt8(6), ico.readUInt32LE(14), ico.readUInt32LE(18)]).toEqual([16, 4, 38]);
		expect([ico.readUInt8(22), ico.readUInt32LE(30), ico.readUInt32LE(34)]).toEqual([0, 6, 42]);
		expect(ico.subarray(38).toString()).toBe('aaaabbbbbb');
	});
});

// The email signature's squiggle has to stay inside its image, or the loops get cut off
describe('loopSquiggle', () => {
	it('keeps every point inside the box it is drawn for', () => {
		const points = loopSquiggle(880, 40, 24)
			.slice(1)
			.split(' L')
			.map((p) => p.split(',').map(Number));
		expect(points.every(([x, y]) => x >= 0 && x <= 880 && y >= 0 && y <= 40)).toBe(true);
		expect(Math.max(...points.map(([x]) => x))).toBeGreaterThan(860);
	});
});

// The signature's name, tagline and links must fit inside the JK's ink (y 6 to 54)
describe('signatureLayout', () => {
	it('starts the name on the JK top and ends the links on its bottom', () => {
		const { paddingTop, gap } = signatureLayout(18);
		expect(paddingTop).toBe(6);
		expect(paddingTop + 18 + gap + 2 * 14).toBe(54);
	});
	it('refuses a name too tall to fit inside the JK', () => {
		expect(() => signatureLayout(21)).toThrow(/no room/);
	});
});
