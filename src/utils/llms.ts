// The lists in llms.txt and llms-full.txt, built from the site's own sources at build
// time so they never need hand edits: pages from src/pages, posts and issues from the
// content collections, popular posts from Plausible's snapshot, featured work from
// projects.ts, jobs from resume.ts and accounts from /contact/'s list. GitHub counts
// come from the now-feed snapshot.
import { getCollection } from 'astro:content';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DESCRIPTION, SITE_URL } from '../consts';
import { SECTIONS } from '../data/contact-links';
import popularPosts from '../data/popular-posts.json';
import { SELECTED_WORKS, projects } from '../data/projects';
import { roles } from '../data/resume';
import { PERSONAL, getCategoryCounts, getWrittenForCounts } from './categories';

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

const link = (title: string, path: string, note?: string) =>
	`- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ''}`;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Every indexed top-level page (src/pages/*.astro and section indexes like
 * src/pages/blog/index.astro), named and described by the title and description it
 * passes to BaseLayout. A new page shows up here on its next build.
 */
export function listSitePages(): string[] {
	const pagesDir = join(process.cwd(), 'src/pages');
	const sources = [
		...readdirSync(pagesDir)
			.filter((f) => f.endsWith('.astro'))
			.map((f) => ({ file: f, path: f === 'index.astro' ? '/' : `/${f.slice(0, -6)}/` })),
		...readdirSync(pagesDir, { withFileTypes: true })
			.filter((d) => d.isDirectory() && existsSync(join(pagesDir, d.name, 'index.astro')))
			.map((d) => ({ file: join(d.name, 'index.astro'), path: `/${d.name}/` })),
	];
	return sources
		.map(({ file, path }) => ({ path, source: readFileSync(join(pagesDir, file), 'utf8') }))
		.filter(({ source }) => !source.includes('noindex'))
		.map(({ path, source }) => {
			if (path === '/') return { path, name: 'Home', description: SITE_DESCRIPTION };
			const name = source.match(/title="([^"]+?) \| Joe Karlsson"/)?.[1];
			const description = source.match(/description="([^"]+)"/)?.[1];
			if (!name || !description) {
				throw new Error(`${path} has no "<Name> | Joe Karlsson" title or description for llms.txt`);
			}
			return { path, name, description };
		})
		.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : a.path.localeCompare(b.path)))
		.map(({ name, path, description }) => link(name, path, description));
}

export async function getBlogPosts() {
	return (await getCollection('blog')).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
}

type BlogPost = Awaited<ReturnType<typeof getBlogPosts>>[number];

/** The talk write-ups at /talks/<slug>/, each with its video, newest first */
export async function listTalkPages(): Promise<string[]> {
	return (await getCollection('talks'))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
		.map((talk) =>
			link(
				talk.data.title,
				`/talks/${talk.data.slug}/`,
				`${talk.data.description} (${isoDate(talk.data.date)})`,
			),
		);
}

export function postLine(post: BlogPost): string {
	const by = post.data.writtenFor ? `, written for ${post.data.writtenFor}` : '';
	return link(
		post.data.title,
		`/blog/${post.data.slug}/`,
		`${post.data.description} (${isoDate(post.data.date)}${by})`,
	);
}

/** Blog categories and the employer pages, each with its post count. */
export function listBlogSections(posts: BlogPost[]): string[] {
	return [
		...getCategoryCounts(posts).map(({ name, slug, count }) =>
			link(name, `/blog/category/${slug}/`, `${count} posts`),
		),
		...getWrittenForCounts(posts).map(({ name, slug, count }) =>
			link(
				name === PERSONAL ? 'My own posts' : `Written for ${name}`,
				`/blog/written-for/${slug}/`,
				`${count} posts`,
			),
		),
	];
}

/** The most-visited posts over the last year, from Plausible's snapshot. */
export function listPopularPosts(posts: BlogPost[], limit: number): string[] {
	const bySlug = new Map(posts.map((p) => [`/blog/${p.data.slug}/`, p]));
	return Object.entries(popularPosts.visitorsByPath)
		.sort(([, a], [, b]) => b - a)
		.map(([path]) => bySlug.get(path))
		.filter((post): post is BlogPost => Boolean(post))
		.slice(0, limit)
		.map(postLine);
}

/**
 * Works on My Machine issues, newest first. The imported TL;DR in Tech back issues
 * (substackUrl) are noindex, so they're counted, not listed.
 */
export async function getNewsletter() {
	const issues = (await getCollection('newsletter')).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
	const current = issues.filter((i) => !i.data.substackUrl);
	return {
		lines: current.map((i) =>
			link(
				i.data.title,
				`/newsletter/${i.data.slug}/`,
				`${i.data.description} (${isoDate(i.data.date)})`,
			),
		),
		count: current.length,
		backIssueCount: issues.length - current.length,
	};
}

const projectUrl = (project: (typeof projects)[number]) =>
	project.page
		? absoluteUrl(`/work/${project.page.slug}/`)
		: (project.demoUrl ?? project.sourceUrl ?? absoluteUrl('/work/'));

/** The selected works /work/ leads with, linked to their pages. */
export function listFeaturedWork(): string[] {
	return SELECTED_WORKS.map((title) => {
		const project = projects.find((p) => p.title === title);
		if (!project) throw new Error(`SELECTED_WORKS names "${title}", which isn't in projects.ts`);
		return `- [${project.title}](${projectUrl(project)}): ${project.description}`;
	});
}

/** Every project on /work/, newest first, linked to its page or its own site. */
export function listAllWork(): string[] {
	return [...projects]
		.sort((a, b) => b.date.localeCompare(a.date))
		.map((project) => {
			return `- [${project.title}](${projectUrl(project)}): ${project.description} (${project.date.slice(0, 4)})`;
		});
}

/** Every job, newest first, from the resume. */
export function listExperience(): string[] {
	return roles.map(
		(role) =>
			`- **${role.company}** (${role.startYear}-${role.endYear ?? 'present'}): ${role.title} - ${role.summary}`,
	);
}

/** The accounts /contact/ lists, under its own headings. */
export function listSocialSections(): string {
	return SECTIONS.map(
		({ heading, links }) =>
			`### ${heading}\n\n${links.map(({ label, meta, href }) => `- [${label}](${href}): ${meta}`).join('\n')}`,
	).join('\n\n');
}
