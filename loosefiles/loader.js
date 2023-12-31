'use strict';

//TODO: 사운드 재생 구현(?) 어떻게 해야 할지, JS가 기본적으로 지원을 안 하는지조차 몰라서 알아봐야 할 것 같다.

//TODO: meltDialogue 함수로 엔진 구현. 그 사이사이 스크립트에서 정했던 문법을 실행할 수 있게끔 설계해야 함.

//FIXME: 현재 meltDialogue는 다른 기능을 염두에 두고 짜여진 코드가 아님. 만약 대화가 진행되는 도중에 화면에 효과를 주거나 소리를 재생한다던지 같은 능력이 필요할지도 모르고,
//FIXME: 이건 확실하게 뒤집어 엎어야 할 거 같다. 아. 구태여 그럴 필요까지는 없을 거 같긴 한데. \\lb로 줄 바꿈을 표현했듯이(이것도 적용 안 됐네?) 태그를 인식한 것처럼 소리 재생 태그 같은 걸 잘라내면 될 거 같아\

//MAYBE: 리액트를 사용할 거면 기능들을 훅으로 구현해도 되는데, 보다 보편적인 방법을 위해서는 훅을 사용하면 안 되지 않을까...

import { readFileSync } from 'fs';

const PrincessException = require('./exception');

const _KEYWORD = [
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
];

const _KEYWORD_COMMENT = [{ [`//`]: `` }, { [`/*`]: `*/` }];

const _KEYWORD_LINEBREAK = '\\n';

class State {
  constructor(filename, script) {
    this.filename = filename;
    this.script = script || '';
    this.position = { line: 0, column: 0 };
  }
}

function throwError(message, state) {
  throw new PrincessException(message, state);
}

function linebreaker(input, line, state) {
  let lineToProcess = input.split(_KEYWORD_LINEBREAK)[line].trim();

  // Process comments
  for (const commentKeyword of _KEYWORD_COMMENT) {
    const keyword = Object.keys(commentKeyword)[0];
    const endingCondition = commentKeyword[keyword];
    const commentIndex = lineToProcess.indexOf(keyword);
    if (commentIndex !== -1) {
      lineToProcess = lineToProcess.slice(0, commentIndex) + endingCondition;
    }
  }

  state.script = lineToProcess;
}

function isKeyword(keyword, state) {
  if (state.script.length > keyword.length) {
    let word = '';

    for (let i = 0; i < keyword.length; i++) {
      let letter = state.script[i];
      if (letter === undefined) throwError('Unexpected end of file.', state);
      word += letter;
    }

    if (word.toLowerCase() === keyword.toLowerCase()) {
      state.position.column += keyword.length;
      return true;
    } else {
      return false;
    }
  }
  return false;
}

function formatLetter(letter) {
  if (letter === ':') {
    return 'colon';
  } else if (letter === ' ') {
    return 'blank';
  } else {
    return letter;
  }
}

function parseByLetter(letter, keyword, AST, state) {
  if (state.script !== '') {
    if (isKeyword(keyword, state)) {
      let value = state.script.substring(keyword.length + 1).trim();

      if (value.includes(letter)) throwError(`Unexpected second ${formatLetter(letter)}.`, state);

      if (value === letter) throwError(`Expected ${formatLetter(letter)} after ${keyword} keyword.`, state);

      if (value.endsWith(':')) value = value.slice(0, -1);

      state.position.column += 1 + value.length;

      AST.push({
        type: keyword,
        property: { value },
        line: state.position.line,
      });

      state.script = '';
    }
  }
}

function meltDialogue(dialogue) {
  let lettersMap = [];
  let letters = [];

  if (dialogue) {
    let meltingLetters = dialogue.split('');
    let letter = '';
    let type = '';

    for (let i = 0; i < meltingLetters.length; i++) {
      letter = meltingLetters[i];
      type = 'letter';
      if (letter === ' ') letter = '&nbsp;';

      if (letter === '<') {
        i++;
        type = meltingLetters[i] === '/' ? 'closeTag' : 'startTag';
        while (meltingLetters[i] !== '>') {
          letter += meltingLetters[i];
          i++;
        }
        letter += meltingLetters[i];
      }

      let backslash = String.raw`\peach`.replace('peach', '');

      if (letter === backslash) {
        i++;
        type = 'backslash';
        while (letter != '1') {
          letter += meltingLetters[i];
          i++;
        }
      }
      letters.push({ letter, type });
    }

    for (let i = 0; i < letters.length; i++) {
      if (letters[i].type === 'letter') {
        lettersMap.push({ prefix: null, suffix: null, letter: i });
      } else if (letters[i].type === 'startTag') {
        let j = 0;
        let k = i;
        while (letters[i].type !== 'closeTag') {
          i++;
          j++;
        }
        const meltingLettersMap = [];
        for (j; j > 0; --j) {
          meltingLettersMap.push({ prefix: k, suffix: i, letter: j + k });
        }
        lettersMap.push(...meltingLettersMap.reverse());
      }
    }
  } else {
    throwError('Ahh... You made a mistake, right? You forgot the dialogue.');
    return;
  }

  // Create an AST node to hold the result
  const astNode = {
    type: 'meltedDialogue',
    letters,
    lettersMap,
  };

  return astNode;
}

function parseDialogue(AST, state) {
  if (state.script !== '') {
    let parts = state.script.split(':');

    let speaker = parts[0].trim();
    if (speaker === '') throwError('Expected dialogue colon.', state);

    let dialogue;
    if (parts[1]) {
      dialogue = parts[1].trim().split(_KEYWORD_LINEBREAK).join('\n');
    } else {
      speaker = null;
      dialogue = parts[0].trim();
    }

    const meltedDialogue = meltDialogue(dialogue);

    AST.push({
      type: 'dialogue',
      property: { speaker, dialogue, meltedDialogue },
      line: state.position.line,
    });

    state.position.column += state.script.length;
  }
}

function parseByKeyword(keyword, AST, state) {
  if (state.script === keyword) {
    AST.push({
      type: keyword,
      property: {},
      line: state.position.line,
    });
    state.script = '';
  }
}

function processAST(input, state) {
  let AST = [];

  while (state.position.line < input.split('\n').length) {
    linebreaker(input, state.position.line, state);
    state.position.column = 0;

    if (state.script === '') {
      state.position.line++;
      continue;
    }

    parseByKeyword('close', AST, state);
    parseByKeyword('end', AST, state);

    for (let KEYWORD of _KEYWORD) {
      parseByLetter(KEYWORD.letter, KEYWORD.str, AST, state);
    }

    parseDialogue(AST, state);

    state.position.line++;
  }

  return AST.sort((a, b) => a.line - b.line).map(({ line, ...rest }) => rest);
}

function loadScript(filename, filecontent) {
  if (filecontent === undefined) {
    try {
      filecontent = readFileSync(filename, 'utf8');
    } catch (error) {
      console.error(error);
    }
  }

  let state = new State(filename);

  const AST = processAST(filecontent, state);

  return AST;
}

export { loadScript };
