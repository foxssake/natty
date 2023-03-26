/* eslint-disable */
import { Peer } from '@elementbound/nlon'
import { DataObject } from '../data.mjs'
/* eslint-enable */
import { timestamp } from '../utils.mjs'

/**
* Session data.
* @extends {DataObject<SessionData>}
*/
export class SessionData extends DataObject {
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
  * Peer associated with session
  * @type {Peer}
  */
  peer

  /**
  * Date of the last message received
  * @type {number}
  */
  lastMessage = timestamp()
}
