---
trigger: always_on
---

# View Naming & Component Architecture Rules (화면 파일명 및 컴포넌트 아키텍처 규칙)

본 프로젝트(ultra-office)의 모든 프론트엔드 화면(View) 및 페이지(Page)는 일관성 있는 유지보수와 직관적인 탐색을 위해 아래의 명명 규칙과 아키텍처 원칙을 **반드시** 준수해야 합니다.

---

## 1. URL 경로와 View 파일명 1:1 대응 원칙 (URL to View 1:1 Mapping)

모든 대시보드 화면의 라우트 URL 경로와 `src/sections/[도메인]/view/` 내의 파일명은 반드시 **1:1로 일치**하도록 명명합니다.

* **기본 포맷**: `[도메인]-[기능]-view.tsx` (단일 루트 기능인 경우 `[도메인]-view.tsx`)
* **규칙 예시**:
  * URL: `/gif-studio/create` $\rightarrow$ 파일명: `gif-studio-create-view.tsx`
  * URL: `/gif-studio/split` $\rightarrow$ 파일명: `gif-studio-split-view.tsx`
  * URL: `/photo/bg-remove` $\rightarrow$ 파일명: `photo-bg-remove-view.tsx`
  * URL: `/photo/ai-watermark` $\rightarrow$ 파일명: `photo-ai-watermark-view.tsx`
  * URL: `/drawing/ladder` $\rightarrow$ 파일명: `drawing-ladder-view.tsx`
  * URL: `/drawing/roulette` $\rightarrow$ 파일명: `drawing-roulette-view.tsx`
  * URL: `/text/diff` $\rightarrow$ 파일명: `text-diff-view.tsx`
  * URL: `/algo-visualizer/catalog` $\rightarrow$ 파일명: `algo-visualizer-catalog-view.tsx`
  * URL: `/public/postcode` $\rightarrow$ 파일명: `public-postcode-view.tsx`
  * URL: `/opic-drive` $\rightarrow$ 파일명: `opic-drive-view.tsx`
  * URL: `/agent` $\rightarrow$ 파일명: `agent-view.tsx`
  * URL: `/barcode` $\rightarrow$ 파일명: `barcode-view.tsx`

---

## 2. 컴포넌트명 PascalCase 일치 원칙

파일명이 `[도메인]-[기능]-view.tsx`인 경우, 해당 파일에서 기본으로 export하는 컴포넌트 함수명 또한 **파일명과 동일한 PascalCase**로 작성합니다.

```tsx
// gif-studio-create-view.tsx
export function GifStudioCreateView() { ... }

// photo-bg-remove-view.tsx
export function PhotoBgRemoveView() { ... }

// drawing-ladder-view.tsx
export function DrawingLadderView() { ... }

// text-diff-view.tsx
export function TextDiffView() { ... }
```

---

## 3. 대형 파일 자체 분리 및 모듈화 원칙 (Modular Refactoring)

하나의 화면 또는 도메인에 여러 탭(Tab), 복잡한 상태 머신, 다중 캔버스/타임라인 에디터가 포함되어 파일이 비대해지는 경우, **단일 거대 파일로 작성하지 말고 기능별로 자체 분리**합니다.

1. **서브 뷰 분리**: 각 탭/기능별로 독립된 `[도메인]-[서브기능]-view.tsx` 파일로 생성.
2. **공통 컴포넌트 추출**: 헤더 네비게이션, 툴바, 캔버스 뷰포트, 사이드바 등은 `src/sections/[도메인]/components/` 폴더로 분리.
3. **공통 유틸/상수 분리**: 데이터셋, 헬퍼 함수 등은 `src/sections/[도메인]/utils/` 또는 `src/sections/[도메인]/data/`로 분리.
4. **메인 디스패처**: 기본 진입점인 `[도메인]-view.tsx`는 서브 뷰들을 조건부 렌더링하는 가벼운 디스패처 역할을 수행하도록 구성.

---

## 4. App Router (`page.tsx`) 및 Barrel Export 연결 규칙

1. **View Index Re-export**:
   * 각 섹션의 `src/sections/[도메인]/view/index.ts`에서 해당 도메인의 모든 서브 뷰 컴포넌트를 명시적으로 export합니다.
   ```ts
   // src/sections/gif-studio/view/index.ts
   export * from './gif-studio-view';
   export * from './gif-studio-create-view';
   export * from './gif-studio-video-view';
   export * from './gif-studio-split-view';
   export * from './gif-studio-bg-view';
   export * from './gif-studio-speed-view';
   export * from './gif-studio-merge-view';
   ```
2. **Page Component 연결**:
   * `src/app/(dashboard)/[도메인]/[서브경로]/page.tsx`는 해당 URL에 1:1 매칭되는 전용 View 컴포넌트를 직접 호출합니다.
   ```tsx
   // src/app/(dashboard)/gif-studio/create/page.tsx
   import { GifStudioCreateView } from 'src/sections/gif-studio/view';

   export const metadata = { title: `...` };

   export default function Page() {
     return <GifStudioCreateView />;
   }
   ```
