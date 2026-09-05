'use client';

import type { SubtitleItem } from '../types';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

import { translateText, detectLanguage } from 'src/sections/translator/utils/translation-service';

import {
  subtitlesToSrt,
  downloadSubtitleFile,
  formatTimestampForDisplay,
} from '../utils/subtitle-processor';

// ----------------------------------------------------------------------

export type DualSubtitleMode = 'replace' | 'original_top' | 'translated_top';

export interface SubtitleTranslateDialogProps {
  open: boolean;
  onClose: () => void;
  subtitles: SubtitleItem[];
  onApply: (translatedSubtitles: SubtitleItem[]) => void;
}

// Popular language preset list
const POPULAR_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: '영어 (English)', flag: '🇺🇸' },
  { code: 'ja', name: '일본어 (日本語)', flag: '🇯🇵' },
  { code: 'zh', name: '중국어 (中文)', flag: '🇨🇳' },
  { code: 'es', name: '스페인어 (Español)', flag: '🇪🇸' },
  { code: 'fr', name: '프랑스어 (Français)', flag: '🇫🇷' },
  { code: 'de', name: '독일어 (Deutsch)', flag: '🇩🇪' },
  { code: 'vi', name: '베트남어 (Tiếng Việt)', flag: '🇻🇳' },
  { code: 'id', name: '인도네시아어 (Bahasa Indonesia)', flag: '🇮🇩' },
  { code: 'th', name: '태국어 (ไทย)', flag: '🇹🇭' },
  { code: 'ru', name: '러시아어 (Русский)', flag: '🇷🇺' },
  { code: 'it', name: '이탈리아어 (Italiano)', flag: '🇮🇹' },
  { code: 'pt', name: '포르투갈어 (Português)', flag: '🇧🇷' },
  { code: 'ar', name: '아랍어 (العربية)', flag: '🇸🇦' },
];

export function SubtitleTranslateDialog({
  open,
  onClose,
  subtitles,
  onApply,
}: SubtitleTranslateDialogProps) {
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [dualMode, setDualMode] = useState<DualSubtitleMode>('original_top');
  const [cardLayout, setCardLayout] = useState<'stacked' | 'sideBySide'>('stacked');
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'done' | 'pending'>('all');

  const abortRef = useRef<boolean>(false);

  // Initialize languages and detect source language when dialog opens
  useEffect(() => {
    if (open && subtitles.length > 0) {
      abortRef.current = false;
      const sampleText = subtitles.find((s) => s.text.trim().length > 0)?.text || '';
      if (sampleText) {
        const detected = detectLanguage(sampleText);
        if (detected === 'ko') {
          setTargetLang('en');
        } else if (detected === 'en') {
          setTargetLang('ko');
        }
      }
    }
  }, [open, subtitles]);

  // Clean up when dialog closes
  const handleCloseDialog = useCallback(() => {
    if (isTranslating) {
      abortRef.current = true;
      setIsTranslating(false);
    }
    onClose();
  }, [isTranslating, onClose]);

  // Swap source and target languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      toast.info('출발어가 "자동 감지"일 때는 언어를 맞바꿀 수 없습니다.');
      return;
    }
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  // Start Batch Translation
  const handleStartTranslation = async (onlyMissing = false) => {
    if (subtitles.length === 0) {
      toast.error('번역할 자막 항목이 없습니다.');
      return;
    }

    const itemsToTranslate = onlyMissing
      ? subtitles.filter((s) => !translatedMap[s.id] || !translatedMap[s.id].trim())
      : subtitles;

    if (itemsToTranslate.length === 0) {
      toast.info('번역할 대상 자막이 없습니다.');
      return;
    }

    setIsTranslating(true);
    abortRef.current = false;
    setProgress(0);

    const BATCH_SIZE = 3;
    let completedCount = 0;
    const totalCount = itemsToTranslate.length;

    for (let i = 0; i < totalCount; i += BATCH_SIZE) {
      if (abortRef.current) break;

      const chunk = itemsToTranslate.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(async (sub) => {
          if (abortRef.current) return;
          try {
            const translated = await translateText(sub.text, {
              from: sourceLang,
              to: targetLang,
            });
            setTranslatedMap((prev) => ({
              ...prev,
              [sub.id]: translated,
            }));
          } catch (err) {
            console.error(`Subtitle #${sub.id} translation failed:`, err);
            setTranslatedMap((prev) => ({
              ...prev,
              [sub.id]: prev[sub.id] || sub.text,
            }));
          } finally {
            completedCount += 1;
            setProgress(Math.round((completedCount / totalCount) * 100));
          }
        })
      );

      // Graceful delay between batches to respect free API limits
      if (i + BATCH_SIZE < totalCount && !abortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
    }

    setIsTranslating(false);
    if (!abortRef.current) {
      toast.success(`${completedCount}개 자막 번역이 완료되었습니다!`);
    } else {
      toast.info('번역이 중단되었습니다.');
    }
  };

  // Stop Translation
  const handleStopTranslation = () => {
    abortRef.current = true;
    setIsTranslating(false);
    toast.info('번역 중단 요청됨.');
  };

  // Translate a single item
  const handleTranslateSingle = async (sub: SubtitleItem) => {
    if (isTranslating) return;
    try {
      toast.info(`자막 번역 중...`);
      const res = await translateText(sub.text, {
        from: sourceLang,
        to: targetLang,
      });
      setTranslatedMap((prev) => ({ ...prev, [sub.id]: res }));
      toast.success('번역 완료');
    } catch (err) {
      console.error(err);
      toast.error('해당 문장 번역에 실패했습니다.');
    }
  };

  // Edit translated text manually
  const handleEditTranslation = (id: string, newText: string) => {
    setTranslatedMap((prev) => ({
      ...prev,
      [id]: newText,
    }));
  };

  // Clear all translations
  const handleClearAllTranslations = () => {
    setTranslatedMap({});
    setProgress(0);
    toast.info('번역 결과가 초기화되었습니다.');
  };

  // Filtered subtitle items for review
  const filteredSubtitles = useMemo(
    () =>
      subtitles.filter((sub) => {
        const trans = translatedMap[sub.id] || '';
        const isDone = Boolean(trans.trim());

        if (filterType === 'done' && !isDone) return false;
        if (filterType === 'pending' && isDone) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchOriginal = sub.text.toLowerCase().includes(q);
          const matchTrans = trans.toLowerCase().includes(q);
          if (!matchOriginal && !matchTrans) return false;
        }

        return true;
      }),
    [subtitles, translatedMap, filterType, searchQuery]
  );

  // Count metrics
  const translatedCount = useMemo(
    () => subtitles.filter((s) => Boolean(translatedMap[s.id]?.trim())).length,
    [subtitles, translatedMap]
  );

  // Apply translations to subtitle workspace
  const handleApplyToWorkspace = () => {
    if (translatedCount === 0) {
      toast.error('적용할 번역 결과가 없습니다. 먼저 번역을 실행해주세요.');
      return;
    }

    const updated = subtitles.map((sub) => {
      const trans = (translatedMap[sub.id] || '').trim();
      if (!trans) return sub;

      let finalText = trans;
      if (dualMode === 'original_top') {
        finalText = `${sub.text}\n${trans}`;
      } else if (dualMode === 'translated_top') {
        finalText = `${trans}\n${sub.text}`;
      }

      return {
        ...sub,
        text: finalText,
      };
    });

    onApply(updated);
    handleCloseDialog();
    toast.success(`${translatedCount}개의 번역 자막이 성공적으로 적용되었습니다.`);
  };

  // Export translated subtitles directly as SRT
  const handleExportAsSrt = () => {
    if (translatedCount === 0) {
      toast.error('내보낼 번역 결과가 없습니다.');
      return;
    }

    const exportedSubtitles = subtitles.map((sub) => {
      const trans = (translatedMap[sub.id] || '').trim() || sub.text;
      let finalText = trans;
      if (dualMode === 'original_top') {
        finalText = `${sub.text}\n${trans}`;
      } else if (dualMode === 'translated_top') {
        finalText = `${trans}\n${sub.text}`;
      }
      return {
        ...sub,
        text: finalText,
      };
    });

    const srtContent = subtitlesToSrt(exportedSubtitles);
    downloadSubtitleFile(srtContent, `translated_${targetLang}.srt`);
    toast.success(`'translated_${targetLang}.srt' 파일로 다운로드되었습니다.`);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          height: '88vh',
          maxHeight: 900,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* 1. Header */}
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.8,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TranslateRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              자막 다국어 자동 번역 (Auto Translate)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              전체 {subtitles.length}개 자막 구간을 원문과 1:1 비교하며 번역하고, 검토 후 바로
              자막에 적용합니다.
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={handleCloseDialog}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      {/* 2. Language Bar & Batch Translate Toolbar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: 'background.neutral',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Language Selector Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>출발어 (Source)</InputLabel>
              <Select
                value={sourceLang}
                label="출발어 (Source)"
                onChange={(e) => setSourceLang(e.target.value)}
              >
                <MenuItem value="auto">🌐 언어 자동 감지</MenuItem>
                {POPULAR_LANGUAGES.map((lang) => (
                  <MenuItem key={`src-${lang.code}`} value={lang.code}>
                    {lang.flag} {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="출발어와 도착어 맞바꾸기">
              <span>
                <IconButton
                  size="small"
                  onClick={handleSwapLanguages}
                  disabled={sourceLang === 'auto' || isTranslating}
                  sx={{ color: 'primary.main' }}
                >
                  <SwapHorizontalCircleRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>도착어 (Target)</InputLabel>
              <Select
                value={targetLang}
                label="도착어 (Target)"
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {POPULAR_LANGUAGES.map((lang) => (
                  <MenuItem key={`tgt-${lang.code}`} value={lang.code}>
                    {lang.flag} {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Translation Action Buttons */}
            {isTranslating ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopRoundedIcon />}
                onClick={handleStopTranslation}
              >
                번역 중단
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<TranslateRoundedIcon />}
                onClick={() => handleStartTranslation(false)}
              >
                전체 번역 시작 ({subtitles.length}개)
              </Button>
            )}

            {translatedCount > 0 && translatedCount < subtitles.length && !isTranslating && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleStartTranslation(true)}
              >
                미번역 항목만 번역 ({subtitles.length - translatedCount}개)
              </Button>
            )}

            {translatedCount > 0 && !isTranslating && (
              <Button
                size="small"
                variant="soft"
                color="inherit"
                onClick={handleClearAllTranslations}
                sx={{ fontSize: '0.75rem' }}
              >
                초기화
              </Button>
            )}
          </Box>

          {/* Quick Metrics */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              color={translatedCount === subtitles.length ? 'success' : 'default'}
              variant="soft"
              label={`번역 완료: ${translatedCount} / ${subtitles.length}`}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </Box>

        {/* Progress Bar when translating */}
        {isTranslating && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                문장별 번역 처리 중...
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ borderRadius: 1, height: 6 }}
            />
          </Box>
        )}
      </Box>

      {/* 3. Search & Filter Bar */}
      <Box
        sx={{
          px: 2.5,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={filterType === 'all' ? 'contained' : 'soft'}
            color={filterType === 'all' ? 'primary' : 'inherit'}
            onClick={() => setFilterType('all')}
            sx={{ py: 0.3, px: 1.2, fontSize: '0.75rem' }}
          >
            전체 ({subtitles.length})
          </Button>
          <Button
            size="small"
            variant={filterType === 'done' ? 'contained' : 'soft'}
            color={filterType === 'done' ? 'success' : 'inherit'}
            onClick={() => setFilterType('done')}
            sx={{ py: 0.3, px: 1.2, fontSize: '0.75rem' }}
          >
            번역 완료 ({translatedCount})
          </Button>
          <Button
            size="small"
            variant={filterType === 'pending' ? 'contained' : 'soft'}
            color={filterType === 'pending' ? 'warning' : 'inherit'}
            onClick={() => setFilterType('pending')}
            sx={{ py: 0.3, px: 1.2, fontSize: '0.75rem' }}
          >
            미번역 ({subtitles.length - translatedCount})
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* View Mode Toggle: Stacked vs Side-by-side */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 0.2,
              bgcolor: 'background.paper',
            }}
          >
            <Tooltip title="상하 2줄 보기 (원래 언어 / 번역된 언어 각 줄마다)">
              <IconButton
                size="small"
                color={cardLayout === 'stacked' ? 'primary' : 'default'}
                onClick={() => setCardLayout('stacked')}
                sx={{
                  borderRadius: 1,
                  bgcolor: cardLayout === 'stacked' ? 'action.selected' : 'transparent',
                  p: 0.5,
                }}
              >
                <ViewStreamRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="좌우 나란히 보기 (원래 언어 ➔ 번역된 언어)">
              <IconButton
                size="small"
                color={cardLayout === 'sideBySide' ? 'primary' : 'default'}
                onClick={() => setCardLayout('sideBySide')}
                sx={{
                  borderRadius: 1,
                  bgcolor: cardLayout === 'sideBySide' ? 'action.selected' : 'transparent',
                  p: 0.5,
                }}
              >
                <ViewColumnRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            size="small"
            placeholder="원문 또는 번역문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchRoundedIcon sx={{ fontSize: 18, mr: 0.8, color: 'text.disabled' }} />
              ),
            }}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Box>

      {/* 4. Comparison List View (어떤 문장이 어떻게 번역됐는지 알 수 있는 UI) */}
      <DialogContent
        sx={{
          p: 2.5,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: 'background.default',
        }}
      >
        {filteredSubtitles.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <TranslateRoundedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              조건에 맞는 자막 항목이 없습니다.
            </Typography>
          </Box>
        ) : (
          filteredSubtitles.map((sub) => {
            const hasTranslated = Boolean(translatedMap[sub.id]?.trim());
            const realIndex = subtitles.findIndex((s) => s.id === sub.id) + 1;

            return (
              <Card
                key={sub.id}
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 2,
                  borderColor: hasTranslated ? 'primary.light' : 'divider',
                  bgcolor: hasTranslated ? 'background.paper' : 'background.paper',
                  boxShadow: hasTranslated ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Segment Meta Bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={`#${realIndex}`}
                      color={hasTranslated ? 'primary' : 'default'}
                      sx={{ fontWeight: 800, height: 22, fontSize: '0.75rem' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        fontWeight: 700,
                      }}
                    >
                      {formatTimestampForDisplay(sub.startTime)} ➔{' '}
                      {formatTimestampForDisplay(sub.endTime)}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${Math.round((sub.endTime - sub.startTime) * 10) / 10}초`}
                      sx={{ height: 20, fontSize: '0.6875rem' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hasTranslated && (
                      <Chip
                        size="small"
                        color="success"
                        variant="soft"
                        label="번역 완료"
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700 }}
                      />
                    )}
                    <Tooltip title="이 문장만 다시 번역">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleTranslateSingle(sub)}
                          disabled={isTranslating}
                          sx={{ color: 'text.secondary' }}
                        >
                          <SyncRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Comparison Content: Stacked (상하 2줄: 원래 언어 / 번역된 언어) vs Side-by-side */}
                {cardLayout === 'stacked' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {/* Line 1: 원래 언어 (Original Language) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Chip
                          size="small"
                          label="원래 언어"
                          color="default"
                          variant="soft"
                          sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          {sourceLang === 'auto' ? '감지된 원문' : sourceLang.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                          border: 1,
                          borderColor: 'divider',
                          minHeight: 42,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: 1.5,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          {sub.text}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Line 2: 번역된 언어 (Translated Language, Editable) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Chip
                            size="small"
                            label="번역된 언어"
                            color="primary"
                            variant="soft"
                            sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: 'primary.main', fontWeight: 600 }}
                          >
                            {targetLang.toUpperCase()} (직접 수정 가능)
                          </Typography>
                        </Box>
                      </Box>
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder={
                          isTranslating
                            ? '번역 처리 중...'
                            : '전체 번역 시작을 누르면 번역된 언어가 여기에 표시됩니다.'
                        }
                        value={translatedMap[sub.id] ?? ''}
                        onChange={(e) => handleEditTranslation(sub.id, e.target.value)}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            bgcolor: hasTranslated ? 'background.paper' : 'transparent',
                          },
                        }}
                      />
                    </Box>

                    {/* Dual Subtitle Preview Bar when translated */}
                    {hasTranslated && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.2,
                          py: 0.6,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          border: 1,
                          borderColor: 'divider',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Chip
                          size="small"
                          label="이중 자막 각 줄 미리보기"
                          color="info"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: 'Pretendard, monospace, sans-serif',
                            lineHeight: 1.4,
                          }}
                        >
                          {dualMode === 'original_top'
                            ? `줄 1 (원래 언어): ${sub.text}  \n줄 2 (번역된 언어): ${translatedMap[sub.id]}`
                            : dualMode === 'translated_top'
                              ? `줄 1 (번역된 언어): ${translatedMap[sub.id]}  \n줄 2 (원래 언어): ${sub.text}`
                              : `번역문: ${translatedMap[sub.id]}`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  /* Side-by-side comparison columns */
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 36px 1fr' },
                      gap: 1.5,
                      alignItems: 'center',
                    }}
                  >
                    {/* Left Column: Original Sentence */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Chip
                          size="small"
                          label="원래 언어"
                          color="default"
                          variant="soft"
                          sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 700 }}
                        >
                          {sourceLang === 'auto' ? '원문' : sourceLang.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                          border: 1,
                          borderColor: 'divider',
                          minHeight: 52,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: 1.5,
                            fontSize: '0.875rem',
                          }}
                        >
                          {sub.text}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Middle Arrow */}
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: hasTranslated ? 'primary.main' : 'text.disabled',
                      }}
                    >
                      <ArrowForwardRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>

                    {/* Right Column: Translated Sentence (Editable) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Chip
                          size="small"
                          label="번역된 언어"
                          color="primary"
                          variant="soft"
                          sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'primary.main', fontWeight: 700 }}
                        >
                          {targetLang.toUpperCase()} (직접 수정 가능)
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder={
                          isTranslating
                            ? '번역 중...'
                            : '번역 시작 버튼을 누르면 번역된 언어가 여기에 표시됩니다.'
                        }
                        value={translatedMap[sub.id] ?? ''}
                        onChange={(e) => handleEditTranslation(sub.id, e.target.value)}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            bgcolor: hasTranslated ? 'background.paper' : 'transparent',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Card>
            );
          })
        )}
      </DialogContent>

      {/* 5. Subtitle Mode Options Bar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: 'background.neutral',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            자막 적용 방식:
          </Typography>
          <RadioGroup
            row
            value={dualMode}
            onChange={(e) => setDualMode(e.target.value as DualSubtitleMode)}
            sx={{ gap: 1 }}
          >
            <FormControlLabel
              value="original_top"
              control={<Radio size="small" />}
              label={
                <Typography
                  variant="body2"
                  sx={{ fontWeight: dualMode === 'original_top' ? 700 : 500 }}
                >
                  이중 자막 (줄 1: <strong>원래 언어</strong> + 줄 2: <strong>번역된 언어</strong>)
                </Typography>
              }
            />
            <FormControlLabel
              value="replace"
              control={<Radio size="small" />}
              label={
                <Typography variant="body2" sx={{ fontWeight: dualMode === 'replace' ? 700 : 500 }}>
                  번역문으로만 교체
                </Typography>
              }
            />
            <FormControlLabel
              value="translated_top"
              control={<Radio size="small" />}
              label={
                <Typography
                  variant="body2"
                  sx={{ fontWeight: dualMode === 'translated_top' ? 700 : 500 }}
                >
                  이중 자막 (줄 1: <strong>번역된 언어</strong> + 줄 2: <strong>원래 언어</strong>)
                </Typography>
              }
            />
          </RadioGroup>
        </Box>

        <Button
          size="small"
          variant="outlined"
          color="info"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleExportAsSrt}
          disabled={translatedCount === 0}
        >
          번역본 SRT 다운로드
        </Button>
      </Box>

      {/* 6. Footer Actions */}
      <DialogActions sx={{ px: 2.5, py: 1.8, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={handleCloseDialog}>
          취소
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyToWorkspace}
          disabled={translatedCount === 0}
        >
          번역 자막 작업창에 적용하기 ({translatedCount}개)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
