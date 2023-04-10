import { Correspondence } from '@elementbound/nlon'
import { Validator } from './validator.mjs'

export class MissingBodyError extends Error { }

export class BodyPresenceValidator extends Validator {
  validate (body, _header, _context) {
    if (body === undefined || body === null || body === Correspondence.End) {
      throw new MissingBodyError('Missing message body!')
    }
  }
}

// TODO: asSingletonFactory
const validatorInstance = new BodyPresenceValidator()
const validatorFunction = validatorInstance.asFunction()

/**
* Validate that there is a message body present.
* @returns {ReadHandler}
*/
export function requireBody () {
  return validatorFunction
}
