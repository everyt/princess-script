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
scene name?:

  stage name?:
    title: string
    background: fileName
    bgm: fileName
    ambience: fileName

  script name?:
    title: string
    background: fileName
    bgm: fileName
    ambience: fileName

    change stageName

    effect effectName

    speaker?: dialogue

    options optionName:
    close

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
