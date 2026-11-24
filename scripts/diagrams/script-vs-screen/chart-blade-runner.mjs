// Blade Runner's rooftop ending: Hampton Fancher's draft (the script in the study) against the
// film's subtitles. The draft's lines are struck out one by one; only "time to die" survives,
// and the film's speech writes in beside it. Script text from the draft, screen text from the
// subtitles, both verbatim.
import { COLORS, MUTED, SANS, label, layers, n, panel } from './_chart.mjs';

const SCRIPT = [
	['BATTY', "It's time to die."],
	[null, 'Deckard throws the laser at him. It misses. Batty throws his head back and laughs.'],
	['BATTY', "That's for you. Stick it in your ear and push. If that doesn't work, try the eye."],
	[null, 'Deckard FIRES again. This one goes home. Batty falls like he was poleaxed.'],
];
const SCREEN = [
	"I've seen things you people wouldn't believe.",
	'Attack ships on fire off the shoulder of Orion.',
	'I watched C-beams glitter in the dark near the Tannhäuser Gate.',
	'All those moments will be lost in time like tears in the rain.',
	'Time to die.',
];

export const alt = `Blade Runner's ending, script against screen. In Hampton Fancher's draft, Batty says "It's time to die," hands Deckard a nail ("Stick it in your ear and push"), and Deckard shoots him dead. In the film, Batty saves Deckard and says: ${SCREEN.join(' ')} Of the draft's lines, only "time to die" is said on screen.`;

/** Words into lines of at most `max` characters. */
function wrap(text, max) {
	const lines = [''];
	for (const word of text.split(' ')) {
		const last = lines.at(-1);
		if (last && last.length + word.length + 1 > max) lines.push(word);
		else lines[lines.length - 1] = last ? `${last} ${word}` : word;
	}
	return lines;
}

function chart(f, { W, H, phone }) {
	const colW = phone ? W - 52 : (W - 64) / 2;
	const cols = phone ? [[26, 92], [26, 372]] : [[26, 92], [26 + colW + 12, 92]];
	const max = phone ? 40 : 36;
	const lineH = 19;
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(phone ? 20 : 16, phone ? 18 : 20, phone ? "Blade Runner's last scene" : "Blade Runner's last scene, on the page and on screen", {
		font: 'display',
		size: phone ? 19 : 22,
		anchor: 'start',
		upper: true,
	});
	f.text(cols[0][0], cols[0][1] - 24, "The script: Hampton Fancher's draft", { size: 13, anchor: 'start', color: MUTED, weight: 700 });
	f.text(cols[1][0], cols[1][1] - 24, 'The film: what the subtitles say', { size: 13, anchor: 'start', color: MUTED, weight: 700 });

	layers(f, phone, (el) => {
		const out = [];
		// The draft, written out from the start, struck through block by block
		let y = cols[0][1];
		SCRIPT.forEach(([speaker, text], i) => {
			const strikeAt = 0.8 + i * 0.7;
			if (speaker) {
				out.push(label(el, cols[0][0], y, speaker, { size: 12, anchor: 'start', color: MUTED, weight: 700 }));
				y += lineH - 2;
			}
			wrap(text, max).forEach((line) => {
				const survives = i === 0;
				const width = line.length * (speaker ? 6.6 : 6.5);
				out.push(
					label(el, cols[0][0], y, line, {
						size: 14,
						anchor: 'start',
						weight: speaker ? 600 : 400,
						color: speaker ? COLORS.paper : MUTED,
					}),
				);
				if (survives) {
					// "time to die" lights up instead of being struck
					out.push(
						el('rect', { x: n(cols[0][0] + 33), y: n(y + 8), height: 3, fill: COLORS.pink }, { width: (t) => (t >= strikeAt ? 76 : 0) }),
						el('rect', { x: n(cols[0][0]), y: n(y - 1), height: 2.5, fill: COLORS.pink }, { width: (t) => (t >= strikeAt ? 30 : 0) }),
					);
				} else {
					out.push(el('rect', { x: n(cols[0][0]), y: n(y - 1), height: 2.5, fill: COLORS.pink }, { width: (t) => n(Math.min(1, Math.max(0, (t - strikeAt) / 0.35)) * width) }));
				}
				y += lineH;
			});
			y += 8;
		});
		// The film's speech writes in, a line at a time, after the draft is crossed out
		let y2 = cols[1][1];
		SCREEN.forEach((sentence, i) => {
			const at = 3.8 + i * 0.6;
			wrap(sentence, max).forEach((line) => {
				const last = i === SCREEN.length - 1;
				out.push(
					label(el, cols[1][0], y2, line, {
						size: 14,
						anchor: 'start',
						weight: last ? 700 : 400,
						color: last ? COLORS.pink : COLORS.paper,
						anims: { opacity: (t) => (t >= at ? 1 : 0) },
					}),
				);
				y2 += lineH;
			});
			y2 += 6;
		});
		out.push(
			el(
				'text',
				{ x: cols[0][0], y: H - 26, 'font-family': SANS, 'font-size': 13, fill: MUTED, 'dominant-baseline': 'central' },
				{ opacity: (t) => (t >= 7 ? 1 : 0) },
				'Pink: the only words of the draft said on screen.',
			),
		);
		return out.join('');
	});
}

export const desktop = { height: 380, draw: (f) => chart(f, { W: 640, H: 380, phone: false }) };
export const phone = { height: 640, draw: (f) => chart(f, { W: 360, H: 640, phone: true }) };
