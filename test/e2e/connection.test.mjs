import { describe, it, after, before } from 'node:test'
import { End2EndContext } from './context.mjs'
import { config } from '../../src/config.mjs'
import { requireSchema } from '../../src/validators/require.schema.mjs'
import { sleep } from '../../src/utils.mjs'

describe('Connections', { concurrency: false }, () => {
  const context = new End2EndContext()

  before(async () => {
    config.games = 'test001 Test'
    await context.startup()
  })

  it('should send connection diagnostics on join', { skip: true }, async () => {
    // Given
    context.log.info('Creating clients')
    const host = context.connect()
    const client = context.connect()

    context.log.info('Logging in clients')
    await host.session.login('host', 'test001')
    await client.session.login('client', 'test001')

    context.log.info('Creating lobby')
    const lobby = await host.lobbies.create('test')

    // When
    context.log.info('Joining lobby with client')
    await client.lobbies.join(lobby)

    // Then
    context.log.info('Waiting for incoming requests')
    await sleep(config.connectionDiagnostics.timeout + 0.1)
    ;(await host.peer.receive()).next(requireSchema('connection/handshake/request'))
    ;(await client.peer.receive()).next(requireSchema('connection/handshake/request'))
  })

  after(() => context.shutdown())
})
