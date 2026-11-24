// How a film gets its score, on one real line from the study: Pris in Blade Runner. The script
// line and the subtitle line are from the study's files; the kept/lost flags are the alignment's.
import { COLORS } from '../draw.mjs';

const WORDS = [
	['I', true], ['have', true], ['some,', true], ['but', true], ['I', true], ['have', true], ['to', true],
	['find', true], ['out', false], ['where', false], ['they', false], ['are', false], ['staying.', false],
];
const KEPT = WORDS.filter(([, kept]) => kept).length;

export const alt = `How each film is scored, on one line from Blade Runner. The script has Pris say "I have some, but I have to find out where they are staying." The subtitles, up to nine versions per film, have "I have some, but I have to find them." Lined up word by word in order, ${KEPT} of the script's ${WORDS.length} words are said; a word counts only if most subtitle versions have it. A film's score is the share of all its script's dialogue words said this way: Blade Runner's is 19%.`;

const SANS = "var(--font-hanken-grotesk, 'Hanken Grotesk'), Arial, sans-serif";

/** The script line as SVG text: kept words in paper, lost words pink and struck through. */
function alignedLine(x, y, size, lines) {
	let i = 0;
	return lines
		.map((count, row) => {
			const spans = WORDS.slice(i, (i += count))
				.map(([word, kept]) =>
					kept
						? `<tspan fill="${COLORS.paper}">${word} </tspan>`
						: `<tspan fill="${COLORS.pink}" text-decoration="line-through">${word} </tspan>`,
				)
				.join('');
			return `<text x="${x}" y="${y + row * (size + 8)}" font-family="${SANS}" font-size="${size}" font-weight="600" dominant-baseline="central">${spans}</text>`;
		})
		.join('');
}

export const desktop = {
	height: 420,
	draw(f) {
		f.box({ x: 20, y: 40, w: 290, h: 120, kind: 'chalk', label: 'The script', sub: ['"I have some, but I have', 'to find out where they', 'are staying."'], icon: 'file-text', size: 17, subSize: 14 });
		f.box({ x: 330, y: 40, w: 290, h: 120, kind: 'chalk', label: 'The subtitles', sub: ['"I have some, but I have', 'to find them."', 'up to nine versions per film'], icon: 'message-square', size: 17, subSize: 14 });
		f.arrow([[165, 164], [165, 196], [300, 196]]);
		f.arrow([[475, 164], [475, 196], [340, 196]]);
		f.box({ x: 60, y: 206, w: 520, h: 92, kind: 'outline' });
		f.text(320, 232, 'Lined up word by word, in order', { size: 15, color: COLORS.muted, weight: 700 });
		f.raw(alignedLine(86, 266, 16, [WORDS.length]));
		f.arrow([[320, 302], [320, 340]]);
		f.note(336, 321, 'a word counts if most versions have it', { size: 14 });
		f.box({ x: 120, y: 346, w: 400, h: 62, kind: 'pink', label: `${KEPT} of ${WORDS.length} words kept`, sub: "Blade Runner's whole script: 19%", size: 18 });
	},
};

export const phone = {
	height: 600,
	draw(f) {
		f.box({ x: 20, y: 40, w: 320, h: 120, kind: 'chalk', label: 'The script', sub: ['"I have some, but I have', 'to find out where they', 'are staying."'], icon: 'file-text', size: 16, subSize: 14 });
		f.arrow([[180, 164], [180, 184]]);
		f.box({ x: 20, y: 188, w: 320, h: 120, kind: 'chalk', label: 'The subtitles', sub: ['"I have some, but I', 'have to find them."', 'up to nine versions'], icon: 'message-square', size: 16, subSize: 14 });
		f.arrow([[180, 312], [180, 332]]);
		f.box({ x: 20, y: 336, w: 320, h: 110, kind: 'outline' });
		f.text(180, 360, 'Lined up word by word', { size: 14, color: COLORS.muted, weight: 700 });
		f.raw(alignedLine(40, 394, 15, [7, 6]));
		f.arrow([[180, 450], [180, 486]]);
		f.note(194, 468, 'majority rule', { size: 14 });
		f.box({ x: 20, y: 490, w: 320, h: 70, kind: 'pink', label: `${KEPT} of ${WORDS.length} words kept`, sub: "Blade Runner's whole script: 19%", size: 17 });
	},
};
