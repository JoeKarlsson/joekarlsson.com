export const alt =
	'The implicit grant flow for this player. The Login with Spotify link in the React app sends you to Spotify Accounts at /authorize with the client_id, scopes and response_type=token. You log in and approve the scopes. Spotify Accounts redirects you back to localhost:3000 with the access token in the URL hash. The app reads the token from window.location.hash; it is short-lived and has no refresh token. Then the app calls the Spotify Web API at /v1/me/player with the token as a Bearer header and gets back JSON about what is playing.';

/** The app's steps: pink, in the app's own container. */
const appBox = (f, x, y, w, label, sub, icon, stack = false) =>
	f.box({
		x,
		y,
		w,
		h: stack ? (Array.isArray(sub) ? 108 : 88) : Array.isArray(sub) ? 88 : 70,
		kind: 'pink',
		label,
		sub,
		size: 15,
		subSize: 14,
		icon,
		stack,
	});

const spotifyBox = (f, x, y, w, label, sub, stack = false) =>
	f.box({
		x,
		y,
		w,
		h: stack ? 88 : 66,
		kind: 'chalk',
		label,
		sub,
		size: 15,
		subSize: 14,
		logo: 'spotify',
		stack,
	});

const you = (f, x, y, w, stack = false) =>
	f.box({
		x,
		y,
		w,
		h: stack ? 88 : 66,
		kind: 'outline',
		label: 'You',
		sub: 'log in, approve scopes',
		size: 15,
		subSize: 14,
		icon: 'user',
		stack,
	});

const TOKEN_SUB = ['window.location.hash', 'short-lived, no refresh'];

export const desktop = {
	height: 600,
	draw(f) {
		const L = 30; // app column
		const LW = 200;
		const R = 410; // Spotify and you
		const RW = 214;
		const lc = L + LW / 2;
		const rc = R + RW / 2;
		const mid = (L + LW + R) / 2;
		f.group({ x: 16, y: 40, w: 228, h: 540, label: 'Your React app' });

		// 1. The login link sends you to /authorize
		appBox(f, L, 60, LW, 'Login with Spotify', 'link in App.js', 'log-in', true);
		spotifyBox(f, R, 60, RW, 'Spotify Accounts', '/authorize', true);
		f.arrow([
			[L + LW + 4, 104],
			[R - 4, 104],
		]);
		f.note(mid, 90, 'client_id, scopes,', { anchor: 'middle', size: 14 });
		f.note(mid, 124, 'response_type=token', { anchor: 'middle', size: 13, font: 'mono' });

		// 2. You approve the scopes
		f.arrow(
			[
				[rc, 150],
				[rc, 184],
			],
			{ heads: 'both' },
		);
		you(f, R, 188, RW, true);

		// 3. Redirect back with the token in the hash
		f.arrow([
			[rc, 278],
			[rc, 312],
		]);
		f.note(rc + 12, 297, 'approved', { size: 14 });
		spotifyBox(f, R, 316, RW, 'Spotify Accounts', 'back to localhost:3000', true);
		f.arrow([
			[R - 4, 360],
			[L + LW + 4, 360],
		]);
		f.note(mid, 346, '#access_token=...', { anchor: 'middle', size: 13, font: 'mono' });
		f.note(mid, 380, 'in the URL hash', { anchor: 'middle', size: 14 });
		appBox(f, L, 306, LW, 'Read the token', TOKEN_SUB, 'key-round', true);

		// 4. Call the Web API with it
		f.arrow([
			[lc, 416],
			[lc, 452],
		]);
		appBox(f, L, 456, LW, "What's playing?", 'getCurrentlyPlaying()', 'speaker', true);
		spotifyBox(f, R, 456, RW, 'Spotify Web API', '/v1/me/player', true);
		f.arrow(
			[
				[L + LW + 4, 500],
				[R - 4, 500],
			],
			{ heads: 'both' },
		);
		f.note(mid, 486, 'Bearer token', { anchor: 'middle', size: 14 });
		f.note(mid, 520, 'back: JSON', { anchor: 'middle', size: 14 });
	},
};

export const phone = {
	height: 942,
	draw(f) {
		const x = 30;
		const w = 300;
		const down = (y1, y2) =>
			f.arrow([
				[180, y1],
				[180, y2],
			]);
		f.group({ x: 16, y: 40, w: 328, h: 98, label: 'Your React app' });
		appBox(f, x, 62, w, 'Login with Spotify', 'link in App.js', 'log-in');
		down(134, 196);
		f.note(192, 158, 'client_id, scopes,', { size: 14 });
		f.note(192, 178, 'response_type=token', { size: 14, font: 'mono' });
		spotifyBox(f, x, 198, w, 'Spotify Accounts', '/authorize');
		f.arrow(
			[
				[180, 266],
				[180, 302],
			],
			{ heads: 'both' },
		);
		you(f, x, 304, w);
		down(372, 410);
		f.note(192, 393, 'approved', { size: 14 });
		spotifyBox(f, x, 412, w, 'Spotify Accounts', 'back to localhost:3000');
		down(480, 586);
		f.note(192, 504, '#access_token=...', { size: 14, font: 'mono' });
		f.note(192, 524, 'in the URL hash', { size: 14 });
		f.group({ x: 16, y: 570, w: 328, h: 222, label: 'Your React app' });
		appBox(f, x, 590, w, 'Read the token', TOKEN_SUB, 'key-round');
		down(680, 704);
		appBox(f, x, 706, w, "What's playing?", 'getCurrentlyPlaying()', 'speaker');
		f.arrow(
			[
				[180, 778],
				[180, 834],
			],
			{ heads: 'both' },
		);
		f.note(192, 800, 'Bearer token', { size: 14 });
		f.note(192, 820, 'back: JSON', { size: 14 });
		spotifyBox(f, x, 836, w, 'Spotify Web API', '/v1/me/player');
	},
};
