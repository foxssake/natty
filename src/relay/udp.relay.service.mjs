import assert from 'node:assert'
import dgram from 'node:dgram'
import { requireParam } from '../assertions.mjs'
import { LobbyData } from '../lobbies/lobby.data.mjs'
import logger from '../logger.mjs'
import { User } from '../users/user.mjs'
import { UDPRelay } from './udp.relay.mjs'
import { SessionData } from '../sessions/session.data.mjs'
import { LobbyParticipantRepository } from '../lobbies/lobby.participant.repository.mjs'
import { LobbyRepository } from '../lobbies/lobby.repository.mjs'
import { NetAddress } from './net.address.mjs'

const log = logger.child({ name: 'UDPRelayService' })

export class UDPRelayService {
  /** @type {UDPRelay} */
  #udpRelay

  /**
  * Maps lobbyId -> session -> port
  * @type {Map<string, Map<string, number>>}
  */
  #lobbyPorts = new Map()

  /** @type {LobbyParticipantRepository} */
  #lobbyParticipantRepository

  /** @type {LobbyRepository} */
  #lobbyRepository

  /** @type {number} */
  #allocatePortCount

  /**
  * @param {object} options Options
  * @param {UDPRelay} options.udpRelay
  * @param {number} options.initialPorts
  * @param {number} options.allocatePorts
  */
  constructor (options) {
    this.#udpRelay = requireParam(options.udpRelay)
    this.#allocatePortCount = requireParam(options.allocatePorts)
    const initialPorts = requireParam(options.initialPorts)

    log.info('Allocating initial %d ports', )
    this.#allocatePorts(initialPorts)
  }

  /**
  * @param {SessionData} hostSession
  * @param {SessionData} clientSession
  */
  async createRelay (hostSession, clientSession) {
    const hostPort = await this.getPortFor(hostSession)
    const clientPort = await this.getPortFor(clientSession)

    // TODO: These are TCP sockets - how do we know their UDP address?
    /** @type {dgram.Socket} */
    const hostSocket = hostSession.peer.stream
    /** @type {dgram.Socket} */
    const clientSocket = clientSession.peer.stream

    const hostAddress = NetAddress.fromRinfo(hostSocket.remoteAddress())
    const clientAddress = NetAddress.fromRinfo(clientSocket.remoteAddress())

    this.#udpRelay.bind(hostAddress, clientPort, clientAddress)
    this.#udpRelay.bind(clientAddress, hostPort, hostAddress)
  }

  /**
  * @param {SessionData} session
  */
  async getPortFor (session) {
    const lobby = this.#lobbyParticipantRepository.getLobbiesOf(session.userId)
      .map(lobbyId => this.#lobbyRepository.find(lobbyId))
      .find(lobby => lobby.game === session.gameId)

    assert(lobby, 'Can\'t find session lobby!')

    if (this.#lobbyPorts.get(lobby.id)?.has(session.id)) {
      return this.#lobbyPorts.get(lobby.id).get(session.id)
    }

    if (!this.#hasFreeLobbyPort(lobby.id)) {
      log.trace({ lobby: lobby.id }, 'Ran out of ports for lobby, allocating')
      await this.#allocatePorts(this.#allocatePortCount)
    }

    const lobbyPorts = this.#getLobbyPorts(lobby.id)
    const availablePorts = this.#udpRelay.ports
    const port = availablePorts.find(p => !lobbyPorts.includes(p))

    this.#saveLobbyPort(lobby.id, session.id, port)

    return port
  }

  #hasFreeLobbyPort (lobbyId) {
    const allocatedPortCount = this.#lobbyPorts.get(lobbyId)?.size ?? 0
    const availablePortCount = this.#udpRelay.ports.length

    return allocatedPortCount < availablePortCount
  }

  #getLobbyPorts (lobbyId) {
    const it = this.#lobbyPorts.get(lobbyId)?.values()
    return it ? [...it] : []
  }

  #saveLobbyPort (lobbyId, sessionId, port) {
    if (!this.#lobbyPorts.has(lobbyId)) {
      this.#lobbyPorts.set(lobbyId, new Map())
    }

    this.#lobbyPorts.get(lobbyId).set(sessionId, port)
  }

  async #allocatePorts (count) {
    log.info('Allocating %d ports for relays', count)

    // TODO: Check if we can allocate more ports
    for (let i = 0; i < count; ++i) {
      const port = await this.#udpRelay.allocatePort()
      log.debug('Allocated port %d', port)
    }
  }

  #getLobbyPorts (lobbyId) {
    if (!this.#lobbyPorts.has(lobbyId)) {
      this.#lobbyPorts.set(lobbyId, new Set())
    }

    return this.#lobbyPorts.get(lobbyId)
  }
}
