/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { User } from '../../users/user.mjs'
import { GameData } from '../../games/game.data.mjs'
/* eslint-enable */
import { ajv } from '../../ajv.mjs'
import { gameRepository } from '../../games/games.mjs'
import { requireSession, requireSessionGame } from '../../sessions/validation.mjs'
import { requireBody } from '../../validators/require.body.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { requireSchema } from '../../validators/require.schema.mjs'
import { lobbyService } from '../lobbies.mjs'
import { requireSessionUser } from '../../sessions/validators/require.session.user.mjs'

function CreateLobbyResponse (lobby) {
  return {
    lobby: {
      id: lobby.id
    }
  }
}

/**
* Register create lobby subject handler.
* @param {Server} server nlon server
*/
export function createLobbySubject (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }, 'lobby/create')

  server.handle('lobby/create', async (_peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('lobby/create'),
      requireAuthorization(),
      requireSession(),
      requireSessionUser(),
      requireSessionGame(gameRepository)
    )

    /** @type {string} */
    const name = request.name
    /** @type {User} */
    const user = corr.context.user
    /** @type {GameData} */
    const game = corr.context.sessionGame

    const lobby = lobbyService.create(name, user, game)
    corr.finish(CreateLobbyResponse(lobby))
  })
}
