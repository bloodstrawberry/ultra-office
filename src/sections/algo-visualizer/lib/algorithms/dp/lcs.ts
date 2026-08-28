import { Step } from '../types';

export const LCS_CODE = `// 최장 공통 부분 수열 (Longest Common Subsequence - LCS) 2D DP
function lcs(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        // 문자가 일치하면 대각선 이전 최적해 + 1
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        // 불일치 시 위쪽(dp[i-1][j])과 왼쪽(dp[i][j-1]) 중 최댓값
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}`;

export const DEFAULT_LCS_TEXT1 = 'ABCBDAB';
export const DEFAULT_LCS_TEXT2 = 'BDCABA';

export function generateLCSSteps(
  text1: string = DEFAULT_LCS_TEXT1,
  text2: string = DEFAULT_LCS_TEXT2
): Step[] {
  const steps: Step[] = [];
  const s1 = text1.slice(0, 7);
  const s2 = text2.slice(0, 7);
  const m = s1.length;
  const n = s2.length;

  const dp: (number | string | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  const rowLabels = ['∅', ...s1.split('').map((c, i) => `${c}(${i + 1})`)];
  const colLabels = ['∅', ...s2.split('').map((c, i) => `${c}(${i + 1})`)];

  steps.push({
    stepIndex: 0,
    line: 4,
    description: `LCS(최장 공통 부분 수열) 시작: 문자열1 '${s1}'(길이 ${m})과 문자열2 '${s2}'(길이 ${n})의 2D DP 테이블을 0으로 초기화합니다.`,
    variables: { string1: s1, string2: s2, phase: 'DP 테이블 초기화' },
    dp2D: dp.map((row) => [...row]),
    dpRowLabels: rowLabels,
    dpColLabels: colLabels,
    dpActiveCell: null,
    soundType: 'step',
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const ch1 = s1[i - 1];
      const ch2 = s2[j - 1];
      const isMatch = ch1 === ch2;

      let cellVal = 0;
      let desc = '';
      const sourceCells: [number, number][] = [];

      if (isMatch) {
        cellVal = Number(dp[i - 1][j - 1] ?? 0) + 1;
        sourceCells.push([i - 1, j - 1]);
        desc = `[문자 일치: '${ch1}'] s1[${i}]('${ch1}') === s2[${j}]('${ch2}') ➔ 대각선 dp[${i - 1}][${j - 1}] + 1 = ${cellVal}`;
      } else {
        const fromTop = Number(dp[i - 1][j] ?? 0);
        const fromLeft = Number(dp[i][j - 1] ?? 0);
        cellVal = Math.max(fromTop, fromLeft);
        sourceCells.push([i - 1, j], [i, j - 1]);
        desc = `[문자 불일치: '${ch1}' vs '${ch2}'] 위쪽(${fromTop})과 왼쪽(${fromLeft}) 중 최댓값 ${cellVal} 선택`;
      }

      dp[i][j] = cellVal;

      steps.push({
        stepIndex: steps.length,
        line: isMatch ? 8 : 11,
        description: desc,
        variables: {
          s1_char: ch1,
          s2_char: ch2,
          match: isMatch ? '일치' : '불일치',
          lcsValue: cellVal,
        },
        dp2D: dp.map((row) => [...row]),
        dpRowLabels: rowLabels,
        dpColLabels: colLabels,
        dpActiveCell: [i, j],
        dpSourceCells: sourceCells,
        soundType: isMatch ? 'found' : 'compare',
        soundValue: cellVal * 25 + 20,
      });
    }
  }

  const finalLCSLen = dp[m][n];

  steps.push({
    stepIndex: steps.length,
    line: 17,
    description: `LCS 연산 완료! 두 문자열 '${s1}'과 '${s2}'의 최장 공통 부분 수열의 길이는 ${finalLCSLen} 입니다. (예: "BCBA", "BDAB")`,
    variables: { finalLCSLength: finalLCSLen, status: 'DP 완료' },
    dp2D: dp.map((row) => [...row]),
    dpRowLabels: rowLabels,
    dpColLabels: colLabels,
    dpActiveCell: [m, n],
    soundType: 'complete',
  });

  return steps;
}
