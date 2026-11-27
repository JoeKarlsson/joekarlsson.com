// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	mostlyInView,
	pauseSvg,
	syncFilterAnimations,
	unpauseSvg,
	visibleDiagrams,
} from '../src/scripts/filter-animations';
import { PAUSED_CLASS } from '../src/scripts/pause-motion';

function motionFilters() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
	svg.setAttribute('data-motion-filters', '');
	const pause = vi.fn();
	const unpause = vi.fn();
	Object.assign(svg, { pauseAnimations: pause, unpauseAnimations: unpause });
	document.body.append(svg);
	return { pause, unpause };
}

describe('syncFilterAnimations', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		document.documentElement.classList.remove(PAUSED_CLASS);
	});

	it('lets the wobbles run when motion is on', () => {
		const { pause, unpause } = motionFilters();
		syncFilterAnimations(false);
		expect(unpause).toHaveBeenCalled();
		expect(pause).not.toHaveBeenCalled();
	});

	it('holds them still under the pause button or reduced motion', () => {
		const { pause } = motionFilters();
		syncFilterAnimations(true);
		document.documentElement.classList.add(PAUSED_CLASS);
		syncFilterAnimations(false);
		expect(pause).toHaveBeenCalledTimes(2);
	});

	it('runs a post diagram only while it is on screen and motion is allowed', () => {
		const figure = document.createElement('figure');
		figure.className = 'diagram';
		const [onScreen, offScreen] = [0, 1].map(() => {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
			const pause = vi.fn();
			const unpause = vi.fn();
			Object.assign(svg, { pauseAnimations: pause, unpauseAnimations: unpause });
			figure.append(svg);
			return { svg, pause, unpause };
		});
		document.body.append(figure);
		visibleDiagrams.add(onScreen.svg);
		syncFilterAnimations(false);
		expect(onScreen.unpause).toHaveBeenCalled();
		expect(offScreen.pause).toHaveBeenCalled();
		syncFilterAnimations(true);
		expect(onScreen.pause).toHaveBeenCalled();
		visibleDiagrams.clear();
	});

	it('starts a figure only once most of it shows, or it fills most of a short screen', () => {
		const box = (height: number) => ({ height }) as DOMRectReadOnly;
		const screen = box(800);
		expect(
			mostlyInView({ intersectionRatio: 0.2, intersectionRect: box(80), rootBounds: screen }),
		).toBe(false);
		expect(
			mostlyInView({ intersectionRatio: 0.65, intersectionRect: box(260), rootBounds: screen }),
		).toBe(true);
		// A tall figure on a phone held sideways never reaches 60% of itself
		expect(
			mostlyInView({ intersectionRatio: 0.4, intersectionRect: box(500), rootBounds: screen }),
		).toBe(true);
	});
});

describe('pauseSvg and unpauseSvg', () => {
	it('skip an svg whose browser has no animation clock instead of throwing', () => {
		// jsdom's svg has no pauseAnimations, like the live visitors' browsers that threw
		// "e.pauseAnimations is not a function" when the lightbox closed
		const bare = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		expect(() => pauseSvg(bare)).not.toThrow();
		expect(() => unpauseSvg(bare)).not.toThrow();
		expect(() => pauseSvg(null)).not.toThrow();
	});

	it('still pause and run an svg that has one', () => {
		const pause = vi.fn();
		const unpause = vi.fn();
		pauseSvg({ pauseAnimations: pause });
		unpauseSvg({ unpauseAnimations: unpause });
		expect(pause).toHaveBeenCalledOnce();
		expect(unpause).toHaveBeenCalledOnce();
	});

	it('leave motion filters and diagrams without a clock alone when motion syncs', () => {
		const filters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		filters.setAttribute('data-motion-filters', '');
		const figure = document.createElement('figure');
		figure.className = 'diagram';
		figure.append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
		document.body.append(filters, figure);
		expect(() => syncFilterAnimations(true)).not.toThrow();
		expect(() => syncFilterAnimations(false)).not.toThrow();
		filters.remove();
		figure.remove();
	});
});
