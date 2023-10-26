'use strict';

const { readFileSync } = require('fs');

const { PrincessException } = require('./exception');

const KEYWORD_COMMENT_ARRAY = [{ [`/*`]: `*/` }];
const KEYWORD_BREAK = ['\r\n', '\n'];

class State {
  constructor(file) {
    this.file = file;
  }
}

function throwError(message, state) {
  throw new PrincessException(message, state);
}

function slice(str, i1, i2 = str.length) {
  let start = i1 >= 0 ? i1 : str.length + i1;
  let end = i2 >= 0 ? i2 : str.length + i2;

  let result = '';
  for (let i = start; i < str.length && i < end; i++) {
    result += str[i];
  }
  return result.trim();
}

function split(str, delimiter, withDelimiter = false) {
  let arr = [];
  const delimiterRegExp = new RegExp(delimiter, 'g');

  let match;
  let lastIndex = 0;

  while ((match = delimiterRegExp.exec(str)) !== null) {
    let tempStr = slice(str, lastIndex, match.index);
    if (withDelimiter === true) tempStr += delimiter;
    arr.push(tempStr);
    lastIndex = match.index + match[0].length;
  }

  const lastPart = slice(str, lastIndex);
  arr.push(lastPart);

  return arr;
}

function divideBlock(str) {
  let arr = [str];
  for (let keyword of KEYWORD_BREAK) {
    let tempArr = [];
    for (let part of arr) {
      tempArr.push(...split(part, keyword, true));
    }
    arr = tempArr;
  }
  return arr;
}

function commentProcess(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = slice(arr[i], 0, arr[i].indexOf('//'));

    for (let keyword of KEYWORD_COMMENT_ARRAY) {
      const keyword1 = Object.keys(keyword)[0];
      const Keyword2 = keyword[keyword1];

      const prefix = slice(arr[i], 0, arr[i].indexOf(keyword1));
      const subfix = slice(arr[i], arr[i].indexOf(Keyword2));

      arr[i] = prefix + subfix;
    }
  }
  return arr;
}

function stringProcess(str) {
  let arr = [];
  let type = '';
  let content = '';
  let quote = '';
  let char = '';
  let quoteFlag = false;
  let pushFlag = false;

  const isSpecial = (char, str) => {
    if (
      char === ':' ||
      char === ';' ||
      char === '"' ||
      char === "'" ||
      char === '`' ||
      (str.indexOf(':') === -1 && char === ' ')
    ) {
      return true;
    } else {
      return false;
    }
  };

  for (let i = 0; i < str.length; i++) {
    char = str[i];

    if (!isSpecial(char, str[i])) content += char;
    if (quoteFlag && isSpecial(char, str[i])) content += char;

    if ((char === '"' || char === "'" || char === '`') && !quoteFlag) {
      quote = char;
      quoteFlag = true;
    } else if (char === quote && quoteFlag) {
      type = 'string';
      quoteFlag = false;
      pushFlag = true;
      content = slice(content, 0, content.length - 1);
    } else if ((char === ':' || char === ';') && !quoteFlag) {
      type = 'variable';
      pushFlag = true;
    } else if (str.indexOf(':') === -1 && char === ' ' && !quoteFlag) {
      type = 'variable';
      pushFlag = true;
    }

    if (pushFlag) {
      content = content.trim();
      if (content !== '') {
        arr.push({
          type,
          content,
        });
        content = '';
      }
      pushFlag = false;
    }
  }
  return arr;
}

function tokenProcess(arr, state) {
  let results = [];

  for (let i = 0; i < arr.length; i++) {
    let delimiter = arr[i].charAt(arr[i].length - 1);
    let keyword = slice(arr[i], 0, arr[i].length - 1);

    if (delimiter === '/') {
      results.push({
        line: state.line,
        keyword,
      });
    } else if (delimiter === ';') {
      let array = stringProcess(arr[i]);
      results.push({
        line: state.line,
        array,
      });
    }
  }

  return results;
}

function ASTProcess(arr) {
  let AST = {
    var: {},
    stage: [],
    script: [],
  };

  let type = '';

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].hasOwnProperty('keyword')) {
      if (arr[i].keyword === '변수') {
        type = 'var';
      } else if (arr[i].keyword === '무대') {
        type = 'stage';
      } else if (arr[i].keyword === '대화') {
        type = 'script';
      } else if (arr[i].keyword === '장면' || arr[i].keyword === '!@#$') {
        // 예외처리 없이 넘어가기
      } else {
        throwError('ASTProcess: 허용되지 않은 / 앞 키워드입니다.');
      }
    } else {
      if (type === 'var') {
        const variableName = arr[i].array[0].content;
        const variableValue = arr[i].array[1].content;
        AST.var[variableName] = variableValue;
      } else if (type === 'stage') {
        AST.stage.push(arr[i].array);
      } else if (type === 'script') {
        AST.script.push(arr[i].array);
      }
    }
  }
  AST.var['효과'] = '효과';
  AST.var['선택지'] = '선택지';
  AST.var['종료'] = '종료'; // 예약어 예외처리ㅋㅋㅋ

  return AST;
}

function meltScript(dialogue) {
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
    type: 'meltedScript',
    letters,
    lettersMap,
  };

  return astNode;
}

function PostProcess(AST) {
  let stageAST = {};
  let scriptAST = [];

  for (const elemental of AST.stage) {
    for (let i = 0; i < elemental.length; i++) {
      if (elemental[i].type == 'variable' && AST.var[elemental[i].content]) {
        elemental[i].content = AST.var[elemental[i].content];
      }
    }
    const variableName = elemental[0].content;
    const variableValue = elemental[1].content;
    stageAST[variableName] = variableValue;
  }
  for (const elemental of AST.script) {
    for (let i = 0; i < elemental.length; i++) {
      if (elemental[i].type == 'variable' && AST.var[elemental[i].content]) {
        elemental[i].content = AST.var[elemental[i].content];
      } else if (elemental[i].type == 'variable' && !AST.var[elemental[i].content]) {
        throwError(`PostProcess: 정의되지 않은 변수입니다. [${elemental[i].content}]`);
      }
    }
    const variableName = elemental[0].content;
    if (elemental.length > 1) {
      let variableValue = elemental[1].content;
      if (variableName !== '선택지' && variableName !== '효과') variableValue = meltScript(variableValue);
      scriptAST.push([variableName, variableValue]);
    } else {
      scriptAST.push([variableName]);
    }
  }
  AST.stage = stageAST;
  AST.script = scriptAST;
}

function loadScript(file, content, format = 'UTF-8') {
  // API로 실행되면 파일을 읽어옵니다
  if (content === undefined) {
    try {
      var content = readFileSync(file, format);
    } catch (error) {
      throwError(error);
    }
  }
  let state = new State(file); //스크립트 로더의 상태를 정의할 스테이트 클래스 인스턴트를 생성합니다.
  let arr = divideBlock(content); //KEYWORD_BLOCK을 기준으로 스크립트를 분해합니다.
  let arr2 = commentProcess(arr); //주석을 제거합니다. //형태의 주석과 KEYWORD_COMMENT_ARRAY에 포함된 주석.
  let arr3 = tokenProcess(arr2, state); //레벨1과 레벨2로 나누어 토큰으로 분쇄합니다.
  let AST = ASTProcess(arr3); //AST 구조를 쌓습니다.
  PostProcess(AST); //AST를 위한 후처리를 진행합니다.
  return AST;
}

module.exports = { loadScript };
