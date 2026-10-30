import { getCollection } from 'astro:content';

export interface FeedPost {
	id: string;
	body?: string;
	href: string;
	isNewsletter: boolean;
	data: {
		title: string;
		date: Date;
		slug: string;
		description: string;
		categories: string[];
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
		href: `/blog/${p.data.slug}/`,
		isNewsletter: false,
		data: p.data,
	}));
	const newsletter = (await getCollection('newsletter'))
		.filter((p) => !p.data.substackUrl && !p.data.recapOf)
		.map((p) => ({
			id: p.id,
			body: p.body,
			href: `/newsletter/${p.data.slug}/`,
			isNewsletter: true,
			data: { ...p.data, categories: ['Newsletter'] },
		}));
	return [...blog, ...newsletter].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
