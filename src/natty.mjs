/* eslint-disable */
import * as nlon from '@elementbound/nlon'
import { NattyConfig } from './config.mjs'
/* eslint-enable */
import * as net from 'node:net'
import { fail } from 'node:assert'
import { EventEmitter } from 'node:events'
import { wrapSocketServer } from '@elementbound/nlon-socket'
import logger from './logger.mjs'

const defaultModules = [
  'sessions/sessions.mjs',
  'games/games.mjs'
]

const hooks = []

export class Natty extends EventEmitter {
  /** @type {NattyConfig} */
  #config

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

  /**
  * Construct instance.
  * @param {NattyConfig} config Config
  */
  constructor (config) {
    super()

    config ?? fail('Config required!')
    this.#config = Object.freeze({ ...config })
  }

  async start (modules) {
    modules ??= defaultModules

    this.#log.info(
      { config: this.#config, modules },
      'Starting Natty with configuration'
    )

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

    socket.listen(this.#config.socket.port, this.#config.socket.host, () => {
      this.#log.info(
        'Listening on %s:%s',
        this.#config.socket.host, this.#config.socket.port
      )

      this.emit('listening', this.#config.socket.port, this.#config.socket.host)
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

  get config () {
    return this.#config
  }
}
