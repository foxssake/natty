import { config } from '../config.mjs'
import logger from '../logger.mjs'
import { Natty } from '../natty.mjs'
import { GameData } from './game.data.mjs'
import { GameRepository } from './game.repository.mjs'

/**
* Parse all games described in text.
*
* Each game should have its own line in the text, in the form of
* `<id> <name>`.
*
* Empty lines and lines not matching the format are ignored.
*
* @param {string} text Text
* @returns {GameData[]} Games
*/
export function parseGamesConfig (text) {
  const gameRegex = /(\S*)\s+(.+)/
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => gameRegex.test(l))
    .map(l => gameRegex.exec(l))
    .map(([_, id, name]) => new GameData({ id, name }))
    .map(game => Object.freeze(game))
}

export const gameRepository = new GameRepository()

Natty.hook(natty => {
  const log = logger.child({ name: 'Games' })

  log.info('Parsing games from config')
  parseGamesConfig(config.games)
    .forEach(game => {
      log.info({ game }, 'Adding game')
      gameRepository.add(game)
    })
})
