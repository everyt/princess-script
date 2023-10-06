#!/usr/bin/env node

'use strict';


const fs =       require('fs');
const argparse = require('argparse');
const princess = require('..');


//──────────────────────────────────────────────────────────────//


const cli = new argparse.ArgumentParser({
  prog:     'princess-script',
  add_help:  false
});

cli.add_argument('-h', '--help', {
  action: 'help',
  help: 'show this help message and exit'
});


cli.add_argument('-v', '--version', {
  action: 'version',
  version: require('../package.json').version
});


cli.add_argument('file', {
  help: 'file to read',
  nargs: '?',
  default: '-'
});


//──────────────────────────────────────────────────────────────//


var options = cli.parse_args();


//──────────────────────────────────────────────────────────────//


function readFile(filename, encoding, callback) {
  if (options.file === '-') {
    let chunks = [];
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.on('end', () => callback(null, Buffer.concat(chunks).toString(encoding))); 
  } else {
    fs.readFile(filename, encoding, callback);
  }
}


function isPrincessScript(input) {
  return input.toLowerCase().endsWith('.princess');
}


readFile(options.file, 'utf-8', (error, input) => {
  let output;

  if (error) {
    if (error.code === 'ENOENT') {
      console.error('File not found: ' + options.file);
      process.exit(2);
    }

    console.error(
      options.trace && error.stack ||
      error.message ||
      String(error)
    );
    
    process.exit(1);
  }

  if (isPrincessScript(options.file)) {
    output = princess.loadScript(input, options);
    console.table(output);
  } else {
    console.error('Not a PrincessScript file: ' + options.file);
    process.exit(2);
  }
});