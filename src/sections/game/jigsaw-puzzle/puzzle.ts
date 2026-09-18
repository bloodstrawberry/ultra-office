export type Edge = -1 | 0 | 1;
export type Piece = {
  id: number;
  row: number;
  col: number;
  top: Edge;
  right: Edge;
  bottom: Edge;
  left: Edge;
};

function edgeSign(row: number, col: number): Edge {
  return (row * 11 + col * 7) % 2 === 0 ? 1 : -1;
}

function opposite(sign: Edge): Edge {
  return (sign * -1) as Edge;
}

export function createPieces(size: number): Piece[] {
  return Array.from({ length: size * size }, (_, id) => {
    const row = Math.floor(id / size);
    const col = id % size;
    return {
      id,
      row,
      col,
      top: row === 0 ? 0 : opposite(edgeSign(row - 1, col + size)),
      right: col === size - 1 ? 0 : edgeSign(row, col),
      bottom: row === size - 1 ? 0 : edgeSign(row, col + size),
      left: col === 0 ? 0 : opposite(edgeSign(row, col - 1)),
    };
  });
}

export function shuffledIds(count: number): number[] {
  const ids = Array.from({ length: count }, (_, index) => index);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[other]] = [ids[other], ids[index]];
  }
  return ids;
}

function point(x0: number, y0: number, x1: number, y1: number, along: number, outside: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  return `${Math.round((x0 + dx * along + dy * outside) * 100) / 100} ${Math.round((y0 + dy * along - dx * outside) * 100) / 100}`;
}

function edgePath(x0: number, y0: number, x1: number, y1: number, sign: Edge) {
  if (!sign) return ` L ${x1} ${y1}`;
  const p = (along: number, outside = 0) => point(x0, y0, x1, y1, along, outside * sign);
  return ` L ${p(0.34)} C ${p(0.34)} ${p(0.34, 0.08)} ${p(0.4, 0.08)} C ${p(0.43, 0.08)} ${p(0.39, 0.19)} ${p(0.5, 0.19)} C ${p(0.61, 0.19)} ${p(0.57, 0.08)} ${p(0.6, 0.08)} C ${p(0.66, 0.08)} ${p(0.66)} ${p(0.66)} L ${x1} ${y1}`;
}

export function piecePath(piece: Piece): string {
  return `M 0 0${edgePath(0, 0, 100, 0, piece.top)}${edgePath(100, 0, 100, 100, piece.right)}${edgePath(100, 100, 0, 100, piece.bottom)}${edgePath(0, 100, 0, 0, piece.left)} Z`;
}
