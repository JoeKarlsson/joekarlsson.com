// Streamroll's project page How it's made figure (src/data/projects.ts): two chained
// Runway calls and a check in between, from app/page.tsx, lib/runway.ts,
// hooks/useApiKey.ts and app/AudioMixer.tsx in JoeKarlsson/streamroll
export const alt =
	'How Streamroll makes an intro. You give it a name, a style and your own Runway API key, which stays in your browser and goes along with each request. The style picks the image model, the video model and the length. Runway turns a prompt into a title card, you approve it or add notes and make another, and Runway animates the card into a clip of 2 to 5 seconds. If you want, your own audio is mixed in right in your browser with FFmpeg.wasm. Out comes an .mp4 to use as a pre-roll in Plex, Jellyfin or Emby.';

const YOU = {
	label: 'You',
	sub: ['a name, a style and', 'your own Runway key'],
	icon: 'user',
	kind: 'outline',
};
const STYLE = {
	label: 'The style picks',
	sub: ['the image model, the', 'video model, the length'],
	icon: 'settings',
	kind: 'pink',
};
const CARD = { wordmark: 'runway', sub: ['text to image:', 'the title card'], kind: 'chalk' };
const APPROVE = {
	label: 'You approve it',
	sub: ['or add notes', 'and make another'],
	icon: 'check',
	kind: 'outline',
};
const CLIP = {
	wordmark: 'runway',
	sub: ['image to video:', 'a 2 to 5 second clip'],
	kind: 'chalk',
};
const AUDIO = {
	label: 'Your own audio',
	sub: ['mixed in your browser', 'with FFmpeg.wasm'],
	logo: 'ffmpeg',
	kind: 'dashed',
};
const MP4 = { label: '.mp4', sub: 'ready to download', icon: 'film', kind: 'pink' };
const SERVERS = [
	{ label: 'Plex', logo: 'plex', sub: 'pre-roll', stack: true },
	{ label: 'Jellyfin', logo: 'jellyfin', sub: 'pre-roll', stack: true },
	{ label: 'Emby', logo: 'emby', sub: 'pre-roll', stack: true },
];

export const desktop = {
	height: 640,
	draw(f) {
		const L = 20;
		const R = 360;
		const W = 260;
		const H = 86;
		const lc = L + W / 2;
		const rc = R + W / 2;
		f.box({ x: L, y: 16, w: W, h: H, size: 17, subSize: 14, ...YOU });
		f.arrow([
			[L + W + 2, 59],
			[R - 2, 59],
		]);
		f.box({ x: R, y: 16, w: W, h: H, size: 17, subSize: 14, ...STYLE });
		f.arrow([
			[rc, 104],
			[rc, 122],
			[lc, 122],
			[lc, 140],
		]);
		f.box({ x: L, y: 142, w: W, h: H, size: 17, subSize: 14, ...CARD });
		f.arrow([
			[L + W + 2, 185],
			[R - 2, 185],
		]);
		f.box({ x: R, y: 142, w: W, h: H, size: 17, subSize: 14, ...APPROVE });
		f.arrow([
			[rc, 230],
			[rc, 248],
			[lc, 248],
			[lc, 266],
		]);
		f.box({ x: L, y: 268, w: W, h: H, size: 17, subSize: 14, ...CLIP });
		f.box({ x: R, y: 268, w: W, h: H, size: 17, subSize: 14, ...AUDIO });
		f.arrow([
			[lc, 356],
			[lc, 392],
		]);
		f.arrow(
			[
				[rc, 356],
				[rc, 432],
				[L + W + 2, 432],
			],
			{ dashed: true },
		);
		f.box({ x: L, y: 394, w: W, h: 76, size: 17, subSize: 14, ...MP4 });
		const centers = [110, 320, 530];
		for (const cx of centers) {
			f.arrow([
				[lc, 472],
				[lc, 498],
				[cx, 498],
				[cx, 524],
			]);
		}
		SERVERS.forEach((s, i) =>
			f.box({
				x: centers[i] - 90,
				y: 526,
				w: 180,
				h: 96,
				kind: 'chalk',
				size: 16,
				subSize: 14,
				...s,
			}),
		);
	},
};

export const phone = {
	height: 900,
	draw(f) {
		const X = 30;
		const W = 300;
		const H = 80;
		const STEP = 104;
		const rows = [YOU, STYLE, CARD, APPROVE, CLIP, AUDIO, MP4];
		rows.forEach((row, i) => {
			const y = 16 + i * STEP;
			f.box({ x: X, y, w: W, h: H, size: 16, subSize: 13, ...row });
			if (i < rows.length - 1) {
				f.arrow([
					[X + W / 2, y + H + 2],
					[X + W / 2, y + STEP - 2],
				]);
			}
		});
		const top = 16 + rows.length * STEP;
		const centers = [70, 180, 290];
		for (const cx of centers) {
			f.arrow([
				[180, top - STEP + H + 2],
				[180, top - 4],
				[cx, top - 4],
				[cx, top + 18],
			]);
		}
		SERVERS.forEach((s, i) =>
			f.box({
				x: centers[i] - 52,
				y: top + 20,
				w: 104,
				h: 96,
				kind: 'chalk',
				size: 14,
				subSize: 13,
				...s,
				stack: true,
			}),
		);
	},
};
