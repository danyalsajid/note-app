import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	{
		files: ['**/*.ts', '**/*.js'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				global: 'readonly',
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			...js.configs.recommended.rules,
			...tseslint.configs.recommended.rules,

			// Additional rules for Node.js/Express
			'no-console': 'off', // Allow console.log in server code
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
		files: ['**/*.js'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
		},
	},
];
