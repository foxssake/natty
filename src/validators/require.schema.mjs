import { ajv } from '../ajv.mjs'
import { requireParam } from '../assertions.mjs'
import { Validator } from './validator.mjs'

export class SchemaValidationError extends Error { }

export class SchemaValidator extends Validator {
  #ajv
  #schema

  /**
  * Construct validator
  * @param {object} options Options
  * @param {ajv} options.ajv ajv
  * @param {string} options.schema Schema name
  */
  constructor (options) {
    super()
    this.#ajv = requireParam(options.ajv)
    this.#schema = requireParam(options.schema)
  }

  validate (body, _header, _context) {
    if (!this.#ajv.validate(this.#schema, body)) {
      throw new SchemaValidationError('Body does not match schema!')
    }
  }
}

/**
* Validates that the message body fits the given schema.
* @param {string} schema Schema name
* @returns {ReadHandler}
*/
export function requireSchema (schema) {
  return new SchemaValidator({ ajv, schema }).asFunction()
}
