'use client';

import type { SupportedLanguage } from '../types';

import { toast } from 'sonner';
import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import { speakText } from '../utils/speech-service';
import { translateText, detectLanguage } from '../utils/translation-service';

// ----------------------------------------------------------------------

export interface CountryTarget {
  id: string; // 고유 식별자 (중복 방지)
  code: string;
  name: string;
  nativeName: string;
  country: string;
  flag: string;
  region: 'asia' | 'europe' | 'americas' | 'mideast_africa';
}

export const ALL_MAJOR_TARGETS: CountryTarget[] = [
  // 1. 아시아 & 태평양 (17개국)
  {
    id: 'ja',
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    country: '일본',
    flag: '🇯🇵',
    region: 'asia',
  },
  {
    id: 'zh',
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    country: '중국',
    flag: '🇨🇳',
    region: 'asia',
  },
  {
    id: 'vi',
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    country: '베트남',
    flag: '🇻🇳',
    region: 'asia',
  },
  {
    id: 'th',
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    country: '태국',
    flag: '🇹🇭',
    region: 'asia',
  },
  {
    id: 'id',
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    country: '인도네시아',
    flag: '🇮🇩',
    region: 'asia',
  },
  {
    id: 'ms',
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    country: '말레이시아',
    flag: '🇲🇾',
    region: 'asia',
  },
  {
    id: 'tl',
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    country: '필리핀',
    flag: '🇵🇭',
    region: 'asia',
  },
  {
    id: 'hi',
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    country: '인도',
    flag: '🇮🇳',
    region: 'asia',
  },
  {
    id: 'mn',
    code: 'mn',
    name: 'Mongolian',
    nativeName: 'Монгол',
    country: '몽골',
    flag: '🇲🇳',
    region: 'asia',
  },
  {
    id: 'my',
    code: 'my',
    name: 'Burmese',
    nativeName: 'မြန်မာ',
    country: '미얀마',
    flag: '🇲🇲',
    region: 'asia',
  },
  {
    id: 'km',
    code: 'km',
    name: 'Khmer',
    nativeName: 'ខ្មែរ',
    country: '캄보디아',
    flag: '🇰🇭',
    region: 'asia',
  },
  {
    id: 'lo',
    code: 'lo',
    name: 'Lao',
    nativeName: 'ລາວ',
    country: '라오스',
    flag: '🇱🇦',
    region: 'asia',
  },
  {
    id: 'ne',
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    country: '네팔',
    flag: '🇳🇵',
    region: 'asia',
  },
  {
    id: 'bn',
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    country: '방글라데시',
    flag: '🇧🇩',
    region: 'asia',
  },
  {
    id: 'ur',
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    country: '파키스탄',
    flag: '🇵🇰',
    region: 'asia',
  },
  {
    id: 'kk',
    code: 'kk',
    name: 'Kazakh',
    nativeName: 'Қазақ',
    country: '카자흐스탄',
    flag: '🇰🇿',
    region: 'asia',
  },
  {
    id: 'uz',
    code: 'uz',
    name: 'Uzbek',
    nativeName: 'Oʻzbek',
    country: '우즈베키스탄',
    flag: '🇺🇿',
    region: 'asia',
  },

  // 2. 유럽 (20개국)
  {
    id: 'en-us',
    code: 'en',
    name: 'English',
    nativeName: 'English',
    country: '미국/영국',
    flag: '🇺🇸',
    region: 'europe',
  },
  {
    id: 'de',
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    country: '독일',
    flag: '🇩🇪',
    region: 'europe',
  },
  {
    id: 'fr',
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    country: '프랑스',
    flag: '🇫🇷',
    region: 'europe',
  },
  {
    id: 'es-es',
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    country: '스페인',
    flag: '🇪🇸',
    region: 'europe',
  },
  {
    id: 'it',
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    country: '이탈리아',
    flag: '🇮🇹',
    region: 'europe',
  },
  {
    id: 'ru',
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    country: '러시아',
    flag: '🇷🇺',
    region: 'europe',
  },
  {
    id: 'nl',
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    country: '네덜란드',
    flag: '🇳🇱',
    region: 'europe',
  },
  {
    id: 'pl',
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    country: '폴란드',
    flag: '🇵🇱',
    region: 'europe',
  },
  {
    id: 'sv',
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    country: '스웨덴',
    flag: '🇸🇪',
    region: 'europe',
  },
  {
    id: 'da',
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    country: '덴마크',
    flag: '🇩🇰',
    region: 'europe',
  },
  {
    id: 'fi',
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    country: '핀란드',
    flag: '🇫🇮',
    region: 'europe',
  },
  {
    id: 'no',
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    country: '노르웨이',
    flag: '🇳🇴',
    region: 'europe',
  },
  {
    id: 'cs',
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    country: '체코',
    flag: '🇨🇿',
    region: 'europe',
  },
  {
    id: 'el',
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    country: '그리스',
    flag: '🇬🇷',
    region: 'europe',
  },
  {
    id: 'hu',
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    country: '헝가리',
    flag: '🇭🇺',
    region: 'europe',
  },
  {
    id: 'uk',
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    country: '우크라이나',
    flag: '🇺🇦',
    region: 'europe',
  },
  {
    id: 'ro',
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    country: '루마니아',
    flag: '🇷🇴',
    region: 'europe',
  },
  {
    id: 'bg',
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    country: '불가리아',
    flag: '🇧🇬',
    region: 'europe',
  },
  {
    id: 'sk',
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    country: '슬로바키아',
    flag: '🇸🇰',
    region: 'europe',
  },
  {
    id: 'hr',
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    country: '크로아티아',
    flag: '🇭🇷',
    region: 'europe',
  },

  // 3. 아메리카 (2개국)
  {
    id: 'pt-br',
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    country: '브라질',
    flag: '🇧🇷',
    region: 'americas',
  },
  {
    id: 'es-mx',
    code: 'es',
    name: 'Spanish (LatAm)',
    nativeName: 'Español',
    country: '멕시코/중남미',
    flag: '🇲🇽',
    region: 'americas',
  },

  // 4. 중동 & 아프리카 (6개국)
  {
    id: 'ar',
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    country: '사우디/UAE',
    flag: '🇸🇦',
    region: 'mideast_africa',
  },
  {
    id: 'tr',
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    country: '튀르키예',
    flag: '🇹🇷',
    region: 'mideast_africa',
  },
  {
    id: 'he',
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    country: '이스라엘',
    flag: '🇮🇱',
    region: 'mideast_africa',
  },
  {
    id: 'fa',
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    country: '이란',
    flag: '🇮🇷',
    region: 'mideast_africa',
  },
  {
    id: 'sw',
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    country: '케냐/동아프리카',
    flag: '🇰🇪',
    region: 'mideast_africa',
  },
  {
    id: 'af',
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    country: '남아프리카',
    flag: '🇿🇦',
    region: 'mideast_africa',
  },
];

interface MultiTargetItem {
  id: string; // 고유 식별 키
  code: string;
  name: string;
  nativeName: string;
  country: string;
  flag: string;
  translatedText: string;
  loading: boolean;
  error?: string;
}

interface TranslatorMultiPanelProps {
  languages: SupportedLanguage[];
  initialText?: string;
}

export function TranslatorMultiPanel({ languages, initialText = '' }: TranslatorMultiPanelProps) {
  const [sourceText, setSourceText] = useState<string>(initialText);
  // 고유 id 기반의 선택 상태
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([
    'en-us',
    'ja',
    'zh',
    'es-es',
    'fr',
    'de',
    'vi',
    'ru',
  ]);
  const [results, setResults] = useState<MultiTargetItem[]>([]);
  const [isTranslatingAll, setIsTranslatingAll] = useState<boolean>(false);
  const [regionTab, setRegionTab] = useState<string>('asia');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 검색 및 지역 탭 필터링
  const filteredTargets = useMemo(
    () =>
      ALL_MAJOR_TARGETS.filter((t) => {
        const matchRegion = regionTab === 'all' || t.region === regionTab;
        const q = searchQuery.trim().toLowerCase();
        const matchSearch =
          !q ||
          t.country.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.nativeName.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q);
        return matchRegion && matchSearch;
      }),
    [regionTab, searchQuery]
  );

  // 대상 국가 선택 토글
  const handleToggleTarget = (id: string) => {
    setSelectedTargetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 프리셋 적용 함수
  const handleApplyPreset = (ids: string[]) => {
    setSelectedTargetIds(ids);
    toast.success(`${ids.length}개 국가가 선택되었습니다.`);
  };

  // 일괄 번역 실행
  const handleTranslateAll = async () => {
    const trimmed = sourceText.trim();
    if (!trimmed) {
      toast.warning('번역할 원문 텍스트를 입력해 주세요.');
      return;
    }
    if (selectedTargetIds.length === 0) {
      toast.warning('최소 1개 이상의 대상 국가를 선택해 주세요.');
      return;
    }

    setIsTranslatingAll(true);
    const sourceLang = detectLanguage(trimmed);

    // 초기 상태 세팅 (고유 id 기반)
    const initialItems: MultiTargetItem[] = selectedTargetIds.map((targetId) => {
      const match = ALL_MAJOR_TARGETS.find((d) => d.id === targetId);
      if (match) {
        return {
          id: match.id,
          code: match.code,
          name: match.name,
          nativeName: match.nativeName,
          country: match.country,
          flag: match.flag,
          translatedText: '',
          loading: true,
        };
      }
      // fallback
      const langFallback = languages.find((l) => l.code === targetId);
      return {
        id: targetId,
        code: targetId,
        name: langFallback?.name || targetId,
        nativeName: langFallback?.nativeName || targetId,
        country: langFallback?.name || targetId,
        flag: langFallback?.flagEmoji || '🌐',
        translatedText: '',
        loading: true,
      };
    });

    setResults(initialItems);

    // 병렬 번역 수행
    await Promise.all(
      initialItems.map(async (item) => {
        try {
          const res = await translateText(trimmed, { from: sourceLang, to: item.code });
          setResults((prev) =>
            prev.map((r) => (r.id === item.id ? { ...r, translatedText: res, loading: false } : r))
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '번역 실패';
          setResults((prev) =>
            prev.map((r) => (r.id === item.id ? { ...r, loading: false, error: msg } : r))
          );
        }
      })
    );

    setIsTranslatingAll(false);
    toast.success(`${selectedTargetIds.length}개국 동시 번역이 완료되었습니다.`);
  };

  // 개별 복사
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다.');
  };

  // 음성 듣기 (TTS)
  const handleSpeak = (text: string, langCode: string) => {
    if (!text.trim()) return;
    speakText(text, langCode);
  };

  // 전체 결과 일괄 마크다운 파일로 다운로드
  const handleDownloadAll = () => {
    if (results.length === 0) return;

    let content = `# 다국어 동시 번역 보고서\n\n`;
    content += `## [원문]\n${sourceText}\n\n---\n\n## [각국 언어별 번역 결과]\n\n`;

    results.forEach((r) => {
      content += `### ${r.flag} ${r.country} - ${r.nativeName} (${r.name} [${r.code}])\n${r.translatedText || '(번역 실패)'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi_translation_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('전체 번역 결과가 마크다운(.md) 파일로 다운로드되었습니다.');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. 상단 원문 입력 및 국가 선택 카드 */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[1],
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <PublicRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              다국어 동시 번역 (원문 입력 및 전 세계 대상 국가 선택)
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            disabled={isTranslatingAll || !sourceText.trim() || selectedTargetIds.length === 0}
            onClick={handleTranslateAll}
            startIcon={
              isTranslatingAll ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SendRoundedIcon />
              )
            }
            sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none', px: 2.5 }}
          >
            {isTranslatingAll
              ? `${selectedTargetIds.length}개국 번역 진행 중...`
              : `${selectedTargetIds.length}개국 동시 번역 실행`}
          </Button>
        </Box>

        <TextField
          multiline
          minRows={2}
          maxRows={3}
          fullWidth
          placeholder="전 세계 여러 국가 언어로 한 번에 동시 번역할 문장을 입력하세요. (예: 해외 지사 공지문, 글로벌 마케팅 카피, 바이어 안내)"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
          }}
        />

        {/* 퀵 프리셋 버튼 바 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 0.5 }}>
            ⚡ 추천 프리셋:
          </Typography>
          <Button
            size="small"
            variant="soft"
            color="primary"
            onClick={() =>
              handleApplyPreset(['en-us', 'ja', 'zh', 'de', 'fr', 'es-es', 'it', 'ru', 'vi', 'id'])
            }
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            G10 주요국 (10개국)
          </Button>
          <Button
            size="small"
            variant="soft"
            color="inherit"
            onClick={() => handleApplyPreset(['ja', 'zh'])}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            동아시아 (일본/중국)
          </Button>
          <Button
            size="small"
            variant="soft"
            color="inherit"
            onClick={() => handleApplyPreset(['vi', 'th', 'id', 'ms', 'tl'])}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            동남아 ASEAN (5개국)
          </Button>
          <Button
            size="small"
            variant="soft"
            color="inherit"
            onClick={() =>
              handleApplyPreset(['en-us', 'de', 'fr', 'es-es', 'it', 'nl', 'sv', 'pl'])
            }
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            유럽 핵심 (8개국)
          </Button>
          <Button
            size="small"
            variant="soft"
            color="inherit"
            onClick={() => handleApplyPreset(['pt-br', 'es-mx'])}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            중남미 (브라질/멕시코)
          </Button>
          <Button
            size="small"
            variant="soft"
            color="inherit"
            onClick={() => handleApplyPreset(['ar', 'tr', 'he', 'sw'])}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            중동 & 아프리카
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => handleApplyPreset(ALL_MAJOR_TARGETS.map((t) => t.id))}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', fontWeight: 700, py: 0.3 }}
          >
            전체 선택 ({ALL_MAJOR_TARGETS.length}개국)
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={() => setSelectedTargetIds([])}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem', py: 0.3 }}
          >
            선택 초기화
          </Button>
        </Box>

        {/* 대륙별 탭 & 검색 인풋 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            pt: 0.5,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tabs
            value={regionTab}
            onChange={(_, val) => setRegionTab(val)}
            sx={{
              minHeight: 32,
              '& .MuiTabs-scroller': {
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
              '& .MuiTab-root': {
                minHeight: 32,
                fontSize: '0.8rem',
                fontWeight: 700,
                py: 0.3,
                px: 1.2,
                borderRadius: 1,
              },
            }}
          >
            <Tab value="asia" label="아시아 & 태평양" />
            <Tab value="europe" label="유럽" />
            <Tab value="americas" label="아메리카" />
            <Tab value="mideast_africa" label="중동 & 아프리카" />
            <Tab value="all" label="전체 대륙" />
          </Tabs>

          <TextField
            size="small"
            placeholder="국가명 또는 언어 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { height: 32, fontSize: '0.8rem', borderRadius: 1.5 },
            }}
            sx={{ width: 190 }}
          />
        </Box>

        {/* 대상 국가 선택 칩 리스트 (고유 id 기반 key) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.8,
          }}
        >
          {filteredTargets.map((t) => {
            const isSelected = selectedTargetIds.includes(t.id);
            return (
              <Chip
                key={t.id}
                label={`${t.flag} ${t.country} (${t.nativeName})`}
                onClick={() => handleToggleTarget(t.id)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                size="small"
                icon={isSelected ? <CheckCircleRoundedIcon fontSize="small" /> : undefined}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  py: 1.5,
                }}
              />
            );
          })}
        </Box>
      </Card>

      {/* 2. 번역 결과 카드 그리드 영역 */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[1],
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              다국어 동시 번역 결과
            </Typography>
            {results.length > 0 && (
              <Chip
                label={`${results.length}개국 완료`}
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 800, borderRadius: 1 }}
              />
            )}
          </Box>

          {results.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadRoundedIcon fontSize="small" />}
              onClick={handleDownloadAll}
              sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
            >
              전체 국가 결과 보고서(.md) 저장
            </Button>
          )}
        </Box>

        {/* 결과 그리드 컨테이너 (고유 item.id 기반 key) */}
        <Box
          sx={{
            flex: '1 1 auto',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
              lg: '1fr 1fr 1fr 1fr',
            },
            gap: 1.5,
            alignContent: 'start',
            pr: 0.5,
          }}
        >
          {results.length === 0 ? (
            <Box
              sx={{
                gridColumn: '1 / -1',
                py: 8,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                아직 동시 번역 결과가 없습니다.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                상단에서 원하는 국가들을 선택하고 [동시 번역 실행] 버튼을 눌러보세요.
              </Typography>
            </Box>
          ) : (
            results.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                  minHeight: 140,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0.8,
                    }}
                  >
                    <Typography variant="h6" sx={{ lineHeight: 1 }}>
                      {item.flag}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {item.country}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
                      >
                        {item.nativeName} ({item.code.toUpperCase()})
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.3 }}>
                    <Tooltip title="복사">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(item.translatedText)}
                        disabled={!item.translatedText}
                        sx={{ borderRadius: 1 }}
                      >
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="음성 듣기">
                      <IconButton
                        size="small"
                        onClick={() => handleSpeak(item.translatedText, item.code)}
                        disabled={!item.translatedText}
                        sx={{ borderRadius: 1 }}
                      >
                        <VolumeUpRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ flex: '1 1 auto', overflowY: 'auto', maxHeight: 160 }}>
                  {item.loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        번역 변환 중...
                      </Typography>
                    </Box>
                  ) : item.error ? (
                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                      {item.error}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.translatedText}
                    </Typography>
                  )}
                </Box>
              </Card>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );
}
