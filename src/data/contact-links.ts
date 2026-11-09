// The accounts /contact/ lists, also read by llms.txt so both stay in step
import { SOCIAL_LINKS } from '../consts';

export const BEST = [
	{ label: 'LinkedIn', meta: 'Professional inquiries & speaking', href: SOCIAL_LINKS.linkedin },
	{ label: 'Bluesky', meta: '@joekarlsson.com', href: SOCIAL_LINKS.bluesky },
];

// All personal accounts, ranked: where I post first, then the side places
// (Letterboxd gets a lot of use, but it's not why people come here), with the
// ones I've mostly left at the very bottom
export const SECTIONS = [
	{
		heading: 'Where I post',
		links: [
			{ label: 'Threads', meta: '@joekarlsson', href: SOCIAL_LINKS.threads },
			{ label: 'Bluesky', meta: '@joekarlsson.com', href: SOCIAL_LINKS.bluesky },
			{ label: 'YouTube', meta: 'Talks & tutorials', href: SOCIAL_LINKS.youtube },
			{ label: 'Instagram', meta: 'Photos & stories', href: SOCIAL_LINKS.instagram },
			{ label: 'GitHub', meta: 'Open source & projects', href: SOCIAL_LINKS.github },
			{ label: 'Twitter/X', meta: '@JoeKarlsson1', href: SOCIAL_LINKS.twitter },
		],
	},
	{
		heading: 'Everywhere else',
		links: [
			{ label: 'Letterboxd', meta: 'Movie reviews & lists', href: SOCIAL_LINKS.letterboxd },
			{ label: 'TikTok', meta: '@joekarlsson', href: SOCIAL_LINKS.tiktok },
			{ label: 'Reddit', meta: 'Lurking & commenting', href: SOCIAL_LINKS.reddit },
			{ label: 'Last.fm', meta: "What I'm listening to", href: SOCIAL_LINKS.lastfm },
			{ label: 'Twitch', meta: 'Old live-coding streams', href: SOCIAL_LINKS.twitch },
		],
	},
];
