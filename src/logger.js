import { format } from 'util'

class Logger {
  constructor () {
    if (Logger.instance) {
      return Logger.instance
    }

    this.transports = [{ transport: console.log, level: 'debug' }]
    this.levels = {
      debug: 1,
      info: 2,
      warn: 3,
      error: 4
    }

    this.colors = {
      debug: '\x1b[34m', // Blue
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m' // Red
    }

    this.reset = '\x1b[0m' // Reset color

    Logger.instance = this // Save the instance for future access
  }

  // Method to initialize transports with custom configurations
  init (transports) {
    if (transports && Array.isArray(transports)) {
      this.transports = transports.map(t => ({
        transport: t.transport || console.log,
        level: t.level || 'debug'
      }))
    }
  }

  setLevel (level) {
    if (this.levels[level] !== undefined) {
      this.globalLevel = this.levels[level]
    } else {
      console.error(`Invalid log level: ${level}`)
    }
  }

  log (level, group, ...args) {
    if (this.levels[level] >= (this.globalLevel || this.levels.debug)) {
      const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const coloredGroup = `${this.colors[level]}[${group}]${this.reset}` // Color the group based on log level
      const message = format(`${coloredGroup} %s`, args.join(' '))
      const logEntry = `[${timestamp}] ${message}`

      // Iterate over all transports
      this.transports.forEach(({ transport, level: transportLevel }) => {
        if (this.levels[level] >= this.levels[transportLevel]) {
          transport(logEntry)
        }
      })
    }
  }

  debug (group, ...args) {
    this.log('debug', group, ...args)
  }

  info (group, ...args) {
    this.log('info', group, ...args)
  }

  warn (group, ...args) {
    this.log('warn', group, ...args)
  }

  error (group, ...args) {
    this.log('error', group, ...args)
  }
}

// Export the singleton instance
const logger = new Logger()
export default logger
