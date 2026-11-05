/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Monaco', 'monospace'],
				sans: ['"Recursive"', 'system-ui', '-apple-system', 'sans-serif'],
			},
			colors: {
				// Coral is the one accent; teal and lavender are terminal-only syntax colors.
				coral: '#fdae84',
				teal: '#8bcbc8',
				lavender: '#c4b5fd',
				surface: {
					0: '#0a0a0a',
					1: '#111111',
					2: '#1a1a1a',
					3: '#222222',
					4: '#3a3a3a',
				},
			},
			typography: {
				DEFAULT: {
					css: {
						'code::before': { content: '""' },
						'code::after': { content: '""' },
					},
				},
			},
		},
	},
	plugins: [],
};
