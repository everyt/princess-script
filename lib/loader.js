'use strict';

const PrincessException = require('./exception');

const _KEYWORDS = [
    {str: 'scene', letter: ' ', hasValue: false},
    {str: 'stage', letter: ':', hasValue: false},
    {str: 'script', letter: ':', hasValue: false},
    {str: 'bgm', letter: ':', hasValue: true},
    {str: 'title', letter: ':', hasValue: true},
    {str: 'ambience', letter: ':', hasValue: true},
    {str: 'background', letter: ':', hasValue: true},
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
    return state.script;
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

function parseByLetter(letter, keyword, AST, state, hasValue) {
    if (state.script !== '') {
        if (isKeyword(keyword, state)) {
            let value = state.script.substring(keyword.length + 1).trim();
    
            if (value.includes(letter)) throwError(`Unexpected second ${formatLetter(letter)}.`, state);

            if (value === letter) throwError(`Expected ${formatLetter(letter)} after ${keyword} keyword.`, state);

            if (value === '' && hasValue) throwError(`Expected ${keyword} value.`, state);

            if (value.endsWith(':') && !hasValue) value = value.slice(0, -1);
    
            state.position.column += 1 + value.length;
    
            AST.push({
                type: keyword,
                value,
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
            value = parts[1].trim().split('\lb').join('\n');
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

function generateAST(input, state) {
    let AST = [];

    while (state.position.line < input.length) {
        let script = linebreaker(input, state.position.line, state);
        state.position.column = 0;


        if (script === '') {
            state.position.line++;
            continue;
        }


        script = processComment(script);


        for (let KEYWORD of _KEYWORDS) {
            parseByLetter(KEYWORD.letter, KEYWORD.str, AST, state, KEYWORD.hasValue);
        }


        parseDialogue(AST, state);
        

        if (script === 'end') {
            AST.push({
                type: 'end',
                line: state.position.line,
            });
            state.script = '';
            break;
        }
        

        state.position.line++;
    }

    return AST.sort((a, b) => a.line - b.line);
}

function loadScript(input, options) {
    let state = new State(options);
    const AST = generateAST(input, state);
    return AST;
}



module.exports.loadScript = loadScript;
