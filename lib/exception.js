'use strict'

function formatError(exception) {
  let message = exception.message
  message += exception.reason
  message += ` at line ${exception.state.position.line} column ${exception.state.position.column}`
  message += ` in ${exception.state.filename}`
  return message
}

class PrincessException extends Error {
  constructor(reason, state) {
    super()
    this.name = 'PrincessException'
    this.reason = reason
    if (state) {
      this.state = state
      this.message = formatError(this)
    }
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, PrincessException)
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = new Error().stack || ''
    }
  }
  toString() {
    let prefix = this.name + ': '
    return this.state ? prefix + this.message : prefix + this.reason
  }
}

module.exports = { PrincessException }
