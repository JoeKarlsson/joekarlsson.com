import { describe, expect, it } from 'vitest';
import { marginNotes } from '../src/utils/margin-notes-schema';

describe('marginNotes schema', () => {
	const aside = (url: string) => [{ type: 'aside', at: 'x', text: 'y', url }];

	it('takes one source URL', () => {
		expect(marginNotes.safeParse(aside('https://en.wikipedia.org/wiki/VistaVision')).success).toBe(
			true,
		);
	});

	it('rejects two URLs joined in one field, which z.url() alone accepted and shipped as a 404', () => {
		const joined =
			'https://en.wikipedia.org/wiki/VistaVision ; https://en.wikipedia.org/wiki/One_Battle_After_Another';
		expect(marginNotes.safeParse(aside(joined)).success).toBe(false);
	});
});
