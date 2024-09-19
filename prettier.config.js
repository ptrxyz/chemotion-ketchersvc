'use strict'

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const baseConfig = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	tabWidth: 4,
	semi: false,
	htmlWhitespaceSensitivity: 'ignore',
	plugins: [],
	overrides: [
		{
			files: ['*.json', '*.yaml'],
			options: {
				tabWidth: 2,
				useTabs: false
			}
		}
	]
}

export default baseConfig
