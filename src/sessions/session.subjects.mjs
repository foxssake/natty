/* eslint-disable */
import { Server } from '@elementbound/nlon'
/* eslint-enable */
import { ajv, requireSchema } from '../validation.mjs'
import { Sessions } from './index.mjs'

function registerSchemas (ajv) {
  ajv.addSchema({
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }, 'session/login')
}

/**
* Configure subjects for session handling.
* @param {Server} server nlon server
*/
export function sessionSubjects (server) {
  const sessionService = Sessions.service
  registerSchemas(ajv)

  server.handle('session/login', async (_p, corr) => {
    // TODO: Handle no data ( i.e. Symbol.End )
    const request = await corr.next(requireSchema('session/login'))
    const { name } = request

    const session = sessionService.create(name)
    corr.finish({ session })
  })

  server.handle('session/logout', async (_p, corr) => {
    const session = corr.header.authorization

    if (!sessionService.validate(session)) {
      corr.error({
        type: 'InvalidSession',
        message: 'The supplied session token is invalid: ' + session
      })
      return
    }

    sessionService.destroy(session)
    corr.finish()
  })
}
