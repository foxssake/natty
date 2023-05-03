/* eslint-disable */
import { Message, MessageHeader, MessageTypes, Peer } from '@elementbound/nlon'
import net from 'node:net'
/* eslint-enable */

const Subjects = Object.freeze({
  HandshakeRequest: 'connection/handshake'
})

/**
* Create a handshake request message.
* @param {Peer} target
*/
export function HandshakeRequestMessage (target) {
  /** @type {net.Socket} */
  const socket = target.stream

  return new Message({
    header: new MessageHeader({
      subject: Subjects.HandshakeRequest
    }),
    type: MessageTypes.Finish,
    body: {
      target: {
        address: socket.remoteAddress,
        port: socket.remotePort
      }
    }
  })
}
