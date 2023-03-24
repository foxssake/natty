import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
import { Users } from '../users/index.mjs'
import { sessionSubjects } from './session.subjects.mjs'
import { startCleanupJob } from './session.cleanup.mjs'
import config from '../config.mjs'
import { Natty } from '../natty.mjs'
import logger from '../logger.mjs'

export * from './session.data.mjs'
export * from './session.repository.mjs'
export * from './session.service.mjs'

const log = logger.child({ name: 'Sessions' })

const repository = new SessionRepository()
const service = new SessionService({
  userRepository: Users.repository,
  sessionRepository: repository
})

Natty.hook(natty => {
  log.info({ natty, nlons: natty.nlons ?? '???' }, 'Registering session subjects')
  natty.nlons.configure(sessionSubjects)

  log.info('Starting session cleanup job')
  const cleanupJob = startCleanupJob({
    timeout: config.session.timeout,
    interval: config.session.cleanupInterval,
    sessionRepository: repository,
    sessionService: service
  })

  natty.on('close', () => {
    log.info('Natty shutting down, cancelling session cleanup job')
    clearInterval(cleanupJob)
  })
})

export const Sessions = Object.freeze({
  repository,
  service
})
