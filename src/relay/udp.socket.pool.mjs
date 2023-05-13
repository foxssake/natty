import dgram from 'node:dgram'

/**
* Class to manage and allocate UDP ports as needed.
*
* The socket pool is used during UDP relaying. We need to both listen on and
* send traffic through multiple ports during relay. The socket pool ensures
* that these sockets are always available.
*
* This is a low-level interface, concerned only with the allocation, storage
* and deallocation of ports and by extension, UDP sockets.
*/
export class UDPSocketPool {
  /**
  * Port to socket
  * @type {Map<number, dgram.Socket>}
  */
  #sockets = new Map()

  /**
  * Allocate a new port for relaying.
  *
  * If port is unset or 0, a random port will be picked by the OS.
  * @param {number} [port=0] Port to allocate
  * @returns {Promise<number>} Allocated port
  */
  allocatePort (port) {
    return new Promise((resolve) => {
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
    const port = socket.address().port
    this.#sockets.set(port, socket)

    return port
  }

  /**
  * Close the socket associated with the given port.
  *
  * Does nothing if the port is not managed by the relay.
  * @param {number} port Port
  */
  freePort (port) {
    this.#sockets.get(port)?.close()
    // this.#sockets.delete(port)
  }

  /**
  * Get socket listening on port.
  * @param {number} port Port
  * @returns {dgram.Socket|undefined} Socket
  */
  getSocket (port) {
    return this.#sockets.get(port)
  }

  /**
  * Allocated ports.
  * @type {number[]}
  */
  get ports () {
    return [...this.#sockets.keys()]
  }
}
