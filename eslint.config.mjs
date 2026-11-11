import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	{
		files: ['*.astro', '**/*.astro'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.astro'],
			},
		},
	},
	{
		files: ['**/*.astro/*.js', '*.astro/*.js'],
		languageOptions: {
			parser: tsParser,
		},
	},
	{
		ignores: [
			'dist/',
			'.astro/',
			'node_modules/',
			'.lighthouseci/',
			'scripts/',
			'.claude/worktrees/',
			// Third-party files copied unchanged, under their own licenses (SOURCES.md)
			'.claude/skills/*/vendor/',
			// Git-ignored originals and one-off render scripts (.gitignore); never shipped
			'media-sources/',
		],
	},
	{
		// Code that runs in the browser. Pages enforce Trusted Types (src/integrations/script-csp.mjs),
		// so an HTML string written into the DOM throws on the live site, while e2e, which runs
		// on the dev server without that policy, passes. Build DOM with createElement and textContent.
		files: ['src/scripts/**', 'src/components/**', 'src/layouts/**', 'src/pages/**'],
		rules: {
			'no-restricted-properties': [
				'error',
				...['innerHTML', 'outerHTML', 'insertAdjacentHTML'].map((property) => ({
					property,
					message:
						'Trusted Types blocks HTML strings on the live site; use createElement and textContent.',
				})),
			],
			'no-restricted-syntax': [
				'error',
				{
					selector:
						"CallExpression[callee.object.name='document'][callee.property.name=/^write(ln)?$/]",
					message: 'Trusted Types blocks document.write on the live site.',
				},
			],
		},
	},
	{
		rules: {
			// Relaxed for existing code
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/ban-ts-comment': [
				'warn',
				{ 'ts-nocheck': 'allow-with-description', minimumDescriptionLength: 10 },
			],
			'no-console': 'warn',
			// Response is a global in Astro endpoints
			'no-undef': 'off',
			// let vs const - warn only
			'prefer-const': 'warn',
		},
	},
];
