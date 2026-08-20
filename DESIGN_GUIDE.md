# Ultra Office 프론트엔드 디자인 & 레이아웃 가이드

본 문서는 Ultra Office의 일관된 사용자 경험(UX), 반응형 레이아웃, 화면 공간 활용 극대화 및 TypeScript/MUI 안정성을 보장하기 위한 디자인 및 개발 규칙입니다.

---

## 1. 뷰포트 높이 활용 및 스크롤바 제어 규칙 (Viewport Height & No Unnecessary Scrollbars)

사용자가 어떤 모니터(1080p, 1440p, 4K, 노트북 등)에서 접속하더라도 **하단에 어색한 여백(빈 공간)이 남지 않고, 불필요한 전체 페이지 스크롤바가 발생하지 않도록 100% 뷰포트 높이 기반 Flexbox 레이아웃**을 엄격히 적용합니다.

### 📐 핵심 레이아웃 구조 공식

```tsx
<DashboardContent
  maxWidth={false}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    height: '100%',
    pb: 2,
  }}
>
  {/* 1. 상단 헤더 & 설명: 고정 높이 유지 (줄어들지 않음) */}
  <Box sx={{ mb: 1.5, flexShrink: 0 }}>
    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>도구 이름</Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>도구 설명</Typography>
  </Box>

  {/* 2. 탭 / 컨트롤 툴바: 고정 높이 유지 */}
  <Box sx={{ flexShrink: 0, mb: 1.5 }}>
    <Tabs ... />
  </Box>

  {/* 3. 메인 콘텐츠 영역: 남은 모든 수직 공간을 100% 채움 */}
  <Box
    sx={{
      flex: '1 1 auto',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}
  >
    {/* 에디터 그리드: 남은 공간 100% 채움 */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
      }}
    >
      <TextAreaPanel ...>
        <LineNumberTextField ... />
      </TextAreaPanel>
    </Box>
  </Box>
</DashboardContent>
```

### 🚫 피해야 할 안티패턴 (Anti-patterns)

1. **고정 픽셀 높이 남용 금지**:

   - ❌ Bad: `<Box sx={{ height: 380 }}>`, `<Card sx={{ maxHeight: 560 }}>`
   - ⭕ Good: `<Box sx={{ flex: '1 1 auto', minHeight: 0, height: '100%' }}>`
   - _이유_: 화면 해상도가 높을 때 아래쪽에 거대한 빈 공백이 생기거나, 반대로 작은 화면에서 뷰포트 밖으로 넘쳐 페이지 스크롤이 발생합니다.

2. **사이드바 / 드로어 내부 스크롤 격리**:

   - ❌ Bad: Card 자체에 `overflowY: 'auto'`를 주어 검색창이나 헤더까지 함께 스크롤되어 사라지는 현상
   - ⭕ Good: Card는 `height: '100%', minHeight: 0, overflow: 'hidden'`으로 고정하고, 헤더·검색창·카테고리 칩은 `flexShrink: 0`, **하단 목록만 `flex: '1 1 auto', minHeight: 0, overflowY: 'auto'`** 로 독립 스크롤.

3. **`minHeight: 0` 누락 주의**:

   - Flex 및 Grid 자식 요소에서 `minHeight: 0`을 지정하지 않으면 브라우저 기본 `min-height: auto` 동작으로 인해 콘텐츠 내용물 크기만큼 부모 컨테이너가 늘어나 불필요한 스크롤바가 발생합니다.

4. **스크롤 Flex 목록 내부 아이템 `flexShrink: 0` 필수 지정 (아이템 세로 찌그러짐 방지)**:
   - ❌ Bad: `<Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>{items.map(item => <Card sx={{ p: 1 }}>...</Card>)}</Box>`
   - ⭕ Good: `<Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>{items.map(item => <Card sx={{ flexShrink: 0, p: 1 }}>...</Card>)}</Box>`
   - _이유_: Flexbox 컬럼 방향 컨테이너 안의 자식 아이템들에 `flexShrink: 0`이 없으면, Flexbox 기본 수축 동작(`flex-shrink: 1`)으로 인해 항목이 많아질 때 각 아이템의 높이가 강제로 수축되어 글자가 겹치고 찌그러지는(squished) 심각한 UI 결함이 발생합니다.

---

## 2. MUI (Material-UI) + TypeScript 필수 작성 규칙

1. **`<Stack>` 컴포넌트 사용 금지 (`<Box>` flex 대체)**

   - ❌ Bad: `<Stack direction="row" spacing={2} alignItems="center">`
   - ⭕ Good: `<Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>`

2. **`<Dialog>` 컴포넌트의 `PaperProps` 사용 금지 (`sx` 우회 사용)**

   - ❌ Bad: `<Dialog PaperProps={{ sx: { borderRadius: 2 } }}>`
   - ⭕ Good: `<Dialog sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}>`

3. **`any` 타입 사용 금지**
   - 알 수 없는 타입은 `unknown`을 사용하고, 타입 가드(`typeof`, `instanceof`)로 구체화합니다.

---

## 3. Hydration Mismatch 방지 규칙

1. **`useState` 초기값에 브라우저 동적 API (`window`, `localStorage`, `Date.now()`) 사용 금지**
   - 초기값은 고정 상수로 선언하고, `useEffect` 내부에서 데이터를 읽어와 상태를 갱신합니다.
