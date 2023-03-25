/* eslint-disable */
import { Server } from '@elementbound/nlon'
import { ajv } from '../ajv.mjs'
import logger from '../logger.mjs'
import { requireBody } from '../validators/require.body.mjs'
import { requireAuthorization } from '../validators/require.header.mjs'
import { requireSchema } from '../validators/require.schema.mjs'
/* eslint-enable */
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
    const request = await corr.next(
      requireBody(),
      requireSchema('session/login')
    )
    const { name } = request

    const session = sessionService.create(name, peer)
    corr.finish({ session })
  })

  server.handle('session/logout', async (_p, corr) => {
    await corr.next(requireAuthorization())
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
