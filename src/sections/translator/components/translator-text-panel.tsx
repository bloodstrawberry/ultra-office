'use client';

import type { SupportedLanguage, TranslationHistoryItem } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CircularProgress from '@mui/material/CircularProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { speakText } from '../utils/speech-service';
import { TranslatorSplitResizer } from './translator-split-resizer';
import { translateText, detectLanguage } from '../utils/translation-service';

// ----------------------------------------------------------------------

const STORAGE_KEY_SPLIT_RATIO = 'uo_translator_text_split_ratio';

interface TranslatorTextPanelProps {
  languages: SupportedLanguage[];
  onAddHistory: (item: Omit<TranslationHistoryItem, 'id' | 'timestamp'>) => void;
  initialSourceText?: string;
}

export function TranslatorTextPanel({
  languages,
  onAddHistory,
  initialSourceText = '',
}: TranslatorTextPanelProps) {
  const router = useRouter();

  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [sourceText, setSourceText] = useState<string>(initialSourceText);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [detectedLangCode, setDetectedLangCode] = useState<string>('ko');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // 너비 조절 리사이저 상태
  const [splitRatio, setSplitRatio] = useState<number>(50); // 좌측 원문 너비 비율 (%)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasLoadedSplit, setHasLoadedSplit] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 음성 인식 컨트롤러 참조
  const speechRecognizerRef = useRef<{ stop: () => void } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬스토리지에서 너비 비율 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPLIT_RATIO);
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 20 && num <= 80) {
          setSplitRatio(num);
        }
      }
    } catch {
      // ignore
    }
    setHasLoadedSplit(true);
  }, []);

  // 너비 비율 변경 시 로컬스토리지 동기화
  useEffect(() => {
    if (hasLoadedSplit) {
      try {
        localStorage.setItem(STORAGE_KEY_SPLIT_RATIO, String(Math.round(splitRatio)));
      } catch {
        // ignore
      }
    }
  }, [splitRatio, hasLoadedSplit]);

  // 리사이즈 드래그 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleResetSplit = useCallback(() => {
    setSplitRatio(50);
  }, []);

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        const offsetX = e.clientX - rect.left;
        const ratio = (offsetX / rect.width) * 100;
        const clamped = Math.min(Math.max(ratio, 20), 80);
        setSplitRatio(clamped);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // initialSourceText 변경 시 반영
  useEffect(() => {
    if (initialSourceText) {
      setSourceText(initialSourceText);
    }
  }, [initialSourceText]);

  // 언어 자동 감지
  useEffect(() => {
    if (sourceLang === 'auto' && sourceText.trim()) {
      const detected = detectLanguage(sourceText);
      setDetectedLangCode(detected);
    }
  }, [sourceLang, sourceText]);

  // 번역 실행 함수
  const handleTranslate = useCallback(
    async (textToTranslate: string) => {
      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setTranslatedText('');
        return;
      }

      setLoading(true);
      try {
        const actualFrom = sourceLang === 'auto' ? detectedLangCode : sourceLang;
        const result = await translateText(trimmed, {
          from: actualFrom,
          to: targetLang,
        });
        setTranslatedText(result);
        setIsFavorite(false);

        // 번역 기록 추가
        onAddHistory({
          sourceLang: actualFrom,
          targetLang,
          sourceText: trimmed,
          translatedText: result,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '번역 중 오류가 발생했습니다.';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [sourceLang, detectedLangCode, targetLang, onAddHistory]
  );

  // 디바운스 자동 번역 (텍스트 입력 시 800ms)
  const handleSourceTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSourceText(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        handleTranslate(val);
      }, 700);
    } else {
      setTranslatedText('');
    }
  };

  // 언어 교환 (Swap)
  const handleSwapLanguages = () => {
    const currentFrom = sourceLang === 'auto' ? detectedLangCode : sourceLang;
    const currentTo = targetLang;

    setSourceLang(currentTo);
    setTargetLang(currentFrom);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // 클립보드 복사
  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다.');
  };

  // 음성 듣기 (TTS)
  const handleSpeak = (text: string, langCode: string) => {
    if (!text.trim()) return;
    const actualLang = langCode === 'auto' ? detectedLangCode : langCode;
    speakText(text, actualLang);
  };

  // 텍스트 파일로 다운로드
  const handleDownloadText = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_${targetLang}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('번역 결과가 파일로 다운로드되었습니다.');
  };

  // 워드 프로세서(DocMaster)로 전송
  const handleSendToDocMaster = () => {
    if (!translatedText) return;
    try {
      localStorage.setItem('docmaster_incoming_text', translatedText);
      toast.success('워드 프로세서로 번역 텍스트를 전달하였습니다. 워드로 이동합니다.');
      router.push(paths.docMaster);
    } catch {
      toast.error('워드 프로세서 전송 실패');
    }
  };

  // 음성 인식 (STT) 토글
  const handleToggleSpeech = () => {
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const actualLang =
      sourceLang === 'auto' ? 'ko-KR' : `${sourceLang}-${sourceLang.toUpperCase()}`;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('현재 브라우저에서 마이크 음성 인식을 지원하지 않습니다.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = actualLang;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setSourceText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('음성 인식 중 오류가 발생했습니다.');
      };

      recognition.start();
      speechRecognizerRef.current = recognition;
      setIsRecording(true);
      toast.info('마이크 음성을 듣고 있습니다...');
    } catch {
      toast.error('마이크에 접근할 수 없습니다.');
    }
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
      {/* 1. 언어 선택 툴바 */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: (theme) => theme.shadows[1],
        }}
      >
        {/* 출발 언어 선택 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            minWidth: 200,
            flex: 1,
          }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel id="source-lang-label">출발 언어</InputLabel>
            <Select
              labelId="source-lang-label"
              value={sourceLang}
              label="출발 언어"
              onChange={(e) => setSourceLang(e.target.value)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              <MenuItem value="auto">
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <AutoFixHighRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  <span>언어 자동 감지 ({detectedLangCode.toUpperCase()})</span>
                </Box>
              </MenuItem>
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <span>{lang.flagEmoji || '🌐'}</span>
                    <span>
                      {lang.nativeName} ({lang.name})
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 언어 교환 (Swap) 버튼 */}
        <Tooltip title="언어 맞바꾸기 (Swap)">
          <IconButton
            onClick={handleSwapLanguages}
            color="primary"
            sx={{
              bgcolor: 'action.hover',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              p: 1,
            }}
          >
            <SwapHorizRoundedIcon />
          </IconButton>
        </Tooltip>

        {/* 도착 언어 선택 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            minWidth: 200,
            flex: 1,
          }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel id="target-lang-label">도착 언어</InputLabel>
            <Select
              labelId="target-lang-label"
              value={targetLang}
              label="도착 언어"
              onChange={(e) => setTargetLang(e.target.value)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <span>{lang.flagEmoji || '🌐'}</span>
                    <span>
                      {lang.nativeName} ({lang.name})
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 수동 번역 실행 버튼 */}
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}
          onClick={() => handleTranslate(sourceText)}
          disabled={loading || !sourceText.trim()}
          sx={{
            borderRadius: 1.5,
            fontWeight: 800,
            textTransform: 'none',
            px: 2.5,
            py: 1,
          }}
        >
          {loading ? '번역 중...' : '즉시 번역'}
        </Button>

        {/* 전 세계 주요 인기 국가 퀵 칩바 */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.8,
            pt: 1,
            borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 0.5 }}>
            🌐 추천 도착 국가:
          </Typography>
          {[
            { code: 'en', flag: '🇺🇸', label: '미국(영어)' },
            { code: 'ja', flag: '🇯🇵', label: '일본' },
            { code: 'zh', flag: '🇨🇳', label: '중국' },
            { code: 'vi', flag: '🇻🇳', label: '베트남' },
            { code: 'de', flag: '🇩🇪', label: '독일' },
            { code: 'fr', flag: '🇫🇷', label: '프랑스' },
            { code: 'es', flag: '🇪🇸', label: '스페인' },
            { code: 'it', flag: '🇮🇹', label: '이탈리아' },
            { code: 'ru', flag: '🇷🇺', label: '러시아' },
            { code: 'th', flag: '🇹🇭', label: '태국' },
            { code: 'id', flag: '🇮🇩', label: '인도네시아' },
            { code: 'hi', flag: '🇮🇳', label: '인도' },
            { code: 'ar', flag: '🇸🇦', label: '사우디' },
            { code: 'pt', flag: '🇧🇷', label: '브라질' },
            { code: 'tr', flag: '🇹🇷', label: '튀르키예' },
            { code: 'nl', flag: '🇳🇱', label: '네덜란드' },
            { code: 'pl', flag: '🇵🇱', label: '폴란드' },
            { code: 'sv', flag: '🇸🇪', label: '스웨덴' },
            { code: 'tl', flag: '🇵🇭', label: '필리핀' },
            { code: 'mn', flag: '🇲🇳', label: '몽골' },
          ].map((c) => {
            const isSelected = targetLang === c.code;
            return (
              <Chip
                key={c.code}
                label={`${c.flag} ${c.label}`}
                size="small"
                onClick={() => {
                  setTargetLang(c.code);
                  if (sourceText.trim()) {
                    handleTranslate(sourceText);
                  }
                }}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  py: 1.3,
                }}
              />
            );
          })}
        </Box>
      </Card>

      {/* 2. 에디터 좌우 분할 카드 영역 (드래그 너비 조절 가능) */}
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 좌측: 원문 입력창 */}
        <Card
          sx={{
            width: { xs: '100%', md: `calc(${splitRatio}% - 4px)` },
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: (theme) => theme.shadows[2],
            height: '100%',
            overflow: 'hidden',
            flexShrink: 0,
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              원문 입력 (Source Text)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
              {sourceText && (
                <Tooltip title="내용 지우기">
                  <IconButton
                    size="small"
                    onClick={() => setSourceText('')}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={isRecording ? '음성 녹음 중지' : '마이크 음성 입력'}>
                <IconButton
                  size="small"
                  color={isRecording ? 'error' : 'default'}
                  onClick={handleToggleSpeech}
                  sx={{ borderRadius: 1.5 }}
                >
                  {isRecording ? (
                    <StopRoundedIcon fontSize="small" />
                  ) : (
                    <MicRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="원문 음성 듣기">
                <IconButton
                  size="small"
                  onClick={() => handleSpeak(sourceText, sourceLang)}
                  disabled={!sourceText.trim()}
                  sx={{ borderRadius: 1.5 }}
                >
                  <VolumeUpRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <TextField
            multiline
            fullWidth
            placeholder="번역할 문장이나 단락을 입력하거나 마이크 음성으로 말씀하세요..."
            value={sourceText}
            onChange={handleSourceTextChange}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                height: '100%',
                alignItems: 'flex-start',
                fontSize: '1rem',
                lineHeight: 1.6,
                overflowY: 'auto',
              },
            }}
            sx={{
              flex: '1 1 auto',
              '& .MuiInputBase-root': { height: '100%' },
            }}
          />

          {/* 하단 글자수/단어수 카운터 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 1,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              color: 'text.secondary',
              fontSize: '0.8rem',
            }}
          >
            <span>
              {sourceLang === 'auto' ? `감지된 언어: ${detectedLangCode.toUpperCase()}` : ''}
            </span>
            <span>
              글자 수: {sourceText.length} | 단어:{' '}
              {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0}
            </span>
          </Box>
        </Card>

        {/* 좌우 너비 조절 리사이저 Divider */}
        <TranslatorSplitResizer
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResetSplit}
          tooltipText="드래그하여 원문/번역문 패널 너비 조절 (더블 클릭 시 5:5 초기화)"
        />

        {/* 우측: 번역 결과창 */}
        <Card
          sx={{
            width: { xs: '100%', md: `calc(${100 - splitRatio}% - 4px)` },
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
            boxShadow: (theme) => theme.shadows[2],
            height: '100%',
            overflow: 'hidden',
            flexShrink: 0,
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              번역 결과 (Translation Result)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
                <IconButton
                  size="small"
                  color={isFavorite ? 'warning' : 'default'}
                  onClick={() => setIsFavorite((prev) => !prev)}
                  disabled={!translatedText}
                  sx={{ borderRadius: 1.5 }}
                >
                  {isFavorite ? (
                    <StarRoundedIcon fontSize="small" />
                  ) : (
                    <StarBorderRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="클립보드 복사">
                <IconButton
                  size="small"
                  onClick={() => handleCopyText(translatedText)}
                  disabled={!translatedText}
                  sx={{ borderRadius: 1.5 }}
                >
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="번역문 음성 듣기">
                <IconButton
                  size="small"
                  onClick={() => handleSpeak(translatedText, targetLang)}
                  disabled={!translatedText}
                  sx={{ borderRadius: 1.5 }}
                >
                  <VolumeUpRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="TXT 파일로 다운로드">
                <IconButton
                  size="small"
                  onClick={handleDownloadText}
                  disabled={!translatedText}
                  sx={{ borderRadius: 1.5 }}
                >
                  <FileDownloadRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* 본문 결과 영역 */}
          <Box
            sx={{
              flex: '1 1 auto',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: loading ? 'center' : 'flex-start',
              alignItems: loading ? 'center' : 'stretch',
              py: 1,
            }}
          >
            {loading ? (
              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}
              >
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  인공지능 다국어 번역 엔진 가동 중...
                </Typography>
              </Box>
            ) : translatedText ? (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                  color: 'text.primary',
                }}
              >
                {translatedText}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.disabled',
                  fontStyle: 'italic',
                  mt: 2,
                }}
              >
                번역 결과가 이곳에 실시간으로 표시됩니다.
              </Typography>
            )}
          </Box>

          {/* 하단 오피스 365 연계 도구바 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 1,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              fontSize: '0.8rem',
            }}
          >
            <Button
              size="small"
              variant="text"
              color="primary"
              onClick={handleSendToDocMaster}
              disabled={!translatedText}
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            >
              📄 워드(DocMaster)로 보내기
            </Button>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              도착 언어: {targetLang.toUpperCase()}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
