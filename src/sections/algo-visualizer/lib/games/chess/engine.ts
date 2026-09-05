import type { ChessMove, ChessColor, ChessBoard, ChessSquare, ChessPieceType } from './types';

export function createEmptyChessBoard(): ChessBoard {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
}

export function cloneChessBoard(board: ChessBoard): ChessBoard {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function isSameSquare(
  sq1: ChessSquare | null | undefined,
  sq2: ChessSquare | null | undefined
): boolean {
  if (!sq1 || !sq2) return false;
  return sq1.r === sq2.r && sq1.c === sq2.c;
}

export function squareToAlgebraic(sq: ChessSquare): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rank = 8 - sq.r;
  return `${files[sq.c]}${rank}`;
}

export function algebraicToSquare(alg: string): ChessSquare {
  const fileChar = alg[0].toLowerCase();
  const rankChar = alg[1];
  const c = fileChar.charCodeAt(0) - 'a'.charCodeAt(0);
  const r = 8 - parseInt(rankChar, 10);
  return { r, c };
}

/** Parse FEN notation string to ChessBoard */
export function parseFEN(fen: string): {
  board: ChessBoard;
  activeColor: ChessColor;
  castling: string;
  enPassant: ChessSquare | null;
} {
  const parts = fen.trim().split(/\s+/);
  const placement = parts[0] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  const activeColor: ChessColor = (parts[1] as ChessColor) || 'w';
  const castling = parts[2] || 'KQkq';
  const enPassant = parts[3] && parts[3] !== '-' ? algebraicToSquare(parts[3]) : null;

  const board = createEmptyChessBoard();
  const rows = placement.split('/');

  let idCounter = 1;
  for (let r = 0; r < 8; r += 1) {
    const rowStr = rows[r] || '8';
    let c = 0;
    for (let i = 0; i < rowStr.length; i += 1) {
      const char = rowStr[i];
      if (char >= '1' && char <= '8') {
        c += parseInt(char, 10);
      } else {
        const isUpper = char === char.toUpperCase();
        const color: ChessColor = isUpper ? 'w' : 'b';
        const type = char.toLowerCase() as ChessPieceType;
        board[r][c] = {
          id: `p-${idCounter++}-${char}`,
          type,
          color,
        };
        c += 1;
      }
    }
  }

  return { board, activeColor, castling, enPassant };
}

/** Check if square (r, c) is attacked by any piece of `byColor` */
export function isSquareAttacked(board: ChessBoard, sq: ChessSquare, byColor: ChessColor): boolean {
  // 1. Attacked by Pawn
  const pawnDir = byColor === 'w' ? 1 : -1; // White attacks upward (r-1), Black attacks downward (r+1)
  const pawnR = sq.r + pawnDir;
  if (pawnR >= 0 && pawnR < 8) {
    for (const pawnC of [sq.c - 1, sq.c + 1]) {
      if (pawnC >= 0 && pawnC < 8) {
        const p = board[pawnR][pawnC];
        if (p && p.color === byColor && p.type === 'p') return true;
      }
    }
  }

  // 2. Attacked by Knight
  const knightDeltas = [
    { dr: -2, dc: -1 },
    { dr: -2, dc: 1 },
    { dr: -1, dc: -2 },
    { dr: -1, dc: 2 },
    { dr: 1, dc: -2 },
    { dr: 1, dc: 2 },
    { dr: 2, dc: -1 },
    { dr: 2, dc: 1 },
  ];
  for (const kd of knightDeltas) {
    const nr = sq.r + kd.dr;
    const nc = sq.c + kd.dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'n') return true;
    }
  }

  // 3. Attacked by King
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr !== 0 || dc !== 0) {
        const nr = sq.r + dr;
        const nc = sq.c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const p = board[nr][nc];
          if (p && p.color === byColor && p.type === 'k') return true;
        }
      }
    }
  }

  // 4. Straight rays (Rook or Queen)
  const straightDirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];
  for (const d of straightDirs) {
    let nr = sq.r + d.dr;
    let nc = sq.c + d.dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      nr += d.dr;
      nc += d.dc;
    }
  }

  // 5. Diagonal rays (Bishop or Queen)
  const diagDirs = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 1 },
  ];
  for (const d of diagDirs) {
    let nr = sq.r + d.dr;
    let nc = sq.c + d.dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      nr += d.dr;
      nc += d.dc;
    }
  }

  return false;
}

/** Check if king of `color` is in check */
export function isKingInCheck(board: ChessBoard, color: ChessColor): boolean {
  let kingSq: ChessSquare | null = null;
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const p = board[r][c];
      if (p && p.color === color && p.type === 'k') {
        kingSq = { r, c };
        break;
      }
    }
    if (kingSq) break;
  }
  if (!kingSq) return false;
  const oppColor: ChessColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, kingSq, oppColor);
}

/** Generate raw pseudo-legal destination squares for a piece */
export function getPieceRawChessMoves(board: ChessBoard, sq: ChessSquare): ChessSquare[] {
  const piece = board[sq.r][sq.c];
  if (!piece) return [];

  const dests: ChessSquare[] = [];
  const color = piece.color;
  const oppColor: ChessColor = color === 'w' ? 'b' : 'w';

  const canOccupy = (r: number, c: number): boolean => {
    if (r < 0 || r >= 8 || c < 0 || c >= 8) return false;
    const target = board[r][c];
    return !target || target.color === oppColor;
  };

  switch (piece.type) {
    case 'p': {
      const fwd = color === 'w' ? -1 : 1;
      const startRank = color === 'w' ? 6 : 1;

      // 1-step forward
      const fwdR = sq.r + fwd;
      if (fwdR >= 0 && fwdR < 8 && !board[fwdR][sq.c]) {
        dests.push({ r: fwdR, c: sq.c });
        // 2-step forward
        const doubleFwdR = sq.r + 2 * fwd;
        if (sq.r === startRank && !board[doubleFwdR][sq.c]) {
          dests.push({ r: doubleFwdR, c: sq.c });
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const tr = sq.r + fwd;
        const tc = sq.c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          const target = board[tr][tc];
          if (target && target.color === oppColor) {
            dests.push({ r: tr, c: tc });
          }
        }
      }
      break;
    }

    case 'n': {
      const knightDeltas = [
        { dr: -2, dc: -1 },
        { dr: -2, dc: 1 },
        { dr: -1, dc: -2 },
        { dr: -1, dc: 2 },
        { dr: 1, dc: -2 },
        { dr: 1, dc: 2 },
        { dr: 2, dc: -1 },
        { dr: 2, dc: 1 },
      ];
      for (const d of knightDeltas) {
        const nr = sq.r + d.dr;
        const nc = sq.c + d.dc;
        if (canOccupy(nr, nc)) dests.push({ r: nr, c: nc });
      }
      break;
    }

    case 'b': {
      const diagDirs = [
        { dr: -1, dc: -1 },
        { dr: -1, dc: 1 },
        { dr: 1, dc: -1 },
        { dr: 1, dc: 1 },
      ];
      for (const d of diagDirs) {
        let nr = sq.r + d.dr;
        let nc = sq.c + d.dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            dests.push({ r: nr, c: nc });
          } else {
            if (target.color === oppColor) dests.push({ r: nr, c: nc });
            break;
          }
          nr += d.dr;
          nc += d.dc;
        }
      }
      break;
    }

    case 'r': {
      const straightDirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      for (const d of straightDirs) {
        let nr = sq.r + d.dr;
        let nc = sq.c + d.dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            dests.push({ r: nr, c: nc });
          } else {
            if (target.color === oppColor) dests.push({ r: nr, c: nc });
            break;
          }
          nr += d.dr;
          nc += d.dc;
        }
      }
      break;
    }

    case 'q': {
      const allDirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
        { dr: -1, dc: -1 },
        { dr: -1, dc: 1 },
        { dr: 1, dc: -1 },
        { dr: 1, dc: 1 },
      ];
      for (const d of allDirs) {
        let nr = sq.r + d.dr;
        let nc = sq.c + d.dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            dests.push({ r: nr, c: nc });
          } else {
            if (target.color === oppColor) dests.push({ r: nr, c: nc });
            break;
          }
          nr += d.dr;
          nc += d.dc;
        }
      }
      break;
    }

    case 'k': {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr !== 0 || dc !== 0) {
            const nr = sq.r + dr;
            const nc = sq.c + dc;
            if (canOccupy(nr, nc)) dests.push({ r: nr, c: nc });
          }
        }
      }
      break;
    }
  }

  return dests;
}

/** Execute move and return new board */
export function makeChessMove(board: ChessBoard, move: ChessMove): ChessBoard {
  const newBoard = cloneChessBoard(board);
  let piece = newBoard[move.from.r][move.from.c];
  if (!piece) return newBoard;

  if (move.promotion) {
    piece = { ...piece, type: move.promotion };
  }

  newBoard[move.from.r][move.from.c] = null;
  newBoard[move.to.r][move.to.c] = piece;

  // Handle Castling Rook movement
  if (move.isCastling === 'K') {
    const rookFromC = 7;
    const rookToC = 5;
    const rook = newBoard[move.from.r][rookFromC];
    newBoard[move.from.r][rookFromC] = null;
    newBoard[move.from.r][rookToC] = rook;
  } else if (move.isCastling === 'Q') {
    const rookFromC = 0;
    const rookToC = 3;
    const rook = newBoard[move.from.r][rookFromC];
    newBoard[move.from.r][rookFromC] = null;
    newBoard[move.from.r][rookToC] = rook;
  }

  return newBoard;
}

/** Get all legal chess moves for `color` */
export function getAllLegalChessMoves(board: ChessBoard, color: ChessColor): ChessMove[] {
  const legalMoves: ChessMove[] = [];
  const oppColor: ChessColor = color === 'w' ? 'b' : 'w';

  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const dests = getPieceRawChessMoves(board, { r, c });
        for (const dest of dests) {
          const isPromotion = piece.type === 'p' && (dest.r === 0 || dest.r === 7);

          const promoTypes: (ChessPieceType | undefined)[] = isPromotion
            ? ['q', 'r', 'b', 'n']
            : [undefined];

          for (const promo of promoTypes) {
            const candidateMove: ChessMove = {
              from: { r, c },
              to: dest,
              piece,
              captured: board[dest.r][dest.c],
              promotion: promo,
            };

            const nextBoard = makeChessMove(board, candidateMove);
            if (!isKingInCheck(nextBoard, color)) {
              candidateMove.isCheck = isKingInCheck(nextBoard, oppColor);
              legalMoves.push(candidateMove);
            }
          }
        }
      }
    }
  }

  return legalMoves;
}

/** Standard piece values in centipawns */
export const CHESS_PIECE_VALUES: Record<ChessPieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};
