import * as dotenv from 'dotenv'
import { integer, number } from './config.parsers.mjs'
import { getLogLevel } from './logger.mjs'

dotenv.config()

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
    timeout: number(env.NATTY_SESSION_TIMEOUT) ?? 3600,
    cleanupInterval: number(env.NATTY_SESSION_CLEANUP_INTERVAL) ?? 600
  }

  lobby = {
    minNameLength: number(env.NATTY_LOBBY_MIN_NAME_LENGTH) ?? 3,
    maxNameLength: number(env.NATTY_LOBBY_MAX_NAME_LENGTH) ?? 128
  }

  games = env.NATTY_GAMES ?? ''

  loglevel = getLogLevel()
}
