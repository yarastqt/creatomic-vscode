import * as changeCase from 'change-case'
import * as esTemplater from 'es6-template'


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

export function templater(template, data) {
  const extendedData = Object.assign(data, {
    nl: '\n',
    nl2: '\n\r\n\r',
  })
  return esTemplater(template, extendedData)
}
