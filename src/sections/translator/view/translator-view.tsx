'use client';

import type { SupportedLanguage, TranslatorTabType, TranslationHistoryItem } from '../types';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { TranslatorHeader } from '../components/translator-header';
import { TranslatorDocPanel } from '../components/translator-doc-panel';
import { getAllSupportedLanguages } from '../utils/translation-service';
import { TranslatorTextPanel } from '../components/translator-text-panel';
import { TranslatorMultiPanel } from '../components/translator-multi-panel';
import { TranslatorHistoryDrawer } from '../components/translator-history-drawer';
import { TranslatorTemplateDialog } from '../components/translator-template-dialog';

// ----------------------------------------------------------------------

const STORAGE_KEY_HISTORY = 'uo_translation_history';

export function TranslatorView() {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<TranslatorTabType>('direct');
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);

  // 템플릿 다이얼로그 & 히스토리 드로어 상태
  const [openTemplates, setOpenTemplates] = useState<boolean>(false);
  const [openHistory, setOpenHistory] = useState<boolean>(false);

  // 번역 기록 리스트 및 현재 에디터로 전달할 텍스트
  const [historyList, setHistoryList] = useState<TranslationHistoryItem[]>([]);
  const [sourceTextToPass, setSourceTextToPass] = useState<string>('');

  // 1. 초기 마운트 시 지원 언어 목록 및 히스토리 로드 (Hydration 방지)
  useEffect(() => {
    try {
      const langs = getAllSupportedLanguages();
      setLanguages(langs);

      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        setHistoryList(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load initial translator data:', e);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // 2. 히스토리 변경 시 로컬 스토리지 동기화
  useEffect(() => {
    if (hasLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyList));
      } catch (e) {
        console.error('Failed to save translation history:', e);
      }
    }
  }, [historyList, hasLoaded]);

  // 번역 기록 추가 핸들러
  const handleAddHistory = (item: Omit<TranslationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: TranslationHistoryItem = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    setHistoryList((prev) => [newItem, ...prev.slice(0, 49)]); // 최대 50개 유지
  };

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = (id: string) => {
    setHistoryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // 단일 기록 삭제 핸들러
  const handleDeleteHistory = (id: string) => {
    setHistoryList((prev) => prev.filter((item) => item.id !== id));
    toast.success('번역 기록이 삭제되었습니다.');
  };

  // 전체 기록 비우기 핸들러
  const handleClearAllHistory = () => {
    setHistoryList([]);
    toast.success('모든 번역 기록이 초기화되었습니다.');
  };

  // 기록 또는 템플릿 선택 시 에디터에 적용
  const handleSelectTemplate = (text: string) => {
    setSourceTextToPass(text);
    setCurrentTab('direct');
  };

  const handleSelectHistory = (item: TranslationHistoryItem) => {
    setSourceTextToPass(item.sourceText);
    setCurrentTab('direct');
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <TranslateRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          다국어 번역기 (Translator)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          오피스 365 환경에서 180+개국 언어의 실시간 상호 번역, 전 세계 주요 언어 동시 비교 번역,
          오피스 문서 파일(.txt, .md) 번역 및 원어민 음성 재생(TTS)을 제공하는 다국어 번역
          스튜디오입니다.
        </Typography>
      </Box>

      {/* 2. Translator 탭 스위처 헤더 */}
      <TranslatorHeader
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenTemplates={() => setOpenTemplates(true)}
        onOpenHistory={() => setOpenHistory(true)}
        historyCount={historyList.length}
      />

      {/* 3. 활성 번역 모듈 컨테이너 (100% 높이 & 내부 스크롤) */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          mt: 1.5,
          pb: 1,
          overflow: 'hidden',
        }}
      >
        {currentTab === 'direct' && (
          <TranslatorTextPanel
            languages={languages}
            onAddHistory={handleAddHistory}
            initialSourceText={sourceTextToPass}
          />
        )}
        {currentTab === 'multi' && (
          <TranslatorMultiPanel languages={languages} initialText={sourceTextToPass} />
        )}
        {currentTab === 'doc' && <TranslatorDocPanel languages={languages} />}
      </Box>

      {/* 4. 업무용 템플릿 다이얼로그 */}
      <TranslatorTemplateDialog
        open={openTemplates}
        onClose={() => setOpenTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* 5. 번역 기록 및 즐겨찾기 사이드 서랍 */}
      <TranslatorHistoryDrawer
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        historyList={historyList}
        onSelectHistory={handleSelectHistory}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistory={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />
    </DashboardContent>
  );
}
