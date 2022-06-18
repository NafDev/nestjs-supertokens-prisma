module.exports = {
	prettier: true,
	envs: ['es2022', 'node'],
	rules: {
		'import/extensions': 'off',
		'new-cap': [
			'error',
			{
				capIsNewExceptionPattern: '^@*'
			}
		],
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'variableLike',
				format: ['camelCase', 'UPPER_CASE', 'PascalCase']
			},
			{
				selector: 'property',
				format: ['camelCase', 'PascalCase']
			}
		]
	}
};
