/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Monaco', 'monospace'],
				sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
			},
			colors: {
				// Warm, fun palette inspired by old site
				coral: '#fdae84',
				teal: '#8bcbc8',
				mint: '#6ee7b7',
				lavender: '#c4b5fd',
				pink: '#f9a8d4',
				sky: '#7dd3fc',
				terminal: {
					green: '#4ade80',
					blue: '#60a5fa',
					purple: '#c084fc',
					yellow: '#fbbf24',
					red: '#f87171',
					cyan: '#22d3ee',
				},
				surface: {
					0: '#0a0a0a',
					1: '#111111',
					2: '#1a1a1a',
					3: '#222222',
					4: '#2a2a2a',
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
