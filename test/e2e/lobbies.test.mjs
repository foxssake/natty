import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { NattyClient } from '../../src/natty.client.mjs'
import { End2EndContext } from './context.mjs'

describe('Lobbies', { concurrency: false }, async () => {
  const context = new End2EndContext()

  /** @type {NattyClient} */
  let client

  before(async () => {
    context.config.games = 'test001 Test'
    await context.startup()

    context.log.info('Creating session')
    client = context.connect()

    await client.session.login('foo', 'test001')
  })

  it('should create lobby', async () => {
    context.log.info('Creating lobby')
    await client.lobbies.create('Test lobby')
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
