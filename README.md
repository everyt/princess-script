<div align="center">

<br><br>

![PrincessScript](https://github.com/everyt/princess-script/assets/80094147/415659a9-7876-4a87-a55d-85d9480151e2) <br><b>The script of novel game</b><br><br><br><br>

</div>

## Index

- [Script Syntax](#script-syntax)
- [Installation](#installation)
- [API](#api)

## Script Syntax

```
scene name?(string):
  stage name?(string):
    title: value?(string)
    background: file?(string)
    bgm: file?(string)
    ambience: file?(string)
  script name?(string):
    speaker?(string): dialogue(string)
    options name(string):
    change stageName(string)
    background: file(string)
    effect: option(string)
end
```

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

const arr = princess.loadScript('/example/prologue.princess');
```

### loadScript(fileContents, file);

Convert the script to AST that will be used for engines that have not yet been made
