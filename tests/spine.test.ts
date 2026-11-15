import { describe, expect, it } from 'vitest';
import { spineFor } from '../src/utils/spine';

describe('spineFor', () => {
	it('names the section and numbers the page', () => {
		expect(spineFor('/')).toEqual({ label: 'Joe Karlsson', page: 'p. 1' });
		expect(spineFor('/blog/some-post/')).toEqual({ label: 'Writing', page: 'p. 2' });
		expect(spineFor('/contact/')).toEqual({ label: 'Contact', page: 'p. 10' });
	});
	it('falls back to the name with no page for pages outside the sections', () => {
		expect(spineFor('/privacy-policy/')).toEqual({ label: 'Joe Karlsson' });
	});
});
