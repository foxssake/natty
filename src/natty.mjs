/* eslint-disable */
import * as nlon from '@elementbound/nlon'
/* eslint-enable */
import * as net from 'node:net'
import { EventEmitter } from 'node:events'
import { wrapSocketServer } from '@elementbound/nlon-socket'
import logger from './logger.mjs'
import { config } from './config.mjs'

const defaultModules = [
  'sessions/sessions.mjs',
  'games/games.mjs',
  'lobbies/lobbies.mjs',
  'connection/connections.mjs'
]

const hooks = []

export class Natty extends EventEmitter {
  /** @type {net.Server} */
  #socket

  /** @type {nlon.Server} */
  #nlons

  #log = logger

  /**
  * Register a Natty configuration hook.
  * @param {function(Natty)} h Hook
  */
  static hook (h) {
    hooks.push(h)
  }

  async start (modules) {
    modules ??= defaultModules

    this.#log.info('Starting Natty')

    const socket = net.createServer()

    /** @type {nlon.Server} */
    const nlons = wrapSocketServer(socket, {
      logger: this.#log.child({ name: 'nlons' })
    })

    this.#socket = socket
    this.#nlons = nlons

    // Import modules for hooks
    for (const m of modules) {
      this.#log.info('Pulling module %s for hooks', m)
      await import(`../src/${m}`)
    }

    // Run hooks
    this.#log.info('Running %d hooks', hooks.length)
    hooks.forEach(h => h(this))
    this.#log.info('Hooks done')

    socket.listen(config.socket.port, config.socket.host, () => {
      this.#log.info(
        'Listening on %s:%s',
        config.socket.host, config.socket.port
      )

      this.emit('listening', config.socket.port, config.socket.host)
    })
  }

  shutdown () {
    this.#log.info('Shutting down')

    this.emit('close')

    this.#socket.close()
  }

  get nlons () {
    return this.#nlons
  }
}
