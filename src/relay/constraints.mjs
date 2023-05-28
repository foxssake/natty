/* eslint-disable */
import { BandwidthLimiter } from './bandwidth.limiter.mjs'
import { UDPRelayHandler } from './udp.relay.handler.mjs'
/* eslint-enable */
import assert from 'node:assert'

/**
* Limit the relay table size to a given maximum. This ensures that we won't
* allocate too many relays.
* @param {UDPRelayHandler} relayHandler Relay handler
* @param {number} maxSize Maximum relay table size
*/
export function constrainRelayTableSize (relayHandler, maxSize) {
  relayHandler.on('create', () => {
    assert(relayHandler.relayTable.length <= maxSize, 'Relay table size limit reached!')
  })
}

/**
* Limit the bandwidth on every relay individually.
* @param {UDPRelayHandler} relayHandler Relay handler
* @param {number} traffic Traffic limit in bytes/sec
* @param {number} [interval=1] Limit interval in seconds
*/
export function constrainIndividualBandwidth (relayHandler, traffic, interval) {
  const limiters = new Map()

  relayHandler.on('transmit', (source, _target, message) => {
    if (!limiters.has(source.id)) {
      limiters.set(source.id, new BandwidthLimiter({
        maxTraffic: traffic,
        interval: interval ?? 1
      }))
    }

    const limiter = limiters.get(source.id)
    limiter.validate(message.length)
  })

  relayHandler.on('destroy', relay => {
    limiters.delete(relay.id)
  })
}

/**
* Limit the bandwidth on every relay globally.
* @param {UDPRelayHandler} relayHandler Relay handler
* @param {number} traffic Traffic limit in bytes/sec
* @param {number} [interval=1] Limit interval in seconds
*/
export function constrainGlobalBandwidth (relayHandler, traffic, interval) {
  const limiter = new BandwidthLimiter({
    maxTraffic: traffic,
    interval: interval ?? 1
  })

  relayHandler.on('transmit', (_source, _target, message) => {
    limiter.validate(message.length)
  })
}
