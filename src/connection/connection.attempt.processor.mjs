/* eslint-disable */
import { ajv } from '../ajv.mjs'
import logger from '../logger.mjs'
import { requireSchema } from '../validators/require.schema.mjs'
import { ConnectionAttempt, ConnectionAttemptState } from './connection.attempt.mjs'
import { HandshakeRequestMessage } from './message.templates.mjs'
/* eslint-enable */

ajv.addSchema({
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    target: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        port: { type: 'number' }
      },
      required: []
    },
    required: ['success']
  }
}, 'connection/handshake/response')

/**
* Process a connection attempt.
* @param {ConnectionAttempt} connectionAttempt Connection attempt
*/
export async function processConnectionAttempt (connectionAttempt) {
  const { hostingPeer, connectingPeer } = connectionAttempt
  const log = logger.child({
    name: 'processConnectionAttempt',
    hostAddress: hostingPeer?.stream?.remoteAddress,
    hostPort: hostingPeer?.stream?.remotePort,
    clientAddress: connectingPeer?.stream?.remoteAddress,
    clientPort: connectingPeer?.stream?.remotePort
  })

  connectionAttempt.state = ConnectionAttemptState.Running
  log.info('Processing connection attempt, state set to running')

  // Instruct peers to do a handshake, wait for reports
  try{
    const results = await Promise.all(
      hostingPeer.send(HandshakeRequestMessage(connectingPeer))
        .next(requireSchema('connection/handshake/response')),
      connectingPeer.send(HandshakeRequestMessage(hostingPeer))
        .next(requireSchema('connection/handshake/response'))
    )

    // Check results
    log.info({ results }, 'Gathered handshake results')
    return results.every(result => result?.success === true)
  } catch (err) {
    log.error({ err }, 'Failed to gather handshake results!')
    throw err
  }
}
