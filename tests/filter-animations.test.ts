// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	mostlyInView,
	syncFilterAnimations,
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
