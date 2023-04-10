/* eslint-disable */
import { UserRepository } from '../../users/user.repository.mjs'
/* eslint-enable */
import { requireParam } from '../../assertions.mjs'
import { InvalidSessionError } from './require.session.mjs'
import { ExtractMapperValidator } from '../../validators/extract.mapper.validator.mjs'
import { userRepository } from '../../users/users.mjs'
import { asSingletonFactory } from '../../utils.mjs'

export class SessionUserIdValidator extends ExtractMapperValidator {
  /**
  * Construct validator.
  * @param {object} options Options
  * @param {UserRepository} options.userRepository User repository
  */
  constructor (options) {
    requireParam(options.userRepository)

    super({
      extractor: (_b, _h, context) => context.session.userId,
      mapper: id => options.userRepository.find(id),
      writer: (context, user) => { context.user = user },
      thrower: () => {
        throw new InvalidSessionError('No user found for session!')
      }
    })
  }
}

/**
* Extract the user from session into context.
*
* Needs `session` to be in context, by calling `requireSession` first.
*
* Saves user in `context.user`
*
* @returns {ReadHandler}
*/
export const requireSessionUser = asSingletonFactory(() =>
  new SessionUserIdValidator({
    userRepository
  }).asFunction()
)
