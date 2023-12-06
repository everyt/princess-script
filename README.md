<div align="center">

<br><br>

![PrincessScript](https://github.com/everyt/princess-script/assets/80094147/415659a9-7876-4a87-a55d-85d9480151e2) <br><b>The script of novel game</b><br><br><br><br>

</div>

스크립트는 페이지에 귀속되고 스크립트가 끝나면 다른 페이지로 이동되게 하면서
스크립트가 재생하는 대화문이나 이름은 api로 빼서 유저가 담게 하면 되지 않을까?
// 근데 이렇게 되면 중복되는 페이지가 너무 많아지니까, 내부 변수로 처리

순차적 언어로 구현되어야 하고... 변수나 함수, 조건문 개념도 들어가야 하는데 -> js랑 json, 혹은 yaml로 바꿔버리는 슈퍼셋으로 만들면 될 거 같은데

필요한 기능:
최종적으로 데이터를 json/yaml에 담고, 코드를 js로 나눠 담아 작동하게 하는 순차적 스크립트
굳이 이런 형태를 취하는 건, json/yaml의 한계가 명확하기 때문.
문법은 파이썬에서 가져오면 될 것 같다 (제일 초보자 친화적)
이것들을 작동하게 하는 코어(엔진)

즉 대화문 속도같은 설정들은 option={} 따위의 config api를 수정하게 해서 스스로 옵션을 구현하게 하고
실질적으로 스크립트와 코어가 구현해 주는 건 대화문의 출력 하나만.

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
