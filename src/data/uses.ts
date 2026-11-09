// Everything on /uses: sections, the photo each one is built around, and the gear in it.
// descHtml/introHtml/nameHtml are trusted HTML from this file; their links carry
// data-text-link, which uses.astro turns into the TEXT_LINK style. {runningContainers}
// is filled from the now-feed snapshot. `pin` is where the thing sits in the section's
// photo, in % of its width and height; pinned items are numbered in list order.

export interface UsesItem {
	name: string;
	nameHtml?: string;
	url: string;
	descHtml: string;
	pin?: [number, number];
}

export interface UsesSection {
	slug: string;
	name: string;
	introHtml: string;
	photo: { src: string; width: number; height: number; alt: string; tall: boolean };
	groups: { name: string; items: UsesItem[] }[];
}

export const USES_SECTIONS: UsesSection[] = [
	{
		slug: 'hardware',
		name: 'Hardware',
		introHtml: '',
		groups: [
			{
				name: 'Computer & monitors',
				items: [
					{
						name: '14" MacBook Pro M5 Max',
						url: 'https://www.apple.com/macbook-pro/',
						descHtml:
							'my work laptop. 18-core CPU, 32-core GPU, 36 GB of memory, 2 TB SSD. Plenty of headroom for Docker, multiple IDEs, and running local AI models.',
						pin: [21, 68],
					},
					{
						name: '14" MacBook Pro M5 Pro',
						url: 'https://www.apple.com/macbook-pro/',
						descHtml:
							'my personal laptop, with 24 GB of memory. Having two machines means I can move between my desk and the recording studio without unplugging anything.',
					},
					{
						name: 'Monitors',
						url: '',
						descHtml:
							'<a href="https://www.amazon.com/Lenovo-ThinkVision-P27h-10-LED-Monitor/dp/B071DK1TW8" target="_blank" rel="noopener noreferrer" data-text-link >ThinkVision P27h-10</a> 27" QHD (right) + <a href="https://www.amazon.com/Dell-U2723QE-UltraSharp-USB-C-Monitor/dp/B09TQZP9CL" target="_blank" rel="noopener noreferrer" data-text-link >Dell U3417W</a> 34" 4K (left). If I were buying today, I\'d go ultrawide.',
						pin: [41, 43],
					},
					{
						name: 'Ergotron LX Dual Monitor Arm',
						url: 'https://www.ergotron.com/en-us/products/product-details/45-245',
						descHtml:
							"lets me reposition monitors based on what I'm working on and frees up desk space for hardware projects.",
						pin: [52, 55],
					},
					{
						name: 'Anker Prime TB5 Dock',
						url: 'https://www.amazon.com/dp/B0DSVVJXK5',
						descHtml:
							"14-in-1 Thunderbolt 5 dock. It replaced my Dell Universal Dock, and I use it at both my main desk and the recording station: one cable and the laptop is plugged into everything. It's amazing.",
					},
					{
						name: 'ACASIS 16-port USB hub',
						url: 'https://www.amazon.com/dp/B0G13RQ2SZ',
						descHtml: 'powered 10 Gbps hub with 8 USB-A and 8 USB-C ports.',
					},
				],
			},
			{
				name: 'Camera, mic & lighting',
				items: [
					{
						name: 'OBSBOT Tiny 2',
						url: 'https://www.obsbot.com/obsbot-tiny-2',
						descHtml:
							'4K AI-powered webcam with gesture control and auto-tracking. Replaced my Sony A6600 - much simpler setup for Zoom calls and recordings.',
						pin: [52, 29],
					},
					{
						name: 'Elgato Wave:3',
						url: 'https://www.elgato.com/us/en/p/wave-3-black',
						descHtml:
							'USB condenser mic, managed through <a href="https://www.elgato.com/us/en/s/wave-link" target="_blank" rel="noopener noreferrer" data-text-link >Wave Link</a> for mixing. Replaced the Blue Yeti - much better sound and integrates with the Elgato ecosystem.',
						pin: [69, 58],
					},
					{
						name: 'Elgato Key Lights (x2)',
						url: '',
						descHtml: 'key and fill light for calls at my desk.',
						nameHtml:
							'<a href="https://www.amazon.com/gp/product/B07L755X9G" target="_blank" rel="noopener noreferrer" data-text-link >Elgato Key Lights</a> (x2)',
						pin: [32, 14],
					},
				],
			},
		],
		photo: {
			src: '/images/uses/desk-2026.webp',
			width: 1920,
			height: 1080,
			alt: "Joe Karlsson's standing desk with two monitors, a laptop on a stand, a mic on a boom arm, a key light above the monitors, and warm LED backlighting",
			tall: false,
		},
	},
	{
		slug: 'on-the-desk',
		name: 'On the desk',
		introHtml: '',
		groups: [
			{
				name: 'Input & peripherals',
				items: [
					{
						name: 'Razer DeathAdder Chroma',
						url: 'https://www.razer.com/pc/gaming-mice/deathadder-line',
						descHtml: 'gaming mouse.',
						pin: [89, 62],
					},
					{
						name: 'Apple Magic Trackpad 2',
						url: 'https://www.apple.com/shop/product/MK2C3LL/A/magic-trackpad',
						descHtml: 'for swipe and pinch controls.',
						pin: [74, 67],
					},
					{
						name: 'Razer Goliathus Extended Chroma',
						url: 'https://www.razer.com/gaming-mouse-mats/razer-goliathus-extended-chroma',
						descHtml: 'mousepad with RGB backlighting.',
						pin: [14, 72],
					},
					{
						name: 'Elgato Stream Deck',
						url: 'https://www.elgato.com/en/gaming/stream-deck',
						descHtml:
							'I use this more for productivity shortcuts than streaming. Muting/unmuting in Zoom, launching common workflows, and triggering Home Assistant scenes from my desk.',
						pin: [64, 15],
					},
				],
			},
			{
				name: 'Keyboards',
				items: [
					{
						name: 'Vortexgear Race 3',
						url: 'https://www.amazon.com/gp/product/B072LZ2YRM',
						descHtml: 'with Cherry MX Clear switches.',
					},
					{
						name: 'Custom Vortex POK3R',
						url: 'https://vortexgear.store/products/the-new-pok3r-rgb',
						descHtml:
							"wood case, Cherry MX Blue switches, custom keycap set from WASD Keyboards. I like clicky switches - Blues are the loudest and clickiest. I'd recommend Clears as a good starter switch.",
						pin: [43, 58],
					},
				],
			},
			{
				name: 'Desk & audio',
				items: [
					{
						name: 'Standing Desk',
						url: '',
						descHtml:
							'custom-built IKEA desktop on industrial black steel legs, with a Luna Standing Desk Stool.',
						pin: [7, 47],
					},
					{
						name: 'Sony MDR7506',
						url: 'https://www.amazon.com/Sony-MDR7506-Professional-Diaphragm-Headphone/dp/B000AJIF4E',
						descHtml:
							'professional headphones with upgraded velvet pads. Affordable, comfortable, and sound great.',
					},
					{
						name: 'Philips Hue Play',
						url: 'https://www.bestbuy.com/site/philips-hue-play-white-color-ambiance-smart-led-bar-light-2-pack-multicolor/6298635.p',
						descHtml: 'White & Color Ambiance LED Bar Lights (2-Pack) for desk backlighting.',
					},
					{
						name: 'Aranet4',
						url: 'https://www.amazon.com/dp/B07YY7BH2W',
						descHtml:
							"CO2 monitor on my desk. When the number climbs, I start getting foggy, so it's my cue to open a window or take a break.",
						pin: [79, 10],
					},
					{
						name: 'WiiM Pro',
						url: 'https://www.amazon.com/dp/B0BJDY6D1W',
						descHtml:
							"plays music in my office. It's cheaper than Sonos or Bose multi-room systems, and in my opinion better integrated. I love it.",
						pin: [34, 21],
					},
					{
						name: 'Home Assistant Voice Preview Edition',
						url: 'https://www.home-assistant.io/voice-pe/',
						descHtml:
							'I swapped out all of my Amazon Alexas for these. Voice processing runs locally, not in Amazon\'s cloud. I wrote about <a href="/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/" data-text-link >what it\'s like replacing Alexa</a> if you want to learn more.',
						pin: [31, 9],
					},
					{
						name: 'Bamboo dual monitor stand',
						url: 'https://www.amazon.com/dp/B07H8PXWRW',
						descHtml:
							'42" bamboo riser under the monitors. The shelf holds everything in the top half of this photo.',
						pin: [90, 24],
					},
					{
						name: 'PlayStation DualSense controller',
						url: 'https://www.amazon.com/dp/B0CQKKHT5J',
						descHtml: 'in Midnight Black.',
						pin: [19, 18],
					},
					{
						name: 'Mug warmer',
						url: 'https://www.amazon.com/dp/B07S7DDY6S',
						descHtml: 'a warming plate with a 14 oz ceramic mug.',
					},
				],
			},
		],
		photo: {
			src: '/images/uses/desk-2026-keyboard.webp',
			width: 1920,
			height: 1080,
			alt: "Close-up of Joe's desk in pink backlight: a 60% keyboard with retro grey and cream keycaps in a walnut case, a walnut wrist rest, a white trackpad and a black Razer mouse on a long desk mat, and a shelf above holding a game controller, a WiiM Pro with a Home Assistant voice puck on top, an Anker charging stand, a Stream Deck and an Aranet4 reading 608",
			tall: false,
		},
	},
	{
		slug: 'recording',
		name: 'Recording',
		introHtml:
			"I built a mini recording studio in a corner of my office. It's a second, fully separate setup from my main desk, so I can walk over, plug in one cable, and start recording without tearing anything down.",
		groups: [
			{
				name: 'Recording studio',
				items: [
					{
						name: 'Sony ZV-E10',
						url: 'https://www.amazon.com/dp/B0CRZBWVRN',
						descHtml:
							'mirrorless camera with the 16-50mm kit lens, and the main camera in the studio. It feeds the Mac through an <a href="https://www.amazon.com/dp/B07K3FN5MR" target="_blank" rel="noopener noreferrer" data-text-link >Elgato Cam Link 4K</a> and runs on wall power through a <a href="https://www.amazon.com/dp/B08BCRSV4H" target="_blank" rel="noopener noreferrer" data-text-link >Kimaru dummy battery</a>, so it never dies halfway through a take.',
						pin: [67, 31],
					},
					{
						name: 'Elgato Prompter',
						url: 'https://www.amazon.com/dp/B0CH3P9K1X',
						descHtml:
							'teleprompter with a built-in screen. The camera sits behind the glass, so I can read a script and still look into the lens.',
						pin: [73, 39],
					},
					{
						name: 'Elgato Wave Low Profile Mic Arm (x2)',
						url: '',
						descHtml:
							'one holds the mic in an <a href="https://www.amazon.com/dp/B088P2WK3B" target="_blank" rel="noopener noreferrer" data-text-link >Elgato Wave Shock Mount</a>, the other holds the camera and prompter. Both clamp to the desk, so the whole rig moves as one unit when I shuffle the room around for a better shot.',
						nameHtml:
							'<a href="https://www.amazon.com/dp/B097376LKF" target="_blank" rel="noopener noreferrer" data-text-link >Elgato Wave Low Profile Mic Arm</a> (x2)',
						pin: [28, 59],
					},
					{
						name: 'NEEWER NS4S Softboxes + SMALLRIG Light Stands',
						url: '',
						descHtml:
							'softboxes over my LED panels for soft key and fill light. The stands fold down small and are easy to move when I reposition the camera. An <a href="https://www.amazon.com/dp/B0FBGYRDLW" target="_blank" rel="noopener noreferrer" data-text-link >orange mushroom floor lamp</a> sits in the background because it looks good on camera.',
						nameHtml:
							'<a href="https://www.amazon.com/dp/B0CJM6G7JR" target="_blank" rel="noopener noreferrer" data-text-link >NEEWER NS4S Softboxes</a> + <a href="https://www.amazon.com/dp/B0FMKF8PXJ" target="_blank" rel="noopener noreferrer" data-text-link >SMALLRIG Light Stands</a>',
						pin: [14, 36],
					},
					{
						name: 'FLEXISPOT E6 MAX',
						url: 'https://www.amazon.com/dp/B0HCNVWH1D',
						descHtml: '48x24 acacia dual-motor standing desk.',
						pin: [21, 84],
					},
					{
						name: 'WORKLION cutting mat',
						url: 'https://www.amazon.com/dp/B08Y5R5K5J',
						descHtml:
							'24x36 self-healing mat that covers the desk and doubles as a work surface for crafts and hardware projects.',
						pin: [30, 86],
					},
					{
						name: 'HON Ignition 2.0',
						url: 'https://www.amazon.com/dp/B0FPXPQJBT',
						descHtml: 'ergonomic mesh chair with lumbar support.',
					},
					{
						name: 'Original Prusa i3 MK3S',
						url: 'https://www.prusa3d.com/',
						descHtml:
							'my 3D printer. It lives on a shelf in the recording corner and runs through OctoPrint, so it shows up in Home Assistant like everything else.',
					},
				],
			},
			{
				name: 'Recording software',
				items: [
					{
						name: 'Camtasia',
						url: 'https://www.techsmith.com/camtasia.html',
						descHtml:
							'my go-to for editing tutorial videos. Not as powerful as Premiere, but way faster for the record-edit-export workflow I need for tech content.',
					},
					{
						name: 'Screen Studio',
						url: 'https://www.screen.studio/',
						descHtml:
							'makes screen recordings look polished with auto-zoom and smooth cursor following. I use this for short social media clips and demo GIFs.',
					},
					{
						name: 'Xnip',
						url: 'https://xnipapp.com/',
						descHtml:
							'screenshot tool with annotations and scrolling capture. The scrolling capture is the killer feature - great for grabbing full terminal output or long web pages for blog posts.',
					},
				],
			},
		],
		photo: {
			src: '/images/uses/recording-studio-front.webp',
			width: 1920,
			height: 1080,
			alt: "Joe's recording studio from the front: an acacia standing desk under kitchen cabinets with a green cutting mat, a gridded softbox on the left, a mic on a boom arm, a camera behind a teleprompter on a second arm, and a pink-and-orange watercolor and crayon painting drying on the mat",
			tall: false,
		},
	},
	{
		slug: 'dev-tools',
		name: 'Dev tools',
		introHtml: '',
		groups: [
			{
				name: 'Editors',
				items: [
					{
						name: 'Visual Studio Code',
						url: 'https://code.visualstudio.com/',
						descHtml:
							'still my primary editor. Monokai theme + <a href="https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons" target="_blank" rel="noopener noreferrer" data-text-link >vscode-icons</a>.',
					},
					{
						name: 'Key extensions',
						url: '',
						descHtml:
							'<a href="https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens" target="_blank" rel="noopener noreferrer" data-text-link >GitLens</a>, <a href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode" target="_blank" rel="noopener noreferrer" data-text-link >Prettier</a> + <a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint" target="_blank" rel="noopener noreferrer" data-text-link >ESLint</a>, Docker, Remote SSH, Go/Python/Svelte support.',
					},
				],
			},
			{
				name: 'AI tools',
				items: [
					{
						name: 'Claude Code (CLI)',
						url: '',
						descHtml:
							'my primary coding companion. I use it in the terminal for everything from infrastructure automation to building this website. It manages my homelab, writes deployment scripts, and helps debug across {runningContainers} containers. I wrote about <a href="/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/" data-text-link >building a Claude Code blog skill</a> for this site.',
						nameHtml:
							'<a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" data-text-link >Claude Code</a> (CLI)',
						pin: [30, 45],
					},
					{
						name: 'Claude desktop app',
						url: '',
						descHtml: 'writing, research, and brainstorming.',
						nameHtml:
							'<a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" data-text-link >Claude</a> desktop app',
					},
					{
						name: 'Handy',
						url: 'https://handy.computer/',
						descHtml:
							'local speech-to-text that replaced superwhisper. It is open source and runs NVIDIA Parakeet locally, so nothing I say leaves hardware I own.',
					},
				],
			},
			{
				name: 'Terminal',
				items: [
					{
						name: 'Ghostty',
						url: 'https://ghostty.org/',
						descHtml:
							'replaced iTerm2. Its whole config is one plain text file in my dotfiles, so every Mac gets the same terminal, and its splits suit running several Claude Code sessions side by side. Plain zsh with <a href="https://starship.rs/" target="_blank" rel="noopener noreferrer" data-text-link>Starship</a> for the prompt. More in <a href="/blog/my-development-setup-2026/" data-text-link>my development setup</a>.',
						pin: [8, 6],
					},
					{
						name: 'Dotfiles',
						url: 'https://github.com/JoeKarlsson/dotfiles',
						descHtml: 'config files managed with chezmoi.',
					},
				],
			},
			{
				name: 'Productivity',
				items: [
					{
						name: 'Raycast',
						url: 'https://www.raycast.com/',
						descHtml:
							'replaced Spotlight and Alfred. I use it for clipboard history, snippet expansion, window management scripts, and quick calculations. The extensions ecosystem is what sold me.',
					},
					{
						name: 'Vorssaint',
						url: 'https://vorssaint.com/',
						descHtml:
							"free, open-source menu bar app that bundles a pile of small macOS utilities into one. I'm all in on it across every Mac I own - it makes macOS cleaner and better for me, and I only install the modules I actually use.",
					},
					{
						name: 'Magnet',
						url: 'https://apps.apple.com/us/app/magnet/id441258766?mt=12',
						descHtml:
							'keyboard-driven window snapping. I use thirds layout constantly with the dual monitor setup - editor left, terminal right, browser on the second screen.',
					},
					{
						name: 'Notion',
						url: 'https://www.notion.so/',
						descHtml:
							'personal knowledge base, talk prep, and blog drafts. I tried Obsidian but kept coming back to Notion for the database views and sharing.',
					},
					{
						name: 'LanguageTool (self-hosted)',
						url: '',
						descHtml:
							"grammar and spell checking that runs on my homelab instead of someone else's servers. Catches the typos in blog posts and emails without shipping my drafts to the cloud.",
						nameHtml:
							'<a href="https://github.com/languagetool-org/languagetool" target="_blank" rel="noopener noreferrer" data-text-link >LanguageTool</a> (self-hosted)',
					},
				],
			},
			{
				name: 'Communication & media',
				items: [
					{
						name: 'Rambox',
						url: 'https://rambox.pro/',
						descHtml: 'all messaging clients in one app.',
					},
					{
						name: 'Postiz',
						url: 'https://github.com/gitroomhq/postiz-app',
						descHtml: 'self-hosted social media scheduling (replaced Buffer).',
					},
					{
						name: 'Plex',
						url: 'https://www.plex.tv/',
						descHtml:
							'self-hosted media streaming. <strong class="text-paper"> <a href="https://www.videolan.org/vlc/" target="_blank" rel="noopener noreferrer" data-text-link >VLC</a> </strong> for everything else.',
					},
				],
			},
			{
				name: 'Security & utilities',
				items: [
					{
						name: '1Password',
						url: 'https://1password.com/',
						descHtml:
							'password manager (+ self-hosted <a href="https://github.com/dani-garcia/vaultwarden" target="_blank" rel="noopener noreferrer" data-text-link >Vaultwarden</a> as backup).',
					},
					{
						name: 'Tailscale',
						url: 'https://tailscale.com/',
						descHtml: 'mesh VPN for accessing homelab remotely.',
					},
					{
						name: 'Private Internet Access',
						url: 'https://www.privateinternetaccess.com/',
						descHtml: 'commercial VPN for privacy on public networks.',
					},
					{
						name: 'Docker Desktop',
						url: 'https://www.docker.com/products/docker-desktop/',
						descHtml:
							'local container development. I test homelab configs here before deploying to Proxmox.',
					},
					{
						name: 'Hidden Bar',
						url: 'https://github.com/dwarvesf/hidden',
						descHtml:
							"hides menu bar clutter. With Docker, Tailscale, 1Password, and a dozen others up there, I'd go insane without it.",
					},
				],
			},
		],
		photo: {
			src: '/images/blog/my-development-setup-2026/ghostty-claude-code-splits.webp',
			width: 1920,
			height: 1490,
			alt: 'A Ghostty window split into panes, each running a Claude Code session',
			tall: false,
		},
	},
	{
		slug: 'homelab',
		name: 'Homelab',
		introHtml:
			'I run a two-node <a href="https://www.proxmox.com/en/proxmox-virtual-environment" target="_blank" rel="noopener noreferrer" data-text-link >Proxmox VE</a> cluster with about 70 self-hosted services. Nearly all of them are immutable LXC containers defined in OpenTofu, so every change goes through <code>tofu apply</code> instead of SSH. The full story is in <a href="/blog/homelab-two-years-later/" data-text-link>my homelab two years later</a> and <a href="/blog/opentofu-proxmox-immutable-homelab/" data-text-link>how I made it immutable with OpenTofu</a>. If you\'re just starting out, read my <a href="/blog/how-to-get-started-building-a-homelab-server/" data-text-link>guide to getting started with a homelab</a>.',
		groups: [
			{
				name: 'Server hardware',
				items: [
					{
						name: 'StarTech 25U rack',
						url: 'https://www.amazon.com/dp/B00O6GNLQE',
						descHtml:
							"the open-frame rack in my attic that holds all of it. I didn't know 19 inches was a standard width until I was measuring my R730s with a tape measure.",
						pin: [83, 16],
					},
					{
						name: 'StarTech 8-outlet PDU',
						url: '',
						descHtml:
							'the 1U power strip at the top of the rack, model RKPW081915, with surge and ground lights on the front.',
						pin: [50, 14],
					},
					{
						name: 'prxbox1 - Dell PowerEdge R730',
						url: '',
						descHtml:
							'2x Intel Xeon E5-2698 v4 (80 threads), 128 GB DDR4 ECC, <a href="https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-4000-datasheet.pdf" target="_blank" rel="noopener noreferrer" data-text-link >NVIDIA Quadro RTX 4000</a> (8 GB). The infrastructure node - Home Assistant, networking, monitoring, and the media automation stack.',
						nameHtml:
							'prxbox1 - <a href="https://www.dell.com/support/manuals/en-us/poweredge-r730/r730_ompublication/technical-specifications?guid=guid-c32a42e1-fbc4-4dfe-983d-df4d34ff1e17&lang=en-us" target="_blank" rel="noopener noreferrer" data-text-link >Dell PowerEdge R730</a>',
						pin: [72, 59],
					},
					{
						name: 'prxbox2 - Dell PowerEdge R730',
						url: '',
						descHtml:
							'126 GB RAM, <a href="https://www.nvidia.com/en-us/design-visualization/rtx-a4000/" target="_blank" rel="noopener noreferrer" data-text-link >NVIDIA RTX A4000</a> (16 GB). The GPU node - Plex, Immich, transcoding, and local LLMs.',
						nameHtml:
							'prxbox2 - <a href="https://www.dell.com/support/manuals/en-us/poweredge-r730/r730_ompublication/technical-specifications?guid=guid-c32a42e1-fbc4-4dfe-983d-df4d34ff1e17&lang=en-us" target="_blank" rel="noopener noreferrer" data-text-link >Dell PowerEdge R730</a>',
						pin: [72, 66],
					},
					{
						name: 'Networking between them',
						url: '',
						descHtml:
							'<a href="https://www.intel.com/content/www/us/en/products/sku/83964/intel-ethernet-converged-network-adapter-x710da2/specifications.html" target="_blank" rel="noopener noreferrer" data-text-link >Intel X710</a> 10 Gb SFP+ NICs in 2x10G LACP bonds on each host, and a Raspberry Pi as the QDevice tiebreaker vote for the cluster.',
					},
					{
						name: '2x CyberPower OR1500PFCRT2U',
						url: 'https://www.cyberpowersystems.com/product/ups/pfc-sinewave/or1500pfcrt2u/',
						descHtml:
							'rack UPSes, monitored with NUT so the cluster shuts down cleanly when the power goes out.',
						pin: [72, 78],
					},
					{
						name: 'StarTech 2U sliding shelf',
						url: 'https://www.amazon.com/dp/B003AVPV0U',
						descHtml: 'the vented sliding shelf the Synology sits on.',
						pin: [66, 41.5],
					},
					{
						name: 'Pyle 1U vented shelves (x2)',
						url: 'https://www.amazon.com/dp/B084CZCGFP',
						descHtml: "vented cantilever shelves for the gear that isn't rack-mount.",
						pin: [72, 46],
					},
					{
						name: 'Tecmojo 1U cable management',
						url: 'https://www.amazon.com/dp/B0DP471KGS',
						descHtml: 'slotted wire duct with a cover, above the switches.',
						pin: [40, 17.5],
					},
					{
						name: 'DUO20 rack mount studs',
						url: 'https://www.amazon.com/dp/B0CKB8MHMD',
						descHtml:
							'I love these. They replace the cage nuts and screws that come with the rack and are way easier to use. I recommend them.',
					},
					{
						name: 'Brother P-touch CUBE Plus',
						url: 'https://www.amazon.com/dp/B07HB8LNSY',
						descHtml:
							"Bluetooth label printer (PT-P710BT) that I run from my phone. Every cable in my rack is labeled with it. It's the best, I love it.",
					},
				],
			},
			{
				name: 'GPU workloads',
				items: [
					{
						name: 'RTX A4000 (16 GB)',
						url: '',
						descHtml:
							'Plex hardware transcoding, Immich face and object detection, Tdarr, and local LLMs through Ollama and llama.cpp. I wrote about <a href="/blog/proxmox-gpu-passthrough-multi-service/" data-text-link>sharing one GPU across multiple services</a>.',
					},
					{
						name: 'Quadro RTX 4000 (8 GB)',
						url: '',
						descHtml:
							'Frigate object detection for the security cameras, a Tdarr node, and Wyoming Whisper for local speech-to-text.',
					},
				],
			},
			{
				name: 'Storage & backup',
				items: [
					{
						name: 'Synology DS418play',
						url: 'https://www.synology.com/en-global/products/DS418play',
						descHtml:
							'4-bay NAS serving NFS to the containers for media, photos, documents, and backups.',
						pin: [42, 35],
					},
					{
						name: 'Proxmox Backup Server',
						url: 'https://www.proxmox.com/en/proxmox-backup-server',
						descHtml:
							'daily snapshots of every container and VM, stored on the NAS and synced offsite to <a href="https://www.backblaze.com/cloud-storage" target="_blank" rel="noopener noreferrer" data-text-link >Backblaze B2</a> with rclone.',
					},
				],
			},
			{
				name: 'Networking',
				items: [
					{
						name: 'UniFi Cloud Gateway Ultra',
						url: 'https://store.ui.com/us/en/products/ucg-ultra',
						descHtml:
							'router and firewall across 4 VLANs (Default, Guest, IoT, Cameras). IoT and cameras stay isolated.',
						pin: [44, 27],
					},
					{
						name: 'MikroTik CRS317',
						url: 'https://mikrotik.com/product/crs317_1g_16s_rm',
						descHtml:
							'10G backbone switch, 20 Gbps to each server. A UniFi US-24 handles the 1G devices.',
						pin: [72, 21],
					},
					{
						name: 'UniFi US24',
						url: '',
						descHtml: "24-port 1G switch for everything that doesn't need 10G.",
						pin: [32, 23],
					},
					{
						name: '2x UniFi U7 Pro + U7 Pro XG',
						url: '',
						descHtml: 'WiFi 7 access points.',
						nameHtml:
							'2x <a href="https://ui.com/us/wifi/u7-pro" target="_blank" rel="noopener noreferrer" data-text-link >UniFi U7 Pro</a> + <a href="https://store.ui.com/us/en/products/u7-pro-xg" target="_blank" rel="noopener noreferrer" data-text-link >U7 Pro XG</a>',
					},
					{
						name: 'AdGuard Home',
						url: 'https://adguard.com/en/adguard-home/overview.html',
						descHtml:
							'DNS-level ad blocking, with a primary container and a replica on a Pi kept in sync.',
					},
					{
						name: 'Nginx Proxy Manager + CrowdSec',
						url: '',
						descHtml: 'reverse proxy with SSL, so every service gets a clean local domain.',
						nameHtml:
							'<a href="https://nginxproxymanager.com/" target="_blank" rel="noopener noreferrer" data-text-link >Nginx Proxy Manager</a> + <a href="https://www.crowdsec.net/" target="_blank" rel="noopener noreferrer" data-text-link >CrowdSec</a>',
					},
				],
			},
			{
				name: 'Services (about 70)',
				items: [
					{
						name: 'Media',
						url: '',
						descHtml:
							'Plex, Tautulli, the Arr stack (Sonarr, Radarr, Lidarr, Prowlarr, Bazarr), Tdarr, Kometa, Audiobookshelf, and Lyrion Music Server for the WiiM speakers.',
					},
					{
						name: 'Photos & documents',
						url: '',
						descHtml:
							'Immich (replaced Google Photos), Paperless-ngx + Paperless-AI, and Syncthing for file sync.',
					},
					{
						name: 'Local AI',
						url: '',
						descHtml:
							'Ollama, llama.cpp, LiteLLM as a single API gateway, and Wyoming Whisper for the voice assistant.',
					},
					{
						name: 'Home',
						url: '',
						descHtml: 'Home Assistant, Frigate NVR, and Zigbee2MQTT - more on that below.',
					},
					{
						name: 'Security & access',
						url: '',
						descHtml: 'Authentik for SSO, Vaultwarden, Tailscale, and Cloudflare DDNS.',
					},
					{
						name: 'Monitoring',
						url: '',
						descHtml:
							'Grafana, Prometheus, Loki, Alertmanager, Uptime Kuma, Healthchecks, and Scrutiny for disk health.',
					},
					{
						name: 'Everything else',
						url: '',
						descHtml:
							'Plausible Analytics, LanguageTool, Postiz, and the server that hosts this site.',
					},
				],
			},
		],
		photo: {
			src: '/images/uses/rack-2026.webp',
			width: 999,
			height: 1777,
			alt: 'Full StarTech server rack in the attic, top to bottom: MikroTik and UniFi switches, a UniFi Cloud Gateway, a Synology NAS on a shelf, both Dell R730 servers and two CyberPower UPS units',
			tall: true,
		},
	},
	{
		slug: 'smart-home',
		name: 'Smart home',
		introHtml:
			'My smart home runs on <a href="https://www.home-assistant.io/" target="_blank" rel="noopener noreferrer" data-text-link >Home Assistant</a> with 128 automations, all processed locally on my homelab. I\'ve been running it since 2016, and I wrote up <a href="/blog/best-home-assistant-automations/" data-text-link>my favorite Home Assistant automations</a>, basic to advanced, plus how I keep them from breaking. If you\'re new, start with <a href="/blog/how-to-get-started-with-home-assistant/" data-text-link>getting started with Home Assistant</a>. I also wrote about how I <a href="/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/" data-text-link >replaced Alexa with local voice control</a>.',
		groups: [
			{
				name: 'Core platform',
				items: [
					{
						name: 'Home Assistant OS',
						url: 'https://www.home-assistant.io/',
						descHtml: 'running as a VM on Proxmox with a dedicated MariaDB database.',
					},
					{
						name: 'Zigbee2MQTT',
						url: 'https://github.com/Koenkk/zigbee2mqtt',
						descHtml:
							"29 Zigbee devices on a ConBee II, no proprietary hubs. I'm staying on Zigbee rather than moving to Matter.",
					},
					{
						name: 'Frigate',
						url: 'https://frigate.video/',
						descHtml:
							'local NVR with person detection and face recognition on a GPU. It drives motion lighting and package detection.',
					},
					{
						name: 'Local voice and AI',
						url: '',
						descHtml:
							'Wyoming faster-whisper on a GPU, Piper for text-to-speech, and Ollama through the AI Task integration, with 4 <a href="https://www.home-assistant.io/voice-pe/" target="_blank" rel="noopener noreferrer" data-text-link >Home Assistant Voice Preview Edition</a> satellites.',
					},
					{
						name: 'HACS',
						url: 'https://hacs.xyz/',
						descHtml:
							'kept to the few custom integrations that earn it, like <a href="https://github.com/nielsfaber/alarmo" target="_blank" rel="noopener noreferrer" data-text-link >Alarmo</a> and <a href="https://github.com/slashback100/presence_simulation" target="_blank" rel="noopener noreferrer" data-text-link >Presence Simulation</a>.',
					},
					{
						name: 'Apple HomeKit bridge',
						url: 'https://www.home-assistant.io/integrations/homekit/',
						descHtml: 'exposes key entities to Siri.',
					},
				],
			},
			{
				name: 'Dashboards',
				items: [
					{
						name: 'Lovelace dashboards',
						url: '',
						descHtml:
							'Custom Lovelace dashboards for different form factors - desktop overview, phone, and tablet views. Built with community cards: <a href="https://github.com/piitaya/lovelace-mushroom" target="_blank" rel="noopener noreferrer" data-text-link >Mushroom Cards</a>, <a href="https://github.com/Clooos/Bubble-Card" target="_blank" rel="noopener noreferrer" data-text-link >Bubble Card</a>, <a href="https://github.com/RomRider/apexcharts-card" target="_blank" rel="noopener noreferrer" data-text-link >ApexCharts Card</a>, <a href="https://github.com/kalkih/mini-media-player" target="_blank" rel="noopener noreferrer" data-text-link >Mini Media Player</a>, <a href="https://github.com/kalkih/mini-graph-card" target="_blank" rel="noopener noreferrer" data-text-link >Mini Graph Card</a>, <a href="https://github.com/custom-cards/button-card" target="_blank" rel="noopener noreferrer" data-text-link >Button Card</a>.',
						pin: [50, 40],
					},
				],
			},
			{
				name: 'Devices',
				items: [
					{
						name: 'Lighting & climate',
						url: '',
						descHtml:
							'Philips Hue lights on a Hue Bridge Pro, with Hue motion sensors and dimmers; Lutron Aurora dimmers and Zigbee buttons; 2x ecobee3 lite thermostats with room sensors; Levoit humidifier (winter only).',
					},
					{
						name: 'Security & safety',
						url: '',
						descHtml:
							'Reolink video doorbell and floodlight camera; Tapo C210 indoor camera; 4x Aqara leak sensors and a Heiman smoke detector; Zigbee door contacts, an Aqara FP2 presence sensor, and an Aranet4 CO2 monitor.',
					},
					{
						name: 'Audio',
						url: '',
						descHtml:
							'4x Audio Pro A10 MkII speakers running WiiM firmware; WiiM Pro and WiiM Mini; Multi-room audio through <a href="https://github.com/LMS-Community/slimserver" target="_blank" rel="noopener noreferrer" data-text-link >Lyrion Music Server</a> and Music Assistant.',
					},
					{
						name: 'Other',
						url: '',
						descHtml:
							'2x Roomba vacuums; Meross garage door opener; Sengled and Securifi Zigbee plugs (energy monitoring); Prusa MK3S 3D printer through OctoPrint; Hue Play HDMI Sync Box and a Broadlink IR blaster.',
					},
				],
			},
		],
		photo: {
			src: '/images/blog/best-home-assistant-automations/dashboard-overview.webp',
			width: 1734,
			height: 1035,
			alt: 'The overview dashboard in Home Assistant',
			tall: false,
		},
	},
];
