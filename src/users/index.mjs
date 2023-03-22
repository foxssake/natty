import { UserRepository } from './user.repository.mjs'

export * from './user.mjs'
export * from './user.repository.mjs'

export const Users = Object.freeze({
  // TODO: Consider method + wrap in memoizer
  repository: new UserRepository()
})
