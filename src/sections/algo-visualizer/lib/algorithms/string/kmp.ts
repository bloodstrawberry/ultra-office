import { Step } from '../types';

export const KMP_CODE = `// KMP (Knuth-Morris-Pratt) 문자열 패턴 매칭 알고리즘
function kmpSearch(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const pi: number[] = new Array(m).fill(0);
  const matchedIndices: number[] = [];

  // 1. 실패 함수 (Prefix-Suffix 일치 테이블 π) 전처리
  let j = 0;
  for (let i = 1; i < m; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) {
      j = pi[j - 1];
    }
    if (pattern[i] === pattern[j]) {
      j++;
      pi[i] = j;
    }
  }

  // 2. KMP 본문 탐색 (불일치 시 π 테이블 기반 점프)
  j = 0;
  for (let i = 0; i < n; i++) {
    while (j > 0 && text[i] !== pattern[j]) {
      j = pi[j - 1];
    }
    if (text[i] === pattern[j]) {
      if (j === m - 1) {
        matchedIndices.push(i - m + 1);
        j = pi[j];
      } else {
        j++;
      }
    }
  }

  return matchedIndices;
}`;

export const DEFAULT_KMP_TEXT = 'ABABDABACDABABCABAB';
export const DEFAULT_KMP_PATTERN = 'ABABCABAB';

export function generateKMPSteps(
  text: string = DEFAULT_KMP_TEXT,
  pattern: string = DEFAULT_KMP_PATTERN
): Step[] {
  const steps: Step[] = [];
  const txt = text.slice(0, 19);
  const pat = pattern.slice(0, 9);
  const n = txt.length;
  const m = pat.length;

  // 1. Compute Pi Table
  const pi: number[] = new Array(m).fill(0);
  let j = 0;
  for (let i = 1; i < m; i++) {
    while (j > 0 && pat[i] !== pat[j]) {
      j = pi[j - 1];
    }
    if (pat[i] === pat[j]) {
      j++;
      pi[i] = j;
    }
  }

  const matchedIndices: number[] = [];

  steps.push({
    stepIndex: 0,
    line: 2,
    description: `KMP 알고리즘 시작: 패턴 '${pat}'의 접두사-접미사 일치 테이블(π 배열: [${pi.join(', ')}])을 전처리하여 불필요한 백트래킹 없이 O(N + M)에 탐색합니다.`,
    variables: { text: txt, pattern: pat, piTable: `[${pi.join(', ')}]`, phase: '시작' },
    kmpText: txt,
    kmpPattern: pat,
    kmpPiTable: [...pi],
    kmpTextIdx: 0,
    kmpPatternIdx: 0,
    kmpMatchedIndices: [],
    soundType: 'step',
  });

  let patIdx = 0;
  for (let i = 0; i < n; i++) {
    while (patIdx > 0 && txt[i] !== pat[patIdx]) {
      const prevPatIdx = patIdx;
      patIdx = pi[patIdx - 1];

      steps.push({
        stepIndex: steps.length,
        line: 18,
        description: `[불일치 발생: text[${i}]('${txt[i]}') !== pattern[${prevPatIdx}]('${pat[prevPatIdx]}')] π 테이블(π[${prevPatIdx - 1}] = ${patIdx})을 참조하여 패턴 포인터를 ${patIdx}로 점프합니다. (본문 포인터 i=${i} 유지)`,
        variables: { textIdx: i, prevPatIdx, jumpedPatIdx: patIdx, piVal: patIdx },
        kmpText: txt,
        kmpPattern: pat,
        kmpPiTable: [...pi],
        kmpTextIdx: i,
        kmpPatternIdx: patIdx,
        kmpMatchedIndices: [...matchedIndices],
        soundType: 'swap',
      });
    }

    const isCharMatch = txt[i] === pat[patIdx];

    steps.push({
      stepIndex: steps.length,
      line: 20,
      description: `문자 비교: text[${i}]('${txt[i]}') vs pattern[${patIdx}]('${pat[patIdx]}') ➔ ${isCharMatch ? '일치 (Match!)' : '불일치'}`,
      variables: { textIdx: i, patIdx, isMatch: isCharMatch },
      kmpText: txt,
      kmpPattern: pat,
      kmpPiTable: [...pi],
      kmpTextIdx: i,
      kmpPatternIdx: patIdx,
      kmpMatchedIndices: [...matchedIndices],
      soundType: isCharMatch ? 'compare' : 'step',
      soundValue: patIdx * 15 + 20,
    });

    if (isCharMatch) {
      if (patIdx === m - 1) {
        const foundStart = i - m + 1;
        matchedIndices.push(foundStart);

        steps.push({
          stepIndex: steps.length,
          line: 22,
          description: `[🎉 패턴 완벽 매칭 발견!] 본문 인덱스 ${foundStart}부터 패턴 '${pat}'이 완벽히 일치합니다! (총 ${matchedIndices.length}개 발견)`,
          variables: {
            matchedStartIdx: foundStart,
            totalFound: matchedIndices.length,
            pattern: pat,
          },
          kmpText: txt,
          kmpPattern: pat,
          kmpPiTable: [...pi],
          kmpTextIdx: i,
          kmpPatternIdx: patIdx,
          kmpMatchedIndices: [...matchedIndices],
          soundType: 'found',
          soundValue: 90,
        });

        patIdx = pi[patIdx];
      } else {
        patIdx++;
      }
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 27,
    description: `KMP 탐색 완료! 본문 내에서 패턴 '${pat}'의 매칭 시작 위치: [${matchedIndices.join(', ')}]. 단 O(N + M) 시간에 본문 포인터를 뒤로 되돌리지 않고 탐색을 마쳤습니다.`,
    variables: { allMatchedIndices: `[${matchedIndices.join(', ')}]`, status: '탐색 완료' },
    kmpText: txt,
    kmpPattern: pat,
    kmpPiTable: [...pi],
    kmpTextIdx: n - 1,
    kmpPatternIdx: 0,
    kmpMatchedIndices: [...matchedIndices],
    soundType: 'complete',
  });

  return steps;
}
