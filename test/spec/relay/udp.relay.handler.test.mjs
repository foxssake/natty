import { describe, it } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import dgram from 'node:dgram'
import { UDPSocketPool } from '../../../src/relay/udp.socket.pool.mjs'
import { RelayEntry } from '../../../src/relay/relay.entry.mjs'
import { NetAddress } from '../../../src/relay/net.address.mjs'
import { UDPRelayHandler } from '../../../src/relay/udp.relay.handler.mjs'

describe('UDPRelayHandler', () => {
  describe('createRelay', () => {
    it('should create relay', async () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relay = new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.107',
          port: '32279'
        })
      })

      const relayHandler = new UDPRelayHandler({
        socketPool
      })

      // When
      await relayHandler.createRelay(relay)

      // Then
      assert.deepEqual(relayHandler.relayTable, [relay])
    })

    it('should ignore if relay exists', async () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relay = new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.107',
          port: '32279'
        })
      })

      const relayHandler = new UDPRelayHandler({
        socketPool
      })
      await relayHandler.createRelay(relay)

      // When
      const result = await relayHandler.createRelay(relay)

      // When
      assert.equal(result, false)
      assert.deepEqual(relayHandler.relayTable, [relay])
    })
  })

  describe('freeRelay', () => {
    it('should free relay', async () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relay = new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.107',
          port: '32279'
        })
      })

      const relayHandler = new UDPRelayHandler({
        socketPool
      })
      await relayHandler.createRelay(relay)

      // When
      const result = relayHandler.freeRelay(relay)

      // When
      assert.equal(result, true)
      assert(socketPool.freePort.calledOnceWith(10001))
      assert.deepEqual(relayHandler.relayTable, [])
    })

    it('should ignore unknown', async () => {
      // Given
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relay = new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.107',
          port: 32279
        })
      })

      const unknownRelay = new RelayEntry({
        port: 1002,
        address: new NetAddress({
          address: '89.45.0.109',
          port: 32279
        })
      })

      const relayHandler = new UDPRelayHandler({
        socketPool
      })
      await relayHandler.createRelay(relay)

      // When
      const result = relayHandler.freeRelay(unknownRelay)

      // When
      assert.equal(result, false)
      assert(socketPool.freePort.notCalled)
      assert.deepEqual(relayHandler.relayTable, [relay])
    })
  })

  describe('relay', () => {
    it('should relay', async () => {
      // Given
      const message = Buffer.from('Hello!', 'utf-8')
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relayHandler = new UDPRelayHandler({
        socketPool
      })

      await relayHandler.createRelay(new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.17',
          port: 32279
        })
      }))

      await relayHandler.createRelay(new RelayEntry({
        port: 10002,
        address: new NetAddress({
          address: '88.59.62.107',
          port: 65227
        })
      }))
      socketPool.getSocket.resetHistory()

      // When
      const success = relayHandler.relay(message, new NetAddress({
        address: '88.59.62.107',
        port: 65227
      }), 10001)

      // Then
      assert(success, 'Relay failed!')
      assert(socketPool.getSocket.calledOnceWith(10002), 'Socket not queried!')
      assert(socket.send.calledWith(message), 'Message not sent!')
    })

    it('should ignore unknown address', async () => {
      // Given
      const message = Buffer.from('Hello!', 'utf-8')
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relayHandler = new UDPRelayHandler({
        socketPool
      })

      await relayHandler.createRelay(new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.17',
          port: 32279
        })
      }))
      socketPool.getSocket.resetHistory()

      // When
      const success = relayHandler.relay(message, new NetAddress({
        address: '88.59.62.107',
        port: 65227
      }), 10001)

      // Then
      assert(!success, 'Relay succeeded?')
      assert(socketPool.getSocket.notCalled, 'Socket queried!')
      assert(socket.send.notCalled, 'Message sent?')
    })
    it('should ignore on missing socket', async () => {
      // Given
      const message = Buffer.from('Hello!', 'utf-8')
      const socket = sinon.createStubInstance(dgram.Socket)
      const socketPool = sinon.createStubInstance(UDPSocketPool)
      socketPool.getSocket.returns(socket)

      const relayHandler = new UDPRelayHandler({
        socketPool
      })

      await relayHandler.createRelay(new RelayEntry({
        port: 10001,
        address: new NetAddress({
          address: '88.57.0.17',
          port: 32279
        })
      }))

      await relayHandler.createRelay(new RelayEntry({
        port: 10002,
        address: new NetAddress({
          address: '88.59.62.107',
          port: 65227
        })
      }))
      socketPool.getSocket.resetHistory()
      socketPool.getSocket.returns(undefined)

      // When
      const success = relayHandler.relay(message, new NetAddress({
        address: '88.59.62.107',
        port: 65227
      }), 10001)

      // Then
      assert(!success, 'Relay succeeded?')
      assert(socketPool.getSocket.called, 'Socket not queried!')
      assert(socket.send.notCalled, 'Message sent?')
    })
  })
})
