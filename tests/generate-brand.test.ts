import { describe, expect, it } from 'vitest';
import { glyphPath, toIco } from '../scripts/generate-brand.mjs';

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
