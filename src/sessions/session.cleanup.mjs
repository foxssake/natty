/* eslint-disable */
import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
/* eslint-enable */
import logger from '../logger.mjs'
import { formatDuration, time } from '../utils.mjs'

const log = logger.child({ name: 'SessionCleanup' })

/**
* Cleanup expired sessions.
* @param {object} options Options
* @param {number} options.timeout Session timeout in s
* @param {number} options.interval Session cleanup interval in s
* @param {SessionRepository} options.sessionRepository Session repository
* @param {SessionService} options.sessionService Session service
*/
export function cleanupSessions (options) {
  const { timeout, sessionRepository, sessionService } = options
  const currentTime = time()

  const expiredSessions = []
  let sessionCount = 0
  log.debug('Gathering expired sessions')
  for (const session of sessionRepository.list()) {
    ++sessionCount
    log.debug(
      { currentTime, session },
      'Session id %s has age %s',
      session.id, formatDuration(currentTime - session.lastMessage)
    )
    if (currentTime - session.lastMessage > timeout) {
      expiredSessions.push(session)
    }
  }

  log.debug('Cleaning up %d expired sessions of %d',
    expiredSessions.length, sessionCount)
  expiredSessions.forEach(session => sessionService.destroy(session.id))
}

/**
* Run a job to cleanup expired sessions.
* @param {object} options Options
* @param {number} options.timeout Session timeout in s
* @param {number} options.interval Session cleanup interval in s
* @param {SessionRepository} options.sessionRepository Session repository
* @param {SessionService} options.sessionService Session service
*/
export function startCleanupJob (options) {
  const interval = options.interval

  log.info('Launching cleanup job every %s', formatDuration(interval))
  return setInterval(
    () => cleanupSessions(options),
    interval * 1000
  )
}
