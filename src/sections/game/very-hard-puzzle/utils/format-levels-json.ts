import type { CellType } from './types';

export interface EditorLevelItem {
  name: string;
  timeLimit: number;
  grid: CellType[][];
  hint?: CellType[][][];
}

export function formatLevelsJSON(levels: EditorLevelItem[]): string {
  const levelStrings = levels.map((lvl) => {
    const gridRows = lvl.grid.map((row) => `      [${row.join(', ')}]`);
    const gridStr = `    "grid": [\n${gridRows.join(',\n')}\n    ]`;

    let hintStr = '';
    if (lvl.hint && lvl.hint.length > 0) {
      const hintBlocks = lvl.hint.map((hGrid) => {
        const hRows = hGrid.map((row) => `        [${row.join(', ')}]`);
        return `      [\n${hRows.join(',\n')}\n      ]`;
      });
      hintStr = `,\n    "hint": [\n${hintBlocks.join(',\n')}\n    ]`;
    }

    return `  {\n    "name": ${JSON.stringify(lvl.name)},\n    "timeLimit": ${lvl.timeLimit},\n${gridStr}${hintStr}\n  }`;
  });
  return `[\n${levelStrings.join(',\n')}\n]`;
}
