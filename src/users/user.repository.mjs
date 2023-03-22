import { User } from "./user.mjs";

/**
* Repository managing all known users.
*/
export class UserRepository {
  /** @type {Map<string, User>} */
  #users = new Map()

  /**
  * @summary Store user.
  *
  * @description If the user already exists, then update their data, otherwise
  * store a completely new user.
  *
  * @param {User} user User
  */
  store (user) {
    const knownUser = this.find(user.id)
    knownUser
      ? Object.assign(knownUser, user)
      : this.#users.set(user.id, user)
  }

  /**
  * Find user by ID.
  *
  * @param {string} id User ID
  * @returns {User|undefined} User or undefined
  */
  find (id) {
    // TODO: Consider freeze before return
    return this.#users.get(id)
  }

  /**
  * Check if a user exists by ID.
  *
  * @param {string} id User ID
  * @returns {boolean} Whether the user exists
  */
  has (id) {
    return this.find(id) !== undefined
  }
}
