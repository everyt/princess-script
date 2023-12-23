import type { PrincessState } from 'PrincessScript';

type ERROR_type = {
  [key: number]: string;
}

const ERROR: ERROR_type = {
  0: 'Undefined Error.'
}

class PrincessException extends Error {
  title: string;
  code: number;
  state: PrincessState;

  constructor(code: number, state: PrincessState) {
    super();
    this.title = 'PrincessException';
    this.code = code;
    this.state = state;
    this.message = this.formatMessage();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PrincessException);
    } else {
      this.stack = new Error().stack || '';
    }
  }
  formatMessage() {
    let message: string = this.title + `: ` + ERROR[this.code];
    if (this.state) {
      message += `at ${this.state.filename}, ${this.state.location.column}, ${this.state.location.row}`;
    }
    return message;
  }
  captureStackTrace() {

  }
  toString() {
    return this.message;
  }
}

const throwError = (code: number, state: PrincessState) => {
  throw new PrincessException(code, state);
}

export { PrincessException, throwError };
