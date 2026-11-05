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
	// A web-playable build, embedded under the intro at 1280x720 and scaled to fit
	// (src/scripts/scale-to-fit-embed.ts). Its origin must be in the CSP frame-src
	// (Caddyfile and the OpenTofu provision template)
	embedUrl?: string;
	// Defaults to "Play it" and "Click the game to play."
	embedHeading?: string;
	embedNote?: string;
	// A narrated video with sound, under the intro. Portrait (9:16) phone video
	tour?: { video: string; poster: string; captions: string; alt: string };
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
	category: 'iot' | 'web' | 'art' | 'dev-tools' | 'homelab';
	// YYYY-MM the project was built (first commit or launch post); /work/ sorts newest first
	date: string;
	tech: string[];
	sourceUrl?: string;
	demoUrl?: string;
	blogUrl?: string;
	stars?: number;
	featured?: boolean;
	page?: ProjectPage;
}

const BUMPER_DIR = '/images/blog/adult-swim-bumpers-plex-pre-rolls';

const bumperClip = (name: string, alt: string): ProjectClip => ({
	video: `${BUMPER_DIR}/${name}.mp4`,
	poster: `${BUMPER_DIR}/${name}-poster.webp`,
	alt,
});

const PIXELPANE_DIR = '/images/blog/pixelpane-pixel-art-home-assistant';

const SD_DIR = '/images/blog/screencast-director-screen-recorder';

const DOOM_DIR = '/images/blog/why-i-use-doom-to-visualize-mcp-data';

export const CATEGORY_META: Record<Project['category'], { label: string }> = {
	iot: { label: 'IoT & Hardware' },
	web: { label: 'Web & Software' },
	art: { label: 'Art & Digital Humanities' },
	'dev-tools': { label: 'Developer Tools & Education' },
	homelab: { label: 'Homelab' },
};

export const projects: Project[] = [
	// IoT & Hardware
	{
		title: 'IoT Kitty Litter Box',
		description:
			'Welcome to the Internet of Toilets. An IoT-connected cat litter box built with a Raspberry Pi, weight sensors, and Node.js. Monitors usage patterns and sends notifications. Became one of my most popular conference talks - presented at 20+ events worldwide.',
		image: '/images/blog/an-introduction-to-iot-internet-of-toilets/og-iot-toilet.webp',
		imageAlt: 'IoT Kitty Litter Box',
		category: 'iot',
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
		image: `${PIXELPANE_DIR}/project-hero.webp`,
		video: `${PIXELPANE_DIR}/pp-playnow.mp4`,
		imageAlt:
			'The PixelPane control page: pressing Play now on moon, fire, clock and Halloween, with the live preview of the panel switching to each scene',
		category: 'iot',
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
				{
					poster: `${PIXELPANE_DIR}/live-control.webp`,
					alt: 'The PixelPane control page: a live preview of the panel, power and brightness, what is playing now and next, the active Autumn and Halloween themes, and Play now buttons for every scene',
					caption: 'The control page, with a live preview of the panel',
				},
			],
		},
	},
	{
		title: 'MagicMirror\u00B2 - Smart IoT Mirror',
		description:
			'A smart mirror built with a Raspberry Pi running MagicMirror\u00B2 software behind a two-way mirror. Displays weather, calendar, news, and Home Assistant integrations. Still running in my house today.',
		image: '/images/projects/magic-mirror.webp',
		imageAlt: 'MagicMirror Smart Mirror',
		category: 'iot',
		date: '2022-01',
		tech: ['Raspberry Pi', 'MagicMirror\u00B2', 'Home Assistant'],
	},
	{
		title: 'Moodlite - Smart IoT Light Panels',
		description:
			'DIY smart light panels inspired by Nanoleaf, built with 3D-printed housings, WS2812B LED strips, and an ESP8266. Controllable via MQTT and Home Assistant.',
		image: '/images/projects/moodlite.webp',
		imageAlt: 'Moodlite Smart Light Panels',
		category: 'iot',
		date: '2022-01',
		tech: ['ESP8266', 'MQTT', 'Home Assistant', '3D Printing'],
	},
	{
		title: '3D-Printed Postcard Rack Planter',
		description:
			'Custom 3D-printed planter insert designed in Fusion 360 for a recycled postcard rack. Printed on my Prusa MK3.',
		image:
			'/images/blog/from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack/Postcard-Rack-Planter.webp',
		imageAlt: '3D Printed Planter',
		category: 'iot',
		date: '2023-02',
		tech: ['Fusion 360', 'Prusa MK3', '3D Printing'],
		blogUrl:
			'/blog/from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack/',
	},

	// Web & Software
	{
		title: 'React Spotify Player',
		description:
			'A real-time Spotify player built with React. My most starred open source project. Integrates with the Spotify Web API for custom playback. Accompanied a popular tutorial.',
		image:
			'/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/1_KGOTMV8KD120TApnijDauQ.webp',
		imageAlt: 'React Spotify Player',
		category: 'web',
		date: '2019-03',
		tech: ['React', 'Spotify API', 'JavaScript'],
		sourceUrl: 'https://github.com/JoeKarlsson/react-spotify-player',
		blogUrl: '/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/',
		stars: 131,
	},

	// Web - Digital Graffiti Wall
	{
		title: 'Digital Graffiti Wall',
		description:
			'An interactive art installation where audience members draw on a shared digital canvas that displays their creations in real-time on a physical RGB LED grid. Uses MongoDB Realm for instant cross-client data sync. Since retired and replaced by PixelPane.',
		image: '/images/blog/building-a-real-time-digital-graffiti-wall/hero.webp',
		imageAlt: 'Digital Graffiti Wall',
		category: 'web',
		date: '2020-10',
		tech: ['JavaScript', 'MongoDB Realm', 'RGB LEDs', 'Real-Time Sync'],
		blogUrl: '/blog/building-a-real-time-digital-graffiti-wall/',
		sourceUrl: 'https://github.com/JoeKarlsson/digital-graffiti-wall',
	},

	// Art & Digital Humanities
	{
		title: 'DVD Screensaver',
		shareTitle: 'The DVD screensaver with the boring parts taken out',
		description: 'With the boring parts taken out.',
		image: '/images/projects/nothing-but-corners.webp',
		video: '/images/projects/nothing-but-corners.mp4',
		imageAlt:
			'Colored DVD logos bouncing around a black screen, and each time one lands in a corner the screen flashes and confetti bursts out of it',
		category: 'art',
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
				"It's also useless on purpose. I've been making things nobody needs for a long time, from co-organizing the Stupid Shit No One In Hawaii Needs hackathon in 2016 to gluing seeds to cardboard one at a time to make pictures. Both took a lot of work for something with no use, and I liked doing them.",
			],
			embedUrl: 'https://joekarlsson.github.io/nothing-but-corners/',
			embedHeading: 'Watch it',
			embedNote: 'Click inside to add another logo.',
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
		category: 'art',
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
			steps: [
				{
					title: 'Skim',
					text: 'Scroll faster than about 700 pixels a second and you get the skeleton, a few words with blanks where the rest should be. Skim hard enough and the page whispers "slower."',
				},
				{
					title: 'Pause',
					text: 'Hold still on a line for about a second and some of the blanks fill in. Those are the words marked `^` in `poems.js`.',
				},
				{
					title: 'Linger',
					text: 'Stay with a line for about four seconds and it completes. The words marked `~` only come for readers who stay.',
				},
			],
		},
	},
	{
		title: 'Punc',
		shareTitle: 'Punc: What a book looks like with only its punctuation',
		description:
			'What does a book look like without words? Punc strips text down to its punctuation skeleton and visualizes the patterns left behind. Feed it any text file and get a PDF showing the structure beneath the prose.',
		image: '/images/projects/punc.webp',
		imageAlt: 'Punc punctuation visualization',
		category: 'art',
		date: '2016-02',
		tech: ['TypeScript', 'NLP', 'PDF Generation'],
		sourceUrl: 'https://github.com/JoeKarlsson/punc',
		page: {
			slug: 'punc',
			tagline: 'What a book looks like without words.',
			introHeading: 'Artist statement',
			intro: [
				"A lot of what steers you through a book isn't the words. A comma tells you to take a breath, a period tells you to stop, and an exclamation point tells you someone is yelling. You follow every one of those instructions while you read, and you almost never notice them.",
				"Punc takes the words away and leaves the instructions. Without the words, punctuation stops being invisible, and you can see a book's rhythm on its own: where a writer keeps you going without a breath, where the dialogue gets crowded and everyone talks over each other, and where it goes quiet for a while. Alice's Adventures in Wonderland comes out loud and nervous, full of exclamation points and questions, which is how the book feels to read.",
				"I think a lot of what we call a writer's voice lives in those marks. Two writers can use the same words and sound nothing alike, because one of them never lets a sentence end and the other stops every few words. Punc takes the meaning out of a book, and a lot of the voice is still there.",
				"It's an erasure, like the blackout poems I make on paper, except a blackout poem keeps a few words and Punc keeps none.",
				"Like most of what I make, it isn't useful. It won't make you a better writer, and it can't tell you whether a book is any good.",
			],
			screenshots: [
				{
					poster: '/images/projects/punc-alice-page-one.webp',
					alt: "Page one of Punc's PDF for chapter one of Alice's Adventures in Wonderland: a white page with only scattered commas, dashes, parentheses, quote marks, a question mark and exclamation points left where the words used to be",
					caption: "Chapter one of Alice's Adventures in Wonderland, page one",
				},
			],
			screenshotsTitle: 'Alice, without words',
		},
	},
	{
		title: 'Rose Hobart',
		shareTitle: "Rose Hobart: Joseph Cornell's 1936 film, remastered for the web",
		description:
			"Joseph Cornell's 1936 collage film, with the tint, the speed and the music back in your hands while it plays. Made with my sister Laurel.",
		image: '/images/projects/rose-hobart-poster.webp',
		video: '/images/projects/rose-hobart.mp4',
		imageAlt:
			"Joseph Cornell's Rose Hobart playing on the site while the color tint switches from Prussian blue to rose, violet, amber and jade",
		category: 'art',
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
		},
	},
	{
		title: 'Bechdel.io',
		shareTitle: 'Bechdel.io: Checking movie scripts against the Bechdel Test',
		description:
			'Does your favorite film pass the Bechdel Test? Uses NLP to parse movie scripts and analyze gender representation in dialogue. Includes a custom scraper to pull scripts from IMSDB by genre or title. Featured in multiple publications and conference talks.',
		image: '/images/projects/bechdel-io-poster.webp',
		video: '/images/projects/bechdel-io.mp4',
		imageAlt:
			'Bechdel.io: a grid of movie posters, then the Gone Girl page showing Bechdel Pass: TRUE with charts of female and male characters and dialogue',
		category: 'art',
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
				'Bechdel.io checks movie scripts against the Bechdel Test, and the hardest part of building it was deciding who counts as a woman. The test comes from a 1985 Alison Bechdel comic strip, and it asks three things: are there at least two women, do they talk to each other, and do they talk about something other than a man.',
				"My sister Laurel and I started it in 2015. She wanted to do feminist film analysis across a lot of movies at once and couldn't find a tool that would do it, so I built one.",
				"The tool decides who counts as a woman by checking whether a film database credits each person as an actor or an actress, so gender comes down to one field with two possible values. It can't tell a trans character from the actor who plays her. It has nowhere to put a character whose gender changes during the film, or anyone who isn't a man or a woman.",
				"It's easy to blame whoever maintains the database, but that field is the end of a long line. A production and its crew decide how a film is cast and credited, awards split performers into best actor and best actress, fans and volunteers fill in sites like IMDb, and every database after that sorts people into the same two boxes. Each of those steps has room for only two answers, and the tool inherits all of them, which sucks. I still chose to build it on a database, though. That's one of the limits of doing data analysis with data from the internet: it's messy, and it carries a bias against trans people that a tool like this passes straight through. The Bechdel Test has the same blind spot: it never says who the women are.",
				"Code needs a yes or a no for every character before it can count anything, and that yes or no is exactly what gender studies questions. The hardest problem in this project was a humanities problem, and the tech industry mostly doesn't take the humanities or the arts seriously.",
				"Bechdel.io is art, and it's research too. Data representation in art is the angle that interests me: a wall of movies most people have already seen, sorted into pass and fail, makes you look at them again.",
				'Laurel and I used it to study the Best Picture nominees at the 2015 Oscars, and we released it as open source because we saw it as feminist activism.',
			],
		},
	},

	// Developer Tools & Education
	{
		title: 'Connect AI × DOOM',
		shareTitle: 'Connect AI × DOOM: Doom levels built from live business data',
		description:
			"Ask Claude a business question and it builds a Doom level from the answer. Every monster is a live record from your apps, pulled through the CData Connect AI MCP server. I built it in one night as a side project, and it's now the foundation of my team's developer marketing campaign and event strategy.",
		image: '/images/projects/connect-ai-doom.webp',
		video: '/images/projects/connect-ai-doom.mp4',
		imageAlt:
			'Claude playing a Doom level built from live Connect AI data, shooting a pink demon labeled with an urgent Salesforce deal while a side panel logs every kill',
		category: 'dev-tools',
		date: '2026-10',
		tech: ['Python', 'Claude Code', 'MCP', 'CData Connect AI', 'psdoom-ng', 'SQL'],
		sourceUrl: 'https://github.com/CDataSoftware/connect-ai-doom',
		demoUrl: 'https://cdatasoftware.github.io/connect-ai-doom/',
		blogUrl: '/blog/why-i-use-doom-to-visualize-mcp-data/',
		featured: true,
		page: {
			slug: 'connect-ai-doom',
			tagline: 'Doom built from live business data, where every monster is a real record.',
			intro: [
				'You ask Claude a business question, like "Which customers are at risk right now?" Claude answers it through the CData Connect AI MCP server, and the answer becomes a Doom level. Each room is an app that holds part of the answer, like Salesforce, Zendesk or Stripe. Each monster is a record from that app, and the urgent ones are pink demons. Keycards match your permissions, and anything Connect AI refused to hand over, like a lookup by Social Security number, sits behind a red door with no key.',
				"You can play it yourself, or let Claude play while a side panel shows every decision and tool call it makes. Shoot a record and the game re-reads it live from the source app. Everything goes through Connect AI's read-only tools, so nothing in your apps changes. The full version runs on a Mac, and setup takes about ten minutes.",
				"Or play it right here: the web version below is a level Claude built from a demo company's Salesforce, Zendesk and Stripe. No install or account needed. It needs a keyboard and mouse.",
			],
			embedUrl: 'https://cdatasoftware.github.io/connect-ai-doom/',
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
					text: 'A small bridge re-runs each room every 15 seconds, so the monsters always match your data. With `--claude-plays`, Claude also gets a Doom MCP server so it can play the level.',
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
		category: 'dev-tools',
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
		category: 'dev-tools',
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
		title: 'Secure AI Data Pipelines Demo',
		description:
			'A full-stack open source demo showing how to build AI-powered cloud security analysis across AWS, GCP, and Azure. Ingests multi-cloud data via CloudQuery, sanitizes PII with differential privacy, and uses GPT-4 to detect cross-cloud attack paths and generate Terraform remediation steps. Includes a React dashboard and a companion YouTube walkthrough.',
		image: '/images/blog/building-secure-ai-powered-cloud-security/thumbnail.webp',
		imageAlt: 'Secure AI Data Pipelines Demo dashboard showing multi-cloud security risk analysis',
		category: 'dev-tools',
		date: '2025-09',
		tech: [
			'Python',
			'React',
			'Next.js',
			'TypeScript',
			'PostgreSQL',
			'OpenAI',
			'CloudQuery',
			'Docker',
		],
		sourceUrl: 'https://github.com/cloudquery/secure-ai-data-pipelines-demo',
		blogUrl: '/blog/building-secure-ai-powered-cloud-security-data-pipeline-risk-detection/',
	},
	{
		title: 'CloudQuery Go MCP Server',
		description:
			"Built a Go MCP server before Anthropic released an official Go SDK, bridging Claude and Cursor directly to CloudQuery's cloud infrastructure database. AI assistants went from zero database awareness to querying live cloud data mid-conversation - no copy-pasting schemas. Co-authored two posts: the build walkthrough and a hard-won gotchas guide on tool descriptions, naming, and context window limits.",
		image: '/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/thumbnail.webp',
		imageAlt: 'CloudQuery Go MCP Server architecture diagram',
		category: 'dev-tools',
		date: '2025-07',
		tech: ['Go', 'MCP', 'Claude', 'Cursor', 'PostgreSQL', 'CloudQuery'],
		blogUrl: '/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/',
	},
	{
		title: 'Data Structures & Algorithms in JS',
		description:
			'Common data structures and algorithms implemented in JavaScript. Created as teaching material when I was an instructor at DevLeague. Covers linked lists, trees, graphs, sorting, and more.',
		image: '/images/projects/data-structures.webp',
		imageAlt: 'Data Structures',
		category: 'dev-tools',
		date: '2016-06',
		tech: ['JavaScript', 'Algorithms'],
		sourceUrl: 'https://github.com/JoeKarlsson/data-structures',
		stars: 185,
	},
	{
		title: 'Guide to Client-Server Communication',
		description:
			'Every way a client and server communicate - HTTP, WebSockets, SSE, GraphQL, gRPC, and more. A complete reference guide with examples.',
		image:
			'/images/blog/complete-guide-node-client-server-communication/687474703a2f2f6f726d2d6368696d6572612d70726f642e73332e616d617a6f6e6177732e636f6d2f313233303030303030303534352f696d616765732f6870626e5f313530312e706e67-1-1024x559.webp',
		imageAlt: 'Client-Server Communication Guide',
		category: 'dev-tools',
		date: '2016-07',
		tech: ['Node.js', 'HTTP', 'WebSockets', 'GraphQL', 'gRPC'],
		sourceUrl: 'https://github.com/JoeKarlsson/complete-guide-to-client-server-communication',
		blogUrl: '/blog/complete-guide-node-client-server-communication/',
		stars: 43,
	},
	{
		title: 'Python Sudoku Generator & Solver',
		description:
			'Generates unique Sudoku boards across 4 difficulty levels with a built-in solver using backtracking.',
		image: '/images/projects/sudoku-generator.webp',
		imageAlt: 'Sudoku puzzle grid with numbers on a dark background',
		category: 'dev-tools',
		date: '2015-04',
		tech: ['Python', 'Algorithms', 'Backtracking'],
		sourceUrl: 'https://github.com/JoeKarlsson/python-sudoku-generator-solver',
		stars: 90,
	},

	// Homelab
	{
		title: 'Adult Swim Bumper',
		shareTitle: 'Adult Swim Bumper: Adult Swim-style bumpers for your Plex server',
		description:
			'A CLI tool for generating [adult swim]-style pre-roll bumpers for your personal media server. Define bumpers in YAML, drop in background video clips and music, and render MP4s ready to load into Tunarr. White text cards, fading audio, your server name in brackets at the end - the whole bit.',
		image: '/images/blog/adult-swim-bumpers-plex-pre-rolls/hero.webp',
		video: '/images/blog/adult-swim-bumpers-plex-pre-rolls/hero.mp4',
		imageAlt:
			'A jellyfish drifting in dark blue water with white text reading "no idea what you should watch."',
		category: 'homelab',
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
		description:
			'AI-generated custom pre-roll intros for Plex. Give it a theme and it chains Runway gen4_image to create a still, then gen4_turbo to animate it into a full video intro - VHS glitch, cinematic nature, neon outrun, whatever you want playing before your movie starts.',
		image: '/images/projects/streamroll.webp',
		imageAlt: 'Streamroll - AI Generated Pre-Roll Intros logo on a VHS-style distorted screen',
		category: 'homelab',
		date: '2026-05',
		tech: ['TypeScript', 'Runway ML', 'Plex', 'AI Video Generation'],
		sourceUrl: 'https://github.com/JoeKarlsson/streamroll',
	},
	{
		title: 'GPU-Accelerated Subtitle Generator',
		description:
			'A production subtitle generation pipeline using GPU-accelerated Whisper (faster-whisper) with NVIDIA CUDA. Features parallel workers, automatic language detection and translation, VRAM-aware scheduling, and time-of-day worker scaling to share GPU resources across services.',
		image: '/images/blog/building-a-gpu-accelerated-subtitle-generator/hero.webp',
		imageAlt: 'GPU Subtitle Generator Architecture',
		category: 'homelab',
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
		category: 'homelab',
		date: '2026-03',
		tech: ['Python', 'Binary Protocol', 'MikroTik', 'Networking'],
		blogUrl: '/blog/implementing-mikrotik-binary-api-protocol-in-python/',
	},
	{
		title: 'Proxmox Homelab Cluster',
		description:
			'A 2-node Proxmox cluster running 30+ LXC containers and VMs. Self-hosted services include Plex, Home Assistant, Frigate NVR, Grafana, and more. 20Gbps LACP backbone. I wrote the guide.',
		image:
			'/images/blog/how-to-get-started-building-a-homelab-server-in-2024/Homelab-Archiecture-1024x473.webp',
		imageAlt: 'Homelab Architecture',
		category: 'homelab',
		date: '2023-09',
		tech: ['Proxmox', 'Docker', 'LXC', 'Networking'],
		blogUrl: '/blog/how-to-get-started-building-a-homelab-server-in-2024/',
	},
	{
		title: 'Private Smart Home',
		description:
			'Replaced Alexa with Home Assistant Voice. Local speech processing via Wyoming Whisper on GPU. Zigbee devices, Frigate camera AI, and zero cloud dependencies.',
		image:
			'/images/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/I-Replaced-My-Smart-Home-with-a-Dumber-Home-But-at-Least-Its-Private.webp',
		imageAlt: 'Private Smart Home Setup',
		category: 'homelab',
		date: '2025-06',
		tech: ['Home Assistant', 'Zigbee', 'Frigate', 'Whisper'],
		blogUrl: '/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/',
	},
];
