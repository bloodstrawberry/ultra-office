import type { CellType } from '../../game-engine';

export interface EditorLevelItem {
  name: string;
  turnLimit?: number;
  grid: CellType[][];
  statusMap?: number[][];
  hint?: CellType[][][];
}

export function formatLevelsJSON(levels: EditorLevelItem[]): string {
  const levelStrings = levels.map((lvl) => {
    const gridRows = lvl.grid.map((row) => `      [${row.join(', ')}]`);
    const gridStr = `    "grid": [\n${gridRows.join(',\n')}\n    ]`;

    let statusMapStr = '';
    if (lvl.statusMap && lvl.statusMap.some((row) => row.some((val) => val !== 0))) {
      const smRows = lvl.statusMap.map((row) => `      [${row.join(', ')}]`);
      statusMapStr = `,\n    "statusMap": [\n${smRows.join(',\n')}\n    ]`;
    }

    let hintStr = '';
    if (lvl.hint && lvl.hint.length > 0) {
      const hintBlocks = lvl.hint.map((hGrid) => {
        const hRows = hGrid.map((row) => `        [${row.join(', ')}]`);
        return `      [\n${hRows.join(',\n')}\n      ]`;
      });
      hintStr = `,\n    "hint": [\n${hintBlocks.join(',\n')}\n    ]`;
    }

    return `  {\n    "name": ${JSON.stringify(lvl.name)},\n    "turnLimit": ${lvl.turnLimit ?? 50},\n${gridStr}${statusMapStr}${hintStr}\n  }`;
  });
  return `[\n${levelStrings.join(',\n')}\n]`;
}
