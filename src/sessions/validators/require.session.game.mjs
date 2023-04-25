/* eslint-disable */
import { GameRepository } from '../../games/game.repository.mjs'
/* eslint-enable */
import { requireParam } from '../../assertions.mjs'
import { gameRepository } from '../../games/games.mjs'
import { asSingletonFactory } from '../../utils.mjs'
import { ExtractMapperValidator } from '../../validators/extract.mapper.validator.mjs'
import { InvalidSessionError } from './require.session.mjs'

/**
* Extract the game from session into context.
*
* Needs `session` to be in context, by calling `requireSession` first.
*
* Saves user in `context.game`
*
* @returns {ReadHandler}
*/
export class SessionGameIdValidator extends ExtractMapperValidator {
  /**
  * Construct validator.
  * @param {object} options Options
  * @param {GameRepository} options.gameRepository Game repository
  */
  constructor (options) {
    requireParam(options.gameRepository)

    super({
      extractor: (_b, _h, context) => context.session.gameId,
      mapper: id => options.gameRepository.find(id),
      writer: (context, game) => { context.game = game },
      thrower: () => {
        throw new InvalidSessionError('No game found for session!')
      }
    })
  }
}

export const requireSessionGame = asSingletonFactory(() =>
  new SessionGameIdValidator({
    gameRepository
  }).asFunction()
)
