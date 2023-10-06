'use strict';

//TODO: loadScript로 묶이지 않은 단일 string 분쇄기 필요함
//TODO: 왜냐하면 대화문에서 컬러 코드 같은 스타일 코드를 인식해서
//TODO: 애니메이션 구현을 위해 각 문자를 분리해 각 문자가 가진 스타일을 따로따로 적용해줘야 하기 때문

const PrincessException = require('./exception');

const _KEYWORDS = [
    {str: 'scene', letter: ' '},
    {str: 'stage', letter: ' '},
    {str: 'script', letter: ' '},
    {str: 'bgm', letter: ':'},
    {str: 'title', letter: ':'},
    {str: 'ambience', letter: ':'},
    {str: 'background', letter: ':'},
    {str: 'effect', letter: ':'},
    {str: 'options', letter: ' '},
    {str: 'change', letter: ' '},
];

class State {
    constructor(options, script) {
        this.file = options.file;
        this.script = script || '';
        this.position = {line: 0, column: 0};
    }
}

function throwError(message, state) {
    throw new PrincessException(message, state);
}

function linebreaker(input, line, state) {
    state.script = input.split('\n')[line].trim();
}

function processComment(line) {
    const commentIndex = line.indexOf('//');

    if (commentIndex !== -1) {
        return line.slice(0, commentIndex).trim();
    }

    return line;
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
                key: keyword,
                value: value === '' ? 'default' : value,
                line: state.position.line,
            });
    
            state.script = '';
        }
    }
}

function parseDialogue(AST, state) {
    if (state.script !== '') {
        let parts = state.script.split(':');
    
        let key = parts[0].trim();
        if (key === '') throwError('Expected dialogue colon.', state);
    
        let value;
        if (parts[1]) {
            value = parts[1].trim().split('\\lb').join('\n');
        } else {
            key = null;
            value = parts[0].trim();
        }
    
        AST.push({
            type: 'dialogue',
            key,
            value,
            line: state.position.line,
        });
    
    
        state.position.column += state.script.length;
    }
}

function parseByKeyword(keyword, AST, state) {
    if (state.script === keyword) {
        AST.push({
            type: keyword,
            key: keyword,
            value: keyword,
            line: state.position.line,
        });
        state.script = '';
    }
}

function generateAST(input, state) {
    let AST = [];

    while (state.position.line < input.length) {

        if (state.position.line === input.split('\n').length) {
            break;
        }

        
        linebreaker(input, state.position.line, state);
        state.position.column = 0;


        state.script = processComment(state.script);
        

        if (state.script === '') {
            state.position.line++;
            continue;
        }

        
        parseByKeyword('close', AST, state);


        parseByKeyword('end', AST, state);


        for (let KEYWORD of _KEYWORDS) {
            parseByLetter(KEYWORD.letter, KEYWORD.str, AST, state, KEYWORD.hasValue);
        }


        parseDialogue(AST, state);
        

        state.position.line++;
    }

    return AST.sort((a, b) => a.line - b.line).map(({ line, ...rest }) => rest);
}

function loadScript(input, options) {
    let state = new State(options);
    const AST = generateAST(input, state);
    return AST;
}



module.exports.loadScript = loadScript;
