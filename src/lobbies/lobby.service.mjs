/* eslint-disable */
import { User } from '../users/user.mjs'
import { LobbyRepository } from './lobby.repository.mjs'
import { LobbyParticipant, LobbyParticipantRepository } from './lobby.participant.repository.mjs'
import { GameData } from '../games/game.data.mjs'
import { NotificationService } from '../notifications/notification.service.mjs'
/* eslint-enable */
import assert from 'node:assert'
import logger from '../logger.mjs'
import { config } from '../config.mjs'
import { LobbyData } from './lobby.data.mjs'
import { nanoid } from 'nanoid'
import { requireParam } from '../assertions.mjs'
import { DeleteLobbyNotificationMessage, JoinLobbyNotificationMessage, LeaveLobbyNotificationMessage } from './message.templates.mjs'

export class LobbyOwnerError extends Error { }

export class AlreadyInLobbyError extends Error { }

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

  /**
  * Construct service.
  * @param {object} options Options
  * @param {LobbyRepository} options.lobbyRepository Lobby repository
  * @param {LobbyParticipantRepository} options.participantRepository
  *   Lobby participant repository
  * @param {NotificationService} options.notificationService
  *   Notification service
  */
  constructor (options) {
    this.#lobbyRepository = requireParam(options.lobbyRepository)
    this.#participantRepository = requireParam(options.participantRepository)
    this.#notificationService = requireParam(options.notificationService)
    this.#log = logger.child({ name: 'LobbyService' })
  }

  /**
  * Create a new lobby.
  * @param {string} name Lobby name
  * @param {User} owner Owning user
  * @param {GameData} game Hosting game
  * @param {boolean} isPublic Is public lobby?
  * @returns {LobbyData} New lobby
  */
  create (name, owner, game, isPublic) {
    assert(name.length >= config.lobby.minNameLength, 'Lobby name too short!')
    assert(name.length < config.lobby.maxNameLength, 'Lobby name too long!')

    this.#log.info(
      { user: owner.id, game: game.id },
      'Attempting to create lobby for user'
    )

    // Check if user is not already in a lobby
    if (this.#isUserInLobby(owner.id, game.id)) {
      this.#log.error(
        { user: owner.id, game: game.id },
        'Can\'t create lobby for user, they\'re already in a lobby'
      )

      throw new AlreadyInLobbyError('User is already in a lobby!')
    }

    const lobby = this.#lobbyRepository.add(new LobbyData({
      id: nanoid(),
      name,
      owner: owner.id,
      game: game.id,
      isPublic
    }))

    this.#log.info(
      { user: owner.id, game: game.id, lobby: lobby.id },
      'Created lobby for user'
    )

    this.join(owner, lobby)

    return lobby
  }

  /**
  * Add user to lobby.
  * @param {User} user Joining user
  * @param {LobbyData} lobby Target lobby
  */
  join (user, lobby) {
    this.#log.info(
      { user: user.id, lobby: lobby.id },
      'Attempting to add user to lobby'
    )

    // Reject if user is already in a lobby in that game
    if (this.#isUserInLobby(user.id, lobby.game)) {
      this.#log.error(
        { user: user.id, lobby: lobby.id },
        'Can\'t add user to lobby, they\'re already in another'
      )

      throw new AlreadyInLobbyError('User is already in a lobby!')
    }

    // Add user to lobby
    this.#participantRepository.add(new LobbyParticipant({
      userId: user.id,
      lobbyId: lobby.id
    }))
    this.#log.info(
      { user: user.id, lobby: lobby.id },
      'Added user to lobby'
    )

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

  /**
  * List lobbies for game.
  *
  * This will only list lobbies that are publicly visible.
  * @param {GameData} game Game
  * @returns {LobbyData[]} Lobbies
  */
  list (game) {
    // TODO: UTs
    return this.#lobbyRepository.listByGame(game.id)
      .filter(lobby => lobby.isPublic)
  }

  /**
  * Check if the user is already in a lobby for the given game.
  * @param {string} userId User id
  * @param {string} gameId Game id
  * @returns {boolean}
  */
  #isUserInLobby (userId, gameId) {
    return this.#participantRepository.getLobbiesOf(userId)
      .map(lobbyId => this.#lobbyRepository.find(lobbyId))
      .some(lobby => lobby?.game === gameId)
  }
}
