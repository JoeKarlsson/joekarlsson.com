// React Spotify Player's project page How it's made figure (src/data/projects.ts):
// log in, get a token, ask /me/player every 5 seconds. From src/App.jsx and
// src/config/spotify.js in JoeKarlsson/react-spotify-player
export const alt =
	"How React Spotify Player keeps up with what you're playing. The Login with Spotify link sends you to Spotify Accounts, where you approve three scopes. Spotify sends you back with an access token in the URL, and the player saves it in your browser. Every 5 seconds the player asks the Spotify Web API's /v1/me/player endpoint what's playing and gets back the track, the artist, the album art and how far into the song you are. When the token expires, the API answers 401 and you log in again.";

const LOGIN = {
	label: 'Login with Spotify',
	sub: 'a link in the app',
	logo: 'react',
	kind: 'pink',
};
const ACCOUNTS = {
	label: 'Spotify Accounts',
	sub: 'you approve 3 scopes',
	logo: 'spotify',
	kind: 'chalk',
};
const PLAYER = {
	label: 'The player',
	sub: ['keeps the token', 'in your browser'],
	logo: 'react',
	kind: 'pink',
};
const WEB_API = {
	label: 'Spotify Web API',
	sub: 'GET /v1/me/player',
	logo: 'spotify',
	kind: 'chalk',
};

export const desktop = {
	height: 430,
	draw(f) {
		f.box({ x: 20, y: 30, w: 260, h: 72, size: 17, subSize: 14, ...LOGIN });
		f.box({ x: 360, y: 30, w: 260, h: 72, size: 17, subSize: 14, ...ACCOUNTS });
		f.arrow([
			[282, 66],
			[358, 66],
		]);
		f.box({ x: 20, y: 180, w: 260, h: 80, size: 17, subSize: 14, ...PLAYER });
		f.arrow([
			[490, 104],
			[490, 220],
			[284, 220],
		]);
		f.note(300, 208, 'token in the URL');
		f.box({ x: 360, y: 310, w: 260, h: 80, size: 17, subSize: 14, ...WEB_API });
		f.arrow(
			[
				[150, 262],
				[150, 350],
				[358, 350],
			],
			{ heads: 'both' },
		);
		f.note(162, 300, 'every 5 s');
		f.note(166, 372, 'back: track, artist,');
		f.note(166, 390, 'art, progress');
		f.arrow(
			[
				[50, 178],
				[50, 104],
			],
			{ dashed: true },
		);
		f.note(60, 146, '401: log in again');
	},
};

export const phone = {
	height: 610,
	draw(f) {
		const x = 40;
		const w = 304;
		f.box({ x, y: 16, w, h: 72, size: 17, subSize: 14, ...LOGIN });
		f.arrow([
			[192, 90],
			[192, 140],
		]);
		f.box({ x, y: 142, w, h: 72, size: 17, subSize: 14, ...ACCOUNTS });
		f.arrow([
			[192, 216],
			[192, 290],
		]);
		f.note(202, 250, 'back with a token');
		f.box({ x, y: 292, w, h: 80, size: 17, subSize: 14, ...PLAYER });
		f.arrow(
			[
				[192, 374],
				[192, 470],
			],
			{ heads: 'both' },
		);
		f.note(202, 412, 'every 5 s');
		f.note(202, 432, 'track, artist, art,');
		f.note(202, 450, 'progress');
		f.box({ x, y: 472, w, h: 80, size: 17, subSize: 14, ...WEB_API });
		f.arrow(
			[
				[38, 332],
				[16, 332],
				[16, 52],
				[38, 52],
			],
			{ dashed: true },
		);
		f.note(40, 586, 'Dashed: on a 401, log in again', { anchor: 'start' });
	},
};
