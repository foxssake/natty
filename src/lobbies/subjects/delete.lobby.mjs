/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { User } from '../../users/user.mjs'
/* eslint-enable */
import { sessionRepository, sessionService } from '../../sessions/sessions.mjs'
import { requireSession, requireSessionUser } from '../../sessions/validation.mjs'
import { userRepository } from '../../users/users.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { lobbyParticipantRepository, lobbyRepository, lobbyService } from '../lobbies.mjs'
import { ajv } from '../../ajv.mjs'
import { requireBody } from '../../validators/require.body.mjs'
import { requireSchema } from '../../validators/require.schema.mjs'
import { requireLobby } from '../validation.mjs'
import { LobbyData } from '../lobby.data.mjs'

// TODO: Standard error? Maybe in nlon?
class UnauthorizedError extends Error { }

/**
* Register delete lobby subject handler.
* @param {Server} server nlon server
*/
export function deleteLobbySubject (server) {
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
  }, 'lobby/delete')

  server.handle('lobby/delete', async (_peer, corr) => {
    await corr.next(
      requireBody(),
      requireSchema('lobby/delete'),
      requireAuthorization(),
      requireSession(sessionRepository, sessionService),
      requireSessionUser(userRepository),
      requireLobby(lobbyRepository, body => body.lobby.id)
    )

    /** @type {User} */
    const user = corr.context.sessionUser

    /** @type {LobbyData} */
    const lobby = corr.context.lobby

    // Deny if not owner
    if (lobby.owner !== user.id) {
      throw new UnauthorizedError('User is not the owner of lobby')
    }

    // Delete
    lobbyService.delete(lobby)
    corr.finish()
  })
}
