import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import { ConnectionAttemptQueue } from '../../../src/connection/connection.attempt.queue.mjs'
import { ConnectionAttempt, ConnectionAttemptState } from '../../../src/connection/connection.attempt.mjs'
import { Peer } from '@elementbound/nlon'
import { sleep, timestamp } from '../../../src/utils.mjs'

describe('ConnectionAttemptQueue', () => {
  let queue = new ConnectionAttemptQueue()
  let processor = sinon.stub()
  let connectingPeer = sinon.createStubInstance(Peer)
  let hostingPeer = sinon.createStubInstance(Peer)

  describe('enqueue', () => {
    beforeEach(() => {
      processor = sinon.stub()
      queue = new ConnectionAttemptQueue(processor)
      connectingPeer = sinon.createStubInstance(Peer)
      hostingPeer = sinon.createStubInstance(Peer)

      sinon.stub(connectingPeer, 'id').value('p001')
      sinon.stub(hostingPeer, 'id').value('p002')
    })

    it('should run attempt', () => {
      // Given
      processor.resolves(true)
      const attempt = new ConnectionAttempt({ connectingPeer, hostingPeer})

      // When
      queue.enqueue(attempt, 60)

      // Then
      processor.calledOnceWith(attempt)
    })

    it('should fail attempt on timeout', async () => {
      // Given
      processor.returns(sleep(0.05))
      const attempt = new ConnectionAttempt({ connectingPeer, hostingPeer})

      // When
      queue.enqueue(attempt, 0.01)

      // Then
      await sleep(0.02)
      processor.calledOnceWith(attempt)
      assert.equal(attempt.state, ConnectionAttemptState.Done)
      assert.equal(attempt.isSuccess, false)
    })
  })
})
