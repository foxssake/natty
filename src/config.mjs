import * as dotenv from 'dotenv'

/** @module config */

dotenv.config()

/**
  * Parse config value as integer.
  *
  * @param {any} value Value
  * @returns {number?} Integer or undefined
  */
function integer (value) {
  const result = parseInt(value)
  return isNaN(result) ? undefined : result
}

/**
* Parse config value as number
*
* @param {any} value Value
* @returns {number?} Number or undefined
*/
function number (value) {
  const result = parseFloat(value)
  return isNaN(result) ? undefined : result
}

/**
  * Parse config value as enum.
  *
  * @param {any} value Value
  * @param {Array} values Allowed values
  * @returns {any?} Allowed value or undefined
  */
function enumerated (value, values) {
  return values.includes(value)
    ? value
    : undefined
}

const loglevels = [
  'silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
]

const env = process.env

/**
* Natty configuration type.
*/
export class NattyConfig {
  socket = {
    host: env.NATTY_SOCKET_HOST ?? '::1',
    port: integer(env.NATTY_SOCKET_PORT) ?? 8808
  }

  session = {
    timeout: number(env.NATTY_SESSION_TIMEOUT) ?? 3600 * 1000,
    cleanupInterval: number(env.NATTY_SESSION_CLEANUP_INTERVAL) ?? 600 * 1000
  }

  loglevel = enumerated(env.NATTY_LOGLEVEL, loglevels) ?? 'info'
}
