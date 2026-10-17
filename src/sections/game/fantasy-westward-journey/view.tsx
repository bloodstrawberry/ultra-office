'use client';

import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { STORY_ACTS, getStoryAct, STORY_WIKI_URL } from './story-acts';
import {
  getSpeakerColor,
  getSpeakerAvatar,
  getSpeakerInitials,
  SPEAKER_IMAGE_SOURCE_URL,
} from './speaker-avatars';

type ScreenplayTurn = {
  order: number;
  speaker: string | null;
  text: string | null;
  kind: 'dialogue' | 'narration';
  source_match: string;
};

type ScreenplayStory = {
  id: string;
  story_event_id: string;
  story_order: number;
  title: string;
  source_reference: string | null;
  turn_count: number;
  turns: ScreenplayTurn[];
};

type TurnGroup = {
  speaker: string | null;
  kind: ScreenplayTurn['kind'];
  turns: ScreenplayTurn[];
};

const STORIES_PER_PAGE = 12;

function excerpt(text: string, maxLength = 80) {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  return singleLine.length > maxLength ? `${singleLine.slice(0, maxLength)}…` : singleLine;
}

function storyMatches(story: ScreenplayStory, query: string) {
  if (!query) return true;
  return (
    story.title.toLocaleLowerCase().includes(query) ||
    story.story_event_id.includes(query) ||
    story.turns.some(
      (turn) =>
        turn.speaker?.toLocaleLowerCase().includes(query) ||
        turn.text?.toLocaleLowerCase().includes(query)
    )
  );
}

function groupTurns(turns: ScreenplayTurn[]): TurnGroup[] {
  const groups: TurnGroup[] = [];

  [...turns]
    .sort((first, second) => first.order - second.order)
    .forEach((turn) => {
      const last = groups[groups.length - 1];
      if (last && last.kind === turn.kind && last.speaker === turn.speaker) {
        last.turns.push(turn);
      } else {
        groups.push({ speaker: turn.speaker, kind: turn.kind, turns: [turn] });
      }
    });

  return groups;
}

function highlight(text: string, query: string) {
  if (!query) return text;

  const lowered = text.toLocaleLowerCase();
  const parts: React.ReactNode[] = [];
  let offset = 0;
  let matchIndex = lowered.indexOf(query);

  while (matchIndex !== -1) {
    if (matchIndex > offset) parts.push(text.slice(offset, matchIndex));
    parts.push(
      <Box
        component="mark"
        key={matchIndex}
        sx={{ bgcolor: 'warning.light', color: 'text.primary', borderRadius: 0.5 }}
      >
        {text.slice(matchIndex, matchIndex + query.length)}
      </Box>
    );
    offset = matchIndex + query.length;
    matchIndex = lowered.indexOf(query, offset);
  }

  if (offset < text.length) parts.push(text.slice(offset));
  return parts;
}

export function FantasyWestwardJourneyView() {
  const [stories, setStories] = useState<ScreenplayStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedAct, setSelectedAct] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/fantasy-westward-journey/dialogue_screenplay.json`,
      { signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) throw new Error('대본 데이터를 불러오지 못했습니다.');
        return response.json() as Promise<ScreenplayStory[]>;
      })
      .then((data) =>
        setStories(data.sort((first, second) => first.story_order - second.story_order))
      )
      .catch((fetchError: unknown) => {
        if (fetchError instanceof Error && fetchError.name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredStories = useMemo(
    () =>
      stories.filter(
        (story) =>
          (selectedAct === null || getStoryAct(story.story_order).number === selectedAct) &&
          storyMatches(story, normalizedQuery)
      ),
    [stories, selectedAct, normalizedQuery]
  );
  const selectedStory =
    filteredStories.find((story) => story.id === selectedId) ?? filteredStories[0];
  const selectedIndex = selectedStory
    ? filteredStories.findIndex((story) => story.id === selectedStory.id)
    : -1;
  const storyPage = Math.floor(Math.max(selectedIndex, 0) / STORIES_PER_PAGE) + 1;
  const storyPageCount = Math.ceil(filteredStories.length / STORIES_PER_PAGE);
  const visibleStories = filteredStories.slice(
    (storyPage - 1) * STORIES_PER_PAGE,
    storyPage * STORIES_PER_PAGE
  );
  const turnsCount = useMemo(
    () => stories.reduce((count, story) => count + story.turns.length, 0),
    [stories]
  );
  const actCounts = useMemo(
    () =>
      STORY_ACTS.map(
        (act) =>
          stories.filter((story) => getStoryAct(story.story_order).number === act.number).length
      ),
    [stories]
  );
  const currentAct = selectedStory ? getStoryAct(selectedStory.story_order) : null;
  const groupedTurns = useMemo(
    () => (selectedStory ? groupTurns(selectedStory.turns) : []),
    [selectedStory]
  );

  function selectStory(story: ScreenplayStory, scrollToDetail = true) {
    setSelectedId(story.id);
    if (scrollToDetail) {
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
    }
  }

  function selectAct(actNumber: number | null) {
    setSelectedAct(actNumber);
    setSelectedId(null);
    listRef.current?.scrollTo({ top: 0 });
  }

  return (
    <DashboardContent
      maxWidth="xl"
      sx={(theme) => ({
        [theme.breakpoints.up('lg')]: {
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehaviorY: 'contain',
        },
      })}
    >
      <Stack spacing={3} sx={{ pb: 5 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            환상서유기 대본
          </Typography>
          <Typography color="text.secondary">
            위키의 6막 구성으로 이야기를 찾고, 등장인물의 대본을 순서대로 읽어보세요.
          </Typography>
        </Box>

        <Card sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h5">막별 이야기</Typography>
              <Typography variant="body2" color="text.secondary">
                막을 선택하면 해당 구간의 이야기와 대사만 볼 수 있습니다.
              </Typography>
            </Box>
            <Button href={STORY_WIKI_URL} target="_blank" rel="noopener noreferrer" size="small">
              이야기 위키 보기 ↗
            </Button>
          </Stack>
          <Button
            variant={selectedAct === null ? 'contained' : 'outlined'}
            color={selectedAct === null ? 'primary' : 'inherit'}
            aria-pressed={selectedAct === null}
            onClick={() => selectAct(null)}
            sx={{ mb: 2 }}
          >
            전체 이야기 · {stories.length}개
          </Button>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1.5,
            }}
          >
            {STORY_ACTS.map((act, index) => (
              <Button
                key={act.number}
                variant={selectedAct === act.number ? 'contained' : 'outlined'}
                color={selectedAct === act.number ? 'primary' : 'inherit'}
                aria-pressed={selectedAct === act.number}
                onClick={() => selectAct(act.number)}
                sx={{ p: 2, alignItems: 'flex-start', textAlign: 'left', textTransform: 'none' }}
              >
                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                  <Typography variant="overline" sx={{ lineHeight: 1.5, opacity: 0.8 }}>
                    {act.number}막 · {actCounts[index]}개 이야기
                  </Typography>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.35 }}>
                    {act.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {act.summary}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Box>
        </Card>

        <Card sx={{ p: { xs: 2, md: 3 } }}>
          <TextField
            fullWidth
            label="이야기 제목·화자·대사 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedId(null);
              listRef.current?.scrollTo({ top: 0 });
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label={`${stories.length.toLocaleString()}개 이야기`} size="small" />
            <Chip label={`${turnsCount.toLocaleString()}개 대사 순서`} size="small" />
            <Chip label={`현재 목록 ${filteredStories.length.toLocaleString()}개`} size="small" />
            {normalizedQuery && (
              <Button
                size="small"
                onClick={() => {
                  setQuery('');
                  setSelectedId(null);
                }}
              >
                검색 지우기
              </Button>
            )}
          </Stack>
        </Card>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress aria-label="대본 데이터 불러오는 중" />
          </Box>
        )}
        {error && (
          <Alert severity="error">
            대본 데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.
          </Alert>
        )}
        {!loading && !error && filteredStories.length === 0 && (
          <Alert severity="info">
            해당하는 이야기가 없습니다. 다른 막을 선택하거나 검색어를 바꿔 주세요.
          </Alert>
        )}

        {!loading && !error && selectedStory && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(290px, 350px) minmax(0, 1fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Card
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                maxHeight: { xs: 380, md: 'calc(100dvh - 32px)' },
                position: { md: 'sticky' },
                top: { md: 16 },
              }}
            >
              <Typography variant="h6">이야기 목록</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {selectedIndex + 1} / {filteredStories.length}번째 이야기
              </Typography>
              <Box ref={listRef} sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>
                <Stack spacing={1}>
                  {visibleStories.map((story) => {
                    const matchingTurn = story.turns.find(
                      (turn) =>
                        turn.text?.toLocaleLowerCase().includes(normalizedQuery) ||
                        turn.speaker?.toLocaleLowerCase().includes(normalizedQuery)
                    );
                    const preview =
                      matchingTurn?.text ?? story.turns.find((turn) => turn.text)?.text;
                    return (
                      <Button
                        key={story.id}
                        onClick={() => selectStory(story)}
                        variant={story.id === selectedStory.id ? 'contained' : 'outlined'}
                        color={story.id === selectedStory.id ? 'primary' : 'inherit'}
                        sx={{
                          width: '100%',
                          p: 1.5,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          textTransform: 'none',
                        }}
                      >
                        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                            {selectedAct === null &&
                              `${getStoryAct(story.story_order).number}막 · `}
                            {story.story_order}. {story.title}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {story.turns.length}개 대사{preview ? ` · ${excerpt(preview, 48)}` : ''}
                          </Typography>
                        </Stack>
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
              {storyPageCount > 1 && (
                <Pagination
                  count={storyPageCount}
                  page={storyPage}
                  onChange={(_, page) => {
                    selectStory(filteredStories[(page - 1) * STORIES_PER_PAGE], false);
                    listRef.current?.scrollTo({ top: 0 });
                  }}
                  size="small"
                  sx={{ mt: 1.5, '& .MuiPagination-ul': { justifyContent: 'center' } }}
                />
              )}
            </Card>

            <Card ref={detailRef} sx={{ p: { xs: 2, md: 3 }, minWidth: 0, scrollMarginTop: 16 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                {currentAct && (
                  <Chip label={`${currentAct.number}막 · ${currentAct.title}`} size="small" />
                )}
                <Chip label={`이야기 ${selectedStory.story_order}`} color="primary" size="small" />
                <Chip label={`${selectedStory.turns.length}개 대사`} size="small" />
              </Stack>
              <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                {selectedStory.title}
              </Typography>
              {selectedStory.source_reference && (
                <Button
                  href={selectedStory.source_reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ mt: 1, mb: 1, px: 0 }}
                >
                  원본 스토리 보기 ↗
                </Button>
              )}
              <Divider sx={{ my: 2 }} />

              {selectedStory.turns.length === 0 ? (
                <Alert severity="info">이 이야기에는 확인된 대사가 없습니다.</Alert>
              ) : (
                <Stack spacing={2}>
                  {groupedTurns.map((group) => {
                    const firstOrder = group.turns[0].order;
                    if (group.kind === 'narration') {
                      return (
                        <Box
                          key={`narration-${firstOrder}`}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            장면 설명
                          </Typography>
                          {group.turns.map((turn) => (
                            <Typography
                              key={turn.order}
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.75, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                            >
                              {turn.text
                                ? highlight(turn.text, normalizedQuery)
                                : '원문 내용 미확인'}
                            </Typography>
                          ))}
                        </Box>
                      );
                    }

                    return (
                      <Stack
                        key={`dialogue-${firstOrder}`}
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Avatar
                          variant="rounded"
                          src={getSpeakerAvatar(group.speaker)}
                          alt={group.speaker ?? '화자 미상'}
                          title={group.speaker ?? '화자 미상'}
                          sx={{
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 },
                            flexShrink: 0,
                            borderRadius: 2,
                            border: 2,
                            borderColor: getSpeakerAvatar(group.speaker)
                              ? 'divider'
                              : 'transparent',
                            bgcolor: getSpeakerColor(group.speaker),
                            color: 'common.white',
                            fontSize: 17,
                            fontWeight: 700,
                            '& .MuiAvatar-img': {
                              objectFit: 'contain',
                              imageRendering: 'pixelated',
                            },
                          }}
                        >
                          {getSpeakerInitials(group.speaker)}
                        </Avatar>
                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                            p: { xs: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: 'background.neutral',
                            border: 1,
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            color="primary.main"
                            sx={{ mb: 0.75, fontWeight: 700 }}
                          >
                            {group.speaker ?? '화자 미상'}
                          </Typography>
                          <Stack spacing={1}>
                            {group.turns.map((turn) => (
                              <Box key={turn.order}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    lineHeight: 1.75,
                                    whiteSpace: 'pre-wrap',
                                    overflowWrap: 'anywhere',
                                  }}
                                >
                                  {turn.text
                                    ? highlight(turn.text, normalizedQuery)
                                    : '원문 대사 미확인'}
                                </Typography>
                                {!turn.text && (
                                  <Chip
                                    label="원문 미확인"
                                    size="small"
                                    color="warning"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                캐릭터 이미지 출처:{' '}
                <Box
                  component="a"
                  href={SPEAKER_IMAGE_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main' }}
                >
                  환상서유기 온라인 위키
                </Box>
              </Typography>

              <Divider sx={{ my: 3 }} />
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Button
                  disabled={selectedIndex <= 0}
                  onClick={() => selectStory(filteredStories[selectedIndex - 1])}
                >
                  ← 이전 이야기
                </Button>
                <Button
                  disabled={selectedIndex >= filteredStories.length - 1}
                  onClick={() => selectStory(filteredStories[selectedIndex + 1])}
                >
                  다음 이야기 →
                </Button>
              </Stack>
            </Card>
          </Box>
        )}
      </Stack>
    </DashboardContent>
  );
}
