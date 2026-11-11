// The short videos /talks/ shows: a few explainers and builds from my YouTube Shorts and
// TikTok, picked by hand. Every one of them, with its TikTok twin, is backed up on the NAS
// in My Videos/Shorts and TikToks. `posterAt` is the second of the NAS copy its
// pink poster is taken from; npm run talks:covers draws it (posterPath below).
export interface Short {
	// YouTube Short ID
	id: string;
	title: string;
	date: string;
	posterAt: number;
}

export const shorts: Short[] = [
	{ id: 'RoeJPTY7maI', title: 'GitHub explained in 60 seconds', date: '2022-11-14', posterAt: 1 },
	{
		id: 'PiQKYgw_gZk',
		title: 'The difference between a framework and a library',
		date: '2022-12-20',
		posterAt: 1,
	},
	{
		id: 'uQTWcr5Bvk4',
		title: "If you're renting a router from Comcast, you're getting scammed",
		date: '2022-08-21',
		posterAt: 1,
	},
	{
		id: 'jdk6SRHL5_k',
		title: 'A smart home dashboard from an old tablet',
		date: '2022-11-30',
		posterAt: 1,
	},
	{
		id: 'lvIoHRCNkNM',
		title: 'I turned my Kindle into a Linux PC',
		date: '2026-11-03',
		posterAt: 3,
	},
	{
		id: 'jPQSayxSpNM',
		title: 'A used postcard rack turned 3D printed plant rack',
		date: '2026-11-07',
		posterAt: 1,
	},
];

export const shortPosterPath = (short: Short) =>
	`/images/talks/posters/${short.id}-t${short.posterAt}.webp`;

// TikTok and YouTube Shorts together, from the NAS backup's metadata (2026-11-10)
export const SHORTS_TOTAL_VIEWS = '9.3M';
export const TIKTOK_URL = 'https://www.tiktok.com/@joekarlsson';
export const YOUTUBE_SHORTS_URL = 'https://www.youtube.com/channel/UCWUGSN8Bb_c2QwPUfYmHwNA/shorts';
