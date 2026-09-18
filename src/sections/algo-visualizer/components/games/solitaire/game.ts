export type Suit = '♠' | '♥' | '♦' | '♣';
export type Card = { id: string; suit: Suit; rank: number; faceUp: boolean };
export type Pile = { kind: 'waste' | 'foundation' | 'tableau'; index: number; cardIndex?: number };
export type Game = {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
};

const suits: Suit[] = ['♠', '♥', '♦', '♣'];

export const isRed = (card: Card) => card.suit === '♥' || card.suit === '♦';
export const rankLabel = (rank: number) =>
  ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][rank - 1];

export function newGame(): Game {
  const deck = suits.flatMap((suit) =>
    Array.from({ length: 13 }, (_, index) => ({
      id: `${suit}-${index + 1}`,
      suit,
      rank: index + 1,
      faceUp: false,
    }))
  );
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  const tableau = Array.from({ length: 7 }, () => [] as Card[]);
  for (let column = 0; column < 7; column += 1) {
    for (let row = 0; row <= column; row += 1) {
      tableau[column].push({ ...deck.pop()!, faceUp: row === column });
    }
  }
  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau, moves: 0 };
}

function clone(game: Game): Game {
  return {
    ...game,
    stock: [...game.stock],
    waste: [...game.waste],
    foundations: game.foundations.map((pile) => [...pile]),
    tableau: game.tableau.map((pile) => [...pile]),
  };
}

export function draw(game: Game): Game | null {
  if (!game.stock.length && !game.waste.length) return null;
  const next = clone(game);
  if (next.stock.length) {
    next.waste.push({ ...next.stock.pop()!, faceUp: true });
  } else {
    next.stock = next.waste.reverse().map((card) => ({ ...card, faceUp: false }));
    next.waste = [];
  }
  next.moves += 1;
  return next;
}

export function move(game: Game, from: Pile, to: Pile): Game | null {
  if (from.kind === to.kind && from.index === to.index) return null;
  if (from.kind === 'foundation' && to.kind === 'foundation') return null;
  if (to.kind === 'waste') return null;
  const next = clone(game);
  const source =
    from.kind === 'waste'
      ? next.waste
      : from.kind === 'foundation'
        ? next.foundations[from.index]
        : next.tableau[from.index];
  const target = to.kind === 'foundation' ? next.foundations[to.index] : next.tableau[to.index];
  if (!source || !target || !source.length) return null;
  const start = from.kind === 'tableau' ? (from.cardIndex ?? source.length - 1) : source.length - 1;
  if (start < 0 || start >= source.length) return null;
  const moving = source.slice(start);
  if (!moving[0].faceUp) return null;
  if (to.kind === 'foundation') {
    if (
      moving.length !== 1 ||
      (target.length
        ? target[target.length - 1].suit !== moving[0].suit ||
          target[target.length - 1].rank + 1 !== moving[0].rank
        : moving[0].rank !== 1)
    )
      return null;
  } else if (target.length) {
    const top = target[target.length - 1];
    if (isRed(top) === isRed(moving[0]) || top.rank !== moving[0].rank + 1) return null;
  } else if (moving[0].rank !== 13) return null;
  source.splice(start);
  target.push(...moving);
  if (from.kind === 'tableau' && source.length)
    source[source.length - 1] = { ...source[source.length - 1], faceUp: true };
  next.moves += 1;
  return next;
}

export const isWon = (game: Game) => game.foundations.every((pile) => pile.length === 13);
