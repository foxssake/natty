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
  * Construct instance.
  * @param {SessionData} [data] Data
  */
  constructor (data) {
    data && Object.assign(this, data)
  }
}
