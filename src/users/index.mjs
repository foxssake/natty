import { UserRepository } from './user.repository.mjs'

export * from './user.mjs'
export * from './user.repository.mjs'

export const Users = Object.freeze({
  repository: new UserRepository()
})
