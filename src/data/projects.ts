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
	// A second, longer statement after the piece (Rose Hobart's 2017 joint statement),
	// kept as written while the intro carries Joe's own
	supporting?: { heading: string; text: string[] };
	// The technical half of an art piece, after the piece itself: a line or two and a
	// diagram (scripts/diagrams). A page with it lists the stack here, not up top
	made?: {
		text: string[];
		diagram?: { src: string; alt: string };
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
	// An animated diagram for the card on /work/ when there's no clip, in place of `image`,
	// which stays the project page's hero and share card (an animated WebP is neither)
	card?: { src: string; alt: string };
	// Plays over `image` (its poster) while the card is hovered or focused
	video?: string;
	// For a selected work: the second of `video` its slice of the /work/ hero reel starts at
	// (npm run media:reel)
	reelStart?: number;
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
		note: 'I spent most of these years making short videos on TikTok.',
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
// Each selected work's slice of the /work/ hero reel, in seconds; src/scripts/work-reel.ts
// names the piece on screen from it
export const REEL_SLICE_SECONDS = 2.4;
// Images cache for 30 days: a new cut needs a new name, or returning visitors see the old one
export const REEL_VIDEO = '/images/projects/selected-works-reel-2.mp4';

export const SELECTED_WORKS = ['Punc', 'Bechdel.io', 'Connect AI × DOOM'];

export const projects: Project[] = [
	{
		title: 'IoT Kitty Litter Box',
		shareTitle: 'IoT Kitty Litter Box: A litter box that weighs my cat every visit',
		description:
			'Welcome to the Internet of Toilets. An IoT-connected cat litter box built with a Raspberry Pi, weight sensors, and Node.js. Monitors usage patterns and sends notifications.',
		image: '/images/blog/an-introduction-to-iot-internet-of-toilets/og-iot-toilet.webp',
		imageAlt:
			'Clips of the IoT Kitty Litter Box from 2019: the finished wooden cabinet on angled legs, my black cat sitting on top of it, me fitting the side panel with the wiring, a laptop printing load cell readings as weight is pressed onto the plate, and my cat chewing on the load cells and breadboard',
		video: '/images/projects/iot-kitty-litter-box-2026-11.mp4',
		poster: '/images/projects/iot-kitty-litter-box-2026-11-poster.webp',
		date: '2019-09',
		tech: ['Raspberry Pi', 'Node.js', 'MongoDB', 'HX711'],
		sourceUrl: 'https://github.com/JoeKarlsson/iot-kitty-litter-box',
		demoUrl: 'https://kittylitter.joekarlsson.com/',
		blogUrl: '/blog/an-introduction-to-iot-internet-of-toilets/',
		stars: 25,
		page: {
			slug: 'iot-kitty-litter-box',
			tagline: 'An internet-connected litter box that weighs my cat every time he uses it.',
			introHeading: 'Artist statement',
			intro: [
				'My favorite things in life are cats, computers and crappy ideas, so I built an internet-connected litter box.',
				'Every time my cat steps in, the box weighs him, and the weight goes into a database, so I can follow his health and his bathroom habits over time without doing anything. I like that it sits right on the border between completely ridiculous and kinda genius.',
				'The post about it ends with "I hereby give you permission to make stupid stuff just for you."',
			],
			gallery: [
				{
					video:
						'/images/blog/an-introduction-to-iot-internet-of-toilets/stop_motion_intro-1024x683.mp4',
					poster:
						'/images/blog/an-introduction-to-iot-internet-of-toilets/stop_motion_intro-1024x683-poster.webp',
					alt: 'Stop motion of the finished litter box: a dark wooden cabinet on angled legs against a white wall',
					caption: 'The finished box',
				},
				{
					video: '/images/blog/an-introduction-to-iot-internet-of-toilets/load_cell_demo.mp4',
					poster:
						'/images/blog/an-introduction-to-iot-internet-of-toilets/load_cell_demo-poster.webp',
					alt: 'The box open with its white floor plate, and a laptop in front of it printing the load cell readings as weight is pressed onto the plate',
					caption: 'The load cells reading weight',
				},
				{
					video: '/images/blog/an-introduction-to-iot-internet-of-toilets/cat_eating_project.mp4',
					poster:
						'/images/blog/an-introduction-to-iot-internet-of-toilets/cat_eating_project-poster.webp',
					alt: 'My black cat chewing on the wires of the load cells and breadboard spread out on a table',
					caption: 'My cat, helping',
				},
			],
			galleryTitle: 'Clips',
			galleryNote: 'From the post. Hover to play.',
			made: {
				text: [
					"A Raspberry Pi reads four 50 kg load cells through an HX711 amplifier and a magnetic switch on the lid, and Node.js with Johnny-Five turns those into events. Each visit's weight goes to MongoDB Atlas. [The post](/blog/an-introduction-to-iot-internet-of-toilets/) walks through the wiring and the code.",
				],
				diagram: {
					src: '/images/blog/an-introduction-to-iot-internet-of-toilets/how-the-box-works.svg',
					alt: "How the litter box works: the scale under the box averages its last 20 readings, and when that passes the empty box plus a cat-sized weight it waits 10 seconds for the cat to settle, saves the cat's weight to MongoDB and recalibrates; lifting the lid trips a magnetic switch that logs a cleaning, and putting it back waits 10 seconds and recalibrates",
				},
			},
			lineage: [{ label: 'After it', title: 'Digital Graffiti Wall' }],
		},
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
			introHeading: 'Artist statement',
			intro: [
				"PixelPane is a dark mirror on the shelf next to my desk until its lights come on, and most of the time it just shows pixel art: a pumpkin in October, a snowman in December, tonight's moon in its real phase. It's an art project first, born from the 8-bit and 16-bit games I've been playing on emulators.",
				"What I love about that art is how much it does with almost nothing. There's enough room for a pumpkin with a face or a rain cloud, and not enough to look like a phone. Only a few things get to interrupt it, like ON AIR when my camera turns on or a yellow flash for the doorbell, and I keep that list short on purpose so a flash still means something. Then the art comes back.",
				'I pick everything that goes on it, and I only keep art someone drew at this size, because a video shrunk down to 32x32 turns to mush. Most of it comes from pixel artists who give their work away on OpenGameArt, itch.io and Kenney.',
			],
			tour: {
				video: `${PIXELPANE_DIR}/tour.mp4`,
				poster: `${PIXELPANE_DIR}/tour-poster.webp`,
				captions: `${PIXELPANE_DIR}/tour.vtt`,
				alt: 'A quick tour of PixelPane: me at my desk showing the web UI, the homelab stats, music and calendar scenes, the shadow box build, the GIF animator and live drawing',
			},
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
			made: {
				text: [
					'A 32x32 LED panel sits behind a 3D-printed grid and a two-way mirror in a shadow box, so every LED reads as a square pixel. A Raspberry Pi plays a Python playlist of GIFs and animated scenes, and every scene is a plugin, one Python file.',
					'Home Assistant pushes alerts and data to the board, and the board never reads back, so it needs no Home Assistant token. [The repo](https://github.com/JoeKarlsson/pixelpane) has the parts list, the printable grid and the installer.',
				],
				diagram: {
					src: `${PIXELPANE_DIR}/build-layers.svg`,
					alt: 'Side view of the inside of the shadow box: from the front, a two-way mirror, an optional diffuser, the 3D-printed light grid, the LED panel facing forward, then the Raspberry Pi with the RGB Matrix HAT and a 5 V 4 A power supply',
				},
			},
			lineage: [{ label: 'Grew out of', title: 'Digital Graffiti Wall' }],
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
			introHeading: 'Artist statement',
			intro: [
				'A postcard rack is a gold wire tower of little pockets, each one sized for a stack of postcards. I bought one secondhand. I love using vertical space for plants, and the pockets turned out to be about the right shape for a small pot.',
				"So I drew a pot that hangs where the postcards used to go and printed enough to fill the rack. Each one drains into the pot below it, so I water the top pot and the whole tower gets it. That's my favorite part.",
				"It started with a small succulent in every pocket. Three or four years later it's mostly spider plants, and you can barely see the rack. It looks best in winter, when everything outside is dead and there's a green tower next to my window.",
			],
			tour: {
				video: `${PLANTER_DIR}/tour.mp4`,
				poster: `${PLANTER_DIR}/tour-poster.webp`,
				captions: `${PLANTER_DIR}/tour.vtt`,
				alt: 'A quick tour of my postcard rack planter: me in front of it, the 3D-printed pots in the wire frame, how water drains from pot to pot, and the whole rack by the window',
			},
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
			made: {
				text: [
					'I drew the pot in Tinkercad, which is about as simple as 3D modeling gets: an angled box that sits in a wire pocket the way a stack of postcards would. I printed them in black ABS on my Prusa MK3, and after years of wet soil next to a sunny window they look about the same as the day I printed them.',
					"The file is free on Thingiverse. Your rack's pockets probably aren't the same size as mine, so measure one and scale the model before you print a whole set.",
				],
				diagram: {
					src: '/images/blog/from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack/how-the-tower-waters.svg',
					alt: 'How the planter tower waters itself: pots drawn in Tinkercad and printed in black ABS on a Prusa MK3 hang one above the other in a secondhand wire postcard rack, and water poured into the top pot drips through holes in each pot into the one below, all the way down the tower',
				},
			},
			lineage: [{ label: 'Also 3D-printed', title: 'PixelPane' }],
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
			install:
				'git clone https://github.com/JoeKarlsson/react-spotify-player.git\ncd react-spotify-player\n# add http://localhost:3001 as a Redirect URI on your Spotify app,\n# and put its Client ID in src/config/spotify.js\nnpm install\nnpm run dev',
			made: {
				text: [
					"The login link sends you to Spotify, and Spotify sends you back with an access token in the URL, which the app keeps in your browser. Every 5 seconds it asks the Web API's `/me/player` endpoint what's playing, and when the token expires it asks you to log in again.",
				],
				diagram: {
					src: '/images/projects/react-spotify-player/how-the-player-keeps-up.svg',
					alt: "How React Spotify Player keeps up with what you're playing: the Login with Spotify link sends you to Spotify Accounts to approve three scopes, Spotify sends you back with a token that the player keeps in your browser, and every 5 seconds the player asks the Web API's /v1/me/player what's playing, until a 401 sends you back to log in",
				},
			},
		},
	},

	// Web - Digital Graffiti Wall
	{
		title: 'Digital Graffiti Wall',
		shareTitle: 'Digital Graffiti Wall: A canvas a whole room paints at once, on real LEDs',
		description:
			'An interactive art installation where audience members draw on a shared digital canvas that displays their creations in real-time on a physical RGB LED grid. Uses MongoDB Realm for instant cross-client data sync. Since retired and replaced by PixelPane.',
		image: '/images/blog/building-a-real-time-digital-graffiti-wall/hero.webp',
		imageAlt: 'Digital Graffiti Wall',
		card: {
			src: '/images/projects/digital-graffiti-wall/thumb-b8387025.webp',
			alt: 'A 32 by 32 LED wall lighting up pixel by pixel as people draw a heart, a smiley face and the word HI, with a live count of pixels drawn',
		},
		date: '2020-10',
		tech: ['JavaScript', 'MongoDB Realm', 'RGB LEDs', 'Real-Time Sync'],
		blogUrl: '/blog/building-a-real-time-digital-graffiti-wall/',
		sourceUrl: 'https://github.com/JoeKarlsson/digital-graffiti-wall',
		page: {
			slug: 'digital-graffiti-wall',
			tagline:
				'A shared 32x32 canvas that everyone in the room paints at once, shown on a real LED grid.',
			introHeading: 'Artist statement',
			intro: [
				'At a tech talk, the audience mostly sits there and types questions into a chat. I wanted everyone in the room to make something together instead, so I built a wall they could all paint on at once.',
				"You open a link on your phone, pick a color and draw on a small grid, and every pixel shows up on everyone else's screen and on a real LED grid. There are no accounts, and if two people paint the same pixel, the last one wins. The best part was watching a room organize itself: someone starts drawing a shape and others join in, or groups fight over the corners. A 32x32 grid forces creativity in a way a blank whiteboard never would.",
			],
			made: {
				text: [
					'The canvas is a 32x32 grid of plain HTML divs in eight colors, and each pixel is one document in MongoDB with a color and an x, y coordinate. You sign in anonymously through MongoDB Realm, your pixel changes color right away and the write goes out behind it, and every screen and the LED grid read the whole grid again every 5 seconds. [The post](/blog/building-a-real-time-digital-graffiti-wall/) has the code.',
				],
				diagram: {
					src: '/images/blog/building-a-real-time-digital-graffiti-wall/architecture.svg',
					alt: 'How the wall works: the canvas in the browser writes pixels through the MongoDB Realm SDK with anonymous sign-in to MongoDB Atlas, which holds 1,024 pixel documents, and a microcontroller reads that state and lights the LED matrix',
				},
			},
			lineage: [
				{ label: 'Before it', title: 'IoT Kitty Litter Box' },
				{ label: 'Led to', title: 'PixelPane' },
			],
		},
	},
	{
		title: 'Wave Jump',
		shareTitle: 'Wave Jump: A two-player race on a wave that never holds still',
		description:
			'A race for two people on one keyboard, set on an 80s sunset grid. You both ride a white wave that never stops rolling, and the first one to dive through the checkered gate scores.',
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
			introHeading: 'Artist statement',
			credit: 'with Cal Carlson, Daniel Olson and Lisa Mabley',
			intro: [
				'Wave Jump is a race for two people sharing one keyboard. You each ride a white wave across an 80s sunset grid, and whoever dives through the checkered gate first gets the point.',
				'The wave never holds still, and you never get the same one twice, so nobody gets to learn the course.',
			],
			embedUrl: 'https://wavejump.joekarlsson.com/',
			// The game scales its 1920x1080 world to fit, so it runs at the box's real size
			embedHeight: '56.25cqw',
			embedNote:
				'Click the game to start. Player 1 uses W A S D, player 2 the arrow keys. It starts muted here; the buttons in the corner turn sound on and go full screen.',
			made: {
				text: [
					'The wave is 964 small sprites, and every frame each one gets a new up-and-down speed from a sine curve, with a random strength rolled for the whole wave. We built it in Phaser over the weekend of January 26 to 28, 2018. In 2025 I moved it to a modern build so it still runs in a browser, and in November 2026 I tuned it again: it plays the same in any size window, the wave holds you up even on a slow computer, and it goes full screen.',
				],
				diagram: {
					src: '/images/projects/wave-jump/how-the-wave-moves.svg',
					alt: "How Wave Jump's wave works: 964 small sprites across the screen, each given a new up-and-down speed every frame from a sine curve with a random strength, which both players ride, dive through and race to the gate for a point",
				},
			},
			lineage: [{ label: 'Before it', title: 'Go Home Tanuki' }],
		},
	},
	{
		title: 'Go Home Tanuki',
		shareTitle: "Go Home Tanuki (You're Drunk): A Global Game Jam game about the ride home",
		description:
			'A tanuki who works, drinks and goes home, every night. Fly him home through the dark and grab sake on the way. The drunker he gets, the higher you score, and the faster everything comes at you.',
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
			introHeading: 'Artist statement',
			credit: 'with Kent Salcedo, Sarah Kurisu and Corina',
			intro: [
				'A lot of office workers know this ritual: work late, go drinking with your coworkers, get home somehow, and do it again tomorrow. Go Home Tanuki is based on the long hours that are common in Japanese office jobs, and its worker is a tanuki, the raccoon dog from Japanese folklore.',
				'You fly him home through the night past clouds and rocks. Sake makes him drunker, and the drunker he gets, the higher you score, so the game pays you for the part of the night that wrecks him. Get him drunk enough and the night starts coming at you faster.',
				'He never gets home. A run ends when he hits a cloud or a rock, and the title screen puts him back at the bar, slumped over while his phone rings to tell him to come home.',
			],
			embedUrl: 'https://tanuki.joekarlsson.com/',
			// The game is 4:3 and scales to fit, so the box matches it and it runs at real size
			embedHeight: '75cqw',
			embedNote:
				'Click the game to start, then click or press the spacebar to fly. It starts muted here; the buttons in the corner turn sound on and go full screen.',
			made: {
				text: [
					'We made it over one weekend in Phaser. In 2025 I moved it to a modern build so it still runs in a browser, and in November 2026 I tuned it again: it fits any screen, plays on phones, keeps your high score and goes full screen.',
				],
				diagram: {
					src: '/images/projects/go-home-tanuki/how-a-run-scores.svg',
					alt: 'How a run of Go Home Tanuki scores: drunkness starts at 5, sake adds 1 or 3, he sobers up by 1 every 3 seconds, at 10 the lamps and clouds speed up for the rest of the run, and when he hits a cloud or rock the score is drunkness times seconds, plus 10 per meter, plus a combo bonus',
				},
			},
			lineage: [{ label: 'Next game jam', title: 'Wave Jump' }],
		},
	},
	{
		title: 'PostStream',
		shareTitle: 'PostStream: A text-only social network with the metrics taken out',
		description:
			'A text-only social network with the usual levers taken out: no like counts, no follower counts, no trending topics and no images.',
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
			introHeading: 'Artist statement',
			credit: 'with Ray Farias and Jacoby Young',
			intro: [
				"Every social network puts a number on everything you post: likes, followers, shares, what's trending. PostStream is an undesigned social network, built without any of them.",
				"Most of the work was deciding what to leave out. It shows no like counts and no follower counts, so you can't see how popular anyone is. There's no global feed, no trending topics and no news to browse, and you can't post images, video or GIFs.",
				"Ben Grosser's Facebook Demetricator, a browser extension from 2012, hides the like and friend counts on Facebook, and PostStream was built without them in the first place.",
				"Replies work the same way. You don't write them, you pick one: agree, disagree, agree or disagree because of something, tell me more about something, thank you for sharing, or brilliant.",
			],
			embedUrl: 'https://poststream.joekarlsson.com/',
			embedOnPhones: true,
			embedHeight: '640px',
			embedHeading: 'Try it',
			embedNote:
				"This is the archived demo, running right here. You're signed in as a sample visitor and the other people are simulated, so write a post and someone will answer.",
			made: {
				text: [
					'The stream shows the first 256 characters of each post, with a read more that goes up to 2,048. Most of the reply choices never got built in 2016. I finished them in November 2026, along with the feed that only shows people you follow.',
					'Someone else owns poststream.io now. The archived copy at poststream.joekarlsson.com has no server: it runs in your browser, signs you in as a sample visitor, and a few made-up people keep posting while you look around. Anything you post stays in your browser.',
					'The full app is React on a Node and Express server with PostgreSQL. The archive is the same React app with a stand-in that answers its requests inside your browser and keeps everything in `localStorage`. The sample people post or reply every 12 to 25 seconds, and someone answers your post within 6 to 14 seconds.',
				],
				diagram: {
					src: '/images/projects/poststream/two-backends.svg',
					alt: "How PostStream runs two ways: the same React app asks /post and /auth either of two ways, the full app's Express server answers from PostgreSQL, and the archived demo's stand-in answers inside the page from your browser's localStorage, signs you in, and has a sample cast post or reply every 12 to 25 seconds",
				},
			},
			lineage: [
				{
					label: 'Also with Ray',
					title: 'Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon',
				},
			],
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
		demoUrl: 'https://corners.joekarlsson.com/',
		page: {
			slug: 'nothing-but-corners',
			tagline: 'The DVD screensaver with the boring parts taken out.',
			introHeading: 'Artist statement',
			intro: [
				'Everybody has watched the DVD screensaver, and nobody made it for anyone to watch. It existed to keep a TV left on from burning the logo into the screen. Somehow whole rooms of people ended up watching it drift toward a corner and groaning when it missed by a few pixels, which was almost every time.',
				'I called my version Nothing But Corners, because that\'s all it does. I aim every bounce, so the logo lands in a corner every single time. Click and you get another logo, then another, until the screen fills up with logos landing in corners. Turn the sound on and every corner gets a thump and a cheer, kids yelling "yay" or a round of applause.',
				"Cory Arcangel's Super Mario Clouds hacked a Mario cartridge until only the scrolling sky was left. Both pieces take software everybody already knows and remove part of it.",
				'You were waiting for something else when you watched the real one, a movie to start or someone to find the remote, and it happened to be on. Mine has nothing to wait for, and every logo hits.',
			],
			embedUrl: 'https://corners.joekarlsson.com/',
			embedOnPhones: true,
			embedHeading: 'Watch it',
			embedNote: 'Click inside to add another logo.',
			made: {
				text: [
					'Aiming a bounce took a lot more math than a joke should need. I unfold the screen into a grid of mirrored copies, so a path that bounces off the walls becomes a straight line, then aim that line at a corner in the grid and throw out any path that touches a wall too close to a corner. [The code is on GitHub](https://github.com/JoeKarlsson/nothing-but-corners).',
				],
				diagram: {
					src: '/images/projects/nothing-but-corners/how-it-aims.svg',
					alt: 'How Nothing But Corners aims the logo: the screen mirrored into a grid where one straight line, three screens across and two up, folds back into three bounces that end in a corner, and any bounce within a quarter of the screen of a corner is thrown out',
				},
			},
			lineage: [{ label: 'Also takes something away', title: 'Punc' }],
		},
	},
	{
		title: 'Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon',
		shareTitle: 'Stupid Shit No One In Hawaii Needs Hackathon: Building things nobody needs',
		description: 'A one-day hackathon in Honolulu for projects with no value whatsoever.',
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
			introHeading: 'Artist statement',
			credit: 'with Ray Farias',
			intro: [
				'Most hackathons are sponsored by a company that wants something back: free development work, developers using its product, or new hires. A lot of them also run on the idea that four hackers and 48 hours can fix climate change or homelessness.',
				'The Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon did the opposite. It was one day in Honolulu for projects with no value whatsoever, open to programmers, hardware hackers, artists, musicians and, according to the site, space whales. We stole the idea from the Stupid Hackathon in New York because we wanted to bring that hacker anarchist fun down to Hawaii. There were no corporate sponsors, and the prizes went to the stupidest ideas.',
				"People built a Chrome extension that switches every font to Comic Sans and breaks every link, an Alexa that has had enough of your shit, a cardboard laptop and smartphone, a 3D-printed rubber duck keycap to talk to when you're stuck, and an official survey with the worst UX we could manage that never ends. Everyone there was building for the joy of making something, not for profit or glory.",
			],
			made: {
				text: [
					"Ray started the site and I styled it. It's plain HTML on GitHub Pages, and it links out to the other Stupid Hackathons around the world. Hackathon projects usually disappear the Monday after, so once it was over I filled in every entry, the winners and the names of everyone who built them, and the site is also the record of that day.",
				],
			},
			lineage: [
				{ label: 'Made there', title: 'App-All-O-Gizer' },
				{ label: 'Also with Ray', title: 'PostStream' },
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
			introHeading: 'Artist statement',
			intro: [
				"Sometimes you hurt people and don't even know it, so the pitch for App-All-O-Gizer is to apologize on a schedule, once a month, once a week or every day, and cover yourself either way.",
				'You type in someone\'s email address and click Send Email, and they get one of 13 apologies picked at random. They range from missing an anniversary to peeing the bed to murder, and every one signs off with "Email sent by appallogizer.com".',
				'One of them reads: "It was a total freak accident that I murdered that guy last week. I hope that you will find it in your heart to forgive me for my heinous crime against humanity."',
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
			made: {
				text: [
					"It's a small Express app that sends the email through Gmail with Nodemailer. The site is offline now, so the clip is the demo GIF from the project's README.",
				],
				diagram: {
					src: '/images/projects/app-all-o-gizer/how-it-sends-an-apology.svg',
					alt: "How App-All-O-Gizer sends an apology: you type someone's email address and click Send Email, the Express server picks one of 13 apologies at random and sends it through Gmail with Nodemailer straight to their inbox, and the monthly, weekly or daily schedule with node-cron was never built",
				},
			},
			lineage: [
				{
					label: 'Made at',
					title: 'Stupid Shit No One In Hawaii Needs and Terrible Ideas Hackathon',
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
		card: {
			src: '/images/projects/best-buy-product-locator/thumb-e2af6242.webp',
			alt: 'A product page for a Sony 48-inch TV has its model number read, Best Buy stores within 15 miles appear on a map, the nearest in Richfield is picked, and a banner reads Pick it up today at Best Buy Richfield, $449.99',
		},
		date: '2018-09',
		tech: ['React', 'styled-components', 'Chrome Extension', 'Best Buy API'],
		sourceUrl: 'https://github.com/JoeKarlsson/best-buy-product-locator-chrome-extension',
		page: {
			slug: 'best-buy-product-locator',
			tagline: 'Two-day shipping too slow for you?',
			credit: 'with Eric Moore',
			intro: [
				"The Best Buy Product Locator is a Chrome extension for when you're shopping on Amazon, Walmart or Target and want the thing today. It looks up the product you're browsing in Best Buy's catalog and tells you whether the Best Buy nearest you has it for pickup.",
				"If there's a match, a banner drops across the top of the page with Best Buy's price, the store, its hours that day and a button to buy it on BestBuy.com. The toolbar popup shows the same thing.",
			],
			made: {
				text: [
					"I built it in 2018, in React with styled-components, and Best Buy never had anything to do with it. It's gone from the Chrome Web Store now, and it's built on Manifest V2, which current Chrome won't load, so the screenshot from 2018 is the only look at it working.",
					"It's a Chrome extension written in React. It looks for a model number or UPC for 3 seconds before falling back to the title, then asks the Best Buy API for that product and for stores within 15 miles of you, and picks the nearest Big Box store. I last touched it in January 2019, so it still expects those sites' 2019 page layouts.",
				],
				diagram: {
					src: '/images/projects/best-buy-product-locator/how-it-finds-a-store.svg',
					alt: 'How the Best Buy Product Locator finds a store: on Amazon, Walmart or Target it reads the model number from the spec table, or the UPC on Target, and searches by title if it finds no code in 3 seconds; it asks the Best Buy API for the product, then for stores within 15 miles of you, picks the nearest Big Box store, and shows a banner on the page and the same in the toolbar popup with a badge',
				},
			},
		},
	},
	{
		title: 'GAPTCHA',
		shareTitle: 'GAPTCHA: An augmented reality scavenger hunt from a 2017 hackathon',
		description:
			'An augmented reality scavenger hunt. Scan a printed marker and a 3D arrow points you toward a hidden checkpoint.',
		image: '/images/projects/gaptcha-scan.webp',
		imageAlt:
			"GAPTCHA's demo playing itself: a hunter near the Honolulu checkpoint scans three markers, dashed lines from each marker cross on the map, the hunter heads to where they cross and the page says GOT 'EM, while a feed lists the simulated hunters' scans",
		video: '/images/projects/gaptcha-2026-11.mp4',
		poster: '/images/projects/gaptcha-2026-11-poster.webp',
		date: '2017-03',
		tech: ['Node.js', 'Express', 'A-Frame', 'AR.js', 'Leaflet', 'AT&T M2X'],
		sourceUrl: 'https://github.com/JoeKarlsson/GAPTCHA',
		demoUrl: 'https://gaptcha.joekarlsson.com/',
		page: {
			slug: 'gaptcha',
			tagline: 'Find, scan, win',
			credit: 'with Sean Nakamura, Tony Gaskell, Brandon Baris and Joelle Torneros',
			intro: [
				"GAPTCHA (Geo-Augmented Place That Checks Authenticity) is an augmented reality scavenger hunt. We printed square markers and left them around for people to find. Scan one with the web app and a green 3D arrow shows up over your camera view, pointing at a hidden checkpoint. An arrow gives you a direction but not a distance, so the idea is to collect bearings from a few markers and walk to where they cross. When you think you're standing on it, you tap Did I Win.",
				'Near the original spot in Honolulu you hunt the hackathon checkpoint. Anywhere else, it hides a demo checkpoint 100 to 300 meters from you, and a live feed shows simulated hunters playing alongside you.',
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
			made: {
				text: [
					"We built it at AT&T's hackathon in Honolulu in March 2017. My part was the server, the direction math and the homepage: an Express route that took your phone's position and worked out the bearing to the checkpoint with the Vincenty formula, and a live map from AT&T M2X, which also held the checkpoint so it could move during the game. Heroku and M2X are long gone, so in November 2026 I moved the checkpoint logic into the browser.",
					"AR.js finds the printed marker in the camera, and the browser works out the compass bearing from your GPS position to the checkpoint and turns the arrow toward it. Everything runs in your browser now: the checkpoint, your tries and your last 50 scans live in local storage, and Did I Win checks whether you're within 20 meters.",
				],
				diagram: {
					src: '/images/projects/gaptcha/how-a-hunt-works.svg',
					alt: "How a GAPTCHA hunt works: you scan a printed marker facing north, your phone's location and the checkpoint give a compass bearing, a green 3D arrow on the marker turns to it, and after scanning a few markers you walk to where the arrows cross and tap Did I Win, which wins within 20 meters",
				},
			},
		},
	},
	{
		title: 'Pixelate',
		shareTitle: 'Pixelate: Turn any image into blocks in the browser',
		description:
			'A small web app that turns any photo into big square pixels. Pick a photo, drag the slider to set the block size, and save it as a PNG. Nothing gets uploaded.',
		image: '/images/projects/pixelate-2026-before-after.webp',
		imageAlt:
			'Pixelate: picking a selfie of me in sunglasses holding a pink soft-serve cone at a fair, then dragging the block size slider from 2px up to 90px and back down to 30px as the photo goes from sharp to big blocks of color',
		video: '/images/projects/pixelate-2026-11.mp4',
		poster: '/images/projects/pixelate-2026-11-poster.webp',
		date: '2015-04',
		tech: ['JavaScript', 'HTML5 Canvas'],
		sourceUrl: 'https://github.com/JoeKarlsson/Pixelate',
		demoUrl: 'https://pixelate.joekarlsson.com/',
		blogUrl: '/blog/how-to-pixelate-images-with-html5-and-javascript/',
		stars: 15,
		page: {
			slug: 'pixelate',
			tagline: 'Pick a photo, drag the slider.',
			introHeading: 'Artist statement',
			intro: [
				"Pixelate turns any photo into big square blocks, and the photo never leaves your phone or computer. Drag the slider and the picture gives up its detail a little at a time, until it's a grid of colors.",
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
			made: {
				text: [
					"The 2015 version had no pixel math in it. You pasted in an image's URL, it drew the picture at a few percent of its size, and it stretched the tiny copy back up with image smoothing turned off, so the blur you'd normally get came out as hard squares. In November 2026 I rebuilt it to work on your own photo, with each block the exact average of the pixels under it.",
					"Each block is one color, the exact average of the pixels under it, worked out on a copy of your photo no bigger than 2,000 pixels a side so the slider stays quick. I stretch that small grid back up with smoothing turned off, and Save PNG writes it at your photo's full size.",
				],
				diagram: {
					src: '/images/projects/pixelate/how-pixelate-blocks-a-photo.svg',
					alt: "How Pixelate turns a photo into blocks: your photo stays on your device, Pixelate works on a copy no bigger than 2,000 pixels on its longest side, the slider sets the block size from 1 to 120 pixels, each block becomes the average color of the pixels under it, the grid is stretched back up with smoothing off so the blocks stay square, and Save PNG writes it at the photo's full size",
				},
			},
			lineage: [{ label: 'Next pixel project', title: 'Digital Graffiti Wall' }],
		},
	},
	{
		title: 'Night Out',
		shareTitle: 'Night Out: Vote with your friends on where to go tonight',
		description:
			'Vote with your friends on where to go tonight. It finds the bars near you, you pick the ones in the running, and everyone votes from a shared link.',
		image: '/images/projects/night-out-2026-pick.webp',
		imageAlt:
			"Night Out's demo playing itself: three real bars in Honolulu's Chinatown get picked on a dark map, the vote opens with a share link, and made-up friends vote until Black Shamrock Tavern is winning",
		video: '/images/projects/night-out-2026-11.mp4',
		poster: '/images/projects/night-out-2026-11-poster.webp',
		date: '2015-10',
		tech: ['Meteor', 'MongoDB', 'Vite', 'Leaflet', 'OpenStreetMap'],
		sourceUrl: 'https://github.com/JoeKarlsson/night-out',
		demoUrl: 'https://night-out.joekarlsson.com/',
		page: {
			slug: 'night-out',
			tagline: 'Where are we going tonight?',
			credit: 'with Jessie Copeland, Alex Anich, Brian "Boots" and Nolan "Skinny Fatman"',
			intro: [
				'Night Out is for the part of the evening where the group text goes in circles about where to go. Pick a few bars near you, send everyone the link, and let the group vote. When you vote, the link on your screen updates and you send the new one back to the group.',
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
			made: {
				text: [
					'The first version, in Meteor in 2015, asked Google Places for bars and pushed each vote to everyone live. In November 2026 I rebuilt it as a static site with no server. If two people vote on the same old link at once, the plan splits in two. A phone that opens both links merges them, but a bar they both voted for only counts once.',
					'Bars come from OpenStreetMap within 2.6 kilometers of you. The bars you pick and every vote are packed into the link after the #, so the link is the whole plan, and each vote page ranks the bars by votes.',
				],
				diagram: {
					src: '/images/projects/night-out/how-the-link-carries-the-vote.svg',
					alt: 'How Night Out runs a vote with no server: it finds bars on OpenStreetMap within 2.6 kilometers, you pick 2 to 12, the link itself holds the bars and the votes, each friend votes and sends the updated link back to the group, and every vote page ranks the bars by votes',
				},
			},
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
			made: {
				text: [
					'linger is plain HTML, CSS and about a hundred lines of JavaScript. Each poem lives in one file, where a plain word is always there, a word marked `^` comes when you pause, and a word marked `~` comes only if you stay. [The code is on GitHub](https://github.com/JoeKarlsson/linger).',
				],
				diagram: {
					src: '/images/projects/linger/how-linger-reads-you.svg',
					alt: 'How linger decides which words you get: it measures how fast you scroll; under 60 pixels a second every line on screen gathers time, between 60 and 700 nothing changes, and over 700 the lines lose time four times faster and go back to their plain words, and over 2,100 the page whispers slower; after 1.2 seconds the words marked with a caret fill in, and after 3.6 seconds the words marked with a tilde',
				},
			},
			lineage: [{ label: 'Before it', title: 'Punc' }],
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
		reelStart: 3,
		imageAlt:
			"Punc's site: the shelf of books shown as punctuation, then Alice's Adventures in Wonderland with 26,777 words removed and 8,076 marks left, and the book's punctuation laid out in reading order",
		date: '2016-02',
		tech: ['TypeScript', 'Canvas', 'SVG', 'PDF'],
		sourceUrl: 'https://github.com/JoeKarlsson/punc',
		demoUrl: 'https://punc.joekarlsson.com/',
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
					'The website and the TypeScript library count with the same code, so their numbers match. [The code is on GitHub](https://github.com/JoeKarlsson/punc).',
				],
				diagram: {
					src: '/images/projects/punc/how-punc-reads-a-book.svg',
					alt: "How Punc reads a book: a Project Gutenberg book with its license cut off, or your own text file read in your browser; the typography folded to plain quotes, hyphens and periods; every mark counted with its place, so Alice's Adventures in Wonderland drops 26,777 words and keeps 8,076 marks; then four views, Score, Spiral, Pages and Counts",
				},
			},
			lineage: [
				{ label: 'Before it', title: 'Bechdel.io' },
				{ label: 'After it', title: 'linger' },
			],
			embedUrl: 'https://punc.joekarlsson.com/',
			embedHeading: 'Read it',
			embedNote: 'Pick a book off the shelf, or bring your own.',
		},
	},
	{
		title: 'Rose Hobart',
		shareTitle: "Rose Hobart: Joseph Cornell's 1936 film, remastered for the web",
		description:
			"Joseph Cornell's 1936 collage film, with the tint, the speed and the music back in your hands while it plays.",
		image: '/images/projects/rose-hobart-2026-film-poster.webp',
		video: '/images/projects/rose-hobart-2026-film.mp4',
		imageAlt:
			"Rose Hobart in close-up from Joseph Cornell's 1936 film while the projector presets change it: Cornell blue, a pink filter, nitrate decay, a broken projector and digital decay, then amber and green gels",
		date: '2017-10',
		tech: ['Astro', 'TypeScript', 'WebGL2'],
		sourceUrl: 'https://github.com/JoeKarlsson/rose-hobart',
		demoUrl: 'https://rosehobart.joekarlsson.com/',
		stars: 2,
		page: {
			slug: 'rose-hobart',
			tagline: "Joseph Cornell's Rose Hobart, remastered for the web.",
			introHeading: 'Artist statement',
			credit: 'with Laurel Karlsson',
			intro: [
				'Every time Joseph Cornell screened Rose Hobart, it could come out a little different. He tinted it with a colored filter, ran it at the standard 24 frames a second or the slower 16, and paired it with whatever music he chose. At the 1936 premiere, Salvador Dalí stormed out, claiming Cornell had stolen the film from his subconscious.',
				"The version almost everyone watches now is one of those screenings, frozen. It's tinted blue, it runs at silent speed, and it plays two songs from a 1957 album, so nobody at the premiere heard that soundtrack.",
				'This gives the projector back to whoever is watching. You pick the gel, the speed and the music while the film plays, and you can age it like old nitrate or glitch it like a file copied too many times.',
			],
			supporting: {
				heading: 'Supporting statement',
				text: [
					"The first showing of Joseph Cornell's short film Rose Hobart is the stuff of legend. Famously, the film's 1936 premier ended with Salvador Dalí storming out, claiming that the film had been stolen directly from his subconscious (Pigott 5). Very little else is known about this original showing; Cornell would not show the film again for nearly thirty years. Currently, only one version of Rose Hobart continues to be circulated; this version comes from Cornell's 1960s showings, leaving the performative details of the premier shrouded in mystery (Pigott 21).",
					'Screenings of Rose Hobart were originally highly performative. In contrast to the currently available digital version which is “frozen” in time, several aspects of Cornell’s screenings were subject to change. First, the film was shown with a tinted filter. While the current version shows a deep blue tint being used, any number of colors could have been used in the other showings, with some evidence pointing to the use of a pink filter (Pigott 20). Second, the film was shown either at the standard 24 frames per second or 16 frames per second, also known as “silent speed” (Pigott 21). Today’s surviving version shows the film in the slightly slower “silent speed,” giving the short film a dreamier quality that is practically undetectable to the untrained eye. Lastly, due to the silence of the film itself, different music was paired with the film as it was shown. The version that remains today is paired with two jaunty tracks by Nestor Amaral and His Continentals, from their 1957 album Holiday in Brazil (Pigott 24). Because these songs were not released until 1957, it’s clear that different music was used in the original 1936 screening, and likely in other screenings as well. Unfortunately, there is no documentation of what that music might have been.',
					'This collaborative digital humanities project is an exploration of the lack of performativity in the current version available of Joseph Cornell’s Rose Hobart. It is an attempt to bring the performative aspects of screening Rose Hobart back to the film by allowing viewers to change the soundtrack, filter, speed, and other options as they view the film. Due to the digital nature of this project, it is by no means an attempt to perfectly imitate Cornell’s original screenings. Rather, it is an attempt to “unfreeze” the currently available version of Rose Hobart from its place in time.',
					'This project also emphasizes the digital nature of the film today. While there are physical copies of Rose Hobart available for viewing, the film is widely circulated online, which suggests that most viewers are accessing the film via the internet rather than through physical media. Due to the film’s transfer from physical to digital, signs of physical degradation of the film have been “frozen” or stopped in their tracks, bringing the film from the material film archive to the immaterial film archive (Baron 481). Jaimie Baron argues that both types of archive present viewers with a different experience of mediation: either bearing traces of the physical world or of digital technologies, both of which signal a relationship with the past (481). In order to simulate digital degradation, this project provides an option for viewers to blur and glitch the video, simulating the digital archival process that occurs when a digital video is damaged and continually copied.',
					'By bringing the performative aspects of screening Rose Hobart into the digital realm, we collapse the distinction between presenter and viewer. When the physical film was screened historically, viewers were in a strictly passive position, spectating at the mercy of the performative choices made by the presenter of the film. With this project, that distinction ceases to exist. The presenter of the film – the person responsible for making performative choices like tint color, music, and speed – is also the viewer.',
					'Rose Hobart cannot be discussed without addressing its primary subject matter: the actress Rose Hobart herself. Due to the film’s nearly obsessive focus on a female body that has been rendered silent, the film lends itself to feminist critique. It seems plainly obvious, as Janet Harbord argues, that “Cornell’s film plays on the beauty and emotional intensity of the star, Rose Hobart, given shape through rhythmic repetition of certain sequences” (69). Thus, does the film ask its viewers to admire the physical beauty of Rose Hobart? Critic Jodi Hauptman writes that through his film, Cornell “forces Hobart’s body to act as a voice . . . Such a collapse of distance between feelings and expression, body and mind, is another indicator of [the hysterical body of the woman]” (qtd. in Lowenstein). Is Rose Hobart the subject of the film, or is her body the subject of the film? By presenting a project that not only recognizes the degradation of the filmic image but also emphasizes it, we ask our viewers to consider how this changes the representation of Hobart’s feminine beauty as well as how this changes the film as a whole.',
					'Written with Laurel Karlsson. The full list of works consulted is on the supporting statement page of the project site.',
				],
			},
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
			made: {
				text: [
					'Viewers run the projector. Six presets, the gels, an Age dial from fresh print to nitrate rot and a Glitch dial from clean to datamoshed all feed one WebGL2 shader that repaints every frame. Speed switches between 16 frames a second, the silent speed of the surviving version, and 24, and the pitch drops with it. The music can be the film\'s 1957 records, eight public-domain 78s from 1919 to 1924, My Bloody Valentine\'s "Soon" or silence.',
				],
				diagram: {
					src: '/images/projects/rose-hobart/the-booth.svg',
					alt: "How the Rose Hobart booth works: you run the projector, and the presets, gels, Age dial and Glitch dial all feed one WebGL2 shader that repaints every frame, speed sets the playback rate at 16 or 24 frames a second with the pitch moving too, and music swaps in the film's 1957 records, eight 78s, one 1990 song or silence",
				},
			},
			lineage: [{ label: 'Also with Laurel', title: 'Bechdel.io' }],
		},
	},
	{
		title: 'Bechdel.io',
		shareTitle: 'Bechdel.io: Checking movie scripts against the Bechdel Test',
		description: 'Does your favorite movie pass the Bechdel Test?',
		image: '/images/projects/bechdel-io-2026-poster.webp',
		video: '/images/projects/bechdel-io-2026.mp4',
		reelStart: 3,
		imageAlt:
			'Bechdel.io: the headline "Do two women talk to each other about something other than a man?", the shelf of movie posters marked passes or fails, filtering to films that pass, then the Gone Girl page scoring 3 of 3 and its cast sized by lines spoken',
		date: '2015-11',
		tech: ['Node.js', 'NLP', 'JavaScript', 'MongoDB'],
		sourceUrl: 'https://github.com/JoeKarlsson/bechdel-test',
		demoUrl: 'https://bechdel.joekarlsson.com/',
		blogUrl: '/talks/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/',
		stars: 30,
		page: {
			slug: 'bechdel-io',
			tagline: 'Does your favorite movie pass the Bechdel Test?',
			introHeading: 'Artist statement',
			intro: [
				"Most people who hear about the Bechdel Test go looking for a movie they love that fails it, and a lot of them find one. The test comes from a 1985 strip in Alison Bechdel's comic Dykes to Watch Out For. A character says she'll only see a movie if it has two women in it, they talk to each other, and they talk about something besides a man, and the joke is that the last one she saw was Alien.",
				'Bechdel.io reads the screenplay and asks those three questions the same way for every film, including the ones you love. The whole original Star Wars trilogy fails, and so do The Godfather, Back to the Future and The Shawshank Redemption. They sit on the same shelf as the films that pass, under the same pass or fail tag.',
				"Counting has been a feminist tool for a long time. In 1989 the Guerrilla Girls counted the art at the Met and put the numbers on a poster: fewer than 5% of the artists in the modern art sections were women, but 85% of the nudes were female. Anyone can sit through one movie with a notebook and check it, and one failing movie is easy to wave off. Bechdel.io runs the same check across a director's career or a year of releases, where it gets a lot harder to call any one film an exception.",
				'We made it open source as feminist activism, so anyone can run the count on the movies they care about.',
			],
			credit: 'with Laurel Karlsson',
			made: {
				text: [
					'The scripts came from [Movie Script Scraper](https://github.com/JoeKarlsson/movie-script-scraper), and the cast from a film database API. [The 2015 write-up](/blog/bechdel-test-script-parser-works/) goes deeper.',
					"It has two weak spots. Words about men run all through English, and a keyword can't tell what a sentence is about. And it takes each character's gender from the film database, which credits everyone as an actor or an actress, so it can't see a trans or nonbinary character.",
				],
				diagram: {
					src: '/images/blog/bechdel-test-script-parser-works/parsing-method.svg',
					alt: 'How Bechdel.io reads a screenplay: it gets the cast and each credited gender from a film database, splits the script into scenes, and checks every scene with two or more women for words about a man',
				},
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
			'Ask Claude a business question and it builds a Doom level from the answer. Every monster is a live record from your apps, pulled through the CData Connect AI MCP server.',
		image: '/images/projects/connect-ai-doom.webp',
		video: '/images/projects/connect-ai-doom.mp4',
		reelStart: 5,
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
			introHeading: 'Artist statement',
			intro: [
				'Data is hard to look at. A database hands back rows, an AI agent hands back text, and the interesting parts, like which app the agent picked and where the system said no, happen in steps nobody sees.',
				"Connect AI × DOOM turns that into a level. Each app the agent searched becomes a room, every record it found is a monster, the urgent ones are pink demons, and the data it wasn't allowed to touch sits behind a red door with no key. Nobody needs a legend for any of it. Everyone already knows a monster is a problem and a locked door means no. I call that borrowed literacy: the game taught you how to read it decades ago.",
				"Doom has been a hacker's canvas since id Software released its source code in 1997, and people have run it on everything from a John Deere tractor to a conference badge. In 1999 [Dennis Chao turned Unix processes into Doom monsters](https://www.cs.unm.edu/~dlchao/flake/doom/), so shooting one killed the process. Connect AI × DOOM comes out of that tradition, where the joke gets you to look and a real system is underneath.",
				'You can walk up to the red door as many times as you want, and every time it asks again, live, and gets told no.',
			],
			credit: 'made at CData',
			// The game alone, built for blog posts: it fits the width and doesn't take focus
			embedUrl: 'https://cdatasoftware.github.io/connect-ai-doom/embed.html',
			// Its 4:3 game plus the logo strip above (52px) and the question below (84px)
			embedHeight: 'calc(75cqw + 136px)',
			embedNote:
				"Claude built this level from a demo company's Salesforce, Zendesk and Stripe. Click the game to take over.",
			made: {
				text: [
					'Claude Code runs headless with Connect AI as its only MCP server, picks the three apps that answer your question and writes one SQL query for each. Every query returns the same four columns, `Id`, `Label`, `Detail` and `Hot`, so any connector can become a room.',
					'A small bridge re-runs each room every 15 seconds, so the monsters match your data, and every call is read-only, so nothing in your apps changes. With `--claude-plays`, Claude also gets a [Doom MCP server](/blog/doom-mcp-server/) so it can play the level. [The full story](/blog/why-i-use-doom-to-visualize-mcp-data/) covers the booth and the build.',
				],
				diagram: {
					src: '/images/blog/why-i-use-doom-to-visualize-mcp-data/how-it-works.svg',
					alt: 'How Connect AI × DOOM works. You ask a question. Claude explores your apps through the Connect AI MCP server, with read-only tools only, and picks the three apps that answer it, here Salesforce, Zendesk and Stripe. What it finds becomes the level: each app becomes a room; each record becomes a monster, urgent ones are pink demons, and shooting one reads the record again, live; your permissions become keycards, blue for read only and yellow for read and write; and data Connect AI blocked, like a lookup by Social Security number, sits behind the red door, which has no key and gets refused again every time you try it.',
				},
			},
			lineage: [
				{ label: 'Before it', title: 'IoT Kitty Litter Box' },
				{ label: 'Also built for a crowd', title: 'Digital Graffiti Wall' },
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
			made: {
				text: [
					"Every quarter second, as long as you're talking, the page sends the last 3.5 seconds of audio to a whisper.cpp server on your own machine, with the last 30 words of the script as a hint for names. It matches the newest words it hears against the script around your place, and it only jumps back for a retake when at least 4 words match.",
				],
				diagram: {
					src: '/images/projects/followspot/how-followspot-listens.svg',
					alt: "How FollowSpot follows you: every quarter second, if your mic isn't quiet, it sends the last 3.5 seconds of audio and the last 30 script words to a local whisper.cpp server, matches the newest words it hears against the script near your place, moves the highlight to the last match and scrolls your line to lens height, backs up only on 4 or more matched words, drifts ahead slowly after 1.5 seconds without a match, and stops when you stop",
				},
			},
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
			made: {
				text: [
					'It records with ScreenCaptureKit and keeps a log of when you clicked and typed, never what you typed. When you stop, whisper.cpp transcribes you on your Mac, and the draft becomes one plan file you can change on the timeline or by asking Claude Code, the Anthropic API or any OpenAI-compatible model.',
				],
				diagram: {
					src: '/images/blog/screencast-director-screen-recorder/record-to-edit.svg',
					alt: 'How Screencast Director goes from recording to edit: a shortcut in any app records your screen, mic and camera plus a log of when you clicked and typed; when you stop, whisper.cpp transcribes you on your Mac and the draft edit plays talking in real time, speeds up typing and cuts silence, filler words and retakes; the result is one plan file of clips, zooms and captions that you change on the timeline or by asking an AI model',
				},
			},
		},
	},
	{
		title: 'Data Structures & Algorithms in JS',
		description:
			'Common data structures and algorithms implemented in JavaScript. Created as teaching material when I was an instructor at DevLeague. Covers linked lists, trees, graphs, sorting, and more.',
		image: '/images/projects/data-structures/thumb-bb1d89ad.webp',
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
		image: '/images/blog/complete-guide-node-client-server-communication/thumb-1d6d8b03.webp',
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
		shareTitle: 'Movie Script Scraper: Movie scripts by genre, as text files you can count',
		description:
			"A Node CLI and npm package that downloads movie scripts by genre from the Internet Movie Script Database. Tim Kendall started it in 2014; I rewrote it and published it to npm in 2018, and it's where Bechdel.io's scripts came from.",
		image: '/images/projects/movie-script-scraper.webp',
		imageAlt:
			'The Movie Script Scraper banner: "Movie Script Scraper" in white on red and teal stripes, with a film reel in the corner',
		card: {
			src: '/images/projects/movie-script-scraper/thumb-321bc530.webp',
			alt: 'The command movie-script-scraper --genre Horror --total 10 pulling scripts from IMSDb five at a time, each landing as a text file in scripts/Horror/ until 10 of 10 are saved',
		},
		date: '2018-01',
		tech: ['Node.js', 'Cheerio', 'npm', 'CLI'],
		sourceUrl: 'https://github.com/JoeKarlsson/movie-script-scraper',
		stars: 14,
		page: {
			slug: 'movie-script-scraper',
			tagline: 'Downloads movie scripts by genre, as text files you can count.',
			credit: 'started by Tim Kendall',
			intro: [
				"Movie Script Scraper downloads movie scripts by genre from the Internet Movie Script Database and saves each one as a plain text file you can search and count. It's where Bechdel.io got its scripts.",
			],
			made: {
				text: [
					"It's a Node.js CLI and npm package. It fetches five scripts at a time, retries the ones that fail, and saves one text file per movie in a folder named for the genre. [The code is on GitHub](https://github.com/JoeKarlsson/movie-script-scraper).",
				],
				diagram: {
					src: '/images/projects/movie-script-scraper/how-it-gets-scripts.svg',
					alt: "How Movie Script Scraper gets scripts: you give it a genre, it loads that genre's page on IMSDB and finds every script link, fetches five scripts at a time with up to three retries, keeps each script's text if it has at least 500 characters, and saves one .txt per movie in a folder named for the genre, which is where Bechdel.io's scripts came from",
				},
			},
			lineage: [{ label: 'Written for', title: 'Bechdel.io' }],
		},
	},
	{
		title: 'Python Sudoku Generator & Solver',
		description:
			'Generates unique Sudoku boards across 4 difficulty levels with a built-in solver using backtracking.',
		image: '/images/projects/sudoku-generator/thumb-d515f26f.webp',
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
			introHeading: 'Artist statement',
			intro: [
				"Adult Swim's bumpers were a black screen and plain white text, one card at a time, then [adult swim] and you were back in the show. Sometimes they were a joke and sometimes they were weirdly sincere. I stayed up way too late watching them, and they stuck with me longer than most of the shows did. It was the first TV I watched that seemed like weirdos made it for other weirdos.",
				"I run a Plex server called Joeflix for my friends and family, and Plex has no personality. You hit play and it could be anyone's server. The one place it lets you say something is the short video before a movie, so every movie on Joeflix now opens with a personal message from me to my friends. Most of them are about Minnesota or how much I spend on hard drives.",
				"One bumper tells you that somewhere, someone is paying $22 a month, and not you. The ones people bring up are like that, a jellyfish telling them there's no algorithm. Nobody has ever said a word about my transcoding settings.",
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
			made: {
				text: [
					"It's a small Python CLI on top of ffmpeg. Each bumper is a few lines of YAML, and `bumper render` turns it into a ten-second MP4 with the cards fading through one at a time, music underneath and the server name in brackets at the end. [NeXroll](https://github.com/JFLXCLOUD/NeXroll) shuffles them before every movie. Plex only plays pre-rolls before movies, so TV episodes still start cold.",
				],
				diagram: {
					src: '/images/blog/adult-swim-bumpers-plex-pre-rolls/how-a-bumper-gets-made.svg',
					alt: 'How a bumper gets made: each bumper is a few lines in bumpers.yaml with two to four text cards, a background clip and a music track; bumper render uses ffmpeg to write a ten-second MP4 ending on a [yourserver] card; NeXroll shuffles the MP4s, and Plex plays one before every movie on Joeflix, while TV episodes start cold',
				},
			},
			lineage: [{ label: 'Same server', title: 'Streamroll' }],
		},
	},
	{
		title: 'Streamroll',
		shareTitle: 'Streamroll: Netflix-style intros for your own Plex, made by AI',
		description:
			'A Netflix-style intro for your own Plex, Jellyfin or Emby server, made from its name: pick a style, and you get a title card that moves, ready to play before every movie.',
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
			introHeading: 'Artist statement',
			intro: [
				"Netflix plays its sting before every show. Plex, Jellyfin and Emby will play a short video before every movie too, but you hit play on a home server and it could be anyone's.",
				"Streamroll makes one from your server's name. You type a name like Joeflix, pick a style, and get back a title card that moves, ready to play before every movie.",
				"There's no account and nothing to pay me, and it hands you the code that made your clip, so you can make the next one without my site.",
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
			made: {
				text: [
					'It chains two Runway API calls. The first turns a prompt tuned to the style into a 1920x1080 title card, and the second animates that still into a clip of 2 to 5 seconds. Each style picks its own image model, video model and length. Your Runway key stays in your browser and goes along with each request, and the server never stores it.',
				],
				diagram: {
					src: '/images/projects/streamroll/how-streamroll-makes-an-intro.svg',
					alt: 'How Streamroll makes an intro: you give it a name, a style and your own Runway key, the style picks the image model, video model and length, Runway turns a prompt into a title card that you approve or redo, Runway animates it into a 2 to 5 second clip, your own audio can be mixed in your browser with FFmpeg.wasm, and the .mp4 becomes a pre-roll in Plex, Jellyfin or Emby',
				},
			},
			lineage: [{ label: 'Same server', title: 'Adult Swim Bumper' }],
		},
	},
	{
		title: 'GPU-Accelerated Subtitle Generator',
		shareTitle: 'GPU Subtitle Generator: Whisper subtitles for a whole library, on shared GPUs',
		description:
			'A production subtitle generation pipeline using GPU-accelerated Whisper (faster-whisper) with NVIDIA CUDA. Features parallel workers, automatic language detection and translation, VRAM-aware scheduling, and time-of-day worker scaling to share GPU resources across services.',
		image: '/images/projects/gpu-subtitle-generator/thumb-08106819.webp',
		imageAlt:
			"A playhead runs along a film's audio waveform as Whisper, on an NVIDIA GPU, writes each line of speech into an SRT file: They're coming to get you, Barbara",
		date: '2026-02',
		tech: ['Python', 'Whisper AI', 'CUDA', 'NVIDIA GPU', 'Bash'],
		blogUrl: '/blog/building-a-gpu-accelerated-subtitle-generator/',
		page: {
			slug: 'gpu-subtitle-generator',
			tagline: 'Subtitles for a whole video library, on GPUs the house is already using.',
			intro: [
				'My video library has thousands of files in dozens of languages, and most had no subtitles. This writes them with faster-whisper on the two NVIDIA cards in my homelab. It detects the language, translates to English and saves a `.en.srt` next to each video, so Plex, Jellyfin and VLC find it on their own.',
				'The same GPUs run Plex transcoding, Tdarr and my house\'s voice assistant, so the workers wait their turn: each checks for free VRAM before a file and backs off when something else needs the card. Two run from midnight to 4 PM and one in the evening, when Plex is busiest. Whisper also invents lines over silence ("Thank you for watching!"), so a filter of more than 200 patterns throws those out.',
			],
			made: {
				text: [
					'Bash scripts schedule the workers and hand out folders with directory locks, no queue or database. A Python script runs faster-whisper on CUDA and writes the SRT files. [How I built it](/blog/building-a-gpu-accelerated-subtitle-generator/).',
				],
				diagram: {
					src: '/images/blog/building-a-gpu-accelerated-subtitle-generator/pipeline-layers.svg',
					alt: 'The subtitle generator in four layers. A cron job or a manual trigger starts the scheduler (subtitle-scheduler.sh), which starts and stops workers, cleans stale locks and manages the worker lifecycle. Parallel workers (parallel-worker.sh) claim folders with mkdir, wait for a free GPU and track progress. The Whisper engine (generate-subtitles.py) runs faster-whisper on CUDA, filters hallucinations and writes SRT files.',
				},
			},
			lineage: [
				{ label: 'Also runs Whisper', title: 'FollowSpot' },
				{ label: 'Also transcribes locally', title: 'Screencast Director' },
			],
		},
	},
	{
		title: 'MikroTik Native API Client',
		shareTitle: "MikroTik's binary router API in 137 lines of standard-library Python",
		description:
			"A from-scratch Python implementation of MikroTik's proprietary binary API protocol. Handles variable-length encoding, authentication, and sentence-based messaging for programmatic control of network infrastructure - bonding, DHCP, firewall rules, and more.",
		image: '/images/projects/mikrotik-api-client/thumb-6cc55f0c.webp',
		imageAlt:
			'A MikroTik API login sentence written to the wire one word at a time, /login, =name=admin and =password=secret, each with its length byte, then a zero byte, and RouterOS answering !done',
		date: '2026-03',
		tech: ['Python', 'Binary Protocol', 'MikroTik', 'Networking'],
		blogUrl: '/blog/implementing-mikrotik-binary-api-protocol-in-python/',
		page: {
			slug: 'mikrotik-api-client',
			tagline: "MikroTik's binary router API, in 137 lines of standard-library Python.",
			intro: [
				"My homelab's 10G backbone is a MikroTik CRS317 switch, and I wanted to change its bonds, DHCP and firewall rules from scripts instead of typing into SSH. RouterOS has an API on port 8728 that speaks its own binary protocol over raw TCP: sentences made of words, each word led by its length, each sentence ended by a zero byte.",
				"I wrote the protocol myself instead of using a library. The Python ones are heavy, and I only understand a byte-level format once I've built it. The length encoding turned out to be the trick UTF-8 uses, where the first byte's high bits say how many more bytes follow. The client came out at 137 lines with no dependencies, small enough to call from a cron job.",
			],
			made: {
				text: [
					'It uses only `socket` and `struct`: it logs in, sends each command as a sentence, and reads `!re` replies until `!done`, or `!trap` for an error. Any RouterOS command works from the command line with no code changes. [How it works, byte by byte](/blog/implementing-mikrotik-binary-api-protocol-in-python/).',
				],
				diagram: {
					src: '/images/projects/mikrotik-api-client/how-it-talks-to-routeros.svg',
					alt: 'How the MikroTik API client talks to RouterOS. The Python script, using only socket and struct, opens a raw TCP connection to RouterOS on port 8728. It sends a /login sentence with =name= and =password= words, and RouterOS answers !done. Then it sends a command such as /interface/bonding/print, and RouterOS answers with one !re sentence per record, then !done, or !trap on an error. On the wire, each word goes out as its length and then its bytes: 06 and the six bytes of /login, 0b and the eleven bytes of =name=admin, and a 00 byte ends the sentence. The length byte works like UTF-8: its high bits say how many more length bytes follow.',
				},
			},
			lineage: [{ label: 'Also about the wire', title: 'Guide to Client-Server Communication' }],
		},
	},
];
