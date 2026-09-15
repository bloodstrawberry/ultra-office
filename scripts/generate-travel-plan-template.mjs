import fs from 'node:fs';
import path from 'node:path';

import init, { HwpDocument } from '@rhwp/core';

const workspace = path.resolve(import.meta.dirname, '..');
const wasmPath = path.join(workspace, 'public', 'rhwp', 'rhwp_bg.wasm');
const outputPath = path.join(workspace, 'public', 'hwp-templates', 'travel-plan-report.hwp');

globalThis.measureTextWidth = (_font, text) => text.length * 430;

await init({ module_or_path: fs.readFileSync(wasmPath) });

const document = HwpDocument.createEmpty();

try {
  document.createBlankDocument();
  document.setPageDef(
    0,
    JSON.stringify({
      width: 59528,
      height: 84186,
      landscape: true,
      marginLeft: 2551,
      marginRight: 2551,
      marginTop: 2268,
      marginBottom: 2268,
      marginHeader: 1134,
      marginFooter: 1134,
      marginGutter: 0,
    })
  );

  const created = JSON.parse(
    document.createTableEx(
      JSON.stringify({
        sectionIdx: 0,
        paraIdx: 0,
        charOffset: 0,
        rowCount: 20,
        colCount: 12,
        treatAsChar: true,
        colWidths: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
      })
    )
  );
  const { paraIdx, controlIdx } = created;

  const merge = (startRow, startCol, endRow, endCol) => {
    document.mergeTableCells(0, paraIdx, controlIdx, startRow, startCol, endRow, endCol);
  };

  // 상단 문서관리·제목·결재 영역
  merge(0, 1, 0, 2);
  merge(1, 1, 1, 2);
  merge(2, 1, 2, 2);
  merge(0, 3, 2, 8);
  merge(1, 9, 2, 9);
  merge(1, 10, 2, 10);
  merge(1, 11, 2, 11);

  // 좌우 2단 본문에서 문장형 영역을 합친다.
  [3, 4, 5, 6, 10, 11, 12, 13, 14, 17, 18, 19].forEach((row) => merge(row, 0, row, 5));
  [3, 4, 10, 14, 17, 18, 19].forEach((row) => merge(row, 6, row, 11));
  [5, 6, 7, 8, 9].forEach((row) => merge(row, 9, row, 10));
  merge(11, 7, 11, 11);
  merge(12, 7, 12, 8);
  merge(12, 9, 12, 10);
  merge(13, 7, 13, 8);
  merge(13, 9, 13, 10);
  [15, 16].forEach((row) => merge(row, 7, row, 9));
  merge(15, 0, 16, 5);

  const cells = JSON.parse(document.getTableCellBboxes(0, paraIdx, controlIdx));
  const cellIndexAt = (row, col) => {
    const cell = cells.find((candidate) => candidate.row === row && candidate.col === col);
    if (!cell) throw new Error(`표 셀을 찾을 수 없습니다: ${row},${col}`);
    return cell.cellIdx;
  };

  const setCell = (row, col, properties) => {
    document.setCellProperties(
      0,
      paraIdx,
      controlIdx,
      cellIndexAt(row, col),
      JSON.stringify(properties)
    );
  };

  const write = (row, col, text, options = {}) => {
    const cellIdx = cellIndexAt(row, col);
    const lines = text.split('\n');

    lines.forEach((line, lineIndex) => {
      if (line) document.insertTextInCell(0, paraIdx, controlIdx, cellIdx, lineIndex, 0, line);
      if (lineIndex < lines.length - 1) {
        document.splitParagraphInCell(0, paraIdx, controlIdx, cellIdx, lineIndex, line.length);
      }
      document.applyParaFormatInCell(
        0,
        paraIdx,
        controlIdx,
        cellIdx,
        lineIndex,
        JSON.stringify({
          alignment: options.alignment ?? 'left',
          lineSpacing: options.lineSpacing ?? 125,
          spacingBefore: options.spacingBefore ?? 0,
          spacingAfter: options.spacingAfter ?? 0,
        })
      );
      if (line) {
        document.applyCharFormatInCell(
          0,
          paraIdx,
          controlIdx,
          cellIdx,
          lineIndex,
          0,
          line.length,
          JSON.stringify({
            bold: options.bold ?? false,
            fontSize: options.fontSize ?? 820,
            color: options.color ?? '#111111',
          })
        );
      }
    });
  };

  const thinBorder = { type: 1, width: 1, color: '#333333' };
  const dividerBorder = { type: 1, width: 4, color: '#6b7280' };
  const rowHeights = [
    1500, 1500, 1500, 1600, 3200, 2500, 2300, 1700, 1700, 1700, 1600, 2400, 2700, 2700, 1600, 2100,
    2100, 1600, 3100, 2600,
  ].map((height) => Math.round(height * 1.18));

  cells.forEach((cell) => {
    setCell(cell.row, cell.col, {
      height: rowHeights[cell.row],
      paddingLeft: 220,
      paddingRight: 220,
      paddingTop: 90,
      paddingBottom: 90,
      verticalAlign: 1,
      borderLeft: thinBorder,
      borderRight: cell.col + cell.colSpan === 6 ? dividerBorder : thinBorder,
      borderTop: thinBorder,
      borderBottom: thinBorder,
    });
  });

  const headingStyle = {
    fillType: 'solid',
    fillColor: '#fff36b',
    borderBottom: { type: 1, width: 3, color: '#183a8f' },
  };
  [
    [3, 0],
    [3, 6],
    [10, 0],
    [10, 6],
    [14, 6],
    [17, 6],
  ].forEach(([row, col]) => setCell(row, col, headingStyle));

  const tableHeaderStyle = { fillType: 'solid', fillColor: '#cceff1' };
  for (let col = 0; col < 6; col += 1) setCell(7, col, tableHeaderStyle);
  [6, 7, 8, 9, 11].forEach((col) => setCell(5, col, tableHeaderStyle));
  [6, 7].forEach((col) => setCell(11, col, tableHeaderStyle));
  [6, 7, 10, 11].forEach((col) => setCell(15, col, tableHeaderStyle));

  setCell(0, 3, {
    fillType: 'solid',
    fillColor: '#ffffff',
    borderTop: { type: 1, width: 5, color: '#1f245c' },
    borderBottom: { type: 1, width: 5, color: '#1f245c' },
  });
  setCell(19, 6, {
    fillType: 'solid',
    fillColor: '#fff7cf',
    borderLeft: { type: 1, width: 2, color: '#7a6420' },
    borderRight: { type: 1, width: 2, color: '#7a6420' },
    borderTop: { type: 1, width: 2, color: '#7a6420' },
    borderBottom: { type: 1, width: 2, color: '#7a6420' },
  });

  write(0, 0, '등록번호', { alignment: 'center', bold: true, fontSize: 720 });
  write(0, 1, '여행계획-01', { alignment: 'center', fontSize: 720 });
  write(1, 0, '보존기간', { alignment: 'center', bold: true, fontSize: 720 });
  write(1, 1, '10년', { alignment: 'center', fontSize: 720 });
  write(2, 0, '작성일자', { alignment: 'center', bold: true, fontSize: 720 });
  write(2, 1, '20__. __. __.', { alignment: 'center', fontSize: 720 });
  write(0, 3, '해 외 여 행  계 획 (보 고)', {
    alignment: 'center',
    bold: true,
    fontSize: 1800,
    color: '#111827',
  });
  write(0, 9, '기 안', { alignment: 'center', bold: true, fontSize: 720 });
  write(0, 10, '검 토', { alignment: 'center', bold: true, fontSize: 720 });
  write(0, 11, '결 재', { alignment: 'center', bold: true, fontSize: 720 });
  write(1, 9, '작성자\n(서명)', { alignment: 'center', fontSize: 700 });
  write(1, 10, '검토자\n(서명)', { alignment: 'center', fontSize: 700 });
  write(1, 11, '승인자\n(서명)', { alignment: 'center', fontSize: 700 });

  const heading = (row, col, number, title) =>
    write(row, col, `${number}  ${title}`, { bold: true, fontSize: 1050, color: '#123a9b' });

  heading(3, 0, '1', '여행 중점');
  write(
    4,
    0,
    '가. 안전을 최우선으로 하되 충분한 휴식과 추억을 함께 확보\n나. 핵심 관광지·맛집은 사전 예약하고 이동 동선을 간결하게 구성',
    { bold: true, fontSize: 820, lineSpacing: 135 }
  );
  heading(5, 0, '2', '일반 현황');
  write(
    6,
    0,
    '가. 여행 인원 : 총 ____명     나. 기간 : 20__. __. __. ~ __. __. (___박 ___일)\n다. 여행 지역 : ____________________     라. 숙소 : ____________________',
    {
      bold: true,
      fontSize: 780,
    }
  );

  ['구분', '1일차', '2일차', '3일차', '4일차', '5일차'].forEach((text, col) =>
    write(7, col, text, { alignment: 'center', bold: true, fontSize: 690 })
  );
  ['지역', '________', '________', '________', '________', '________'].forEach((text, col) =>
    write(8, col, text, { alignment: 'center', fontSize: 690 })
  );
  ['교통/숙소', '________', '________', '________', '________', '________'].forEach((text, col) =>
    write(9, col, text, { alignment: 'center', fontSize: 650 })
  );

  heading(10, 0, '3', '날짜별 세부계획');
  write(
    11,
    0,
    '가. 1일차 (__.__.) : 출발 및 현지 도착\n  ① 오전 : ____________________   ② 오후 : ____________________\n  ③ 저녁 : ____________________',
    { bold: true, fontSize: 740 }
  );
  write(
    12,
    0,
    '나. 2일차 (__.__.) : 주요 관광지 방문\n  ① 오전 : ____________________   ② 오후 : ____________________\n  ③ 저녁 : ____________________',
    { bold: true, fontSize: 740 }
  );
  write(
    13,
    0,
    '다. 3일차 (__.__.) : 문화·체험 일정\n  ① 오전 : ____________________   ② 오후 : ____________________\n  ③ 저녁 : ____________________',
    { bold: true, fontSize: 740 }
  );
  write(
    14,
    0,
    '라. 4일차 (__.__.) : 자유 일정\n  ① 오전 : ____________________   ② 오후 : ____________________\n  ③ 저녁 : ____________________',
    { bold: true, fontSize: 740 }
  );
  write(
    15,
    0,
    '마. 5일차 (__.__.) : 귀국 및 도착\n  ① 체크아웃 : ________   ② 출발편 : ________   ③ 도착 : ________\n\n※ 항공·철도 지연 시 비상연락망을 통해 일정을 즉시 공유한다.',
    { bold: true, fontSize: 740 }
  );
  write(17, 0, '작성 참고', { bold: true, fontSize: 820, color: '#6b7280' });
  write(
    18,
    0,
    '시간대별 이동수단, 예약번호, 주소, 운영시간을 함께 기록하면 현장에서 바로 활용할 수 있습니다.',
    { fontSize: 720, color: '#4b5563' }
  );
  write(19, 0, '붙임 : 예약내역 및 비상연락망 1부.  끝.', { bold: true, fontSize: 740 });

  heading(3, 6, '4', '여행지원');
  write(4, 6, '가. 예상 경비 : 총 __________원  /  1인 기준 __________원', {
    bold: true,
    fontSize: 820,
  });
  const budgetHeaders = [
    [6, '구분'],
    [7, '비용'],
    [8, '기준'],
    [9, '내용'],
    [11, '합계'],
  ];
  budgetHeaders.forEach(([col, text]) =>
    write(5, col, text, { alignment: 'center', bold: true, fontSize: 680 })
  );
  const budgetRows = [
    ['교통', '_______원', '1인', '항공·철도·현지교통', '_______원'],
    ['숙박', '_______원', '___박', '호텔·숙소 예약', '_______원'],
    ['식비', '_______원', '1일', '식사·간식', '_______원'],
    ['기타', '_______원', '1인', '입장권·쇼핑·예비비', '_______원'],
  ];
  budgetRows.forEach((values, rowOffset) => {
    const row = 6 + rowOffset;
    [6, 7, 8, 9, 11].forEach((col, index) =>
      write(row, col, values[index], { alignment: 'center', fontSize: 650 })
    );
  });

  write(10, 6, '나. 여행 준비물', { bold: true, fontSize: 900, color: '#123a9b' });
  write(11, 6, '구분', { alignment: 'center', bold: true, fontSize: 680 });
  write(11, 7, '준비물 체크리스트', { alignment: 'center', bold: true, fontSize: 680 });
  write(12, 6, '필수', { alignment: 'center', bold: true, fontSize: 680 });
  write(12, 7, '□ 여권  □ 항공권  □ 현금/카드', { alignment: 'center', fontSize: 650 });
  write(12, 9, '□ 보험  □ 비상약', { alignment: 'center', fontSize: 650 });
  write(12, 11, '□ 충전기', { alignment: 'center', fontSize: 650 });
  write(13, 6, '생활', { alignment: 'center', bold: true, fontSize: 680 });
  write(13, 7, '□ 세면도구  □ 의류/우산', { alignment: 'center', fontSize: 650 });
  write(13, 9, '□ 포켓 와이파이', { alignment: 'center', fontSize: 650 });
  write(13, 11, '□ 카메라', { alignment: 'center', fontSize: 650 });

  write(14, 6, '다. 교통·숙소·입장권 예약 현황', {
    bold: true,
    fontSize: 900,
    color: '#123a9b',
  });
  ['구분', '내용', '금액', '비고'].forEach((text, index) =>
    write(15, [6, 7, 10, 11][index], text, { alignment: 'center', bold: true, fontSize: 680 })
  );
  write(16, 6, '예약', { alignment: 'center', bold: true, fontSize: 680 });
  write(16, 7, '항공 / 숙소 / 교통패스 / 입장권', { alignment: 'center', fontSize: 650 });
  write(16, 10, '_______원', { alignment: 'center', fontSize: 650 });
  write(16, 11, '□ 완료', { alignment: 'center', fontSize: 650 });

  heading(17, 6, '5', '행정사항·기타');
  write(
    18,
    6,
    '가. 여권·비자 유효기간 및 여행자보험 가입 여부 사전 확인\n나. 로밍·포켓 와이파이 등 통신수단 확보 및 비상연락망 공유\n다. 현지 재난·치안 정보 확인, 중요 서류는 전자사본으로 별도 보관',
    {
      bold: true,
      fontSize: 740,
    }
  );
  write(19, 6, '철저한 사전 준비와 안전수칙 준수로\n안전하고 즐거운 여행이 되도록 하겠습니다.', {
    alignment: 'center',
    bold: true,
    fontSize: 820,
    color: '#594b12',
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, document.exportHwp());
  console.log(`${outputPath} (${document.pageCount()} page)`);
} finally {
  document.free();
}
