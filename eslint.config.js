// ts-check
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import-x'
import globals from 'globals'
import ts from 'typescript-eslint'

const projects = ['./tsconfig.json', './tsconfig.eslint.json']

export default ts.config(
	js.configs.recommended,
	...ts.configs.strict,
	...ts.configs.stylistic,
	prettier,
	{
		languageOptions: {
			parser: ts.parser,
			parserOptions: {
				project: projects,
				warnOnUnsupportedTypeScriptVersion: false
			},
			globals: {
				...globals.node
			}
		}
	},
	{
		plugins: { 'import-x': eslintPluginImport },
		settings: { 'import-x/resolver': [{ typescript: { project: projects } }] }
	},
	{
		ignores: ['.vscode/**', 'node_modules/**']
	},
	{
		rules: {
			'no-undef': 'off', // TypeScript already checks for undefined variables
			'no-unused-vars': 'off', // TypeScript already checks for unused variables
			'no-throw-literal': 'off',
			'@typescript-eslint/only-throw-error': 'error',
			'prefer-promise-reject-errors': 'off',
			'@typescript-eslint/prefer-promise-reject-errors': 'error',
			'@typescript-eslint/promise-function-async': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'require-await': 'off',
			'@typescript-eslint/require-await': 'off',
			'no-return-await': 'off',
			'@typescript-eslint/return-await': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/consistent-type-assertions': [
				'error',
				{
					assertionStyle: 'as',
					objectLiteralTypeAssertions: 'allow-as-parameter'
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^[_|$$]',
					caughtErrorsIgnorePattern: '^_'
				}
			]
		}
	},
	{
		rules: {
			'import-x/order': [
				'error',
				{
					alphabetize: { order: 'asc' },
					groups: [
						'type',
						'external',
						['object', 'builtin', 'internal', 'parent', 'index', 'sibling', 'unknown']
					],
					'newlines-between': 'always'
				}
			],
			'import-x/newline-after-import': ['error', { count: 1 }],
			'import-x/no-unresolved': ['error', { ignore: ['bun'] }]
		}
	}
)
