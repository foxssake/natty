import { config } from '../config.mjs'
import { constrainRelayTableSize } from './constraints.mjs'
import { UDPRelayHandler } from './udp.relay.handler.mjs'
import { Natty } from '../natty.mjs'
import { cleanupUdpRelayTable } from './udp.relay.cleanup.mjs'
import logger from '../logger.mjs'

export const udpRelayHandler = new UDPRelayHandler()
constrainRelayTableSize(udpRelayHandler, config.udpRelay.maxSlots)

const log = logger.child({ name: 'Relays' })

Natty.hook(natty => {
  log.info(
    'Starting periodic UDP relay cleanup job, running every %d sec',
    config.udpRelay.cleanupInterval
  )
  const cleanupJob = setInterval(
    () => cleanupUdpRelayTable(udpRelayHandler, config.udpRelay.timeout),
    config.udpRelay.cleanupInterval * 1000
  )

  natty.on('close', () => {
    log.info('Natty shutting down, cancelling UDP relay cleanup job')
    clearInterval(cleanupJob)
  })
})
