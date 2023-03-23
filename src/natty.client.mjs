/* eslint-disable */
import { Peer } from '@elementbound/nlon'
/* eslint-enable */
import { fail } from 'node:assert'
import { SessionClient } from './sessions/session.client.mjs'

export class NattyClient {
  /** @type {object} */
  #context = {}

  /** @type {Peer} */
  peer

  /** @type {SessionClient} */
  session

  /**
  * Construct client
  * @param {Peer} peer Peer
  */
  constructor (peer) {
    this.peer = peer ?? fail('Peer required!')

    this.session = new SessionClient({ peer, context: this.#context })

    Object.freeze(this)
  }
}
