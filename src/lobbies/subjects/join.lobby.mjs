/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { User } from '../../users/user.mjs'
import { LobbyData } from '../lobby.data.mjs'
/* eslint-enable */
import { ajv } from '../../ajv.mjs'
import { requireBody } from '../../validators/require.body.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { requireSchema } from '../../validators/require.schema.mjs'
import { lobbyRepository, lobbyService } from '../lobbies.mjs'
import { requireLobby } from '../validation.mjs'
import { requireSession } from '../../sessions/validators/require.session.mjs'
import { requireSessionUser } from '../../sessions/validators/require.session.user.mjs'

/**
* Register leave lobby subject handler.
* @param {Server} server nlon server
*/
export function joinLobbySubject (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      lobby: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, 'lobby/join')

  server.handle('lobby/join', async (_peer, corr) => {
    await corr.next(
      requireBody(),
      requireSchema('lobby/join'),
      requireAuthorization(),
      requireSession(),
      requireSessionUser(),
      requireLobby(lobbyRepository, body => body.lobby.id)
    )

    /** @type {User} */
    const user = corr.context.user
    /** @type {LobbyData} */
    const lobby = corr.context.lobby

    // Join
    lobbyService.join(user, lobby)

    corr.finish()
  })
}
