'use client';

import type { SubtitleItem, SubtitleStyleSettings } from '../types';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Replay5RoundedIcon from '@mui/icons-material/Replay5Rounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Forward5RoundedIcon from '@mui/icons-material/Forward5Rounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SubtitlesRoundedIcon from '@mui/icons-material/SubtitlesRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ImportExportRoundedIcon from '@mui/icons-material/ImportExportRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { SubtitleTranslateDialog } from '../components/subtitle-translate-dialog';
import {
  parseSrt,
  parseVtt,
  parseSmi,
  subtitlesToSrt,
  subtitlesToVtt,
  subtitlesToSmi,
  subtitlesToTxt,
  subtitlesToJson,
  SUBTITLE_PRESETS,
  splitSubtitleItem,
  mergeSubtitleItems,
  cleanSubtitleTexts,
  downloadSubtitleFile,
  drawSubtitleToCanvas,
  parseSubtitleContent,
  formatTimestampForSrt,
  DEFAULT_SUBTITLE_STYLE,
  validateAndFixSubtitles,
  convertSubtitleFramerate,
  formatTimestampForDisplay,
} from '../utils/subtitle-processor';

// ----------------------------------------------------------------------
// 3 Preset Subtitle Samples (다른 업로드 UI 참고)
// ----------------------------------------------------------------------

export interface SubtitleSampleItem {
  id: string;
  title: string;
  format: 'SRT' | 'VTT' | 'SMI';
  badge: string;
  duration: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  fileName: string;
  subtitles: SubtitleItem[];
}

export const SUBTITLE_SAMPLE_PRESETS: SubtitleSampleItem[] = [
  {
    id: 'sample-movie-srt',
    title: '영화 예고편 시네마틱',
    format: 'SRT',
    badge: '영화/드라마',
    duration: '00:24',
    count: 7,
    description: '박진감 넘치는 오프닝 대사 및 타임스탬프 (23.976 FPS)',
    icon: <MovieFilterRoundedIcon sx={{ fontSize: 26 }} />,
    fileName: 'movie_trailer_cinematic.srt',
    subtitles: [
      { id: 'm-1', startTime: 1.2, endTime: 3.8, text: '어둠이 도시를 집어삼키기 시작했다.' },
      { id: 'm-2', startTime: 4.2, endTime: 7.0, text: '우리에겐 더 이상 물러설 곳이 없어.' },
      { id: 'm-3', startTime: 7.5, endTime: 10.4, text: '지금 결정을 내려야만 해, 당장!' },
      { id: 'm-4', startTime: 11.0, endTime: 14.2, text: '그들이 오고 있어... 신호를 포착했어.' },
      { id: 'm-5', startTime: 14.8, endTime: 18.0, text: '마지막 희망은 오직 너에게 달렸다.' },
      { id: 'm-6', startTime: 18.5, endTime: 21.2, text: '끝까지 포기하지 마라.' },
      { id: 'm-7', startTime: 21.8, endTime: 24.5, text: '올가을, 거대한 운명이 시작된다.' },
    ],
  },
  {
    id: 'sample-vlog-vtt',
    title: '유튜브 일상 브이로그',
    format: 'VTT',
    badge: '유튜브/SNS',
    duration: '00:32',
    count: 8,
    description: '트렌디한 웹 WebVTT 포맷의 밝고 경쾌한 대화 자막',
    icon: <VideoLibraryRoundedIcon sx={{ fontSize: 26 }} />,
    fileName: 'daily_vlog_subtitles.vtt',
    subtitles: [
      {
        id: 'v-1',
        startTime: 0.8,
        endTime: 3.5,
        text: '여러분 안녕하세요! 오늘도 제 브이로그에 와주셔서 감사합니다 ✨',
      },
      {
        id: 'v-2',
        startTime: 4.0,
        endTime: 7.2,
        text: '오늘은 아침 일찍 일어나서 집 근처 베이커리에 다녀왔어요.',
      },
      {
        id: 'v-3',
        startTime: 7.8,
        endTime: 11.0,
        text: '여기 갓 구운 크루아상이 진짜 겉바속촉 끝판왕이거든요 🥐',
      },
      {
        id: 'v-4',
        startTime: 11.6,
        endTime: 15.4,
        text: '커피 한 잔 마시면서 오늘의 할 일 목록을 정리해봅니다.',
      },
      {
        id: 'v-5',
        startTime: 16.0,
        endTime: 19.8,
        text: '오후에는 오랜만에 친구를 만나서 전시회를 보러 가기로 했어요!',
      },
      {
        id: 'v-6',
        startTime: 20.4,
        endTime: 24.0,
        text: '날씨도 너무 맑고 바람도 선선해서 기분이 최고예요 🌿',
      },
      {
        id: 'v-7',
        startTime: 24.8,
        endTime: 28.5,
        text: '오늘 영상도 끝까지 재미있게 시청해 주세요!',
      },
      {
        id: 'v-8',
        startTime: 29.0,
        endTime: 32.0,
        text: '구독과 좋아요, 알림 설정 잊지 마세요 💕',
      },
    ],
  },
  {
    id: 'sample-lecture-smi',
    title: 'TED 강연 & 발표',
    format: 'SMI',
    badge: '강연/교육',
    duration: '00:28',
    count: 6,
    description: '정확한 전달력과 호흡을 갖춘 SAMI(.smi) 강연 자막',
    icon: <DescriptionRoundedIcon sx={{ fontSize: 26 }} />,
    fileName: 'ted_talk_presentation.smi',
    subtitles: [
      {
        id: 'l-1',
        startTime: 1.0,
        endTime: 4.8,
        text: '우리는 매일 수많은 선택의 갈림길에 섭니다.',
      },
      {
        id: 'l-2',
        startTime: 5.4,
        endTime: 9.6,
        text: '그 선택들이 모여 결국 오늘의 우리를 만듭니다.',
      },
      {
        id: 'l-3',
        startTime: 10.2,
        endTime: 14.5,
        text: '혁신은 거창한 곳이 아닌, 작은 일상의 질문에서 시작됩니다.',
      },
      {
        id: 'l-4',
        startTime: 15.0,
        endTime: 19.2,
        text: '실패를 두려워하지 않는 용기가 새로운 길을 엽니다.',
      },
      {
        id: 'l-5',
        startTime: 19.8,
        endTime: 24.0,
        text: '여러분이 가진 잠재력은 상상 이상으로 거대합니다.',
      },
      { id: 'l-6', startTime: 24.6, endTime: 28.0, text: '경청해 주셔서 대단히 감사합니다.' },
    ],
  },
];

type EditorViewMode = 'list' | 'raw';
type RightPanelTab = 'preview' | 'sync' | 'style' | 'export';

export function VideoMasterSubtitleView() {
  // ─── Current Subtitle File Metadata ───
  const [fileName, setFileName] = useState<string>('');
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // ─── Undo / Redo History Stack (Ctrl+Z / Ctrl+Y) ───
  const [subHistory, setSubHistory] = useState<SubtitleItem[][]>([]);
  const [subHistoryIndex, setSubHistoryIndex] = useState<number>(-1);

  const pushSubHistory = useCallback(
    (nextSubs: SubtitleItem[]) => {
      setSubtitles(nextSubs);
      setSubHistory((prev) => {
        const next = prev.slice(0, subHistoryIndex + 1);
        next.push(nextSubs.map((s) => ({ ...s })));
        if (next.length > 30) next.shift();
        return next;
      });
      setSubHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [subHistoryIndex]
  );

  const handleSubUndo = useCallback(() => {
    if (subHistoryIndex <= 0) return;
    const targetIdx = subHistoryIndex - 1;
    const target = subHistory[targetIdx];
    if (target) {
      setSubtitles(target);
      setSubHistoryIndex(targetIdx);
      if (selectedSubId && !target.some((s) => s.id === selectedSubId)) {
        setSelectedSubId(target[0]?.id || null);
      }
      toast.info('자막 작업이 취소되었습니다. (실행 취소)');
    }
  }, [subHistoryIndex, subHistory, selectedSubId]);

  const handleSubRedo = useCallback(() => {
    if (subHistoryIndex >= subHistory.length - 1) return;
    const targetIdx = subHistoryIndex + 1;
    const target = subHistory[targetIdx];
    if (target) {
      setSubtitles(target);
      setSubHistoryIndex(targetIdx);
      if (selectedSubId && !target.some((s) => s.id === selectedSubId)) {
        setSelectedSubId(target[0]?.id || null);
      }
      toast.info('자막 작업이 다시 실행되었습니다. (다시 실행)');
    }
  }, [subHistoryIndex, subHistory, selectedSubId]);

  const subtitlesRef = useRef<SubtitleItem[]>(subtitles);
  subtitlesRef.current = subtitles;

  const commitSubHistory = useCallback(() => {
    pushSubHistory(subtitlesRef.current);
  }, [pushSubHistory]);

  const [viewMode, setViewMode] = useState<EditorViewMode>('list');
  const [rightTab, setRightTab] = useState<RightPanelTab>('preview');

  // If subtitles exist, user is editing; otherwise in upload mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // ─── Search & Replace / Batch Tools ───
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [timeShiftAmount, setTimeShiftAmount] = useState<number>(0.5);
  const [fpsFrom, setFpsFrom] = useState<number>(23.976);
  const [fpsTo, setFpsTo] = useState<number>(25.0);

  // ─── Raw Text Editor State ───
  const [rawTextContent, setRawTextContent] = useState<string>('');
  const [rawFormat, setRawFormat] = useState<'srt' | 'vtt' | 'smi'>('srt');

  // ─── Virtual Preview Simulator State ───
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [styleSettings, setStyleSettings] = useState<SubtitleStyleSettings>(DEFAULT_SUBTITLE_STYLE);

  // Optional Reference Video
  const [refVideoUrl, setRefVideoUrl] = useState<string | null>(null);
  const [refVideoName, setRefVideoName] = useState<string | null>(null);

  // ─── Split Dialog State ───
  const [splitDialogOpen, setSplitDialogOpen] = useState<boolean>(false);
  const [splittingItem, setSplittingItem] = useState<SubtitleItem | null>(null);
  const [splitTime, setSplitTime] = useState<number>(0);
  const [splitPart1Text, setSplitPart1Text] = useState<string>('');
  const [splitPart2Text, setSplitPart2Text] = useState<string>('');

  // ─── Bulk Text Editor Dialog State ───
  const [bulkDialogOpen, setBulkDialogOpen] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<'line' | 'block'>('line');
  const [bulkTextContent, setBulkTextContent] = useState<string>('');
  const [bulkDeleteExcess, setBulkDeleteExcess] = useState<boolean>(false);
  const [bulkAutoAddNew, setBulkAutoAddNew] = useState<boolean>(true);

  // ─── Auto Translate Dialog State ───
  const [translateDialogOpen, setTranslateDialogOpen] = useState<boolean>(false);

  // ─── Workspace Layout & Resizable Divider State ───
  const [workspaceLayout, setWorkspaceLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(400);
  const [topPanelHeight, setTopPanelHeight] = useState<number>(380);

  const isResizingRef = useRef(false);
  const resizeStartPosRef = useRef(0);
  const resizeStartDimRef = useRef(0);

  // ─── DOM References ───
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const refVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const refVideoInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate total duration
  const totalDuration =
    subtitles.length > 0 ? Math.max(...subtitles.map((s) => s.endTime), 10) : 10;

  // ─── Load Subtitle File ───
  const handleLoadSubtitleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      let parsed: SubtitleItem[] = [];
      const lower = file.name.toLowerCase();

      if (lower.endsWith('.srt')) {
        parsed = parseSrt(text);
      } else if (lower.endsWith('.vtt')) {
        parsed = parseVtt(text);
      } else if (lower.endsWith('.smi')) {
        parsed = parseSmi(text);
      } else {
        parsed = parseSubtitleContent(text);
      }

      if (parsed.length > 0) {
        setSubtitles(parsed);
        setSubHistory([parsed.map((s) => ({ ...s }))]);
        setSubHistoryIndex(0);
        setFileName(file.name);
        setSelectedSubId(parsed[0].id);
        setCurrentTime(parsed[0].startTime);
        setIsEditing(true);
        toast.success(`'${file.name}' (${parsed.length}개 자막)을 성공적으로 불러왔습니다.`);
      } else {
        toast.error(
          '자막 형식을 인식하지 못했습니다. 올바른 .srt, .vtt, .smi 파일인지 확인해주세요.'
        );
      }
    };
    reader.readAsText(file);
  }, []);

  // ─── Select Subtitle Sample ───
  const handleSelectSample = (sample: SubtitleSampleItem) => {
    setSubtitles(sample.subtitles);
    setSubHistory([sample.subtitles.map((s) => ({ ...s }))]);
    setSubHistoryIndex(0);
    setFileName(sample.fileName);
    setSelectedSubId(sample.subtitles[0]?.id || null);
    setCurrentTime(sample.subtitles[0]?.startTime || 0);
    setIsEditing(true);
    toast.success(`'${sample.title}' 예제 자막이 로드되었습니다.`);
  };

  // ─── Create Blank Subtitle File ───
  const handleCreateBlankFile = () => {
    const blankItem: SubtitleItem = {
      id: `sub-${Date.now()}`,
      startTime: 1.0,
      endTime: 3.5,
      text: '첫 번째 자막 내용을 입력하세요',
    };
    setSubtitles([blankItem]);
    setSubHistory([[blankItem]]);
    setSubHistoryIndex(0);
    setFileName('untitled.srt');
    setSelectedSubId(blankItem.id);
    setCurrentTime(1.0);
    setIsEditing(true);
    toast.info('새 자막 파일이 생성되었습니다.');
  };

  // Drag & drop support
  const { isDragActive, getRootProps } = useImageDropPaste({
    accept: ['.srt', '.vtt', '.smi', '.json', '.txt', 'video/*', '*/*'],
    multiple: false,
    onFiles: (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (file.type.startsWith('video/')) {
        handleLoadReferenceVideo(file);
        return;
      }
      handleLoadSubtitleFile(file);
    },
  });

  // Reference video load (optional)
  const handleLoadReferenceVideo = (file: File) => {
    const url = URL.createObjectURL(file);
    setRefVideoUrl(url);
    setRefVideoName(file.name);
    toast.success(`싱크 확인용 동영상 '${file.name}'이 로드되었습니다.`);
  };

  // Sync raw text when switching to raw mode
  useEffect(() => {
    if (viewMode === 'raw') {
      if (rawFormat === 'srt') setRawTextContent(subtitlesToSrt(subtitles));
      else if (rawFormat === 'vtt') setRawTextContent(subtitlesToVtt(subtitles));
      else if (rawFormat === 'smi') setRawTextContent(subtitlesToSmi(subtitles, fileName));
    }
  }, [viewMode, rawFormat, subtitles, fileName]);

  // Apply raw text changes back to subtitles
  const handleApplyRawText = () => {
    if (!rawTextContent.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }
    const parsed = parseSubtitleContent(rawTextContent);
    if (parsed.length > 0) {
      pushSubHistory(parsed);
      setSelectedSubId(parsed[0].id);
      setViewMode('list');
      toast.success(`${parsed.length}개의 자막이 파싱되어 목록에 반영되었습니다.`);
    } else {
      toast.error('자막 형식을 인식할 수 없습니다.');
    }
  };

  // ─── Virtual Preview Playback Loop ───
  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vid = refVideoRef.current;
    if (vid && vid.readyState >= 2) {
      if (canvas.width !== vid.videoWidth || canvas.height !== vid.videoHeight) {
        canvas.width = vid.videoWidth || 1280;
        canvas.height = vid.videoHeight || 720;
      }
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    } else {
      if (canvas.width !== 1280 || canvas.height !== 720) {
        canvas.width = 1280;
        canvas.height = 720;
      }
      // Draw professional dark cinematic backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle timecode watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.font = '16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(formatTimestampForDisplay(currentTime), canvas.width - 24, 36);
    }

    // Draw active subtitle(s) onto canvas
    drawSubtitleToCanvas(ctx, subtitles, currentTime, canvas.width, canvas.height, styleSettings);
  }, [currentTime, subtitles, styleSettings]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        if (refVideoRef.current) {
          setCurrentTime(refVideoRef.current.currentTime);
          if (refVideoRef.current.ended) {
            setIsPlaying(false);
          }
        } else {
          setCurrentTime((prev) => {
            const next = prev + dt * playbackRate;
            if (next >= totalDuration) {
              setIsPlaying(false);
              return totalDuration;
            }
            return next;
          });
        }
      }

      updateCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackRate, totalDuration, updateCanvas]);

  // Play / Pause Toggle
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (refVideoRef.current) refVideoRef.current.pause();
    } else {
      if (currentTime >= totalDuration) setCurrentTime(0);
      setIsPlaying(true);
      if (refVideoRef.current) refVideoRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (time: number) => {
    const clamped = Math.max(0, Math.min(time, totalDuration));
    setCurrentTime(clamped);
    if (refVideoRef.current) {
      refVideoRef.current.currentTime = clamped;
    }
  };

  const handleJump = (delta: number) => {
    handleSeek(currentTime + delta);
  };

  // ─── Subtitle Item CRUD ───

  const handleAddNewSubtitle = (afterId?: string) => {
    let insertIndex = subtitles.length;
    let start = 0;

    if (afterId) {
      const foundIdx = subtitles.findIndex((s) => s.id === afterId);
      if (foundIdx !== -1) {
        insertIndex = foundIdx + 1;
        start = Math.round((subtitles[foundIdx].endTime + 0.1) * 10) / 10;
      }
    } else if (subtitles.length > 0) {
      start = Math.round((subtitles[subtitles.length - 1].endTime + 0.2) * 10) / 10;
    }

    const end = Math.round((start + 2.5) * 10) / 10;
    const newItem: SubtitleItem = {
      id: `sub-${Date.now()}`,
      startTime: start,
      endTime: end,
      text: '새로운 자막 텍스트',
    };

    const copy = [...subtitles];
    copy.splice(insertIndex, 0, newItem);
    setSelectedSubId(newItem.id);
    pushSubHistory(copy);
    toast.success('새 자막 행이 추가되었습니다.');
  };

  const handleUpdateItem = (id: string, updates: Partial<SubtitleItem>) => {
    setSubtitles((prev) => prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)));
  };

  const handleAdjustTimeStep = (id: string, field: 'startTime' | 'endTime', delta: number) => {
    const updated = subtitles.map((sub) => {
      if (sub.id !== id) return sub;
      const currentVal = sub[field];
      const nextVal = Math.max(0, Math.round((currentVal + delta) * 100) / 100);

      if (field === 'startTime') {
        return {
          ...sub,
          startTime: nextVal,
          endTime: Math.max(nextVal + 0.2, sub.endTime),
        };
      }
      return {
        ...sub,
        endTime: Math.max(sub.startTime + 0.2, nextVal),
      };
    });
    pushSubHistory(updated);
  };

  const handleDeleteItem = useCallback(
    (id: string) => {
      const updated = subtitles.filter((s) => s.id !== id);
      pushSubHistory(updated);
      if (selectedSubId === id) setSelectedSubId(null);
      toast.info('자막이 삭제되었습니다.');
    },
    [subtitles, pushSubHistory, selectedSubId]
  );

  const handleDuplicateItem = (item: SubtitleItem) => {
    const duration = item.endTime - item.startTime;
    const newItem: SubtitleItem = {
      id: `sub-${Date.now()}`,
      startTime: Math.round((item.endTime + 0.2) * 10) / 10,
      endTime: Math.round((item.endTime + 0.2 + duration) * 10) / 10,
      text: item.text,
    };
    const idx = subtitles.findIndex((s) => s.id === item.id);
    const copy = [...subtitles];
    copy.splice(idx + 1, 0, newItem);
    pushSubHistory(copy);
    setSelectedSubId(newItem.id);
    toast.success('자막이 복제되었습니다.');
  };

  const handleOpenSplitDialog = (item: SubtitleItem) => {
    const midTime = (item.startTime + item.endTime) / 2;
    const words = item.text.split(' ');
    const half = Math.ceil(words.length / 2);
    setSplittingItem(item);
    setSplitTime(Math.round(midTime * 10) / 10);
    setSplitPart1Text(words.slice(0, half).join(' '));
    setSplitPart2Text(words.slice(half).join(' '));
    setSplitDialogOpen(true);
  };

  const handleConfirmSplit = () => {
    if (!splittingItem) return;
    const [sub1, sub2] = splitSubtitleItem(
      splittingItem,
      splitTime,
      splitPart1Text,
      splitPart2Text
    );

    const idx = subtitles.findIndex((s) => s.id === splittingItem.id);
    if (idx === -1) return;
    const copy = [...subtitles];
    copy.splice(idx, 1, sub1, sub2);
    pushSubHistory(copy);

    setSplitDialogOpen(false);
    setSelectedSubId(sub2.id);
    toast.success('자막이 두 구간으로 분할되었습니다.');
  };

  const handleMergeWithNext = (idx: number) => {
    if (idx >= subtitles.length - 1) return;
    const first = subtitles[idx];
    const second = subtitles[idx + 1];
    const merged = mergeSubtitleItems(first, second);

    const copy = [...subtitles];
    copy.splice(idx, 2, merged);
    pushSubHistory(copy);
    toast.success('다음 자막과 하나로 합쳐졌습니다.');
  };

  const handleSortSubtitles = () => {
    const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    pushSubHistory(sorted);
    toast.success('모든 자막이 시작 시간순으로 정렬되었습니다.');
  };

  // Keyboard Shortcuts: DEL (Delete selected subtitle), Ctrl+Z (Undo), Ctrl+Y (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      // DEL or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedSubId) {
          e.preventDefault();
          handleDeleteItem(selectedSubId);
          return;
        }
      }

      // Ctrl + Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubRedo();
        } else {
          handleSubUndo();
        }
        return;
      }

      // Ctrl + Y (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleSubRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSubId, handleDeleteItem, handleSubUndo, handleSubRedo]);

  // ─── Bulk Text Editing Operations ───

  const generateBulkText = useCallback((items: SubtitleItem[], mode: 'line' | 'block') => {
    if (mode === 'line') {
      return items.map((s) => s.text.replace(/\r?\n/g, ' ')).join('\n');
    }
    return items
      .map(
        (s, idx) =>
          `[#${idx + 1}] (${formatTimestampForDisplay(s.startTime)} ~ ${formatTimestampForDisplay(s.endTime)})\n${s.text}`
      )
      .join('\n\n');
  }, []);

  const handleOpenBulkDialog = () => {
    setBulkTextContent(generateBulkText(subtitles, bulkMode));
    setBulkDialogOpen(true);
  };

  const handleSwitchBulkMode = (newMode: 'line' | 'block') => {
    setBulkMode(newMode);
    setBulkTextContent(generateBulkText(subtitles, newMode));
  };

  const currentBulkCount = useMemo(() => {
    if (!bulkTextContent.trim()) return 0;
    if (bulkMode === 'line') {
      return bulkTextContent.split('\n').length;
    }
    const blocks = bulkTextContent
      .split(/(?:^|\n+)\[#\d+\][^\n]*\n+/)
      .filter((b) => b.trim().length > 0);
    return blocks.length;
  }, [bulkTextContent, bulkMode]);

  const handleTrimBulkLines = () => {
    setBulkTextContent((prev) =>
      prev
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
    );
    toast.info('각 줄의 앞뒤 공백을 정리했습니다.');
  };

  const handleRemoveEmptyBulkLines = () => {
    setBulkTextContent((prev) =>
      prev
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n')
    );
    toast.info('빈 줄을 제거했습니다.');
  };

  const handleResetBulkText = () => {
    setBulkTextContent(generateBulkText(subtitles, bulkMode));
    toast.info('현재 자막 원본 대사로 초기화했습니다.');
  };

  const handleApplyBulkText = () => {
    if (!bulkTextContent.trim()) {
      toast.error('적용할 자막 텍스트가 없습니다.');
      return;
    }

    if (bulkMode === 'line') {
      const lines = bulkTextContent.split('\n');
      const updated: SubtitleItem[] = [...subtitles];
      const targetCount = Math.min(updated.length, lines.length);

      for (let i = 0; i < targetCount; i += 1) {
        updated[i] = {
          ...updated[i],
          text: lines[i],
        };
      }

      if (lines.length < updated.length && bulkDeleteExcess) {
        updated.splice(lines.length);
      }

      if (lines.length > updated.length && bulkAutoAddNew) {
        let lastEnd = updated.length > 0 ? updated[updated.length - 1].endTime : 0;
        for (let i = updated.length; i < lines.length; i += 1) {
          const start = Math.round((lastEnd + 0.2) * 10) / 10;
          const end = Math.round((start + 2.5) * 10) / 10;
          updated.push({
            id: `sub-${Date.now()}-${i}`,
            startTime: start,
            endTime: end,
            text: lines[i],
          });
          lastEnd = end;
        }
      }

      setBulkDialogOpen(false);
      pushSubHistory(updated);
      toast.success(`${lines.length}줄의 자막 텍스트가 일괄 수정되었습니다.`);
    } else {
      const blocks = bulkTextContent
        .split(/(?:^|\n+)\[#\d+\][^\n]*\n+/)
        .filter((b) => b.trim().length > 0);

      const updated: SubtitleItem[] = [...subtitles];
      const targetCount = Math.min(updated.length, blocks.length);

      for (let i = 0; i < targetCount; i += 1) {
        updated[i] = {
          ...updated[i],
          text: blocks[i].trim(),
        };
      }

      if (blocks.length < updated.length && bulkDeleteExcess) {
        updated.splice(blocks.length);
      }

      if (blocks.length > updated.length && bulkAutoAddNew) {
        let lastEnd = updated.length > 0 ? updated[updated.length - 1].endTime : 0;
        for (let i = updated.length; i < blocks.length; i += 1) {
          const start = Math.round((lastEnd + 0.2) * 10) / 10;
          const end = Math.round((start + 2.5) * 10) / 10;
          updated.push({
            id: `sub-${Date.now()}-${i}`,
            startTime: start,
            endTime: end,
            text: blocks[i].trim(),
          });
          lastEnd = end;
        }
      }

      setBulkDialogOpen(false);
      pushSubHistory(updated);
      toast.success(`${blocks.length}개 블록의 자막 텍스트가 일괄 수정되었습니다.`);
    }
  };

  // ─── Auto Translate Handlers ───

  const handleOpenTranslateDialog = () => {
    if (subtitles.length === 0) {
      toast.error('번역할 자막이 없습니다. 먼저 자막을 추가하거나 불러와주세요.');
      return;
    }
    setTranslateDialogOpen(true);
  };

  const handleApplyTranslatedSubtitles = (translated: SubtitleItem[]) => {
    pushSubHistory(translated);
  };

  // ─── Resizable Divider Pointer Handlers (너비 / 높이 조절) ───

  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    const isHoriz =
      (typeof window !== 'undefined' ? window.innerWidth : 1200) >= 900 &&
      workspaceLayout === 'horizontal';
    if (isHoriz) {
      resizeStartPosRef.current = e.clientX;
      resizeStartDimRef.current = rightPanelWidth;
    } else {
      resizeStartPosRef.current = e.clientY;
      resizeStartDimRef.current = topPanelHeight;
    }
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const isHoriz =
      (typeof window !== 'undefined' ? window.innerWidth : 1200) >= 900 &&
      workspaceLayout === 'horizontal';
    if (isHoriz) {
      const deltaX = resizeStartPosRef.current - e.clientX;
      const newWidth = Math.max(280, Math.min(750, resizeStartDimRef.current + deltaX));
      setRightPanelWidth(newWidth);
    } else {
      const deltaY = e.clientY - resizeStartPosRef.current;
      const newHeight = Math.max(180, Math.min(700, resizeStartDimRef.current + deltaY));
      setTopPanelHeight(newHeight);
    }
  };

  const handleDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // ─── Batch Operations ───

  const handleBatchShiftTime = (delta: number) => {
    const updated = subtitles.map((sub) => ({
      ...sub,
      startTime: Math.max(0, Math.round((sub.startTime + delta) * 100) / 100),
      endTime: Math.max(0.3, Math.round((sub.endTime + delta) * 100) / 100),
    }));
    pushSubHistory(updated);
    toast.success(`모든 자막의 시간이 ${delta > 0 ? `+${delta}` : delta}초 이동되었습니다.`);
  };

  const handleConvertFps = () => {
    const updated = convertSubtitleFramerate(subtitles, fpsFrom, fpsTo);
    pushSubHistory(updated);
    toast.success(`프레임 레이트 보정(${fpsFrom} FPS → ${fpsTo} FPS)이 완료되었습니다.`);
  };

  const handleFindAndReplace = () => {
    if (!searchQuery.trim()) {
      toast.error('검색할 단어를 입력해주세요.');
      return;
    }
    let count = 0;
    const updated = subtitles.map((sub) => {
      if (sub.text.includes(searchQuery)) {
        count += 1;
        return {
          ...sub,
          text: sub.text.replaceAll(searchQuery, replaceQuery),
        };
      }
      return sub;
    });
    pushSubHistory(updated);
    toast.success(
      `${count}개의 자막에서 '${searchQuery}'을(를) '${replaceQuery}'(으)로 치환했습니다.`
    );
  };

  const handleAutoFix = () => {
    const { fixed, issuesFixedCount } = validateAndFixSubtitles(subtitles);
    pushSubHistory(fixed);
    if (issuesFixedCount > 0) {
      toast.success(`${issuesFixedCount}개의 자막 시간 오버랩 및 오류를 자동으로 수정했습니다!`);
    } else {
      toast.info('자막에 오류나 오버랩 문제가 발견되지 않았습니다. 완벽합니다!');
    }
  };

  const handleCleanTexts = () => {
    const cleaned = cleanSubtitleTexts(subtitles);
    pushSubHistory(cleaned);
    toast.success('모든 자막의 불필요한 HTML 태그와 양끝 공백이 정리되었습니다.');
  };

  // ─── Export Handlers ───
  const getBaseName = () => fileName.replace(/\.[^/.]+$/, '') || 'subtitles';

  const handleDownloadSrt = () => {
    const content = subtitlesToSrt(subtitles);
    downloadSubtitleFile(content, `${getBaseName()}.srt`);
    toast.success('SRT 자막 파일이 다운로드되었습니다.');
  };

  const handleDownloadVtt = () => {
    const content = subtitlesToVtt(subtitles);
    downloadSubtitleFile(content, `${getBaseName()}.vtt`);
    toast.success('WebVTT 자막 파일이 다운로드되었습니다.');
  };

  const handleDownloadSmi = () => {
    const content = subtitlesToSmi(subtitles, getBaseName());
    downloadSubtitleFile(content, `${getBaseName()}.smi`);
    toast.success('SAMI (.smi) 자막 파일이 다운로드되었습니다.');
  };

  const handleDownloadTxt = (withTime = false) => {
    const content = subtitlesToTxt(subtitles, withTime);
    downloadSubtitleFile(content, `${getBaseName()}${withTime ? '_timed' : ''}.txt`);
    toast.success('대본 텍스트 파일이 다운로드되었습니다.');
  };

  const handleDownloadJson = () => {
    const content = subtitlesToJson(subtitles, getBaseName());
    downloadSubtitleFile(content, `${getBaseName()}.json`, 'application/json');
    toast.success('JSON 자막 데이터가 다운로드되었습니다.');
  };

  const handleCopyClipboard = (fmt: 'srt' | 'vtt' | 'smi' | 'txt') => {
    let text = '';
    if (fmt === 'srt') text = subtitlesToSrt(subtitles);
    else if (fmt === 'vtt') text = subtitlesToVtt(subtitles);
    else if (fmt === 'smi') text = subtitlesToSmi(subtitles, getBaseName());
    else text = subtitlesToTxt(subtitles, false);

    navigator.clipboard.writeText(text);
    toast.success(`${fmt.toUpperCase()} 내용이 클립보드에 복사되었습니다.`);
  };

  // Filtered list
  const filteredSubtitles = searchQuery.trim()
    ? subtitles.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : subtitles;

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".srt,.vtt,.smi,.json,.txt"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleLoadSubtitleFile(f);
          e.target.value = '';
        }}
      />
      <input
        ref={refVideoInputRef}
        type="file"
        hidden
        accept="video/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleLoadReferenceVideo(f);
          e.target.value = '';
        }}
      />

      {/* Hidden video element for reference video preview */}
      {refVideoUrl && (
        <video
          ref={refVideoRef}
          src={refVideoUrl}
          playsInline
          style={{ display: 'none' }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW A: UPLOAD & 3 PRESET SAMPLES WORKSPACE (자막 파일 미로드 시) */}
      {/* ────────────────────────────────────────────────────────── */}
      {!isEditing ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 2.5 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
          }}
        >
          {/* Header Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SubtitlesRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  동영상 자막 편집기 (Subtitle File Studio)
                </Typography>
                <Chip
                  size="small"
                  label="순수 자막 파일 편집기"
                  color="primary"
                  variant="soft"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                자막 파일을 업로드하여 타임스탬프와 문구를 정밀 수정하고 다양한 자막 포맷으로
                변환하세요.
              </Typography>
            </Box>
          </Box>

          {/* 1. Subtitle Samples Section - Pinned to Top (다른 업로드 UI 참고) */}
          <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, flexShrink: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                ⚡ 즉석 테스트 자막 예제 (3종 프리셋)
              </Typography>
              <Chip
                size="small"
                label="3개 예제 지원"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700, fontSize: '0.725rem', height: 22 }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
              클릭 한 번으로 포맷별(SRT, VTT, SMI) 검증된 자막 예제를 불러와 즉시 편집을
              시작해보세요.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {SUBTITLE_SAMPLE_PRESETS.map((sample) => (
                <Card
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  {/* Icon Poster */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      flexShrink: 0,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {sample.icon}
                  </Box>

                  {/* Info */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                      <Chip
                        label={sample.format}
                        size="small"
                        color="primary"
                        sx={{ height: 18, fontSize: '0.625rem', fontWeight: 800 }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, fontSize: '0.875rem' }}
                        noWrap
                      >
                        {sample.title}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 1, lineHeight: 1.3 }}
                    >
                      {sample.description}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.6875rem', fontWeight: 600 }}
                      >
                        {sample.count}개 자막 ({sample.duration})
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.75rem' }}
                      >
                        체험하기 ➜
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Card>

          {/* 2. Drag & Drop Upload Zone - Fills Remaining Height (다른 업로드 UI 참고) */}
          <Card
            {...getRootProps({
              onClick: () => fileInputRef.current?.click(),
            })}
            sx={{
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              borderRadius: 3,
              flex: '1 1 auto',
              minHeight: 220,
              transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
              '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SubtitlesRoundedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75, textAlign: 'center' }}>
              자막 파일 업로드 (.SRT, .VTT, .SMI, .TXT, .JSON)
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 2.5,
                textAlign: 'center',
                maxWidth: 520,
                lineHeight: 1.5,
              }}
            >
              자막 파일을 마우스로 끌어다 놓거나 아래 버튼을 클릭하여 선택하세요. (모든 작업은
              브라우저 로컬에서 100% 안전하게 처리됩니다)
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ px: 3.5, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                자막 파일 선택하기
              </Button>

              <Button
                variant="outlined"
                size="large"
                sx={{ px: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateBlankFile();
                }}
              >
                빈 자막 새로 만들기
              </Button>
            </Box>

            {/* Supported Formats Chips */}
            <Box
              sx={{ display: 'flex', gap: 0.8, mt: 3, flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <Chip label=".SRT (SubRip)" size="small" variant="soft" sx={{ fontSize: '0.7rem' }} />
              <Chip label=".VTT (WebVTT)" size="small" variant="soft" sx={{ fontSize: '0.7rem' }} />
              <Chip label=".SMI (SAMI)" size="small" variant="soft" sx={{ fontSize: '0.7rem' }} />
              <Chip
                label=".TXT (대본 텍스트)"
                size="small"
                variant="soft"
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip label=".JSON" size="small" variant="soft" sx={{ fontSize: '0.7rem' }} />
            </Box>
          </Card>
        </Box>
      ) : (
        /* ────────────────────────────────────────────────────────── */
        /* VIEW B: FULL SUBTITLE EDITOR WORKSPACE (자막 파일 로드 완료 시) */
        /* ────────────────────────────────────────────────────────── */
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
          }}
          {...getRootProps()}
        >
          {/* Top Header & Metadata */}
          <Box
            sx={{
              mb: 1.5,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SubtitlesRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    variant="standard"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="자막 파일명"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontWeight: 800,
                        fontSize: '1.125rem',
                        py: 0.2,
                      },
                    }}
                  />
                  <Chip
                    label={`총 ${subtitles.length}개 자막`}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ fontWeight: 800, height: 22, fontSize: '0.75rem' }}
                  />
                  <Chip
                    label={`총 시간: ${formatTimestampForDisplay(totalDuration)}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }}
                  />
                  {refVideoName && (
                    <Chip
                      label={`참조영상: ${refVideoName}`}
                      size="small"
                      color="info"
                      variant="soft"
                      onDelete={() => {
                        setRefVideoUrl(null);
                        setRefVideoName(null);
                      }}
                      sx={{ height: 22, fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  자막을 직접 수정하거나 분할/합치기, 일괄 싱크 보정 및 다양한 포맷으로 저장할 수
                  있습니다.
                </Typography>
              </Box>
            </Box>

            {/* Global Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => setIsEditing(false)}
              >
                다른 자막 열기 / 예제
              </Button>

              <Tooltip
                title={
                  workspaceLayout === 'horizontal'
                    ? '상하 분할 레이아웃으로 전환 (높이 조절 모드)'
                    : '좌우 분할 레이아웃으로 전환 (너비 조절 모드)'
                }
              >
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  startIcon={
                    workspaceLayout === 'horizontal' ? (
                      <ViewStreamRoundedIcon />
                    ) : (
                      <ViewColumnRoundedIcon />
                    )
                  }
                  onClick={() =>
                    setWorkspaceLayout((prev) =>
                      prev === 'horizontal' ? 'vertical' : 'horizontal'
                    )
                  }
                >
                  {workspaceLayout === 'horizontal' ? '상하 분할' : '좌우 분할'}
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadSrt}
              >
                SRT 저장
              </Button>
              <Button
                variant="soft"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadVtt}
              >
                VTT 저장
              </Button>
              <Button
                variant="soft"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadSmi}
              >
                SMI 저장
              </Button>
            </Box>
          </Box>

          {/* Main Workspace (Horizontal or Vertical with Resizable Divider) */}
          <Box
            sx={{
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: workspaceLayout === 'horizontal' ? 'row' : 'column',
              },
              minHeight: 0,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {/* ─── Left/Top Panel: Subtitle Items Table / Raw Editor ─── */}
            <Card
              sx={{
                flex: {
                  xs: 'none',
                  md: workspaceLayout === 'horizontal' ? 1 : 'none',
                },
                width: '100%',
                height: {
                  xs: topPanelHeight,
                  md: workspaceLayout === 'horizontal' ? '100%' : topPanelHeight,
                },
                minHeight: {
                  xs: 180,
                  md: workspaceLayout === 'horizontal' ? 0 : 180,
                },
                maxHeight: {
                  xs: '70%',
                  md: workspaceLayout === 'horizontal' ? 'none' : '75%',
                },
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Toolbar */}
              <Box
                sx={{
                  p: 1.2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: 'background.paper',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* View Mode Toggle Tabs */}
                  <Tabs
                    value={viewMode}
                    onChange={(_, v) => setViewMode(v)}
                    sx={{
                      minHeight: 32,
                      '& .MuiTab-root': {
                        minHeight: 32,
                        py: 0,
                        px: 1.5,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                      },
                    }}
                  >
                    <Tab
                      value="list"
                      label={`자막 편집 (${filteredSubtitles.length})`}
                      icon={<FormatQuoteRoundedIcon sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                    />
                    <Tab
                      value="raw"
                      label="원본 텍스트 직접 편집"
                      icon={<CodeRoundedIcon sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                    />
                  </Tabs>

                  {/* Action Tools */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    {/* Undo / Redo */}
                    <Tooltip title="실행 취소 (Ctrl + Z)">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleSubUndo}
                          disabled={subHistoryIndex <= 0}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 0.6,
                          }}
                        >
                          <UndoRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="다시 실행 (Ctrl + Y)">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleSubRedo}
                          disabled={subHistoryIndex >= subHistory.length - 1}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 0.6,
                          }}
                        >
                          <RedoRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="시간순 자동 정렬">
                      <Button size="small" variant="soft" onClick={handleSortSubtitles}>
                        정렬
                      </Button>
                    </Tooltip>
                    <Tooltip title="순수 텍스트(대사) 일괄 편집">
                      <Button
                        size="small"
                        variant="soft"
                        color="primary"
                        startIcon={<DescriptionRoundedIcon />}
                        onClick={handleOpenBulkDialog}
                      >
                        Bulk
                      </Button>
                    </Tooltip>
                    <Tooltip title="자막 다국어 자동 번역 (원문-번역문 비교)">
                      <Button
                        size="small"
                        variant="soft"
                        color="info"
                        startIcon={<TranslateRoundedIcon />}
                        onClick={handleOpenTranslateDialog}
                      >
                        자동 번역
                      </Button>
                    </Tooltip>
                    <Tooltip title="오버랩 및 오류 자동 보정">
                      <Button
                        size="small"
                        variant="soft"
                        color="success"
                        startIcon={<AutoFixHighRoundedIcon />}
                        onClick={handleAutoFix}
                      >
                        오류 자동 수정
                      </Button>
                    </Tooltip>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => handleAddNewSubtitle()}
                    >
                      자막 행 추가
                    </Button>
                  </Box>
                </Box>

                {/* Search & Replace Inline Bar (Only in List view) */}
                {viewMode === 'list' && (
                  <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', pt: 0.5 }}>
                    <TextField
                      size="small"
                      placeholder="단어 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ flex: 1, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.75rem' } }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      →
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="바꿀 단어..."
                      value={replaceQuery}
                      onChange={(e) => setReplaceQuery(e.target.value)}
                      sx={{ flex: 1, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.75rem' } }}
                    />
                    <Button
                      size="small"
                      variant="soft"
                      onClick={handleFindAndReplace}
                      sx={{ py: 0.5, px: 1, fontSize: '0.75rem' }}
                    >
                      단어 치환
                    </Button>
                  </Box>
                )}
              </Box>

              {/* ─── Mode 1: Subtitle List ─── */}
              {viewMode === 'list' && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    minHeight: 0,
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                  }}
                >
                  {filteredSubtitles.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="body2">표시할 자막이 없습니다.</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleAddNewSubtitle()}
                      >
                        새 자막 추가
                      </Button>
                    </Box>
                  ) : (
                    filteredSubtitles.map((sub, idx) => {
                      const isSelected = sub.id === selectedSubId;
                      const isActiveNow =
                        currentTime >= sub.startTime && currentTime <= sub.endTime;
                      const duration = Math.round((sub.endTime - sub.startTime) * 100) / 100;

                      return (
                        <Card
                          key={sub.id}
                          variant="outlined"
                          onClick={() => setSelectedSubId(sub.id)}
                          sx={{
                            flexShrink: 0,
                            minHeight: 125,
                            p: 1.5,
                            borderRadius: 1.5,
                            borderColor: isSelected
                              ? 'primary.main'
                              : isActiveNow
                                ? 'info.main'
                                : 'divider',
                            bgcolor: isSelected
                              ? 'primary.lighter'
                              : isActiveNow
                                ? 'action.hover'
                                : 'background.paper',
                            boxShadow: isSelected ? 2 : 0,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {/* Top Bar: Index, Timing Badges, Actions */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 0.8,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Chip
                                label={`#${idx + 1}`}
                                size="small"
                                color={isSelected ? 'primary' : 'default'}
                                sx={{ fontWeight: 800, height: 20, fontSize: '0.6875rem' }}
                              />
                              <Chip
                                label={`${duration}초`}
                                size="small"
                                variant="outlined"
                                color={duration > 6 ? 'warning' : 'default'}
                                sx={{ fontWeight: 700, height: 20, fontSize: '0.6875rem' }}
                              />
                            </Box>

                            {/* Card Actions */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <Tooltip title="이 자막 시점으로 이동">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSeek(sub.startTime);
                                  }}
                                >
                                  <PlayArrowRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="이 자막을 둘로 분할">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSplitDialog(sub);
                                  }}
                                >
                                  <CallSplitRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {idx < filteredSubtitles.length - 1 && (
                                <Tooltip title="다음 자막과 하나로 합치기">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMergeWithNext(idx);
                                    }}
                                  >
                                    <MergeTypeRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="자막 복제">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateItem(sub);
                                  }}
                                >
                                  <ContentCopyRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="아래에 새 자막 추가">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddNewSubtitle(sub.id);
                                  }}
                                >
                                  <AddRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="삭제">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(sub.id);
                                  }}
                                >
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* Time Controls Bar */}
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            {/* Start Time */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                label="시작(초)"
                                value={sub.startTime}
                                inputProps={{ step: 0.1, min: 0 }}
                                onChange={(e) =>
                                  handleUpdateItem(sub.id, {
                                    startTime: Math.max(0, Number(e.target.value)),
                                  })
                                }
                                onBlur={commitSubHistory}
                                sx={{
                                  width: 95,
                                  '& .MuiInputBase-input': {
                                    py: 0.4,
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                  },
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  minWidth: 70,
                                  fontSize: '0.6875rem',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {formatTimestampForSrt(sub.startTime)}
                              </Typography>
                              <Button
                                size="small"
                                variant="soft"
                                color="inherit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustTimeStep(sub.id, 'startTime', -0.1);
                                }}
                                sx={{
                                  minWidth: 32,
                                  px: 0.6,
                                  py: 0.2,
                                  fontSize: '0.6875rem',
                                  height: 26,
                                }}
                              >
                                -0.1s
                              </Button>
                              <Button
                                size="small"
                                variant="soft"
                                color="inherit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustTimeStep(sub.id, 'startTime', 0.1);
                                }}
                                sx={{
                                  minWidth: 32,
                                  px: 0.6,
                                  py: 0.2,
                                  fontSize: '0.6875rem',
                                  height: 26,
                                }}
                              >
                                +0.1s
                              </Button>
                            </Box>

                            {/* End Time */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                label="종료(초)"
                                value={sub.endTime}
                                inputProps={{ step: 0.1, min: 0 }}
                                onChange={(e) =>
                                  handleUpdateItem(sub.id, {
                                    endTime: Math.max(0, Number(e.target.value)),
                                  })
                                }
                                onBlur={commitSubHistory}
                                sx={{
                                  width: 95,
                                  '& .MuiInputBase-input': {
                                    py: 0.4,
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                  },
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  minWidth: 70,
                                  fontSize: '0.6875rem',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {formatTimestampForSrt(sub.endTime)}
                              </Typography>
                              <Button
                                size="small"
                                variant="soft"
                                color="inherit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustTimeStep(sub.id, 'endTime', -0.1);
                                }}
                                sx={{
                                  minWidth: 32,
                                  px: 0.6,
                                  py: 0.2,
                                  fontSize: '0.6875rem',
                                  height: 26,
                                }}
                              >
                                -0.1s
                              </Button>
                              <Button
                                size="small"
                                variant="soft"
                                color="inherit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustTimeStep(sub.id, 'endTime', 0.1);
                                }}
                                sx={{
                                  minWidth: 32,
                                  px: 0.6,
                                  py: 0.2,
                                  fontSize: '0.6875rem',
                                  height: 26,
                                }}
                              >
                                +0.1s
                              </Button>
                            </Box>
                          </Box>

                          {/* Subtitle Text Textarea */}
                          <TextField
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                            placeholder="자막 텍스트를 입력하세요"
                            value={sub.text}
                            onChange={(e) => handleUpdateItem(sub.id, { text: e.target.value })}
                            onBlur={commitSubHistory}
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                bgcolor: 'background.paper',
                                fontFamily: 'Pretendard, -apple-system, sans-serif',
                              },
                            }}
                          />
                        </Card>
                      );
                    })
                  )}
                </Box>
              )}

              {/* ─── Mode 2: Raw Subtitle Text Editor ─── */}
              {viewMode === 'raw' && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5,
                    minHeight: 0,
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant={rawFormat === 'srt' ? 'contained' : 'outlined'}
                        onClick={() => {
                          setRawFormat('srt');
                          setRawTextContent(subtitlesToSrt(subtitles));
                        }}
                      >
                        SRT 모드
                      </Button>
                      <Button
                        size="small"
                        variant={rawFormat === 'vtt' ? 'contained' : 'outlined'}
                        onClick={() => {
                          setRawFormat('vtt');
                          setRawTextContent(subtitlesToVtt(subtitles));
                        }}
                      >
                        WebVTT 모드
                      </Button>
                      <Button
                        size="small"
                        variant={rawFormat === 'smi' ? 'contained' : 'outlined'}
                        onClick={() => {
                          setRawFormat('smi');
                          setRawTextContent(subtitlesToSmi(subtitles, fileName));
                        }}
                      >
                        SMI 모드
                      </Button>
                    </Box>

                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleApplyRawText}
                    >
                      수정 내용 자막 목록에 적용
                    </Button>
                  </Box>

                  <TextField
                    multiline
                    fullWidth
                    value={rawTextContent}
                    onChange={(e) => setRawTextContent(e.target.value)}
                    sx={{
                      flex: '1 1 auto',
                      minHeight: 0,
                      height: '100%',
                      '& .MuiInputBase-root': {
                        height: '100%',
                        alignItems: 'flex-start',
                        fontFamily: 'monospace',
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                      },
                      '& .MuiInputBase-input': {
                        height: '100% !important',
                        overflowY: 'auto !important',
                      },
                    }}
                  />
                </Box>
              )}
            </Card>

            {/* ─── Resizable Divider (너비 / 높이 조절) ─── */}
            <Box
              onPointerDown={handleDividerPointerDown}
              onPointerMove={handleDividerPointerMove}
              onPointerUp={handleDividerPointerUp}
              title={
                workspaceLayout === 'horizontal'
                  ? '드래그하여 좌우 패널 너비 조절'
                  : '드래그하여 상하 패널 높이 조절'
              }
              sx={(theme) => {
                const isHoriz = workspaceLayout === 'horizontal';
                return {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 10,
                  userSelect: 'none',
                  touchAction: 'none',
                  transition: 'all 0.15s ease',
                  [theme.breakpoints.up('md')]: isHoriz
                    ? {
                        width: 12,
                        height: '100%',
                        cursor: 'col-resize',
                        mx: 0.25,
                        my: 0,
                        '&::after': {
                          content: '""',
                          width: 4,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: 'divider',
                          transition: 'background-color 0.2s, transform 0.2s',
                        },
                        '&:hover::after, &:active::after': {
                          bgcolor: 'primary.main',
                          transform: 'scaleX(1.4)',
                        },
                      }
                    : {
                        width: '100%',
                        height: 12,
                        cursor: 'row-resize',
                        my: 0.25,
                        mx: 0,
                        '&::after': {
                          content: '""',
                          height: 4,
                          width: 52,
                          borderRadius: 2,
                          bgcolor: 'divider',
                          transition: 'background-color 0.2s, transform 0.2s',
                        },
                        '&:hover::after, &:active::after': {
                          bgcolor: 'primary.main',
                          transform: 'scaleY(1.4)',
                        },
                      },
                  [theme.breakpoints.down('md')]: {
                    width: '100%',
                    height: 12,
                    cursor: 'row-resize',
                    my: 0.25,
                    mx: 0,
                    '&::after': {
                      content: '""',
                      height: 4,
                      width: 52,
                      borderRadius: 2,
                      bgcolor: 'divider',
                      transition: 'background-color 0.2s, transform 0.2s',
                    },
                    '&:hover::after, &:active::after': {
                      bgcolor: 'primary.main',
                      transform: 'scaleY(1.4)',
                    },
                  },
                };
              }}
            />

            {/* ─── Right/Bottom Panel: Virtual Preview & Subtitle Tools ─── */}
            <Card
              sx={{
                flex: {
                  xs: 1,
                  md: workspaceLayout === 'horizontal' ? 'none' : 1,
                },
                width: {
                  xs: '100%',
                  md: workspaceLayout === 'horizontal' ? rightPanelWidth : '100%',
                },
                height: {
                  xs: 'auto',
                  md: workspaceLayout === 'horizontal' ? '100%' : 'auto',
                },
                minHeight: {
                  xs: 200,
                  md: workspaceLayout === 'horizontal' ? 0 : 200,
                },
                minWidth: {
                  md: workspaceLayout === 'horizontal' ? 280 : 0,
                },
                maxWidth: {
                  md: workspaceLayout === 'horizontal' ? 750 : 'none',
                },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Right Tabs Header */}
              <Tabs
                value={rightTab}
                onChange={(_, v) => setRightTab(v)}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  minHeight: 42,
                  flexShrink: 0,
                  '& .MuiTab-root': {
                    minHeight: 42,
                    py: 0.5,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  },
                }}
              >
                <Tab
                  value="preview"
                  label="가상 미리보기"
                  icon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
                <Tab
                  value="sync"
                  label="싱크/보정"
                  icon={<SpeedRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
                <Tab
                  value="style"
                  label="스타일"
                  icon={<StyleRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
                <Tab
                  value="export"
                  label="저장/변환"
                  icon={<ImportExportRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
              </Tabs>

              {/* ─── Tab 1: Virtual Preview Simulator ─── */}
              {rightTab === 'preview' && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5,
                    gap: 1.5,
                    minHeight: 0,
                    overflowY: 'auto',
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}
                    >
                      가상 화면 자막 시뮬레이터
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      동영상이 없어도 실제 비디오 화면처럼 자막의 타이밍과 모양을 실시간으로
                      확인합니다.
                    </Typography>
                  </Box>

                  {/* Canvas Screen */}
                  <Card
                    sx={{
                      bgcolor: '#020617',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      position: 'relative',
                      aspectRatio: '16/9',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Card>

                  {/* Virtual Scrubber & Time */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Slider
                      value={currentTime}
                      min={0}
                      max={totalDuration}
                      step={0.1}
                      onChange={(_, val) => handleSeek(val as number)}
                      size="small"
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                      >
                        {formatTimestampForDisplay(currentTime)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                      >
                        {formatTimestampForDisplay(totalDuration)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Player Controls */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleJump(-5)} title="5초 뒤로">
                        <Replay5RoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={togglePlayPause}
                        sx={{ bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light' } }}
                      >
                        {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleJump(5)} title="5초 앞으로">
                        <Forward5RoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Speed Multiplier */}
                    <FormControl size="small" sx={{ minWidth: 70 }}>
                      <Select
                        value={playbackRate}
                        onChange={(e) => setPlaybackRate(Number(e.target.value))}
                        sx={{ height: 28, fontSize: '0.75rem' }}
                      >
                        <MenuItem value={0.5}>0.5x</MenuItem>
                        <MenuItem value={1.0}>1.0x</MenuItem>
                        <MenuItem value={1.5}>1.5x</MenuItem>
                        <MenuItem value={2.0}>2.0x</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Optional Reference Video Upload */}
                  <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => refVideoInputRef.current?.click()}
                      startIcon={<CloudUploadRoundedIcon />}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {refVideoUrl ? '참조 영상 교체하기' : '싱크 대조용 동영상 불러오기 (선택)'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ─── Tab 2: Sync & Batch Corrections ─── */}
              {rightTab === 'sync' && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    minHeight: 0,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                  }}
                >
                  {/* Batch Time Shift */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                      자막 일괄 싱크 이동 (Time Shift)
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      모든 자막의 시작/종료 시간을 일괄적으로 앞당기거나 뒤로 미룹니다.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBatchShiftTime(-1)}
                      >
                        -1.0초
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBatchShiftTime(-0.5)}
                      >
                        -0.5초
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBatchShiftTime(-0.1)}
                      >
                        -0.1초
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBatchShiftTime(0.1)}
                      >
                        +0.1초
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBatchShiftTime(0.5)}
                      >
                        +0.5초
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBatchShiftTime(1)}
                      >
                        +1.0초
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        label="커스텀 이동(초)"
                        value={timeShiftAmount}
                        onChange={(e) => setTimeShiftAmount(Number(e.target.value))}
                        inputProps={{ step: 0.1 }}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleBatchShiftTime(timeShiftAmount)}
                      >
                        이동 적용
                      </Button>
                    </Box>
                  </Box>

                  {/* Framerate Conversion */}
                  <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                      FPS 프레임 레이트 배속 보정
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      영상의 프레임 규격 차이로 인해 시간이 지날수록 점진적으로 어긋나는 싱크를 일괄
                      보정합니다.
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                      <FormControl size="small">
                        <InputLabel>기존 FPS</InputLabel>
                        <Select
                          value={fpsFrom}
                          label="기존 FPS"
                          onChange={(e) => setFpsFrom(Number(e.target.value))}
                        >
                          <MenuItem value={23.976}>23.976 FPS (영화)</MenuItem>
                          <MenuItem value={24.0}>24 FPS</MenuItem>
                          <MenuItem value={25.0}>25 FPS (PAL)</MenuItem>
                          <MenuItem value={29.97}>29.97 FPS (NTSC)</MenuItem>
                          <MenuItem value={30.0}>30 FPS</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl size="small">
                        <InputLabel>변경할 FPS</InputLabel>
                        <Select
                          value={fpsTo}
                          label="변경할 FPS"
                          onChange={(e) => setFpsTo(Number(e.target.value))}
                        >
                          <MenuItem value={23.976}>23.976 FPS (영화)</MenuItem>
                          <MenuItem value={24.0}>24 FPS</MenuItem>
                          <MenuItem value={25.0}>25 FPS (PAL)</MenuItem>
                          <MenuItem value={29.97}>29.97 FPS (NTSC)</MenuItem>
                          <MenuItem value={30.0}>30 FPS</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Button variant="outlined" size="small" fullWidth onClick={handleConvertFps}>
                      FPS 싱크 변환 적용
                    </Button>
                  </Box>

                  {/* Auto Fix & Text Cleaning */}
                  <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                      자막 품질 정리 및 오류 보정
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="soft"
                        color="success"
                        startIcon={<AutoFixHighRoundedIcon />}
                        onClick={handleAutoFix}
                      >
                        시간 오버랩 & 역전 오류 자동 수정
                      </Button>
                      <Button
                        variant="soft"
                        startIcon={<CleaningServicesRoundedIcon />}
                        onClick={handleCleanTexts}
                      >
                        HTML 태그 & 불필요한 공백 일괄 정리
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* ─── Tab 3: Style Presets ─── */}
              {rightTab === 'style' && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    minHeight: 0,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    가상 뷰어 자막 스타일 프리셋
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                    {SUBTITLE_PRESETS.map((p) => (
                      <Card
                        key={p.id}
                        variant="outlined"
                        onClick={() => {
                          setStyleSettings((prev) => ({ ...prev, ...p.style }));
                          toast.success(`'${p.name}' 스타일이 적용되었습니다.`);
                        }}
                        sx={{
                          p: 1.2,
                          cursor: 'pointer',
                          borderRadius: 1.5,
                          '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, fontSize: '0.8125rem' }}
                          >
                            {p.name}
                          </Typography>
                          {p.badge && (
                            <Chip
                              label={p.badge}
                              size="small"
                              color="primary"
                              sx={{ height: 18, fontSize: '0.625rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {p.description}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}

              {/* ─── Tab 4: Export & Format Conversion ─── */}
              {rightTab === 'export' && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    minHeight: 0,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                      자막 포맷별 다운로드
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadSrt}
                      >
                        .SRT (SubRip)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadVtt}
                      >
                        .VTT (WebVTT)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadSmi}
                      >
                        .SMI (SAMI)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={() => handleDownloadTxt(false)}
                      >
                        .TXT (대본 텍스트)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadJson}
                      >
                        .JSON 데이터
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                      클립보드에 복사
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="soft"
                        size="small"
                        sx={{ flex: 1 }}
                        onClick={() => handleCopyClipboard('srt')}
                      >
                        SRT 복사
                      </Button>
                      <Button
                        variant="soft"
                        size="small"
                        sx={{ flex: 1 }}
                        onClick={() => handleCopyClipboard('vtt')}
                      >
                        VTT 복사
                      </Button>
                      <Button
                        variant="soft"
                        size="small"
                        sx={{ flex: 1 }}
                        onClick={() => handleCopyClipboard('smi')}
                      >
                        SMI 복사
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Card>
          </Box>
        </Box>
      )}

      {/* ─── 3. Subtitle Split Dialog ─── */}
      <Dialog
        open={splitDialogOpen}
        onClose={() => setSplitDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          자막 분할 (Split Subtitle)
          <IconButton size="small" onClick={() => setSplitDialogOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          {splittingItem && (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                기존 구간: {formatTimestampForSrt(splittingItem.startTime)} ~{' '}
                {formatTimestampForSrt(splittingItem.endTime)}
              </Typography>

              <TextField
                size="small"
                type="number"
                label="분할 기준 시간(초)"
                value={splitTime}
                onChange={(e) => setSplitTime(Number(e.target.value))}
                inputProps={{
                  step: 0.1,
                  min: splittingItem.startTime + 0.1,
                  max: splittingItem.endTime - 0.1,
                }}
              />

              <TextField
                size="small"
                label="첫 번째 자막 문구"
                value={splitPart1Text}
                onChange={(e) => setSplitPart1Text(e.target.value)}
              />

              <TextField
                size="small"
                label="두 번째 자막 문구"
                value={splitPart2Text}
                onChange={(e) => setSplitPart2Text(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setSplitDialogOpen(false)}>
            취소
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmSplit}>
            분할 실행
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── 4. Subtitle Bulk Text Editor Dialog ─── */}
      <Dialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2.5,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 1.5,
            px: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DescriptionRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                자막 대사 일괄 편집 (Bulk Text Editor)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                타임스탬프는 안전하게 보존되며, 순수 대사 텍스트만 한 번에 수정하거나 붙여넣을 수
                있습니다.
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setBulkDialogOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
          {/* Top Status & Mode Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* Mode Switch Tabs */}
            <Tabs
              value={bulkMode}
              onChange={(_, v) => handleSwitchBulkMode(v)}
              sx={{
                minHeight: 32,
                '& .MuiTab-root': {
                  minHeight: 32,
                  py: 0.3,
                  px: 1.5,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                },
              }}
            >
              <Tab value="line" label="1줄 = 1자막 모드 (간편 줄바꿈)" />
              <Tab value="block" label="블록 모드 ([#번호] 다중행 보존)" />
            </Tabs>

            {/* Counts & Status Badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Chip
                label={`기존 자막: ${subtitles.length}개`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }}
              />
              <Chip
                label={`입력 ${bulkMode === 'line' ? '줄' : '블록'}: ${currentBulkCount}개`}
                size="small"
                color={
                  currentBulkCount === subtitles.length
                    ? 'success'
                    : currentBulkCount > subtitles.length
                      ? 'warning'
                      : 'info'
                }
                sx={{ fontWeight: 800, height: 24, fontSize: '0.75rem' }}
              />
              {currentBulkCount === subtitles.length && (
                <Chip
                  label="1:1 정확히 일치"
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{ fontWeight: 800, height: 24, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>

          {/* Quick Helper Tools Toolbar */}
          <Box
            sx={{
              p: 1,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="soft"
                onClick={handleTrimBulkLines}
                sx={{ fontSize: '0.75rem', py: 0.4 }}
              >
                앞뒤 공백 정리
              </Button>
              <Button
                size="small"
                variant="soft"
                onClick={handleRemoveEmptyBulkLines}
                sx={{ fontSize: '0.75rem', py: 0.4 }}
              >
                빈 줄 제거
              </Button>
              <Button
                size="small"
                variant="soft"
                onClick={handleResetBulkText}
                sx={{ fontSize: '0.75rem', py: 0.4 }}
              >
                원본 대사 불러오기
              </Button>
            </Box>

            {/* Mismatch Options */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentBulkCount < subtitles.length && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={bulkDeleteExcess}
                      onChange={(e) => setBulkDeleteExcess(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      줄 수가 적을 때 초과 자막 삭제 ({subtitles.length - currentBulkCount}개 삭제)
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              )}
              {currentBulkCount > subtitles.length && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={bulkAutoAddNew}
                      onChange={(e) => setBulkAutoAddNew(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      초과 줄 자동 새 자막 생성 (+{currentBulkCount - subtitles.length}개 추가)
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              )}
            </Box>
          </Box>

          {/* Bulk Textarea */}
          <TextField
            multiline
            rows={14}
            fullWidth
            value={bulkTextContent}
            onChange={(e) => setBulkTextContent(e.target.value)}
            placeholder={
              bulkMode === 'line'
                ? '각 줄에 하나의 자막 대사를 입력하세요.\n줄바꿈(Enter) 기준으로 자막 #1, #2, #3... 순서대로 매칭됩니다.'
                : '[#1] (00:00:01,000 ~ 00:00:03,000)\n자막 대사를 입력하세요.\n\n[#2] (00:00:03,500 ~ 00:00:06,000)\n다음 자막 대사를 입력하세요.'
            }
            sx={{
              flex: '1 1 auto',
              '& .MuiInputBase-root': {
                fontFamily: 'Pretendard, monospace, -apple-system, sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                alignItems: 'flex-start',
              },
            }}
          />

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            💡 <strong>팁</strong>: 번역 대본이나 정리된 텍스트 파일을 복사하여 여기에 붙여넣으면,
            기존 싱크(타임스탬프)를 100% 유지하면서 대사만 단 1초 만에 일괄 교체할 수 있습니다.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" onClick={() => setBulkDialogOpen(false)}>
            취소
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyBulkText}
            disabled={bulkTextContent.trim().length === 0}
          >
            자막에 일괄 적용하기 ({currentBulkCount}개 항목)
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Auto Translate Dialog ─── */}
      <SubtitleTranslateDialog
        open={translateDialogOpen}
        onClose={() => setTranslateDialogOpen(false)}
        subtitles={subtitles}
        onApply={handleApplyTranslatedSubtitles}
      />
    </DashboardContent>
  );
}
