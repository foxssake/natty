/* eslint-disable */
import { Server } from '@elementbound/nlon'
/* eslint-enable */
import { gameRepository } from '../../games/games.mjs'
import { sessionRepository, sessionService } from '../../sessions/sessions.mjs'
import { requireSession, requireSessionGame } from '../../sessions/validation.mjs'
import { requireAuthorization } from '../../validators/require.header.mjs'
import { lobbyRepository } from '../lobbies.mjs'

function ListLobbiesResponse (lobbies) {
  return {
    lobbies: lobbies.map(lobby => ({ id: lobby.id }))
  }
}

/**
* @param {Server} server nlon server
*/
export function listLobbiesSubject (server) {
  server.handle('lobby/list', async (peer, corr) => {
    await corr.next(
      requireAuthorization(),
      requireSession(sessionRepository, sessionService),
      requireSessionGame(gameRepository)
    )

    const game = corr.context.sessionGame

    const lobbies = [...lobbyRepository.listByGame(game.id)]
    const chunkSize = 64
    for (let i = 0; i < lobbies.length; i += chunkSize) {
      const chunk = lobbies.slice(i, i + chunkSize)
      corr.write(ListLobbiesResponse(chunk))
    }

    corr.finish()
  })
}