// The drawing kit for animated scenes: stick figures, props and Joe's own scribbles in
// crayon, torn paper and tape. Diagrams use scripts/diagrams/draw.mjs; scenes use this.
//
// A look sets how everything is drawn:
//   crayon      chalk crayon lines on black, pink for light and the thing to watch
//   puppet      cut-paper puppets: chalk paper strips pinned at the joints
//   sketchbook  black crayon on a chalk page taped onto the black
//
// Coordinates are SVG units; a frame is 640 wide. Angles are degrees from straight down,
// positive toward +x, so 90 points right and 180 points up.

import { CHALK, MARKS } from '../../src/data/scribbles.ts';
import { measure } from '../diagrams/draw.mjs';

export const PINK = '#ff4fd8';
const INK = '#000000';
const TAPE = '#d6cebe';
const FONTS = {
	display: 'Anton, Impact, sans-serif',
	sans: "'Hanken Grotesk', Arial, sans-serif",
};
const LOOKS = ['crayon', 'puppet', 'sketchbook'];

/** Poses for figure(): torso lean plus [upper, lower] angles for each limb. */
export const POSES = {
	stand: { armL: [-12, -6], armR: [12, 6], legL: [-8, -4], legR: [8, 4] },
	shrug: { armL: [-40, 20], armR: [40, -20], legL: [-8, -4], legR: [8, 4], tilt: 12 },
	sit: { lean: -6, armL: [30, 110], armR: [50, 120], legL: [84, 2], legR: [92, 6] },
	sitTurn: { lean: -6, armL: [30, 110], armR: [70, 150], legL: [84, 2], legR: [92, 6] },
	sitReach: { lean: 4, armL: [20, 60], armR: [80, 95], legL: [84, 2], legR: [92, 6] },
	wave1: { armL: [-115, -150], armR: [115, 150], legL: [-14, -6], legR: [14, 6] },
	wave2: { armL: [-75, -35], armR: [75, 35], legL: [-14, -6], legR: [14, 6] },
	walk1: { lean: 6, armL: [-28, -10], armR: [30, 60], legL: [28, 8], legR: [-24, -48] },
	walk2: { lean: 6, armL: [26, 50], armR: [-26, -12], legL: [-22, -44], legR: [26, 6] },
	carry: { lean: 4, armL: [40, 100], armR: [50, 105], legL: [24, 6], legR: [-20, -40] },
};

export function createSketch({ id, width, height, look = 'crayon' }) {
	if (!LOOKS.includes(look)) throw new Error(`unknown look "${look}"`);
	let seed = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
	const random = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
	const jitter = (amount) => (random() - 0.5) * 2 * amount;
	const n = (v) => Math.round(v * 10) / 10;
	const issues = [];
	const back = [];
	const scene = [];
	const filter = `${id}-crayon`;
	// What lines and paper are on this look
	const line = look === 'sketchbook' ? INK : CHALK;
	const paper = look === 'sketchbook' ? '#ededed' : CHALK;

	/** A wobbly crayon line through points; closed joins the ends. */
	function stroke(points, { color = line, width: w = 5, close = false, dash } = {}) {
		const pts = points.map(([x, y]) => [x + jitter(1.2), y + jitter(1.2)]);
		if (close) pts.push(pts[0]);
		let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
		for (let i = 1; i < pts.length; i++) {
			const [ax, ay] = pts[i - 1];
			const [bx, by] = pts[i];
			d += ` Q${n((ax + bx) / 2 + jitter(2))},${n((ay + by) / 2 + jitter(2))} ${n(bx)},${n(by)}`;
		}
		scene.push(
			`<path class="d-flow" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filter})"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`,
		);
	}

	/** A torn paper shape through points: every edge broken into short, nudged steps. */
	function torn(points, fill, target = scene) {
		const out = [];
		points.forEach(([ax, ay], i) => {
			const [bx, by] = points[(i + 1) % points.length];
			const steps = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 10));
			for (let s = 0; s < steps; s++)
				out.push([
					ax + ((bx - ax) * s) / steps + jitter(1.4),
					ay + ((by - ay) * s) / steps + jitter(1.4),
				]);
		});
		target.push(
			`<path class="d-paper" d="M${out.map(([x, y]) => `${n(x)},${n(y)}`).join(' L')} Z" fill="${fill}"/>`,
		);
	}

	const rect = (x, y, w, h) => [
		[x, y],
		[x + w, y],
		[x + w, y + h],
		[x, y + h],
	];
	const circle = (cx, cy, r, count = 14) =>
		Array.from({ length: count }, (_, i) => {
			const a = (i / count) * Math.PI * 2;
			return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
		});
	const rotate = ([x, y], [cx, cy], deg) => {
		const a = (deg * Math.PI) / 180;
		const dx = x - cx;
		const dy = y - cy;
		return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
	};
	/** A prop's shape: an outline in crayon, or a paper scrap in the puppet look. */
	function shape(points, { fill = paper, color = line, width: w = 5 } = {}) {
		if (look === 'puppet') torn(points, fill);
		else stroke(points, { color, width: w, close: true });
	}

	/** One of Joe's scribbles (src/data/scribbles.ts) at x, y, w wide. */
	function mark(name, x, y, w, { color = PINK, rotate: deg = 0, strokeWidth = 8 } = {}) {
		const m = MARKS[name];
		if (!m) throw new Error(`no scribble named ${name}`);
		const [, , vw, vh] = m.viewBox.split(' ').map(Number);
		const scale = w / vw;
		scene.push(
			`<g transform="translate(${n(x)} ${n(y)}) rotate(${deg} ${n(w / 2)} ${n((vh * scale) / 2)}) scale(${scale.toFixed(4)})"><path class="d-flow" d="${m.path}" fill="none" stroke="${color}" stroke-width="${n(strokeWidth / scale)}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filter})"/></g>`,
		);
	}

	function text(
		x,
		y,
		content,
		{ size = 18, font = 'sans', anchor = 'start', color = line, weight = 400 } = {},
	) {
		if (width <= 360 && size < 13)
			issues.push(`"${content}" is ${size}px; phone text must be 13px or more`);
		const value = font === 'display' ? String(content).toUpperCase() : content;
		const w = measure(value, size, font, weight);
		const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
		if (left < 0 || left + w > width) issues.push(`"${content}" runs off the frame`);
		scene.push(
			`<text x="${n(x)}" y="${n(y)}" font-family="${FONTS[font]}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" dominant-baseline="middle">${value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`,
		);
	}

	/** A caption on a torn scrap, tilted, like the post hero's topic scrap. */
	function chip(x, y, words, { color = PINK, size = 20, tilt = -3 } = {}) {
		const w = measure(String(words).toUpperCase(), size, 'display') + size * 1.2;
		const h = size * 1.7;
		torn(
			rect(x, y, w, h).map((p) => rotate(p, [x + w / 2, y + h / 2], tilt)),
			color === 'chalk' ? CHALK : PINK,
		);
		scene.push(`<g transform="rotate(${tilt} ${n(x + w / 2)} ${n(y + h / 2)})">`);
		text(x + w / 2, y + h / 2 + 1, words, { size, font: 'display', anchor: 'middle', color: INK });
		scene.push('</g>');
		return w;
	}

	function tape(x, y, w, deg) {
		torn(
			rect(x, y, w, 18).map((p) => rotate(p, [x + w / 2, y + 9], deg)),
			TAPE,
			back,
		);
	}

	/** A stick figure with its hip at x, y. facing -1 mirrors it. */
	function figure(x, y, pose, { scale: s = 1, facing = 1, color = line, paddles = false } = {}) {
		const p = typeof pose === 'string' ? POSES[pose] : pose;
		const flip = (a) => a * facing;
		const at = ([ox, oy], deg, len) => {
			const a = (flip(deg) * Math.PI) / 180;
			return [ox + Math.sin(a) * len * s, oy + Math.cos(a) * len * s];
		};
		const hip = [x, y];
		const lean = 180 + (p.lean ?? 0);
		const shoulder = at(hip, lean, 50);
		const head = at(shoulder, lean + (p.tilt ?? 0), 22);
		const limb = (from, [upper, lower], l1, l2) => {
			const joint = at(from, upper, l1);
			return [from, joint, at(joint, lower, l2)];
		};
		const parts = [
			limb(shoulder, p.armL, 26, 24),
			limb(shoulder, p.armR, 26, 24),
			limb(hip, p.legL, 32, 30),
			limb(hip, p.legR, 32, 30),
			[hip, shoulder],
		];
		if (look === 'puppet') {
			// Paper strips pinned with brads at the joints, like a cut-out animation puppet
			for (const pts of parts)
				for (let i = 0; i < pts.length - 1; i++) {
					const [ax, ay] = pts[i];
					const [bx, by] = pts[i + 1];
					const len = Math.hypot(bx - ax, by - ay);
					const wide = (pts.length === 2 ? 15 : 10) * s;
					const nx = (-(by - ay) / len) * (wide / 2);
					const ny = ((bx - ax) / len) * (wide / 2);
					torn(
						[
							[ax + nx, ay + ny],
							[bx + nx, by + ny],
							[bx - nx, by - ny],
							[ax - nx, ay - ny],
						],
						CHALK,
					);
				}
			torn(circle(head[0], head[1], 15 * s), CHALK);
			scene.push(
				`<circle cx="${n(head[0] + 4 * s * facing)}" cy="${n(head[1] - 2 * s)}" r="${n(2 * s)}" fill="${INK}"/>`,
			);
			for (const [bx, by] of [shoulder, hip, parts[0][1], parts[1][1], parts[2][1], parts[3][1]])
				scene.push(`<circle cx="${n(bx)}" cy="${n(by)}" r="${n(2.4 * s)}" fill="${INK}"/>`);
			return { head, shoulder, hands: [parts[0][2], parts[1][2]] };
		}
		for (const pts of parts) stroke(pts, { color, width: 6 * s });
		stroke(circle(head[0], head[1], 15 * s, 10), { color, width: 6 * s, close: true });
		for (const dx of [2, 8])
			scene.push(
				`<circle cx="${n(head[0] + dx * s * facing)}" cy="${n(head[1] - 2 * s)}" r="${n(2.2 * s)}" fill="${color}"/>`,
			);
		// Marshalling wands: pink sticks carrying on from each forearm
		if (paddles)
			for (const [, elbow, hand] of [parts[0], parts[1]]) {
				const dx = hand[0] - elbow[0];
				const dy = hand[1] - elbow[1];
				const len = Math.hypot(dx, dy);
				stroke(
					[
						[hand[0] - (dx / len) * 4, hand[1] - (dy / len) * 4],
						[hand[0] + (dx / len) * 26, hand[1] + (dy / len) * 26],
					],
					{ color: PINK, width: 9 },
				);
			}
		return { head, shoulder, hands: [parts[0][2], parts[1][2]] };
	}

	/** A floor lamp standing on the floor at x; level 0 is off, 1 is full. */
	function lamp(x, floor, level) {
		const top = floor - 180;
		shape(
			[
				[x - 26, top + 34],
				[x - 16, top],
				[x + 16, top],
				[x + 26, top + 34],
			],
			{ fill: level > 0 ? PINK : CHALK },
		);
		if (look === 'puppet') torn(rect(x - 4, top + 34, 8, floor - top - 40), CHALK);
		else
			stroke([
				[x, top + 34],
				[x, floor - 6],
			]);
		shape([
			[x - 20, floor - 6],
			[x + 20, floor - 6],
			[x + 16, floor],
			[x - 16, floor],
		]);
		// The light: pink crayon hatching in a cone under the shade, sparser as it dims
		const count = Math.round(level * 11);
		scene.push(`<g opacity="${n(0.35 + 0.65 * level)}">`);
		for (let i = 0; i < count; i++) {
			const spread = ((i + 0.5) / count - 0.5) * 2;
			stroke(
				[
					[x + spread * 22, top + 46],
					[x + spread * 70 + jitter(4), top + 112 + jitter(8)],
				],
				{ color: PINK, width: 3 },
			);
		}
		scene.push('</g>');
	}

	/** A couch seen from the side, back on the left, seat top at y. Returns where someone sits. */
	function couch(x, y, w = 160) {
		shape(rect(x, y - 70, 24, 94));
		shape(rect(x + 24, y, w - 24, 24));
		shape(rect(x + w - 20, y - 22, 20, 46));
		for (const lx of [x + 10, x + w - 10])
			stroke(
				[
					[lx, y + 24],
					[lx, y + 30],
				],
				{ width: 4 },
			);
		return { seat: [x + 46, y - 4] };
	}

	/** A TV on a stand at x; playing draws a picture on the screen. */
	function tv(x, floor, { playing = false } = {}) {
		shape(rect(x, floor - 150, 100, 64), { fill: INK, color: line });
		if (look === 'puppet') stroke(rect(x, floor - 150, 100, 64), { close: true, width: 3 });
		if (playing) mark('spiral', x + 26, floor - 146, 48, { strokeWidth: 4 });
		stroke([
			[x + 50, floor - 86],
			[x + 50, floor - 60],
		]);
		shape(rect(x + 20, floor - 60, 60, 60));
	}

	/** A cat on the floor at x, walking or not. */
	function cat(x, floor, { facing = 1, step = 0 } = {}) {
		const f = (dx) => x + dx * facing;
		const body = [
			[f(-26), floor - 22],
			[f(-10), floor - 32],
			[f(16), floor - 32],
			[f(24), floor - 22],
			[f(10), floor - 14],
			[f(-22), floor - 14],
		];
		shape(body);
		const legs = step % 2 ? [-6, 6] : [6, -6];
		for (const dx of [-18, -10, 10, 18])
			stroke(
				[
					[f(dx), floor - 16],
					[f(dx + legs[dx < 0 ? 0 : 1]), floor],
				],
				{ width: 4 },
			);
		stroke(
			[
				[f(-26), floor - 24],
				[f(-40), floor - 40],
				[f(-34), floor - 54],
			],
			{ width: 4 },
		);
		const hx = f(30);
		shape(circle(hx, floor - 38, 11, 10));
		shape([
			[hx - 9, floor - 44],
			[hx - 7, floor - 58],
			[hx - 1, floor - 48],
		]);
		shape([
			[hx + 1, floor - 48],
			[hx + 7, floor - 58],
			[hx + 9, floor - 44],
		]);
	}

	/** A motion sensor high on the wall; seeing draws pink crayon arcs spreading into the room. */
	function sensor(x, y, { seeing = false } = {}) {
		shape(rect(x, y, 24, 18), { width: 4 });
		if (!seeing) return;
		for (const r of [16, 28, 40]) {
			const arc = Array.from({ length: 7 }, (_, i) => {
				const a = Math.PI * (0.22 + (i / 6) * 0.56);
				return [x + 12 + Math.cos(a) * r, y + 18 + Math.sin(a) * r];
			});
			stroke(arc, { color: PINK, width: 4 });
		}
	}

	/** A kitchen counter at x, w wide. */
	function counter(x, floor, w = 130) {
		shape(rect(x, floor - 76, w, 76));
		stroke(
			[
				[x + 8, floor - 50],
				[x + w - 8, floor - 50],
			],
			{ width: 3 },
		);
	}

	/** A bowl of popcorn: Joe's cloud scribble heaped in a bowl. */
	function popcorn(x, y) {
		mark('cloud', x - 20, y - 36, 40, { color: line === INK ? INK : CHALK, strokeWidth: 4 });
		torn(
			[
				[x - 22, y - 8],
				[x + 22, y - 8],
				[x + 14, y + 8],
				[x - 14, y + 8],
			],
			PINK,
		);
	}

	function floor(y) {
		stroke(
			[
				[12, y],
				[width - 12, y],
			],
			{ width: 4 },
		);
	}

	function toString(label) {
		const card =
			look === 'sketchbook'
				? (() => {
						torn(rect(10, 10, width - 20, height - 20), '#ededed', back);
						tape(-8, 14, 84, -28);
						tape(width - 84, height - 40, 84, -26);
						return '';
					})()
				: '';
		return [
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${String(label).replace(/"/g, '&quot;')}">${card}`,
			`<defs><filter id="${filter}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" result="d"/><feTurbulence type="fractalNoise" baseFrequency="2.2" seed="8" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.5" result="holes"/><feComposite in="d" in2="holes" operator="in"/></filter></defs>`,
			`<rect width="${width}" height="${height}" fill="${INK}"/>`,
			...back,
			...scene,
			'</svg>',
		].join('\n');
	}

	return {
		issues,
		look,
		stroke,
		torn,
		mark,
		text,
		chip,
		figure,
		lamp,
		couch,
		tv,
		cat,
		sensor,
		counter,
		popcorn,
		floor,
		toString,
	};
}
