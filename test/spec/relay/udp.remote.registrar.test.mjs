import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import dgram from 'node:dgram'
import { SessionRepository } from '../../../src/sessions/session.repository.mjs'
import { UDPRelayHandler } from '../../../src/relay/udp.relay.handler.mjs'
import { UDPRemoteRegistrar } from '../../../src/relay/udp.remote.registrar.mjs'
import { SessionData } from '../../../src/sessions/session.data.mjs'
import { NetAddress } from '../../../src/relay/net.address.mjs'
import { RelayEntry } from '../../../src/relay/relay.entry.mjs'

describe('UDPRemoteRegistrar', () => {
  /** @type {sinon.SinonStubbedInstance<SessionRepository>} */
  let sessionRepository
  /** @type {sinon.SinonStubbedInstance<UDPRelayHandler>} */
  let relayHandler
  /** @type {sinon.SinonStubbedInstance<dgram.Socket>} */
  let socket

  /** @type {UDPRemoteRegistrar} */
  let remoteRegistrar

  const session = new SessionData({
    id: 's0001'
  })

  beforeEach(() => {
    sessionRepository = sinon.createStubInstance(SessionRepository)
    relayHandler = sinon.createStubInstance(UDPRelayHandler)
    socket = sinon.createStubInstance(dgram.Socket)

    sessionRepository.find.returns(session)
    socket.bind.callsArg(2) // Instantly resolve on bind

    remoteRegistrar = new UDPRemoteRegistrar({
      sessionRepository, udpRelayHandler: relayHandler, socket
    })
  })

  it('should succeed', async () => {
    // Given
    const msg = Buffer.from(session.id)
    const rinfo = { address: '88.57.0.3', port: 32745 }

    await remoteRegistrar.listen()
    const messageHandler = socket.on.lastCall.callback

    // When
    await messageHandler(msg, rinfo)

    // Then
    assert.deepEqual(
      relayHandler.createRelay.lastCall.args[0],
      new RelayEntry({ address: NetAddress.fromRinfo(rinfo) })
    )
    assert.deepEqual(
      socket.send.lastCall?.args,
      ['OK', rinfo.port, rinfo.address]
    )
  })
  it('should fail on unknown session', async () => {
    // Given
    const msg = Buffer.from(session.id)
    const rinfo = { address: '88.57.0.3', port: 32745 }

    await remoteRegistrar.listen()
    const messageHandler = socket.on.lastCall.callback

    sessionRepository.find.returns(undefined)

    // When
    await messageHandler(msg, rinfo)

    // Then
    assert(relayHandler.createRelay.notCalled, 'A relay was created!')
    assert.deepEqual(
      socket.send.lastCall?.args,
      ['Unknown session id!', rinfo.port, rinfo.address]
    )
  })

  it('should fail throw', async () => {
    // Given
    const msg = Buffer.from(session.id)
    const rinfo = { address: '88.57.0.3', port: 32745 }

    await remoteRegistrar.listen()
    const messageHandler = socket.on.lastCall.callback

    relayHandler.createRelay.throws('Error', 'Test')

    // When
    await messageHandler(msg, rinfo)

    // Then
    assert.deepEqual(
      socket.send.lastCall?.args,
      ['Test', rinfo.port, rinfo.address]
    )
  })
})
