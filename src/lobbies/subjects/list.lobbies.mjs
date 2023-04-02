/* eslint-disable */
import { Server } from '@elementbound/nlon'
/* eslint-enable */
import { sessionRepository, sessionService } from '../../sessions/sessions.mjs'
import { requireSession, requireSessionUser } from '../../sessions/validation.mjs'
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
  // ajv.addSchema({
  //   type: 'object',
  //   properties: {
  //     game: { type: 'string' }
  //   }
  // }, 'lobby/list')

  server.handle('lobby/list', async (peer, corr) => {
    await corr.next(
      // requireBody(),
      // requireSchema('lobby/list'),
      requireAuthorization(),
      requireSession(sessionRepository, sessionService)
    )

    // TODO: List per game
    const lobbies = [...lobbyRepository.list()]
    const chunkSize = 64
    for (let i = 0; i < lobbies.length; i += chunkSize) {
      const chunk = lobbies.slice(i, i + chunkSize)
      corr.write(ListLobbiesResponse(chunk))
    }

    corr.finish()
  })
}
