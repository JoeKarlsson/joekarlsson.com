// An animated figure: my attention hops between eight Claude Code panes, then the panes fold
// into one orchestrator I talk to, with seven subagents behind it sending summaries back. The
// moving pieces are SMIL stepped at 12 fps, like doom-mcp-server/go-to-walk.mjs; reduced
// motion and the pause button show the finished frame (.anim-live and .anim-still in motion.css).
import { COLORS } from '../draw.mjs';

export const alt =
	"Before: a pink arrow from me jumps between eight Claude Code panes, one after another. After: the panes fold into one orchestrator pane I talk to, with seven small subagent panes behind it, and the subagents' summaries travel back through the orchestrator to me.";

const FPS = 12;
const HOP = 0.33; // seconds my attention stays on a pane
const HOPS = [0, 5, 2, 7, 1, 4, 6, 3, 0];
const T_FOLD = HOPS.length * HOP;
const FOLD = 0.75;
const T_AFTER = T_FOLD + FOLD;
const T_LINES = T_AFTER + 0.25;
const SUMMARIES = [T_AFTER + 0.9, T_AFTER + 2.0];
const TRIP = 0.6; // seconds a summary takes from a subagent to me
const HOLD_END = T_AFTER + 3.4;
const RESET = 0.5;
const LOOP = Math.ceil((HOLD_END + RESET + 1 / FPS) * FPS) / FPS;
const MONO = "var(--font-jetbrains-mono, 'JetBrains Mono'), Menlo, monospace";
const SANS = "var(--font-hanken-grotesk, 'Hanken Grotesk'), Arial, sans-serif";

const n = (v) => Math.round(v * 10) / 10;
const ease = (u) => 1 - (1 - u) ** 2;
const lerp = (a, b, u) => a + (b - a) * u;

/** Where every piece is at time t. */
function stateAt(t, L) {
	const u = ease(Math.min(1, Math.max(0, (t - T_FOLD) / FOLD)));
	const tiles = L.grid.map((g, i) => {
		const to = i === 0 ? L.orchestrator : L.subagents[i - 1];
		return { x: lerp(g.x, to.x, u), y: lerp(g.y, to.y, u), s: lerp(1, to.s, u) };
	});
	const hop = t < T_FOLD ? HOPS[Math.floor(t / HOP)] : 0;
	const target = tiles[hop];
	const end = L.pointAt(target, L.tile);
	let dot = null;
	for (const start of SUMMARIES) {
		const k = (t - start) / TRIP;
		if (k >= 0 && k <= 1) {
			const path = [L.subagentOut, L.orchestratorIn, L.orchestratorOut, L.meIn];
			const seg = Math.min(path.length - 2, Math.floor(k * (path.length - 1)));
			const v = k * (path.length - 1) - seg;
			dot = { x: lerp(path[seg].x, path[seg + 1].x, v), y: lerp(path[seg].y, path[seg + 1].y, v) };
		}
	}
	const fade = t > HOLD_END ? 1 - Math.min(1, (t - HOLD_END) / RESET) : 1;
	return {
		tiles,
		arrow: end,
		before: t < T_FOLD ? 1 : 0,
		after: t >= T_AFTER ? 1 : 0,
		lines: t >= T_LINES ? 1 : 0,
		dot,
		fade,
	};
}

/** One SMIL animation stepping through a value per drawing; nothing when it never changes. */
function stepped(values, { attr, type }) {
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
	return `<${tag} calcMode="discrete" values="${vals}" keyTimes="${times}" dur="${n(LOOP)}s" repeatCount="indefinite"/>`;
}

function tileMarkup(L) {
	const { w, h } = L.tile;
	return [
		`<rect width="${w}" height="${h}" rx="3" fill="${COLORS.ink}" stroke="${COLORS.chalk}" stroke-width="2"/>`,
		`<rect width="${w}" height="${n(h * 0.2)}" rx="3" fill="${COLORS.chalk}" opacity="0.18"/>`,
		`<text x="8" y="${n(h * 0.58)}" font-family="${MONO}" font-size="${L.prompt}" fill="${COLORS.paper}">&gt;_</text>`,
		`<rect x="8" y="${n(h * 0.7)}" width="${n(w * 0.55)}" height="3" fill="${COLORS.muted}"/>`,
	].join('');
}

/** The moving pieces at one state; anim holds the SMIL for the live layer. */
function pieces(L, s, anim = {}) {
	const tiles = s.tiles
		.map(
			(p, i) =>
				`<g transform="translate(${n(p.x)} ${n(p.y)})">${anim.move?.[i] ?? ''}<g transform="scale(${n(p.s * 100) / 100})">${anim.scale?.[i] ?? ''}${tileMarkup(L)}</g></g>`,
		)
		.join('');
	const lines = L.subagents
		.map((p, i) => {
			const to = L.pointAt(p, L.tile);
			const from = L.lineStart(i);
			return `<line x1="${from.x}" y1="${from.y}" x2="${n(to.x)}" y2="${n(to.y)}" stroke="${COLORS.chalk}" stroke-width="2" stroke-dasharray="5 5"/>`;
		})
		.join('');
	const dot = s.dot ?? { x: L.meIn.x, y: L.meIn.y };
	return [
		`<g opacity="${s.fade}">${anim.fade ?? ''}`,
		`<g opacity="${s.lines}">${anim.lines ?? ''}${lines}</g>`,
		tiles,
		`<line x1="${L.meOut.x}" y1="${L.meOut.y}" x2="${n(s.arrow.x)}" y2="${n(s.arrow.y)}" stroke="${COLORS.pink}" stroke-width="3" stroke-linecap="round">${anim.ax ?? ''}${anim.ay ?? ''}</line>`,
		`<circle cx="${n(s.arrow.x)}" cy="${n(s.arrow.y)}" r="5" fill="${COLORS.pink}">${anim.cx ?? ''}${anim.cy ?? ''}</circle>`,
		`<g opacity="${s.before}" font-family="${SANS}" font-size="${L.label}" fill="${COLORS.paper}">${anim.before ?? ''}<text x="${L.beforeLabel.x}" y="${L.beforeLabel.y}">Eight panes, one me</text></g>`,
		`<g opacity="${s.after}" font-family="${SANS}" font-size="${L.label}" fill="${COLORS.paper}">${anim.after ?? ''}<text x="${L.orchLabel.x}" y="${L.orchLabel.y}">Orchestrator</text><text x="${L.subLabel.x}" y="${L.subLabel.y}">Subagents</text><text x="${L.sumLabel.x}" y="${L.sumLabel.y}" fill="${COLORS.pink}">Summaries</text></g>`,
		`<circle cx="${n(dot.x)}" cy="${n(dot.y)}" r="6" fill="${COLORS.pink}" opacity="${s.dot ? 1 : 0}">${anim.dx ?? ''}${anim.dy ?? ''}${anim.dop ?? ''}</circle>`,
		'</g>',
	].join('');
}

function draw(f, L) {
	f.box({ ...L.me, kind: 'outline', label: 'Me', icon: 'user' });
	const frames = Array.from({ length: Math.round(LOOP * FPS) }, (_, i) => stateAt(i / FPS, L));
	const over = (pick, opts) => stepped(frames.map(pick), opts);
	const anim = {
		move: L.grid.map((_, i) =>
			over((s) => `${n(s.tiles[i].x)} ${n(s.tiles[i].y)}`, { type: 'translate' }),
		),
		scale: L.grid.map((_, i) =>
			over((s) => String(n(s.tiles[i].s * 100) / 100), { type: 'scale' }),
		),
		ax: over((s) => n(s.arrow.x), { attr: 'x2' }),
		ay: over((s) => n(s.arrow.y), { attr: 'y2' }),
		cx: over((s) => n(s.arrow.x), { attr: 'cx' }),
		cy: over((s) => n(s.arrow.y), { attr: 'cy' }),
		before: over((s) => s.before, { attr: 'opacity' }),
		after: over((s) => s.after, { attr: 'opacity' }),
		lines: over((s) => s.lines, { attr: 'opacity' }),
		dx: over((s) => n((s.dot ?? L.meIn).x), { attr: 'cx' }),
		dy: over((s) => n((s.dot ?? L.meIn).y), { attr: 'cy' }),
		dop: over((s) => (s.dot ? 1 : 0), { attr: 'opacity' }),
		fade: over((s) => n(s.fade), { attr: 'opacity' }),
	};
	f.raw(`<g class="anim-live">${pieces(L, frames[0], anim)}</g>`);
	f.raw(
		`<g class="anim-still" display="none">${pieces(L, { ...stateAt(HOLD_END - 0.01, L), dot: null })}</g>`,
	);
}

export const desktop = {
	height: 320,
	draw(f) {
		const tile = { w: 90, h: 64 };
		const grid = Array.from({ length: 8 }, (_, i) => ({
			x: 210 + (i % 4) * 104,
			y: 80 + Math.floor(i / 4) * 92,
		}));
		const orchestrator = { x: 232, y: 112, s: 1.5 };
		const subagents = Array.from({ length: 7 }, (_, i) => ({ x: 560, y: 40 + i * 38, s: 0.5 }));
		const me = { x: 24, y: 126, w: 124, h: 64 };
		draw(f, {
			tile,
			grid,
			orchestrator,
			subagents,
			me,
			prompt: 16,
			label: 16,
			// Where an arrow lands on a pane: its left edge, halfway down (its top edge on a phone)
			pointAt: (p, t) => ({ x: p.x, y: p.y + (t.h * (p.s ?? 1)) / 2 }),
			meOut: { x: 148, y: 158 },
			meIn: { x: 152, y: 158 },
			orchestratorIn: { x: 367, y: 160 },
			orchestratorOut: { x: 232, y: 160 },
			lineStart: (i) => ({ x: 367, y: 130 + i * 10 }),
			sumLabel: { x: 154, y: 140 },
			subagentOut: { x: 560, y: 136 },
			beforeLabel: { x: 210, y: 52 },
			orchLabel: { x: 232, y: 232 },
			subLabel: { x: 548, y: 24 },
		});
	},
};

export const phone = {
	height: 330,
	draw(f) {
		const tile = { w: 70, h: 50 };
		const grid = Array.from({ length: 8 }, (_, i) => ({
			x: 24 + (i % 4) * 82,
			y: 120 + Math.floor(i / 4) * 66,
		}));
		const orchestrator = { x: 128, y: 126, s: 1.5 };
		const subagents = Array.from({ length: 7 }, (_, i) => ({ x: 18 + i * 47, y: 276, s: 0.5 }));
		const me = { x: 118, y: 10, w: 124, h: 56 };
		draw(f, {
			tile,
			grid,
			orchestrator,
			subagents,
			me,
			prompt: 14,
			label: 16,
			pointAt: (p, t) => ({ x: p.x + (t.w * (p.s ?? 1)) / 2, y: p.y }),
			meOut: { x: 180, y: 66 },
			meIn: { x: 180, y: 70 },
			orchestratorIn: { x: 180, y: 201 },
			orchestratorOut: { x: 180, y: 126 },
			lineStart: (i) => ({ x: 150 + i * 10, y: 201 }),
			sumLabel: { x: 190, y: 100 },
			subagentOut: { x: 180, y: 276 },
			beforeLabel: { x: 24, y: 104 },
			orchLabel: { x: 242, y: 168 },
			subLabel: { x: 18, y: 320 },
		});
	},
};
