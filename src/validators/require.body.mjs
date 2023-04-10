import { Correspondence } from '@elementbound/nlon'
import { asSingletonFactory } from '../utils.mjs'
import { Validator } from './validator.mjs'

export class MissingBodyError extends Error { }

export class BodyPresenceValidator extends Validator {
  validate (body, _header, _context) {
    if (body === undefined || body === null || body === Correspondence.End) {
      throw new MissingBodyError('Missing message body!')
    }
  }
}

/**
* Validate that there is a message body present.
* @returns {ReadHandler}
*/
export const requireBody = asSingletonFactory(() =>
  new BodyPresenceValidator().asFunction()
)
