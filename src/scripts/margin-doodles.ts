// Draws Joe's doodles down the side margins (the .margin-doodles layer from
// src/components/MarginDoodles.astro) on screens wide enough for them (its data-from). A random walk
// seeded from the page's path places them, so each page has its own arrangement and
// keeps it: uneven gaps, both sides, different sizes and tilts. Each draws in once
// when it scrolls into view and stays (the .draw-once rules in motion.css). Doodles
// that would run past the end of the page's content are dropped, not clipped.
// Named imports, not MARKS: the bundle carries only these marks' paths
import {
	asterisk,
	bolt,
	burstDense,
	cat,
	CHALK,
	daisy,
	devil,
	duck,
	face,
	flower,
	flowerBig,
	paperPlane,
	sparkle,
	spiral,
	star,
	tally,
	tangle,
	waveHand,
} from '../data/scribbles';
import { compactPath } from '../utils/compact-path';

const PINK = '#ff4fd8';
const SVG = 'http://www.w3.org/2000/svg';
const DOODLES = [
	{ mark: face },
	{ mark: spiral },
	{ mark: flower },
	{ mark: star },
	{ mark: devil },
	{ mark: bolt },
	{ mark: asterisk },
	{ mark: burstDense },
	{ mark: tally },
	{ mark: flowerBig },
	{ mark: daisy },
	{ mark: sparkle },
	{ mark: tangle },
	// Line figures (DECISIONS.md 2026-11-19): never drawn small, so they read as drawings
	// rather than icons
	{ mark: waveHand, figure: true },
	{ mark: cat, figure: true },
	{ mark: duck, figure: true },
	{ mark: paperPlane, figure: true },
];
// Room for the longest pages; the ones past the end are dropped
const SLOTS = 60;
const FIRST_TOP = 180;
// A doodle's longest side in px, by size: small, medium, big (big is capped to its margin)
const SIZES = [
	[80, 110],
	[140, 190],
	[240, 320],
];
const FIGURE_MIN = 130;
// Smallest gap in px between a doodle and the window edge or the text column
const MARGIN_INSET = 24;
// Thinnest a doodle's line draws, in screen px: its width is in the mark's own units, so a
// small doodle with a wide viewBox would otherwise draw a hairline
const MIN_LINE = 3.5;
// and thickest, so a small viewBox drawn big doesn't come out heavier than its neighbours
const MAX_LINE = 6;
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

function drawDoodle(
	mark: { viewBox: string; path: string },
	color: string,
	minStroke: number,
	maxStroke: number,
): SVGSVGElement {
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
		'stroke-width': String(Math.min(Math.max(6, minStroke), maxStroke)),
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

/** The homepage's one long crayon line down the left margin: a pen that wanders from the
 * top of the page to its end without leaving the paper, drawn as the page scrolls
 * (.margin-thread in motion.css). Plotted in real pixels, so its curves keep their shape. */
function drawThread(layer: HTMLElement, random: () => number): SVGSVGElement {
	const lane =
		(layer.clientWidth - layer.querySelector<HTMLElement>('.margin-lane')!.clientWidth) / 2;
	const height = layer.clientHeight - BOTTOM_CLEARANCE;
	const x = () => MARGIN_INSET + random() * (lane - 2 * MARGIN_INSET);
	let y = FIRST_TOP;
	let from = x();
	let d = `M${from.toFixed(1)},${y}`;
	// Each bend leaves and arrives heading straight down, so the line flows instead of zigzagging
	while (y < height - 200) {
		const step = 220 + random() * 320;
		const to = x();
		const mid = (y + step / 2).toFixed(1);
		d += ` C${from.toFixed(1)},${mid} ${to.toFixed(1)},${mid} ${to.toFixed(1)},${(y + step).toFixed(1)}`;
		from = to;
		y += step;
	}
	// No crayon filter here, unlike the doodles: over a page-tall SVG it made every scroll
	// frame in WebKit 10x slower, and tiling the SVG didn't help
	const svg = document.createElementNS(SVG, 'svg');
	svg.setAttribute('class', 'margin-thread absolute top-0 left-0 overflow-visible');
	svg.setAttribute('width', String(Math.round(lane)));
	svg.setAttribute('height', String(Math.round(height)));
	const path = document.createElementNS(SVG, 'path');
	for (const [name, value] of Object.entries({
		d,
		pathLength: '1',
		fill: 'none',
		stroke: PINK,
		'stroke-width': '5',
		'stroke-linecap': 'round',
	}))
		path.setAttribute(name, value);
	svg.append(path);
	return svg;
}

const layer = document.querySelector<HTMLElement>('.margin-doodles');
if (layer) {
	const wide = matchMedia(`(min-width: ${layer.dataset.from}px)`);
	const thread = layer.hasAttribute('data-thread');
	// Where doodles draw (1600px+), "On this page" sits on the left (in the gutter on posts and
	// project pages, in the grid's left column on About). Left doodles keep to the room
	// between the window edge and the list (--left-room, set in fit), so both sides still
	// get doodles; it's sticky, so it holds that strip the whole way down
	const toc = document.querySelector<HTMLElement>('.margin-toc');
	layer.hidden = false;
	const random = seededRandom(
		[...location.pathname].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) | 0, 7),
	);
	const order = DOODLES.map((d) => ({ d, key: random() }))
		.sort((a, b) => a.key - b.key)
		.map(({ d }) => d);

	// A cursor walks down the page in uneven steps; each doodle picks a side at random
	// and lands at the cursor or, if that side is still busy, just below its last one.
	// Across, it can sit anywhere in its margin, from near the window edge to near the
	// text, so the two margins never line up into columns.
	// A hidden width box at the column's real width: doodles size to the margin beside it,
	// and the thread measures its lane from it
	const lane = document.createElement('div');
	lane.className = 'margin-lane invisible mx-auto';
	lane.style.width = 'min(100%, var(--doodle-column))';
	layer.append(lane);
	const marginWidth = () => (layer.clientWidth - lane.clientWidth) / 2;
	// The widest a doodle can be and still fit its margin at this window size (the script
	// loads only once the window is wide enough for doodles)
	const maxSide = marginWidth() - 2 * MARGIN_INSET;
	// A margin too narrow for the biggest size squeezes all three into it, so they still differ
	const [smallest, biggest] = [SIZES[0][0], SIZES[2][1]];
	const floor = Math.min(smallest, maxSide * 0.6);
	const fitSize = (side: number) =>
		maxSide >= biggest
			? side
			: floor + ((side - smallest) * (maxSide - floor)) / (biggest - smallest);
	let cursor = FIRST_TOP + random() * 160;
	const nextFree = { left: 0, right: 0 };
	for (let i = 0; i < SLOTS; i++) {
		const { mark, figure } = order[i % order.length];
		const [, , vbWidth, vbHeight] = mark.viewBox.split(' ').map(Number);
		// Three sizes, like a margin filled over time: about a third small, a third medium, the
		// rest big, so neighbours differ at a glance
		const size = random();
		const [low, high] = SIZES[size < 0.33 ? 0 : size < 0.66 ? 1 : 2];
		const longest = Math.min(
			maxSide,
			Math.max(figure ? FIGURE_MIN : 0, fitSize(low + random() * (high - low))),
		);
		const w = Math.round((longest * vbWidth) / Math.max(vbWidth, vbHeight));
		const h = Math.round((w * vbHeight) / vbWidth);
		const tilt = Math.round((random() - 0.5) * 34);
		const color = random() < 0.55 ? CHALK : PINK;
		// Drawn either way, so a page's layout doesn't change with the thread
		const coin = random() < 0.5 ? 'left' : 'right';
		const side = thread ? 'right' : coin;
		const top = Math.max(cursor, nextFree[side]);
		// Fraction of the margin's free width, from the window edge (0) to the text (1)
		const across = random().toFixed(3);

		const doodle = document.createElement('div');
		doodle.className = 'absolute';
		doodle.dataset.bottom = String(Math.round(top + h));
		doodle.dataset.room = String(w + 2 * MARGIN_INSET);
		if (side === 'left') doodle.dataset.left = '';
		const margin =
			side === 'left'
				? 'var(--left-room, (100% - var(--doodle-column)) / 2)'
				: '((100% - var(--doodle-column)) / 2)';
		doodle.style.cssText = `top:${Math.round(top)}px;${side}:calc(${MARGIN_INSET}px + (${margin} - ${w + 2 * MARGIN_INSET}px) * ${across});width:${w}px;height:${h}px;transform:rotate(${tilt}deg)`;
		doodle.append(drawDoodle(mark, color, (MIN_LINE * vbWidth) / w, (MAX_LINE * vbWidth) / w));
		layer.append(doodle);

		nextFree[side] = top + h + 60 + random() * 240;
		cursor += 90 + random() * 330;
	}

	const doodles = [...layer.children].filter((child) => child !== lane) as HTMLElement[];
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
	for (const doodle of doodles) {
		setPlay(doodle, 'paused');
		onScreen.observe(doodle);
	}

	const threadSeed = random() * 2 ** 32;
	// From the markup, not offsetTop: a hidden doodle measures 0 and would flip back on
	const fit = () => {
		// The room left of a shown contents list; a doodle too wide for it stays off
		const tocLeft = toc?.offsetParent ? toc.getBoundingClientRect().left : null;
		const leftRoom = tocLeft === null ? null : tocLeft - layer.getBoundingClientRect().left;
		if (leftRoom === null) layer.style.removeProperty('--left-room');
		else layer.style.setProperty('--left-room', `${leftRoom}px`);
		// Sized for the margin at load; narrowed since, the big ones would run over the text
		const margin = marginWidth();
		for (const doodle of doodles)
			doodle.hidden =
				Number(doodle.dataset.bottom) > layer.clientHeight - BOTTOM_CLEARANCE ||
				Number(doodle.dataset.room) > margin ||
				(leftRoom !== null &&
					doodle.dataset.left !== undefined &&
					Number(doodle.dataset.room) > leftRoom);
		if (thread && !layer.hidden) {
			layer.querySelector('.margin-thread')?.remove();
			// Same seed each time, so a resize redraws the same line at the new size
			layer.append(drawThread(layer, seededRandom(threadSeed)));
		}
	};
	fit();
	new ResizeObserver(fit).observe(layer);
	// Narrowed below where they fit: off, instead of over the text. Not in fit: hiding the
	// layer inside its own ResizeObserver callback trips a ResizeObserver loop error
	wide.addEventListener('change', () => {
		layer.hidden = !wide.matches;
		fit();
	});
}
