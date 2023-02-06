module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
	},
	extends: ['prettier', 'plugin:import/errors', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'prettier/prettier': 'error',
		'new-cap': 'off',
		'no-console': 'off',
		'no-fallthrough': 'off',
		'no-new': 'off',
		'no-useless-constructor': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ args: 'none', argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
		],
		'@typescript-eslint/no-var-requires': 'off',
		'react-refresh/only-export-components': 'warn',
	},
	settings: {
		'import/resolver': {
			node: {
				paths: ['src', 'types', '', 'dist'],
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
			},
			'eslint-import-resolver-typescript': true,
			typescript: {
				alwaysTryTypes: true,
			},
		},
		'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
	},
	plugins: ['prettier', '@typescript-eslint', 'import', 'react-refresh'],
	parser: '@typescript-eslint/parser',
};
