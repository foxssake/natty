import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert'
import { mockClass } from '../../../mocking.mjs'
import { Repository } from '../../../../src/repository.mjs'
import { SessionUserIdValidator } from '../../../../src/sessions/validators/require.session.user.mjs'
import { SessionData } from '../../../../src/sessions/session.data.mjs'
import { User } from '../../../../src/users/user.mjs'
import { UserRepository } from '../../../../src/users/user.repository.mjs'

describe('SessionUserIdValidator', () => {
  /** @type {UserRepository} */
  let userRepository
  /** @type {SessionUserIdValidator} */
  let validator

  const user = new User({
    id: 'usr001',
    name: 'Foo'
  })

  beforeEach(() => {
    userRepository = mockClass(Repository, UserRepository)
    userRepository.find = mock.fn(
      id => id === 'usr001' ? user : undefined
    )

    validator = new SessionUserIdValidator({
      userRepository
    })
  })

  it('should extract', () => {
    // Given
    const session = new SessionData({
      id: 's001',
      gameId: 'g001',
      userId: 'usr001',
      peer: {},
      lastMessage: 8
    })

    const body = {}
    const header = {}
    const context = { session }

    // When
    validator.validate(body, header, context)

    // Then
    assert.deepEqual(context.user, user)
  })

  it('should fail on missing session', () => {
    // Given
    const body = {}
    const header = {}
    const context = {}

    // When + Then
    assert.throws(() =>
      validator.validate(body, header, context)
    )
  })

  it('should fail on unknown user', () => {
    // Given
    const session = new SessionData({
      id: 's001',
      gameId: 'g001',
      userId: 'unknown',
      peer: {},
      lastMessage: 8
    })

    const body = {}
    const header = {}
    const context = { session }

    // When + Then
    assert.throws(() =>
      validator.validate(body, header, context)
    )
  })
})
