import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'
import { Timeout, combine, range, sleep, timestamp, withTimeout } from '../../src/utils.mjs'

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
      clock.tick(16100)
      assert.equal(await actual, expected)
    })

    after(() => {
      clock.restore()
    })
  })

  describe('range', () => {
    it('should return numbers', () => {
      // Given
      const expected = [0, 1, 2, 3]

      // When
      const actual = range(4)

      // Then
      assert.deepEqual(actual, expected)
    })

    it('should return empty on 0', () => {
      // Given
      const expected = []

      // When
      const actual = range(0)

      // Then
      assert.deepEqual(actual, expected)
    })

    it('should return empty on negative', () => {
      // Given
      const expected = []

      // When
      const actual = range(-4)

      // Then
      assert.deepEqual(actual, expected)
    })
  })

  describe('combine', () => {
    it('should return expected', () => {
      // Given
      const arrays = [
        ['a', 'b'],
        [0, 1],
        ['foo', 'bar']
      ]

      const expected = [
        ['a', 0, 'foo'],
        ['a', 0, 'bar'],
        ['a', 1, 'foo'],
        ['a', 1, 'bar'],
        ['b', 0, 'foo'],
        ['b', 0, 'bar'],
        ['b', 1, 'foo'],
        ['b', 1, 'bar'],
      ]

      // When
      const actual = combine(...arrays)

      // Then
      // Compare sorted, since order doesn't matter
      assert.deepEqual(actual.sort(), expected.sort())
    })
  })
})
