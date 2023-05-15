/* eslint-disable */
import { UDPRelayHandler } from './udp.relay.handler.mjs'
/* eslint-enable */
import { time } from '../utils.mjs'

/**
* Remove idle relays.
* @param {UDPRelayHandler} relayHandler Relay handler
* @param {number} timeout Maximum relay age in seconds
*/
export function cleanupUdpRelayTable (relayHandler, timeout) {
  const timeCutoff = time() - timeout

  relayHandler.relayTable
    .map(relay => [relay, Math.max(relay.lastSent, relay.lastReceived)])
    .filter(([_, lastTraffic]) => lastTraffic <= timeCutoff)
    .forEach(([relay, _]) =>
      relayHandler.freeRelay(relay)
    )
}
