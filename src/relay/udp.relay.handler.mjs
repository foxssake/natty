/* eslint-disable */
import { RelayEntry } from './relay.entry.mjs'
/* eslint-enable */
import { NetAddress } from './net.address.mjs'
import { UDPSocketPool } from './udp.socket.pool.mjs'
import { time } from '../utils.mjs'
import { EventEmitter } from 'node:events'
import logger from '../logger.mjs'

const log = logger.child({ name: 'UDPRelayHandler' })

/**
* Class implementing the actual relay logic.
*
* The relay handler keeps an internal table of relay entries and a socket pool.
*
* Whenever a new relay is added, the socket pool ensures that we have the
* necessary local port allocated to listen for incoming traffic on that port.
*
* When traffic arrives on any of the listening ports, it is first checked in
* the translation table. If there's an entry both for the sender AND target,
* the traffic is forwarded as-is, through the port dedicated to the sender.
*
* Example: Port 1 is allocated for Host, port 2 is allocated for Client. When
* we get a packet targeting port 1 from Client, we use port 2 to relay the data
* to Host. This way, Client will always appear as Noray:2 to the Host.
*/
export class UDPRelayHandler extends EventEmitter {
  /** @type {UDPSocketPool} */
  #socketPool

  /** @type {RelayEntry[]} */
  #relayTable = []

  /**
  * Construct instance.
  * @param {object} options Options
  * @param {UDPSocketPool} [options.socketPool] Socket pool
  */
  constructor (options) {
    super()

    this.#socketPool = options?.socketPool ?? new UDPSocketPool()
  }

  /**
  * Create a relay entry.
  * @param {RelayEntry} relay Relay
  * @return {Promise<boolean>} True if the entry was created, false if it
  * already exists
  * @fires UDPRelayHandler#create
  */
  async createRelay (relay) {
    log.debug({ relay }, 'Creating relay')
    if (this.hasRelay(relay)) {
      // We already have this relay entry
      log.trace({ relay }, 'Relay already exists, ignoring')
      return false
    }

    this.emit('create', relay)

    const socket = await this.#ensurePort(relay.port)
    socket.on('message', (msg, rinfo) => {
      this.relay(msg, NetAddress.fromRinfo(rinfo), relay.port)
    })
    relay.lastReceived = time()
    relay.created = time()
    this.#relayTable.push(relay)
    log.trace({ relay }, 'Relay created')

    return true
  }

  /**
  * Check if relay already exists in the table.
  * @param {RelayEntry} relay Relay
  * @returns {boolean} True if relay already exists
  */
  hasRelay (relay) {
    return this.#relayTable.find(e => e.equals(relay)) !== undefined
  }

  /**
  * Free a relay entry, removing it from the table and freeing any associated resources.
  * @param {RelayEntry} relay Relay
  * @returns {boolean} True if a relay was freed
  * @fires UDPRelayHandler#destroy
  */
  freeRelay (relay) {
    const idx = this.#relayTable.findIndex(e => e.equals(relay))
    if (idx < 0) {
      return false
    }

    this.emit('destroy', relay)

    this.#socketPool.freePort(relay.port)
    this.#relayTable = this.#relayTable.filter((_, i) => i !== idx)
    return true
  }

  /**
  * Free all relay entries, and by extension, sockets in the pool.
  */
  clear () {
    this.relayTable.forEach(entry => this.freeRelay(entry))
  }

  /**
  * Relay a message from a given sender to target.
  * @param {Buffer} msg Message
  * @param {NetAddress} sender Sender address
  * @param {number} target Target port
  * @returns {Promise<boolean>} True on success
  * @fires UDPRelayHandler#transmit
  * @fires UDPRelayHandler#drop
  */
  relay (msg, sender, target) {
    const senderRelay = this.#relayTable.find(r =>
      r.address.port === sender.port && r.address.address === sender.address
    )
    const targetRelay = this.#relayTable.find(r => r.port === target)

    if (!senderRelay || !targetRelay) {
      // We don't have a relay for the sender, target, or both
      this.emit('drop', senderRelay, targetRelay, sender, target, msg)
      return false
    }

    const socket = this.#socketPool.getSocket(senderRelay.port)
    if (!socket) {
      // For some reason we don't have the socket
      return false
    }

    this.emit('transmit', senderRelay, targetRelay, msg)

    socket.send(msg, targetRelay.address.port, targetRelay.address.address)

    // Keep track of traffic timings
    senderRelay.lastReceived = time()
    targetRelay.lastSent = time()

    return true
  }

  /**
  * Socket pool used for relays.
  * @type {UDPSocketPool}
  */
  get socketPool () {
    return this.#socketPool
  }

  /**
  * Relay table used for relays.
  * @type {RelayEntry[]}
  */
  get relayTable () {
    return [...this.#relayTable]
  }

  async #ensurePort (port) {
    if (!this.#socketPool.getSocket(port)) {
      await this.#socketPool.allocatePort(port)
    }

    return this.#socketPool.getSocket(port)
  }
}

/**
* Relay creation event.
*
* This is emitted *before* the relay is pushed, giving the handler a change to
* reject by throwing.
* @event UDPRelayHandler#create
* @param {RelayEntry} relay Relay entry
*/

/**
* Relay transmission event.
*
* This event is emitted *before* the packet is transmitted from the source
* relay to the target relay.
* @event UDPRelayHandler#transmit
* @param {RelayEntry} sourceRelay Source relay
* @param {RelayEntry} targetRelay Target relay
* @param {Buffer} message Message
*/

/**
* Relay destroy event.
*
* This event is emitted *before* a relay and its associated resources are
* freed.
* @event UDPRelayHandler#destroy
* @param {RelayEntry} relay Relay being freed.
*/

/**
* Relay drop event.
*
* This event is emitted when a packet arrives for relay that we can't transfer
* - usually because of an unknown node ( either sender or target).
* @event UDPRelayHandler#drop
* @param {RelayEntry} sourceRelay Source relay
* @param {RelayEntry} targetRelay Target relay
* @param {NetAddress} sourceAddress Source address
* @param {number} targetPort Target port
* @param {Buffer} message Message
*/
