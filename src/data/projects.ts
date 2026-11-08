// A gallery item: a hover-to-play clip when `video` is set, otherwise just the
// `poster` as a still image.
export interface ProjectClip {
	video?: string;
	poster: string;
	alt: string;
	caption?: string;
}

// Giving a project a `page` builds /work/{slug}/ and points its card there.
// Text fields render `backticks` as inline code; everything else is plain text.
export interface ProjectPage {
	slug: string;
	tagline: string;
	intro: string[];
	// A heading over the intro, for art pieces whose intro is an artist statement
	introHeading?: string;
	// Follows the year in the page's byline: a collaborator ("with Laurel Karlsson")
	credit?: string;
	// The technical half of an art piece, after the piece itself: a line or two, an
	// optional diagram and numbered steps. A page with it lists the stack here, not up top
	made?: {
		text: string[];
		diagram?: { src: string; alt: string };
		steps?: { title: string; text: string }[];
	};
	// Projects this one grew out of or led to, as cards at the end of its page
	lineage?: { label: string; title: string }[];
	// A web-playable build, embedded under the intro at 1280x720 and scaled to fit
	// (src/scripts/scale-to-fit-embed.ts). Its origin must be in the CSP frame-src
	// (Caddyfile and the OpenTofu provision template)
	embedUrl?: string;
	// For a build that lays itself out at any width, the iframe's CSS height instead of
	// the 1280x720 scaling; `cqw` is a percent of the column's width
	embedHeight?: string;
	// Defaults to "Play it" and "Click the game to play."
	embedHeading?: string;
	embedNote?: string;
	// Loads the embed on phones too, in place of the poster. Only for light builds that
	// read at phone size: a hidden heavy embed (Connect AI × DOOM) crashed an iPhone
	embedOnPhones?: boolean;
	// A narrated video with sound, under the intro. Portrait (9:16) phone video
	tour?: { video: string; poster: string; captions: string; alt: string };
	// Files to make it yourself (a 3D model on Thingiverse), as the page's main button
	download?: { url: string; label: string };
	steps?: { title: string; text: string }[];
	install?: string;
	example?: {
		lang: 'yaml' | 'json' | 'toml' | 'bash' | 'python' | 'markdown';
		code: string;
		intro?: string;
	};
	gallery?: ProjectClip[];
	galleryTitle?: string;
	galleryNote?: string;
	// 'square' shows clips whole in a denser grid instead of cropping to 16:9
	galleryAspect?: 'video' | 'square';
	// Full-width stills at their own aspect ratio, after the gallery
	screenshots?: ProjectClip[];
	screenshotsTitle?: string;
}

export interface Project {
	title: string;
	// Used by the share links on its /work/ page; at most 80 characters for Hacker News
	shareTitle?: string;
	description: string;
	image: string;
	imageAlt: string;
	// Plays over `image` (its poster) while the card is hovered or focused
	video?: string;
	// A lighter still for the video when `image` (also the share card) is too heavy
	// to wait on: the old featured hero's 96KB poster held its pink back 0.8s on a phone
	poster?: string;
	// YYYY-MM the project was built (first commit or launch post); /work/ sorts newest first
	date: string;
	tech: string[];
	sourceUrl?: string;
	demoUrl?: string;
	blogUrl?: string;
	stars?: number;
	page?: ProjectPage;
}

const BUMPER_DIR = '/images/blog/adult-swim-bumpers-plex-pre-rolls';

const bumperClip = (name: string, alt: string): ProjectClip => ({
	video: `${BUMPER_DIR}/${name}.mp4`,
	poster: `${BUMPER_DIR}/${name}-poster.webp`,
	alt,
});

const PIXELPANE_DIR = '/images/blog/pixelpane-pixel-art-home-assistant';

const PLANTER_DIR =
	'/images/blog/from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack';

const STREAMROLL_DIR = '/images/projects/streamroll';

const SD_DIR = '/images/blog/screencast-director-screen-recorder';

const DOOM_DIR = '/images/blog/why-i-use-doom-to-visualize-mcp-data';

// /work/ groups everything into eras, newest first, by each project's `date` year.
// The last era runs open into next year so it doesn't go stale on January 1
export const ERAS: {
	slug: string;
	years: string;
	from: number;
	to: number;
	label: string;
	note?: string;
}[] = [
	{
		slug: 'era-2026',
		years: '2026–2027',
		from: 2026,
		to: 2027,
		label: 'Data, objects and the homelab',
	},
	{
		slug: 'era-2021',
		years: '2021–2025',
		from: 2021,
		to: 2025,
		label: 'The video years',
		note: 'I spent most of these years making short videos on TikTok, so not much got built.',
	},
	{
		slug: 'era-2018',
		years: '2018–2020',
		from: 2018,
		to: 2020,
		label: 'Conference talks and the internet of toilets',
	},
	{
		slug: 'era-2015',
		years: '2015–2017',
		from: 2015,
		to: 2017,
		label: 'Humanities questions, answered in code',
	},
];

// The pieces /work/ shows big at the top, in this order; they're left out of their eras
export const SELECTED_WORKS = ['PixelPane', 'linger', 'Connect AI × DOOM', 'Punc', 'Bechdel.io'];

export const projects: Project[] = [
	{
		title: 'IoT Kitty Litter Box',
		description:
			'Welcome to the Internet of Toilets. An IoT-connected cat litter box built with a Raspberry Pi, weight sensors, and Node.js. Monitors usage patterns and sends notifications. Became one of my most popular conference talks - presented at 20+ events worldwide.',
		image: '/images/blog/an-introduction-to-iot-internet-of-toilets/og-iot-toilet.webp',
		imageAlt: 'IoT Kitty Litter Box',
		date: '2019-09',
		tech: ['Raspberry Pi', 'Node.js', 'MongoDB', 'HX711'],
		sourceUrl: 'https://github.com/JoeKarlsson/iot-kitty-litter-box',
		demoUrl: 'https://kittylitter.joekarlsson.com/',
		blogUrl: '/blog/an-introduction-to-iot-internet-of-toilets/',
		stars: 25,
	},
	{
		title: 'PixelPane',
		shareTitle: 'PixelPane: A 32x32 LED pixel art frame driven by a Raspberry Pi',
		description:
			"A 32x32 LED pixel art frame behind a two-way mirror, driven by a Raspberry Pi. It plays seasonal pixel art, and Home Assistant pushes to it: ON AIR when my camera turns on, the doorbell, the weather. It's open source, and every scene is a plugin.",
		image: `${PIXELPANE_DIR}/pixelpane-montage-poster.webp`,
		video: `${PIXELPANE_DIR}/pixelpane-montage.mp4`,
		imageAlt:
			'PixelPane on my desk: the LED frame showing my homelab status, Proxmox stats and my next meeting, the control page switching scenes, the two-way mirror over the grid, and a drawing from the GIF generator appearing on the panel',
		date: '2026-10',
		tech: ['Python', 'Raspberry Pi', 'LED matrix', 'Home Assistant', '3D Printing'],
		sourceUrl: 'https://github.com/JoeKarlsson/pixelpane',
		blogUrl: '/blog/pixelpane-pixel-art-home-assistant/',
		page: {
			slug: 'pixelpane',
			tagline: 'A 32x32 LED pixel art frame on my shelf, driven by a Raspberry Pi.',
			intro: [
				"PixelPane plays pixel art GIFs mixed with live, animated scenes: the clock, the weather, what's playing, my next meeting, and decorations that change with the seasons. From the front it's a dark mirror until the LEDs light up behind it.",
				"It's open source and plugin-based, like MagicMirror. Home Assistant, or anything that can send an HTTP request, pushes notifications and data to it, and it has its own control page, with a live preview of the panel, for everything else.",
			],
			tour: {
				video: `${PIXELPANE_DIR}/tour.mp4`,
				poster: `${PIXELPANE_DIR}/tour-poster.webp`,
				captions: `${PIXELPANE_DIR}/tour.vtt`,
				alt: 'A quick tour of PixelPane: me at my desk showing the web UI, the homelab stats, music and calendar scenes, the shadow box build, the GIF animator and live drawing',
			},
			steps: [
				{
					title: 'Behind a mirror',
					text: 'A 32x32 LED panel sits behind a 3D-printed grid and a two-way mirror in a shadow box, so every LED reads as a square pixel.',
				},
				{
					title: 'Scenes are plugins',
					text: 'A playlist mixes GIFs with animated scenes. Each scene comes from a plugin, and a plugin is one Python file.',
				},
				{
					title: 'Home Assistant pushes to it',
					text: "Home Assistant sends ON AIR, doorbell and laundry alerts, the weather and what's playing. It only receives, so it never needs a Home Assistant token.",
				},
			],
			galleryTitle: 'Clips',
			galleryNote: 'Recorded from the control page. Hover to play.',
			gallery: [
				{
					video: `${PIXELPANE_DIR}/pp-playnow.mp4`,
					poster: `${PIXELPANE_DIR}/pp-playnow-poster.webp`,
					alt: 'Pressing Play now on moon, fire, clock and Halloween, with the live preview switching to each scene',
					caption: 'Play now, with a live preview',
				},
				{
					video: `${PIXELPANE_DIR}/pp-interrupts.mp4`,
					poster: `${PIXELPANE_DIR}/pp-interrupts-poster.webp`,
					alt: 'Sending a Doorbell notification with a flashing bell, then turning ON AIR mode on and off',
					caption: 'Notifications and ON AIR',
				},
				{
					video: `${PIXELPANE_DIR}/pp-data.mp4`,
					poster: `${PIXELPANE_DIR}/pp-data-poster.webp`,
					alt: 'Play now on weather, now playing, calendar and homelab, each drawing pushed data',
					caption: 'Weather, music, meetings, homelab',
				},
				{
					video: `${PIXELPANE_DIR}/pp-gifs.mp4`,
					poster: `${PIXELPANE_DIR}/pp-gifs-poster.webp`,
					alt: 'Filtering the GIF library to space, switching to large thumbnails and searching for pumpkin',
					caption: 'The GIF library',
				},
			],
			screenshotsTitle: 'Inside',
			screenshots: [
				{
					poster: `${PIXELPANE_DIR}/build-layers.svg`,
					alt: 'Side view of the inside of the shadow box: from the front, a two-way mirror, an optional diffuser, the 3D-printed light grid, the LED panel facing forward, then the Raspberry Pi with the RGB Matrix HAT and a 5 V 4 A power supply going to the wall',
					caption: 'Inside the shadow box',
				},
			],
		},
	},
	{
		title: '3D-Printed Postcard Rack Planter',
		shareTitle: 'Postcard Rack Planter: A used postcard rack full of 3D-printed pots',
		description:
			'A used wire postcard rack, refit with 3D-printed pots I designed in Tinkercad. Each pot drains into the one below, so I water the top and the whole tower gets it. Printed in ABS, and still holding up after three-plus years.',
		image: '/images/projects/postcard-rack-planter-poster.webp',
		video: '/images/projects/postcard-rack-planter.mp4',
		imageAlt:
			'Me and my postcard rack planter: the rack by the window packed with spider plants, my hand on one of the black 3D-printed pots, the pots hanging in the gold wire frame, and me pointing up the tower',
		date: '2023-02',
		tech: ['Tinkercad', 'Prusa MK3', 'ABS', '3D Printing'],
		blogUrl:
			'/blog/from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack/',
		page: {
			slug: 'postcard-rack-planter',
			tagline: 'A used postcard rack, turned into a planter tower with 3D-printed pots.',
			download: {
				url: 'https://www.thingiverse.com/thing:5867063',
				label: 'Download it on Thingiverse',
			},
			intro: [
				"I bought a wire postcard rack secondhand with no plan for it. It sat around until I figured out the pockets were the right shape for plant pots, so I designed pots that hang where the postcards used to go and printed a rack's worth of them.",
				"Each pot has drainage holes over the pot below it, so I water the top and the water works its way down the tower. I've had it for three or four years now. It started with a few succulents and is mostly spider plants these days, and the ABS is holding up better than I expected.",
			],
			tour: {
				video: `${PLANTER_DIR}/tour.mp4`,
				poster: `${PLANTER_DIR}/tour-poster.webp`,
				captions: `${PLANTER_DIR}/tour.vtt`,
				alt: 'A quick tour of my postcard rack planter: me in front of it, the 3D-printed pots in the wire frame, how water drains from pot to pot, and the whole rack by the window',
			},
			steps: [
				{
					title: 'A secondhand rack',
					text: 'A wire postcard rack, bought used. The wire pockets that held postcards hold the pots.',
				},
				{
					title: 'Pots that fit the pockets',
					text: 'I drew a pot to fit the pockets in Tinkercad and printed it in black ABS on my Prusa MK3. The file is free on Thingiverse.',
				},
				{
					title: 'Water the top',
					text: 'Holes in the bottom of each pot drip into the pot below, so one watering at the top reaches the whole tower.',
				},
			],
			screenshotsTitle: 'When it was new',
			screenshots: [
				{
					poster: `${PLANTER_DIR}/IMG_2833-Medium.webp`,
					alt: 'The postcard rack planter in 2023, standing by a window: the gold wire rack with rows of black 3D-printed pots, each with a small succulent',
					caption: 'February 2023, freshly planted',
				},
				{
					poster: `${PLANTER_DIR}/IMG_2834-Medium.webp`,
					alt: 'Close-up of the black 3D-printed pots hanging in the gold wire pockets, planted with succulents',
					caption: 'The pots in the wire pockets',
				},
				{
					poster: `${PLANTER_DIR}/IMG_2853-Medium.webp`,
					alt: 'Looking up at the bottoms of the black pots in the wire frame, where the drainage holes sit over the pot below',
					caption: 'From below',
				},
			],
		},
	},

	{
		title: 'React Spotify Player',
		shareTitle: 'React Spotify Player: A now-playing Spotify widget from a 15-minute tutorial',
		description:
			'A real-time Spotify player built with React. My most starred open source project. Integrates with the Spotify Web API for custom playback. Accompanied a popular tutorial.',
		image:
			'/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/1_KGOTMV8KD120TApnijDauQ.webp',
		video: '/images/projects/react-spotify-player.mp4',
		poster: '/images/projects/react-spotify-player-poster.webp',
		imageAlt:
			"React Spotify Player: clicking Login with Spotify, approving the app on Spotify's permission screen, then the player showing the song that's playing, with album art, a progress bar and a Logout button",
		date: '2019-03',
		tech: ['React', 'Spotify API', 'JavaScript'],
		sourceUrl: 'https://github.com/JoeKarlsson/react-spotify-player',
		blogUrl: '/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/',
		stars: 131,
		page: {
			slug: 'react-spotify-player',
			tagline: "Shows what you're playing on Spotify, in a few small React files.",
			intro: [
				"React Spotify Player shows what you're listening to on Spotify: the album art, the track and artist, and a progress bar that moves along with the song. I built it in 2019 for a tutorial on building a Spotify player with React in 15 minutes, and it's still my most-starred open source project.",
				"I'd been using the Spotify API for my MagicMirror, and I wanted the shortest path from nothing to a working player for front-end developers: log in with Spotify, call one endpoint, show the result. It's still small on purpose. The current version is just React and Vite, and the whole app fits in a handful of files.",
				"If you're following the tutorial today, one warning: it logs in with Spotify's Implicit Grant flow, which Spotify deprecated in November 2025. New apps should use the Authorization Code flow with PKCE instead.",
			],
			steps: [
				{
					title: 'Log in',
					text: "The login button sends you to Spotify's authorization page, and Spotify sends you back with an access token in the URL fragment.",
				},
				{
					title: "Ask what's playing",
					text: "The app calls the Web API's `/me/player` endpoint with that token and gets the track, the artist, the album art and how far into the song you are.",
				},
				{
					title: 'Keep it current',
					text: 'It asks again every 5 seconds, so the track, the play state and the progress bar keep up with Spotify.',
				},
			],
			install:
				'git clone https://github.com/JoeKarlsson/react-spotify-player.git\ncd react-spotify-player\n# add http://localhost:3000/redirect as a Redirect URI on your Spotify app,\n# and put its Client ID in src/config/spotify.js\nnpm install\nnpm run dev',
		},
	},

	// Web - Digital Graffiti Wall
	{
		title: 'Digital Graffiti Wall',
		description:
			'An interactive art installation where audience members draw on a shared digital canvas that displays their creations in real-time on a physical RGB LED grid. Uses MongoDB Realm for instant cross-client data sync. Since retired and replaced by PixelPane.',
		image: '/images/blog/building-a-real-time-digital-graffiti-wall/hero.webp',
		imageAlt: 'Digital Graffiti Wall',
		date: '2020-10',
		tech: ['JavaScript', 'MongoDB Realm', 'RGB LEDs', 'Real-Time Sync'],
		blogUrl: '/blog/building-a-real-time-digital-graffiti-wall/',
		sourceUrl: 'https://github.com/JoeKarlsson/digital-graffiti-wall',
	},
	{
		title: 'Wave Jump',
		shareTitle: 'Wave Jump: A two-player race on a wave that never holds still',
		description:
			'A race for two people on one keyboard, set on an 80s sunset grid. You both ride a white wave that never stops rolling, and the first one to dive through the checkered gate scores. I made it at Global Game Jam 2018 with Cal Carlson, Daniel Olson and Lisa Mabley.',
		image: '/images/projects/wave-jump-poster.webp',
		video: '/images/projects/wave-jump.mp4',
		imageAlt:
			'Wave Jump: the sunset title screen, then two players riding a rolling white wave over a blue grid, and a big "Player 1 Wins" screen each time one reaches the checkered gate',
		date: '2018-01',
		tech: ['JavaScript', 'Phaser', 'Arcade physics', 'Vite'],
		sourceUrl: 'https://github.com/JoeKarlsson/wave-jump',
		demoUrl: 'https://wavejump.joekarlsson.com/',
		stars: 5,
		page: {
			slug: 'wave-jump',
			tagline: "Two players, one keyboard, and a wave that won't hold still.",
			intro: [
				'Wave Jump is a race for two people sharing one keyboard. You each ride a white wave across a sunset grid, and the wave keeps rolling under you the whole time. A checkered gate sits somewhere below it, and whoever dives through first gets the point.',
				'Cal Carlson, Daniel Olson, Lisa Mabley and I built it at Global Game Jam 2018, over the weekend of January 26 to 28, with Phaser. The wave is hundreds of small sprites, each one pushed up and down along a sine curve with a new height every frame, so you never get the same wave twice.',
				"In 2025 I moved it to a modern build so it still runs in a browser, and in November 2026 I tuned it again: it plays the same in any size window, the wave holds you up even on a slow computer, and it goes full screen. It needs two players and a keyboard, so it won't work on a phone.",
			],
			embedUrl: 'https://wavejump.joekarlsson.com/',
			// The game scales its 1920x1080 world to fit, so it runs at the box's real size
			embedHeight: '56.25cqw',
			embedNote:
				'Click the game to start. Player 1 uses W A S D, player 2 the arrow keys. It starts muted here; the buttons in the corner turn sound on and go full screen.',
			steps: [
				{
					title: 'Player 1',
					text: '`W` jumps, `A` and `D` steer, and `S` dives through the wave.',
				},
				{
					title: 'Player 2',
					text: 'The arrow keys do the same on the other side of the keyboard.',
				},
				{
					title: 'Score',
					text: 'First one through the gate gets the point. Click or press the spacebar for the next round.',
				},
			],
		},
	},
	{
		title: 'Go Home Tanuki',
		shareTitle: "Go Home Tanuki (You're Drunk): A Global Game Jam game about the ride home",
		description:
			'Our Global Game Jam 2016 game, on the theme "Ritual": a tanuki who works, drinks and goes home, every night. Fly him home through the dark and grab sake on the way. The drunker he gets, the higher you score, and the faster everything comes at you. Made with Kent Salcedo, Sarah Kurisu and Corina.',
		image: '/images/projects/go-home-tanuki-poster.webp',
		video: '/images/projects/go-home-tanuki.mp4',
		imageAlt:
			"Go Home Tanuki: a loading card listing Tanuki's daily ritual (work, drink, go home), the title screen of a sleepy tanuki slumped over a bar with a phone saying come home, then the tanuki flying through the night past clouds and sake bottles",
		date: '2016-01',
		tech: ['JavaScript', 'Phaser', 'Arcade physics', 'Vite'],
		sourceUrl: 'https://github.com/JoeKarlsson/go-home-tanuki',
		demoUrl: 'https://tanuki.joekarlsson.com/',
		stars: 2,
		page: {
			slug: 'go-home-tanuki',
			tagline: 'Get a drunk tanuki home, at least for tonight.',
			intro: [
				'Go Home Tanuki (You\'re Drunk) was our game for Global Game Jam 2016, where the theme was "Ritual." We based ours on the long hours that are common in Japanese office jobs: work late, go drinking with coworkers, get home somehow, and do it again tomorrow. Our worker is a tanuki, the raccoon dog from Japanese folklore.',
				'You click, tap or press the spacebar to fly him home through the night, past clouds and rocks. Sake raises his drunkness, and your score is his drunkness times how long he lasts, plus a bonus for distance and sake combos. Once he gets to 10, the lamps and clouds come at you a lot faster.',
				'I made it over one weekend with Kent Salcedo, Sarah Kurisu and Corina. In 2025 I moved it to a modern build so it still runs in a browser, and in November 2026 I tuned it again: it fits any screen, plays on phones, keeps your high score and goes full screen.',
			],
			embedUrl: 'https://tanuki.joekarlsson.com/',
			// The game is 4:3 and scales to fit, so the box matches it and it runs at real size
			embedHeight: '75cqw',
			embedNote:
				'Click the game to start, then click or press the spacebar to fly. It starts muted here; the buttons in the corner turn sound on and go full screen.',
		},
	},
	{
		title: 'PostStream',
		shareTitle: 'PostStream: A text-only social network with the metrics taken out',
		description:
			'A text-only social network from 2016 with the usual levers taken out: no like counts, no follower counts, no trending topics and no images. Made with Ray Farias and Jacoby Young.',
		image: '/images/projects/poststream-2026-11-poster.webp',
		video: '/images/projects/poststream-2026-11.mp4',
		imageAlt:
			"PostStream: writing a post that shows up at the top of the feed under an IRC-style log line, scrolling past other people's posts colored by author, opening a thread of replies picked from a list, then a profile laid out like Unix finger output",
		date: '2016-07',
		tech: ['React', 'Node.js', 'Express', 'PostgreSQL'],
		sourceUrl: 'https://github.com/JoeKarlsson/post-stream',
		demoUrl: 'https://poststream.joekarlsson.com/',
		page: {
			slug: 'poststream',
			tagline: 'A social network with the metrics taken out.',
			intro: [
				'PostStream is a social network that only does text. Ray Farias, Jacoby Young and I built it in 2016 as a response to the social media we were all using, and we called it undesigned.',
				"Most of the work was deciding what to leave out. It shows no like counts and no follower counts, so you can't see how popular anyone is. There's no global feed, no trending topics and no news to browse, and you can't post images, video or GIFs. The stream shows the first 256 characters of each post, with a read more that goes up to 2,048.",
				"Replies work the same way. You don't write them, you pick one: agree, disagree, agree or disagree because of something, tell me more about something, thank you for sharing, or brilliant. Most of those never got built in 2016. I finished them in November 2026, along with the feed that only shows people you follow.",
				'Someone else owns poststream.io now. The archived copy at poststream.joekarlsson.com has no server: it runs in your browser, signs you in as a sample visitor, and a few made-up people keep posting while you look around. Anything you post stays in your browser. The full app, with Node and PostgreSQL, is on GitHub.',
			],
			embedUrl: 'https://poststream.joekarlsson.com/',
			embedOnPhones: true,
			embedHeight: '640px',
			embedHeading: 'Try it',
			embedNote:
				"This is the archived demo, running right here. You're signed in as a sample visitor and the other people are simulated, so write a post and someone will answer.",
		},
	},

	{
		title: 'DVD Screensaver',
		shareTitle: 'The DVD screensaver with the boring parts taken out',
		description: 'With the boring parts taken out.',
		image: '/images/projects/nothing-but-corners.webp',
		video: '/images/projects/nothing-but-corners.mp4',
		imageAlt:
			'Colored DVD logos bouncing around a black screen, and each time one lands in a corner the screen flashes and confetti bursts out of it',
		date: '2026-11',
		tech: ['JavaScript', 'Canvas', 'Web Audio', 'Playwright'],
		sourceUrl: 'https://github.com/JoeKarlsson/nothing-but-corners',
		demoUrl: 'https://joekarlsson.github.io/nothing-but-corners/',
		page: {
			slug: 'nothing-but-corners',
			tagline: 'The DVD screensaver with the boring parts taken out.',
			introHeading: 'Artist statement',
			intro: [
				'Everybody has watched the DVD screensaver, and nobody made it for anyone to watch. It existed to keep a TV left on from burning the logo into the screen. Somehow whole rooms of people ended up watching it drift toward a corner and groaning when it missed by a few pixels, which was almost every time.',
				'I called my version Nothing But Corners, because that\'s all it does. I aim every bounce, so the logo lands in a corner every single time. That took a lot more math than a joke should need. I unfold the screen into a grid so a bouncing path becomes a straight line, aim at a corner in that grid, and throw out any path that bounces off a wall too close to a corner. Most of that work went into getting rid of the near miss, and the near miss was why people watched the original. Click and you get another logo, then another, until the screen fills up with logos landing in corners. Turn the sound on and every corner gets a thump and a cheer, kids yelling "yay" or a round of applause.',
				'You were waiting for something else when you watched the real one, a movie to start or someone to find the remote, and it happened to be on. The near misses kept people watching. Mine hits every time, so after about a minute I get bored of it.',
				"Cory Arcangel's Super Mario Clouds hacked a Mario cartridge until only the scrolling sky was left. Both pieces take software everybody already knows and remove part of it.",
				"It's also useless on purpose. I've been making things nobody needs for a long time, from co-organizing the Stupid Shit No One In Hawaii Needs hackathon in 2017 to gluing seeds to cardboard one at a time to make pictures. Both took a lot of work for something with no use, and I liked doing them.",
			],
			embedUrl: 'https://joekarlsson.github.io/nothing-but-corners/',
			embedOnPhones: true,
			embedHeading: 'Watch it',
			embedNote: 'Click inside to add another logo.',
		},
	},
	{
		title: 'Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon',
		shareTitle: 'Stupid Shit No One In Hawaii Needs Hackathon: Building things nobody needs',
		description:
			'A one-day hackathon in Honolulu for projects with no value whatsoever. I co-organized it with Ray Farias.',
		image: '/images/projects/stupid-hackathon-poster.webp',
		video: '/images/projects/stupid-hackathon-montage.mp4',
		imageAlt:
			'The hackathon\'s site: "Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon" in red brush letters on lime green, then quick cuts through the 2017 entries as the page breaks, its fonts turning to Comic Sans, everything tilting and flashing, until it all falls down the screen on "Thanks Y\'all!"',
		date: '2017-01',
		tech: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
		sourceUrl:
			'https://github.com/STUPIDSHITNOONEINHAWAIINEEDSHACKATHON/STUPIDSHITNOONEINHAWAIINEEDSHACKATHON.github.io',
		demoUrl: 'https://stupidshitnooneinhawaiineedshackathon.github.io/',
		page: {
			slug: 'stupid-hackathon-hawaii',
			tagline: "Let's build something we will all regret.",
			intro: [
				'Ray Farias and I put on the Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon in Honolulu in January 2017, hosted by DevLeague, the coding bootcamp where I taught. It was one day of building projects with no value whatsoever, open to programmers, hardware hackers, artists, musicians and, according to the site, space whales.',
				"It's a local edition of the Stupid Shit No One Needs and Terrible Ideas Hackathon, which started in New York, and the site links out to the other ones around the world.",
				"People built a Chrome extension that switches every font to Comic Sans and breaks every link, an Alexa that has had enough of your shit, a cardboard laptop and smartphone, a 3D-printed rubber duck keycap to talk to when you're stuck, and an official survey with the worst UX we could manage that never ends. Naked Nudeles took the people's choice award. My entry was App-All-O-Gizer, which emails apologies for you.",
				'Ray started the site and I styled it. After the event I filled in the entries, the winners and the names of everyone who built them, so it also works as the record of that day.',
				'Most hackathons judge you on whether your idea could turn into a company. This one gave prizes for the stupidest idea, and people still worked all day on theirs.',
			],
		},
	},
	{
		title: 'App-All-O-Gizer',
		shareTitle: "App-All-O-Gizer: Never be sorry you weren't sorry again",
		description:
			"Schedule apologies to go out once a month, once a week or every day. Never be sorry you weren't sorry again.",
		image: '/images/projects/app-all-o-gizer-poster.webp',
		video: '/images/projects/app-all-o-gizer.mp4',
		imageAlt:
			'App-All-O-Gizer\'s page, "Pronounced Apologizer", with an email address typed in and Send Email clicked, then a Gmail inbox opening an email from app.all.o.gizer titled "Sorry about the murder"',
		date: '2017-01',
		tech: ['Node.js', 'Express', 'Nodemailer', 'Gmail'],
		sourceUrl: 'https://github.com/STUPIDSHITNOONEINHAWAIINEEDSHACKATHON/app-all-o-gizer',
		page: {
			slug: 'app-all-o-gizer',
			tagline: "Never be sorry you weren't sorry again.",
			intro: [
				"I built App-All-O-Gizer in a day at the Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon in January 2017. Sometimes you hurt people and don't even know it, so the pitch was to apologize on a schedule, once a month, once a week or every day, and cover yourself either way.",
				'You type in someone\'s email address and click Send Email. The app picks one of 13 apologies at random and sends it from a Gmail account. They range from missing an anniversary to peeing the bed to murder, and every one signs off with "Email sent by appallogizer.com".',
				'The schedule never got built. I installed node-cron and ran out of day, so every click sends one apology right away. An apology app that never followed through seemed right for this hackathon.',
				"The site is offline now, so the clip is the demo GIF from the project's README.",
			],
			screenshots: [
				{
					poster: '/images/projects/app-all-o-gizer-form.webp',
					alt: 'The App-All-O-Gizer page on pale pink: the title, "Pronounced Apologizer", the pitch, "Never be sorry you weren\'t sorry again!", an email box and a Send Email button, signed "Site by Joe Karlsson for the Stupid Hackathon HNL 2017"',
					caption: 'Type an address, click once',
				},
				{
					poster: '/images/projects/app-all-o-gizer-poster.webp',
					alt: 'A Gmail inbox showing an email from app.all.o.gizer@gmail.com titled "Sorry about the murder": "It was a total freak accident that I murdered that guy last week. I hope that you will find it in your heart to forgive me for my heinous crime against humanity."',
					caption: 'One of the 13 apologies it picks from',
				},
			],
		},
	},
	{
		title: 'Best Buy Product Locator',
		shareTitle: 'Best Buy Product Locator: Is the thing on Amazon at a Best Buy near you?',
		description:
			"Two-day shipping too slow for you? A Chrome extension that tells you if the product you're browsing on Amazon, Walmart or Target is at a Best Buy near you for pickup today.",
		image: '/images/projects/best-buy-product-locator.webp',
		imageAlt:
			'A Sony 48-inch TV on Amazon with the extension running: a blue Best Buy banner across the top reads "Want it faster? Pick it up now for $449.99" at the Best Buy in Richfield, MN, and the toolbar popup shows the same TV with a Buy on BestBuy.com button',
		date: '2018-09',
		tech: ['React', 'styled-components', 'Chrome Extension', 'Best Buy API'],
		sourceUrl: 'https://github.com/JoeKarlsson/best-buy-product-locator-chrome-extension',
		page: {
			slug: 'best-buy-product-locator',
			tagline: 'Two-day shipping too slow for you?',
			intro: [
				"The Best Buy Product Locator is a Chrome extension for when you're shopping on Amazon, Walmart or Target and want the thing today. It looks up the product you're browsing in Best Buy's catalog and tells you whether the Best Buy nearest you has it for pickup.",
				"It reads the model number out of the product's spec table, or falls back to searching by the product's title, and checks the Best Buy API for a match and for stores near your location. If there's a match, a banner drops across the top of the page with Best Buy's price, the store, its hours that day and a button to buy it on BestBuy.com. The toolbar popup shows the same thing.",
				'I built it with Eric Moore in 2018, in React with styled-components. Best Buy never had anything to do with it.',
				"It's gone from the Chrome Web Store now, and I built it on Manifest V2, which current Chrome won't load, so this screenshot from 2018 is the only look at it working.",
			],
		},
	},
	{
		title: 'GAPTCHA',
		shareTitle: 'GAPTCHA: An augmented reality scavenger hunt from a 2017 hackathon',
		description:
			'An augmented reality scavenger hunt built at the 2017 AT&T hackathon in Honolulu. Scan a printed marker and a 3D arrow points you toward a hidden checkpoint.',
		image: '/images/projects/gaptcha-scan.webp',
		imageAlt:
			'Hands holding a Samsung phone over a printed GAPTCHA marker on a concrete floor, with a green 3D arrow drawn over the camera view in the browser',
		date: '2017-03',
		tech: ['Node.js', 'Express', 'A-Frame', 'AR.js', 'Leaflet', 'AT&T M2X'],
		sourceUrl: 'https://github.com/JoeKarlsson/GAPTCHA',
		demoUrl: 'https://gaptcha.joekarlsson.com/',
		page: {
			slug: 'gaptcha',
			tagline: 'Find, scan, win',
			intro: [
				"GAPTCHA was an augmented reality scavenger hunt that four of us from DevLeague built at AT&T's hackathon in Honolulu in March 2017: Sean Nakamura, Tony Gaskell, Brandon Baris and me. The name stands for Geo-Augmented Place That Checks Authenticity.",
				"We printed square markers and left them around for people to find. Scan one with the web app and a green 3D arrow shows up over your camera view, pointing at a hidden checkpoint. An arrow gives you a direction but not a distance, so the idea was to collect bearings from a few markers and walk to where they cross. When you think you're standing on it, you tap Did I Win.",
				"My part was the server, the direction math and the homepage. I stubbed out the Express server and wrote the route that takes your phone's latitude and longitude and works out the bearing to the checkpoint with the Vincenty formula. I also got the live map pulling from AT&T M2X, which tracked everyone playing. The checkpoint's location came from an M2X device, so it could move during the game. Get within 20 meters of it and the app tells you how many tries everyone took since the last win.",
				'The Heroku app went down years ago, and AT&T shut M2X down in 2021. In November 2026 I moved the checkpoint logic into the browser and put it back up at gaptcha.joekarlsson.com. Near the original spot in Honolulu you hunt the hackathon checkpoint. Anywhere else, it hides a demo checkpoint 100 to 300 meters from you. A scan only counts when the camera sees a printed marker, your scans stay in your browser instead of going to M2X, and a live feed shows simulated hunters playing alongside you.',
				'The photos below are from that weekend.',
			],
			// The demo plays itself when framed (no location, no camera) and fills its frame without
			// growing. Its fixed parts need 730px with its columns side by side and up to ~970px
			// stacked on the narrowest phone; the rest goes to the hunters feed. GAPTCHA's
			// tests/e2e/embed-frame.spec.js checks these sizes, so change both together.
			embedUrl: 'https://gaptcha.joekarlsson.com/?embed',
			embedOnPhones: true,
			embedHeight: 'max(880px, min(1070px, 1440px - 130cqw))',
			embedHeading: 'Watch it',
			embedNote:
				'This demo plays itself. To hunt for real, open gaptcha.joekarlsson.com on your phone with a printed marker.',
			screenshots: [
				{
					poster: '/images/projects/gaptcha-home.webp',
					alt: 'The GAPTCHA homepage: "GAPTCHA, Find. Scan. Win." and a Scan a Marker button over a green-tinted brick wall, next to an iPhone showing a GAPTCHA marker',
					caption: 'The homepage',
				},
				{
					poster: '/images/projects/gaptcha-hackathon-testing.webp',
					alt: 'Testing GAPTCHA at a hackathon table: Brandon Baris, grinning in a red shirt, holds out a phone showing the camera view while a teammate behind him holds up a phone with a GAPTCHA marker and another phone running the AR view, with laptops and other teams all around the cafeteria',
					caption: 'Testing the AR at the hackathon',
				},
				{
					poster: '/images/projects/gaptcha-find.webp',
					alt: 'A finger pointing at a printed GAPTCHA marker on a concrete floor: a black square with a black triangle in the corner and gaptcha.herokuapp.com printed underneath',
					caption: 'Find a marker',
				},
				{
					poster: '/images/projects/gaptcha-win.webp',
					alt: 'Two people jumping in the air with confetti falling in a school cafeteria full of hackathon tables, an AT&T "Mobilizing Your World" banner behind them',
					caption: 'Win',
				},
			],
		},
	},
	{
		title: 'Pixelate',
		shareTitle: 'Pixelate: Turn any image into blocks in the browser',
		description:
			'A small web app that turns any photo into big square pixels. Pick a photo, drag the slider to set the block size, and save it as a PNG. Nothing gets uploaded.',
		image: '/images/projects/pixelate-2026-before-after.webp',
		imageAlt:
			'A selfie of me in sunglasses holding a pink soft-serve cone at a fair, and next to it the same photo run through Pixelate, turned into blocks of color',
		date: '2015-04',
		tech: ['JavaScript', 'HTML5 Canvas'],
		sourceUrl: 'https://github.com/JoeKarlsson/Pixelate',
		demoUrl: 'https://pixelate.joekarlsson.com/',
		blogUrl: '/blog/how-to-pixelate-images-with-html5-and-javascript/',
		stars: 15,
		page: {
			slug: 'pixelate',
			tagline: 'Pick a photo, drag the slider.',
			intro: [
				'I wrote the first Pixelate over two days in April 2015. You pasted in the URL of an image, clicked Submit, and it redrew the picture as blocks, with a slider for how big they got.',
				"That version had no pixel math in it. It drew the image onto a canvas at a few percent of its size, turned off image smoothing, and stretched the tiny copy back up. The browser did the rest, and the blur you'd normally get from scaling up came out as hard squares.",
				'In November 2026 I rebuilt it. Now you pick a photo from your phone or computer, and it never leaves your device. Each block is the exact average of the pixels under it, so edges land where they should, and Save PNG downloads the result.',
				"The pictures here are a frame from one of my own videos. It's the oldest of my pixel projects, before the Digital Graffiti Wall and PixelPane.",
			],
			embedUrl: 'https://pixelate.joekarlsson.com/',
			embedOnPhones: true,
			embedHeight: '1000px',
			embedHeading: 'Try it',
			embedNote:
				'This is the live site, running right here. Pick a photo and it stays in your browser; Save PNG downloads the result.',
			screenshots: [
				{
					poster: '/images/projects/pixelate-2026-app.webp',
					alt: 'The Pixelate page in pink on black: a Choose File button, a block size slider set to 24px and a Save PNG button, over the fair selfie turned into square blocks',
					caption: 'Block size 24px',
				},
			],
		},
	},
	{
		title: 'Night Out',
		shareTitle: 'Night Out: Vote with your friends on where to go tonight',
		description:
			'Vote with your friends on where to go tonight. It finds the bars near you, you pick the ones in the running, and everyone votes from a shared link.',
		image: '/images/projects/night-out-2026-pick.webp',
		imageAlt:
			'Night Out on "Where are we going tonight?": a dark map of downtown Honolulu with bars marked in pink, next to a list where The Last Call, Moonlight Tap Room and Pink Flamingo Lounge are checked',
		date: '2015-10',
		tech: ['Meteor', 'MongoDB', 'Vite', 'Leaflet', 'OpenStreetMap'],
		sourceUrl: 'https://github.com/JoeKarlsson/night-out',
		demoUrl: 'https://night-out.joekarlsson.com/',
		page: {
			slug: 'night-out',
			tagline: 'Where are we going tonight?',
			intro: [
				'Night Out is for the part of the evening where the group text goes in circles about where to go. I built the first version in Meteor at the end of October 2015 with Jessie Copeland, Alex Anich, Brian "Boots" and Nolan "Skinny Fatman".',
				"That version found your location, asked Google Places for the bars and breweries nearby, and let you check off the ones you'd actually go to. Clicking Start your night out gave you a link to send everyone, and Meteor pushed each vote to everyone with the link as it came in.",
				"The Heroku app died years ago. In November 2026 I rebuilt it as a static site at night-out.joekarlsson.com. Bars now come from OpenStreetMap, and there's no server, so the whole plan and its votes live in the link. When you vote, the link on your screen updates and you send the new one back to the group. Two people voting on the same old link at once each end up with only their own vote, which is the trade for not running a server.",
				"If you're not near any bars, or you don't want to share your location, Try it with demo bars fills the map with made-up bars in Honolulu, where it started.",
			],
			embedUrl: 'https://night-out.joekarlsson.com/',
			embedOnPhones: true,
			embedHeight: '1100px',
			embedHeading: 'Try it',
			embedNote:
				"This page doesn't share your location with embeds, so here it runs on the demo bars. Open the live site to find bars near you.",
			screenshots: [
				{
					poster: '/images/projects/night-out-2026-vote.webp',
					alt: 'The Night Out vote page: "Vote on tonight, 3 bars, no votes yet", a share link with a Copy link button, a map of downtown Honolulu, and The Last Call, Moonlight Tap Room and Pink Flamingo Lounge each at 0 votes',
					caption: 'The vote page and its share link',
				},
			],
		},
	},
	{
		title: 'linger',
		shareTitle: 'linger: Poems that only finish if you read them slowly',
		description:
			'A small collection of poems that only finish for readers who slow down. Each line starts as a few words floating in white space. Hold still and the blanks fill in. Scroll fast and they drain away again. Plain HTML, CSS, and about a hundred lines of JavaScript, with no analytics and no share button.',
		image: '/images/projects/linger.webp',
		video: '/images/projects/linger.mp4',
		imageAlt:
			'The linger poem "the lake" scrolling slowly: each line starts as a few scattered words, and the missing words fade in while the page holds still',
		date: '2026-10',
		tech: ['HTML', 'CSS', 'JavaScript'],
		sourceUrl: 'https://github.com/JoeKarlsson/linger',
		demoUrl: 'https://linger.joekarlsson.com/poem.html',
		page: {
			slug: 'linger',
			tagline: 'Poems for the in-between hours. Stay a while, and the words will come.',
			introHeading: 'Artist statement',
			intro: [
				"Almost everything on the web wants to move you along. Feeds don't end, and articles print a read time at the top so you can decide whether they're worth the minutes. I spend my working days in developer marketing, where every page I ship gets judged by where people click next. I wanted to make one page that worked the other way.",
				'linger is seven poems that only finish if you slow down. Each line starts as a few words in white space, and the rest fills in while you hold still. Scroll fast and the words drain away again, and if you skim hard enough the page whispers "slower." at you. It\'s a bit of a joke, a page that won\'t give you the poem until you behave.',
				'The poems are about in-between time, like sitting in the driveway before going inside, a snow day, or a Sunday with nothing in it, and I wanted reading them to take some time too.',
				"I've been writing poetry for about ten years, and lately a lot of it has been blackout poetry on paper, where you black out most of a printed page until a poem is left. Tom Phillips did a version of this for A Humument, painting over the pages of a Victorian novel, and Mary Ruefle whited out words in an old book called A Little White Shadow. I kept wondering what the web could do with erasure that paper can't. Paper has no idea how fast you're reading, and a web page does, so I made speed the thing that decides which words you get.",
				"The Deletionist was a big inspiration. It's a bookmarklet by Amaranth Borsuk, Nick Montfort and Jesper Juul that erases most of the text on any web page you run it on and leaves a poem behind. linger goes the other direction. It starts with the erased version, a few words left on the page, and gives the rest back if you stay.",
				"The page only measures how fast you're scrolling, and it doesn't save that anywhere. It has no analytics, no cookies and no share button, so I have no idea whether anyone has read one all the way through.",
			],
			embedUrl: 'https://linger.joekarlsson.com/poem.html',
			embedHeading: 'Read it',
			embedNote: 'Scroll inside the poem, slowly.',
		},
	},
	{
		title: 'Punc',
		shareTitle: 'Punc: What a book looks like with only its punctuation',
		description:
			'Punc takes the words out of a book and leaves the punctuation where it was. Pick one off the shelf or bring your own.',
		image: '/images/projects/punc-poster.webp',
		video: '/images/projects/punc.mp4',
		imageAlt:
			"Punc's site: the shelf of books shown as punctuation, then Alice's Adventures in Wonderland with 26,777 words removed and 8,076 marks left, and the book's punctuation laid out in reading order",
		date: '2016-02',
		tech: ['TypeScript', 'Canvas', 'SVG', 'PDF'],
		sourceUrl: 'https://github.com/JoeKarlsson/punc',
		demoUrl: 'https://joekarlsson.github.io/punc/',
		page: {
			slug: 'punc',
			tagline: 'What a book looks like without words.',
			introHeading: 'Artist statement',
			intro: [
				"A lot of what steers you through a book isn't the words. A comma tells you to take a breath, a period tells you to stop, and an exclamation point tells you someone is yelling. You follow every one of those instructions while you read, and you almost never notice them.",
				"Punc takes the words away and leaves the instructions. Without the words, punctuation stops being invisible, and you can see a book's rhythm on its own: where a writer keeps you going without a breath, where the dialogue gets crowded and everyone talks over each other, and where it goes quiet for a while. Alice's Adventures in Wonderland comes out loud and nervous, full of exclamation points and questions, which is how the book feels to read.",
				"I think a lot of what we call a writer's voice lives in those marks. Two writers can use the same words and sound nothing alike, because one of them never lets a sentence end and the other stops every few words. Punc takes the meaning out of a book, and a lot of the voice is still there.",
				"It's an erasure, like the blackout poems I make on paper, except a blackout poem keeps a few words and Punc keeps none.",
			],
			made: {
				text: [
					'Punc is a website and a TypeScript library with a command line, and both count with the same code, so their numbers match. [The code is on GitHub](https://github.com/JoeKarlsson/punc).',
				],
				steps: [
					{
						title: 'Fill the shelf',
						text: "The shelf is Project Gutenberg's most-read English books. I refresh it by hand, and each refresh stays in git.",
					},
					{
						title: 'Count the marks',
						text: 'The library counts every mark and treats curly quotes, long dashes and ellipses as their plain versions.',
					},
					{
						title: 'Draw the book',
						text: "Each book gets four views: every mark in reading order, a spiral of the whole book, its pages with the letters erased, and how each mark's share changes from start to finish.",
					},
					{
						title: 'Bring your own',
						text: 'Open any plain text file and Punc reads it in your browser. Nothing gets uploaded.',
					},
				],
			},
			lineage: [
				{ label: 'Before it', title: 'Bechdel.io' },
				{ label: 'After it', title: 'linger' },
			],
			embedUrl: 'https://joekarlsson.github.io/punc/',
			embedHeading: 'Read it',
			embedNote: 'Pick a book off the shelf, or bring your own.',
		},
	},
	{
		title: 'Rose Hobart',
		shareTitle: "Rose Hobart: Joseph Cornell's 1936 film, remastered for the web",
		description:
			"Joseph Cornell's 1936 collage film, with the tint, the speed and the music back in your hands while it plays. Made with my sister Laurel.",
		image: '/images/projects/rose-hobart-2026-film-poster.webp',
		video: '/images/projects/rose-hobart-2026-film.mp4',
		imageAlt:
			"Rose Hobart in close-up from Joseph Cornell's 1936 film while the projector presets change it: Cornell blue, a pink filter, nitrate decay, a broken projector and digital decay, then amber and green gels",
		date: '2017-10',
		tech: ['React', 'Vite', 'WebGL', 'CSS filters'],
		sourceUrl: 'https://github.com/JoeKarlsson/rose-hobart',
		demoUrl: 'https://rosehobart.joekarlsson.com/',
		stars: 2,
		page: {
			slug: 'rose-hobart',
			tagline: "Joseph Cornell's Rose Hobart, remastered for the web.",
			introHeading: 'Supporting statement',
			intro: [
				"The first showing of Joseph Cornell's short film Rose Hobart is the stuff of legend. Famously, the film's 1936 premier ended with Salvador Dalí storming out, claiming that the film had been stolen directly from his subconscious (Pigott 5). Very little else is known about this original showing; Cornell would not show the film again for nearly thirty years. Currently, only one version of Rose Hobart continues to be circulated; this version comes from Cornell's 1960s showings, leaving the performative details of the premier shrouded in mystery (Pigott 21).",
				'Screenings of Rose Hobart were originally highly performative. In contrast to the currently available digital version which is “frozen” in time, several aspects of Cornell’s screenings were subject to change. First, the film was shown with a tinted filter. While the current version shows a deep blue tint being used, any number of colors could have been used in the other showings, with some evidence pointing to the use of a pink filter (Pigott 20). Second, the film was shown either at the standard 24 frames per second or 16 frames per second, also known as “silent speed” (Pigott 21). Today’s surviving version shows the film in the slightly slower “silent speed,” giving the short film a dreamier quality that is practically undetectable to the untrained eye. Lastly, due to the silence of the film itself, different music was paired with the film as it was shown. The version that remains today is paired with two jaunty tracks by Nestor Amaral and His Continentals, from their 1957 album Holiday in Brazil (Pigott 24). Because these songs were not released until 1957, it’s clear that different music was used in the original 1936 screening, and likely in other screenings as well. Unfortunately, there is no documentation of what that music might have been.',
				'This collaborative digital humanities project is an exploration of the lack of performativity in the current version available of Joseph Cornell’s Rose Hobart. It is an attempt to bring the performative aspects of screening Rose Hobart back to the film by allowing viewers to change the soundtrack, filter, speed, and other options as they view the film. Due to the digital nature of this project, it is by no means an attempt to perfectly imitate Cornell’s original screenings. Rather, it is an attempt to “unfreeze” the currently available version of Rose Hobart from its place in time.',
				'This project also emphasizes the digital nature of the film today. While there are physical copies of Rose Hobart available for viewing, the film is widely circulated online, which suggests that most viewers are accessing the film via the internet rather than through physical media. Due to the film’s transfer from physical to digital, signs of physical degradation of the film have been “frozen” or stopped in their tracks, bringing the film from the material film archive to the immaterial film archive (Baron 481). Jaimie Baron argues that both types of archive present viewers with a different experience of mediation: either bearing traces of the physical world or of digital technologies, both of which signal a relationship with the past (481). In order to simulate digital degradation, this project provides an option for viewers to blur and glitch the video, simulating the digital archival process that occurs when a digital video is damaged and continually copied.',
				'By bringing the performative aspects of screening Rose Hobart into the digital realm, we collapse the distinction between presenter and viewer. When the physical film was screened historically, viewers were in a strictly passive position, spectating at the mercy of the performative choices made by the presenter of the film. With this project, that distinction ceases to exist. The presenter of the film – the person responsible for making performative choices like tint color, music, and speed – is also the viewer.',
				'Rose Hobart cannot be discussed without addressing its primary subject matter: the actress Rose Hobart herself. Due to the film’s nearly obsessive focus on a female body that has been rendered silent, the film lends itself to feminist critique. It seems plainly obvious, as Janet Harbord argues, that “Cornell’s film plays on the beauty and emotional intensity of the star, Rose Hobart, given shape through rhythmic repetition of certain sequences” (69). Thus, does the film ask its viewers to admire the physical beauty of Rose Hobart? Critic Jodi Hauptman writes that through his film, Cornell “forces Hobart’s body to act as a voice . . . Such a collapse of distance between feelings and expression, body and mind, is another indicator of [the hysterical body of the woman]” (qtd. in Lowenstein). Is Rose Hobart the subject of the film, or is her body the subject of the film? By presenting a project that not only recognizes the degradation of the filmic image but also emphasizes it, we ask our viewers to consider how this changes the representation of Hobart’s feminine beauty as well as how this changes the film as a whole.',
				'Written with Laurel Karlsson. The full list of works consulted is on the supporting statement page of the project site.',
			],
			embedUrl: 'https://rosehobart.joekarlsson.com/',
			embedHeading: 'Watch it',
			embedNote: 'Press play, then pick a projector, a gel, the speed and the music.',
			screenshots: [
				{
					poster: '/images/projects/rose-hobart-2026-pink-filter.webp',
					alt: 'The Rose Hobart site: the film between red theater curtains with the Pink filter preset on, and the projector panel beside it with presets, an age slider, gel colors and gel density',
					caption: 'The Pink filter preset, one of the colors Cornell may have used',
				},
			],
		},
	},
	{
		title: 'Bechdel.io',
		shareTitle: 'Bechdel.io: Checking movie scripts against the Bechdel Test',
		description: 'Does your favorite movie pass the Bechdel Test? Made with my sister Laurel.',
		image: '/images/projects/bechdel-io-2026-poster.webp',
		video: '/images/projects/bechdel-io-2026.mp4',
		imageAlt:
			'Bechdel.io: the headline "Do two women talk to each other about something other than a man?", the shelf of movie posters marked passes or fails, filtering to films that pass, then the Gone Girl page scoring 3 of 3 and its cast sized by lines spoken',
		date: '2015-11',
		tech: ['Node.js', 'NLP', 'JavaScript', 'MongoDB'],
		sourceUrl: 'https://github.com/JoeKarlsson/bechdel-test',
		demoUrl: 'https://bechdel.joekarlsson.com/',
		blogUrl: '/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/',
		stars: 30,
		page: {
			slug: 'bechdel-io',
			tagline: 'Does your favorite movie pass the Bechdel Test?',
			introHeading: 'Artist statement',
			intro: [
				'Bechdel.io checks movie scripts against the Bechdel Test. The test comes from a 1985 Alison Bechdel comic strip, and it asks three things: are there at least two women, do they talk to each other, and do they talk about something other than a man.',
				'A wall of movies most people have already seen, sorted into pass and fail, makes you look at them again. About half of the 218 films on the shelf fail, and a lot of them are favorites.',
				"The counting is also where it goes wrong. To count women, the tool has to decide who is one, and it takes that answer from a film database that credits everyone as an actor or an actress. It can't see a trans character, a character whose gender changes during the film, or anyone who isn't a man or a woman. That two-box answer runs back through casting, award categories and the fan-run sites the data comes from, and the Bechdel Test has the same blind spot: it never says who the women are.",
				'Data with room for only two answers loses most of what makes people interesting, and this project shows exactly where it happens.',
				'My sister Laurel and I made it in 2015 and used it to study the Best Picture nominees at the 2015 Oscars. We released it as open source because we saw it as feminist activism.',
			],
			credit: 'with Laurel Karlsson',
			made: {
				text: [
					'The scripts came from [Movie Script Scraper](https://github.com/JoeKarlsson/movie-script-scraper), and the cast from a film database API. [The 2015 write-up](/blog/bechdel-test-script-parser-works/) goes deeper.',
				],
				diagram: {
					src: '/images/blog/bechdel-test-script-parser-works/parsing-method.svg',
					alt: 'How Bechdel.io reads a screenplay: it gets the cast and each credited gender from a film database, splits the script into scenes, and checks every scene with two or more women for words about a man',
				},
				steps: [
					{
						title: 'Find the cast',
						text: "It reads the film's title off the first line of the script and asks a film database for the cast, their characters and how each one is credited: actor or actress.",
					},
					{
						title: 'Cut it into scenes',
						text: "It splits the script on 10 to 12 keywords like INT. and EXT., then collects each character's lines in every scene.",
					},
					{
						title: 'Test each scene',
						text: 'A scene passes if two women talk in it and their lines never mention a man: he, him, father, king.',
					},
					{
						title: 'Where it breaks',
						text: "That word list is crude. Words about men run all through English, and a keyword can't tell what a sentence is about.",
					},
				],
			},
			lineage: [
				{ label: 'Led to', title: 'Movie Script Scraper' },
				{ label: 'Next in the same vein', title: 'Rose Hobart' },
			],
			embedUrl: 'https://bechdel.joekarlsson.com/',
			embedHeading: 'Try it',
			embedNote: 'Pick a movie to see whether it passes.',
			screenshots: [
				{
					poster: '/images/projects/bechdel-io-2026-shelf.webp',
					alt: 'The Bechdel.io shelf: search, show and sort controls over a grid of movie posters, each tagged passes or fails with its year and how many of the three rules it meets',
					caption: 'The shelf: 218 films, 111 of them pass',
				},
				{
					poster: '/images/projects/bechdel-io-2026-lines.webp',
					alt: 'The Gone Girl page: release details, then the cast sized by lines spoken, with Nick at 496 lines in white and Amy at 287 and Boney at 196 in pink for women',
					caption: 'Each film page sizes the cast by how many lines they speak',
				},
			],
		},
	},

	{
		title: 'Connect AI × DOOM',
		shareTitle: 'Connect AI × DOOM: Doom levels built from live business data',
		description:
			"Ask Claude a business question and it builds a Doom level from the answer. Every monster is a live record from your apps, pulled through the CData Connect AI MCP server. I built it in one night as a side project, and it's now the foundation of my team's developer marketing campaign and event strategy.",
		image: '/images/projects/connect-ai-doom.webp',
		video: '/images/projects/connect-ai-doom.mp4',
		poster: '/images/projects/connect-ai-doom-poster.webp',
		imageAlt:
			'Claude playing a Doom level built from live Connect AI data, shooting a pink demon labeled with an urgent Salesforce deal while a side panel logs every kill',
		date: '2026-10',
		tech: ['Python', 'Claude Code', 'MCP', 'CData Connect AI', 'psdoom-ng', 'SQL'],
		sourceUrl: 'https://github.com/CDataSoftware/connect-ai-doom',
		demoUrl: 'https://cdatasoftware.github.io/connect-ai-doom/',
		blogUrl: '/blog/why-i-use-doom-to-visualize-mcp-data/',
		page: {
			slug: 'connect-ai-doom',
			tagline: 'Doom built from live business data, where every monster is a real record.',
			intro: [
				'You ask Claude a business question, like "Which customers are at risk right now?" Claude answers it through the CData Connect AI MCP server, and the answer becomes a Doom level. Each room is an app that holds part of the answer, like Salesforce, Zendesk or Stripe. Each monster is a record from that app, and the urgent ones are pink demons. Keycards match your permissions, and anything Connect AI refused to hand over, like a lookup by Social Security number, sits behind a red door with no key.',
				"You can play it yourself, or let Claude play while a side panel shows every decision and tool call it makes. Shoot a record and the game re-reads it live from the source app. Everything goes through Connect AI's read-only tools, so nothing in your apps changes. The full version runs on a Mac, and setup takes about ten minutes.",
				"Or play it right here: the web version below is a level Claude built from a demo company's Salesforce, Zendesk and Stripe. No install or account needed. It needs a keyboard and mouse.",
			],
			// The game alone, built for blog posts: it fits the width and doesn't take focus
			embedUrl: 'https://cdatasoftware.github.io/connect-ai-doom/embed.html',
			// Its 4:3 game plus the logo strip above (52px) and the question below (84px)
			embedHeight: 'calc(75cqw + 136px)',
			steps: [
				{
					title: 'Query',
					text: 'Claude Code runs headless with Connect AI as its only MCP server. It finds the three apps that answer your question and writes one SQL query for each.',
				},
				{
					title: 'Build',
					text: 'Every query returns the same four columns: `Id`, `Label`, `Detail`, `Hot`, so any connector can become a room.',
				},
				{
					title: 'Refresh',
					text: 'A small bridge re-runs each room every 15 seconds, so the monsters always match your data. With `--claude-plays`, Claude also gets a [Doom MCP server](/blog/doom-mcp-server/) so it can play the level.',
				},
			],
			install:
				'git clone https://github.com/CDataSoftware/connect-ai-doom.git\ncd connect-ai-doom\n./setup.sh\n./raid.sh offline   # made-up data, no account needed',
			galleryTitle: 'Clips',
			galleryNote: 'Claude playing a level built from a demo Salesforce account. Hover to play.',
			gallery: [
				{
					video: `${DOOM_DIR}/salesforce-room.mp4`,
					poster: `${DOOM_DIR}/salesforce-room-poster.webp`,
					alt: 'Claude walking into the Salesforce room, a hall of pink demons each labeled with a deal name, while the HUD shows the urgent deal for Sunshine State University and its amount',
					caption: 'The Salesforce room: every monster is a deal',
				},
				{
					video: `${DOOM_DIR}/kills.mp4`,
					poster: `${DOOM_DIR}/kills-poster.webp`,
					alt: 'Claude clearing the Salesforce room, shooting deal after deal while the HUD names each one and its amount',
					caption: 'Every kill is a live read through Connect AI',
				},
			],
			screenshots: [
				{
					poster: `${DOOM_DIR}/game-and-panel.webp`,
					alt: "The full Connect AI × DOOM screen: Doom on the left with a Salesforce deal labeled over a pink demon, and a side panel on the right showing 3 apps, 70 records, 1 blocked, the Salesforce, Zendesk and Stripe rooms, the red door PII vault, and Claude's feed of decisions and tool calls",
					caption: 'The game and the side panel that logs every decision and tool call',
				},
			],
			screenshotsTitle: 'Screenshots',
		},
	},
	{
		title: 'FollowSpot',
		shareTitle: 'FollowSpot: A teleprompter that listens, running Whisper locally',
		description:
			"A voice-following teleprompter that runs in the browser and listens with a local whisper.cpp model. Read your script out loud and the highlight follows you, through flubs, skips, and ad-libs. You pick the model, the audio never leaves your machine, and the column centers over the camera lens so nobody can see your eyes reading. I built it because I can't memorize lines.",
		image: '/images/blog/followspot-local-whisper-teleprompter/hero.webp',
		video: '/images/blog/followspot-local-whisper-teleprompter/demo.mp4',
		imageAlt:
			'FollowSpot highlighting the current word of a bread recipe script as it scrolls, with dimmed words already read',
		date: '2026-09',
		tech: ['JavaScript', 'whisper.cpp', 'Whisper', 'Web Audio', 'Bash'],
		sourceUrl: 'https://github.com/JoeKarlsson/followspot',
		blogUrl: '/blog/followspot-local-whisper-teleprompter/',
		page: {
			slug: 'followspot',
			tagline: 'A teleprompter that listens, running Whisper on your own machine.',
			intro: [
				'Read your script out loud and the highlight follows you. Skip a sentence, flub a word, or ad-lib a little and it keeps going. Stop talking and it stops too.',
				"The listening is a whisper.cpp model you choose, served on `127.0.0.1`, so your audio never leaves your laptop. I built it because I have the energy of a theater kid and can't memorize lines, and the prompter apps I had didn't let me pick the model or set up the screen the way I wanted.",
				'If you record with Screencast Director while FollowSpot is open, the draft edit keeps only your last take of each script line.',
			],
			steps: [
				{
					title: 'Listen',
					text: "Every quarter second, while you're talking, the page sends the last 3.5 seconds of audio to a local `whisper-server`.",
				},
				{
					title: 'Match',
					text: "The transcript gets fuzzy-matched against the script around your place, so misheard words and ad-libs don't lose it.",
				},
				{
					title: 'Follow',
					text: 'The highlight moves and the page scrolls to keep your line at lens height. Click any word to jump there for a retake.',
				},
			],
			install:
				'brew install whisper-cpp\ngit clone https://github.com/JoeKarlsson/followspot.git && cd followspot\n./followspot download small.en\n./followspot download vad\n./followspot your-script.md',
			example: {
				lang: 'markdown',
				intro:
					'Scripts are plain Markdown. Stage directions are shown dimmed and never listened for:',
				code: "# Episode 12 notes (ignored)\n\n---\n\n*[Wide shot. Lights up.]*\n\nHey, welcome back. Today I'm going to show you something I built\nbecause I can't memorize lines.\n\n---\n\nShot list down here is ignored too.",
			},
			galleryTitle: 'Screenshots',
			galleryNote:
				'A wide column makes your eyes sweep on every line. A narrow one centered on the lens hides it.',
			gallery: [
				{
					poster: '/images/blog/followspot-local-whisper-teleprompter/column-wide.webp',
					alt: 'FollowSpot with a wide text column stretching most of the way across the screen',
					caption: 'Default: wide column',
				},
				{
					poster: '/images/blog/followspot-local-whisper-teleprompter/column-narrow.webp',
					alt: 'FollowSpot with a narrow text column centered on screen, three or four words per line',
					caption: 'How I run it: 30% column over the lens',
				},
			],
		},
	},
	{
		title: 'Screencast Director',
		shareTitle: 'Screencast Director: A screen recorder that does the boring part of the edit',
		description:
			'A macOS screen recorder that drafts the edit for me, because editing is the part of video I hate. I talk through a demo once, and it keeps the talking at real time, speeds up the typing, cuts the dead air, zooms on clicks and adds captions. Then I fix it on a timeline or ask an AI model to change it.',
		image: `${SD_DIR}/project-hero.webp`,
		video: `${SD_DIR}/sd-tour.mp4`,
		imageAlt:
			'The Screencast Director editor with my face filling the preview under a Joe Karlsson lower third, the camera framing and color inspector, and a timeline of clips, layouts and titles',
		date: '2026-10',
		tech: ['Swift', 'macOS', 'ScreenCaptureKit', 'whisper.cpp', 'Claude'],
		sourceUrl: 'https://github.com/JoeKarlsson/screencast-director',
		blogUrl: '/blog/screencast-director-screen-recorder/',
		page: {
			slug: 'screencast-director',
			tagline: 'A screen recorder that does the boring part of the edit.',
			intro: [
				"Screencast Director records your screen, mic and camera, then drafts the edit from one rule: while you're talking it plays in real time, typing without talking gets sped up, and silence gets cut. It zooms in where you click, captions what you said, and drops the retakes you mark.",
				"It's a native Swift app for Apple silicon Macs, and transcription runs on your machine with whisper.cpp. It's open source, and you can download the app from the latest GitHub release.",
			],
			steps: [
				{
					title: 'Record',
					text: 'Press ⌃⌥⌘R in any app and talk through your demo. If you flub a line, press ⌃⌥⌘M and say it again.',
				},
				{
					title: 'Draft',
					text: 'It transcribes you on your Mac and lines that up with when you clicked and typed, which decides what plays at real time, what speeds up and what gets cut.',
				},
				{
					title: 'Adjust or ask',
					text: 'Fix it on the timeline, or type "cut my retakes and zoom in when I mention the config".',
				},
			],
			galleryTitle: 'Clips',
			galleryNote: 'Recorded in the app. Hover to play.',
			gallery: [
				{
					video: `${SD_DIR}/sd-tour.mp4`,
					poster: `${SD_DIR}/sd-tour-poster.webp`,
					alt: 'Playing a recording, then clicking a clip, a layout and a title on the timeline, with the inspector switching to each one',
					caption: 'The editor',
				},
				{
					video: `${SD_DIR}/sd-ask.mp4`,
					poster: `${SD_DIR}/sd-ask-poster.webp`,
					alt: 'Typing a request into the Ask Claude box, a Claude is editing badge, then the edit landing on the timeline',
					caption: 'Ask Claude to change the edit',
				},
				{
					video: `${SD_DIR}/sd-timeline.mp4`,
					poster: `${SD_DIR}/sd-timeline-poster.webp`,
					alt: 'Clicking a dashed cut and pressing Restore, then setting a clip to 2x so it turns striped',
					caption: 'Restore a cut, change a speed',
				},
				{
					video: `${SD_DIR}/sd-ai-provider.mp4`,
					poster: `${SD_DIR}/sd-ai-provider-poster.webp`,
					alt: 'Hovering the AI provider options: Claude Code, Anthropic API, and OpenAI-compatible API',
					caption: 'Pick the AI provider',
				},
				{
					video: `${SD_DIR}/sd-camera.mp4`,
					poster: `${SD_DIR}/sd-camera-poster.webp`,
					alt: 'Dragging the camera zoom, Center on My Face, color presets, and switching to side by side',
					caption: 'Camera framing and color',
				},
				{
					video: `${SD_DIR}/sd-export.mp4`,
					poster: `${SD_DIR}/sd-export-poster.webp`,
					alt: 'Opening the Export menu, hovering every format, clicking Shorts and watching it render',
					caption: 'Export presets',
				},
			],
			screenshotsTitle: 'Editor',
			screenshots: [
				{
					poster: `${SD_DIR}/editor.webp`,
					alt: 'The Screencast Director editor with my face filling the preview under a Joe Karlsson lower third, the camera framing and color inspector, and a timeline of clips, layouts and titles',
					caption: 'The editor, with the Camera inspector open',
				},
			],
		},
	},
	{
		title: 'Data Structures & Algorithms in JS',
		description:
			'Common data structures and algorithms implemented in JavaScript. Created as teaching material when I was an instructor at DevLeague. Covers linked lists, trees, graphs, sorting, and more.',
		image: '/images/projects/data-structures/thumb-aafbf722.webp',
		imageAlt:
			'Three data structures drawn in chalk: a linked list of 3, 7 and 1 ending in null, a binary search tree with 8 at the root, and a stack with 5 being pushed on top',
		date: '2016-06',
		tech: ['JavaScript', 'Algorithms'],
		sourceUrl: 'https://github.com/JoeKarlsson/data-structures',
		stars: 185,
	},
	{
		title: 'Guide to Client-Server Communication',
		description:
			'Every way a client and server communicate - HTTP, WebSockets, SSE, GraphQL, gRPC, and more. A complete reference guide with examples.',
		image: '/images/blog/complete-guide-node-client-server-communication/thumb-8aa6bb2d.webp',
		imageAlt:
			'Three browser transports side by side, XHR polling, server-sent events and WebSocket, each a client and a server with hand-drawn arrows between them',
		date: '2016-07',
		tech: ['Node.js', 'HTTP', 'WebSockets', 'GraphQL', 'gRPC'],
		sourceUrl: 'https://github.com/JoeKarlsson/complete-guide-to-client-server-communication',
		blogUrl: '/blog/complete-guide-node-client-server-communication/',
		stars: 43,
	},
	{
		title: 'Movie Script Scraper',
		description:
			"A Node CLI and npm package that downloads movie scripts by genre from the Internet Movie Script Database. Tim Kendall started it in 2014; I rewrote it and published it to npm in 2018, and it's where Bechdel.io's scripts came from.",
		image: '/images/projects/movie-script-scraper.webp',
		imageAlt:
			'The Movie Script Scraper banner: "Movie Script Scraper" in white on red and teal stripes, with a film reel in the corner',
		date: '2018-01',
		tech: ['Node.js', 'Cheerio', 'npm', 'CLI'],
		sourceUrl: 'https://github.com/JoeKarlsson/movie-script-scraper',
		stars: 14,
	},
	{
		title: 'Python Sudoku Generator & Solver',
		description:
			'Generates unique Sudoku boards across 4 difficulty levels with a built-in solver using backtracking.',
		image: '/images/projects/sudoku-generator/thumb-8186e4ea.webp',
		imageAlt:
			'A Sudoku board drawn in chalk solving itself: the solver fills the blank cells in pink, a few at a time, as the count climbs from 30 to 81 and the board reads Solved',
		date: '2015-04',
		tech: ['Python', 'Algorithms', 'Backtracking'],
		sourceUrl: 'https://github.com/JoeKarlsson/python-sudoku-generator-solver',
		stars: 90,
	},

	{
		title: 'Adult Swim Bumper',
		shareTitle: 'Adult Swim Bumper: Adult Swim-style bumpers for your Plex server',
		description:
			'A CLI tool for generating [adult swim]-style pre-roll bumpers for your personal media server. Define bumpers in YAML, drop in background video clips and music, and render MP4s ready to load into Tunarr. White text cards, fading audio, your server name in brackets at the end - the whole bit.',
		image: '/images/blog/adult-swim-bumpers-plex-pre-rolls/hero.webp',
		video: '/images/blog/adult-swim-bumpers-plex-pre-rolls/hero.mp4',
		imageAlt:
			'A jellyfish drifting in dark blue water with white text reading "no idea what you should watch."',
		date: '2026-05',
		tech: ['Python', 'ffmpeg', 'Plex', 'NeXroll', 'CLI', 'YAML'],
		sourceUrl: 'https://github.com/JoeKarlsson/adult-swim-bumper',
		blogUrl: '/blog/adult-swim-bumpers-plex-pre-rolls/',
		page: {
			slug: 'adult-swim-bumper',
			tagline: 'Adult Swim-style bumpers for your Plex server.',
			intro: [
				'A small Python CLI that turns a few lines of YAML into ten-second bumpers: plain white text over a background clip, some music underneath, and your server name in brackets at the end. Exactly like the ones I stayed up way too late watching on Adult Swim.',
				'I built it for Joeflix, the Plex server I run for friends and family. 121 of these play in rotation before movies now, and people who join the server bring them up all the time.',
			],
			steps: [
				{
					title: 'Write the jokes',
					text: 'Each bumper in `bumpers.yaml` gets a name, two to four text cards, a background clip, and a music track.',
				},
				{
					title: 'Render',
					text: '`bumper render` builds an MP4 for every new bumper with ffmpeg and adds `[yourserver]` as the last card.',
				},
				{
					title: 'Play them before movies',
					text: 'Drop the output folder into NeXroll, or any pre-roll manager, and it shuffles them before every movie.',
				},
			],
			install:
				'pipx install git+https://github.com/joekarlsson/adult-swim-bumper.git\nbumper init\nbumper render',
			example: {
				lang: 'yaml',
				intro: 'A bumper is just a few lines of YAML:',
				code: "- name: hotdish\n  cards:\n    - 'a hotdish'\n    - 'is just a casserole'\n    - 'made with more intention.'\n  video: videos/hotdish.mp4\n  music: music/ambient-01.mp3",
			},
			galleryTitle: 'Output',
			galleryNote: 'A few from Joeflix. Hover to play, or use the controls.',
			gallery: [
				bumperClip(
					'hotdish',
					'Close-up of a bubbling hotdish while white text cards read "a hotdish" then "is just a casserole" then "made with more intention." and finally "[joeflix]"',
				),
				bumperClip(
					'st-paul',
					'An aerial view of downtown St. Paul while white text cards read "St. Paul" then "has always let Minneapolis" then "have the attention." then "we don\'t mind." and finally "[joeflix]"',
				),
				bumperClip(
					'cold-in-minnesota',
					'Snowy Minnesota fields under a blue sky while white text cards read "when it gets very cold in Minnesota," then "everyone slows down" then "at the same time." then "there is something to that." and finally "[joeflix]"',
				),
				bumperClip(
					'bigger-hard-drive',
					'A lake covered in fallen autumn leaves while white text cards read "joe bought a bigger hard drive." then "for you." then "he didn\'t tell you." and finally "[joeflix]"',
				),
				bumperClip(
					'storage-94-percent',
					'A plain black screen with white text cards reading "storage is 94% full." then "everything is fine." and finally "[joeflix]"',
				),
				bumperClip(
					'twenty-two-dollars',
					'A plain black screen with white text cards reading "somewhere, someone is paying $22 a month." then "not you." then "enjoy." and finally "[joeflix]"',
				),
				bumperClip(
					'dear-joeflix-buffering',
					'A plain black screen with white text cards reading "dear joeflix, why is it buffering?" then "it isn\'t. i just checked." and finally "[joeflix]"',
				),
				bumperClip(
					'server-has-seen-things',
					'A plain black screen with white text cards reading "This server has seen things." then "Mostly Nicolas Cage." then "And regret." and finally "[joeflix]"',
				),
			],
		},
	},
	{
		title: 'Streamroll',
		shareTitle: 'Streamroll: Netflix-style intros for your own Plex, made by AI',
		description:
			'AI-generated custom pre-roll intros for Plex. Give it a theme and it chains Runway gen4_image to create a still, then gen4_turbo to animate it into a full video intro - VHS glitch, cinematic nature, neon outrun, whatever you want playing before your movie starts.',
		image: '/images/projects/streamroll.webp',
		video: `${STREAMROLL_DIR}/streamroll-outrun.mp4`,
		poster: `${STREAMROLL_DIR}/streamroll-outrun-poster.webp`,
		imageAlt:
			'A Streamroll intro in the neon outrun style: STREAMROLL in glowing pink and blue chrome letters over a dark grid, with "AI-generated pre-roll intros" underneath',
		date: '2026-05',
		tech: ['TypeScript', 'Runway ML', 'Plex', 'AI Video Generation'],
		sourceUrl: 'https://github.com/JoeKarlsson/streamroll',
		demoUrl: 'https://streamroll.vercel.app/',
		page: {
			slug: 'streamroll',
			tagline: 'Netflix-style intros for your own media server.',
			intro: [
				'Streamroll makes the short intro that plays before every movie on a home media server, like the Netflix "tudum" but for your own Plex. You type a name like Joeflix, pick a style, and about 30 seconds later you have an .mp4 to drop into Plex, Jellyfin or Emby as a pre-roll.',
				'It chains two Runway API calls. The first turns a prompt tuned to the style into a 1920x1080 title card, and the second animates that still into a 4 or 5 second clip. Each style picks its own image model, video model and length.',
				'There are no server-side keys: you bring your own Runway API key, so anyone can run it. You approve the logo before spending video credits, you can mix in your own audio right in the browser, and `Copy as script` gives you the Node.js code that made your clip.',
			],
			galleryTitle: 'Intros it made',
			galleryNote: 'Six styles, all from the name STREAMROLL. Hover to play.',
			gallery: [
				{
					video: `${STREAMROLL_DIR}/streamroll-outrun.mp4`,
					poster: `${STREAMROLL_DIR}/streamroll-outrun-poster.webp`,
					alt: 'STREAMROLL in glowing pink and blue chrome letters over a dark neon grid, with smoke drifting behind it',
					caption: 'Neon outrun',
				},
				{
					video: `${STREAMROLL_DIR}/streamroll-nature.mp4`,
					poster: `${STREAMROLL_DIR}/streamroll-nature-poster.webp`,
					alt: 'A gold film-reel-and-leaf logo above STREAMROLL in white, framed by ferns and leaves that sway',
					caption: 'Nature',
				},
				{
					video: `${STREAMROLL_DIR}/streamroll-prestige.mp4`,
					poster: `${STREAMROLL_DIR}/streamroll-prestige-poster.webp`,
					alt: 'STREAMROLL in red over vertical stripes of red and orange light on a dark background',
					caption: 'Prestige',
				},
				{
					video: `${STREAMROLL_DIR}/streamroll-streaming.mp4`,
					poster: `${STREAMROLL_DIR}/streamroll-streaming-poster.webp`,
					alt: 'STREAMROLL in bold red capitals glowing on black, like a streaming service logo sting',
					caption: 'Streaming service',
				},
				{
					video: `${STREAMROLL_DIR}/streamroll-vhs.mp4`,
					poster: `${STREAMROLL_DIR}/streamroll-vhs-poster.webp`,
					alt: 'STREAMROLL in blue and white on a pale blue VHS screen with tracking lines and a timecode in the corner',
					caption: 'VHS',
				},
				{
					video: `${STREAMROLL_DIR}/streamroll-adult-swim.mp4`,
					poster: `${STREAMROLL_DIR}/streamroll-adult-swim-poster.webp`,
					alt: 'White text on black reading [streamroll] and "ai generated pre-roll intros", in the style of an Adult Swim bumper',
					caption: 'Adult Swim bumper',
				},
			],
		},
	},
	{
		title: 'GPU-Accelerated Subtitle Generator',
		description:
			'A production subtitle generation pipeline using GPU-accelerated Whisper (faster-whisper) with NVIDIA CUDA. Features parallel workers, automatic language detection and translation, VRAM-aware scheduling, and time-of-day worker scaling to share GPU resources across services.',
		image: '/images/blog/building-a-gpu-accelerated-subtitle-generator/hero.webp',
		imageAlt: 'GPU Subtitle Generator Architecture',
		date: '2026-02',
		tech: ['Python', 'Whisper AI', 'CUDA', 'NVIDIA GPU', 'Bash'],
		blogUrl: '/blog/building-a-gpu-accelerated-subtitle-generator/',
	},
	{
		title: 'MikroTik Native API Client',
		description:
			"A from-scratch Python implementation of MikroTik's proprietary binary API protocol. Handles variable-length encoding, authentication, and sentence-based messaging for programmatic control of network infrastructure - bonding, DHCP, firewall rules, and more.",
		image: '/images/blog/implementing-mikrotik-binary-api-protocol-in-python/hero.webp',
		imageAlt: 'MikroTik API Client',
		date: '2026-03',
		tech: ['Python', 'Binary Protocol', 'MikroTik', 'Networking'],
		blogUrl: '/blog/implementing-mikrotik-binary-api-protocol-in-python/',
	},
];
