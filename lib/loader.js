'use strict';

import { readFile, readFileSync } from 'fs';

const PrincessException = require('./exception');

const KEYWORD_COMMENT_ARRAY = [{ [`/*`]: `*/` }];
const KEYWORD_BREAK = ';';

class State {
  constructor(scriptName) {
    this.scriptName = scriptName;
  }
}

function throwError(message, state) {
  throw new PrincessException(message, state);
}

function divideBlock(script) {
  const scriptArr = script.split(KEYWORD_BREAK).trim();
  return scriptArr;
}

function commentProcess(scriptArr) {
  for (let i = 0; i < scriptArr.length; i++) {
    scriptArr[i] = scriptArr[i].slice(0, scriptArr[i].indexOf('//')).trim();

    for (const comment of KEYWORD_COMMENT_ARRAY) {
      const keyword = Object.keys(comment)[0];
      const secondKeyword = comment[keyword];

      const prefix = scriptArr[i].slice(0, scriptArr[i].indexOf(keyword)).trim();
      const subfix = scriptArr[i].slice(scriptArr[i].indexOf(secondKeyword)).trim();

      scriptArr[i] = prefix + subfix;
    }
  }
  return scriptArr;
}

function tokenProcess(scriptArr) {}

function loadScript(scriptName, script) {
  // API로 실행되면 파일을 읽어옵니다
  if (script === undefined) {
    try {
      var script = readFileSync(scriptName, 'utf-8');
    } catch (error) {
      throwError(error);
    }
  }
  let scriptArr = divideBlock(script);
  scriptArr = commentProcess(scriptArr);
}
