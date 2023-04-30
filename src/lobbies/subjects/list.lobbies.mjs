/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { requireSessionGame } from '../../sessions/validators/require.session.game.mjs'
import { requireSession } from '../../sessions/validators/require.session.mjs'
/* eslint-enable */
import { requireAuthorization } from '../../validators/require.header.mjs'
import { lobbyService } from '../lobbies.mjs'
import { chunks } from '../../utils.mjs'

/**
* @param {LobbyData[]} lobbies
* @returns {object}
*/
function ListLobbiesResponse (lobbies) {
  return {
    lobbies: lobbies.map(lobby => ({ id: lobby.id }))
  }
}

/**
* @param {Server} server nlon server
*/
export function listLobbiesSubject (server) {
  server.handle('lobby/list', async (_peer, corr) => {
    await corr.next(
      requireAuthorization(),
      requireSession(),
      requireSessionGame()
    )

    const game = corr.context.game
    const chunkSize = 64

    chunks(lobbyService.list(game), chunkSize)
      .forEach(chunk => {
        corr.write(ListLobbiesResponse(chunk))
      })

    corr.finish()
  })
}
