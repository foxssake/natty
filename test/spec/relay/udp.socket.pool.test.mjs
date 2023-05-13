import { describe, it } from 'node:test'
import assert from 'node:assert'
import dgram from 'node:dgram'
import sinon from 'sinon'
import { UDPSocketPool } from '../../../src/relay/udp.socket.pool.mjs'

describe('UDPSocketPool', () => {
  describe ('allocatePort', () => {
    it('should allocate port', async () => {
      // Given
      const pool = new UDPSocketPool()

      // When + Then
      const port = await pool.allocatePort()

      // Finally
      pool.freePort(port)
    })
  })

  describe ('addSocket', () => {
    it('should save port', () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      socket.address.returns({
        address: '127.0.0.1',
        port: 10001,
        family: 'ipv4'
      })
      const pool = new UDPSocketPool()

      // When
      pool.addSocket(socket)

      // Then
      assert.deepEqual(pool.ports, [10001])
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

      const pool = new UDPSocketPool()
      pool.addSocket(socket)

      // When
      pool.freePort(7879)

      // Then
      assert(socket.close.calledOnce)
      assert(!pool.ports.includes(7879))
    })

    it('should ignore unknown port', () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      socket.address.returns({
        address: '0.0.0.0',
        port: 7879,
        family: 'IPv4'
      })

      const pool = new UDPSocketPool()
      pool.addSocket(socket)

      // When
      pool.freePort(7876)

      // Then
      assert(socket.close.notCalled)
    })
  })
})
