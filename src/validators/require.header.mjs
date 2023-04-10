import { requireParam } from '../assertions.mjs'
import { Validator } from './validator.mjs'

export class MissingHeaderError extends Error { }

export class HeaderValidator extends Validator {
  #header

  /**
  * Construct validator
  * @param {string} header Header
  */
  constructor (header) {
    super()
    this.#header = requireParam(header)
  }

  validate (_body, header, _context) {
    if (header[this.#header] === undefined) {
      // TODO: Throw standardized nlon error?
      throw (this.#header === 'authorization')
        ? new MissingHeaderError('Missing authorization header')
        : new MissingHeaderError(`Missing header: ${this.#header}`)
    }
  }
}

// TODO: asSingletonFactory
const authValidator = new HeaderValidator('authorization')
const authFunction = authValidator.asFunction()

/**
* Validate that header is present.
* @param {string} name Header name
* @returns {ReadHandler}
*/
export function requireHeader (name) {
  return new HeaderValidator(name).asFunction()
}

/**
* Validate that an authorization header is present.
* @returns {ReadHandler}
*/
export function requireAuthorization () {
  return authFunction
}
