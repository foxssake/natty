import dgram from 'node:dgram'
import assert from 'node:assert'
import { requireParam } from '../assertions.mjs'

export class NetAddress {
  /** @type {string} */
  address

  /** @type {number} */
  port

  /**
  * @param {NetAddress} options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }

  toKey () {
    return `${this.address}:${this.port}`
  }

  /**
  * @param {dgram.RemoteInfo} rinfo
  * @returns {NetAddress}
  */
  static fromRinfo (rinfo) {
    return new NetAddress({
      address: rinfo.address,
      port: rinfo.port
    })
  }
}

export class UDPRelay {
  /** @type {dgram.Socket} */
  #socket

  /** @type {Map<string, NetAddress>} */
  #bindings

  /**
  * @param {dgram.Socket} socket
  */
  constructor (socket) {
    this.#socket = requireParam(socket)

    this.#socket.on('message', (msg, rinfo) => this.#handle(msg, rinfo))
  }

  /**
  * Create a relay between two addresses, linking them.
  * @param {NetAddress} a
  * @param {NetAddress} b
  */
  link (a, b) {
    assert(!this.#bindings.has(a.toKey()), `Address ${a.toKey()} is already bound!`)
    assert(!this.#bindings.has(b.toKey()), `Address ${b.toKey()} is already bound!`)

    this.#bindings.set(a.toKey(), b)
    this.#bindings.set(b.toKey(), a)
  }

  /**
  * @param {Buffer} msg
  * @param {dgram.RemoteInfo} rinfo
  */
  #handle (msg, rinfo) {
    const remote = NetAddress.fromRinfo(rinfo)
    const target = this.#bindings.get(remote.toKey())

    if (!target) {
      // No binding, ignore message
      return
    }

    // Forward message
    this.#socket.send(msg, target.port, target.address)
  }
}
