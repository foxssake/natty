import * as dotenv from 'dotenv'
import { byteSize, duration, integer, number } from './config.parsers.mjs'
import logger, { getLogLevel } from './logger.mjs'

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
    timeout: duration(env.NATTY_SESSION_TIMEOUT ?? '1hr'),
    cleanupInterval: duration(env.NATTY_SESSION_CLEANUP_INTERVAL ?? '10m')
  }

  lobby = {
    minNameLength: number(env.NATTY_LOBBY_MIN_NAME_LENGTH) ?? 3,
    maxNameLength: number(env.NATTY_LOBBY_MAX_NAME_LENGTH) ?? 128
  }

  connectionDiagnostics = {
    timeout: duration(env.NATTY_CONNECTION_DIAGNOSTICS_TIMEOUT ?? '8s')
  }

  udpRelay = {
    maxSlots: number(env.NATTY_UDP_RELAY_MAX_SLOTS) ?? 16384,
    timeout: duration(env.NATTY_UDP_RELAY_TIMEOUT ?? '30s'),
    cleanupInterval: duration(env.NATTY_UDP_RELAY_CLEANUP_INTERVAL ?? '30s'),
    registrarPort: number(env.NATTY_UDP_REGISTRAR_PORT) ?? 8809,

    maxIndividualTraffic: byteSize(env.NATTY_UDP_RELAY_MAX_INDIVIDUAL_TRAFFIC ?? '128kb'),
    maxGlobalTraffic: byteSize(env.NATTY_UDP_RELAY_MAX_GLOBAL_TRAFFIC ?? '1gb'),
    trafficInterval: duration(env.NATTY_UDP_RELAY_TRAFFIC_INTERVAL ?? '100ms'),
    maxLifetimeDuration: duration(env.NATTY_UDP_RELAY_MAX_LIFETIME_DURATION ?? '4hr'),
    maxLifetimeTraffic: byteSize(env.NATTY_UDP_RELAY_MAX_LIFETIME_TRAFFIC ?? '4gb')
  }

  games = env.NATTY_GAMES ?? ''

  loglevel = getLogLevel()
}

export const config = new NattyConfig()
logger.info({ config }, 'Loaded application config')
