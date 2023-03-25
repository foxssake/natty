/* eslint-disable */
import { Peer } from '@elementbound/nlon'
/* eslint-enable */
import { Client } from './client.mjs'
import { SessionClient } from './sessions/session.client.mjs'

/**
* Natty client class.
*
* Contains multiple clients specific to a given feature, each with a shared
* context.
*/
export class NattyClient extends Client {
  /** @type {SessionClient} */
  session

  /**
  * Construct client
  * @param {Peer} peer Peer
  */
  constructor (peer) {
    super({
      peer
    })

    this.session = new SessionClient({ peer, context: this.context })

    Object.freeze(this)
  }
}
