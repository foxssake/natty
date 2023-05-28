import { sessionRepository } from './session.repository.mjs'
import { sessionSubjects } from './session.subjects.mjs'
import { startCleanupJob } from './session.cleanup.mjs'
import { Natty } from '../natty.mjs'
import { config } from '../config.mjs'
import logger from '../logger.mjs'
import { sessionService } from './session.service.mjs'

const log = logger.child({ name: 'Sessions' })

Natty.hook(natty => {
  log.info('Registering session subjects')
  natty.nlons.configure(sessionSubjects)

  log.info('Starting session cleanup job')
  const cleanupJob = startCleanupJob({
    timeout: config.session.timeout,
    interval: config.session.cleanupInterval,
    sessionRepository,
    sessionService
  })

  natty.on('close', () => {
    log.info('Natty shutting down, cancelling session cleanup job')
    clearInterval(cleanupJob)
  })
})
