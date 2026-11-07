import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import plan from '../scripts/work-thumbnail-plan.json';

const LOOKS = ['full', 'taped'];
interface PlanEntry {
	look: string;
	alt?: string;
	picture: { photo?: string; credit?: string; image?: string; video?: string };
}
const entries = Object.entries(plan) as [string, PlanEntry][];

describe('work-post thumbnails (scripts/work-thumbnail-plan.json)', () => {
	it('every planned post exists and points its heroImage at its drawn thumbnail', () => {
		const problems = entries.flatMap(([slug]) => {
			const post = join('src/content/blog', `${slug}.md`);
			if (!existsSync(post)) return [`${slug}: no post`];
			const hero = readFileSync(post, 'utf8').match(/^heroImage:\s*['"]?([^'"\n]+)/m)?.[1] ?? '';
			if (!new RegExp(`^/images/blog/${slug}/thumb-[0-9a-f]{8}\\.webp$`).test(hero))
				return [`${slug}: heroImage is ${hero}, not its drawn thumbnail`];
			return existsSync(join('public', hero))
				? []
				: [`${slug}: run npm run thumbnails:work -- ${slug}`];
		});
		expect(problems).toEqual([]);
	});

	it('every entry has a known look, alt text, and a credited public-domain photo or a picture from the post', () => {
		const problems = entries.flatMap(([slug, e]) => {
			const out: string[] = [];
			if (!LOOKS.includes(e.look)) out.push(`${slug}: look ${e.look}`);
			if (!e.alt) out.push(`${slug}: no alt`);
			const { photo, credit, image, video } = e.picture;
			if (photo && !credit?.startsWith('https://commons.wikimedia.org/'))
				out.push(`${slug}: photo with no Commons credit`);
			const local = image ?? video;
			if (local && !existsSync(join('public', local))) out.push(`${slug}: ${local} is missing`);
			if (!photo && !local) out.push(`${slug}: no picture`);
			return out;
		});
		expect(problems).toEqual([]);
	});
});
