/* eslint-disable */
import { Peer } from '@elementbound/nlon'
/* eslint-enable */
import { time } from '../utils.mjs'

/**
* Session data.
* @extends {DataObject<SessionData>}
*/
export class SessionData {
  /**
  * Session id
  * @type {string}
  */
  id

  /**
  * Associated user's id
  * @type {string}
  */
  userId

  /**
  * Associated game's id
  * @type {string}
  */
  gameId

  /**
  * Peer associated with session
  * @type {Peer}
  */
  peer

  /**
  * Date of the last message received
  * @type {number}
  */
  lastMessage = time()

  /**
  * Construct instance.
  * @param {SessionData} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }
}
