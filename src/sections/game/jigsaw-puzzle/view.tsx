'use client';

import { memo, useId, useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  PhotoUploadWorkspace,
  type SampleImageItem,
} from 'src/sections/photo/components/photo-upload-workspace';

import { piecePath, type Piece, shuffledIds, createPieces } from './puzzle';

const EXAMPLES: SampleImageItem[] = [
  {
    id: 'landscape',
    label: '🏞️ 호수와 산',
    subLabel: '풍경 사진 퍼즐',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'portrait',
    label: '👩 인물 사진',
    subLabel: '인물 사진 퍼즐',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'night',
    label: '🌃 네온 야경',
    subLabel: '야경 사진 퍼즐',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80',
  },
];

type Puzzle = {
  size: number;
  pieces: Piece[];
  order: number[];
  placed: boolean[];
  selected: number | null;
  attempts: number;
  completed: boolean;
};

function makePuzzle(size: number): Puzzle {
  return {
    size,
    pieces: createPieces(size),
    order: shuffledIds(size * size),
    placed: Array(size * size).fill(false),
    selected: null,
    attempts: 0,
    completed: false,
  };
}

const PieceArtwork = memo(function PieceArtwork({ piece, size, imageUrl }: { piece: Piece; size: number; imageUrl: string }) {
  const clipId = useId().replace(/:/g, '');
  const path = piecePath(piece);
  return (
    <svg
      viewBox="-20 -20 140 140"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-20%',
        top: '-20%',
        width: '140%',
        height: '140%',
        overflow: 'visible',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))',
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>
      <image
        href={imageUrl}
        x={-piece.col * 100}
        y={-piece.row * 100}
        width={size * 100}
        height={size * 100}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <path d={path} fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
});

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

const PuzzleClock = memo(function PuzzleClock({ startedAt, completed, finalSeconds }: { startedAt: number; completed: boolean; finalSeconds: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (completed) return undefined;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, completed]);
  return <>{formatTime(completed ? finalSeconds : elapsed)}</>;
});

export function JigsawPuzzleView() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [size, setSize] = useState(3);
  const [startedAt, setStartedAt] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const objectUrlRef = useRef<string | null>(null);
  const requestRef = useRef(0);

  useEffect(
    () => () => {
      requestRef.current += 1;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  const startPuzzle = (nextSize: number) => {
    setSize(nextSize);
    setPuzzle(makePuzzle(nextSize));
    setStartedAt(Date.now());
    setCompletedSeconds(0);
    setNotice('조각을 선택한 뒤 맞는 위치를 누르세요. 드래그해서 놓아도 됩니다.');
  };

  const loadImage = (url: string, isObjectUrl = false) => {
    const request = ++requestRef.current;
    setLoading(true);
    setNotice('이미지를 불러오는 중입니다...');
    const image = new Image();
    image.onload = () => {
      if (request !== requestRef.current) {
        if (isObjectUrl) URL.revokeObjectURL(url);
        return;
      }
      if (objectUrlRef.current && objectUrlRef.current !== url)
        URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = isObjectUrl ? url : null;
      setImageUrl(url);
      setLoading(false);
      startPuzzle(size);
    };
    image.onerror = () => {
      if (isObjectUrl) URL.revokeObjectURL(url);
      if (request === requestRef.current) {
        setLoading(false);
        setNotice('이미지를 불러오지 못했습니다. 다른 사진을 선택해 주세요.');
      }
    };
    image.src = url;
  };

  const onFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setNotice('이미지 파일을 선택해 주세요.');
      return;
    }
    loadImage(URL.createObjectURL(file), true);
  };

  const choosePiece = (id: number) => {
    setPuzzle((current) => (current ? { ...current, selected: id } : current));
    setNotice('이 조각이 들어갈 위치를 게임판에서 선택하세요.');
  };

  const placePiece = (slot: number, draggedId?: number) => {
    if (!puzzle || puzzle.completed || puzzle.placed[slot]) return;
    const id = draggedId ?? puzzle.selected;
    if (id == null || puzzle.placed[id]) {
      setNotice('먼저 오른쪽 조각 보관함에서 조각을 선택하세요.');
      return;
    }
    if (id !== slot) {
      setPuzzle({ ...puzzle, attempts: puzzle.attempts + 1, selected: id });
      setNotice('이 위치에는 맞지 않아요. 다른 칸을 선택해 보세요.');
      return;
    }
    const placed = [...puzzle.placed];
    placed[id] = true;
    const completed = placed.every(Boolean);
    setPuzzle({ ...puzzle, placed, selected: null, attempts: puzzle.attempts + 1, completed });
    if (completed) setCompletedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    setNotice(completed ? '퍼즐을 완성했습니다! 🎉' : '정답입니다! 다음 조각을 골라 보세요.');
  };

  const placedCount = puzzle?.placed.filter(Boolean).length ?? 0;

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', py: { xs: 2, md: 3 } }}
    >
      <Stack spacing={2} sx={{ maxWidth: 1220, mx: 'auto', pb: { xs: 8, md: 2 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              사진 직쏘 퍼즐
            </Typography>
            <Typography variant="body2" color="text.secondary">
              내 사진을 업로드하거나 예시 이미지로 바로 시작하세요.
            </Typography>
          </Box>
          {imageUrl && (
            <Button
              variant="outlined"
              onClick={() => {
                setImageUrl(null);
                setPuzzle(null);
                setNotice('');
              }}
            >
              다른 사진 선택
            </Button>
          )}
        </Stack>

        {!imageUrl ? (
          <Box sx={{ minHeight: 420 }}>
            <PhotoUploadWorkspace
              sampleImages={EXAMPLES}
              onSelectSample={(url) => loadImage(url)}
              onFileSelect={onFileSelect}
              title="퍼즐로 만들 사진 업로드"
              subtitle="사진을 선택하거나 이곳에 끌어 놓으세요. 예시 이미지 3장으로도 바로 플레이할 수 있습니다."
              sampleTitle="예시 이미지 3장"
              sampleSubtitle="사진 스튜디오처럼 원하는 사진을 클릭해 시작하세요."
              sampleActionLabel="퍼즐 시작 ➜"
              buttonText="내 사진 선택하기"
            />
            {(loading || notice) && (
              <Typography
                role="status"
                sx={{ mt: 2, color: loading ? 'text.secondary' : 'error.main' }}
              >
                {notice}
              </Typography>
            )}
          </Box>
        ) : (
          puzzle && (
            <>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant={size === value ? 'contained' : 'outlined'}
                      onClick={() => startPuzzle(value)}
                    >
                      {value} × {value}
                    </Button>
                  ))}
                  <Button variant="outlined" onClick={() => startPuzzle(size)}>
                    다시 섞기
                  </Button>
                  <Button variant="text" onClick={() => setShowGuide((value) => !value)}>
                    {showGuide ? '힌트 숨기기' : '힌트 보기'}
                  </Button>
                </Stack>
                <Typography fontWeight={700}>
                  {placedCount}/{size * size} 조각 · 시도 {puzzle.attempts}회 · <PuzzleClock startedAt={startedAt} completed={puzzle.completed} finalSeconds={completedSeconds} />
                </Typography>
              </Stack>
              <Typography
                role="status"
                sx={{ color: puzzle.completed ? 'success.main' : 'text.secondary', minHeight: 25 }}
              >
                {notice}
              </Typography>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={3}
                alignItems={{ xs: 'center', lg: 'flex-start' }}
              >
                <Card sx={{ width: '100%', maxWidth: 560, p: 1.5, borderRadius: 3, flexShrink: 0 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${size}, 1fr)`,
                      gridTemplateRows: `repeat(${size}, 1fr)`,
                      borderRadius: 2,
                      bgcolor: '#283446',
                      backgroundImage: showGuide
                        ? `linear-gradient(#15223899, #15223899), url("${imageUrl}")`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {puzzle.pieces.map((piece) => (
                      <Box
                        key={piece.id}
                        component="button"
                        type="button"
                        aria-label={`${piece.row + 1}행 ${piece.col + 1}열 ${puzzle.placed[piece.id] ? '완성' : '빈 칸'}`}
                        onClick={() => placePiece(piece.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const raw = event.dataTransfer.getData('application/x-jigsaw-piece');
                          if (raw !== '') {
                            const id = Number(raw);
                            if (Number.isInteger(id)) placePiece(piece.id, id);
                          }
                        }}
                        sx={{
                          minWidth: 0,
                          minHeight: 0,
                          position: 'relative',
                          border: puzzle.placed[piece.id] ? 'none' : '1px dashed #ffffff55',
                          bgcolor: 'transparent',
                          borderRadius: 1,
                          p: 0,
                          cursor: puzzle.placed[piece.id] ? 'default' : 'pointer',
                          overflow: 'visible',
                          '&:hover': puzzle.placed[piece.id] ? {} : { bgcolor: '#ffffff1c' },
                        }}
                      >
                        {puzzle.placed[piece.id] && (
                          <PieceArtwork piece={piece} size={size} imageUrl={imageUrl} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Card>
                <Stack spacing={2} sx={{ width: '100%', maxWidth: { xs: 560, lg: 420 } }}>
                  <Card sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                      원본 사진
                    </Typography>
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="퍼즐 원본 사진"
                      sx={{
                        display: 'block',
                      width: 180,
                      height: 180,
                      maxWidth: '100%',
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                  </Card>
                  <Card sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      조각 보관함
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      조각을 선택하고 맞는 칸을 누르거나 끌어 놓으세요.
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                        gap: 1.5,
                        mt: 2,
                        px: 1,
                        py: 1.5,
                        maxHeight: 460,
                        overflowY: 'auto',
                      }}
                    >
                      {puzzle.order
                        .filter((id) => !puzzle.placed[id])
                        .map((id) => (
                          <Box
                            key={id}
                            component="button"
                            type="button"
                            draggable
                            aria-label={`${puzzle.pieces[id].row + 1}행 ${puzzle.pieces[id].col + 1}열 조각 선택`}
                            aria-pressed={puzzle.selected === id}
                            onClick={() => choosePiece(id)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData('application/x-jigsaw-piece', String(id));
                              choosePiece(id);
                            }}
                            sx={{
                              aspectRatio: '1',
                              position: 'relative',
                              border:
                                puzzle.selected === id ? '3px solid #fbbf24' : '1px solid #d4d9e2',
                              borderRadius: 2,
                              bgcolor: '#e4eaf1',
                              cursor: 'grab',
                              p: 0,
                              overflow: 'visible',
                              zIndex: puzzle.selected === id ? 2 : 1,
                            }}
                          >
                            <PieceArtwork
                              piece={puzzle.pieces[id]}
                              size={size}
                              imageUrl={imageUrl}
                            />
                          </Box>
                        ))}
                    </Box>
                    {puzzle.completed && (
                      <Typography sx={{ mt: 2, color: 'success.main', fontWeight: 800 }}>
                        완성! {formatTime(completedSeconds)} 만에 맞췄어요.
                      </Typography>
                    )}
                  </Card>
                </Stack>
              </Stack>
            </>
          )
        )}
      </Stack>
    </DashboardContent>
  );
}
