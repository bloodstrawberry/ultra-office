'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { REGEX_PRESETS } from '../../util/utils/regex-library-utils';
import { TextAreaPanel } from '../../util/components/shared-text-area';
import { LineNumberTextField } from '../../util/components/line-number-text-field';

// ----------------------------------------------------------------------

export function RegexStudioTab() {
  const [regexTargetText, setRegexTargetText] = useState<string>(REGEX_PRESETS[0].sampleInput);
  const [regexPattern, setRegexPattern] = useState<string>(REGEX_PRESETS[0].pattern);
  const [activeFlags, setActiveFlags] = useState<string[]>(['g']);
  const [regexMode, setRegexMode] = useState<'extract' | 'replace'>('extract');
  const [replacementPattern, setReplacementPattern] = useState<string>(
    REGEX_PRESETS[0].sampleReplacement || ''
  );
  const [regexResultText, setRegexResultText] = useState<string>('');
  const [regexError, setRegexError] = useState<string>('');
  const [currentCompiledRegex, setCurrentCompiledRegex] = useState<RegExp | null>(null);
  const [showLibraryDrawer, setShowLibraryDrawer] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [regexSearchQuery, setRegexSearchQuery] = useState<string>('');

  // Compute live regex results
  useEffect(() => {
    if (!regexPattern) {
      setRegexError('');
      setRegexResultText('');
      setCurrentCompiledRegex(null);
      return;
    }

    try {
      const flagsStr = activeFlags.join('');
      const rx = new RegExp(regexPattern, flagsStr);
      setCurrentCompiledRegex(rx);
      setRegexError('');

      if (regexMode === 'extract') {
        const matches = Array.from(regexTargetText.matchAll(rx));
        if (matches.length === 0) {
          setRegexResultText('일치하는 항목이 없습니다.');
        } else {
          const list = matches.map((m, idx) => `[매칭 ${idx + 1}] ${m[0]}`);
          setRegexResultText(list.join('\n'));
        }
      } else {
        const replaced = regexTargetText.replace(rx, replacementPattern);
        setRegexResultText(replaced);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRegexError(msg);
      setCurrentCompiledRegex(null);
      setRegexResultText('');
    }
  }, [regexPattern, activeFlags, regexMode, replacementPattern, regexTargetText]);

  const toggleFlag = (flag: string) => {
    setActiveFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const categories = [
    '전체',
    '연락처/개인정보',
    '숫자/금융',
    '웹/네트워크',
    '텍스트/코드',
    '검증/보안',
    '문법/기초',
  ];

  const filteredPresets = REGEX_PRESETS.filter((p) => {
    const matchesCategory = selectedCategory === '전체' || p.category === selectedCategory;
    const query = regexSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.pattern.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: showLibraryDrawer ? { xs: '1fr', md: '1fr 340px' } : '1fr',
        gap: 2,
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
      }}
    >
      {/* Main Regex Editor Panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* Pattern & Flags Toolbar */}
        <Card
          sx={{
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              size="small"
              label="정규식 패턴 (RegExp)"
              placeholder="예: 01[016789]-?\d{3,4}-?\d{4}"
              value={regexPattern}
              onChange={(e) => setRegexPattern(e.target.value)}
              error={!!regexError}
              helperText={regexError}
              sx={{ flex: 1, minWidth: 260 }}
            />

            {/* Flags Chips */}
            <Box sx={{ display: 'flex', gap: 0.5, height: 40, alignItems: 'center' }}>
              {[
                { flag: 'g', label: 'g (전역)' },
                { flag: 'i', label: 'i (대소문자)' },
                { flag: 'm', label: 'm (여러줄)' },
                { flag: 's', label: 's (DotAll)' },
                { flag: 'u', label: 'u (유니코드)' },
              ].map(({ flag, label }) => {
                const isActive = activeFlags.includes(flag);
                return (
                  <Chip
                    key={flag}
                    label={label}
                    size="small"
                    clickable
                    onClick={() => toggleFlag(flag)}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700, height: 32 }}
                  />
                );
              })}
            </Box>

            <Button
              variant={regexMode === 'replace' ? 'contained' : 'outlined'}
              color="secondary"
              size="small"
              startIcon={<AutoFixHighRoundedIcon />}
              onClick={() => setRegexMode((m) => (m === 'extract' ? 'replace' : 'extract'))}
              sx={{ height: 40, flexShrink: 0 }}
            >
              {regexMode === 'replace' ? '치환 모드' : '추출 모드'}
            </Button>

            <Tooltip title={showLibraryDrawer ? '라이브러리 닫기' : '정규식 라이브러리 열기'}>
              <IconButton
                onClick={() => setShowLibraryDrawer((prev) => !prev)}
                sx={{ width: 40, height: 40 }}
              >
                <MenuBookRoundedIcon color={showLibraryDrawer ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
          </Box>

          {regexMode === 'replace' && (
            <TextField
              fullWidth
              size="small"
              label="치환할 패턴 (Replacement)"
              placeholder="예: $1-****-$2 또는 [MASKED]"
              value={replacementPattern}
              onChange={(e) => setReplacementPattern(e.target.value)}
            />
          )}
        </Card>

        {/* Target Text & Result Viewers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
          }}
        >
          <TextAreaPanel
            title="대상 텍스트 (실시간 하이라이트)"
            actions={
              <IconButton size="small" color="error" onClick={() => setRegexTargetText('')}>
                <DeleteSweepRoundedIcon fontSize="small" />
              </IconButton>
            }
          >
            <LineNumberTextField
              value={regexTargetText}
              onChange={setRegexTargetText}
              highlightRegex={currentCompiledRegex}
              placeholder="정규식을 테스트할 텍스트를 입력하세요..."
            />
          </TextAreaPanel>

          <TextAreaPanel
            title={
              regexMode === 'extract' ? '추출 결과 (Match List)' : '치환 결과 (Replaced Result)'
            }
            actions={
              <IconButton size="small" onClick={() => handleCopy(regexResultText)}>
                <ContentCopyRoundedIcon fontSize="small" />
              </IconButton>
            }
          >
            <LineNumberTextField
              value={regexResultText}
              readOnly
              placeholder="정규식 실행 결과가 여기에 표시됩니다..."
            />
          </TextAreaPanel>
        </Box>
      </Box>

      {/* Right Library Drawer */}
      {showLibraryDrawer && (
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              📚 실무 정규식 라이브러리 ({filteredPresets.length}개)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              총 {REGEX_PRESETS.length}종
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ flexShrink: 0 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="정규식 이름, 설명, 패턴 검색..."
              value={regexSearchQuery}
              onChange={(e) => setRegexSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: regexSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setRegexSearchQuery('')}>
                      <ClearRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8125rem' } }}
            />
          </Box>

          {/* Category Filter */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flexShrink: 0 }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                clickable
                onClick={() => setSelectedCategory(cat)}
                color={selectedCategory === cat ? 'primary' : 'default'}
                variant={selectedCategory === cat ? 'filled' : 'outlined'}
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 0.5, flexShrink: 0 }} />

          {/* Presets List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              pr: 0.5,
            }}
          >
            {filteredPresets.map((preset) => (
              <Card
                key={preset.id}
                variant="outlined"
                sx={{
                  flexShrink: 0,
                  p: 1.2,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                }}
                onClick={() => {
                  setRegexPattern(preset.pattern);
                  setRegexTargetText(preset.sampleInput);
                  if (preset.flags) {
                    setActiveFlags(preset.flags.split(''));
                  }
                  if (preset.sampleReplacement !== undefined) {
                    setReplacementPattern(preset.sampleReplacement);
                    setRegexMode('replace');
                  } else {
                    setRegexMode('extract');
                  }
                  toast.info(`${preset.name} 프리셋이 적용되었습니다.`);
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {preset.name}
                  </Typography>
                  <Chip
                    label={preset.category}
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  {preset.description}
                </Typography>
                {preset.sampleReplacement && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'secondary.main',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    치환: {preset.replaceDescription || preset.sampleReplacement}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'background.neutral',
                    p: 0.4,
                    borderRadius: 0.5,
                    display: 'block',
                    wordBreak: 'break-all',
                  }}
                >
                  /{preset.pattern}/{preset.flags}
                </Typography>
              </Card>
            ))}

            {filteredPresets.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  color: 'text.disabled',
                }}
              >
                <Typography variant="body2">일치하는 정규식 프리셋이 없습니다.</Typography>
              </Box>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
}
