/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { User } from '../../users/user.mjs'
import { GameData } from '../../games/game.data.mjs'
/* eslint-enable */
import { requireAuthorization } from '../../validators/require.header.mjs'
import { lobbyParticipantRepository, lobbyRepository, lobbyService } from '../lobbies.mjs'
import { requireSession } from '../../sessions/validators/require.session.mjs'
import { requireSessionUser } from '../../sessions/validators/require.session.user.mjs'
import { requireSessionGame } from '../../sessions/validators/require.session.game.mjs'
import logger from '../../logger.mjs'

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
      requireSessionUser(),
      requireSessionGame()
    )

    /** @type {User} */
    const user = corr.context.user
    /** @type {GameData} */
    const game = corr.context.game

    const log = logger.child({
      name: 'leaveLobbySubject',
      user: user.id,
      game: game.id,
      session: corr.context.session.id
    })

    log.info('User requesting to leave lobby')

    // Find lobby corresponding to session game
    const lobbyId = lobbyParticipantRepository.getLobbiesOf(user.id)
      .map(lobbyId => lobbyRepository.find(lobbyId))
      .find(lobby => lobby?.game === game.id)
      ?.id

    if (!lobbyId) {
      log.error('No lobby found for user!')
      throw new NotInLobbyError('User is not in any lobby!')
    }

    const lobby = lobbyRepository.find(lobbyId)

    // Leave
    log.info({ lobby: lobby.id }, 'Removing user from lobby')
    lobbyService.leave(user, lobby)

    corr.finish()
  })
}
