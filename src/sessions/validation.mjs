/* eslint-disable */
import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
/* eslint-enable */
import { InvalidSessionError } from './error.mjs'

/**
* Check if message has a valid session.
*
* Saves session in context.
*
* @param {SessionRepository} sessionRepository Session repository
* @param {SessionService} sessionService Session service
* @returns {ReadHandler}
*/
export function requireSession (sessionRepository, sessionService) {
  return function (_body, header, context) {
    const sessionId = header.authorization
    const session = sessionRepository.find(sessionId)

    if (!session || !sessionService.validate(sessionId)) {
      throw new InvalidSessionError(`Invalid session: ${sessionId}`)
    }

    context.session = session
  }
}
