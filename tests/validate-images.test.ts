import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

// validate-images.sh filters by size with find before its per-file loops, so the
// byte boundaries here pin that the filters match the limits the loops enforce
const script = resolve('scripts/validate-images.sh');
const root = mkdtempSync(join(tmpdir(), 'validate-images-'));

function file(path: string, bytes: number, head = '') {
	const full = join(root, path);
	mkdirSync(join(full, '..'), { recursive: true });
	const body = Buffer.alloc(bytes);
	body.write(head);
	writeFileSync(full, body);
}

const KB = 1024;
file('public/images/still-ok.webp', 500 * KB + 1023); // 500KB after rounding down: at the limit
file('public/images/still-over.webp', 501 * KB);
file('public/images/anim-under.webp', 256 * KB - 1, 'RIFF....WEBPVP8X....ANIM');
file('public/images/anim-at.webp', 256 * KB, 'RIFF....WEBPVP8X....ANIM');
file('public/images/home/loop-over.mp4', 3073 * KB);
file('public/images/home/loop-ok.mp4', 3072 * KB + 1023);
file('public/images/hero-empty.webp', 0);
mkdirSync(join(root, 'src/content/talks'), { recursive: true });
mkdirSync(join(root, 'src/content/blog'), { recursive: true });
writeFileSync(join(root, 'src/content/blog/a.md'), '---\nheroImage: "/images/missing.webp"\n---\n');
writeFileSync(
	join(root, 'src/content/blog/b.md'),
	"---\nheroImage:   '/images/hero-empty.webp'\n---\n",
);

const run = spawnSync('bash', [script], { cwd: root, encoding: 'utf8' });
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('validate-images.sh', () => {
	it('fails', () => {
		expect(run.status).toBe(1);
	});

	it('fails a still over the hard limit and only that one', () => {
		expect(run.stdout).toContain('still-over.webp (501KB)');
		expect(run.stdout).toContain('ERROR: 1 image(s) exceed');
	});

	it('fails an animation at 256KB with no mp4, not one a byte under', () => {
		expect(run.stdout).toContain('ERROR: 1 animation(s)');
		expect(run.stdout).toContain('anim-at.webp (256KB)');
	});

	it('fails a home loop over its budget, not one at it', () => {
		expect(run.stdout).toContain('loop-over.mp4 is 3073KB');
		expect(run.stdout).not.toContain('loop-ok.mp4 is');
	});

	it('reads quoted heroImage paths with any spacing', () => {
		expect(run.stdout).toContain('Missing heroImage in src/content/blog/a.md');
		expect(run.stdout).toContain('Empty heroImage file in src/content/blog/b.md');
	});
});
