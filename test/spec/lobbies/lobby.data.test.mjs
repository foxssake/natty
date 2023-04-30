import assert from 'node:assert'
import { describe, it } from 'node:test'
import { LobbyData, LobbyState } from '../../../src/lobbies/lobby.data.mjs'

describe('LobbyData', () => {
  it('should reject invalid state', () => {
    assert.throws(
      () => new LobbyData({ state: '@$invalid$@' })
    )
  })

  it('should be unlocked if gathering', () => {
    // Given
    const lobby = new LobbyData({
      state: LobbyState.Gathering
    })

    // When + Then
    assert.equal(lobby.isLocked, false)
  })

  it('should be locked if starting', () => {
    // Given
    const lobby = new LobbyData({
      state: LobbyState.Starting
    })

    // When + Then
    assert.equal(lobby.isLocked, true)
  })

  it('should be locked if active', () => {
    // Given
    const lobby = new LobbyData({
      state: LobbyState.Active
    })

    // When + Then
    assert.equal(lobby.isLocked, true)
  })
})
