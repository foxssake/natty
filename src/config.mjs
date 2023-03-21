import * as dotenv from 'dotenv'

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

export default Object.freeze({
  socket: {
    host: env.NATTY_SOCKET_HOST ?? '::1',
    port: integer(env.NATTY_SOCKET_PORT) ?? 8808
  },

  loglevel: enumerated(env.NATTY_LOGLEVEL, loglevels) ?? 'info'
})
