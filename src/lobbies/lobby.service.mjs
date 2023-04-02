import { User } from '../users/user.mjs'
import { LobbyRepository } from './lobby.repository.mjs'
import { LobbyParticipant, LobbyParticipantRepository } from './lobby.participant.repository.mjs'
import assert, { fail } from 'node:assert'
import logger from '../logger.mjs'
import { LobbyData } from './lobby.data.mjs'
import { nanoid } from 'nanoid'
import { IdInUseError } from '../repository.mjs'

/**
* @typedef {object} LobbyNameConfig
* @property {number} minNameLength
* @property {number} maxNameLength
*/

/**
*/
export class LobbyService {
  #log
  /** @type {LobbyRepository} */
  #lobbyRepository
  /** @type {LobbyParticipantRepository} */
  #participantRepository
  /** @type {LobbyNameConfig} */
  #nameConfig

  /**
  * Construct service.
  * @param {object} options Options
  * @param {LobbyRepository} options.lobbyRepository Lobby repository
  * @param {LobbyParticipantRepository} options.lobbyParticipantRepository
  *   Lobby participant repository
  * @param {LobbyNameConfig} options.nameConfig Lobby name rule config
  */
  constructor (options) {
    this.#lobbyRepository = options.lobbyRepository ??
      fail('Lobby repository is required!')
    this.#participantRepository = options.lobbyParticipantRepository ??
      fail('Lobby participant repository is required!')
    this.#nameConfig = options.nameConfig ?? fail('Name config is required!')
    this.#log = logger.child({ name: 'LobbyService' })
  }

  /**
  * Create a new lobby.
  * @param {string} name Lobby name
  * @param {User} owner Owning user
  * @returns {LobbyData} New lobby
  */
  create (name, owner) {
    assert(name.length >= this.#nameConfig.minNameLength, 'Lobby name too short!')
    assert(name.length < this.#nameConfig.maxNameLength, 'Lobby name too long!')

    const lobby = this.#lobbyRepository.add(new LobbyData({
      id: nanoid(),
      name,
      owner: owner.id,
      participants: []
    }))

    this.join(owner, lobby)

    return lobby
  }

  /**
  * Add user to lobby.
  * @param {User} user Joining user
  * @param {LobbyData} lobby Target lobby
  */
  join (user, lobby) {
    // Add user to lobby
    // This will throw if user is already in a lobby
    try {
      this.#participantRepository.add(new LobbyParticipant({
        userId: user.id,
        lobbyId: lobby.id
      }))
    } catch (e) {
      this.#log.error({ err: e }, 'Failed adding user to lobby')

      throw e instanceof IdInUseError
        ? new Error('User is already in a lobby!')
        : e
    }

    // TODO: Notify participants, including joining user
  }

  /**
  * Remove user from lobby.
  * @param {User} user Leaving user
  * @param {LobbyData} lobby Target lobby
  */
  leave (user, lobby) {
    // Do nothing if user is not part of the given lobby ( or any lobby )
    if (this.#participantRepository.getLobbyOf(user.id) !== lobby.id) {
      return
    }

    // Remove user from lobby
    this.#participantRepository.remove(user.id)

    // TODO: Notify participants, including leaving user
  }

  /**
  * Delete lobby.
  *
  * This will also remove all participants.
  * @param {LobbyData} lobby Lobby
  */
  delete (lobby) {
    // Delete lobby
    this.#participantRepository.deleteLobby(lobby)
    this.#lobbyRepository.remove(lobby)

    // TODO: Notify participants of lobby delete
  }
}
