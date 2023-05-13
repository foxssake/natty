import { stringifyEquals } from "../utils.mjs"

/**
* Entry for the relay translation tables.
*/
export class RelayEntry {
  /**
  * The port on which we've received traffic
  * @type {number}
  */
  port

  /**
  * The target address where traffic should be forwarded
  * @type {NetAddress}
  */
  address

  /**
  * Time the relay was last used to send data.
  * @type {number}
  */
  lastSent = 0

  /**
  * Time the relay last received traffic on its port.
  * @type {number}
  */
  lastReceived = 0

  /**
  * Construct entry
  * @param {RelayEntry} options Options
  */
  constructor (options) {
    Object.assign(this, options)
  }

  /**
  * Check for equality
  * @param {RelayEntry} other Other
  * @returns {boolean} True if equal
  */
  equals (other) {
    // TODO: Optimize if needed
    return stringifyEquals(this, other)
  }
}
