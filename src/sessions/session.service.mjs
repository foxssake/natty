/* eslint-disable */
import { Peer } from '@elementbound/nlon'
import { UserRepository } from '../users/user.repository.mjs'
import { sessionRepository, SessionRepository } from './session.repository.mjs'
import { GameData } from '../games/game.data.mjs'
/* eslint-enable */
import { nanoid } from 'nanoid'
import { fail } from 'node:assert'
import logger from '../logger.mjs'
import { timestamp } from '../utils.mjs'
import { SessionData } from './session.data.mjs'
import { User } from '../users/user.mjs'
import { userRepository } from '../users/users.mjs'

/**
* Service for managing sessions.
*/
export class SessionService {
  #log
  /** @type {SessionRepository} */
  #sessionRepository
  /** @type {UserRepository} */
  #userRepository

  /**
  * Construct service.
  * @param {object} options Options
  * @param {SessionRepository} options.sessionRepository Session repository
  * @param {UserRepository} options.userRepository User repository
  */
  constructor (options) {
    this.#sessionRepository = options.sessionRepository ?? fail('Session repository is required!')
    this.#userRepository = options.userRepository ?? fail('User repository is required!')
    this.#log = logger.child({ name: 'SessionService' })
  }

  /**
  * Create a session.
  * @param {string} username Username
  * @param {GameData} game Game
  * @param {Peer} peer Peer initiating session
  * @returns {string} Session id
  */
  create (username, game, peer) {
    const user = this.#userRepository.add(new User({
      id: nanoid(),
      name: username
    }))

    const session = this.#sessionRepository.add(new SessionData({
      id: nanoid(),
      userId: user.id,
      gameId: game.id,
      peer
    }))

    peer.on('disconnect', () => {
      this.#log.info({ session: session.id },
        'Peer disconnected, releasing session')
      this.destroy(session.id)
    })

    peer.on('correspondence', () => {
      this.#log.debug({ session: session.id },
        'Refreshing session due to new correspondence')
      session.lastMessage = timestamp()
    })

    this.#log.info({ user, session }, 'Created session for user')
    return session.id
  }

  /**
  * Validate a session by id.
  * @param {string} id Session id
  * @returns {SessionData | undefined} Session data or undefined
  */
  validate (id) {
    const session = this.#sessionRepository.find(id)
    return session
  }

  /**
  * Destroy session by id.
  * @param {string} id Session id
  */
  destroy (id) {
    const session = this.#sessionRepository.find(id)

    if (!session) {
      return
    }

    this.#sessionRepository.remove(id)
    this.#userRepository.remove(session.userId)

    this.#log.info({ sessionId: id, userId: session.userId }, 'Destroyed session')
  }
}

export const sessionService = new SessionService({
  userRepository,
  sessionRepository
})
