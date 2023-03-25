/* eslint-disable */
import { Server } from '@elementbound/nlon'
/* eslint-enable */
import { ajv } from '../ajv.mjs'
import { requireBody } from '../validators/require.body.mjs'
import { requireAuthorization } from '../validators/require.header.mjs'
import { requireSchema } from '../validators/require.schema.mjs'
import { sessionRepository, sessionService } from './sessions.mjs'
import { requireSession } from './validation.mjs'

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
    await corr.next(
      requireAuthorization(),
      requireSession(sessionRepository, sessionService)
    )
    const { session } = corr.context

    sessionService.destroy(session)
    corr.finish()
  })
}
