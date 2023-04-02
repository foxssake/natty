import { fieldIdMapper, Repository } from '../repository.mjs'

/**
* Data class linking a user to a lobby.
*
* **This is a 1:1 relation.**
*/
export class LobbyParticipant {
  /**
  * User id
  * @type {string}
  */
  userId

  /**
  * Lobby id
  * @type {string}
  */
  lobbyId

  /**
  * Construct instance.
  * @param {LobbyParticipant} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }
}

/**
* Repository managing which user is in which lobby.
* @extends {Repository<LobbyParticipant, string>}
*/
export class LobbyParticipantRepository extends Repository {
  constructor () {
    super({
      idMapper: p => `${p.userId}::${p.lobbyId}`
    })
  }

  /**
  * Remove user from lobby.
  * @param {string} userId User id
  * @param {string} lobbyId Lobby id
  * @returns {boolean}
  */
  removeParticipantFrom (userId, lobbyId) {
    return this.removeItem({ userId, lobbyId })
  }

  /**
  * Check if user is in lobby.
  * @param {string} userId User id
  * @param {string} lobbyId Lobby id
  * @returns {boolean}
  */
  isParticipantOf (userId, lobbyId) {
    return this.hasItem({ userId, lobbyId })
  }

  /**
  * Find all participants of lobby.
  * @param {string} lobbyId Lobby id
  * @returns {string[]} List of user id's
  */
  getParticipantsOf (lobbyId) {
    return [...this.list()]
      .filter(p => p.lobbyId === lobbyId)
      .map(p => p.userId)
  }

  /**
  * Delete a lobby by removing all participants from it.
  * @param {string} lobbyId Lobby id
  */
  deleteLobby (lobbyId) {
    for (const p of this.list()) {
      if (p.lobbyId === lobbyId) {
        this.remove(p.userId)
      }
    }
  }
}
