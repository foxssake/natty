import { ajv } from '../ajv.mjs'

export class SchemaValidationError extends Error {
  #errors
  #body
  #schema

  constructor (errors, body, schema) {
    super('Input data doesn\'t fit schema!')

    this.#errors = errors
    this.#body = body
    this.#schema = schema
  }

  get errors () {
    return this.#errors
  }

  get body () {
    return this.#body
  }

  get schema () {
    return this.#schema
  }
}

export function requireSchema (schema) {
  return function (body, _header, _context) {
    if (!ajv.validate(schema, body)) {
      throw new SchemaValidationError(ajv.errors, body, schema)
    }
  }
}
