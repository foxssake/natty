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
  * Participating users' id's
  * @type {string[]}
  */
  participants

  /**
  * Construct instance.
  * @param {LobbyData} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }
}
