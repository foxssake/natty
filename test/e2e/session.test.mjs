import { createSocketPeer } from '@elementbound/nlon-socket'
import { describe, it, after, before } from 'node:test'
import { ok, rejects, throws } from 'node:assert'
import logger from '../../src/logger.mjs'
import { NattyClient } from '../../src/natty.client.mjs'
import { Natty } from '../../src/natty.mjs'
import { NattyConfig } from '../../src/config.mjs'

function promiseEvent (source, event) {
  return new Promise(resolve => {
    source.on(event, resolve)
  })
}

describe('Sessions', { concurrency: false }, async () => {
  const log = logger.child({ name: 'test' })

  /** @type {NattyClient} */
  let client

  /** @type {Natty} */
  let natty

  before(async () => {
    log.info('Starting app')
    natty = new Natty(new NattyConfig())
    await natty.start()

    log.info('Waiting for Natty to start')
    await promiseEvent(natty, 'listening')

    log.info('Creating client')
    const peer = createSocketPeer({
      host: 'localhost',
      port: natty.config.socket.port
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

  it('should reject logout without auth', async () => {
    rejects(() => client.session.logout())
  })

  after(() => {
    log.info('Disconnecting peer stream')
    client.peer.stream.destroy()

    log.info('Shutting down peer')
    client.peer.disconnect()

    log.info('Terminating Natty')
    natty.shutdown()
  })
})
