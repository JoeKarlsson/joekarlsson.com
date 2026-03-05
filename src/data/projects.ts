export interface Project {
	title: string;
	description: string;
	image: string;
	imageAlt: string;
	category: 'iot' | 'web' | 'games' | 'dev-tools' | 'homelab';
	tech: string[];
	sourceUrl?: string;
	demoUrl?: string;
	blogUrl?: string;
	stars?: number;
	featured?: boolean;
}

export const CATEGORY_META: Record<
	Project['category'],
	{ label: string; command: string; hoverColor: string; borderColor: string; shadowColor: string }
> = {
	iot: {
		label: 'IoT & Hardware',
		command: 'ls iot/',
		hoverColor: 'group-hover:text-teal',
		borderColor: 'hover:border-teal/30',
		shadowColor: 'hover:shadow-teal/10',
	},
	web: {
		label: 'Web & Software',
		command: 'ls web/',
		hoverColor: 'group-hover:text-lavender',
		borderColor: 'hover:border-lavender/30',
		shadowColor: 'hover:shadow-lavender/10',
	},
	games: {
		label: 'Games & Fun',
		command: 'ls games/',
		hoverColor: 'group-hover:text-pink',
		borderColor: 'hover:border-pink/30',
		shadowColor: 'hover:shadow-pink/10',
	},
	'dev-tools': {
		label: 'Developer Tools & Education',
		command: 'ls dev-tools/',
		hoverColor: 'group-hover:text-terminal-yellow',
		borderColor: 'hover:border-terminal-yellow/30',
		shadowColor: 'hover:shadow-terminal-yellow/10',
	},
	homelab: {
		label: 'Homelab',
		command: 'ls homelab/',
		hoverColor: 'group-hover:text-terminal-green',
		borderColor: 'hover:border-terminal-green/30',
		shadowColor: 'hover:shadow-terminal-green/10',
	},
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
		tech: ['Raspberry Pi', 'Node.js', 'MongoDB', 'HX711'],
		sourceUrl: 'https://github.com/JoeKarlsson/iot-kitty-litter-box',
		blogUrl: '/blog/an-introduction-to-iot-internet-of-toilets/',
		stars: 25,
		featured: true,
	},
	{
		title: 'MagicMirror\u00B2 - Smart IoT Mirror',
		description:
			'A smart mirror built with a Raspberry Pi running MagicMirror\u00B2 software behind a two-way mirror. Displays weather, calendar, news, and Home Assistant integrations. Still running in my house today.',
		image: '/images/projects/magic-mirror.webp',
		imageAlt: 'MagicMirror Smart Mirror',
		category: 'iot',
		tech: ['Raspberry Pi', 'MagicMirror\u00B2', 'Home Assistant'],
		sourceUrl: 'https://github.com/JoeKarlsson',
	},
	{
		title: 'Moodlite - Smart IoT Light Panels',
		description:
			'DIY smart light panels inspired by Nanoleaf, built with 3D-printed housings, WS2812B LED strips, and an ESP8266. Controllable via MQTT and Home Assistant. A fun weekend project that turned into a deep dive into embedded systems.',
		image: '/images/projects/moodlite.webp',
		imageAlt: 'Moodlite Smart Light Panels',
		category: 'iot',
		tech: ['ESP8266', 'MQTT', 'Home Assistant', '3D Printing'],
		sourceUrl: 'https://github.com/JoeKarlsson',
	},
	{
		title: '3D-Printed Postcard Rack Planter',
		description:
			'Custom 3D-printed planter insert designed in Fusion 360 for a recycled postcard rack. Printed on my Prusa MK3. A fun exercise in turning digital design into a real-world object.',
		image:
			'/images/blog/from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack/Postcard-Rack-Planter.webp',
		imageAlt: '3D Printed Planter',
		category: 'iot',
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
		tech: ['React', 'Spotify API', 'JavaScript'],
		sourceUrl: 'https://github.com/JoeKarlsson/react-spotify-player',
		blogUrl: '/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/',
		stars: 131,
	},
	{
		title: 'Bechdel.io',
		description:
			'Does your favorite film pass the Bechdel Test? Uses NLP to parse movie scripts and analyze gender representation in dialogue. Featured in multiple publications and conference talks.',
		image:
			'/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/Bechdel.io-Blog-Banner.webp',
		imageAlt: 'Bechdel.io',
		category: 'web',
		tech: ['Node.js', 'NLP', 'JavaScript', 'MongoDB'],
		sourceUrl: 'https://github.com/JoeKarlsson/bechdel-test',
		blogUrl: '/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/',
		stars: 30,
	},
	{
		title: 'Pixelate',
		description:
			'HTML5 webapp that pixelates any image using the Canvas API. One of my early web projects that taught me a ton about image manipulation in the browser.',
		image: '/images/blog/how-to-pixelate-images-with-html5-and-javascript/pixelate-demo.webp',
		imageAlt: 'Pixelate',
		category: 'web',
		tech: ['HTML5 Canvas', 'JavaScript'],
		sourceUrl: 'https://github.com/JoeKarlsson/Pixelate',
		blogUrl: '/blog/how-to-pixelate-images-with-html5-and-javascript/',
		stars: 15,
	},
	{
		title: 'Launch Target - Lunch Coordination',
		description:
			'A real-time coordination app to help you and your friends find a place to eat. Because deciding where to go for lunch is the hardest problem in computer science.',
		image: '/images/projects/launch-target.webp',
		imageAlt: 'Launch Target',
		category: 'web',
		tech: ['React', 'Node.js', 'WebSockets'],
		sourceUrl: 'https://github.com/JoeKarlsson/night-out',
	},

	// Games & Fun
	{
		title: 'Wave Jump',
		description:
			"An 80's arcade-inspired multiplayer browser game built with Phaser.js. Dodge waves and outlast your opponents.",
		image: '/images/projects/wave-jump.webp',
		imageAlt: 'Wave Jump',
		category: 'games',
		tech: ['Phaser.js', 'JavaScript', 'WebSockets'],
		sourceUrl: 'https://github.com/JoeKarlsson/wave-jump',
		stars: 5,
	},
	{
		title: 'Rose Hobart',
		description:
			"A digital humanities project exploring performativity in cinema. Inspired by Joseph Cornell's 1936 found footage film. Analyzes and visualizes narrative structure in film scripts.",
		image: '/images/projects/rose-hobart.webp',
		imageAlt: 'Rose Hobart',
		category: 'games',
		tech: ['JavaScript', 'D3.js', 'NLP'],
		sourceUrl: 'https://github.com/JoeKarlsson/rose-hobart',
		stars: 2,
	},

	{
		title: 'Digital Graffiti Wall',
		description:
			'An interactive art installation where audience members draw on a shared digital canvas that displays their creations in real-time on a physical RGB LED grid. Uses MongoDB Realm for instant cross-client data sync.',
		image: '/images/blog/building-a-real-time-digital-graffiti-wall/hero.webp',
		imageAlt: 'Digital Graffiti Wall',
		category: 'games',
		tech: ['JavaScript', 'MongoDB Realm', 'RGB LEDs', 'Real-Time Sync'],
		blogUrl: '/blog/building-a-real-time-digital-graffiti-wall/',
		sourceUrl: 'https://github.com/JoeKarlsson/digital-graffiti-wall',
	},

	// Developer Tools & Education
	{
		title: 'Data Structures & Algorithms in JS',
		description:
			'Common data structures and algorithms implemented in JavaScript. Created as teaching material when I was an instructor at DevLeague. Covers linked lists, trees, graphs, sorting, and more.',
		image: '/images/projects/data-structures.webp',
		imageAlt: 'Data Structures',
		category: 'dev-tools',
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
		tech: ['Node.js', 'HTTP', 'WebSockets', 'GraphQL', 'gRPC'],
		sourceUrl: 'https://github.com/JoeKarlsson/complete-guide-to-client-server-communication',
		blogUrl: '/blog/complete-guide-node-client-server-communication/',
		stars: 43,
	},
	{
		title: 'Python Sudoku Generator & Solver',
		description:
			'Generates unique Sudoku boards across 4 difficulty levels with a built-in solver using backtracking.',
		image: '/images/projects/data-structures.webp',
		imageAlt: 'Python Sudoku Generator and Solver',
		category: 'dev-tools',
		tech: ['Python', 'Algorithms', 'Backtracking'],
		sourceUrl: 'https://github.com/JoeKarlsson/python-sudoku-generator-solver',
		stars: 90,
	},
	{
		title: 'Movie Script Scraper',
		description:
			'Scraper to retrieve movie scripts by genre or title from IMSDB. Built as a data pipeline for the Bechdel Test project.',
		image: '/images/projects/movie-script-scraper.webp',
		imageAlt: 'Movie Script Scraper',
		category: 'dev-tools',
		tech: ['Python', 'Web Scraping', 'BeautifulSoup'],
		sourceUrl: 'https://github.com/JoeKarlsson/movie-script-scraper',
		stars: 11,
	},
	{
		title: 'MongoDB GraphQL Demo',
		description: 'Using the MongoDB GraphQL Endpoint with Apollo Client in React.',
		image: '/images/blog/getting-started-with-graphql-and-atlas/From-SQL-to-NoSQL-Blog-Cover1.webp',
		imageAlt: 'MongoDB GraphQL Demo',
		category: 'dev-tools',
		tech: ['React', 'GraphQL', 'Apollo', 'MongoDB'],
		sourceUrl: 'https://github.com/JoeKarlsson/mongodb-graphql-demo',
		blogUrl: '/blog/getting-started-with-graphql-and-atlas/',
		stars: 20,
	},
	{
		title: 'Watson Speech-to-Text Telegram Bot',
		description: 'IBM Watson powered chatbot that transcribes voice messages in Telegram.',
		image: '/images/blog/complete-guide-node-client-server-communication/Mom.webp',
		imageAlt: 'Watson Speech-to-Text Telegram Bot',
		category: 'dev-tools',
		tech: ['Node.js', 'IBM Watson', 'Telegram API'],
		sourceUrl: 'https://github.com/JoeKarlsson/watson-speech-to-text-telegram-chatbot',
		stars: 6,
	},
	{
		title: 'Best Buy Product Locator Extension',
		description:
			'Chrome extension that tells you if a product is available for same-day pickup at your local Best Buy. Built during my time on the Best Buy engineering team.',
		image: '/images/projects/best-buy-chrome.webp',
		imageAlt: 'Best Buy Chrome Extension',
		category: 'dev-tools',
		tech: ['Chrome Extension', 'JavaScript', 'Best Buy API'],
		sourceUrl: 'https://github.com/JoeKarlsson/best-buy-product-locator-chrome-extension',
		stars: 3,
	},
	{
		title: 'MongoDB CSFLE Demo',
		description:
			'Reference implementation of Client-Side Field Level Encryption in MongoDB with Node.js.',
		image:
			'/images/blog/how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js/d2c1030de0b2c0ceb58e2c4e5c000d1575cf3902.webp',
		imageAlt: 'MongoDB CSFLE Demo',
		category: 'dev-tools',
		tech: ['Node.js', 'MongoDB', 'Encryption'],
		sourceUrl:
			'https://github.com/JoeKarlsson/client-side-field-level-encryption-csfle-mongodb-node-demo',
		blogUrl: '/blog/how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js/',
		stars: 5,
	},

	// Homelab
	{
		title: 'GPU-Accelerated Subtitle Generator',
		description:
			'A production subtitle generation pipeline using GPU-accelerated Whisper (faster-whisper) with NVIDIA CUDA. Features parallel workers, automatic language detection and translation, VRAM-aware scheduling, and time-of-day worker scaling to share GPU resources across services.',
		image: '/images/blog/building-a-gpu-accelerated-subtitle-generator/hero.webp',
		imageAlt: 'GPU Subtitle Generator Architecture',
		category: 'homelab',
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
		tech: ['Home Assistant', 'Zigbee', 'Frigate', 'Whisper'],
		blogUrl: '/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/',
	},
];
