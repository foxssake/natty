import { createSocketPeer } from '@elementbound/nlon-socket'
import { describe, it, after, before } from 'node:test'
import { ok } from 'node:assert'
import { natty } from '../../src/index.mjs'
import logger from '../../src/logger.mjs'
import { NattyClient } from '../../src/natty.client.mjs'
import config from '../../src/config.mjs'

describe('Sessions', { concurrency: false }, async () => {
  const log = logger.child({ name: 'test' })

  /** @type {NattyClient} */
  let client

  /** @type {object} */
  let nattyHandle

  before(async () => {
    log.info('Starting app')
    nattyHandle = await natty()

    log.info('Creating client')
    const peer = createSocketPeer({
      host: 'localhost',
      port: config.socket.port
    })

    client = new NattyClient(peer)

    log.info('Setup done, starting tests')
  })

  it('should start new session', async () => {
    // Given
    const username = 'foo'

    // When
    const session = await client.session.login(username)

    // Then
    ok(session)
  })

  it('should logout', async () => {
    await client.session.logout()
  })

  after(() => {
    log.info('Disconnecting peer stream')
    client.peer.stream.destroy()

    log.info('Shutting down peer')
    client.peer.disconnect()

    log.info('Terminating Natty')
    nattyHandle.terminate()
  })
})
