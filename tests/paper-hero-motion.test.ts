import { describe, expect, it } from 'vitest';
import { keepsUp, mayBoil } from '../src/utils/paper-hero-motion';

const desktop = { reducedMotion: false, motionPaused: false, wideScreen: true };

describe('mayBoil', () => {
	it('boils on a desktop with a good connection', () => {
		expect(mayBoil({ ...desktop, effectiveType: '4g' })).toBe(true);
		expect(mayBoil(desktop)).toBe(true);
	});

	it('stays still for reduced motion, paused motion and phones', () => {
		expect(mayBoil({ ...desktop, reducedMotion: true })).toBe(false);
		expect(mayBoil({ ...desktop, motionPaused: true })).toBe(false);
		expect(mayBoil({ ...desktop, wideScreen: false })).toBe(false);
	});

	it('stays still on Save-Data and slow connections', () => {
		expect(mayBoil({ ...desktop, saveData: true })).toBe(false);
		expect(mayBoil({ ...desktop, effectiveType: '3g' })).toBe(false);
		expect(mayBoil({ ...desktop, effectiveType: 'slow-2g' })).toBe(false);
	});
});

describe('keepsUp', () => {
	it('stops the boil on a device dropping frames', () => {
		expect(keepsUp(60)).toBe(true);
		expect(keepsUp(28)).toBe(false);
	});
});
