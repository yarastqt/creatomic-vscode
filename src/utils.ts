import * as changeCase from 'change-case'


export function normalizeFileName(name, fileNamingCase) {
	switch (fileNamingCase) {
		case 'kebab-case':
			return changeCase.paramCase(name)

		case 'UpperCamelCase':
			return changeCase.pascalCase(name)

		case 'lowerCamelCase':
			return changeCase.camelCase(name)

		case 'snake_case':
			return changeCase.snakeCase(name)
	}

	return name
}

export function normalizeComponentName(name) {
	return changeCase.pascalCase(name)
}
