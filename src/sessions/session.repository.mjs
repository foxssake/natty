/* eslint-disable */
import { SessionData } from './session.data.mjs'
/* eslint-enable */
import { Repository } from '../repository.mjs'

/**
* Repository to manage session data.
* @extends {Repository<SessionData, string>}
*/
export class SessionRepository extends Repository {
  /**
  * Find all sessions of the given user(s).
  * @param {...string} userIds User id's
  * @returns {SessionData[]} Sessions
  */
  findSessionsOf (...userIds) {
    return [...this.list()]
      .filter(s => userIds.includes(s.userId))
  }

  /**
  * Find all sessions of the given user(s) for a game.
  * @param {string} gameId Game id
  * @param {...string} userIds User id's
  * @returns {SessionData[]} Sessions
  */
  findSessionsByGameFor (gameId, ...userIds) {
    return [...this.list()]
      .filter(s => s.gameId === gameId)
      .filter(s => userIds.includes(s.userId))
  }
}

export const sessionRepository = new SessionRepository()
