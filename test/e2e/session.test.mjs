import { createSocketPeer } from '@elementbound/nlon-socket'
import { describe, it, after, before } from 'node:test'
import { ok, rejects, throws } from 'node:assert'
import logger from '../../src/logger.mjs'
import { NattyClient } from '../../src/natty.client.mjs'
import { Natty } from '../../src/natty.mjs'
import { NattyConfig } from '../../src/config.mjs'
import { promiseEvent, sleep } from '../../src/utils.mjs'
import { GameData } from '../../src/games/game.data.mjs'
import { End2EndContext } from './context.mjs'

describe('Sessions', { concurrency: false }, async () => {
  const log = logger.child({ name: 'test' })
  const context = new End2EndContext()

  /** @type {NattyClient} */
  let client

  /** @type {Natty} */
  let natty

  const game = new GameData({
    id: 'test001',
    name: 'Test'
  })

  before(async () => {
    log.info('Starting app')
    const config = context.config
    config.session.timeout = 0.050
    config.session.cleanupInterval = 0.010
    config.games = `${game.id} ${game.name}`

    await context.startup()

    natty = context.natty
    client = context.connect()
  })

  it('should start new session', async () => {
    // Given
    const username = 'foo'

    // When
    const session = await client.session.login(username, game.id)

    // Then
    ok(session)
  })

  it('should logout', async () => {
    await client.session.logout()
  })

  it('should reject logout without auth', async () => {
    rejects(() => client.session.logout())
  })

  it('should cleanup session', async () => {
    await client.session.login('foo', game.id)

    await sleep(
      natty.config.session.timeout +
      natty.config.session.cleanupInterval
    )

    rejects(() => client.session.logout())
  })

  after(() => {
    context.shutdown()
  })
})
