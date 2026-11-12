#!/usr/bin/env node
/**
 * Holds a Claude session's finish until a layout, component, page or style change has had a
 * design review (CLAUDE.md, Checks). Hooked from .claude/settings.json:
 *
 *   Stop          node scripts/design-review-gate.mjs stop            blocks while no review is recorded
 *   SubagentStop  node scripts/design-review-gate.mjs subagent-stop   records one when a design reviewer finishes
 *   by hand       node scripts/design-review-gate.mjs waive "<why>"   when no review is needed (12+ chars, 5 at most)
 *
 * The change is the worktree against its merge base with origin/main (commits not pushed,
 * uncommitted and untracked files). A review covers later edits to the same files, so fixing
 * its findings needs no second review; touching a file it didn't cover does. It never traps a
 * session: after 3 blocks for one change, the finish goes through with a note.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DESIGN_PATH = /^src\/(layouts|components|styles)\/|^src\/pages\/.*\.astro$/;
const REVIEWERS = ['design-reviewer', 'design-critic', 'design-evidence'];
const MAX_BLOCKS = 3;
const MAX_WAIVERS = 5;

export const isDesignPath = (path) => DESIGN_PATH.test(path);

/** 'allow', 'block' or 'capped' for the current change, given what the state file holds */
export function decide(change, state) {
	if (change.paths.length === 0) return 'allow';
	const reviewed = state.reviews.some(
		(review) =>
			review.hash === change.hash || change.paths.every((path) => review.paths.includes(path)),
	);
	if (reviewed || state.waivers.some((waiver) => waiver.hash === change.hash)) return 'allow';
	return (state.blocks[change.hash] ?? 0) >= MAX_BLOCKS ? 'capped' : 'block';
}

const git = (root, ...args) =>
	execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();

function currentChange(cwd) {
	const root = git(cwd, 'rev-parse', '--show-toplevel');
	let base = 'HEAD';
	try {
		base = git(root, 'merge-base', 'HEAD', 'origin/main');
	} catch {
		// no origin/main (a fresh clone without a remote): only uncommitted work counts
	}
	const changed = [
		...git(root, 'diff', '--name-only', base).split('\n'),
		...git(root, 'ls-files', '--others', '--exclude-standard').split('\n'),
	];
	const paths = [...new Set(changed.filter(isDesignPath))].sort();
	const hash = createHash('sha256');
	for (const path of paths) {
		const file = join(root, path);
		hash.update(`${path}\0${existsSync(file) ? readFileSync(file, 'utf8') : '<deleted>'}\0`);
	}
	return { root, paths, hash: hash.digest('hex').slice(0, 16) };
}

function loadState(root) {
	const file = join(root, '.claude/design-gate/state.json');
	const state = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
	return {
		file,
		state: {
			reviews: state.reviews ?? [],
			waivers: state.waivers ?? [],
			blocks: state.blocks ?? {},
		},
	};
}

function saveState(file, state) {
	mkdirSync(join(file, '..'), { recursive: true });
	writeFileSync(file, `${JSON.stringify(state, null, '\t')}\n`);
}

const readHookInput = () => JSON.parse(readFileSync(0, 'utf8') || '{}');

function main() {
	const [command, ...rest] = process.argv.slice(2);
	const input = command === 'waive' ? {} : readHookInput();
	const change = currentChange(input.cwd ?? process.cwd());
	const { file, state } = loadState(change.root);
	const at = new Date().toISOString();

	if (command === 'subagent-stop') {
		const agent = String(input.agent_type ?? '');
		if (
			change.paths.length &&
			REVIEWERS.some((name) => agent === name || agent.endsWith(`:${name}`))
		) {
			state.reviews.push({ hash: change.hash, paths: change.paths, by: agent, at });
			saveState(file, state);
		}
		return;
	}

	if (command === 'waive') {
		const reason = rest.join(' ').trim();
		if (reason.length < 12) throw new Error('Give a reason of 12 or more characters');
		if (state.waivers.length >= MAX_WAIVERS) {
			throw new Error(`${MAX_WAIVERS} waivers already in ${file}: run the design review instead`);
		}
		state.waivers.push({ hash: change.hash, paths: change.paths, reason, at });
		saveState(file, state);
		for (const waiver of state.waivers)
			console.log(`${waiver.at}  ${waiver.paths.join(', ')}: ${waiver.reason}`);
		return;
	}

	if (command !== 'stop')
		throw new Error('Usage: design-review-gate.mjs stop | subagent-stop | waive "<reason>"');
	const verdict = decide(change, state);
	if (verdict === 'allow') return;
	if (verdict === 'capped') {
		console.log(
			JSON.stringify({
				systemMessage: `Design gate: ${change.paths.join(', ')} changed with no design review recorded, let through after ${MAX_BLOCKS} blocks.`,
			}),
		);
		return;
	}
	state.blocks[change.hash] = (state.blocks[change.hash] ?? 0) + 1;
	saveState(file, state);
	console.log(
		JSON.stringify({
			decision: 'block',
			reason:
				`This change touches ${change.paths.join(', ')} and no design review is recorded for it ` +
				`(block ${state.blocks[change.hash]} of ${MAX_BLOCKS}). Run the design-reviewer agent on the built page ` +
				'(CLAUDE.md, Checks) and fix its High and Medium findings, or, when there is nothing visible to review, run ' +
				'`node scripts/design-review-gate.mjs waive "<reason>"`. If you are asking Joe something, say so and stop again.',
		}),
	);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
