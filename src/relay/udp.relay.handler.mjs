import { NetAddress } from "./net.address.mjs";
import { RelayEntry } from "./relay.entry.mjs";
import { UDPSocketPool } from "./udp.socket.pool.mjs";
import { time } from '../utils.mjs'
import { EventEmitter } from 'node:events'
import logger from "../logger.mjs";

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
* to Host. This way, Client will always appear as Natty:2 to the Host.
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
  */
  freeRelay (relay) {
    const idx = this.#relayTable.findIndex(e => e.equals(relay))
    if (idx < 0) {
      return false
    }

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
  */
  relay (msg, sender, target) {
    const senderRelay = this.#relayTable.find(r =>
      r.address.port == sender.port && r.address.address == sender.address
    )
    const targetRelay = this.#relayTable.find(r => r.port === target)


    if (!senderRelay || !targetRelay) {
      // We don't have a relay for the sender, target, or both
      return false
    }

    const socket = this.#socketPool.getSocket(senderRelay.port)
    if (!socket) {
      // For some reason we don't have the socket
      return false
    }

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
