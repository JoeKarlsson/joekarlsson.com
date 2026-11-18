// The third-repeat rule, animated: an agent's action runs at my repo three times. The first
// time I say no in chat, the second time it's a line in CLAUDE.md, and both times the mistake
// gets through. The third time it's a hook, and the action stops at it. SMIL stepped at 12 fps,
// like doom-mcp-server/go-to-walk.mjs; .anim-still is the finished frame for reduced motion.
import { COLORS } from '../draw.mjs';

export const alt =
	'Animation: an agent sends the same wrong action at my repo three times. The first time, a chat bubble says "no, not like that" and the action gets through anyway. The second time, the rule is a line in CLAUDE.md and it still gets through. The third time, the rule is a hook: a pink gate drops across the path and the action stops at it.';

const FPS = 12;
const ROUND = 2.2; // seconds per attempt
const SHOW = 0.15; // when that attempt's rule appears
const GO = 0.6; // when the action leaves the agent
const TRAVEL = 1.1;
const HOLD = 1.5; // the blocked frame, after the third attempt
const n = (v) => Math.round(v * 10) / 10;
const ease = (u) => 1 - (1 - u) ** 2;

/** Which attempt (0-2, or 3 for the blank reset frame), and where the action dot is. */
function stateAt(t, L) {
	const end = 3 * ROUND + HOLD;
	if (t >= end) return { round: 3, x: L.from, dot: 0, shipped: 0, stopped: 0 };
	const round = Math.min(2, Math.floor(t / ROUND));
	const u = Math.max(0, Math.min(1, (t - round * ROUND - GO) / TRAVEL));
	const target = round === 2 ? L.gate - 12 : L.to;
	const arrived = u >= 1;
	return {
		round: t - round * ROUND >= SHOW ? round : round - 1,
		x: L.from + (target - L.from) * ease(u),
		dot: u > 0 ? 1 : 0,
		shipped: round < 2 && arrived ? 1 : 0,
		stopped: round === 2 && arrived ? 1 : 0,
	};
}

/** One discrete SMIL animation over the whole loop; nothing when the value never changes. */
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

const sans = "var(--font-hanken-grotesk, 'Hanken Grotesk'), Arial, sans-serif";
const mono = "var(--font-jetbrains-mono, 'JetBrains Mono'), Menlo, monospace";
const anton = 'var(--font-anton, Anton), Impact, sans-serif';

/** The moving pieces at one state; `a` holds each piece's animation for the live layer. */
function pieces(L, s, a = {}) {
	const vis = (on) => `visibility="${on ? 'visible' : 'hidden'}"`;
	const cx = L.gate;
	const ordinal = ['1st time', '2nd time', '3rd time'];
	return [
		...ordinal.map(
			(label, i) =>
				`<text x="${cx}" y="${L.tallyY}" font-family="${sans}" font-size="${L.size}" font-weight="700" fill="${COLORS.paper}" text-anchor="middle" dominant-baseline="central" ${vis(s.round === i)}>${a.round?.[i] ?? ''}${label}</text>`,
		),
		// 1: said in chat
		`<g ${vis(s.round === 0)}>${a.round?.[3] ?? ''}<rect x="${cx - L.cardW / 2}" y="${L.cardY}" width="${L.cardW}" height="${L.cardH}" rx="14" fill="none" stroke="${COLORS.chalk}" stroke-width="2"/><path d="M${cx - 10} ${L.cardY + L.cardH} l-8 12 l20 -12" fill="${COLORS.ink}" stroke="${COLORS.chalk}" stroke-width="2" stroke-linejoin="round"/><text x="${cx}" y="${L.cardY + L.cardH / 2}" font-family="${sans}" font-size="${L.size}" fill="${COLORS.paper}" text-anchor="middle" dominant-baseline="central">“No, not like that.”</text></g>`,
		// 2: a line in CLAUDE.md
		`<g ${vis(s.round === 1)}>${a.round?.[4] ?? ''}<rect x="${cx - L.cardW / 2}" y="${L.cardY}" width="${L.cardW}" height="${L.cardH}" fill="${COLORS.chalk}"/><text x="${cx - L.cardW / 2 + 10}" y="${L.cardY + L.cardH * 0.3}" font-family="${mono}" font-size="${L.size - 2}" font-weight="700" fill="${COLORS.ink}" dominant-baseline="central">CLAUDE.md</text><text x="${cx - L.cardW / 2 + 10}" y="${L.cardY + L.cardH * 0.7}" font-family="${mono}" font-size="${L.size - 2}" fill="${COLORS.ink}" dominant-baseline="central">- Not like that.</text></g>`,
		// 3: a hook, a gate across the path
		`<g ${vis(s.round === 2)}>${a.round?.[5] ?? ''}<text x="${cx}" y="${L.cardY + L.cardH / 2}" font-family="${anton}" font-size="${L.size + 10}" fill="${COLORS.pink}" text-anchor="middle" dominant-baseline="central">HOOK</text><rect x="${cx - 5}" y="${L.pathY - L.gateH / 2}" width="10" height="${L.gateH}" fill="${COLORS.pink}"/></g>`,
		`<circle cx="0" cy="${L.pathY}" r="9" fill="${COLORS.pink}" transform="translate(${n(s.x)} 0)" opacity="${s.dot}">${a.move ?? ''}${a.dot ?? ''}</circle>`,
		`<text x="${L.to - 6}" y="${L.noteY}" font-family="${sans}" font-size="${L.size - 1}" fill="${COLORS.muted}" text-anchor="middle" dominant-baseline="central" opacity="${s.shipped}">${a.shipped ?? ''}the mistake ships</text>`,
		`<text x="${cx}" y="${L.noteY}" font-family="${sans}" font-size="${L.size - 1}" font-weight="700" fill="${COLORS.pink}" text-anchor="middle" dominant-baseline="central" opacity="${s.stopped}">${a.stopped ?? ''}blocked</text>`,
	].join('');
}

function draw(f, L) {
	f.box({ ...L.agent, kind: 'outline', label: 'Agent', icon: 'bot', stack: L.stack });
	f.box({ ...L.repo, kind: 'chalk', label: 'My repo', icon: 'file-code', stack: L.stack });
	f.arrow(
		[
			[L.agent.x + L.agent.w, L.pathY],
			[L.repo.x, L.pathY],
		],
		{ dashed: true },
	);

	const loop = Math.ceil((3 * ROUND + HOLD) * FPS + 1) / FPS;
	const frames = Array.from({ length: Math.round(loop * FPS) }, (_, i) => stateAt(i / FPS, L));
	const over = (pick, opts) => stepped(frames.map(pick), loop, opts);
	const anim = {
		round: [
			...[0, 1, 2].map((r) =>
				over((s) => (s.round === r ? 'visible' : 'hidden'), { attr: 'visibility' }),
			),
			...[0, 1, 2].map((r) =>
				over((s) => (s.round === r ? 'visible' : 'hidden'), { attr: 'visibility' }),
			),
		],
		move: over((s) => `${n(s.x)} 0`, { type: 'translate' }),
		dot: over((s) => s.dot, { attr: 'opacity' }),
		shipped: over((s) => s.shipped, { attr: 'opacity' }),
		stopped: over((s) => s.stopped, { attr: 'opacity' }),
	};
	f.raw(`<g class="anim-live">${pieces(L, frames[0], anim)}</g>`);
	f.raw(
		`<g class="anim-still" display="none">${pieces(L, stateAt(3 * ROUND + HOLD - 0.01, L))}</g>`,
	);
}

export const desktop = {
	height: 240,
	draw(f) {
		draw(f, {
			agent: { x: 16, y: 136, w: 140, h: 60 },
			repo: { x: 484, y: 136, w: 140, h: 60 },
			pathY: 166,
			from: 168,
			to: 470,
			gate: 320,
			gateH: 64,
			tallyY: 22,
			cardY: 46,
			cardW: 210,
			cardH: 52,
			noteY: 220,
			size: 16,
		});
	},
};

export const phone = {
	height: 250,
	draw(f) {
		draw(f, {
			agent: { x: 8, y: 128, w: 104, h: 80 },
			repo: { x: 248, y: 128, w: 104, h: 80 },
			stack: true,
			pathY: 168,
			from: 122,
			to: 238,
			gate: 180,
			gateH: 56,
			tallyY: 20,
			cardY: 44,
			cardW: 196,
			cardH: 52,
			noteY: 226,
			size: 15,
		});
	},
};
