import logger from "../logger.mjs";
import { Timeout, withTimeout } from "../utils.mjs";
import { ConnectionAttempt } from "./connection.attempt.mjs";
import { processConnectionAttempt } from "./connection.attempt.processor.mjs";

export class ConnectionAttemptQueue {
  /**
  * @type {Map<string, ConnectionAttempt>}
  */
  #attempts = new Map()

  /**
  * @param {ConnectionAttempt} attempt
  * @param {number} timeout
  */
  enqueue (attempt, timeout) {
    // TODO: Doc + UT
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
    withTimeout(processConnectionAttempt(attempt))
      .then(result => {
        if (result === Timeout) {
          log.warn('Connection attempt didn\'t complete in %d seconds, ignoring!', timeout)
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
  * Return id unique to connection attempt.
  *
  * If the id is known by #attempts, it means it's already known.
  * @param {ConnectionAttempt} attempt Attempt id
  * @returns {string} Attempt id
  */
  #getAttemptId (attempt) {
    return `${attempt.hostingPeer}:${attempt.connectingPeer}`
  }
}
