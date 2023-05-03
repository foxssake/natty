import logger from "../logger.mjs";
import { Timeout, withTimeout } from "../utils.mjs";
import { ConnectionAttempt, ConnectionAttemptState } from "./connection.attempt.mjs";
import { processConnectionAttempt } from "./connection.attempt.processor.mjs";

export class ConnectionAttemptQueue {
  /**
  * @type {Map<string, ConnectionAttempt>}
  */
  #attempts = new Map()

  /**
  * @type {function(ConnectionAttempt): Promise}
  */
  #processor

  /**
  * Construct queue
  * @param {function(ConnectionAttempt): Promise<boolean>} [processor] Attempt processor
  */
  constructor (processor) {
    this.#processor = processor ?? processConnectionAttempt
  }

  /*
  * Add a connection attempt to the queue.
  *
  * The attempt will be immediately started and kept track of until it's
  * complete.
  *
  * If the attempt times out, its state will be updated and outcome set to
  * failure.
  * @param {ConnectionAttempt} attempt
  * @param {number} timeout
  */
  enqueue (attempt, timeout) {
    const log = logger.child({
      name: 'ConnectionAttemptQueue',
      connectingPeer: attempt.connectingPeer.id,
      hostingPeer: attempt.hostingPeer.id 
    })
    const id = this.#getAttemptId(attempt)

    // Check if attempt is duplicate
    if (this.#attempts.has(id)) {
      log.warn('Pushing duplicate connection attempt, ignoring')
      return
    }

    // Save attempt
    this.#attempts.set(id, attempt)

    // Process it asap
    withTimeout(this.#processAttempt(attempt))
      .then(result => {
        if (result === Timeout) {
          log.warn('Connection attempt didn\'t complete in %d seconds, ignoring!', timeout)
          attempt.state = ConnectionAttemptState.Done
          attempt.isSuccess = false
        } else {
          log.debug('Connection attempt completed with result %s', result)
        }
      })
      .catch(err => {
        log.error({ err }, 'Connection attempt failed!')
      })
      .finally(() => {
        // TODO: Consider during start sequence impl if we need to hold on to
        // this longer
        this.#attempts.delete(id)
      })
  }

  /**
  * Currently active connection attempts
  * @type {ConnectionAttempt[]}
  */
  get attempts () {
    return [...this.#attempts.values()]
  }

  /**
  * Return id unique to connection attempt.
  *
  * If the id is known by #attempts, it means it's already known.
  * @param {ConnectionAttempt} attempt Attempt id
  * @returns {string} Attempt id
  */
  #getAttemptId (attempt) {
    return `${attempt.hostingPeer}:${attempt.connectingPeer}`
  }

  /**
  * @param {ConnectionAttempt} attempt
  * @returns {Promise<boolean>}
  */
  #processAttempt (attempt) {
    return this.#processor(attempt)
  }
}
