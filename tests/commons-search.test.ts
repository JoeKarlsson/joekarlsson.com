import { describe, expect, it } from 'vitest';
import { confirmedLicense } from '../scripts/commons-search.mjs';

describe('confirmedLicense', () => {
	it('finds public-domain and CC0 templates, nested in PD-art or self too', () => {
		expect(confirmedLicense('== {{int:license-header}} ==\n{{PD-old-100-expired}}')).toBe(
			'PD-old-100-expired',
		);
		expect(confirmedLicense('{{PD-art|PD-old-70}}')).toBe('PD-art');
		expect(confirmedLicense('{{PD-USGov-NASA}}\n[[Category:Apollo 11]]')).toBe('PD-USGov-NASA');
		expect(confirmedLicense('{{self|cc-zero}}')).toBe('cc-zero');
		expect(confirmedLicense('{{CC-zero}}')).toBe('CC-zero');
		expect(confirmedLicense('{{ self | PD-self }}')).toBe('PD-self');
	});

	it('rejects attribution, share-alike and unclear licenses', () => {
		expect(confirmedLicense('{{self|cc-by-sa-4.0}}')).toBeNull();
		expect(confirmedLicense('{{Cc-by-2.0}}')).toBeNull();
		expect(confirmedLicense('{{Flickr-no known copyright restrictions}}')).toBeNull();
		expect(confirmedLicense('Description mentions PD-old in prose, no template')).toBeNull();
		expect(confirmedLicense('')).toBeNull();
	});
});
