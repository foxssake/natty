import pino from 'pino'
import config from './config.mjs'

const logger = pino({
  name: 'natty',
  level: config.loglevel
})

export default logger
