/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { GameData } from '../games/game.data.mjs'
/* eslint-enable */
import { ajv } from '../ajv.mjs'
import { gameRepository } from '../games/games.mjs'
import { requireGame } from '../games/validation.mjs'
import { requireBody } from '../validators/require.body.mjs'
import { requireAuthorization } from '../validators/require.header.mjs'
import { requireSchema } from '../validators/require.schema.mjs'
import { sessionRepository, sessionService } from './sessions.mjs'
import { requireSession } from './validators/require.session.mjs'

function registerSchemas (ajv) {
  ajv.addSchema({
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }, 'session/login')
}

/**
* Configure subjects for session handling.
* @param {Server} server nlon server
*/
export function sessionSubjects (server) {
  registerSchemas(ajv)

  server.handle('session/login', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('session/login'),
      requireGame(gameRepository)
    )

    /** @type {string} */
    const { name } = request
    /** @type {GameData} */
    const game = corr.context.game

    const session = sessionService.create(name, game, peer)
    corr.finish({ session })
  })

  server.handle('session/logout', async (_p, corr) => {
    await corr.next(
      requireAuthorization(),
      requireSession(sessionRepository, sessionService)
    )
    const { session } = corr.context

    sessionService.destroy(session)
    corr.finish()
  })
}
