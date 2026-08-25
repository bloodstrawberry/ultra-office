'use client';

import type { WordDocSection, WordDocumentMetadata } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';

import { DocSplitResizer } from './doc-split-resizer';
import { downloadFile, generateDocxBlob } from '../utils/docx-generator';

// ----------------------------------------------------------------------

const SPLIT_X_STORAGE_KEY = 'uo_doc_scratch_split_x';
const SPLIT_Y_STORAGE_KEY = 'uo_doc_scratch_split_y';

const INITIAL_METADATA: WordDocumentMetadata = {
  title: '2026년 차세대 오피스 솔루션 사업 기획서',
  subtitle: '브라우저 네이티브 문서 처리 엔진 및 AI 기술 협업 방안',
  author: '홍길동 수석 엔지니어',
  company: '(주)울트라오피스',
  date: '2026.08.20',
  version: 'v1.0',
  headerText: '(주)울트라오피스 기술기획팀',
  footerText: 'Confidential - For Internal Use Only',
  themeColor: '#1E40AF',
  accentColor: '#3B82F6',
};

const INITIAL_SECTIONS: WordDocSection[] = [
  {
    id: 's-1',
    type: 'heading1',
    content: '1. 사업 추진 배경 및 필요성',
  },
  {
    id: 's-2',
    type: 'paragraph',
    content:
      '기존 오피스 환경은 고가의 데스크톱 라이선스와 서버 렌더링에 의존하여 높은 인프라 비용과 응답 지연을 초래하였습니다. 본 프로젝트는 브라우저 네이티브 Wasm 및 Web Worker 기술을 결합하여 백엔드 부하 없이 완벽한 MS Office 호환 환경을 구축하는 것을 목표로 합니다.',
  },
  {
    id: 's-3',
    type: 'callout',
    content:
      '핵심 비전: "설치 없는 즉시 구동, 서버리스 완전 자동화, 엔터프라이즈급 데이터 보안 보장"',
  },
  {
    id: 's-4',
    type: 'heading1',
    content: '2. 주요 기능 및 아키텍처 비교',
  },
  {
    id: 's-5',
    type: 'table',
    content: '',
    tableData: [
      ['구분 항목', '기존 레거시 방식', 'Ultra Office AI'],
      ['처리 위치', '중앙 백엔드 서버 렌더링', '사용자 브라우저 단독 (Client-Side)'],
      ['파일 다운로드 속도', '3~5초 (네트워크 지연)', '0.1초 즉시 바이너리 생성'],
      ['서버 인프라 비용', '월 1,500만원 이상', '0원 (Zero Server Cost)'],
      ['데이터 보안', '서버 임시 저장 위험', '데이터 외부 유출 원천 차단'],
    ],
  },
  {
    id: 's-6',
    type: 'heading2',
    content: '2.1 단계별 핵심 마일스톤',
  },
  {
    id: 's-7',
    type: 'bullet',
    content: 'Phase 1: Word(.docx) From-Scratch 및 템플릿 치환 엔진 개발 완료',
    bold: true,
  },
  {
    id: 's-8',
    type: 'bullet',
    content: 'Phase 2: PowerPoint(.pptx) 네이티브 차트 및 슬라이드 마스터 자동 생성',
  },
  {
    id: 's-9',
    type: 'bullet',
    content: 'Phase 3: 대용량 500+건 일괄 생성 및 ZIP 압축 패키징 지원',
  },
];

export function WordScratchEditor() {
  const [metadata, setMetadata] = useState<WordDocumentMetadata>(INITIAL_METADATA);
  const [sections, setSections] = useState<WordDocSection[]>(INITIAL_SECTIONS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Split ratios for horizontal and vertical resizing
  const [splitRatioX, setSplitRatioX] = useState<number>(48); // Width ratio: Left Form vs Right Preview
  const [splitRatioY, setSplitRatioY] = useState<number>(45); // Height ratio: Metadata Form vs Sections
  const [isDraggingX, setIsDraggingX] = useState<boolean>(false);
  const [isDraggingY, setIsDraggingY] = useState<boolean>(false);
  const [hasLoadedSplits, setHasLoadedSplits] = useState<boolean>(false);

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);

  // Safe Hydration: Load saved split ratios
  useEffect(() => {
    try {
      const savedX = localStorage.getItem(SPLIT_X_STORAGE_KEY);
      if (savedX) {
        const numX = Number(savedX);
        if (!isNaN(numX) && numX >= 20 && numX <= 80) {
          setSplitRatioX(numX);
        }
      }
      const savedY = localStorage.getItem(SPLIT_Y_STORAGE_KEY);
      if (savedY) {
        const numY = Number(savedY);
        if (!isNaN(numY) && numY >= 15 && numY <= 85) {
          setSplitRatioY(numY);
        }
      }
    } catch {
      // ignore storage access error
    }
    setHasLoadedSplits(true);
  }, []);

  // Sync split ratios to localStorage
  useEffect(() => {
    if (hasLoadedSplits) {
      try {
        localStorage.setItem(SPLIT_X_STORAGE_KEY, String(Math.round(splitRatioX)));
      } catch {
        // ignore storage access error
      }
    }
  }, [splitRatioX, hasLoadedSplits]);

  useEffect(() => {
    if (hasLoadedSplits) {
      try {
        localStorage.setItem(SPLIT_Y_STORAGE_KEY, String(Math.round(splitRatioY)));
      } catch {
        // ignore storage access error
      }
    }
  }, [splitRatioY, hasLoadedSplits]);

  // Drag handlers for resizing
  const handleMouseDownX = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingX(true);
  }, []);

  const handleMouseDownY = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingY(true);
  }, []);

  const handleResetSplitX = useCallback(() => {
    setSplitRatioX(48);
  }, []);

  const handleResetSplitY = useCallback(() => {
    setSplitRatioY(45);
  }, []);

  useEffect(() => {
    if (isDraggingX || isDraggingY) {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingX && workspaceRef.current) {
          const rect = workspaceRef.current.getBoundingClientRect();
          if (rect.width > 0) {
            const offsetX = e.clientX - rect.left;
            const ratio = (offsetX / rect.width) * 100;
            const clamped = Math.min(Math.max(ratio, 25), 75);
            setSplitRatioX(clamped);
          }
        }

        if (isDraggingY && leftPanelRef.current) {
          const rect = leftPanelRef.current.getBoundingClientRect();
          if (rect.height > 0) {
            const offsetY = e.clientY - rect.top;
            const ratio = (offsetY / rect.height) * 100;
            const clamped = Math.min(Math.max(ratio, 20), 80);
            setSplitRatioY(clamped);
          }
        }
      };

      const handleMouseUp = () => {
        setIsDraggingX(false);
        setIsDraggingY(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDraggingX, isDraggingY]);

  const handleUpdateSection = (id: string, updates: Partial<WordDocSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleAddSection = (type: WordDocSection['type']) => {
    const newId = `sec-${Date.now()}`;
    let newSec: WordDocSection;

    if (type === 'table') {
      newSec = {
        id: newId,
        type: 'table',
        content: '',
        tableData: [
          ['항목명', '수량', '단가 (원)', '금액 (원)'],
          ['엔터프라이즈 라이선스', '1', '50,000,000', '50,000,000'],
          ['기술 지원 및 유지보수', '1', '10,000,000', '10,000,000'],
        ],
      };
    } else if (type === 'bullet') {
      newSec = {
        id: newId,
        type: 'bullet',
        content: '새로운 글머리 기호 항목을 입력하세요.',
      };
    } else if (type === 'callout') {
      newSec = {
        id: newId,
        type: 'callout',
        content: '강조할 인용구 또는 중요 공지 내용을 입력하세요.',
      };
    } else if (type === 'heading1') {
      newSec = {
        id: newId,
        type: 'heading1',
        content: '새 대제목',
      };
    } else if (type === 'heading2') {
      newSec = {
        id: newId,
        type: 'heading2',
        content: '새 소제목',
      };
    } else {
      newSec = {
        id: newId,
        type: 'paragraph',
        content: '새 본문 내용을 입력하세요.',
      };
    }

    setSections((prev) => [...prev, newSec]);
    toast.success('새 섹션이 추가되었습니다.');
  };

  const handleRemoveSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDownloadDocx = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateDocxBlob(metadata, sections);
      const filename = `${metadata.title.replace(/[^a-zA-Z0-9가-힣]/g, '_') || 'document'}.docx`;
      downloadFile(blob, filename);
      toast.success(`'${filename}' 워드 파일이 다운로드되었습니다!`);
    } catch (err) {
      console.error(err);
      toast.error('Word 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box
      ref={workspaceRef}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: '100%',
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        userSelect: isDraggingX || isDraggingY ? 'none' : 'auto',
      }}
    >
      {/* 1. Left Column: Form & Section Editor */}
      <Box
        ref={leftPanelRef}
        sx={{
          width: { xs: '100%', md: `${splitRatioX}%` },
          height: { xs: 'auto', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          pr: { md: 0.5 },
        }}
      >
        {/* Top: Document Metadata Card */}
        <Card
          sx={{
            height: { xs: 'auto', md: `${splitRatioY}%` },
            minHeight: { md: 160 },
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: (theme) => theme.shadows[1],
            flexShrink: 0,
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              p: 1.5,
              px: 2,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
              bgcolor: 'background.neutral',
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                문서 기본 정보 & 서식 설정
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Word(.docx) 표지 및 메타데이터를 구성합니다.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltRoundedIcon fontSize="small" />}
              onClick={() => {
                setMetadata(INITIAL_METADATA);
                setSections(INITIAL_SECTIONS);
                toast.info('초기 샘플 양식으로 복원되었습니다.');
              }}
              sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.3 }}
            >
              초기화
            </Button>
          </Box>

          {/* Form Scrollable Body */}
          <Box
            sx={{
              p: 2,
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              rowGap: 2.2,
              columnGap: 2,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
                borderRadius: 3,
              },
            }}
          >
            <TextField
              size="small"
              label="문서 제목 (Title)"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              fullWidth
              sx={{ gridColumn: '1 / -1' }}
            />

            <TextField
              size="small"
              label="부제목 (Subtitle)"
              value={metadata.subtitle}
              onChange={(e) => setMetadata({ ...metadata, subtitle: e.target.value })}
              fullWidth
              sx={{ gridColumn: '1 / -1' }}
            />

            <TextField
              size="small"
              label="작성자 / 부서"
              value={metadata.author}
              onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="회사 / 기관명"
              value={metadata.company}
              onChange={(e) => setMetadata({ ...metadata, company: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="작성 일자"
              value={metadata.date}
              onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="문서 버전"
              value={metadata.version}
              onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="머리글 (Header Text)"
              value={metadata.headerText || ''}
              onChange={(e) => setMetadata({ ...metadata, headerText: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="바닥글 (Footer Text)"
              value={metadata.footerText || ''}
              onChange={(e) => setMetadata({ ...metadata, footerText: e.target.value })}
              fullWidth
            />
          </Box>
        </Card>

        {/* Vertical Height Resizer (Horizontal Divider) */}
        <DocSplitResizer
          direction="horizontal"
          isDragging={isDraggingY}
          onMouseDown={handleMouseDownY}
          onDoubleClick={handleResetSplitY}
          tooltipText="드래그하여 기본정보/본문섹션 높이 조절 (더블클릭 초기화)"
        />

        {/* Bottom: Section List Card */}
        <Card
          sx={{
            height: { xs: 'auto', md: `calc(100% - ${splitRatioY}% - 8px)` },
            minHeight: { md: 180 },
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: (theme) => theme.shadows[1],
            flexGrow: 1,
          }}
        >
          {/* Section Header & Toolbar */}
          <Box
            sx={{
              p: 1.5,
              px: 2,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              본문 섹션 편집기 ({sections.length}개 블록)
            </Typography>

            {/* Quick Add Section Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.6, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<TitleRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleAddSection('heading1')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  fontSize: '0.75rem',
                }}
              >
                대제목
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<TitleRoundedIcon sx={{ fontSize: 13 }} />}
                onClick={() => handleAddSection('heading2')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  fontSize: '0.75rem',
                }}
              >
                소제목
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleAddSection('paragraph')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  fontSize: '0.75rem',
                }}
              >
                본문
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FormatListBulletedRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleAddSection('bullet')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  fontSize: '0.75rem',
                }}
              >
                글머리
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<TableChartRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleAddSection('table')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  fontSize: '0.75rem',
                }}
              >
                표
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FormatQuoteRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleAddSection('callout')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  fontSize: '0.75rem',
                }}
              >
                강조
              </Button>
            </Box>
          </Box>

          {/* Section Items Scrollable List */}
          <Box
            sx={{
              p: 2,
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
                borderRadius: 3,
              },
            }}
          >
            {sections.map((sec, idx) => (
              <Box
                key={sec.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  transition: 'border-color 0.15s ease',
                  '&:hover': { borderColor: 'primary.main' },
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
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      #{idx + 1}
                    </Typography>
                    <Select
                      size="small"
                      value={sec.type}
                      onChange={(e) =>
                        handleUpdateSection(sec.id, {
                          type: e.target.value as WordDocSection['type'],
                        })
                      }
                      sx={{ height: 28, fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      <MenuItem value="heading1">대제목 (H1)</MenuItem>
                      <MenuItem value="heading2">소제목 (H2)</MenuItem>
                      <MenuItem value="paragraph">본문 단락</MenuItem>
                      <MenuItem value="bullet">글머리 기호 (•)</MenuItem>
                      <MenuItem value="table">표 (Table)</MenuItem>
                      <MenuItem value="callout">강조 / 인용 박스</MenuItem>
                    </Select>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSection(sec.id)}
                    sx={{ color: 'text.secondary', p: 0.5 }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {sec.type === 'table' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      표 데이터 (각 열은 | 기호로 구분):
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      size="small"
                      value={sec.tableData?.map((r) => r.join(' | ')).join('\n') || ''}
                      onChange={(e) => {
                        const rows = e.target.value
                          .split('\n')
                          .map((line) => line.split('|').map((c) => c.trim()));
                        handleUpdateSection(sec.id, { tableData: rows });
                      }}
                      slotProps={{
                        input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } },
                      }}
                    />
                  </Box>
                ) : (
                  <TextField
                    multiline={sec.type === 'paragraph' || sec.type === 'callout'}
                    rows={sec.type === 'paragraph' ? 3 : sec.type === 'callout' ? 2 : 1}
                    fullWidth
                    size="small"
                    value={sec.content}
                    onChange={(e) => handleUpdateSection(sec.id, { content: e.target.value })}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Horizontal Width Resizer (Vertical Divider) */}
      <DocSplitResizer
        direction="vertical"
        isDragging={isDraggingX}
        onMouseDown={handleMouseDownX}
        onDoubleClick={handleResetSplitX}
        tooltipText="드래그하여 편집기 / A4 미리보기 너비 조절 (더블클릭 초기화)"
      />

      {/* 2. Right Column: Live A4 Paper Preview & Export Button */}
      <Box
        sx={{
          width: { xs: '100%', md: `calc(100% - ${splitRatioX}% - 8px)` },
          height: { xs: 'auto', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          pl: { md: 0.5 },
        }}
      >
        {/* Preview Header Bar */}
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
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            실시간 A4 문서 미리보기 (Preview)
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleDownloadDocx}
            disabled={isGenerating}
            sx={{ fontWeight: 700, borderRadius: 1.5, px: 2.5, fontSize: '0.85rem' }}
          >
            {isGenerating ? '생성 중...' : 'Word (.docx) 다운로드'}
          </Button>
        </Box>

        {/* Paper Container */}
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#cbd5e1'),
            p: { xs: 1.5, md: 3 },
            borderRadius: 2,
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.400'),
              borderRadius: 4,
            },
          }}
        >
          {/* A4 Paper Mockup */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 700,
              minHeight: 850,
              height: 'fit-content',
              bgcolor: '#ffffff',
              color: '#1e293b',
              p: { xs: 3, md: 5 },
              borderRadius: 1,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              fontFamily: '"Pretendard", -apple-system, sans-serif',
              lineHeight: 1.7,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignSelf: 'flex-start',
              mb: 4,
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderBottom: '1px solid #e2e8f0',
                  pb: 1,
                  mb: 3,
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                {metadata.headerText || metadata.company}
              </Box>

              {/* Title Block */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: metadata.themeColor,
                  textAlign: 'center',
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '1.85rem' },
                }}
              >
                {metadata.title}
              </Typography>

              {metadata.subtitle && (
                <Typography
                  variant="body1"
                  sx={{
                    color: '#64748b',
                    textAlign: 'center',
                    mb: 2,
                    fontSize: '1rem',
                  }}
                >
                  {metadata.subtitle}
                </Typography>
              )}

              {/* Meta bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1.5,
                  fontSize: '0.75rem',
                  color: '#64748b',
                  mb: 4,
                  borderBottom: '2px solid #e2e8f0',
                  pb: 1.5,
                }}
              >
                <span>작성자: {metadata.author}</span>
                <span>•</span>
                <span>일자: {metadata.date}</span>
                <span>•</span>
                <span>버전: {metadata.version}</span>
              </Box>

              {/* Content Body */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sections.map((sec) => {
                  if (sec.type === 'heading1') {
                    return (
                      <Typography
                        key={sec.id}
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: metadata.themeColor,
                          borderBottom: `2px solid ${metadata.themeColor}`,
                          pb: 0.5,
                          mt: 2,
                        }}
                      >
                        {sec.content}
                      </Typography>
                    );
                  }
                  if (sec.type === 'heading2') {
                    return (
                      <Typography
                        key={sec.id}
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#1e293b',
                          mt: 1,
                        }}
                      >
                        {sec.content}
                      </Typography>
                    );
                  }
                  if (sec.type === 'bullet') {
                    return (
                      <Box
                        key={sec.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 1,
                          pl: 1.5,
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ color: metadata.themeColor, fontWeight: 'bold' }}>•</span>
                        <span>{sec.content}</span>
                      </Box>
                    );
                  }
                  if (sec.type === 'callout') {
                    return (
                      <Box
                        key={sec.id}
                        sx={{
                          p: 1.5,
                          bgcolor: '#f8fafc',
                          borderLeft: `4px solid ${metadata.themeColor}`,
                          borderRadius: '0 8px 8px 0',
                          fontStyle: 'italic',
                          color: '#475569',
                          fontSize: '0.9rem',
                        }}
                      >
                        {sec.content}
                      </Box>
                    );
                  }
                  if (sec.type === 'table' && sec.tableData) {
                    return (
                      <Box
                        key={sec.id}
                        component="table"
                        sx={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          my: 1.5,
                          fontSize: '0.85rem',
                          '& th, & td': {
                            border: '1px solid #cbd5e1',
                            p: '8px 12px',
                          },
                          '& th': {
                            bgcolor: '#f1f5f9',
                            fontWeight: 700,
                            color: metadata.themeColor,
                          },
                        }}
                      >
                        <tbody>
                          {sec.tableData.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) =>
                                rIdx === 0 ? <th key={cIdx}>{cell}</th> : <td key={cIdx}>{cell}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Box>
                    );
                  }
                  return (
                    <Typography
                      key={sec.id}
                      variant="body2"
                      sx={{ color: '#334155', fontSize: '0.92rem' }}
                    >
                      {sec.content}
                    </Typography>
                  );
                })}
              </Box>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                borderTop: '1px solid #e2e8f0',
                pt: 1.5,
                mt: 6,
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}
            >
              {metadata.footerText}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
