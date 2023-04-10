/* eslint-disable */
import { NattyClient } from '../../src/natty.client.mjs'
/* eslint-enable */

import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { End2EndContext } from './context.mjs'
import { config } from '../../src/config.mjs'

describe('Lobbies', { concurrency: false }, async () => {
  const context = new End2EndContext()

  /** @type {NattyClient} */
  let client

  /** @type {NattyClient} */
  let unauthClient

  /** @type {string} */
  let lobbyId

  before(async () => {
    config.games = 'test001 Test'
    await context.startup()

    context.log.info('Creating session')
    client = context.connect()
    await client.session.login('foo', 'test001')

    unauthClient = context.connect()
  })

  describe('create', () => {
    it('should reject without auth', () => {
      assert.rejects(() => unauthClient.lobbies.create('Test lobby'))
    })

    it('should create lobby', async () => {
      context.log.info('Creating lobby')
      lobbyId = await client.lobbies.create('Test lobby')
      assert(lobbyId)
    })
  })

  describe('join', () => {
    before(async () => {
      // Create own client that has no lobby
      client = context.connect()
      await client.session.login('bar', 'test001')
    })

    it('should reject without auth', () => {
      assert.rejects(() =>
        unauthClient.lobbies.join(lobbyId)
      )
    })

    it('should reject invalid lobby', () => {
      assert.rejects(() =>
        client.lobbies.join('invalid-id')
      )
    })

    it('should join lobby', () => {
      assert.doesNotReject(() =>
        client.lobbies.join(lobbyId)
      )
    })

    it('should reject if already in lobby', () => {
      // We're in a lobby now, so the same join call should reject
      assert.rejects(() =>
        client.lobbies.join(lobbyId)
      )
    })
  })

  it('should list lobbies', async () => {
    // Given
    const lobbies = []

    // When
    for await (const lobby of client.lobbies.list()) {
      lobbies.push(lobby)
    }

    // Then
    assert(lobbies.length)
  })

  after(() => context.shutdown())
})
