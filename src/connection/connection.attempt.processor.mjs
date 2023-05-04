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
    target: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        port: { type: 'number' }
      }
    }
  }
}, 'connection/handshake/request')

ajv.addSchema({
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    target: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        port: { type: 'number' }
      }
    }
  }
}, 'connection/handshake/response')

/**
* Process a connection attempt.
* @param {ConnectionAttempt} connectionAttempt Connection attempt
* @returns {Promise<boolean>} Attempt success
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
  connectionAttempt.isSuccess = false
  log.trace('Processing connection attempt, state set to running')

  // Instruct peers to do a handshake, wait for reports
  try {
    log.trace('Sending handshake requests')
    const results = await Promise.all([
      hostingPeer.send(HandshakeRequestMessage(connectingPeer))
        .next(requireSchema('connection/handshake/response')),
      connectingPeer.send(HandshakeRequestMessage(hostingPeer))
        .next(requireSchema('connection/handshake/response'))
    ])

    // Check results
    log.debug({ results }, 'Gathered handshake results')
    connectionAttempt.isSuccess = results.every(result => result?.success === true)
    return connectionAttempt.isSuccess
  } catch (err) {
    log.error({ err }, 'Failed to gather handshake results!')
    throw err
  } finally {
    connectionAttempt.state = ConnectionAttemptState.Done
  }
}
