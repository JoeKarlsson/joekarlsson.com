// The Sudoku Generator project's card (src/data/projects.ts): a board that solves itself, drawn
// in the cut-paper diagram style as one SVG per frame, which scripts/boiling-thumbnail.mjs turns
// into a boiling, animated 16:9 thumbnail.
//   node scripts/diagrams/_projects/sudoku-generator.mjs <output dir>
import { COLORS, createFigure } from '../draw.mjs';
import { finish, outDirFromArgs, writeFrames } from './write-frames.mjs';

const WIDTH = 640;
const HEIGHT = 360;
const CELL = 33;
const GRID = { x: 30, y: 46 };
const GIVENS = 30;
const PER_FRAME = 4;

// A deterministic random, so a rerun draws the same board
let seed = 2015;
const random = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 4294967296;
};
const shuffle = (items) => {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
};

/** A valid solved board: the standard shifted pattern, with rows, columns, bands and digits shuffled */
function solvedBoard() {
	const rows = shuffle([0, 1, 2]).flatMap((g) => shuffle([0, 1, 2]).map((r) => g * 3 + r));
	const cols = shuffle([0, 1, 2]).flatMap((g) => shuffle([0, 1, 2]).map((c) => g * 3 + c));
	const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	const pattern = (r, c) => (3 * (r % 3) + Math.floor(r / 3) + c) % 9;
	return rows.map((r) => cols.map((c) => digits[pattern(r, c)]));
}

const solution = solvedBoard();
for (let i = 0; i < 9; i++) {
	const box = solution
		.slice(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 3)
		.flatMap((r) => r.slice((i % 3) * 3, (i % 3) * 3 + 3));
	for (const unit of [solution[i], solution.map((r) => r[i]), box])
		if (new Set(unit).size !== 9) throw new Error('the board is not a valid Sudoku');
}
const cells = [...Array(81).keys()];
const givens = new Set(shuffle(cells).slice(0, GIVENS));
// The solver fills the blanks in reading order, the way a backtracking solver walks the board
const blanks = cells.filter((i) => !givens.has(i));

function drawFrame(filled, latest) {
	const f = createFigure({ id: 'project-sudoku', width: WIDTH, height: HEIGHT });
	f.group({ x: 18, y: GRID.y - 8, w: CELL * 9 + 24, h: CELL * 9 + 16, label: 'Sudoku' });
	const left = GRID.x;
	const top = GRID.y;
	const size = CELL * 9;
	// Thin cell lines, then crayon lines around each 3x3 box
	for (let i = 1; i < 9; i++) {
		if (i % 3 === 0) continue;
		f.line(
			[
				[left + i * CELL, top],
				[left + i * CELL, top + size],
			],
			{ color: '#4a4a4a', width: 1 },
		);
		f.line(
			[
				[left, top + i * CELL],
				[left + size, top + i * CELL],
			],
			{ color: '#4a4a4a', width: 1 },
		);
	}
	for (let i = 0; i <= 9; i += 3) {
		f.arrow(
			[
				[left + i * CELL, top],
				[left + i * CELL, top + size],
			],
			{ heads: 'none' },
		);
		f.arrow(
			[
				[left, top + i * CELL],
				[left + size, top + i * CELL],
			],
			{ heads: 'none' },
		);
	}
	for (const i of cells) {
		if (!givens.has(i) && !filled.has(i)) continue;
		const cx = left + (i % 9) * CELL + CELL / 2;
		const cy = top + Math.floor(i / 9) * CELL + CELL / 2;
		const digit = String(solution[Math.floor(i / 9)][i % 9]);
		if (latest.has(i)) {
			f.dot(cx, cy, 13, COLORS.pink);
			f.text(cx, cy + 1, digit, { font: 'mono', size: 19, color: COLORS.ink, weight: 700 });
		} else {
			f.text(cx, cy + 1, digit, {
				font: 'mono',
				size: 19,
				color: givens.has(i) ? COLORS.chalk : COLORS.pink,
			});
		}
	}
	const count = GIVENS + filled.size;
	const done = count === 81;
	f.text(372, 92, done ? 'Solved' : 'Solving', {
		font: 'display',
		size: 44,
		anchor: 'start',
		upper: true,
		color: COLORS.chalk,
	});
	f.text(372, 158, `${count} / 81`, {
		font: 'mono',
		size: 40,
		anchor: 'start',
		color: COLORS.pink,
	});
	f.note(372, 196, 'cells filled');
	f.note(372, 300, 'Backtracking, in Python');
	f.note(372, 324, 'Four difficulty levels');
	return finish(
		f,
		done
			? 'A Sudoku board, solved: every cell filled, the solver’s digits in pink'
			: `A Sudoku board being solved: ${count} of 81 cells filled`,
	);
}

const outDir = outDirFromArgs('scripts/diagrams/_projects/sudoku-generator.mjs');
const frames = [];
const filled = new Set();
frames.push(drawFrame(filled, new Set()));
for (let i = 0; i < blanks.length; i += PER_FRAME) {
	const step = new Set(blanks.slice(i, i + PER_FRAME));
	step.forEach((cell) => filled.add(cell));
	frames.push(drawFrame(filled, step));
}
frames.push(drawFrame(filled, new Set()));
writeFrames(outDir, frames);
