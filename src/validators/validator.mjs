/* eslint-disable */
import { MessageHeader } from '@elementbound/nlon'
/* eslint-enable */

/**
* Base class for validators.
*/
export class Validator {
  /**
  * Validate message.
  * @param {any} body Message body
  * @param {MessageHeader} header Message header
  * @param {object} context Message context
  */
  validate (body, header, context) {
    // validate
  }
}
