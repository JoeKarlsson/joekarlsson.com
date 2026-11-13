import { execFileSync, spawnSync } from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Security audit run-1. deploy.sh runs with every credential Joe has, so its guards
// are pinned here: removing one fails npm test (and the pre-push hook).
const deploy = readFileSync('deploy.sh', 'utf8');

describe('deploy.sh guards', () => {
	it('plans first and never auto-approves an apply', () => {
		expect(deploy).not.toMatch(/-auto-approve/);
		expect(deploy).toMatch(/tofu -chdir="\$TOFU_DIR" plan .*-out="\$TOFU_PLAN"/);
		expect(deploy).toContain(String.raw`grep -vxE 'null_resource\.(push_content|purge_cache)'`);
	});

	it('requires purge credentials before deploying', () => {
		expect(deploy).toMatch(
			/CLOUDFLARE_ZONE_ID:-\}" \|\| -z "\$\{CLOUDFLARE_API_TOKEN:-\}" \]\]; then[\s\S]{0,400}exit 1/,
		);
	});

	it('only exempts snapshot commits that touch only the snapshot', () => {
		expect(deploy).toContain("grep -qvE '^(src/data/now-feed\\.json|public/images/now/)'");
	});

	it('builds against a node_modules installed from the same lockfile', () => {
		expect(deploy).toContain('cmp -s "$MAIN_DIR/package-lock.json" "$BUILD_DIR/package-lock.json"');
	});

	it('parses', () => {
		expect(() => execFileSync('bash', ['-n', 'deploy.sh'])).not.toThrow();
	});
});

// Runs the real deploy.sh in a throwaway repo with no remote, so past the lock it
// stops at its first git fetch and never reaches a build or tofu.
function runDeployWithLock(lockPid: number) {
	// Git hooks export GIT_DIR (absolute from a worktree), which would point git init and
	// deploy.sh at the real repo and its real deploy lock, not this throwaway one
	const env = Object.fromEntries(
		Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
	);
	const repo = mkdtempSync(join(tmpdir(), 'deploy-lock-'));
	try {
		execFileSync('git', ['init', '-q', repo], { env });
		copyFileSync('deploy.sh', join(repo, 'deploy.sh'));
		const lock = join(repo, '.git', 'deploy.lock');
		mkdirSync(lock);
		writeFileSync(join(lock, 'pid'), String(lockPid));
		const run = spawnSync('bash', ['deploy.sh'], {
			cwd: repo,
			env: { ...env, SKIP_NOW_REFRESH: '1' },
			encoding: 'utf8',
		});
		return { ...run, lockLeft: existsSync(lock) };
	} finally {
		rmSync(repo, { recursive: true, force: true });
	}
}

describe('deploy.sh lock', () => {
	it('refuses to start while another deploy holds the lock', () => {
		const run = runDeployWithLock(process.pid);
		expect(run.status).not.toBe(0);
		expect(run.stderr).toContain('another deploy is running');
		expect(run.lockLeft).toBe(true);
	});

	it('takes over a lock whose deploy is gone, and releases it on exit', () => {
		const run = runDeployWithLock(2 ** 22 + 12345); // above macOS and Linux pid limits
		expect(run.stdout).toContain('Taking over a stale deploy lock');
		expect(run.lockLeft).toBe(false);
	});
});

describe('.gitignore', () => {
	it('ignores every .env variant and key files', () => {
		const ignored = (file: string) => {
			try {
				execFileSync('git', ['check-ignore', '-q', file]);
				return true;
			} catch {
				return false;
			}
		};
		for (const file of ['.env', '.env.local', '.env.development', 'id.pem', 'server.key']) {
			expect(ignored(file), file).toBe(true);
		}
	});
});
