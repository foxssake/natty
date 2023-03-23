/* eslint-disable */
import { User } from './user.mjs'
/* eslint-enable */
import { Repository } from '../repository.mjs'

/**
* Repository managing all known users.
* @extends {Repository<User, string>}
*/
export class UserRepository extends Repository {
  constructor () {
    super({
      idMapper: user => user.id,
      itemMerger: (current, update) => Object.assign(current, update)
    })
  }
}
