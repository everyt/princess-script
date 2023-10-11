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


const options = cli.parse_args();


//──────────────────────────────────────────────────────────────//


function isPrincessScript(input) {
  return input.toLowerCase().endsWith('.princess');
}


function readFile(filename) {
  let filecontent;


  try {
    filecontent = fs.readFileSync(filename, 'utf8');
  } catch (error) {
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
  }
  

  if (isPrincessScript(filename)) {
    const output = princess.loadScript(filename, filecontent);
    console.table(output);
  } else {
    console.error('Not a PrincessScript file: ' + filename);
    process.exit(2);
  }
}


readFile(options.file);

