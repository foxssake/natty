import dgram from 'node:dgram'
import { SessionRepository } from '../sessions/session.repository.mjs'
import { UDPRelayHandler } from './udp.relay.handler.mjs'
import { RelayEntry } from './relay.entry.mjs'
import { NetAddress } from './net.address.mjs'
import { requireParam } from '../assertions.mjs'

/**
* @summary Class for remote address registration over UDP.
*
* @description The UDP remote registrar will listen on a specific port for
* incoming session ID's. If the session ID is valid, it will create a new relay
* for that player and reply a packet saying 'OK'.
*
* Note that if the relay already exists, it will reply anyway, but will not
* create duplicate relays. This helps combatting UDP's unreliable nature -
* clients can just spam the request until they receive a reply.
*/
export class UDPRemoteRegistrar {
  /** @type {dgram.Socket} */
  #socket

  /** @type {SessionRepository} */
  #sessionRepository

  /** @type {UDPRelayHandler} */
  #udpRelayHandler

  /**
  * Construct instance.
  * @param {object} options Options
  * @param {SessionRepository} options.sessionRepository Session repository
  * @param {UDPRelayHandler} options.udpRelayHandler UDP relay handler
  * @param {dgram.Socket} [options.socket] Socket
  */
  constructor (options) {
    this.#sessionRepository = requireParam(options.sessionRepository)
    this.#udpRelayHandler = requireParam(options.udpRelayHandler)
    this.#socket = options.socket ?? dgram.createSocket('udp4')
  }

  /**
  * Start listening for incoming requests.
  * @param {number} [port=0] Port
  * @param {string} [address='0.0.0.0'] Address
  * @returns {Promise<void>}
  */
  listen (port, address) {
    return new Promise(resolve => {
      port ??= 0
      address ??= '0.0.0.0'

      this.#socket.bind(port, address, resolve)
      this.#socket.on('message', (msg, rinfo) => this.#handle(msg, rinfo))
    })
  }

  /**
  * Socket listening for requests.
  * @type {dgram.Socket}
  */
  get socket () {
    return this.#socket
  }

  /**
  * @param {Buffer} msg
  * @param {dgram.RemoteInfo} rinfo
  */
  async #handle (msg, rinfo) {
    try {
      const sessionId = msg.toString('utf8')
      const session = this.#sessionRepository.find(sessionId)
      assert(session, 'Unknown session id!')

      await this.#udpRelayHandler.createRelay(new RelayEntry({
        address: NetAddress.fromRinfo(rinfo)
      }))

      this.#socket.send('OK', rinfo.port, rinfo.address)
    } catch (e) {
      this.#socket.send(e.message ?? 'Error', rinfo.port, rinfo.address)
    }
  }
}
