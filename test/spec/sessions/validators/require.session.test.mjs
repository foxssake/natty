import { beforeEach, describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { SessionData } from '../../../../src/sessions/session.data.mjs'
import { SessionService } from '../../../../src/sessions/session.service.mjs'
import { InvalidSessionError, SessionPresenceValidator } from '../../../../src/sessions/validators/require.session.mjs'
import { mockClass } from '../../../mocking.mjs'

describe('SessionPresenceValidator', () => {
  /** @type {SessionPresenceValidator} */
  let validator
  /** @type {SessionService} */
  let sessionService

  beforeEach(() => {
    sessionService = mockClass(SessionService)
    validator = new SessionPresenceValidator({
      sessionService
    })
  })

  it('should pass', () => {
    // Given
    const expected = new SessionData({
      id: 'foo',
      gameId: 'g001',
      userId: 'usr001',
      peer: {},
      lastMessage: 0
    })

    const body = {}
    const header = {
      authorization: expected.id
    }
    const context = {}

    sessionService.validate = mock.fn(
      id => id === expected.id
        ? expected
        : undefined
    )

    // When
    validator.validate(body, header, context)

    // Then
    assert.deepEqual(context.session, expected)
    assert.equal(sessionService.validate.mock.callCount(), 1)
  })

  it('should throw on missing session id', () => {
    // Given
    const body = {}
    const header = {}
    const context = {}

    // When + then
    assert.throws(
      () => validator.validate(body, header, context),
      InvalidSessionError
    )
    assert(!context.session)
  })

  it('should throw on invalid session id', () => {
    // Given
    const body = {}
    const header = {
      authorization: 'invalid'
    }
    const context = {}

    // When + then
    assert.throws(
      () => validator.validate(body, header, context),
      InvalidSessionError
    )
    assert.equal(sessionService.validate.mock.callCount(), 1)
    assert(!context.session)
  })
})
