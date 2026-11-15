import { describe, expect, it } from 'vitest';
import { spineFor } from '../src/utils/spine';

describe('spineFor', () => {
	it('names the section', () => {
		expect(spineFor('/').label).toBe('Joe Karlsson');
		expect(spineFor('/blog/some-post/').label).toBe('Writing');
		expect(spineFor('/contact/').label).toBe('Contact');
	});
	it('falls back to my name for pages outside the sections', () => {
		expect(spineFor('/privacy-policy/').label).toBe('Joe Karlsson');
	});
});
