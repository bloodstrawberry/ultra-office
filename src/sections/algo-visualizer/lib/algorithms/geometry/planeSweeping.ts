import type { Step, RectangleData } from '../types';

export const PLANE_SWEEPING_CODE = `// 평면 스위핑(Plane Sweeping)을 이용한 여러 직사각형의 합집합 총 면적 계산
interface Rect { x1: number; y1: number; x2: number; y2: number; }
interface Event { x: number; y1: number; y2: number; type: 'START' | 'END'; }

function calculateUnionArea(rects: Rect[]): number {
  const events: Event[] = [];
  for (const r of rects) {
    events.push({ x: r.x1, y1: r.y1, y2: r.y2, type: 'START' });
    events.push({ x: r.x2, y1: r.y1, y2: r.y2, type: 'END' });
  }

  // 1. x 좌표를 기준으로 이벤트 정렬 (스위프 라인 이동)
  events.sort((a, b) => a.x - b.x);

  let totalArea = 0;
  let prevX = events[0].x;
  const activeYIntervals: [number, number][] = [];

  function getActiveYLength(): number {
    if (activeYIntervals.length === 0) return 0;
    // 활성 y 구간들의 병합 길이 계산
    const sorted = [...activeYIntervals].sort((a, b) => a[0] - b[0]);
    let len = 0, curStart = sorted[0][0], curEnd = sorted[0][1];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i][0] <= curEnd) curEnd = Math.max(curEnd, sorted[i][1]);
      else { len += (curEnd - curStart); curStart = sorted[i][0]; curEnd = sorted[i][1]; }
    }
    return len + (curEnd - curStart);
  }

  // 2. 스위프 라인을 x축을 따라 왼쪽에서 오른쪽으로 이동
  for (const ev of events) {
    const dx = ev.x - prevX;
    if (dx > 0) {
      totalArea += dx * getActiveYLength();
      prevX = ev.x;
    }
    if (ev.type === 'START') activeYIntervals.push([ev.y1, ev.y2]);
    else {
      const idx = activeYIntervals.findIndex(it => it[0] === ev.y1 && it[1] === ev.y2);
      if (idx !== -1) activeYIntervals.splice(idx, 1);
    }
  }

  return totalArea;
}`;

export const DEFAULT_RECTANGLES: RectangleData[] = [
  {
    id: 'R1',
    x1: 50,
    y1: 40,
    x2: 180,
    y2: 130,
    color: 'rgba(59, 130, 246, 0.4)',
    label: '직사각형 1',
  },
  {
    id: 'R2',
    x1: 120,
    y1: 80,
    x2: 240,
    y2: 200,
    color: 'rgba(168, 85, 247, 0.4)',
    label: '직사각형 2',
  },
  {
    id: 'R3',
    x1: 200,
    y1: 50,
    x2: 320,
    y2: 150,
    color: 'rgba(244, 63, 94, 0.4)',
    label: '직사각형 3',
  },
];

export function generatePlaneSweepingSteps(
  rectangles: RectangleData[] = DEFAULT_RECTANGLES
): Step[] {
  const steps: Step[] = [];
  const events: { x: number; y1: number; y2: number; type: 'START' | 'END'; rectId: string }[] = [];

  for (const r of rectangles) {
    events.push({ x: r.x1, y1: r.y1, y2: r.y2, type: 'START', rectId: r.id });
    events.push({ x: r.x2, y1: r.y1, y2: r.y2, type: 'END', rectId: r.id });
  }

  events.sort((a, b) => a.x - b.x);

  let totalArea = 0;
  let prevX = events[0].x;
  const activeYIntervals: [number, number][] = [];

  function calcYLength(): number {
    if (activeYIntervals.length === 0) return 0;
    const sorted = [...activeYIntervals].sort((a, b) => a[0] - b[0]);
    let len = 0;
    let curStart = sorted[0][0];
    let curEnd = sorted[0][1];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i][0] <= curEnd) {
        curEnd = Math.max(curEnd, sorted[i][1]);
      } else {
        len += curEnd - curStart;
        curStart = sorted[i][0];
        curEnd = sorted[i][1];
      }
    }
    return len + (curEnd - curStart);
  }

  steps.push({
    stepIndex: 0,
    line: 5,
    description: `평면 스위핑 시작: ${rectangles.length}개 직사각형의 x 좌표 이벤트(시작/종료점 총 ${events.length}개)를 오름차순으로 정렬했습니다.`,
    variables: { totalRects: rectangles.length, totalEvents: events.length, accumulatedArea: 0 },
    rectangles: [...rectangles],
    sweepLineX: prevX,
    activeIntervals: [],
    accumulatedArea: 0,
    soundType: 'step',
  });

  for (const ev of events) {
    const dx = ev.x - prevX;
    const curYLen = calcYLength();

    if (dx > 0) {
      const incrementalArea = dx * curYLen;
      totalArea += incrementalArea;

      steps.push({
        stepIndex: steps.length,
        line: 32,
        description: `[스위프 라인 이동 x: ${prevX} ➔ ${ev.x}] 이동 거리 dx = ${dx}, 활성 Y 길이 = ${curYLen} ➔ 면적 +${incrementalArea} 추가 (누적 총면적: ${totalArea})`,
        variables: {
          sweepX: ev.x,
          dx,
          activeYLength: curYLen,
          addedArea: incrementalArea,
          totalArea,
        },
        rectangles: [...rectangles],
        sweepLineX: ev.x,
        activeIntervals: activeYIntervals.map((i) => [...i] as [number, number]),
        accumulatedArea: totalArea,
        soundType: 'compare',
        soundValue: Math.min(100, Math.floor(totalArea / 200)),
      });

      prevX = ev.x;
    }

    if (ev.type === 'START') {
      activeYIntervals.push([ev.y1, ev.y2]);
      steps.push({
        stepIndex: steps.length,
        line: 36,
        description: `[직사각형 ${ev.rectId} 진입] 스위프 라인(x = ${ev.x})에서 Y 구간 [${ev.y1}, ${ev.y2}] 활성화`,
        variables: { eventType: 'START', rect: ev.rectId, sweepX: ev.x },
        rectangles: [...rectangles],
        sweepLineX: ev.x,
        activeIntervals: activeYIntervals.map((i) => [...i] as [number, number]),
        accumulatedArea: totalArea,
        soundType: 'step',
      });
    } else {
      const idx = activeYIntervals.findIndex((it) => it[0] === ev.y1 && it[1] === ev.y2);
      if (idx !== -1) activeYIntervals.splice(idx, 1);
      steps.push({
        stepIndex: steps.length,
        line: 38,
        description: `[직사각형 ${ev.rectId} 퇴장] 스위프 라인(x = ${ev.x})에서 Y 구간 [${ev.y1}, ${ev.y2}] 비활성화`,
        variables: { eventType: 'END', rect: ev.rectId, sweepX: ev.x },
        rectangles: [...rectangles],
        sweepLineX: ev.x,
        activeIntervals: activeYIntervals.map((i) => [...i] as [number, number]),
        accumulatedArea: totalArea,
        soundType: 'step',
      });
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 43,
    description: `평면 스위핑 완료! 주어진 모든 직사각형의 합집합 총 면적은 ${totalArea} px² 입니다.`,
    variables: { finalUnionArea: `${totalArea} px²`, status: '계산 완료' },
    rectangles: [...rectangles],
    sweepLineX: null,
    activeIntervals: [],
    accumulatedArea: totalArea,
    soundType: 'complete',
  });

  return steps;
}
