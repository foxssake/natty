import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
import { Users } from '../users/index.mjs'
import { sessionSubjects } from './session.subjects.mjs'
import { startCleanupJob } from './session.cleanup.mjs'
import config from '../config.mjs'

export * from './session.data.mjs'
export * from './session.repository.mjs'
export * from './session.service.mjs'

const repository = new SessionRepository()
const service = new SessionService({
  userRepository: Users.repository,
  sessionRepository: repository
})

export const Sessions = Object.freeze({
  repository,
  service,

  onHost: host => {
    sessionSubjects(host)
    startCleanupJob({
      timeout: config.session.timeout,
      interval: config.session.cleanupInterval,
      sessionRepository: repository,
      sessionService: service
    })
  }
})
