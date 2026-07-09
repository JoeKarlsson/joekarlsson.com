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
		ignores: ['dist/', '.astro/', 'node_modules/', '.lighthouseci/', 'scripts/'],
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
