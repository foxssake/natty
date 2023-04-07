import { mock } from 'node:test'

/**
* Extract method names from class string.
* @param {string} str
* @returns {string[]} Potential method names
*/
function extractMethods (str) {
  const pattern = /^\s*([\w\d$_]+)\s*\([\w\d$_,\s]*\)\s*\{/mg

  return [...str.matchAll(pattern)]
    .map(match => match[1])
    .filter(method => method !== 'constructor')
}

/**
* Create a mock instance of a class without instantiating the class itself.
* @param {Function...} classes Classes
* @returns {object} Object with mocked methods
*/
export function mockClass (...classes) {
  const methods = classes.flatMap(c => extractMethods(c.toString()))

  return Object.fromEntries(
    methods.map(name => ([name, mock.fn(() => {})]))
  )
}
