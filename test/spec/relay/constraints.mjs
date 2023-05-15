import { describe, it } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import { RelayEntry } from '../../../src/relay/relay.entry.mjs'
import { NetAddress } from '../../../src/relay/net.address.mjs'
import { UDPRelayHandler } from '../../../src/relay/udp.relay.handler.mjs'
import { constrainRelayTableSize } from '../../../src/relay/constraints.mjs'

describe('Relay constraints', () => {
  describe('constrainRelayTableSize', () => {
    const relayTable = [
      new RelayEntry({
        address: new NetAddress({ address: '37.89.0.5', port: 32467 }),
        port: 10001
      }),

      new RelayEntry({
        address: new NetAddress({ address: '57.13.0.9', port: 45357 }),
        port: 10002
      }),
    ]

    it('should allow', () => {
      // Given
      const relayHandler = sinon.createStubInstance(UDPRelayHandler)
      sinon.stub(relayHandler, 'relayTable').value(relayTable)
      relayHandler.on.callThrough()
      relayHandler.emit.callThrough()

      constrainRelayTableSize(relayHandler, 2)

      // When + Then
      assert.doesNotThrow(
        () => relayHandler.emit('create', relayTable[1])
      )
    })

    it('should throw', () => {
      const relayHandler = sinon.createStubInstance(UDPRelayHandler)
      sinon.stub(relayHandler, 'relayTable').value(relayTable)
      relayHandler.on.callThrough()
      relayHandler.emit.callThrough()

      constrainRelayTableSize(relayHandler, 1)

      // When + Then
      assert.throws(
        () => relayHandler.emit('create', relayTable[1])
      )
    })
  })
})
