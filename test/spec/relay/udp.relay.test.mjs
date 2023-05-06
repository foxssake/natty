import { describe, it } from 'node:test'
import assert from 'node:assert'
import dgram from 'node:dgram'
import sinon from 'sinon'
import { UDPRelay } from '../../../src/relay/udp.relay.mjs'
import { NetAddress } from '../../../src/relay/net.address.mjs'
import { promiseEvent, sleep, withTimeout } from '../../../src/utils.mjs'

describe('UDPRelay', () => {
  describe ('addSocket', () => {
    it('should save port', () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      socket.address.returns({
        address: '127.0.0.1',
        port: 10001,
        family: 'ipv4'
      })
      const relay = new UDPRelay()

      // When
      relay.addSocket(socket)

      // Then
      assert.deepEqual(relay.ports, [10001])
    })
  })

  describe('bind', () => {
    it('should store binding', () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      socket.address.returns({
        address: '127.0.0.1',
        port: 10075,
        family: 'ipv4'
      })
      const relay = new UDPRelay()
      relay.addSocket(socket)

      // When + Then
      assert.doesNotThrow(
        () => relay.bind(
          new NetAddress({ address: '127.0.0.1', port: 10001 }),
          10075,
          new NetAddress({ address: '127.0.0.1', port: 10002})
        )
      )
    })

    it('should throw on unallocated', () => {
      // Given
      const relay = new UDPRelay()

      // When + then
      assert.throws(
        () => relay.bind(
          new NetAddress({ address: '127.0.0.1', port: 10001 }),
          10075,
          new NetAddress({ address: '127.0.0.1', port: 10002})
        )
      )
    })
  })

  describe('freePort', () => {
    it('should call close', () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      socket.address.returns({
        address: '0.0.0.0',
        port: 7879,
        family: 'IPv4'
      })

      const relay = new UDPRelay()
      relay.addSocket(socket)

      // When
      relay.freePort(7879)

      // Then
      assert(socket.close.calledOnce)
    })

    it('should ignore unknown port', () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      socket.address.returns({
        address: '0.0.0.0',
        port: 7879,
        family: 'IPv4'
      })

      const relay = new UDPRelay()
      relay.addSocket(socket)

      // When
      relay.freePort(7876)

      // Then
      assert(socket.close.notCalled)
    })
  })

  describe('should forward traffic', async () => {
    // Given
    const relay = new UDPRelay()

    const incomingSocket = dgram.createSocket('udp4').bind(0, '127.0.0.1')
    const outgoingSocket = dgram.createSocket('udp4').bind(0, '127.0.0.1')
    const allocatedPort = await relay.allocatePort()

    const message = Buffer.from('Hello!', 'utf-8')
    let actual
    outgoingSocket.on('message', msg => {
      actual = msg
    })

    relay.bind(
      new NetAddress(incomingSocket.address()),
      allocatedPort,
      new NetAddress(outgoingSocket.address())
    )

    // When
    incomingSocket.send(message, allocatedPort, '127.0.0.1')
    await withTimeout(promiseEvent(outgoingSocket, 'message'), 2)

    // Cleanup
    incomingSocket.close()
    outgoingSocket.close()
    relay.freePort(allocatedPort)

    // Then
    assert.deepEqual(actual, message)
  })
})
