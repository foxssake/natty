import assert from 'node:assert'
import { requireParam } from "../assertions.mjs"
import { time } from "../utils.mjs"

export class BandwidthLimiter {
  #interval
  #maxTraffic
  #traffic
  #lastInterval

  /**
  * Construct instance.
  * @param {object} options Options
  * @param {number} options.maxTraffic Traffic limit in bytes/sec
  * @param {number} options.interval Traffic interval length in seconds
  */
  constructor (options) {
    this.#interval = options.interval ?? 1
    this.#maxTraffic = requireParam(options.maxTraffic)
    this.#traffic = 0
    this.#lastInterval = time()
  }

  /**
  * Validate that a given size of data fits into the bandwidth limit.
  * @param {number} size Data size
  * @throws if traffic is over limit
  */
  validate (size) {
    // If we're past the last interval, start a new one
    if (time() > this.#lastInterval + this.#interval) {
      this.#lastInterval = time()
      this.#traffic = size
      return
    }

    const limit = this.#maxTraffic * this.#interval
    assert(this.#traffic + size <= limit, 'Bandwidth limit reached!')

    this.#traffic += size
  }
}
