import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import { Timeout, sleep, timestamp, withTimeout } from '../../src/utils.mjs'

describe('utils', () => {
  describe('withTimeout', () => {
    /** @type {sinon.SinonFakeTimers} */
    let clock

    before(() => {
      clock = sinon.useFakeTimers()
    })

    it('should return on resolve', async () => {
      // Given
      const expected = 42
      const promise = Promise.resolve(expected)

      // When
      const actual = await withTimeout(promise, 8)

      // Then
      assert.equal(actual, expected)
    })

    it('should throw on reject', () => {
      // Given
      const promise = Promise.reject(new Error())

      // When + Then
      assert.rejects(
        () => withTimeout(promise, 8)
      )
    })

    it('should return symbol on timeout', async () => {
      // Given
      const expected = Timeout
      const promise = sleep(16)

      // When
      const actual = withTimeout(promise, 8)

      // Then
      console.log(timestamp())
      clock.tick(16100)
      console.log(timestamp())
      assert.equal(await actual, expected)
    })

    after(() => {
      clock.restore()
    })
  })
})
