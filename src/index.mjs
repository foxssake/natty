/* eslint-disable */
import * as nlon from '@elementbound/nlon'
/* eslint-enable */
import * as net from 'node:net'
import { wrapSocketServer } from '@elementbound/nlon-socket'
import logger from './logger.mjs'
import config from './config.mjs'

import { Users } from './users/index.mjs'
import { Sessions } from './sessions/index.mjs'

const modules = {
  Users,
  Sessions
}

/**
  * Run app
  */
function main () {
  logger.info('Starting Natty')

  const socket = net.createServer()

  /** @type {nlon.Server} */
  const nlons = wrapSocketServer(socket, {
    logger: logger.child({}, { name: 'nlons' })
  })

  socket.listen(config.socket.port, config.socket.host, () =>
    logger.info('Listening on %s:%s', config.socket.host, config.socket.port)
  )

  // Setup modules
  logger.info('Setting up modules...')
  for (const [name, m] of Object.entries(modules)) {
    logger.info('Initializing %s', name)

    if (typeof m.onHost === 'function') {
      logger.info('Configuring %s', name)
      m.onHost(nlons)
    }
  }
  logger.info('Setup done')
}

main()
