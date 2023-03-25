/* eslint-disable */
import { Server } from '@elementbound/nlon'
import logger from '../logger.mjs'
/* eslint-enable */
import { ajv, requireSchema } from '../validation.mjs'
import { sessionService } from './index.mjs'

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
  registerSchemas(ajv)

  logger.debug({ server }, 'Registering subject')
  server.handle('session/login', async (peer, corr) => {
    // TODO: Handle no data ( i.e. Symbol.End )
    const request = await corr.next(requireSchema('session/login'))
    const { name } = request

    const session = sessionService.create(name, peer)
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
