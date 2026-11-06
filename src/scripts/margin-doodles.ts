// Draws Joe's doodles down the side margins (the .margin-doodles layer from
// src/components/MarginDoodles.astro) on screens 1600px and wider. A random walk
// seeded from the page's path places them, so each page has its own arrangement and
// keeps it: uneven gaps, both sides, different sizes and tilts. Each draws in once
// when it scrolls into view and stays (the .draw-once rules in motion.css). Doodles
// that would run past the end of the page's content are dropped, not clipped.
import { CHALK, MARKS } from '../data/scribbles';
import { compactPath } from '../utils/compact-path';

const PINK = '#ff4fd8';
const SVG = 'http://www.w3.org/2000/svg';
// Width in px of each doodle in the margin; height follows its viewBox
const DOODLES = [
	{ mark: MARKS.face, width: 118 },
	{ mark: MARKS.spiral, width: 78 },
	{ mark: MARKS.flower, width: 104 },
	{ mark: MARKS.star, width: 70 },
	{ mark: MARKS.cloud, width: 96 },
	{ mark: MARKS.devil, width: 84 },
	{ mark: MARKS.bolt, width: 46 },
	{ mark: MARKS.asterisk, width: 42 },
	{ mark: MARKS.burstDense, width: 62 },
	{ mark: MARKS.tally, width: 96 },
];
// Room for the longest pages; the ones past the end are dropped
const SLOTS = 60;
const FIRST_TOP = 180;
// Clear space kept between the last doodle and the end of the content
const BOTTOM_CLEARANCE = 40;

/** mulberry32: a small seeded random, so a page's layout is the same every visit. */
function seededRandom(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function drawDoodle(mark: { viewBox: string; path: string }, color: string): SVGSVGElement {
	const svg = document.createElementNS(SVG, 'svg');
	// The classes Scribble gives a multi-stroke mark drawn once
	svg.setAttribute('class', 'redraw-strokes draw-once absolute inset-0 size-full overflow-visible');
	svg.setAttribute('viewBox', mark.viewBox);
	svg.style.setProperty('--dur', '9s');
	svg.style.setProperty('--del', '0s');
	const strokes = mark.path
		.split(/(?=M)/)
		.map((stroke) => stroke.trim())
		.filter(Boolean);
	svg.style.setProperty('--n', String(strokes.length));
	const group = document.createElementNS(SVG, 'g');
	for (const [name, value] of Object.entries({
		fill: 'none',
		stroke: color,
		'stroke-width': '6',
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		filter: 'url(#crayon)',
	}))
		group.setAttribute(name, value);
	strokes.forEach((stroke, i) => {
		const path = document.createElementNS(SVG, 'path');
		path.setAttribute('pathLength', '1');
		path.setAttribute('d', compactPath(stroke));
		path.style.setProperty('--i', String(i));
		group.append(path);
	});
	svg.append(group);
	return svg;
}

const layer = document.querySelector<HTMLElement>('.margin-doodles');
if (layer && matchMedia('(min-width: 1600px)').matches) {
	const random = seededRandom(
		[...location.pathname].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) | 0, 7),
	);
	const order = DOODLES.map((d) => ({ d, key: random() }))
		.sort((a, b) => a.key - b.key)
		.map(({ d }) => d);

	let top = FIRST_TOP + random() * 160;
	let side: 'left' | 'right' = random() < 0.5 ? 'left' : 'right';
	for (let i = 0; i < SLOTS; i++) {
		const { mark, width } = order[i % order.length];
		const [, , vbWidth, vbHeight] = mark.viewBox.split(' ').map(Number);
		// Sizes swing either way, so a repeat never matches its first showing
		const w = Math.round(width * (0.85 + random() * 0.65));
		const h = Math.round((w * vbHeight) / vbWidth);
		const tilt = Math.round((random() - 0.5) * 30);
		// Off the gutter's middle by up to 50px
		const nudge = Math.round((random() - 0.5) * 100);
		const color = random() < 0.55 ? CHALK : PINK;

		const doodle = document.createElement('div');
		doodle.className = 'absolute';
		doodle.dataset.bottom = String(Math.round(top + h));
		doodle.style.cssText = `top:${Math.round(top)}px;${side}:calc((100% - 72rem) / 4 - ${w / 2}px + ${nudge}px);width:${w}px;height:${h}px;transform:rotate(${tilt}deg)`;
		doodle.append(drawDoodle(mark, color));
		layer.append(doodle);

		top += h + 120 + random() * 340;
		// Mostly alternate, sometimes two on one side
		if (random() < 0.75) side = side === 'left' ? 'right' : 'left';
	}

	// Hold each one until it's on screen, so it draws in as it scrolls into view
	const setPlay = (doodle: Element, state: string) =>
		doodle.querySelectorAll('path').forEach((path) => (path.style.animationPlayState = state));
	const onScreen = new IntersectionObserver((entries) => {
		for (const { target, isIntersecting } of entries) {
			if (!isIntersecting) continue;
			setPlay(target, '');
			onScreen.unobserve(target);
		}
	});
	for (const doodle of layer.children) {
		setPlay(doodle, 'paused');
		onScreen.observe(doodle);
	}

	// From the markup, not offsetTop: a hidden doodle measures 0 and would flip back on
	const fit = () => {
		for (const doodle of layer.children as HTMLCollectionOf<HTMLElement>)
			doodle.hidden = Number(doodle.dataset.bottom) > layer.clientHeight - BOTTOM_CLEARANCE;
	};
	fit();
	new ResizeObserver(fit).observe(layer);
}
