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

/** The environment without git's own variables. The pre-push hook runs these tests with GIT_DIR
 *  set; from a linked worktree it points at .git/worktrees/<name>, and a `git init` that inherits
 *  it re-initializes the real repo as bare (core.bare=true), which broke every session's commits on
 *  2026-11-27. Git run here must only ever see the copy. */
export function withoutGitEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
	return Object.fromEntries(Object.entries(env).filter(([key]) => !key.startsWith('GIT_')));
}

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
	execFileSync('git', ['init', '-q'], { cwd: copy, env: withoutGitEnv() });

	expect(() =>
		execFileSync('node', ['scripts/generate-issue-cards.mjs', '--staged'], {
			cwd: copy,
			stdio: 'pipe',
			env: withoutGitEnv(),
		}),
	).not.toThrow();
});

it("run from a linked worktree's hook, it leaves the real repo non-bare", () => {
	// A throwaway repo with a linked worktree stands in for the real one
	const probe = mkdtempSync(join(tmpdir(), 'issue-card-hook-probe-'));
	try {
		const repo = join(probe, 'repo');
		const git = (args: string[], cwd = repo, env = withoutGitEnv()) =>
			execFileSync('git', args, { cwd, env, encoding: 'utf8' }).trim();
		mkdirSync(repo);
		git(['init', '-q']);
		git([
			'-c',
			'user.name=t',
			'-c',
			'user.email=t@t',
			'commit',
			'-q',
			'--allow-empty',
			'-m',
			'chore: Probe',
		]);
		git(['worktree', 'add', '-q', join(probe, 'wt')]);
		const hookEnv = { ...process.env, GIT_DIR: join(repo, '.git', 'worktrees', 'wt') };
		const target = join(probe, 'copy');
		mkdirSync(target);
		git(['init', '-q'], target, withoutGitEnv(hookEnv));
		expect(git(['config', 'core.bare'])).toBe('false');
	} finally {
		rmSync(probe, { recursive: true, force: true });
	}
});
