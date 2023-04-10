import logger from '../logger.mjs'
import { Natty } from '../natty.mjs'
import { notificationService } from '../notifications/notifications.mjs'
import { LobbyParticipantRepository } from './lobby.participant.repository.mjs'
import { LobbyRepository } from './lobby.repository.mjs'
import { LobbyService } from './lobby.service.mjs'
import { createLobbySubject } from './subjects/create.lobby.mjs'
import { deleteLobbySubject } from './subjects/delete.lobby.mjs'
import { joinLobbySubject } from './subjects/join.lobby.mjs'
import { leaveLobbySubject } from './subjects/leave.lobby.mjs'
import { listLobbiesSubject } from './subjects/list.lobbies.mjs'

const log = logger.child({ name: 'Lobbies' })

export const lobbyRepository = new LobbyRepository()
export const lobbyParticipantRepository = new LobbyParticipantRepository()
export const lobbyService = new LobbyService({
  lobbyRepository,
  notificationService,
  participantRepository: lobbyParticipantRepository
})

Natty.hook(natty => {
  log.info('Registering lobby subjects')

  natty.nlons.configure(nlons => {
    createLobbySubject(nlons)
    deleteLobbySubject(nlons)
    joinLobbySubject(nlons)
    leaveLobbySubject(nlons)
    listLobbiesSubject(nlons)
  })
})
