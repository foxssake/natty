/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { User } from '../../users/user.mjs'
/* eslint-enable */
import { sessionRepository, sessionService } from '../../sessions/sessions.mjs'
import { requireSession, requireSessionUser } from '../../sessions/validation.mjs'
import { userRepository } from '../../users/users.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { lobbyParticipantRepository, lobbyRepository, lobbyService } from '../lobbies.mjs'

class NotInLobbyError extends Error { }

/**
* Register leave lobby subject handler.
* @param {Server} server nlon server
*/
export function leaveLobbySubject (server) {
  server.handle('lobby/leave', async (peer, corr) => {
    await corr.next(
      requireAuthorization(),
      requireSession(sessionRepository, sessionService),
      requireSessionUser(userRepository)
    )

    /** @type {User} */
    const user = corr.context.sessionUser

    const lobbyId = lobbyParticipantRepository.getLobbyOf(user.id)
    if (!lobbyId) {
      throw new NotInLobbyError('User is not in any lobby!')
    }

    const lobby = lobbyRepository.find(lobbyId)

    // Leave
    lobbyService.leave(user, lobby)

    corr.finish()
  })
}
