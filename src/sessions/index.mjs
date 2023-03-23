import { SessionRepository } from './session.repository.mjs'
import { SessionService } from './session.service.mjs'
import { Users } from '../users/index.mjs'
import { sessionSubjects } from './session.subjects.mjs'

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

  onHost: host => sessionSubjects(host)
})
