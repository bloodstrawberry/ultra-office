'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { DashboardContent } from 'src/layouts/dashboard';

type Classic = {
  title: string;
  position: number;
  categories: string[];
  features: string[];
  ost: string[];
  highlights: number[];
};

const PAGE_SIZE = 50;

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase();

const matchesTerms = (values: string[], query: string) => {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const searchable = normalize(values.join(' '));

  return terms.every((term) => searchable.includes(term));
};

export function ClassicSearchView({ classics }: { classics: Classic[] }) {
  const [query, setQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [featureQuery, setFeatureQuery] = useState('');
  const [ostQuery, setOstQuery] = useState('');
  const [highlight, setHighlight] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const results = useMemo(
    () =>
      classics.filter(
        (classic) =>
          (highlight === 'all' || classic.highlights.includes(Number(highlight))) &&
          matchesTerms(
            [classic.title, ...classic.categories, ...classic.features, ...classic.ost],
            query
          ) &&
          matchesTerms(classic.categories, categoryQuery) &&
          matchesTerms(classic.features, featureQuery) &&
          matchesTerms(classic.ost, ostQuery)
      ),
    [classics, highlight, query, categoryQuery, featureQuery, ostQuery]
  );

  return (
    <DashboardContent sx={{ pb: 5, overflowY: { lg: 'auto' } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 800 }}>
          클래식 검색
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          전체 검색 또는 항목별 검색을 사용하고, 하이라이트 1~4의 수록 위치를 확인하세요. 여러
          필터를 함께 사용할 수 있습니다.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField
          fullWidth
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="곡명, 카테고리, 특징, OST 전체 검색"
          aria-label="클래식 검색어"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="하이라이트"
          value={highlight}
          onChange={(event) => {
            setHighlight(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          sx={{ minWidth: { sm: 170 } }}
        >
          <MenuItem value="all">전체</MenuItem>
          {[1, 2, 3, 4].map((number) => (
            <MenuItem key={number} value={String(number)}>
              하이라이트 {number}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          label="카테고리 내에서 검색"
          value={categoryQuery}
          onChange={(event) => {
            setCategoryQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
        />
        <TextField
          fullWidth
          label="특징 내에서 검색"
          value={featureQuery}
          onChange={(event) => {
            setFeatureQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
        />
        <TextField
          fullWidth
          label="OST 내에서 검색"
          value={ostQuery}
          onChange={(event) => {
            setOstQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
        />
      </Stack>

      <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }} aria-live="polite">
        검색 결과 {results.length}곡
      </Typography>

      {results.length === 0 ? (
        <Card variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            검색 결과가 없습니다. 다른 검색어를 입력해 보세요.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {results.slice(0, visibleCount).map((classic) => (
            <Card key={classic.title} variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ sm: 'flex-start' }}
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                  {String(classic.position).padStart(3, '0')}. {classic.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ flexShrink: 0 }}
                >
                  {classic.highlights.map((number) => (
                    <Chip
                      key={number}
                      label={`하이라이트 ${number}`}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                {classic.categories.map((category) => (
                  <Chip key={category} label={category} size="small" variant="outlined" />
                ))}
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                특징: {classic.features.join(' · ')}
              </Typography>
              {classic.ost.length > 0 && (
                <Box
                  sx={{ mt: 1.5, pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.main' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                    OST
                  </Typography>
                  {classic.ost.map((work) => (
                    <Typography key={work} variant="body2" sx={{ color: 'text.secondary' }}>
                      {work}
                    </Typography>
                  ))}
                </Box>
              )}
            </Card>
          ))}
          {visibleCount < results.length && (
            <Button
              variant="outlined"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              더 보기 ({Math.min(visibleCount, results.length)} / {results.length})
            </Button>
          )}
        </Stack>
      )}
    </DashboardContent>
  );
}
