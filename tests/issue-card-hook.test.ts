import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterAll, expect, it } from 'vitest';

// The pre-commit hook runs `generate-issue-cards.mjs --staged` on every commit. On 2026-11-27 it
// imported src/data/scribbles.ts up front, so one session's half-edited marks file (missing an
// export) failed every other session's commits, though none of them staged a newsletter issue.
const ROOT = resolve(import.meta.dirname, '..');
const copy = mkdtempSync(join(tmpdir(), 'issue-card-hook-'));
afterAll(() => rmSync(copy, { recursive: true, force: true }));

it('a commit with no newsletter issue staged never loads the marks file', () => {
	for (const file of [
		'scripts/generate-issue-cards.mjs',
		'scripts/issue-card-content.mjs',
		'scripts/issue-card-motion.mjs',
		'src/utils/curly-apostrophes.mjs',
		'brand/logo/svg/off-register/jk-for-dark.svg',
	]) {
		mkdirSync(dirname(join(copy, file)), { recursive: true });
		cpSync(join(ROOT, file), join(copy, file));
	}
	mkdirSync(join(copy, 'src/content/newsletter'), { recursive: true });
	mkdirSync(join(copy, 'src/data'));
	writeFileSync(join(copy, 'src/data/scribbles.ts'), 'export const MARKS = {};\n');
	symlinkSync(join(ROOT, 'node_modules'), join(copy, 'node_modules'));
	execFileSync('git', ['init', '-q'], { cwd: copy });

	expect(() =>
		execFileSync('node', ['scripts/generate-issue-cards.mjs', '--staged'], {
			cwd: copy,
			stdio: 'pipe',
		}),
	).not.toThrow();
});
