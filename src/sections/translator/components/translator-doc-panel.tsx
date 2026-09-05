'use client';

import type { SupportedLanguage } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { TranslatorSplitResizer } from './translator-split-resizer';
import { translateText, detectLanguage } from '../utils/translation-service';

// ----------------------------------------------------------------------

const STORAGE_KEY_DOC_SPLIT = 'uo_translator_doc_split_ratio';

interface TranslatorDocPanelProps {
  languages: SupportedLanguage[];
}

export function TranslatorDocPanel({ languages }: TranslatorDocPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [translatedDocContent, setTranslatedDocContent] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [progress, setProgress] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // 너비 조절 리사이저 상태
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasLoadedSplit, setHasLoadedSplit] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 로컬스토리지 복원
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOC_SPLIT);
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

  // 로컬스토리지 저장
  React.useEffect(() => {
    if (hasLoadedSplit) {
      try {
        localStorage.setItem(STORAGE_KEY_DOC_SPLIT, String(Math.round(splitRatio)));
      } catch {
        // ignore
      }
    }
  }, [splitRatio, hasLoadedSplit]);

  // 드래그 핸들러
  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleResetSplit = React.useCallback(() => {
    setSplitRatio(50);
  }, []);

  React.useEffect(() => {
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

  // 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTranslatedDocContent('');
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content || '');
      toast.success(`${file.name} 파일을 성공적으로 로드하였습니다.`);
    };
    reader.onerror = () => {
      toast.error('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
  };

  // 문서 번역 실행 (문단 단위 순차 번역 및 프로그레스 갱신)
  const handleTranslateDoc = async () => {
    if (!fileContent.trim()) {
      toast.warning('먼저 텍스트/문서 파일을 업로드해 주세요.');
      return;
    }

    setIsTranslating(true);
    setProgress(0);

    try {
      const from = sourceLang === 'auto' ? detectLanguage(fileContent) : sourceLang;
      const paragraphs = fileContent.split('\n');
      const total = paragraphs.length;
      const translatedList: string[] = [];

      for (let i = 0; i < total; i += 1) {
        const para = paragraphs[i];
        if (!para.trim()) {
          translatedList.push('');
        } else {
          try {
            const res = await translateText(para, { from, to: targetLang });
            translatedList.push(res);
          } catch {
            translatedList.push(para);
          }
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      const finalResult = translatedList.join('\n');
      setTranslatedDocContent(finalResult);
      toast.success('문서 번역이 성공적으로 완료되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '문서 번역 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  // 번역된 파일 다운로드
  const handleDownloadDoc = () => {
    if (!translatedDocContent) return;

    const ext = fileName.endsWith('.md') ? 'md' : 'txt';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_translated_${targetLang}.${ext}`;

    const blob = new Blob([translatedDocContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${outName} 파일로 다운로드되었습니다.`);
  };

  // 워드 프로세서(DocMaster)로 전송
  const handleSendToWord = () => {
    if (!translatedDocContent) return;
    try {
      localStorage.setItem('docmaster_incoming_text', translatedDocContent);
      toast.success('워드 프로세서로 번역 문서를 전달하였습니다. 워드로 이동합니다.');
      router.push(paths.docMaster);
    } catch {
      toast.error('워드 프로세서 전송 실패');
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
      {/* 1. 상단 파일 업로드 및 언어 설정 바 */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[1],
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
          <input
            type="file"
            accept=".txt,.md,.json,.csv,.srt"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
          >
            문서 파일 업로드 (.txt, .md, .csv)
          </Button>

          {fileName && (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              <DescriptionRoundedIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {fileName}
              </Typography>
              <Tooltip title="파일 닫기">
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setFileName('');
                    setFileContent('');
                    setTranslatedDocContent('');
                    setProgress(0);
                  }}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* 언어 선택 및 번역 실행 버튼 */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="doc-from-lang-label">출발 언어</InputLabel>
            <Select
              labelId="doc-from-lang-label"
              value={sourceLang}
              label="출발 언어"
              onChange={(e) => setSourceLang(e.target.value)}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="auto">자동 감지</MenuItem>
              {languages.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.flagEmoji || '🌐'} {l.nativeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            →
          </Typography>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="doc-to-lang-label">도착 언어</InputLabel>
            <Select
              labelId="doc-to-lang-label"
              value={targetLang}
              label="도착 언어"
              onChange={(e) => setTargetLang(e.target.value)}
              sx={{ borderRadius: 1.5 }}
            >
              {languages.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.flagEmoji || '🌐'} {l.nativeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            disabled={isTranslating || !fileContent.trim()}
            onClick={handleTranslateDoc}
            startIcon={<SendRoundedIcon />}
            sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none', px: 2.5 }}
          >
            {isTranslating ? '번역 진행 중...' : '문서 번역 시작'}
          </Button>
        </Box>
      </Card>

      {/* 진행률 바 */}
      {isTranslating && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 6, borderRadius: 1 }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'right' }}
          >
            진행률: {progress}%
          </Typography>
        </Box>
      )}

      {/* 2. 원문 문서 vs 번역 문서 분할 뷰 (너비 조절 가능) */}
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
        {/* 원문 문서 뷰어 */}
        <Card
          sx={{
            width: { xs: '100%', md: `calc(${splitRatio}% - 4px)` },
            p: 2,
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[1],
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>
            원본 문서 텍스트 {fileName ? `(${fileName})` : ''}
          </Typography>
          <Box
            sx={{
              flex: '1 1 auto',
              overflowY: 'auto',
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {fileContent || '상단에서 번역할 파일을 업로드해 주세요.'}
          </Box>
        </Card>

        {/* 좌우 너비 조절 리사이저 Divider */}
        <TranslatorSplitResizer
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResetSplit}
          tooltipText="드래그하여 원본/번역문서 패널 너비 조절 (더블 클릭 시 5:5 초기화)"
        />

        {/* 번역 완료 문서 뷰어 */}
        <Card
          sx={{
            width: { xs: '100%', md: `calc(${100 - splitRatio}% - 4px)` },
            p: 2,
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[1],
            display: 'flex',
            flexDirection: 'column',
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
              번역 완료 문서 ({targetLang.toUpperCase()})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Tooltip title="텍스트 전체 복사">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (!translatedDocContent) return;
                    navigator.clipboard.writeText(translatedDocContent);
                    toast.success('번역 전문이 복사되었습니다.');
                  }}
                  disabled={!translatedDocContent}
                  startIcon={<ContentCopyRoundedIcon fontSize="small" />}
                  sx={{ borderRadius: 1.5, textTransform: 'none' }}
                >
                  복사
                </Button>
              </Tooltip>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleDownloadDoc}
                disabled={!translatedDocContent}
                startIcon={<FileDownloadRoundedIcon fontSize="small" />}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
              >
                파일 다운로드
              </Button>
              <Button
                size="small"
                variant="soft"
                color="inherit"
                onClick={handleSendToWord}
                disabled={!translatedDocContent}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
              >
                워드(DocMaster) 전송
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              flex: '1 1 auto',
              overflowY: 'auto',
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {translatedDocContent || '번역이 완료되면 이곳에 전체 문서가 렌더링됩니다.'}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
