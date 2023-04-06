/* eslint-disable */
import { Correspondence, Message, Peer } from '@elementbound/nlon'
import { SessionRepository } from '../sessions/session.repository.mjs'
/* eslint-enable */
import { requireParam } from '../assertions.mjs'

export class NotificationService {
  /** @type {SessionRepository} */
  #sessionRepository

  /**
  * Construct service.
  * @param {object} options Options
  * @param {SessionRepository} options.sessionRepository Session repository
  */
  constructor (options) {
    this.#sessionRepository = requireParam(options.sessionRepository)
  }

  /**
  * Send a notification to a multitude of targets.
  * @param {object} options Options
  * @param {Message} options.message Message to send
  * @param {string[]} [options.userIds=[]] Target user ids
  * @param {Peer[]} [options.peers=[]] Target peers
  * @returns {Correspondence[]} A list of correspondences
  */
  send (options) {
    requireParam(options.message)

    const peers = [
      ...(options.peers ?? []),
      ...this.#userIdsToPeers(options.userIds)
    ]

    return peers.map(peer => peer.send(options.message))
  }

  #userIdsToPeers (userIds) {
    return this.#sessionRepository.findSessionsOf(...(userIds ?? []))
      .map(s => s.peer)
  }
}
