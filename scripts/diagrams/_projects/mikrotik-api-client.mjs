// The MikroTik Native API Client's card (src/data/projects.ts): a /login sentence built on the
// wire one word at a time, each with its length byte, then the router's !done.
//   node scripts/diagrams/_projects/mikrotik-api-client.mjs <output dir>
//   node scripts/boiling-thumbnail.mjs <output dir> public/images/projects/mikrotik-api-client --step 1000
import { COLORS, createFigure } from '../draw.mjs';
import { CARD, finish, outDirFromArgs, writeFrames } from './write-frames.mjs';

// What the client sends: each word goes out as its length, then its bytes; a 0 byte ends it
const WORDS = ['/login', '=name=admin', '=password=secret'];
const REPLY = '!done';
const hex = (value) => `0x${value.toString(16).padStart(2, '0')}`;
const ROW = { x: 40, y: 84, h: 44 };
const BYTES_Y = 318;
// The card is graded black-to-pink (scripts/boiling-thumbnail.mjs), so chalk, the brightest,
// marks what just happened and muted grey what came before
const NOW = COLORS.chalk;
const BEFORE = COLORS.muted;

function drawFrame(sentCount, ended, replied) {
	const f = createFigure({ id: 'project-mikrotik', ...CARD });
	f.group({ x: 20, y: 40, w: 390, h: 212, label: 'Sentence' });
	f.box({
		x: 474,
		y: 96,
		w: 140,
		h: 100,
		kind: 'outline',
		label: 'RouterOS',
		logo: 'mikrotik',
		stack: true,
	});
	f.note(474, 214, 'port 8728');
	const sent = WORDS.slice(0, sentCount);
	sent.forEach((word, i) => {
		const y = ROW.y + i * ROW.h;
		const latest = i === sentCount - 1 && !ended;
		f.dot(ROW.x + 26, y, 19, latest ? NOW : BEFORE);
		f.text(ROW.x + 26, y + 1, hex(word.length), {
			font: 'mono',
			size: 14,
			weight: 700,
			color: COLORS.ink,
		});
		f.text(ROW.x + 60, y, word, {
			font: 'mono',
			size: 22,
			anchor: 'start',
			color: latest ? NOW : BEFORE,
		});
	});
	if (ended) {
		const y = ROW.y + WORDS.length * ROW.h;
		f.dot(ROW.x + 26, y, 19, replied ? BEFORE : NOW);
		f.text(ROW.x + 26, y + 1, '0x00', { font: 'mono', size: 14, weight: 700, color: COLORS.ink });
		f.note(ROW.x + 60, y, 'end of sentence', { size: 17 });
	}
	if (sentCount)
		f.arrow(
			[
				[400, 150],
				[474, 150],
			],
			{ heads: replied ? 'both' : 'end' },
		);
	if (replied) {
		f.text(544, 66, REPLY, { font: 'display', size: 38, color: NOW });
	}
	// The newest word as it goes out: its length byte lit, then its bytes
	const word = ended ? '' : sent[sent.length - 1];
	if (word !== undefined) {
		const length = word.length.toString(16).padStart(2, '0');
		f.text(ROW.x, BYTES_Y, length, { font: 'mono', size: 18, anchor: 'start', color: NOW });
		const rest = [...Buffer.from(word)].map((b) => b.toString(16).padStart(2, '0')).join(' ');
		if (rest)
			f.text(ROW.x + 32, BYTES_Y, rest, {
				font: 'mono',
				size: 18,
				anchor: 'start',
				color: BEFORE,
			});
		f.note(ROW.x, BYTES_Y - 30, 'on the wire: its length, then its bytes');
	}
	return finish(
		f,
		replied
			? 'A MikroTik API login: three length-prefixed words and a zero byte sent to RouterOS, which answers !done'
			: `A MikroTik API login being written to the wire, ${sentCount} of 3 words sent`,
	);
}

const frames = [];
for (let i = 1; i <= WORDS.length; i++) frames.push(drawFrame(i, false, false));
frames.push(drawFrame(WORDS.length, true, false));
frames.push(drawFrame(WORDS.length, true, true));
writeFrames(outDirFromArgs('scripts/diagrams/_projects/mikrotik-api-client.mjs'), frames);
