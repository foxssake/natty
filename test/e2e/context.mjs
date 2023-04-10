import { createSocketPeer } from '@elementbound/nlon-socket'
import logger from '../../src/logger.mjs'
import { config } from '../../src/config.mjs'
import { NattyClient } from '../../src/natty.client.mjs'
import { Natty } from '../../src/natty.mjs'
import { promiseEvent } from '../../src/utils.mjs'

export class End2EndContext {
  /** @type {NattyClient[]} */
  clients = []

  /** @type {Natty} */
  natty

  log = logger.child({ name: 'test' })

  async startup () {
    this.log.info('Starting app')

    this.natty = new Natty()
    await this.natty.start()

    this.log.info('Waiting for Natty ot start listening')
    await promiseEvent(this.natty, 'listening')

    this.log.info('Startup done, ready for testing')
  }

  /**
  * Create a client and connect it to Natty.
  * @returns {NattyClient}
  */
  connect () {
    this.log.info('Creating client')
    const peer = createSocketPeer({
      host: 'localhost',
      port: config.socket.port
    })

    const client = new NattyClient(peer)
    this.clients.push(client)

    return client
  }

  shutdown () {
    this.log.info('Disconnecting peer streams')
    this.clients.forEach(client => client.peer.stream.destroy())

    this.log.info('Shutting down peers')
    this.clients.forEach(client => client.peer.disconnect())

    this.log.info('Terminating Natty')
    this.natty.shutdown()
  }
}
