import { beforeEach, describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { LobbyService } from '../../../src/lobbies/lobby.service.mjs'
import { mockClass } from '../../mocking.mjs'
import { LobbyRepository } from '../../../src/lobbies/lobby.repository.mjs'
import { LobbyParticipantRepository } from '../../../src/lobbies/lobby.participant.repository.mjs'
import { NotificationService } from '../../../src/notifications/notification.service.mjs'
import { User } from '../../../src/users/user.mjs'
import { Repository } from '../../../src/repository.mjs'
import { GameData } from '../../../src/games/game.data.mjs'
import { LobbyData } from '../../../src/lobbies/lobby.data.mjs'

describe('LobbyService', () => {
  /** @type {LobbyRepository} */
  let lobbyRepository
  /** @type {LobbyParticipantRepository} */
  let participantRepository
  /** @type {NotificationService} */
  let notificationService

  /** @type {LobbyService} */
  let lobbyService

  function setup () {
    lobbyRepository = mockClass(LobbyRepository, Repository)
    participantRepository = mockClass(LobbyParticipantRepository, Repository)
    notificationService = mockClass(NotificationService)

    participantRepository.getLobbiesOf = mock.fn(() => [])
    participantRepository.add = mock.fn(item => item)
    lobbyRepository.add = mock.fn(item => item)
    notificationService.send = mock.fn(() => [])

    lobbyService = new LobbyService({
      nameConfig: {
        minNameLength: 4,
        maxNameLength: 16
      },
      lobbyRepository,
      participantRepository,
      notificationService
    })
  }

  describe('create', () => {
    beforeEach(setup)

    it('should create lobby', () => {
      // Given
      const lobbyName = 'test'
      const ownerUser = new User({ id: 'a', name: 'b' })
      const game = new GameData({ id: 'foo', name: 'Foo game' })

      // When
      const actual = lobbyService.create(lobbyName, ownerUser, game)

      // Then
      assert(actual)
      assert.equal(actual.game, game.id)
      assert.equal(actual.name, lobbyName)
      assert.equal(actual.owner, ownerUser.id)
    })

    it('should add owner to new lobby', () => {
      // Given
      const lobbyName = 'test'
      const ownerUser = new User({ id: 'a', name: 'b' })
      const game = new GameData({ id: 'foo', name: 'Foo game' })

      participantRepository.getParticipantsOf = mock.fn(lobby => [ownerUser.id])

      // When
      lobbyService.create(lobbyName, ownerUser, game)

      // Then
      assert.equal(notificationService.send.mock.callCount(), 1)
      assert.deepEqual(
        notificationService.send.mock.calls[0].arguments[0].userIds,
        [ownerUser.id]
      )
    })

    it('should reject short name', () => {
      // Given
      const lobbyName = '.'
      const ownerUser = new User({ id: 'a', name: 'b' })
      const game = new GameData({ id: 'foo', name: 'Foo game' })

      // When + then
      assert.throws(
        () => lobbyService.create(lobbyName, ownerUser, game),
        e => e.message === 'Lobby name too short!'
      )
    })

    it('should reject long name', () => {
      // Given
      const lobbyName = '.'.repeat(128)
      const ownerUser = new User({ id: 'a', name: 'b' })
      const game = new GameData({ id: 'foo', name: 'Foo game' })

      // When + then
      assert.throws(
        () => lobbyService.create(lobbyName, ownerUser, game),
        e => e.message === 'Lobby name too long!'
      )
    })

    it('should reject when already in lobby', () => {
      // Given
      const lobbyName = 'test'
      const ownerUser = new User({ id: 'usr-reject', name: 'b' })
      const game = new GameData({ id: 'foo', name: 'Foo game' })
      const currentLobby = new LobbyData({
        id: '0xtest',
        game: game.id,
        name: 'Current lobby',
        owner: ownerUser.id
      })

      participantRepository.getLobbiesOf = mock.fn(() => [currentLobby.id])
      lobbyRepository.find = mock.fn(() => currentLobby)

      // When + then
      assert.throws(
        () => lobbyService.create(lobbyName, ownerUser, game),
        e => e.message === 'User is already in a lobby!'
      )
    })
  })

  describe('join', () => {
    beforeEach(setup)

    it('should join lobby', () => {
      // Given
      const owner = new User({
        id: 'usr-owner',
        name: 'Owner user'
      })

      const user = new User({
        id: 'usr-join',
        name: 'Joining user'
      })

      const lobby = new LobbyData({
        id: 'l001',
        game: 'g001',
        name: 'Target lobby',
        owner: owner.id
      })

      participantRepository.getParticipantsOf = mock.fn(
        () => [owner.id, user.id]
      )

      // When
      lobbyService.join(user, lobby)

      // Then
      assert.equal(notificationService.send.mock.callCount(), 1)
      assert.deepEqual(
        notificationService.send.mock.calls[0].arguments[0].userIds,
        [owner.id, user.id]
      )
    })

    it('should reject if already in lobby', () => {
      // Given
      const owner = new User({
        id: 'usr-owner',
        name: 'Owner user'
      })

      const user = new User({
        id: 'usr-join',
        name: 'Joining user'
      })

      const currentLobby = new LobbyData({
        id: 'l002',
        game: 'g001',
        name: 'Current lobby',
        owner: user.id
      })

      const lobby = new LobbyData({
        id: 'l001',
        game: 'g001',
        name: 'Target lobby',
        owner: owner.id
      })

      participantRepository.getLobbiesOf = mock.fn(() => [currentLobby.id])
      lobbyRepository.find = mock.fn(() => currentLobby)

      // When + then
      assert.throws(
        () => lobbyService.join(user, lobby),
        e => e.message === 'User is already in a lobby!'
      )
    })
  })
})
