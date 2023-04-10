/* eslint-disable */
import { SessionData } from './session.data.mjs'
import { UserRepository } from '../users/user.repository.mjs'
import { GameRepository } from '../games/game.repository.mjs'
/* eslint-enable */
import { InvalidSessionError } from './validators/require.session.mjs'

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

/**
* Extract the game from session into context.
*
* Needs `session` to be in context, by calling `requireSession` first.
*
* Saves user in `context.sessionGame`
*
* @param {GameRepository} gameRepository Game repository
* @returns {ReadHandler}
*/
export function requireSessionGame (gameRepository) {
  return function (_body, _header, context) {
    /** @type {SessionData} */
    const session = context.session

    if (!session) {
      throw new InvalidSessionError('Session missing from context!')
    }

    context.sessionGame = gameRepository.find(session.gameId)
    if (!context.sessionGame) {
      throw new InvalidSessionError('No game found for session!')
    }
  }
}
