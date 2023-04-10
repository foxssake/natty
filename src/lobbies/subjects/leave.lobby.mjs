/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { requireSession } from '../../sessions/validators/require.session.mjs'
import { requireSessionUser } from '../../sessions/validators/require.session.user.mjs'
import { User } from '../../users/user.mjs'
/* eslint-enable */
import { requireAuthorization } from '../../validators/require.header.mjs'
import { lobbyParticipantRepository, lobbyRepository, lobbyService } from '../lobbies.mjs'

class NotInLobbyError extends Error { }

/**
* Register leave lobby subject handler.
* @param {Server} server nlon server
*/
export function leaveLobbySubject (server) {
  server.handle('lobby/leave', async (_peer, corr) => {
    await corr.next(
      requireAuthorization(),
      requireSession(),
      requireSessionUser()
    )

    /** @type {User} */
    const user = corr.context.user

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
