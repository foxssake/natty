import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert'
import { mockClass } from '../../../mocking.mjs'
import { Repository } from '../../../../src/repository.mjs'
import { SessionData } from '../../../../src/sessions/session.data.mjs'
import { GameRepository } from '../../../../src/games/game.repository.mjs'
import { SessionGameIdValidator } from '../../../../src/sessions/validators/require.session.game.mjs'
import { GameData } from '../../../../src/games/game.data.mjs'

describe('SessionGameIdValidator', () => {
  /** @type {GameRepository} */
  let gameRepository
  /** @type {SessionGameIdValidator} */
  let validator

  const game = new GameData({
    id: 'g001',
    name: 'Test'
  })

  beforeEach(() => {
    gameRepository = mockClass(Repository, GameRepository)
    gameRepository.find = mock.fn(
      id => id === 'g001' ? game : undefined
    )

    validator = new SessionGameIdValidator({
      gameRepository
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
    assert.deepEqual(context.game, game)
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

  it('should fail on unknown game', () => {
    // Given
    const session = new SessionData({
      id: 's001',
      gameId: 'unknown',
      userId: 'usr001',
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
