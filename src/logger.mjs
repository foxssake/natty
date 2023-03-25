import pino from 'pino'
import { enumerated } from './config.parsers.mjs'

export const loglevels = Object.freeze([
  'silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
])

export function getLogLevel () {
  return enumerated(process.env.NATTY_LOGLEVEL, loglevels) ?? 'info'
}

const logger = pino({
  name: 'natty',
  level: getLogLevel()
})

export default logger
