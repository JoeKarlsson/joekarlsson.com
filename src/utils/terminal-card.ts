// The text card `curl -L joekarlsson.com/hi` prints (src/pages/hi/index.txt.ts):
// who Joe is, the newest post and the homelab's live numbers, in the site's pink
// for terminals. A static file can't tell a terminal from a pipe, so the color
// codes are always in it.

const PINK = '\x1b[38;2;255;79;216m';
const BOLD = '\x1b[1m';
const GRAY = '\x1b[90m';
const RESET = '\x1b[0m';
const LABEL_WIDTH = 10;
const TEXT_WIDTH = 50;

export interface TerminalCardData {
	runningContainers: number;
	proxmoxNodes: number;
	cpuThreads: number;
	latestTitle: string;
	latestUrl: string;
}

/** Breaks text into lines of at most `width` characters, at spaces. */
export function wrapWords(text: string, width: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(/\s+/).filter(Boolean)) {
		if (line && line.length + 1 + word.length > width) {
			lines.push(line);
			line = word;
		} else line = line ? `${line} ${word}` : word;
	}
	if (line) lines.push(line);
	return lines;
}

const pink = (text: string) => `${PINK}${text}${RESET}`;

/** One labeled row; continuation lines line up under the first. */
function row(label: string, lines: string[]): string {
	return lines
		.map((line, i) => `  ${GRAY}${(i === 0 ? label : '').padEnd(LABEL_WIDTH)}${RESET}${line}`)
		.join('\n');
}

export function terminalCard(data: TerminalCardData): string {
	const intro = wrapWords(
		`I build with data and AI agents, run ${data.runningContainers} containers at home, and write about the ones that break.`,
		TEXT_WIDTH,
	);
	return [
		'',
		`  ${PINK}${BOLD}▌ JOE KARLSSON${RESET}`,
		...intro.map((line) => `  ${pink('▌')} ${line}`),
		'',
		row('latest', [...wrapWords(data.latestTitle, TEXT_WIDTH), pink(data.latestUrl)]),
		row('homelab', [
			`${data.runningContainers} containers, ${data.proxmoxNodes} Proxmox nodes, ${data.cpuThreads} threads`,
		]),
		row('letter', [`Works on My Machine  ${pink('https://joekarlsson.com/newsletter/')}`]),
		'',
		row('web', ['https://joekarlsson.com']),
		row('github', ['https://github.com/JoeKarlsson']),
		row('bluesky', ['@joekarlsson.com']),
		row('manual', ['https://joekarlsson.com/man/']),
		'',
		`  ${GRAY}You curled a website. We'd get along.${RESET}`,
		'',
		'',
	].join('\n');
}

/** The card's lines as colored runs, for showing it on a web page: pink, gray (muted) and
 * bold come from its escape codes; every reset ends a run. */
export function terminalRuns(
	card: string,
): { text: string; pink: boolean; muted: boolean; bold: boolean }[][] {
	return card.split('\n').map((line) => {
		const runs = [];
		const style = { pink: false, muted: false, bold: false };
		// eslint-disable-next-line no-control-regex -- the escape codes are what it splits on
		for (const part of line.split(/(\x1b\[[\d;]+m)/)) {
			if (part === RESET) Object.assign(style, { pink: false, muted: false, bold: false });
			else if (part === PINK) style.pink = true;
			else if (part === GRAY) style.muted = true;
			else if (part === BOLD) style.bold = true;
			else if (part) runs.push({ text: part, ...style });
		}
		return runs;
	});
}
