/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { User } from '../../users/user.mjs'
import { LobbyData } from '../lobby.data.mjs'
/* eslint-enable */
import { ajv } from '../../ajv.mjs'
import { sessionRepository, sessionService } from '../../sessions/sessions.mjs'
import { requireSession, requireSessionUser } from '../../sessions/validation.mjs'
import { userRepository } from '../../users/users.mjs'
import { requireBody } from '../../validators/require.body.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { requireSchema } from '../../validators/require.schema.mjs'
import { lobbyParticipantRepository, lobbyRepository, lobbyService } from '../lobbies.mjs'
import { requireLobby } from '../validation.mjs'

class AlreadyInLobbyError extends Error { }

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
      requireSession(sessionRepository, sessionService),
      requireSessionUser(userRepository),
      requireLobby(lobbyRepository, body => body.lobby.id)
    )

    /** @type {User} */
    const user = corr.context.sessionUser
    /** @type {LobbyData} */
    const lobby = corr.context.lobby

    // If user is already in a lobby, reject
    if (lobbyParticipantRepository.getLobbyOf(user.id)) {
      throw new AlreadyInLobbyError('User is already in a lobby!')
    }

    // Join
    lobbyService.join(user, lobby)

    corr.finish()
  })
}
