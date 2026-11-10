import { describe, expect, it } from 'vitest';

import { collageSvg } from '../scripts/collage/svg.mjs';

const scene = {
	canvas: { width: 1920, height: 1080, fps: 24, background_hex: '#0A0A0A' },
	cadence: { hold_frames: 2 },
	duration: 3,
	elements: [{ image: 'a.png', x: 960, y: 540, enter_at: 0.5, enter_from: 'left', shadow: {} }],
	label: { text: 'A PROP', font_family: 'Anton', size: 100, x: 960, y: 60, enter_at: 1.5 },
};
const images = [{ href: '/images/blog/x/a.webp', w: 400, h: 300 }];

describe('collage as an animated SVG', () => {
	it('starts empty, plays, and holds the finished frame for reduced motion', () => {
		const svg = collageSvg(scene, images, { id: 'c', alt: 'A prop' });
		const [live, still] = svg.split('class="anim-still"');
		// Off the frame until it enters, then shown
		expect(live).toMatch(
			/<g filter="url\(#c-l0\)" visibility="hidden"><animate attributeName="visibility"[^>]*values="hidden;visible"/,
		);
		// The still layer is the landed piece and the label in full, set on Anton's baseline
		expect(still).toContain('<g filter="url(#c-s0)" visibility="visible">');
		expect(still).toContain('translate(960');
		expect(still).toMatch(/<text x="960" y="138.1" opacity="1"/);
		expect(still).not.toContain('<animate');
	});

	it("refuses a label font the site doesn't serve, which its CSP would block", () => {
		const lobster = { ...scene, label: { ...scene.label, font_family: 'Lobster' } };
		expect(() => collageSvg(lobster, images, { id: 'c', alt: 'x' })).toThrow(/Lobster/);
	});
});
