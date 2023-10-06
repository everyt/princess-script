<div align="center">

  <br><br>

  ![](./PrincessScript.svg?raw=true)
  <br><b>The script of novel game</b><br><br><br><br>

</div>

## Index
- [Script Syntax](#script-syntax)
- [Installation](#installation)
- [API](#api)

## Script Syntax
```
scene 프롤로그:
  stage:
    title: 이 문장은 화면 상단에 나타나는 고정된 문구입니다.
    background: /background/day.png
    bgm: /bgm/day.ogg
    ambience: /ambience/day.wav
  stage 밤:
    background: /background/night.png
    bgm: /bgm/night.ogg
    ambience: /ambience/night.wav
  script:
    에브리홍차: 안녕하세요, 이것은 첫번째 대화문입니다.
    에브리홍차: 문장의 시작은 이름 뒤에 있는 :로 구분되고, 문장의 끝은 줄이 넘어가는 것으로 인식합니다.
    에브리홍차: 구문의 들여쓰기 차이는 인식하지 않고, 단어들로 서로간의 AST를 연결합니다.
    에브리홍차: 스크립트에서 따옴표를 사용하지 않기 때문에, 여러줄로 이루어진 문장을 표시하려면 \lb (2번째 줄) 처럼 특수한 문자열을 사용해 줄을 넘길 수 있습니다.

    options 선택지1:
    이 이후로 진행되는 대화는 선택지1을 선택했을 때에만 출력됩니다.

    options 선택지2:
    마찬가지로, 이 이후의 대화는 선택지2를 선택했을 때에만 출력됩니다.

    close // options의 끝을 close로 스크립트에게 알려줘야 합니다. 이렇게 또한 js의 주석 방식 그대로 사용 가능합니다.




    대화문이 실행되고 있는 사이에도, stage의 내용을 수정할 수 있습니다.


    change 밤

    background: /background/2.png

    네, change 예약어를 통해 stage를 통째로 변경할 수도 있고, background같은 개별 속성의 예약어로 개개인을 변경할 수 있지만, stage는 stage를 선언하기 위해서 예약되어 있기 때문에 script 내에서는 change를 통해 변경해주어야 합니다.

    또한, 이런 식으로 화면의 효과를 줄 수 있습니다.
    effect: fadeIn

    모든 진행은 순서대로만 진행됩니다.
    씬의 종료는 end를 통해 표시해줘야 합니다.
    모든 기능은 확장 가능하게 구성되어야 합니다.
    상세하게 주석을 표시하고, 컴파일러의 기능은 해당 스크립트를 js 엔진이 별다른 처리 없이 사용 가능케 하는 목적을 가지고 있습니다.

    다만, 다양한 사용 방법의 지원과 스크립트 문법 태생의 한계로 에러 검출이 다소 느슨합니다. 이 부분을 보강해야 합니다.
end

scene scene2:
  dialogues:
    물론 stage를 생략할수도 있으며, 그렇다면 새까만 화면에 하얀 글씨가 출력됩니다.
    아마도 이것의 구현을 위해서 stage에 텍스트를 어디에 위치시켜야 하는지에 대한 또다른 속성이 추가될 것입니다.
    그러한 식으로, 사용자가 html의 디자인 구성을 마음대로 설정할 수 있으면서도 스크립트의 지원을 통해 간편한 대화문의 출력이 가능하게끔 하는 것을 목표로 하고 있습니다.
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
const fs   = require('fs');

const file = '/example/prologue.princess';
const arr = princess.loadScript(fs.readFileSync(file), file);
```
### loadScript(fileContents, file);
Convert the script to AST that will be used for engines that have not yet been made
