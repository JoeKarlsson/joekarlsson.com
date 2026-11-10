import { describe, expect, it } from 'vitest';
import { isSent } from '../src/utils/sent';

describe('isSent', () => {
	const build = new Date('2026-11-10T14:00:00Z');
	it('counts an issue dated before or at the build as sent', () => {
		expect(isSent(new Date('2026-11-05T08:00:00Z'), build)).toBe(true);
		expect(isSent(build, build)).toBe(true);
	});
	it('holds back a scheduled issue dated after the build', () => {
		expect(isSent(new Date('2026-11-19T08:00:00Z'), build)).toBe(false);
	});
});
