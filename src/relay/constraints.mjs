import assert from 'node:assert'
import { UDPRelayHandler } from "./udp.relay.handler.mjs";

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
