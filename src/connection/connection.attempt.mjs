/* eslint-disable */
import { Peer } from '@elementbound/nlon'
/* eslint-enable */
import { requireEnum } from '../assertions.mjs'

export const ConnectionAttemptState = Object.freeze({
  Pending: 'pending',
  Running: 'running',
  Done: 'done'
})

/**
* Class describing a connection attempt.
*
* A connection attempt is basically a connectivity check between two players.
* The players will attempt to do a handshake with eachother and report back
* their results. Depending on the outcome, a hosting strategy will be selected
* ( e.g. designate one of the players for everyone to connect to, or just relay
* traffic ).
*/
export class ConnectionAttempt {
  /**
  * Connection attempt state
  * @type {string}
  * @see ConnectionAttemptState
  */
  state = ConnectionAttemptState.Pending

  /**
  * Is the attempt successful?
  *
  * Note: If state isn't Done, this should remaing false
  * @type {boolean}
  */
  isSuccess = false

  /**
  * Hosting peer
  * @type {Peer}
  */
  hostingPeer

  /**
  * Joining peer
  * @type {Peer}
  */
  connectingPeer

  /**
  * Construct instance.
  * @param {ConnectionAttempt} options Options
  */
  constructor (options) {
    options && Object.assign(this, options)
    requireEnum(this.state, ConnectionAttemptState)
  }
}
