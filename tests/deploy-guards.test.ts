import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

// Runs the lock from scripts/deploy-lock.sh on a throwaway lock folder, with two tries
// and no wait between them
function takeLock(lockPid: number) {
	const dir = mkdtempSync(join(tmpdir(), 'deploy-lock-'));
	const lock = join(dir, 'deploy.lock');
	try {
		mkdirSync(lock);
		writeFileSync(join(lock, 'pid'), String(lockPid));
		const run = spawnSync(
			'bash',
			['-c', 'source scripts/deploy-lock.sh; take_deploy_lock "$1" && echo TOOK', '_', lock],
			{ env: { ...process.env, DEPLOY_LOCK_TRIES: '2', DEPLOY_LOCK_WAIT: '0' }, encoding: 'utf8' },
		);
		return { ...run, lockLeft: existsSync(lock) };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

describe('deploy.sh lock', () => {
	it('waits for CI before taking the lock, so a deploy never holds it through the CI wait', () => {
		const script = readFileSync('deploy.sh', 'utf8');
		expect(script.indexOf('scripts/wait-for-ci.sh')).toBeGreaterThan(0);
		expect(script.indexOf('scripts/wait-for-ci.sh')).toBeLessThan(
			script.indexOf('take_deploy_lock "$LOCK_DIR"'),
		);
	});

	it('waits while another deploy holds the lock, and gives up after its tries', () => {
		const run = takeLock(process.pid);
		expect(run.status).not.toBe(0);
		expect(run.stdout).toContain('Another deploy is running');
		expect(run.stderr).toContain('still waiting for another deploy');
		expect(run.lockLeft).toBe(true);
	});

	it('takes over a lock whose deploy is gone, and releases it on exit', () => {
		const run = takeLock(2 ** 22 + 12345); // above macOS and Linux pid limits
		expect(run.stdout).toContain('Taking over a stale deploy lock');
		expect(run.stdout).toContain('TOOK');
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
