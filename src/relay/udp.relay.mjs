import dgram from 'node:dgram'
import assert from 'node:assert'
import { NetAddress } from './net.address.mjs'

/**
* Entry for the UDP relay's translation table.
* @private
*/
class RelayEntry {
  /**
  * The remote address we've received traffic from
  * @type {NetAddress}
  */
  remote

  /**
  * The port on which we've received traffic
  * @type {number}
  */
  port

  /**
  * The target address where traffic should be forwarded
  * @type {NetAddress}
  */
  target

  /**
  * Construct entry
  * @param {RelayEntry} options Options
  */
  constructor (options) {
    Object.assign(this, options)
  }

  toKey () {
    return `${remote.toKey()}:${port}`
  }

  static makeKey (remote, port) {
    return new RelayEntry({ remote, port }).toKey()
  }
}

/**
* Class to handle UDP relays.
*
* The relay will maintain an internal table of relay entries along with a set
* of sockets, each bound to a specific port. It will listen on all the
* allocated / added sockets and match all incoming traffic against the internal
* translation table. If an entry is found, the traffic will be forwarded as-is
* based on the entry.
*/
export class UDPRelay {
  /**
  * allocated port -> socket
  * @type {Map<number, dgram.Socket>}
  */
  #sockets = Map()

  /** @type {Map<string, RelayEntry>} */
  #bindings = Map()

  /**
  * Allocate a new port for relaying.
  *
  * If port is unset or 0, a random port will be picked by the OS.
  * @param {number} [port=0] Port to allocate
  * @returns {Promise<number>} Allocated port
  */
  allocatePort (port) {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4')
      socket.bind(port, () => {
        port = this.addSocket(socket)
        resolve(port)
      })
    })
  }

  /**
  * Add an already listening socket to use for relaying.
  * @param {dgram.Socket} socket Socket
  * @returns {number} Relay port
  */
  addSocket (socket) {
    const port = socket.address.port()
    this.#sockets.set(port, socket)
    socket.on('message', (msg, rinfo) => this.#handle(socket, msg, rinfo))

    return port
  }

  /**
  * Create a binding entry for relaying.
  *
  * Whenever traffic comes in from *remote* on *port*, it will be forwarded as-is to *target*.
  * The target will see Natty's address and the specified port as sender.
  * @param {NetAddress} remote Remote address
  * @param {number} port Receiving port
  * @param {NetAddress} target Target address
  */
  bind (remote, port, target) {
    assert(this.#sockets.has(port), 'Binding on unallocated port: ' + port)

    const entry = new RelayEntry({
      remote, port, target
    })

    this.#bindings.set(entry.toKey(), entry)
  }

  /**
  * Allocated ports.
  * @type {number[]}
  */
  get ports () {
    return [...this.#sockets.keys()]
  }

  /**
  * @param {dgram.Socket} socket
  * @param {Buffer} msg
  * @param {dgram.RemoteInfo} rinfo
  */
  #handle (socket, msg, rinfo) {
    const remote = NetAddress.fromRinfo(rinfo)
    const port = socket.address().port
    const key = RelayEntry.makeKey(remote, port)
    const binding = this.#bindings.get(key)

    if (!binding) {
      // No binding, ignore message
      return
    }

    // Forward message
    socket.send(msg, binding.target.address, binding.target.port)
  }
}
