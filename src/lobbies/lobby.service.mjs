/* eslint-disable */
import { User } from '../users/user.mjs'
import { LobbyRepository } from './lobby.repository.mjs'
import { LobbyParticipant, LobbyParticipantRepository } from './lobby.participant.repository.mjs'
import { GameData } from '../games/game.data.mjs'
import { NotificationService } from '../notifications/notification.service.mjs'
/* eslint-enable */
import assert from 'node:assert'
import logger from '../logger.mjs'
import { LobbyData } from './lobby.data.mjs'
import { nanoid } from 'nanoid'
import { IdInUseError } from '../repository.mjs'
import { requireParam } from '../assertions.mjs'
import { DeleteLobbyNotificationMessage, JoinLobbyNotificationMessage, LeaveLobbyNotificationMessage } from './message.templates.mjs'

class LobbyOwnerError extends Error { }

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
  /** @type {NotificationService} */
  #notificationService
  /** @type {LobbyNameConfig} */
  #nameConfig

  /**
  * Construct service.
  * @param {object} options Options
  * @param {LobbyRepository} options.lobbyRepository Lobby repository
  * @param {LobbyParticipantRepository} options.participantRepository
  *   Lobby participant repository
  * @param {NotificationService} options.notificationService
  *   Notification service
  * @param {LobbyNameConfig} options.nameConfig Lobby name rule config
  */
  constructor (options) {
    this.#lobbyRepository = requireParam(options.lobbyRepository)
    this.#participantRepository = requireParam(options.participantRepository)
    this.#notificationService = requireParam(options.notificationService)
    this.#nameConfig = requireParam(options.nameConfig)
    this.#log = logger.child({ name: 'LobbyService' })
  }

  /**
  * Create a new lobby.
  * @param {string} name Lobby name
  * @param {User} owner Owning user
  * @param {GameData} game Hosting game
  * @returns {LobbyData} New lobby
  */
  create (name, owner, game) {
    // TODO: Move to route
    assert(name.length >= this.#nameConfig.minNameLength, 'Lobby name too short!')
    assert(name.length < this.#nameConfig.maxNameLength, 'Lobby name too long!')

    // Check if user is not already in a lobby
    assert(
      this.#participantRepository.getLobbiesOf(owner.id)
        .map(lobbyId => this.#lobbyRepository.find(lobbyId))
        .every(lobby => lobby.game !== game.id),
      'User is already in a lobby!'
    )

    const lobby = this.#lobbyRepository.add(new LobbyData({
      id: nanoid(),
      name,
      owner: owner.id,
      game: game.id
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

    // Notify participants, including joining user
    this.#notificationService.send({
      message: JoinLobbyNotificationMessage(user),
      userIds: this.#participantRepository.getParticipantsOf(lobby.id)
    }).forEach(c => c.finish()) // TODO: Update to single-message correspondence
  }

  /**
  * Remove user from lobby.
  * @param {User} user Leaving user
  * @param {LobbyData} lobby Target lobby
  */
  leave (user, lobby) {
    // Do nothing if user is not part of the given lobby ( or any lobby )
    if (!this.#participantRepository.isParticipantOf(user.id, lobby.id)) {
      return
    }

    // Deny if user is owner of lobby
    if (lobby.owner === user.id) {
      throw new LobbyOwnerError('Can\'t leave own lobby')
    }

    // Remove user from lobby
    this.#participantRepository.removeParticipantFrom(user.id, lobby.id)

    // Notify participants, including leaving user
    this.#notificationService.send({
      message: LeaveLobbyNotificationMessage(user),
      userIds: [
        user.id,
        ...this.#participantRepository.getParticipantsOf(lobby.id)
      ]
    }).forEach(c => c.finish()) // TODO: Update to single-message correspondence
  }

  /**
  * Delete lobby.
  *
  * This will also remove all participants.
  * @param {LobbyData} lobby Lobby
  */
  delete (lobby) {
    // Delete lobby
    const participants = this.#participantRepository.getParticipantsOf(lobby.id)
    this.#participantRepository.deleteLobby(lobby.id)
    this.#lobbyRepository.remove(lobby.id)

    // Notify participants of lobby delete
    this.#notificationService.send({
      message: DeleteLobbyNotificationMessage(lobby),
      userIds: participants
    }).forEach(c => c.finish()) // TODO: Update to single-message correspondence
  }
}
