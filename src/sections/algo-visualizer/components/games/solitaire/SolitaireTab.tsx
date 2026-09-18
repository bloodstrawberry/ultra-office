'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import {
  draw,
  move,
  isRed,
  isWon,
  newGame,
  type Card,
  type Game,
  type Pile,
  rankLabel,
} from './game';

type Session = { game: Game; history: Game[] };

const cardWidth = 76;
const cardHeight = 106;
const emptySlot = {
  width: cardWidth,
  height: cardHeight,
  borderRadius: '10px',
  border: '2px dashed rgba(255,255,255,.36)',
  backgroundColor: 'rgba(0,0,0,.1)',
  color: 'rgba(255,255,255,.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 26,
} as const;

function PlayingCard({
  card,
  selected,
  onClick,
  onDoubleClick,
  label,
}: {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  label: string;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={selected || undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      sx={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: '10px',
        border: selected ? '3px solid #facc15' : '1px solid #cbd5e1',
        background: card.faceUp
          ? '#fff'
          : 'repeating-linear-gradient(45deg, #1e3a8a 0 7px, #2563eb 7px 14px)',
        color: isRed(card) ? '#d32f2f' : '#18212f',
        boxShadow: selected
          ? '0 0 0 3px rgba(250,204,21,.35), 0 4px 12px #0005'
          : '0 3px 9px #0005',
        cursor: card.faceUp ? 'pointer' : 'default',
        p: '7px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        fontWeight: 800,
        fontFamily: 'inherit',
        userSelect: 'none',
        '&:hover': card.faceUp ? { transform: 'translateY(-2px)' } : {},
      }}
    >
      {card.faceUp && (
        <>
          <Box sx={{ fontSize: 17, lineHeight: 1 }}>
            {rankLabel(card.rank)}
            {card.suit}
          </Box>
          <Box sx={{ alignSelf: 'center', fontSize: 31, lineHeight: 1 }}>{card.suit}</Box>
          <Box
            sx={{ fontSize: 15, lineHeight: 1, transform: 'rotate(180deg)', alignSelf: 'flex-end' }}
          >
            {rankLabel(card.rank)}
            {card.suit}
          </Box>
        </>
      )}
    </Box>
  );
}

export function SolitaireTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [selected, setSelected] = useState<Pile | null>(null);
  const [notice, setNotice] = useState('카드를 선택한 다음 옮길 곳을 누르세요.');

  useEffect(() => {
    setSession({ game: newGame(), history: [] });
  }, []);

  const commit = (next: Game | null, failure = '이곳으로 이동할 수 없습니다.') => {
    if (!session) return;
    if (!next) {
      setNotice(failure);
      return;
    }
    setSession({ game: next, history: [...session.history, session.game] });
    setSelected(null);
    setNotice(isWon(next) ? '축하합니다! 모든 카드를 완성했습니다.' : '');
  };

  const choose = (pile: Pile) => {
    if (!session) return;
    const { game } = session;
    if (selected) {
      if (
        selected.kind === pile.kind &&
        selected.index === pile.index &&
        selected.cardIndex === pile.cardIndex
      ) {
        setSelected(null);
        return;
      }
      const next = move(game, selected, pile);
      if (next) {
        commit(next);
        return;
      }
    }
    const source =
      pile.kind === 'waste'
        ? game.waste
        : pile.kind === 'foundation'
          ? game.foundations[pile.index]
          : game.tableau[pile.index];
    const index =
      pile.kind === 'tableau' ? (pile.cardIndex ?? source.length - 1) : source.length - 1;
    if (source[index]?.faceUp) {
      setSelected({ ...pile, cardIndex: index });
      setNotice(
        '옮길 열 또는 기초 더미를 누르세요. 카드를 두 번 누르면 자동으로 기초 더미에 놓습니다.'
      );
    } else {
      setNotice(selected ? '이곳으로 이동할 수 없습니다.' : '먼저 앞면 카드나 덱을 선택하세요.');
    }
  };

  const sendToFoundation = (pile: Pile) => {
    if (!session) return;
    for (let index = 0; index < 4; index += 1) {
      const next = move(session.game, pile, { kind: 'foundation', index });
      if (next) {
        commit(next);
        return;
      }
    }
    setNotice('기초 더미로 옮길 수 없습니다.');
  };

  if (!session) return <Typography sx={{ p: 3 }}>게임을 준비하는 중...</Typography>;
  const { game, history } = session;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: '100%',
        borderRadius: 3,
        bgcolor: '#08634b',
        color: 'white',
        backgroundImage: 'radial-gradient(circle at top, #158568, #075641 70%)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
            솔리테어
          </Typography>
          <Typography variant="body2" sx={{ color: '#d1fae5' }}>
            클론다이크 · 한 장씩 뽑기 · 이동 {game.moves}회
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setSession({ game: newGame(), history: [] });
              setSelected(null);
              setNotice('새 게임을 시작했습니다.');
            }}
          >
            새 게임
          </Button>
          <Button
            variant="outlined"
            disabled={!history.length}
            onClick={() => {
              setSession({ game: history[history.length - 1], history: history.slice(0, -1) });
              setSelected(null);
              setNotice('이전 이동으로 돌아갔습니다.');
            }}
            sx={{ color: 'white', borderColor: '#fff8', '&:hover': { borderColor: 'white' } }}
          >
            되돌리기
          </Button>
        </Stack>
      </Stack>
      <Typography role="status" sx={{ minHeight: 26, color: '#fef08a', fontSize: 13, mb: 1 }}>
        {notice}
      </Typography>
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Box sx={{ width: 7 * cardWidth + 6 * 14, mx: 'auto' }}>
          <Stack direction="row" spacing="14px" sx={{ mb: 3 }}>
            <Box
              component="button"
              type="button"
              aria-label={
                game.stock.length
                  ? `덱에서 카드 뽑기, ${game.stock.length}장 남음`
                  : '버린 카드 다시 섞기'
              }
              onClick={() => commit(draw(game), '더 뽑을 카드가 없습니다.')}
              sx={{
                ...emptySlot,
                cursor: 'pointer',
                borderStyle: 'solid',
                background: game.stock.length
                  ? 'repeating-linear-gradient(45deg, #1e3a8a 0 7px, #2563eb 7px 14px)'
                  : 'rgba(0,0,0,.1)',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              {game.stock.length ? game.stock.length : '↻'}
            </Box>
            {game.waste.length ? (
              <PlayingCard
                card={game.waste[game.waste.length - 1]}
                label="버린 카드 선택"
                selected={selected?.kind === 'waste'}
                onClick={() => choose({ kind: 'waste', index: 0 })}
                onDoubleClick={() => sendToFoundation({ kind: 'waste', index: 0 })}
              />
            ) : (
              <Box sx={emptySlot} aria-label="버린 카드 더미" />
            )}
            <Box sx={{ width: cardWidth }} />
            {game.foundations.map((pile, index) => (
              <Box key={index}>
                {pile.length ? (
                  <PlayingCard
                    card={pile[pile.length - 1]}
                    label={`${index + 1}번 기초 더미 카드 선택`}
                    selected={selected?.kind === 'foundation' && selected.index === index}
                    onClick={() => choose({ kind: 'foundation', index })}
                  />
                ) : (
                  <Box
                    component="button"
                    type="button"
                    aria-label={`${index + 1}번 빈 기초 더미`}
                    onClick={() => choose({ kind: 'foundation', index })}
                    sx={{ ...emptySlot, cursor: 'pointer' }}
                  >
                    A
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing="14px" alignItems="flex-start">
            {game.tableau.map((pile, column) => (
              <Box key={column} sx={{ width: cardWidth, minHeight: 200, position: 'relative' }}>
                {!pile.length && (
                  <Box
                    component="button"
                    type="button"
                    aria-label={`${column + 1}번 빈 열`}
                    onClick={() => choose({ kind: 'tableau', index: column })}
                    sx={{ ...emptySlot, cursor: 'pointer' }}
                  >
                    K
                  </Box>
                )}
                {pile.map((card, index) => (
                  <Box key={card.id} sx={{ position: 'absolute', top: index * 29, zIndex: index }}>
                    <PlayingCard
                      card={card}
                      label={`${column + 1}번 열 ${index + 1}번째 ${card.faceUp ? `${rankLabel(card.rank)}${card.suit}` : '뒷면'} 카드`}
                      selected={
                        selected?.kind === 'tableau' &&
                        selected.index === column &&
                        (selected.cardIndex ?? 0) <= index
                      }
                      onClick={() =>
                        card.faceUp && choose({ kind: 'tableau', index: column, cardIndex: index })
                      }
                      onDoubleClick={() =>
                        card.faceUp &&
                        sendToFoundation({ kind: 'tableau', index: column, cardIndex: index })
                      }
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: '#d1fae5', display: 'block', mt: 1 }}>
        빨강·검정이 번갈아 오도록 내림차순으로 쌓으세요. 빈 열에는 K부터 놓고, 기초 더미에는 같은
        무늬를 A부터 올립니다.
      </Typography>
    </Paper>
  );
}
