'use strict';

import { readFileSync } from 'fs';

const PrincessException = require('./exception');

const KEYWORD_COMMENT_ARRAY = [{ [`/*`]: `*/` }];
const KEYWORD_BREAK = [';', '/'];

class State {
  constructor(file) {
    this.file = file;
  }
}

function throwError(message, state) {
  throw new PrincessException(message, state);
}

function slice(str, i1, i2 = str.length) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    if (str.length >= i1 || str.length < i2) {
      result += str[i];
    } else {
      continue;
    }
  }
  return result.trim();
}

function divideBlock(str) {
  let arr = [str];
  for (let keyword of KEYWORD_BREAK) {
    arr.map((v) => v.split(keyword).trim());
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

function tokenProcess(arr) {
  let arr2 = [];

  return arr2;
}

function loadScript(file, content) {
  // API로 실행되면 파일을 읽어옵니다
  if (content === undefined) {
    try {
      var content = readFileSync(file, 'utf-8'); //TODO: UTF-8이 아닐 경우?
    } catch (error) {
      throwError(error);
    }
  }
  let state = new State(file); //스크립트 로더의 상태를 정의할 스테이트 클래스 인스턴트를 생성합니다.
  let arr = divideBlock(content); //KEYWORD_BLOCK을 기준으로 스크립트를 분해합니다.
  let arr2 = commentProcess(arr); //주석을 제거합니다. //형태의 주석과 KEYWORD_COMMENT_ARRAY에 포함된 주석.
}
