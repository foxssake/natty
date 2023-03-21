/* eslint-disable */
import * as nlon from '@elementbound/nlon'
/* eslint-enable */

import * as net from 'node:net'
import { wrapSocketServer } from '@elementbound/nlon-socket'
import logger from './logger.mjs'
import config from './config.mjs'

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

  nlons.handle('echo', async (_peer, corr) => {
    for await (const message of corr.all()) {
      corr.write(message)
    }

    corr.finish()
  })
}

main()
