import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
import { userRepository } from '../users/users.mjs'
import { sessionSubjects } from './session.subjects.mjs'
import { startCleanupJob } from './session.cleanup.mjs'
import { Natty } from '../natty.mjs'
import logger from '../logger.mjs'

const log = logger.child({ name: 'Sessions' })

export const sessionRepository = new SessionRepository()
export const sessionService = new SessionService({
  userRepository,
  sessionRepository
})

Natty.hook(natty => {
  log.info({ natty, nlons: natty.nlons ?? '???' }, 'Registering session subjects')
  natty.nlons.configure(sessionSubjects)

  log.info('Starting session cleanup job')
  const cleanupJob = startCleanupJob({
    timeout: natty.config.session.timeout,
    interval: natty.config.session.cleanupInterval,
    sessionRepository,
    sessionService
  })

  natty.on('close', () => {
    log.info('Natty shutting down, cancelling session cleanup job')
    clearInterval(cleanupJob)
  })
})
