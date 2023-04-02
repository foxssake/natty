/**
* Class representing a lobby.
*/
export class LobbyData {
  /**
  * Lobby id
  * @type {string}
  */
  id

  /**
  * Lobby name
  * @type {string}
  */
  name

  /**
  * Owner user's id
  * @type {string}
  */
  owner

  /**
  * Construct instance.
  * @param {LobbyData} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }
}
