/* eslint-disable */
import { SessionService } from '../session.service.mjs'
/* eslint-enable */
import { requireParam } from '../../assertions.mjs'
import { asSingletonFactory } from '../../utils.mjs'
import { Validator } from '../../validators/validator.mjs'
import { sessionService } from '../sessions.mjs'

export class InvalidSessionError extends Error { }

export class SessionPresenceValidator extends Validator {
  /** @type {SessionService} */
  #sessionService

  /**
  * Construct validator.
  * @param {object} options Options
  * @param {SessionService} options.sessionService Session service
  */
  constructor (options) {
    super()
    this.#sessionService = requireParam(options.sessionService)
  }

  validate (_body, header, context) {
    const sessionId = header.authorization
    const session = this.#sessionService.validate(sessionId)

    if (session === undefined) {
      throw new InvalidSessionError(`Invalid session: ${sessionId}`)
    }

    context.session = session
  }
}
/**
* Check if message has a valid session.
*
* Saves session in `context.session`.
*
* @param {SessionRepository} sessionRepository Session repository
* @param {SessionService} sessionService Session service
* @returns {ReadHandler}
*/
export const requireSession = asSingletonFactory(() =>
  new SessionPresenceValidator({
    sessionService
  }).asFunction()
)
