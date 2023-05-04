import { lobbyParticipantRepository, lobbyService } from '../lobbies/lobbies.mjs'
import logger from '../logger.mjs'
import { Natty } from '../natty.mjs'
import { sessionRepository } from '../sessions/session.repository.mjs'
import { combine } from '../utils.mjs'
import { ConnectionAttempt } from './connection.attempt.mjs'
import { connectionAttemptQueue } from './connection.attempt.queue.mjs'
import { config } from '../config.mjs'

const log = logger.child({ name: 'Connections' })

Natty.hook(() => {
  log.info('Wiring up connection diagnostics')

  lobbyService.on('join', (lobby, joiningUser) => {
    log.trace(
      { lobby: lobby.id, user: joiningUser.id },
      'User joining lobby, adding new connection pairs to queue'
    )
    const joinerSessions = sessionRepository.findSessionsByGameFor(
      lobby.game, joiningUser.id
    )

    const currentSessions = lobbyParticipantRepository.getParticipantsOf(lobby.id)
      .filter(id => id !== joiningUser.id)
      .flatMap(id => sessionRepository.findSessionsByGameFor(lobby.game, id))

    combine(joinerSessions, currentSessions)
      .map(([connecting, hosting]) => new ConnectionAttempt({
        connectingPeer: connecting.peer,
        hostingPeer: hosting.peer
      }))
      .forEach(attempt => {
        connectionAttemptQueue.enqueue(attempt, config.connectionDiagnostics.timeout)
      })
  })
})
