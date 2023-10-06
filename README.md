<div align="center">
  
  ![](./PrincessScript.svg?raw=true)
  <br>The script of novel game

</div>

## Installation

### node.js package manager
```
npm   install  princess-script
yarn  add      princess-script
pnpm  add      princess-script
```
#### Usage
```
princess-script [-h] [-v] [file]

positional arguments:
  file                  file to read

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
```
## API
```
const princess = require('princess-script');
const fs   = require('fs');

const file = '/example/prologue.princess';
const arr = princess.loadScript(fs.readFileSync(file), file);
```
### loadScript(fileContents, file);
Load file to make AST for use in engine
Engine is being built
