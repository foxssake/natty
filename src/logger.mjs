import pino from 'pino'
import { NattyConfig } from './config.mjs'

const logger = pino({
  name: 'natty',
  // TODO: Can this be done easier?
  level: (new NattyConfig()).loglevel
})

export default logger
