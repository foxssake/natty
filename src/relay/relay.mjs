import { config } from '../config.mjs'
import { constrainRelayTableSize } from './constraints.mjs'
import { UDPRelayHandler } from './udp.relay.handler.mjs'
import { Natty } from '../natty.mjs'
import { cleanupUdpRelayTable } from './udp.relay.cleanup.mjs'
import logger from '../logger.mjs'
import { UDPRemoteRegistrar } from './udp.remote.registrar.mjs'
import { sessionRepository } from '../sessions/session.repository.mjs'

export const udpRelayHandler = new UDPRelayHandler()
constrainRelayTableSize(udpRelayHandler, config.udpRelay.maxSlots)

export const udpRemoteRegistrar = new UDPRemoteRegistrar({
  sessionRepository,
  udpRelayHandler
})

const log = logger.child({ name: 'Relays' })

Natty.hook(async natty => {
  log.info(
    'Starting periodic UDP relay cleanup job, running every %d sec',
    config.udpRelay.cleanupInterval
  )
  const cleanupJob = setInterval(
    () => cleanupUdpRelayTable(udpRelayHandler, config.udpRelay.timeout),
    config.udpRelay.cleanupInterval * 1000
  )

  log.info('Listening on port %d for UDP remote registrars', config.udpRelay.registrarPort)
  await udpRemoteRegistrar.listen(config.udpRelay.registrarPort, config.socket.host)

  log.info('Adding shutdown hooks')
  natty.on('close', () => {
    log.info('Natty shutting down, cancelling UDP relay cleanup job')
    clearInterval(cleanupJob)

    log.info('Closing UDP remote registrar socket')
    udpRemoteRegistrar.socket.close()
  })
})
