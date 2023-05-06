/* eslint-disable */
import dgram from 'node:dgram'
/* eslint-enable*/

export class NetAddress {
  /** @type {string} */
  address

  /** @type {number} */
  port

  /**
  * @param {NetAddress} options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }

  toKey () {
    return `${this.address}:${this.port}`
  }

  /**
  * @param {dgram.RemoteInfo} rinfo
  * @returns {NetAddress}
  */
  static fromRinfo (rinfo) {
    return new NetAddress({
      address: rinfo.address,
      port: rinfo.port
    })
  }
}
