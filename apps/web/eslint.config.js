import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import solid from 'eslint-plugin-solid';

export default [
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				HTMLElement: 'readonly',
				HTMLDivElement: 'readonly',
				HTMLButtonElement: 'readonly',
				HTMLInputElement: 'readonly',
				Event: 'readonly',
				EventTarget: 'readonly',
				Element: 'readonly',
				Node: 'readonly',
				fetch: 'readonly',
				alert: 'readonly',
				confirm: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			solid: solid,
		},
		rules: {
			...js.configs.recommended.rules,
			...tseslint.configs.recommended.rules,
			...solid.configs.recommended.rules,

			// Additional rules for React/SolidJS
			'no-console': 'warn', // Warn instead of error for console.log
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		files: ['**/*.js', '**/*.jsx'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
		},
	},
];
