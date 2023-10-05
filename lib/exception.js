'use strict';

function formatError(exception) {
  let message = exception.message;
  message += ` at line ${exception.structure.line} column ${exception.structure.column}`;
  message += ` in ${exception.structure.filename}`;
  return message;
}

class PrincessException extends Error {
  constructor(reason, structure) {
    super();
    this.name = 'PrincessException';
    this.reason = reason;
    this.structure = structure;
    this.message = formatError(this);
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, PrincessException);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = (new Error()).stack || '';
    }
  }
  toString() {
    return this.name + ': ' + this.message;
  }
}

module.exports = PrincessException;