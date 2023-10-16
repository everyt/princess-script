'use strict'

//TODO: 사운드 재생 구현(?) 어떻게 해야 할지, JS가 기본적으로 지원을 안 하는지조차 몰라서 알아봐야 할 것 같다.

//TODO: meltDialogue 함수로 엔진 구현. 그 사이사이 스크립트에서 정했던 문법을 실행할 수 있게끔 설계해야 함.

import { readFileSync } from 'fs'

const PrincessException = require('./exception')

const _KEYWORDS = [
  { str: 'scene', letter: ' ' },
  { str: 'stage', letter: ' ' },
  { str: 'script', letter: ' ' },
  { str: 'options', letter: ' ' },
  { str: 'change', letter: ' ' },

  { str: 'bgm', letter: ':' },
  { str: 'title', letter: ':' },
  { str: 'ambience', letter: ':' },
  { str: 'background', letter: ':' },
  { str: 'effect', letter: ':' },
]

const _KEYWORD_LINEBREAK = '\\lb'

class State {
  constructor(filename, script) {
    this.filename = filename
    this.script = script || ''
    this.position = { line: 0, column: 0 }
  }
}

function throwError(message, state) {
  throw new PrincessException(message, state)
}

function linebreaker(input, line, state) {
  state.script = input.split('\n')[line].trim()
}

function processComment(line) {
  const commentIndex = line.indexOf('//')

  if (commentIndex !== -1) {
    return line.slice(0, commentIndex).trim()
  }

  return line
}

function isKeyword(keyword, state) {
  if (state.script.length > keyword.length) {
    let word = ''

    for (let i = 0; i < keyword.length; i++) {
      let letter = state.script[i]
      if (letter === undefined) throwError('Unexpected end of file.', state)
      word += letter
    }

    if (word.toLowerCase() === keyword.toLowerCase()) {
      state.position.column += keyword.length
      return true
    } else {
      return false
    }
  }
  return false
}

function formatLetter(letter) {
  if (letter === ':') {
    return 'colon'
  } else if (letter === ' ') {
    return 'blank'
  } else {
    return letter
  }
}

function parseByLetter(letter, keyword, AST, state) {
  if (state.script !== '') {
    if (isKeyword(keyword, state)) {
      let value = state.script.substring(keyword.length + 1).trim()

      if (value.includes(letter)) throwError(`Unexpected second ${formatLetter(letter)}.`, state)

      if (value === letter) throwError(`Expected ${formatLetter(letter)} after ${keyword} keyword.`, state)

      if (value.endsWith(':')) value = value.slice(0, -1)

      state.position.column += 1 + value.length

      AST.push({
        type: keyword,
        key: keyword,
        value: value === '' ? 'default' : value,
        line: state.position.line,
      })

      state.script = ''
    }
  }
}

function parseDialogue(AST, state) {
  if (state.script !== '') {
    let parts = state.script.split(':')

    let key = parts[0].trim()
    if (key === '') throwError('Expected dialogue colon.', state)

    let value
    if (parts[1]) {
      value = parts[1].trim().split(_KEYWORD_LINEBREAK).join('\n')
    } else {
      key = null
      value = parts[0].trim()
    }

    AST.push({
      type: 'dialogue',
      key,
      value,
      line: state.position.line,
    })

    state.position.column += state.script.length
  }
}

function parseByKeyword(keyword, AST, state) {
  if (state.script === keyword) {
    AST.push({
      type: keyword,
      key: keyword,
      value: keyword,
      line: state.position.line,
    })
    state.script = ''
  }
}

function processAST(input, state) {
  let AST = []

  while (state.position.line < input.length) {
    if (state.position.line === input.split('\n').length) {
      break
    }

    linebreaker(input, state.position.line, state)
    state.position.column = 0

    state.script = processComment(state.script)

    if (state.script === '') {
      state.position.line++
      continue
    }

    parseByKeyword('close', AST, state)

    parseByKeyword('end', AST, state)

    for (let KEYWORD of _KEYWORDS) {
      parseByLetter(KEYWORD.letter, KEYWORD.str, AST, state)
    }

    parseDialogue(AST, state)

    state.position.line++
  }

  return AST.sort((a, b) => a.line - b.line).map(({ line, ...rest }) => rest)
}

function loadScript(filename, filecontent) {
  if (filecontent === undefined) {
    try {
      filecontent = readFileSync(filename, 'utf8')
    } catch (error) {
      console.error(error)
    }
  }

  let state = new State(filename)

  const AST = processAST(filecontent, state)

  return AST
}

function meltDialogue(dialogue) {
  let lettersMap = []
  let letters = []

  if (dialogue) {
    let meltingLetters = dialogue.split('')
    let letter = ''
    let type = ''

    for (let i = 0; i < meltingLetters.length; i++) {
      letter = meltingLetters[i]
      type = 'letter'
      if (letter === ' ') letter = '&nbsp;'

      if (letter === '<') {
        i++
        type = meltingLetters[i] === '/' ? '>' : '<'
        while (meltingLetters[i] !== '>') {
          letter += meltingLetters[i]
          i++
        }
        letter += meltingLetters[i]
      }
      letters.push({ letter, type })
    }

    for (let i = 0; i < letters.current.length; i++) {
      if (letters.current[i].type === 'letter') {
        lettersMap.push({ prefix: null, suffix: null, letter: i })
      } else if (letters.current[i].type === '<') {
        let j = 0
        let k = i
        while (letters.current[i].type !== '>') {
          i++
          j++
        }
        const meltingLettersMap = []
        for (j; j > 1; j--) {
          meltingLettersMap.push({ prefix: k, suffix: i, letter: j + k - 1 })
        }
        lettersMap.push(...meltingLettersMap.reverse())
      }
    }
  } else {
    throwError("Ahh... You made a mistake, didn't you? You forgot the dialogue.")
    return
  }

  return { letters, lettersMap }
}

export { loadScript, meltDialogue }
