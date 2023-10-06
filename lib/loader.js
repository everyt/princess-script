'use strict';

const PrincessException = require('./exception');

const _KEYWORDS = [
    {str: 'scene', letter: ' ', hasValue: false},
    {str: 'stage', letter: ':', hasValue: false},
    {str: 'bgm', letter: ':', hasValue: true},
    {str: 'title', letter: ':', hasValue: true},
    {str: 'ambience', letter: ':', hasValue: true},
    {str: 'background', letter: ':', hasValue: true},
];

class State {
    constructor(options, script) {
        this.filename = options.filename;
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

function isKeyword(keyword, state) {
    if (state.script.length < keyword.length + 1) {
        let word = '';
    
        for (let i = 0; i < keyword.length; ++i) {
            let letter = state.script[state.position.column + i];
            if (letter === undefined) {
                throwError('Unexpected end of file.', state);
            }
            word += letter;
        }
    
        if (word.toLowerCase() === keyword.toLowerCase()) {
            state.position.column += keyword.length;
            return true;
        } else {
            return false;
        }
    }
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

function parseByLetter(letter, keyword, tokens, state, hasValue) {

    if (isKeyword(keyword, state)) {
        let value = script.substring(keyword.length + 1).trim();

        if (value.includes(letter)) {
            throwError(`Unexpected second ${formatLetter(letter)}.`, state);
        } else if (value === letter) {
            throwError(`Expected ${formatLetter(letter)} after ${keyword} keyword.`, state);
        } else if (value === '' && hasValue) {
            throwError(`Expected ${keyword} value.`, state);
        } else {
            throwError('Unexpected error.', state);
        }

        state.position.column += 1 + value.length;

        tokens.push({
            type: keyword,
            value: value
        });

        state.script = '';
    }
}

function loadScript(input, options) {
    let state = new State(options, input);
    let keywords = [];

    while (state.position.line < input.length) {
        let script = linebreaker(input, state.position.line, state);

        if (script === '') {
            state.position.line++;
            continue;
        }

        while (state.position.column < script.length) {
            for (let KEYWORD of _KEYWORDS) {
                parseByLetter(KEYWORD.letter, KEYWORD.str, keywords, state, KEYWORD.hasValue);
            }
        }

        state.position.line++;
    }
}

module.exports.loadScript = loadScript;
