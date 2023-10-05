'use strict';

const PrincessException = require('./exception');

const KEYWORDS = ['title', 'background', 'bgm', 'ambience', 'mode'];

class Position {
    constructor(line, column) {
        this.line = line;
        this.column = column;
    }
}

class State {
    constructor(options, script) {
        this.filename = options.filename;
        this.script = script || '';
        this.position = new Position(0, 0);
    }
}

function throwError(message, state) {
    throw new PrincessException(message, state);
}

function linebreaker(input, line, state) {
    return input.split('￦n')[line];
}

function isKeyword(keyword, state) {
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

function parseByBlank(keyword, tokens, state) {
    if (isKeyword(keyword, state)) {
        const parts = state.script.split(' ');

        if (parts.length === 2) {
            const value = parts[1].trim();

            if (sceneName.endsWith(':')) {
                state.position.column += parts[0].length + 1;
                sceneName = sceneName.slice(0, -1);
            } else {
                throwError(`Expected colon after ${keyword} name.`, state);
            }

            tokens.push({
                type: keyword,
                value: value
            });
        } else if (parts.length === 3) {
            throwError('Unexpected second blank.', state);
        } else {
            throwError(`Expected space after ${keyword} keyword.`, state);
        }
    }
}

function parseByColon(keyword, isAfterColon, tokens, state) {
    if (isKeyword(keyword, state)) {
        const parts = state.script.split(':');
        
        if (parts.length === 1 && isAfterColon) {
            tokens.push({
                type: keyword,
                value: ''
            });
        } else if (parts.length === 1 && !isAfterColon){
            throwError(`Expected colon after ${keyword} keyword.`, state);
        } else if (parts.length === 2) {
            const value = parts[1].trim();
            state.position.column += parts[0].length + 1;
            tokens.push({
                type: keyword,
                value: value
            });
        } else {
            throwError('Unexpected second colon.', state);
        }
    }
}

function loadScript(input, options) {
    let state = new State(options, input);
    let tokens = [];

    while (state.position.line < input.length) {
        let script = linebreaker(input, state.position.line, state);

        while (state.position.column < script.length) {
            parseByBlank('scene', state, tokens);
            parseByColon('stage', false, state, tokens);
            for (let keyword of KEYWORDS) {
                parseByColon(keyword, true, state, tokens);
            }
        }
        state.position.line++;
    }
}

module.exports.loadScript = loadScript;
