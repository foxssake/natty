import { describe, it } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import { ConnectionAttempt, ConnectionAttemptState } from '../../../src/connection/connection.attempt.mjs'
import { Correspondence, Peer } from '@elementbound/nlon'
import { processConnectionAttempt } from '../../../src/connection/connection.attempt.processor.mjs'

describe('processConnectionAttempt', () => {
  it('should return success', async () => {
    // Given
    const connectingReport = {
      success: true,
      target: {
        address: '0.0.0.1',
        port: 1
      }
    }

    const hostingReport = {
      success: true,
      target: {
        address: '0.0.0.2',
        port: 2
      }
    }

    const connectingCorr = sinon.createStubInstance(Correspondence)
    const hostingCorr = sinon.createStubInstance(Correspondence)

    const connectingPeer = sinon.createStubInstance(Peer)
    const hostingPeer = sinon.createStubInstance(Peer)

    const connectionAttempt = new ConnectionAttempt({
      connectingPeer,
      hostingPeer
    })

    connectingCorr.next.resolves(connectingReport)
    hostingCorr.next.resolves(hostingReport)
    connectingPeer.send.returns(connectingCorr)
    hostingPeer.send.returns(hostingCorr)
    sinon.stub(connectingPeer, 'stream').value({ remoteAddress: '0.0.0.2', remotePort: 2 })
    sinon.stub(hostingPeer, 'stream').value({ remoteAddress: '0.0.0.1', remotePort: 1 })

    // When
    const result = await processConnectionAttempt(connectionAttempt)

    // Then
    assert(result)
    assert.equal(connectionAttempt.state, ConnectionAttemptState.Done)
    assert.equal(connectionAttempt.isSuccess, true)
  })

  it('should return failure', async () => {
    // Given
    const connectingReport = {
      success: false,
      target: {
        address: '0.0.0.1',
        port: 1
      }
    }

    const hostingReport = {
      success: true,
      target: {
        address: '0.0.0.2',
        port: 2
      }
    }

    const connectingCorr = sinon.createStubInstance(Correspondence)
    const hostingCorr = sinon.createStubInstance(Correspondence)

    const connectingPeer = sinon.createStubInstance(Peer)
    const hostingPeer = sinon.createStubInstance(Peer)

    const connectionAttempt = new ConnectionAttempt({
      connectingPeer,
      hostingPeer
    })

    connectingCorr.next.resolves(connectingReport)
    hostingCorr.next.resolves(hostingReport)
    connectingPeer.send.returns(connectingCorr)
    hostingPeer.send.returns(hostingCorr)
    sinon.stub(connectingPeer, 'stream').value({ remoteAddress: '0.0.0.2', remotePort: 2 })
    sinon.stub(hostingPeer, 'stream').value({ remoteAddress: '0.0.0.1', remotePort: 1 })

    // When
    const result = await processConnectionAttempt(connectionAttempt)

    // Then
    assert(!result)
    assert.equal(connectionAttempt.state, ConnectionAttemptState.Done)
    assert.equal(connectionAttempt.isSuccess, false)
  })
  it('should throw if report fails', () => {
    // Given
    const connectingReport = {
      success: false,
      target: {
        address: '0.0.0.1',
        port: 1
      }
    }

    const connectingCorr = sinon.createStubInstance(Correspondence)
    const hostingCorr = sinon.createStubInstance(Correspondence)

    const connectingPeer = sinon.createStubInstance(Peer)
    const hostingPeer = sinon.createStubInstance(Peer)

    const connectionAttempt = new ConnectionAttempt({
      connectingPeer,
      hostingPeer
    })

    const expected = new Error('Report failed!')

    connectingCorr.next.resolves(connectingReport)
    hostingCorr.next.throws(expected)
    connectingPeer.send.returns(connectingCorr)
    hostingPeer.send.returns(hostingCorr)
    sinon.stub(connectingPeer, 'stream').value({ remoteAddress: '0.0.0.2', remotePort: 2 })
    sinon.stub(hostingPeer, 'stream').value({ remoteAddress: '0.0.0.1', remotePort: 1 })

    // When + Then
    assert.rejects(
      () => processConnectionAttempt(connectionAttempt),
      expected
    )
    assert.equal(connectionAttempt.state, ConnectionAttemptState.Done)
    assert.equal(connectionAttempt.isSuccess, false)
  })
})
