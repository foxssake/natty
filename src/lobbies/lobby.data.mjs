import assert from 'node:assert'
import { enumerated } from '../config.parsers.mjs'

/**
* Possible lobby states.
* @readonly
* @enum {string}
*/
export const LobbyState = Object.freeze({
  Gathering: 'gathering',
  Starting: 'starting',
  Active: 'active'
})

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
  * Associated game's id
  * @type {string}
  */
  game

  /**
  * Lobby state
  * @type {string}
  */
  state = LobbyState.Gathering

  /**
  * Is the lobby public?
  * @type {boolean}
  */
  isPublic = true

  /**
  * Is lobby locked?
  * @type {boolean}
  */
  get isLocked () {
    return this.state !== LobbyState.Gathering
  }

  /**
  * Construct instance.
  * @param {LobbyData} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
    assert(
      enumerated(this.state, Object.values(LobbyState)),
      'Trying to create lobby with invalid state: ' + this.state
    )
  }
}
