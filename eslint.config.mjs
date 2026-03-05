import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	{
		ignores: ['dist/', '.astro/', 'node_modules/', '.lighthouseci/'],
	},
	{
		rules: {
			// Relaxed for existing code
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-console': 'warn',
			// Response is a global in Astro endpoints
			'no-undef': 'off',
			// let vs const - warn only
			'prefer-const': 'warn',
		},
	},
];
