import { getCollection } from 'astro:content';

// Joe's own posts, not ones written for an employer (`writtenFor`). Anywhere the site
// suggests what to read next it suggests these; employer posts still appear in the
// full archive, their category pages and their /blog/written-for/ page.
export function isOwnPost(post: { data: { writtenFor?: string } }): boolean {
	return !post.data.writtenFor;
}

export interface FeedPost {
	id: string;
	body?: string;
	// Rendered post HTML (with the site's remark/rehype plugins applied), for the RSS feed
	html?: string;
	href: string;
	isNewsletter: boolean;
	data: {
		title: string;
		date: Date;
		slug: string;
		description: string;
		categories: string[];
		// The employer a blog post was written for; newsletter posts never have one
		writtenFor?: string;
		heroImage?: string;
		heroAlt?: string;
	};
}

// Blog posts plus Works on My Machine newsletter posts, newest first. Joe treats new
// newsletter issues as posts, so they show up in the blog list, on the homepage and in
// the main RSS feed. The imported TL;DR in Tech link roundups (the ones with a
// substackUrl) and recaps of a blog post (recapOf) stay on /newsletter/ only.
export async function getFeedPosts(): Promise<FeedPost[]> {
	const blog = (await getCollection('blog')).map((p) => ({
		id: p.id,
		body: p.body,
		html: p.rendered?.html,
		href: `/blog/${p.data.slug}/`,
		isNewsletter: false,
		data: p.data,
	}));
	const newsletter = (await getCollection('newsletter'))
		.filter((p) => !p.data.substackUrl && !p.data.recapOf)
		.map((p) => ({
			id: p.id,
			body: p.body,
			html: p.rendered?.html,
			href: `/newsletter/${p.data.slug}/`,
			isNewsletter: true,
			data: { ...p.data, categories: ['Newsletter'] },
		}));
	return [...blog, ...newsletter].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** One feed post by slug, for a pinned spot (the pink band on the homepage and /uses) */
export async function getPinnedPost(slug: string): Promise<FeedPost> {
	const post = (await getFeedPosts()).find((p) => p.data.slug === slug);
	if (!post) throw new Error(`Pinned post "${slug}" isn't in the blog or newsletter`);
	return post;
}
