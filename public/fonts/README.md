# Custom Fonts Directory (사용자 정의 폰트 폴더)

이 폴더(`public/fonts/`)에 웹 폰트 파일(`.woff2`, `.woff`, `.ttf`, `.otf`)을 추가하면 GIF 편집 스튜디오 및 자막 에디터에서 해당 폰트를 사용할 수 있습니다.

## 지원 폰트 포맷
- `.woff2` (권장: 가장 빠르고 가벼움)
- `.woff`
- `.ttf`
- `.otf`

## 폰트 추가 방법
1. 원하는 폰트 파일(예: `MyCustomFont.woff2`)을 이 폴더에 복사합니다.
2. `src/sections/gif-studio/data/gif-fonts.ts`의 `STUDIO_FONTS` 배열에 등록하거나 `@font-face`를 정의합니다.
