'use client';

import type { WorldCity } from '../utils/timezones';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { CountryFlag } from '../components/country-flag';
import { DEFAULT_WORLD_CITIES, ALL_AVAILABLE_CITIES } from '../utils/timezones';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'ultra_office_world_clock_cities_v2';

interface CityTimeInfo {
  timeStr: string;
  periodStr: string;
  dateStr: string;
  diffStr: string;
  isDay: boolean;
}

const CONTINENTS = [
  { key: 'all', label: '전체' },
  { key: 'asia', label: '아시아' },
  { key: 'europe', label: '유럽' },
  { key: 'america', label: '아메리카' },
  { key: 'mideast', label: '중동' },
  { key: 'oceania', label: '오세아니아' },
  { key: 'africa', label: '아프리카' },
];

export function WorldClockTab() {
  const [cities, setCities] = useState<WorldCity[]>(DEFAULT_WORLD_CITIES);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<WorldCity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeContinent, setActiveContinent] = useState<string>('all');

  // Hydration 안전한 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WorldCity[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((city) => {
            if (!city.countryCode) {
              const found = ALL_AVAILABLE_CITIES.find(
                (c) => c.id === city.id || c.timezone === city.timezone
              );
              return found ? { ...city, countryCode: found.countryCode } : city;
            }
            return city;
          });
          setCities(sanitized);
        }
      }
    } catch {
      // 파싱 실패 무시
    }
    setHasLoaded(true);
  }, []);

  // 변경 시 로컬스토리지 저장
  useEffect(() => {
    if (hasLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
      } catch {
        // 저장 실패 무시
      }
    }
  }, [cities, hasLoaded]);

  // 1초마다 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 도시별 시간 및 시차 계산 함수
  const getCityTimeInfo = useCallback(
    (timezone: string): CityTimeInfo => {
      try {
        const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        const parts = timeFormatter.formatToParts(now);
        const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || '';
        const hourStr = parts.find((p) => p.type === 'hour')?.value || '00';
        const minStr = parts.find((p) => p.type === 'minute')?.value || '00';
        const secStr = parts.find((p) => p.type === 'second')?.value || '00';

        const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
          timeZone: timezone,
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        });
        const dateStr = dateFormatter.format(now);

        const hour24Formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false,
        });
        const h24 = parseInt(hour24Formatter.format(now), 10);
        const isDay = h24 >= 6 && h24 < 18;

        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const getOffset = (tz: string) => {
          const d = new Date();
          const utcDate = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
          const tzDate = new Date(d.toLocaleString('en-US', { timeZone: tz }));
          return (tzDate.getTime() - utcDate.getTime()) / 3600000;
        };

        const localOffset = getOffset(localTz);
        const targetOffset = getOffset(timezone);
        const diff = targetOffset - localOffset;

        let diffStr = '로컬 기준 일치';
        if (diff > 0) {
          diffStr = `+${diff}시간`;
        } else if (diff < 0) {
          diffStr = `${diff}시간`;
        }

        return {
          timeStr: `${hourStr}:${minStr}:${secStr}`,
          periodStr: dayPeriod,
          dateStr,
          diffStr,
          isDay,
        };
      } catch {
        return {
          timeStr: '--:--:--',
          periodStr: '',
          dateStr: '',
          diffStr: '',
          isDay: true,
        };
      }
    },
    [now]
  );

  const handleAddCity = () => {
    if (!selectedCity) return;
    if (cities.some((c) => c.id === selectedCity.id)) return;
    setCities((prev) => [...prev, selectedCity]);
    setSelectedCity(null);
    setIsAdding(false);
  };

  const handleAddAllAvailable = () => {
    setCities(ALL_AVAILABLE_CITIES);
  };

  const handleDeleteCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const handleResetToDefault = () => {
    setCities(DEFAULT_WORLD_CITIES);
  };

  const availableOptions = ALL_AVAILABLE_CITIES.filter(
    (c) => !cities.some((active) => active.id === c.id)
  );

  // 검색 및 대륙 필터링
  const filteredCities = useMemo(
    () =>
      cities.filter((city) => {
        const matchesContinent = activeContinent === 'all' || city.continent === activeContinent;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          city.cityKo.toLowerCase().includes(q) ||
          city.countryKo.toLowerCase().includes(q) ||
          city.city.toLowerCase().includes(q);
        return matchesContinent && matchesQuery;
      }),
    [cities, activeContinent, searchQuery]
  );

  // Hydration 에러 방지
  if (!hasLoaded) {
    return <Box sx={{ flex: 1, minHeight: 400 }} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        py: 0.5,
      }}
    >
      {/* 1. 상단 툴바: 통계 & 액션 버튼 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <PublicRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
            세계 도시 ({cities.length}개국)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
          {cities.length < ALL_AVAILABLE_CITIES.length && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleAddAllAvailable}
              sx={{ fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
            >
              전체 국가 불러오기 ({ALL_AVAILABLE_CITIES.length})
            </Button>
          )}

          <Button
            size="small"
            color="inherit"
            onClick={handleResetToDefault}
            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
          >
            기본값
          </Button>

          {!isAdding && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon />}
              onClick={() => setIsAdding(true)}
              sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 800 }}
            >
              도시 추가
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. 대륙별 퀵 필터 칩 & 검색창 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
            '::-webkit-scrollbar': { height: 4 },
          }}
        >
          {CONTINENTS.map((c) => {
            const count =
              c.key === 'all'
                ? cities.length
                : cities.filter((city) => city.continent === c.key).length;

            return (
              <Chip
                key={c.key}
                label={`${c.label} (${count})`}
                onClick={() => setActiveContinent(c.key)}
                color={activeContinent === c.key ? 'primary' : 'default'}
                variant={activeContinent === c.key ? 'filled' : 'outlined'}
                size="small"
                clickable
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 1.5,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </Box>

        {/* 실시간 검색창 */}
        <TextField
          size="small"
          placeholder="도시 또는 국가명으로 빠른 필터링... (예: 서울, 도쿄, 뉴욕)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              style: { borderRadius: 10, fontSize: '0.85rem' },
            },
          }}
        />
      </Box>

      {/* 3. 도시 추가 폼 */}
      {isAdding && (
        <Card
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: 'background.neutral',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            borderRadius: 2,
          }}
        >
          <Autocomplete
            fullWidth
            size="small"
            options={availableOptions}
            getOptionLabel={(option) => `${option.cityKo} (${option.countryKo})`}
            value={selectedCity}
            onChange={(_, newValue) => setSelectedCity(newValue)}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
              >
                <CountryFlag countryCode={option.countryCode} flagEmoji={option.flag} size={28} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {option.cityKo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.countryKo}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} placeholder="추가할 도시/국가를 검색하세요..." autoFocus />
            )}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            size="medium"
            onClick={handleAddCity}
            disabled={!selectedCity}
            sx={{ borderRadius: 1.5, whiteSpace: 'nowrap', fontWeight: 800 }}
          >
            추가
          </Button>
          <Button
            size="medium"
            color="inherit"
            onClick={() => {
              setIsAdding(false);
              setSelectedCity(null);
            }}
            sx={{ borderRadius: 1.5 }}
          >
            취소
          </Button>
        </Card>
      )}

      {/* 4. 도시 카드 그리드 (국기 상단 + 시간 하단 레이아웃) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 1.75,
          pr: 0.5,
        }}
      >
        {filteredCities.map((city) => {
          const info = getCityTimeInfo(city.timezone);

          return (
            <Card
              key={city.id}
              variant="outlined"
              sx={{
                p: 2.25,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.customShadows?.z4,
                  '& .delete-city-btn': { opacity: 1 },
                },
              }}
            >
              {/* 상단: 국기 & 도시명/국가명 & 낮/밤 아이콘 & 삭제 버튼 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                {/* 국기 + 도시/국가 정보 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <CountryFlag countryCode={city.countryCode} flagEmoji={city.flag} size={46} />

                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontSize: '1.15rem',
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {city.cityKo}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, fontSize: '0.8rem', mt: 0.3 }}
                    >
                      {city.countryKo}
                    </Typography>
                  </Box>
                </Box>

                {/* 낮/밤 아이콘 & 삭제 버튼 */}
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.6,
                      borderRadius: 1.2,
                      bgcolor: info.isDay ? 'warning.lighter' : 'info.lighter',
                      color: info.isDay ? 'warning.main' : 'info.main',
                    }}
                    title={info.isDay ? '낮 시간' : '밤 시간'}
                  >
                    {info.isDay ? (
                      <WbSunnyRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <NightsStayRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>

                  {cities.length > 1 && (
                    <IconButton
                      className="delete-city-btn"
                      size="small"
                      onClick={() => handleDeleteCity(city.id)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        color: 'text.secondary',
                        p: 0.6,
                        '&:hover': { color: 'error.main' },
                      }}
                      title="도시 삭제"
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* 국기 아래: 큰 디지털 시간 디스플레이 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: 1,
                  my: 0.75,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.9rem',
                  }}
                >
                  {info.periodStr}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: '2rem',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {info.timeStr}
                </Typography>
              </Box>

              {/* 하단: 시차 및 날짜 정보 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 1.5,
                  pt: 1.25,
                  borderTop: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    px: 1,
                    py: 0.35,
                    borderRadius: 0.8,
                    fontSize: '0.75rem',
                    bgcolor: info.diffStr.includes('-')
                      ? 'warning.lighter'
                      : info.diffStr.includes('+')
                        ? 'info.lighter'
                        : 'success.lighter',
                    color: info.diffStr.includes('-')
                      ? 'warning.darker'
                      : info.diffStr.includes('+')
                        ? 'info.darker'
                        : 'success.darker',
                  }}
                >
                  {info.diffStr}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  {info.dateStr}
                </Typography>
              </Box>
            </Card>
          );
        })}

        {filteredCities.length === 0 && (
          <Box
            sx={{
              gridColumn: '1 / -1',
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              검색 조건에 맞는 도시가 없습니다.
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setSearchQuery('');
                setActiveContinent('all');
              }}
            >
              필터 초기화
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
