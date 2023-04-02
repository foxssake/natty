/* eslint-disable */
import { Server } from '@elementbound/nlon'
/* eslint-enable */
import { ajv } from '../../ajv.mjs'
import { sessionRepository, sessionService } from '../../sessions/sessions.mjs'
import { requireSession, requireSessionUser } from '../../sessions/validation.mjs'
import { userRepository } from '../../users/users.mjs'
import { requireBody } from '../../validators/require.body.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { requireSchema } from '../../validators/require.schema.mjs'
import { lobbyService } from '../lobbies.mjs'

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

  server.handle('lobby/create', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('lobby/create'),
      requireAuthorization(),
      requireSession(sessionRepository, sessionService),
      requireSessionUser(userRepository)
    )

    /** @type {string} */
    const name = request.name

    const lobby = lobbyService.create(name, corr.context.sessionUser)
    corr.finish(CreateLobbyResponse(lobby))
  })
}
