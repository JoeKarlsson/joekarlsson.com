import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
