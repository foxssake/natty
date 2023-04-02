/* eslint-disable */
import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
import { SessionData } from './session.data.mjs'
import { UserRepository } from '../users/user.repository.mjs'
/* eslint-enable */
import { InvalidSessionError } from './error.mjs'

/**
* Check if message has a valid session.
*
* Saves session in `context.session`.
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

/**
* Extract the user from session into context.
*
* Needs `session` to be in context, by calling `requireSession` first.
*
* Saves user in `context.sessionUser`
*
* @param {UserRepository} userRepository User repository
* @returns {ReadHandler}
*/
export function requireSessionUser (userRepository) {
  return function (_body, _header, context) {
    /** @type {SessionData} */
    const session = context.session

    if (!session) {
      throw new InvalidSessionError('Session missing from context!')
    }

    context.sessionUser = userRepository.find(session.userId)
    if (!context.sessionUser) {
      throw new InvalidSessionError('No user found for session!')
    }
  }
}
