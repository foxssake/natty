import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert'
import { GameData } from '../../../src/games/game.data.mjs'
import { parseGamesConfig } from '../../../src/games/games.mjs'

describe('parseGamesConfig', () => {
  it('should return expected', () => {
    // Given
    const text = [
      '', // Empty line => ignore
      '               ', // Pure spaces => ignore
      'id0            ', // Missing game name => ignore
      'id0 foo        ', // Correct format => parse
      'id0 with space ' // Name with spaces => parse
    ].join('\n')

    const expected = [
      new GameData({ id: 'id0', name: 'foo' }),
      new GameData({ id: 'id0', name: 'with space' })
    ]

    // When
    const actual = parseGamesConfig(text)

    // Then
    deepEqual(actual, expected)
  })
})
