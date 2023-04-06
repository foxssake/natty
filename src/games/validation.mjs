/* eslint-disable */
import { GameRepository } from './game.repository.mjs'
/* eslint-enable */

export class InvalidGameError extends Error { }

/**
* Check if message has a valid game.
*
* Saves game in `context.game`.
*
* @param {GameRepository} gameRepository Game repository
* @returns {ReadHandler}
*/
export function requireGame (gameRepository) {
  return function (_body, header, context) {
    context.game = gameRepository.find(header.game)
    if (!context.game) {
      throw new InvalidGameError('Invalid game specified!')
    }
  }
}
