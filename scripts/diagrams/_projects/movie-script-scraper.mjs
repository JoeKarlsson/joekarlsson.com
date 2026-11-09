// The Movie Script Scraper's card (src/data/projects.ts): the CLI pulling ten Horror scripts
// from IMSDb, five downloads in flight at a time, each landing as a .txt in the genre folder.
//   node scripts/diagrams/_projects/movie-script-scraper.mjs <output dir>
import { COLORS, createFigure } from '../draw.mjs';
import { CARD, finish, outDirFromArgs, writeFrames } from './write-frames.mjs';

// The slug it saves each script as (src/getScript/helper/extractPageContents.js)
const SCRIPTS = [
	'alien',
	'scream',
	'halloween',
	'psycho',
	'carrie',
	'get-out',
	'frankenstein',
	'it',
	'saw',
	'candyman',
];
const AT_ONCE = 5;
// The card is graded black-to-pink (scripts/boiling-thumbnail.mjs): chalk is the brightest
const NOW = COLORS.chalk;
const BEFORE = COLORS.muted;

function drawFrame(landed) {
	const f = createFigure({ id: 'project-movie-scripts', ...CARD });
	f.code({ x: 20, y: 12, w: 600, lines: ['$ movie-script-scraper --genre Horror --total 10'] });
	f.group({ x: 404, y: 96, w: 216, h: 250, label: 'scripts/Horror/' });
	f.box({
		x: 20,
		y: 112,
		w: 130,
		h: 92,
		kind: 'outline',
		label: 'IMSDb',
		icon: 'globe',
		stack: true,
	});
	f.text(20, 248, `${landed} / ${SCRIPTS.length}`, {
		font: 'mono',
		size: 32,
		anchor: 'start',
		color: NOW,
	});
	f.note(20, 280, 'scripts saved', { size: 17 });
	// In flight: the next five, the pool refilling as each one lands
	const inFlight = SCRIPTS.slice(landed, landed + AT_ONCE);
	f.note(196, 102, inFlight.length ? `${AT_ONCE} at a time` : 'done', { size: 17 });
	inFlight.forEach((name, i) =>
		f.text(196, 134 + i * 30, `${name}…`, {
			font: 'mono',
			size: 17,
			anchor: 'start',
			color: BEFORE,
		}),
	);
	SCRIPTS.slice(0, landed).forEach((name, i) =>
		f.text(420, 128 + i * 21.5, `${name}.txt`, {
			font: 'mono',
			size: 17,
			anchor: 'start',
			color: i === landed - 1 ? NOW : COLORS.paper,
			weight: i === landed - 1 ? 700 : 400,
		}),
	);
	return finish(
		f,
		`Movie Script Scraper downloading Horror scripts from IMSDb five at a time: ${landed} of 10 saved as text files`,
	);
}

const frames = [];
for (let landed = 0; landed <= SCRIPTS.length; landed++) frames.push(drawFrame(landed));
writeFrames(outDirFromArgs('scripts/diagrams/_projects/movie-script-scraper.mjs'), frames);
