// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncFilterAnimations, visibleDiagrams } from '../src/scripts/filter-animations';
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
});
