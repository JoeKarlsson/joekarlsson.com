// An animated figure: Claude calls go_to("Salesforce"), play.py's waypoints land, and the
// marine walks them. The moving pieces are SMIL animations stepped at 12 fps (the site's hand
// drawn rate), so the figure plays inline like the other diagrams, with no video and no script.
// Reduced motion and the pause button show the finished frame instead (.anim-live and
// .anim-still in src/styles/motion.css).
import { COLORS } from '../draw.mjs';

export const alt =
	'Claude calls go_to("Salesforce"). A dotted line of waypoints appears on a map of the level, and the marine walks out of the lobby, down the hall, stops short of the Salesforce door, presses use, waits for the door to open, and walks in among the monsters.';

const CALL = 'go_to("Salesforce")';
const FPS = 12;
const T_TYPE = 0.2;
const T_PLAN = 1.8;
const T_WALK = 3.0;
const PLAN_DRAW = 0.9;
const RESET = 0.5;
const TURN = 400; // degrees a second

const n = (v) => Math.round(v * 10) / 10;
const angleTo = (from, to) => (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
const shortest = (from, to) => from + (((((to - from) % 360) + 540) % 360) - 180);

/** The walk as timed steps: turn only when sharper than 45 degrees (the engine walks once it faces within 45). */
function planSteps({ start, waypoints, doorStop, speed }) {
	const steps = [];
	let pos = { ...start };
	waypoints.forEach((p, i) => {
		const a = shortest(pos.a, angleTo(pos, p));
		if (Math.abs(a - pos.a) >= 45) {
			steps.push({
				kind: 'turn',
				at: { ...pos },
				from: pos.a,
				to: a,
				d: Math.abs(a - pos.a) / TURN,
			});
			pos.a = a;
		}
		steps.push({
			kind: 'move',
			from: { ...pos },
			to: { ...p, a },
			d: Math.hypot(p.x - pos.x, p.y - pos.y) / speed,
		});
		pos = { ...p, a };
		if (i === doorStop) {
			steps.push({ kind: 'wait', at: { ...pos }, d: 0.25 });
			steps.push({ kind: 'use', at: { ...pos }, d: 0.4 });
			steps.push({ kind: 'door', at: { ...pos }, d: 1.0 });
		}
	});
	steps.push({ kind: 'hold', at: { ...pos }, d: 2.0 });
	return steps;
}

/** Everything that moves, at time t. */
function stateAt(t, layout, steps, tReset) {
	const pts = [layout.start, ...layout.waypoints];
	const legs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
	const planLength = legs.reduce((a, b) => a + b, 0);
	const drawn = planLength * Math.min(1, Math.max(0, (t - T_PLAN) / PLAN_DRAW));
	let left = drawn;
	const plan = [pts[0]];
	for (let i = 0; i < legs.length && left > 0; i++) {
		const u = Math.min(1, left / legs[i]);
		plan.push({
			x: pts[i].x + (pts[i + 1].x - pts[i].x) * u,
			y: pts[i].y + (pts[i + 1].y - pts[i].y) * u,
		});
		left -= legs[i];
	}
	const reached = layout.waypoints.map(
		(_, i) => drawn >= legs.slice(0, i + 1).reduce((a, b) => a + b, 0) - 0.01,
	);

	let m = { ...layout.start };
	let door = 0;
	let use = 0;
	let tt = t - T_WALK;
	if (tt > 0) {
		for (const st of steps) {
			const u = Math.min(1, tt / st.d);
			if (st.kind === 'move') {
				const k = Math.min(1, tt / (2 / FPS)); // a small turn blends in over two drawings
				m = {
					x: st.from.x + (st.to.x - st.from.x) * u,
					y: st.from.y + (st.to.y - st.from.y) * u,
					a: st.from.a + (st.to.a - st.from.a) * k,
				};
			} else if (st.kind === 'turn') {
				m = { ...st.at, a: st.from + (st.to - st.from) * (1 - (1 - u) ** 2) };
			} else {
				m = { ...st.at };
				if (st.kind === 'use') use = u < 1 ? 1 : 0;
				if (st.kind === 'door') door = u;
			}
			if (tt <= st.d) break;
			tt -= st.d;
		}
	}
	const fade = t > tReset ? 1 - Math.min(1, (t - tReset) / RESET) : 1;
	if (t > tReset) door = fade;
	return {
		chars: Math.min(CALL.length, Math.max(0, Math.round((t - T_TYPE) * FPS)) * 2),
		plan: drawn > 0 ? plan : [],
		reached,
		marine: m,
		door,
		use,
		fade,
	};
}

/** One SMIL animation stepping through a value per drawing; nothing when it never changes. */
function stepped(values, dur, { attr, type }) {
	const keep = values.map((v, i) => i === 0 || v !== values[i - 1]);
	if (keep.filter(Boolean).length === 1) return '';
	const vals = values.filter((_, i) => keep[i]).join(';');
	const times = values
		.map((_, i) => (i / values.length).toFixed(4))
		.filter((_, i) => keep[i])
		.join(';');
	const tag = type
		? `animateTransform attributeName="transform" type="${type}"`
		: `animate attributeName="${attr}"`;
	return `<${tag} calcMode="discrete" values="${vals}" keyTimes="${times}" dur="${n(dur)}s" repeatCount="indefinite"/>`;
}

const pathOf = (pts) =>
	pts.length ? 'M' + pts.map((p) => `${n(p.x)},${n(p.y)}`).join(' L') : 'M0,0';

/** The moving pieces, drawn at one state: the live layer starts here, the still layer stays here. */
function pieces(layout, s, anim = {}) {
	const { door: d } = layout;
	const call = [];
	for (let i = 0; i < CALL.length; i += 2) {
		const chunk = CALL.slice(i, i + 2).replace(/"/g, '&quot;');
		call.push(
			`<tspan visibility="${s.chars > i ? 'visible' : 'hidden'}">${chunk}${anim.chars?.[i / 2] ?? ''}</tspan>`,
		);
	}
	const dots = layout.waypoints
		.map(
			(p, i) =>
				`<circle cx="${p.x}" cy="${p.y}" r="${layout.dot}" fill="${COLORS.muted}" opacity="${s.reached[i] ? 1 : 0}">${anim.dots?.[i] ?? ''}</circle>`,
		)
		.join('');
	const u = layout.use;
	return [
		`<g opacity="${s.fade}">${anim.fade ?? ''}`,
		`<text x="${layout.call.x}" y="${layout.call.y}" font-family="var(--font-jetbrains-mono, 'JetBrains Mono'), Menlo, monospace" font-size="${layout.call.size}" fill="${COLORS.paper}" xml:space="preserve">${call.join('')}</text>`,
		`<path d="${pathOf(s.plan)}" fill="none" stroke="${COLORS.muted}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round">${anim.plan ?? ''}</path>`,
		dots,
		`<g opacity="${s.use}" stroke="${COLORS.chalk}" stroke-width="2.5" stroke-linecap="round">${anim.use ?? ''}<path d="M${d.x - u} ${d.y1 + 4} l-7 -7 M${d.x - u + 2} ${(d.y1 + d.y2) / 2} l-9 0 M${d.x - u} ${d.y2 - 4} l-7 7"/></g>`,
		`<g transform="translate(${n(s.marine.x)} ${n(s.marine.y)})">${anim.move ?? ''}<g transform="rotate(${n(s.marine.a)})">${anim.turn ?? ''}<path d="M10 0 L-7 -7 L-3 0 L-7 7 Z" transform="scale(${layout.marine})" fill="${COLORS.pink}" stroke="${COLORS.pink}" stroke-width="2" stroke-linejoin="round"/></g></g>`,
		'</g>',
		`<line x1="${d.x}" y1="${d.y1}" x2="${d.x}" y2="${n(d.y2 - (d.y2 - d.y1 - 4) * s.door)}" stroke="${COLORS.chalk}" stroke-width="6" stroke-linecap="round">${anim.door ?? ''}</line>`,
	].join('');
}

function walk(f, layout) {
	const { lobby, hall, room } = layout;
	f.group({ ...lobby, label: 'Lobby' });
	f.group({ ...hall, label: 'Hall' });
	f.group({ ...room, logo: 'salesforce' });
	f.logo(
		'claude',
		layout.call.x - layout.call.logo - 10,
		layout.call.y - layout.call.size * 0.35,
		layout.call.logo,
	);
	layout.monsters.forEach(([x, y, h]) => f.logo('skull', x - h / 2, y, h));

	const steps = planSteps(layout);
	const walkLength = steps.reduce((sum, st) => sum + st.d, 0);
	// On the frame grid, with one fully reset drawing before the loop starts again
	const tReset = Math.ceil((T_WALK + walkLength) * FPS) / FPS;
	const loop = tReset + RESET + 1 / FPS;
	const frames = Array.from({ length: Math.ceil(loop * FPS - 1e-9) }, (_, i) =>
		stateAt(i / FPS, layout, steps, tReset),
	);
	const dur = frames.length / FPS;
	const over = (pick, opts) => stepped(frames.map(pick), dur, opts);
	const anim = {
		chars: Array.from({ length: Math.ceil(CALL.length / 2) }, (_, k) =>
			over((s) => (s.chars > k * 2 ? 'visible' : 'hidden'), { attr: 'visibility' }),
		),
		plan: over((s) => pathOf(s.plan), { attr: 'd' }),
		dots: layout.waypoints.map((_, i) => over((s) => (s.reached[i] ? 1 : 0), { attr: 'opacity' })),
		use: over((s) => s.use, { attr: 'opacity' }),
		move: over((s) => `${n(s.marine.x)} ${n(s.marine.y)}`, { type: 'translate' }),
		turn: over((s) => String(n(s.marine.a)), { type: 'rotate' }),
		fade: over((s) => n(s.fade), { attr: 'opacity' }),
		door: over((s) => n(layout.door.y2 - (layout.door.y2 - layout.door.y1 - 4) * s.door), {
			attr: 'y2',
		}),
	};
	f.raw(`<g class="anim-live">${pieces(layout, frames[0], anim)}</g>`);
	f.raw(
		`<g class="anim-still" display="none">${pieces(layout, stateAt(tReset - 0.01, layout, steps, tReset))}</g>`,
	);
}

export const desktop = {
	height: 340,
	draw(f) {
		walk(f, {
			call: { x: 58, y: 40, size: 22, logo: 26 },
			lobby: { x: 20, y: 100, w: 180, h: 210 },
			hall: { x: 196, y: 180, w: 228, h: 56 },
			room: { x: 420, y: 90, w: 200, h: 230 },
			door: { x: 421, y1: 188, y2: 228 },
			start: { x: 80, y: 270, a: -90 },
			waypoints: [
				{ x: 110, y: 208 },
				{ x: 215, y: 208 },
				{ x: 395, y: 208 },
				{ x: 460, y: 208 },
				{ x: 515, y: 198 },
			],
			doorStop: 2,
			speed: 130,
			monsters: [
				[560, 140, 24],
				[585, 252, 36],
				[480, 286, 24],
			],
			dot: 4,
			marine: 1.3,
			use: 12,
		});
	},
};

export const phone = {
	height: 300,
	draw(f) {
		walk(f, {
			call: { x: 52, y: 36, size: 18, logo: 22 },
			lobby: { x: 16, y: 96, w: 104, h: 170 },
			hall: { x: 116, y: 160, w: 100, h: 50 },
			room: { x: 212, y: 86, w: 132, h: 196 },
			door: { x: 213, y1: 166, y2: 204 },
			start: { x: 58, y: 236, a: -90 },
			waypoints: [
				{ x: 74, y: 185 },
				{ x: 130, y: 185 },
				{ x: 194, y: 185 },
				{ x: 244, y: 185 },
				{ x: 276, y: 178 },
			],
			doorStop: 2,
			speed: 72,
			monsters: [
				[306, 124, 18],
				[318, 222, 26],
				[252, 252, 18],
			],
			dot: 3,
			marine: 1,
			use: 10,
		});
	},
};
