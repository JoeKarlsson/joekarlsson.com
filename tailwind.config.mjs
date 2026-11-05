/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				// CSS variables from the fonts in astro.config.mjs, each ending in its fallbacks
				mono: ['var(--font-jetbrains-mono)'],
				sans: ['var(--font-hanken-grotesk)'],
				display: ['var(--font-anton)'],
				serif: ['"Fraunces"', 'Georgia', 'serif'],
			},
			colors: {
				// Redesign tokens: black ink, paper-white text, gray metadata, one hot pink accent.
				ink: '#000000',
				paper: '#ededed',
				muted: '#a3a3a3',
				pink: '#ff4fd8',
				surface: {
					1: '#111111',
					2: '#1a1a1a',
					3: '#222222',
					4: '#3a3a3a',
				},
			},
		},
	},
	plugins: [],
};
