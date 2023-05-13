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
  target

  /**
  * Construct entry
  * @param {RelayEntry} options Options
  */
  constructor (options) {
    Object.assign(this, options)
  }
}
