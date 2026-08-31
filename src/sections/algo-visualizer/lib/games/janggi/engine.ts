import type {
  JanggiSide,
  JanggiPiece,
  JanggiPoint,
  JanggiBoard,
  JanggiMove,
  JanggiPieceType,
} from './types';

export const JANGGI_ROWS = 10;
export const JANGGI_COLS = 9;

export function createEmptyJanggiBoard(): JanggiBoard {
  return Array.from({ length: JANGGI_ROWS }, () => Array.from({ length: JANGGI_COLS }, () => null));
}

export function cloneJanggiBoard(board: JanggiBoard): JanggiBoard {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function isInsidePalace(r: number, c: number, side?: JanggiSide): boolean {
  if (c < 3 || c > 5) return false;
  if (!side) {
    return (r >= 0 && r <= 2) || (r >= 7 && r <= 9);
  }
  if (side === 'HAN') {
    return r >= 0 && r <= 2;
  }
  return r >= 7 && r <= 9;
}

export function isSameJanggiPoint(
  p1: JanggiPoint | null | undefined,
  p2: JanggiPoint | null | undefined
): boolean {
  if (!p1 || !p2) return false;
  return p1.r === p2.r && p1.c === p2.c;
}

/** Check if palace diagonal path is valid between (r1, c1) and (r2, c2) */
export function isValidPalaceDiagonal(r1: number, c1: number, r2: number, c2: number): boolean {
  const isHanPalace =
    r1 >= 0 && r1 <= 2 && r2 >= 0 && r2 <= 2 && c1 >= 3 && c1 <= 5 && c2 >= 3 && c2 <= 5;
  const isChoPalace =
    r1 >= 7 && r1 <= 9 && r2 >= 7 && r2 <= 9 && c1 >= 3 && c1 <= 5 && c2 >= 3 && c2 <= 5;

  if (!isHanPalace && !isChoPalace) return false;

  const centerR = isHanPalace ? 1 : 8;
  const centerC = 4;

  // Move directly to or from center (1 step diagonal)
  if ((r1 === centerR && c1 === centerC) || (r2 === centerR && c2 === centerC)) {
    return Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 1;
  }

  // Move across corners through center (e.g. (0,3) to (2,5))
  if (Math.abs(r1 - r2) === 2 && Math.abs(c1 - c2) === 2) {
    const midR = (r1 + r2) / 2;
    const midC = (c1 + c2) / 2;
    return midR === centerR && midC === centerC;
  }

  return false;
}

/** Generate raw legal destination points for a piece (without check validation) */
export function getPieceRawMoves(
  board: JanggiBoard,
  r: number,
  c: number,
  includeBlockedMyeok: boolean = false
): { validPoints: JanggiPoint[]; blockedPoints?: JanggiPoint[] } {
  const piece = board[r][c];
  if (!piece) return { validPoints: [] };

  const validPoints: JanggiPoint[] = [];
  const blockedPoints: JanggiPoint[] = [];

  const side = piece.side;

  const canOccupy = (tr: number, tc: number): boolean => {
    if (tr < 0 || tr >= JANGGI_ROWS || tc < 0 || tc >= JANGGI_COLS) return false;
    const target = board[tr][tc];
    return !target || target.side !== side;
  };

  switch (piece.type) {
    case 'KING':
    case 'GUARD': {
      // 1-step orthogonal
      const deltas = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      for (const d of deltas) {
        const nr = r + d.dr;
        const nc = c + d.dc;
        if (isInsidePalace(nr, nc, piece.side) && canOccupy(nr, nc)) {
          validPoints.push({ r: nr, c: nc });
        }
      }
      // Palace diagonals
      const diagDeltas = [
        { dr: -1, dc: -1 },
        { dr: -1, dc: 1 },
        { dr: 1, dc: -1 },
        { dr: 1, dc: 1 },
      ];
      for (const d of diagDeltas) {
        const nr = r + d.dr;
        const nc = c + d.dc;
        if (
          isInsidePalace(nr, nc, piece.side) &&
          isValidPalaceDiagonal(r, c, nr, nc) &&
          canOccupy(nr, nc)
        ) {
          validPoints.push({ r: nr, c: nc });
        }
      }
      break;
    }

    case 'CHARIOT': {
      // Orthogonal rays
      const dirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      for (const d of dirs) {
        let nr = r + d.dr;
        let nc = c + d.dc;
        while (nr >= 0 && nr < JANGGI_ROWS && nc >= 0 && nc < JANGGI_COLS) {
          const target = board[nr][nc];
          if (!target) {
            validPoints.push({ r: nr, c: nc });
          } else {
            if (target.side !== side) {
              validPoints.push({ r: nr, c: nc });
            }
            break;
          }
          nr += d.dr;
          nc += d.dc;
        }
      }

      // Palace diagonal movement
      if (isInsidePalace(r, c)) {
        const palaceCenters = [
          { pr: 1, pc: 4 },
          { pr: 8, pc: 4 },
        ];
        for (const center of palaceCenters) {
          if (Math.abs(r - center.pr) <= 1 && Math.abs(c - center.pc) <= 1) {
            // From corner through center to opposite corner
            const diagDirs = [
              { dr: -1, dc: -1 },
              { dr: -1, dc: 1 },
              { dr: 1, dc: -1 },
              { dr: 1, dc: 1 },
            ];
            for (const d of diagDirs) {
              const nr = r + d.dr;
              const nc = c + d.dc;
              if (isInsidePalace(nr, nc) && isValidPalaceDiagonal(r, c, nr, nc)) {
                if (canOccupy(nr, nc)) validPoints.push({ r: nr, c: nc });
                if (!board[nr][nc]) {
                  const farR = nr + d.dr;
                  const farC = nc + d.dc;
                  if (
                    isInsidePalace(farR, farC) &&
                    isValidPalaceDiagonal(nr, nc, farR, farC) &&
                    canOccupy(farR, farC)
                  ) {
                    validPoints.push({ r: farR, c: farC });
                  }
                }
              }
            }
          }
        }
      }
      break;
    }

    case 'CANNON': {
      // Orthogonal rays with jumping
      const dirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      for (const d of dirs) {
        let nr = r + d.dr;
        let nc = c + d.dc;
        let hurdleFound = false;

        while (nr >= 0 && nr < JANGGI_ROWS && nc >= 0 && nc < JANGGI_COLS) {
          const target = board[nr][nc];
          if (!hurdleFound) {
            if (target) {
              // Cannot use another cannon as a hurdle!
              if (target.type === 'CANNON') break;
              hurdleFound = true;
            }
          } else {
            // After hurdle found
            if (!target) {
              validPoints.push({ r: nr, c: nc });
            } else {
              // Cannot capture a cannon!
              if (target.side !== side && target.type !== 'CANNON') {
                validPoints.push({ r: nr, c: nc });
              }
              break;
            }
          }
          nr += d.dr;
          nc += d.dc;
        }
      }

      // Palace diagonal jumping (corner to corner across center piece)
      if (isInsidePalace(r, c)) {
        const isHan = r <= 2;
        const centerR = isHan ? 1 : 8;
        const centerC = 4;
        const centerPiece = board[centerR][centerC];

        if (centerPiece && centerPiece.type !== 'CANNON') {
          // If starting from corner, can jump to opposite corner
          if (
            (r !== centerR || c !== centerC) &&
            Math.abs(r - centerR) === 1 &&
            Math.abs(c - centerC) === 1
          ) {
            const oppR = centerR + (centerR - r);
            const oppC = centerC + (centerC - c);
            const oppPiece = board[oppR][oppC];
            if (!oppPiece || (oppPiece.side !== side && oppPiece.type !== 'CANNON')) {
              validPoints.push({ r: oppR, c: oppC });
            }
          }
        }
      }
      break;
    }

    case 'HORSE': {
      // 8 directions (1 straight + 1 diagonal)
      const horseSteps = [
        {
          eye: { dr: -1, dc: 0 },
          dests: [
            { dr: -2, dc: -1 },
            { dr: -2, dc: 1 },
          ],
        },
        {
          eye: { dr: 1, dc: 0 },
          dests: [
            { dr: 2, dc: -1 },
            { dr: 2, dc: 1 },
          ],
        },
        {
          eye: { dr: 0, dc: -1 },
          dests: [
            { dr: -1, dc: -2 },
            { dr: 1, dc: -2 },
          ],
        },
        {
          eye: { dr: 0, dc: 1 },
          dests: [
            { dr: -1, dc: 2 },
            { dr: 1, dc: 2 },
          ],
        },
      ];

      for (const step of horseSteps) {
        const eyeR = r + step.eye.dr;
        const eyeC = c + step.eye.dc;

        if (eyeR >= 0 && eyeR < JANGGI_ROWS && eyeC >= 0 && eyeC < JANGGI_COLS) {
          const eyePiece = board[eyeR][eyeC];
          if (!eyePiece) {
            // Myeok is open!
            for (const d of step.dests) {
              const tr = r + d.dr;
              const tc = c + d.dc;
              if (canOccupy(tr, tc)) {
                validPoints.push({ r: tr, c: tc });
              }
            }
          } else {
            // Myeok blocked!
            if (includeBlockedMyeok) {
              blockedPoints.push({ r: eyeR, c: eyeC });
            }
          }
        }
      }
      break;
    }

    case 'ELEPHANT': {
      // 8 directions (1 straight + 2 diagonal)
      const elephantSteps = [
        {
          eye1: { dr: -1, dc: 0 },
          eye2: { dr: -2, dc: -1 },
          dest: { dr: -3, dc: -2 },
        },
        {
          eye1: { dr: -1, dc: 0 },
          eye2: { dr: -2, dc: 1 },
          dest: { dr: -3, dc: 2 },
        },
        {
          eye1: { dr: 1, dc: 0 },
          eye2: { dr: 2, dc: -1 },
          dest: { dr: 3, dc: -2 },
        },
        {
          eye1: { dr: 1, dc: 0 },
          eye2: { dr: 2, dc: 1 },
          dest: { dr: 3, dc: 2 },
        },
        {
          eye1: { dr: 0, dc: -1 },
          eye2: { dr: -1, dc: -2 },
          dest: { dr: -2, dc: -3 },
        },
        {
          eye1: { dr: 0, dc: -1 },
          eye2: { dr: 1, dc: -2 },
          dest: { dr: 2, dc: -3 },
        },
        {
          eye1: { dr: 0, dc: 1 },
          eye2: { dr: -1, dc: 2 },
          dest: { dr: -2, dc: 3 },
        },
        {
          eye1: { dr: 0, dc: 1 },
          eye2: { dr: 1, dc: 2 },
          dest: { dr: 2, dc: 3 },
        },
      ];

      for (const step of elephantSteps) {
        const e1r = r + step.eye1.dr;
        const e1c = c + step.eye1.dc;
        const e2r = r + step.eye2.dr;
        const e2c = c + step.eye2.dc;
        const tr = r + step.dest.dr;
        const tc = c + step.dest.dc;

        if (
          e1r >= 0 &&
          e1r < JANGGI_ROWS &&
          e1c >= 0 &&
          e1c < JANGGI_COLS &&
          e2r >= 0 &&
          e2r < JANGGI_ROWS &&
          e2c >= 0 &&
          e2c < JANGGI_COLS
        ) {
          if (!board[e1r][e1c] && !board[e2r][e2c]) {
            if (canOccupy(tr, tc)) {
              validPoints.push({ r: tr, c: tc });
            }
          } else if (includeBlockedMyeok) {
            if (board[e1r][e1c]) blockedPoints.push({ r: e1r, c: e1c });
            if (board[e2r][e2c]) blockedPoints.push({ r: e2r, c: e2c });
          }
        }
      }
      break;
    }

    case 'SOLDIER': {
      // Forward direction: Cho moves UP (dr = -1), Han moves DOWN (dr = 1)
      const forwardDr = side === 'CHO' ? -1 : 1;
      const normalSteps = [
        { dr: forwardDr, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];

      for (const s of normalSteps) {
        const tr = r + s.dr;
        const tc = c + s.dc;
        if (canOccupy(tr, tc)) {
          validPoints.push({ r: tr, c: tc });
        }
      }

      // Inside enemy palace diagonals (forward diagonal only)
      const enemyPalaceSide: JanggiSide = side === 'CHO' ? 'HAN' : 'CHO';
      if (isInsidePalace(r, c, enemyPalaceSide)) {
        const diagSteps = [
          { dr: forwardDr, dc: -1 },
          { dr: forwardDr, dc: 1 },
        ];
        for (const s of diagSteps) {
          const tr = r + s.dr;
          const tc = c + s.dc;
          if (
            isInsidePalace(tr, tc, enemyPalaceSide) &&
            isValidPalaceDiagonal(r, c, tr, tc) &&
            canOccupy(tr, tc)
          ) {
            validPoints.push({ r: tr, c: tc });
          }
        }
      }
      break;
    }
  }

  return { validPoints, blockedPoints };
}

/** Check if the side's king is currently in check (장군) */
export function isSideInCheck(board: JanggiBoard, side: JanggiSide): boolean {
  // Find King
  let kingPoint: JanggiPoint | null = null;
  for (let r = 0; r < JANGGI_ROWS; r += 1) {
    for (let c = 0; c < JANGGI_COLS; c += 1) {
      const p = board[r][c];
      if (p && p.side === side && p.type === 'KING') {
        kingPoint = { r, c };
        break;
      }
    }
    if (kingPoint) break;
  }

  if (!kingPoint) return false;

  const oppSide: JanggiSide = side === 'CHO' ? 'HAN' : 'CHO';
  for (let r = 0; r < JANGGI_ROWS; r += 1) {
    for (let c = 0; c < JANGGI_COLS; c += 1) {
      const p = board[r][c];
      if (p && p.side === oppSide) {
        const { validPoints } = getPieceRawMoves(board, r, c);
        if (validPoints.some((vp) => vp.r === kingPoint!.r && vp.c === kingPoint!.c)) {
          return true;
        }
      }
    }
  }

  return false;
}

/** Execute move and return new board */
export function makeJanggiMove(board: JanggiBoard, move: JanggiMove): JanggiBoard {
  const newBoard = cloneJanggiBoard(board);
  const piece = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = null;
  newBoard[move.to.r][move.to.c] = piece;
  return newBoard;
}

/** Get piece name in traditional Korean Hanja/Hangul */
export function getJanggiPieceName(type: JanggiPieceType, side: JanggiSide): string {
  if (side === 'CHO') {
    switch (type) {
      case 'KING':
        return '楚 (궁)';
      case 'GUARD':
        return '士 (사)';
      case 'CHARIOT':
        return '車 (차)';
      case 'CANNON':
        return '包 (포)';
      case 'HORSE':
        return '馬 (마)';
      case 'ELEPHANT':
        return '象 (상)';
      case 'SOLDIER':
        return '卒 (졸)';
    }
  } else {
    switch (type) {
      case 'KING':
        return '漢 (궁)';
      case 'GUARD':
        return '士 (사)';
      case 'CHARIOT':
        return '車 (차)';
      case 'CANNON':
        return '包 (포)';
      case 'HORSE':
        return '馬 (마)';
      case 'ELEPHANT':
        return '象 (상)';
      case 'SOLDIER':
        return '兵 (병)';
    }
  }
}

/** Piece point value (차13, 포7, 마5, 상3, 사3, 졸2, 덤1.5) */
export const JANGGI_PIECE_VALUES: Record<JanggiPieceType, number> = {
  KING: 0,
  CHARIOT: 13,
  CANNON: 7,
  HORSE: 5,
  ELEPHANT: 3,
  GUARD: 3,
  SOLDIER: 2,
};
