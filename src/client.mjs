/* eslint-disable */
import { Peer } from '@elementbound/nlon'
/* eslint-enable */
import { fail } from 'node:assert'

/**
* Generic base class for Natty flow clients.
*
* A new client class should be created for every Natty feature ( e.g. sessions )
* and implement calls related to it.
*/
export class Client {
  /** @type {object} */
  #context

  /** @type {Peer} */
  #peer

  /**
  * Construct client
  * @param {object} options
  * @param {object} [options.context] Context
  * @param {Peer} options.peer Peer
  */
  constructor (options) {
    this.#context = options.context ?? {}
    this.#peer = options.peer ?? fail('Peer is required!')
  }

  /**
  * Client context
  * @type {object}
  */
  get context () {
    return this.#context
  }

  /**
  * Peer
  * @type {Peer}
  */
  get peer () {
    return this.#peer
  }
}
