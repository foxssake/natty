/* eslint-disable */
import { UserRepository } from '../users/user.repository.mjs'
import { SessionRepository } from './session.repository.mjs'
/* eslint-enable */
import { nanoid } from 'nanoid'
import { fail } from 'node:assert'
import logger from '../logger.mjs'

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
  * @returns {string} Session id
  */
  create (username) {
    const user = this.#userRepository.add({
      id: nanoid(),
      name: username
    })

    const session = this.#sessionRepository.add({
      id: nanoid(),
      userId: user.id
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
