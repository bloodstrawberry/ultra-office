'use client';

import type {
  PlotOutput,
  RunnerState,
  CodeTemplate,
  SupportedLanguage,
  CodeRunnerStyleMode,
  SystemDiagnosticInfo,
} from '../types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import CallToActionRoundedIcon from '@mui/icons-material/CallToActionRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { CodeEditor } from './code-editor';
import { TEMPLATES } from '../core/templates';
import { SplitResizer } from './split-resizer';
import { PreviewPanel } from './preview-panel';
import { TerminalView, type TerminalRef } from './terminal-view';
import { IDE_THEMES, getThemeById } from '../core/editor-themes';
import { CodeRunnerStyleToggle } from './code-runner-style-toggle';

// ----------------------------------------------------------------------

type VsCodeActivityTab = 'explorer' | 'templates' | 'run' | 'settings';
type VsCodePanelTab = 'terminal' | 'preview' | 'output' | 'problems';

export interface CodeRunnerVsCodeLayoutProps {
  styleMode: CodeRunnerStyleMode;
  onStyleModeChange: (mode: CodeRunnerStyleMode) => void;

  currentLanguage: SupportedLanguage;
  currentTemplateId: string;
  selectedTemplate: CodeTemplate;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onTemplateChange: (template: CodeTemplate) => void;

  files: Record<string, string>;
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
  onCodeChange: (code: string) => void;
  onCreateFile?: (fileName: string, initialContent?: string) => void;
  onDeleteFile?: (fileName: string) => void;
  fontSize: number;
  minimap: boolean;
  onFontSizeChange: (size: number) => void;
  onMinimapToggle: () => void;

  currentThemeId: string;
  onThemeChange: (themeId: string) => void;

  runnerState: RunnerState;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onDownload: () => void;
  onCopyCode: () => void;

  terminalRef: React.MutableRefObject<TerminalRef | null>;
  previewUrl: string | null;
  htmlPreviewContent: string;
  isServerRunning: boolean;
  activePort: number | null;
  plots: PlotOutput[];
  onClearPlots: () => void;
  systemDiagnostic: SystemDiagnosticInfo;

  splitRatioY: number;
  isDraggingY: boolean;
  onMouseDownY: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResetSplitY: () => void;
}

function getFileBadge(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
      return { label: 'JS', color: '#f7df1e', bg: 'rgba(247, 223, 30, 0.15)' };
    case 'ts':
    case 'mts':
      return { label: 'TS', color: '#3178c6', bg: 'rgba(49, 120, 198, 0.15)' };
    case 'jsx':
    case 'tsx':
      return { label: '⚛', color: '#61dafb', bg: 'rgba(97, 218, 251, 0.15)' };
    case 'py':
      return { label: 'PY', color: '#3776ab', bg: 'rgba(55, 118, 171, 0.15)' };
    case 'css':
      return { label: '#', color: '#42a5f5', bg: 'rgba(66, 165, 245, 0.15)' };
    case 'html':
    case 'htm':
      return { label: '<>', color: '#e44d26', bg: 'rgba(228, 77, 38, 0.15)' };
    case 'json':
      return { label: '{}', color: '#ffb74d', bg: 'rgba(255, 183, 77, 0.15)' };
    case 'sql':
      return { label: 'SQL', color: '#00bcd4', bg: 'rgba(0, 188, 212, 0.15)' };
    case 'c':
    case 'h':
      return { label: 'C', color: '#64b5f6', bg: 'rgba(100, 181, 246, 0.15)' };
    case 'cpp':
    case 'hpp':
      return { label: 'C++', color: '#00599c', bg: 'rgba(0, 89, 156, 0.15)' };
    case 'rs':
      return { label: 'RS', color: '#dea584', bg: 'rgba(222, 165, 132, 0.15)' };
    case 'go':
      return { label: 'GO', color: '#00add8', bg: 'rgba(0, 173, 216, 0.15)' };
    case 'java':
      return { label: '☕', color: '#f89820', bg: 'rgba(248, 152, 32, 0.15)' };
    default:
      return { label: '📄', color: '#858585', bg: 'rgba(255, 255, 255, 0.08)' };
  }
}

export function CodeRunnerVsCodeLayout({
  styleMode,
  onStyleModeChange,
  currentLanguage,
  currentTemplateId,
  selectedTemplate,
  onLanguageChange,
  onTemplateChange,
  files,
  activeFileName,
  onSelectFile,
  onCodeChange,
  onCreateFile,
  onDeleteFile,
  fontSize,
  minimap,
  onFontSizeChange,
  onMinimapToggle,
  currentThemeId,
  onThemeChange,
  runnerState,
  onRun,
  onStop,
  onReset,
  onDownload,
  onCopyCode,
  terminalRef,
  previewUrl,
  htmlPreviewContent,
  isServerRunning,
  activePort,
  plots,
  onClearPlots,
  systemDiagnostic,
  splitRatioY,
  isDraggingY,
  onMouseDownY,
  onResetSplitY,
}: CodeRunnerVsCodeLayoutProps) {
  const [activeActivityTab, setActiveActivityTab] = useState<VsCodeActivityTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState<VsCodePanelTab>('terminal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');

  // Inline file creation state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTheme = getThemeById(currentThemeId);
  const fileNames = Object.keys(files);
  const isRunning = runnerState.status === 'running' || runnerState.status === 'booting';

  useEffect(() => {
    if (isCreatingFile) {
      setTimeout(() => {
        newFileInputRef.current?.focus();
      }, 50);
    }
  }, [isCreatingFile]);

  const handleCommitCreate = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreatingFile(false);
      setCreateError(null);
      return;
    }
    if (/[\\/:*?"<>|]/.test(trimmed)) {
      setCreateError('파일명에 특수문자(/, :, * 등)는 사용할 수 없습니다.');
      return;
    }
    if (fileNames.includes(trimmed)) {
      setCreateError('이미 존재하는 파일명입니다.');
      return;
    }
    onCreateFile?.(trimmed);
    setIsCreatingFile(false);
    setNewFileName('');
    setCreateError(null);
  };

  const hasWebPreview =
    selectedTemplate.language === 'react' ||
    selectedTemplate.language === 'html' ||
    selectedTemplate.language === 'node-server' ||
    selectedTemplate.engine === 'react-live' ||
    selectedTemplate.engine === 'html-sandbox' ||
    Boolean(previewUrl) ||
    plots.length > 0;

  // Filter templates for search
  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (!templateSearch.trim()) return tmpl.language === currentLanguage;
    const query = templateSearch.toLowerCase();
    return (
      tmpl.title.toLowerCase().includes(query) ||
      tmpl.language.toLowerCase().includes(query) ||
      tmpl.description.toLowerCase().includes(query) ||
      tmpl.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  const languageList: { id: SupportedLanguage; label: string; icon: string }[] = [
    { id: 'javascript', label: 'JavaScript', icon: '🟨' },
    { id: 'typescript', label: 'TypeScript', icon: '🔷' },
    { id: 'react', label: 'React Live', icon: '⚛️' },
    { id: 'html', label: 'HTML5 / Canvas', icon: '🎨' },
    { id: 'node-server', label: 'Node Express', icon: '🌐' },
    { id: 'python', label: 'Python 3', icon: '🐍' },
    { id: 'c', label: 'C Language', icon: '⚡' },
    { id: 'cpp', label: 'C++ 20', icon: '🚀' },
    { id: 'csharp', label: 'C# .NET', icon: '🟣' },
    { id: 'java', label: 'Java 21', icon: '☕' },
    { id: 'go', label: 'Go Lang', icon: '🐹' },
    { id: 'rust', label: 'Rust', icon: '🦀' },
    { id: 'sql', label: 'SQL SQLite', icon: '🗄️' },
    { id: 'ruby', label: 'Ruby', icon: '💎' },
    { id: 'php', label: 'PHP 8.3', icon: '🐘' },
    { id: 'lua', label: 'Lua', icon: '🌙' },
    { id: 'bash', label: 'Bash Shell', icon: '💻' },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: isFullscreen ? '100vh' : { xs: 'calc(100dvh - 64px)', lg: '100%' },
        flex: isFullscreen ? 'none' : '1 1 0%',
        minHeight: 0,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
        color: '#cccccc',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 1. VS CODE TOP TITLE BAR */}
      <Box
        sx={{
          height: 38,
          bgcolor: '#323233',
          borderBottom: '1px solid #252526',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          fontSize: '0.8125rem',
          flexShrink: 0,
          gap: 1.5,
        }}
      >
        {/* Left: Window Dots & Logo & Menus */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* macOS window control dots */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
          </Box>

          {/* VS Code Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 0.5 }}>
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '4px',
                bgcolor: '#007acc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '11px',
              }}
            >
              8
            </Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: -0.2,
                display: { xs: 'none', sm: 'inline-block' },
              }}
            >
              Visual Studio Code
            </Typography>
          </Box>

          {/* Menus */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.5,
              ml: 1,
              color: '#cccccc',
              '& span': {
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'color 0.15s',
                '&:hover': { color: '#ffffff' },
              },
            }}
          >
            <span onClick={() => setIsSidebarOpen((p) => !p)}>File</span>
            <span onClick={onCopyCode}>Edit</span>
            <span onClick={isRunning ? onStop : onRun}>{isRunning ? 'Stop' : 'Run'}</span>
            <span onClick={() => setIsPanelOpen((p) => !p)}>Terminal</span>
            <span onClick={() => setIsSidebarOpen((p) => !p)}>View</span>
            <span
              onClick={() => {
                setActiveActivityTab('settings');
                setIsSidebarOpen(true);
              }}
            >
              Help
            </span>
          </Box>
        </Box>

        {/* Center: Command Palette / Search Box */}
        <Box
          onClick={() => {
            setActiveActivityTab('templates');
            setIsSidebarOpen(true);
          }}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
            px: 2,
            py: 0.35,
            cursor: 'pointer',
            maxWidth: 380,
            width: '100%',
            justifyContent: 'center',
            transition: 'all 0.15s',
            '&:hover': {
              borderColor: '#007acc',
              bgcolor: 'rgba(255, 255, 255, 0.09)',
            },
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 14, color: '#858585' }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#cccccc',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedTemplate.title} — Online 컴파일러 (Ctrl+P)
          </Typography>
        </Box>

        {/* Right: Style Toggle & Quick Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* [ 일반 테마 | VS CODE ] Switcher */}
          <CodeRunnerStyleToggle styleMode={styleMode} onChange={onStyleModeChange} isDark />

          {/* Quick Run / Stop Button */}
          {isRunning ? (
            <Button
              size="small"
              variant="contained"
              onClick={onStop}
              startIcon={<StopRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#e53935',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.3,
                px: 1.2,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#c62828' },
              }}
            >
              중단
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={onRun}
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#007acc',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                py: 0.3,
                px: 1.2,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#0062a3' },
              }}
            >
              실행
            </Button>
          )}

          {/* Sidebar Toggle */}
          <Tooltip title={isSidebarOpen ? '사이드바 접기' : '사이드바 열기'}>
            <IconButton
              size="small"
              onClick={() => setIsSidebarOpen((p) => !p)}
              sx={{ color: isSidebarOpen ? '#007acc' : '#858585', p: 0.5 }}
            >
              <ViewSidebarRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Panel Toggle */}
          <Tooltip title={isPanelOpen ? '하단 패널 접기' : '하단 패널 열기'}>
            <IconButton
              size="small"
              onClick={() => setIsPanelOpen((p) => !p)}
              sx={{ color: isPanelOpen ? '#007acc' : '#858585', p: 0.5 }}
            >
              <CallToActionRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Fullscreen Toggle */}
          <Tooltip title={isFullscreen ? '전체화면 종료' : '전체화면'}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen((p) => !p)}
              sx={{ color: '#858585', p: 0.5 }}
            >
              {isFullscreen ? (
                <FullscreenExitRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <FullscreenRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. MAIN WORKSPACE (Activity Bar + Sidebar + Editor/Panel) */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* 2.1 ACTIVITY BAR (Left vertical strip) */}
        <Box
          sx={{
            width: 48,
            bgcolor: '#333333',
            borderRight: '1px solid #252526',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1,
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Top Activity Icons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {/* Explorer */}
            <Tooltip title="탐색기 (프로젝트 파일)" placement="right">
              <IconButton
                size="small"
                onClick={() => {
                  if (activeActivityTab === 'explorer') {
                    setIsSidebarOpen((p) => !p);
                  } else {
                    setActiveActivityTab('explorer');
                    setIsSidebarOpen(true);
                  }
                }}
                sx={{
                  color: isSidebarOpen && activeActivityTab === 'explorer' ? '#ffffff' : '#858585',
                  borderLeft:
                    isSidebarOpen && activeActivityTab === 'explorer'
                      ? '2px solid #007acc'
                      : '2px solid transparent',
                  borderRadius: 0,
                  p: 1,
                  '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                <FolderRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>

            {/* Templates & Languages */}
            <Tooltip title="언어 및 템플릿 갤러리" placement="right">
              <IconButton
                size="small"
                onClick={() => {
                  if (activeActivityTab === 'templates') {
                    setIsSidebarOpen((p) => !p);
                  } else {
                    setActiveActivityTab('templates');
                    setIsSidebarOpen(true);
                  }
                }}
                sx={{
                  color: isSidebarOpen && activeActivityTab === 'templates' ? '#ffffff' : '#858585',
                  borderLeft:
                    isSidebarOpen && activeActivityTab === 'templates'
                      ? '2px solid #007acc'
                      : '2px solid transparent',
                  borderRadius: 0,
                  p: 1,
                  '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ExtensionRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>

            {/* Run & Debug */}
            <Tooltip title="실행 및 런타임 상태" placement="right">
              <IconButton
                size="small"
                onClick={() => {
                  if (activeActivityTab === 'run') {
                    setIsSidebarOpen((p) => !p);
                  } else {
                    setActiveActivityTab('run');
                    setIsSidebarOpen(true);
                  }
                }}
                sx={{
                  color: isSidebarOpen && activeActivityTab === 'run' ? '#ffffff' : '#858585',
                  borderLeft:
                    isSidebarOpen && activeActivityTab === 'run'
                      ? '2px solid #007acc'
                      : '2px solid transparent',
                  borderRadius: 0,
                  p: 1,
                  '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                <PlayArrowRoundedIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Bottom Settings Icon */}
          <Tooltip title="에디터 설정 & 테마" placement="right">
            <IconButton
              size="small"
              onClick={() => {
                if (activeActivityTab === 'settings') {
                  setIsSidebarOpen((p) => !p);
                } else {
                  setActiveActivityTab('settings');
                  setIsSidebarOpen(true);
                }
              }}
              sx={{
                color: isSidebarOpen && activeActivityTab === 'settings' ? '#ffffff' : '#858585',
                borderLeft:
                  isSidebarOpen && activeActivityTab === 'settings'
                    ? '2px solid #007acc'
                    : '2px solid transparent',
                borderRadius: 0,
                p: 1,
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              <SettingsRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 2.2 SIDEBAR (Collapsible, 260px) */}
        {isSidebarOpen && (
          <Box
            sx={{
              width: { xs: 220, sm: 260 },
              bgcolor: '#252526',
              borderRight: '1px solid #1e1e1e',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {/* Sidebar Header */}
            <Box
              sx={{
                p: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: '#bbbbbb',
                  textTransform: 'uppercase',
                }}
              >
                {activeActivityTab === 'explorer'
                  ? 'EXPLORER: PROJECT FILES'
                  : activeActivityTab === 'templates'
                    ? 'TEMPLATES & LANGUAGES'
                    : activeActivityTab === 'run'
                      ? 'RUN & RUNTIME'
                      : 'SETTINGS & THEME'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {activeActivityTab === 'explorer' && (
                  <Tooltip title="새 파일 생성 (+)">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsCreatingFile(true);
                        setNewFileName('');
                        setCreateError(null);
                      }}
                      sx={{
                        color: '#858585',
                        p: 0.4,
                        '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      <NoteAddRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={() => setIsSidebarOpen(false)}
                  sx={{ color: '#858585', p: 0.4 }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Sidebar Content Based on Active Activity Tab */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
              {/* TAB 1: EXPLORER (Project Files) */}
              {activeActivityTab === 'explorer' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#858585', px: 1, py: 0.5 }}>
                    WORKSPACE: {selectedTemplate.title}
                  </Typography>

                  {/* Inline File Creation Input */}
                  {isCreatingFile && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        px: 1,
                        py: 0.8,
                        bgcolor: 'rgba(0, 122, 204, 0.1)',
                        border: '1px solid #007acc',
                        borderRadius: '4px',
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <InsertDriveFileRoundedIcon sx={{ fontSize: 15, color: '#007acc' }} />
                        <input
                          ref={newFileInputRef}
                          type="text"
                          value={newFileName}
                          placeholder="예: helper.js, data.json"
                          onChange={(e) => {
                            setNewFileName(e.target.value);
                            setCreateError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCommitCreate();
                            } else if (e.key === 'Escape') {
                              setIsCreatingFile(false);
                              setNewFileName('');
                              setCreateError(null);
                            }
                          }}
                          style={{
                            flex: 1,
                            background: '#1e1e1e',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 3,
                            padding: '2px 6px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            outline: 'none',
                          }}
                        />
                        <Tooltip title="생성 (Enter)">
                          <IconButton
                            size="small"
                            onClick={handleCommitCreate}
                            sx={{ color: '#4caf50', p: 0.2 }}
                          >
                            <CheckRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="취소 (Esc)">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setIsCreatingFile(false);
                              setNewFileName('');
                              setCreateError(null);
                            }}
                            sx={{ color: '#858585', p: 0.2 }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {createError && (
                        <Typography sx={{ fontSize: '0.6875rem', color: '#ef5350', px: 0.5 }}>
                          {createError}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Project Files List */}
                  {fileNames.map((fileName) => {
                    const isSelected = fileName === activeFileName;
                    const badge = getFileBadge(fileName);
                    return (
                      <Box
                        key={fileName}
                        onClick={() => onSelectFile(fileName)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.2,
                          py: 0.5,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                          color: isSelected ? '#ffffff' : '#cccccc',
                          borderLeft: isSelected ? '2px solid #007acc' : '2px solid transparent',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '& .file-delete-btn': { opacity: 1 },
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              minWidth: 18,
                              height: 16,
                              borderRadius: '2px',
                              bgcolor: badge.bg,
                              color: badge.color,
                              fontSize: '10px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'monospace',
                              px: 0.3,
                            }}
                          >
                            {badge.label}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '0.8125rem',
                              fontWeight: isSelected ? 600 : 400,
                              fontFamily: 'monospace',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fileName}
                          </Typography>
                        </Box>

                        {/* Delete action button */}
                        {fileNames.length > 1 && onDeleteFile && (
                          <Tooltip title={`"${fileName}" 파일 삭제`}>
                            <IconButton
                              className="file-delete-btn"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
                                  onDeleteFile(fileName);
                                }
                              }}
                              sx={{
                                p: 0.2,
                                color: '#858585',
                                opacity: 0,
                                transition: 'all 0.15s',
                                '&:hover': { color: '#ef5350' },
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}

                  {/* Engine Specs Box */}
                  <Box
                    sx={{
                      mt: 3,
                      p: 1.5,
                      bgcolor: 'rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography
                      sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#858585', mb: 1 }}
                    >
                      ENGINE STATUS
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                      <Chip
                        size="small"
                        label={runnerState.currentEngine.toUpperCase()}
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(0, 122, 204, 0.2)',
                          color: '#4fc1ff',
                          border: '1px solid rgba(0, 122, 204, 0.4)',
                        }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', color: '#cccccc' }}>
                        {selectedTemplate.language}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#858585' }}>
                      {selectedTemplate.description}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* TAB 2: TEMPLATES & LANGUAGES */}
              {activeActivityTab === 'templates' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Search box */}
                  <TextField
                    size="small"
                    placeholder="템플릿 또는 언어 검색..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': {
                        bgcolor: 'rgba(0,0,0,0.25)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      },
                    }}
                  />

                  {/* Language Selector Dropdown */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
                    {languageList.map((lang) => {
                      const isSel = currentLanguage === lang.id;
                      return (
                        <Chip
                          key={lang.id}
                          size="small"
                          label={`${lang.icon} ${lang.label}`}
                          onClick={() => onLanguageChange(lang.id)}
                          sx={{
                            height: 24,
                            fontSize: '0.6875rem',
                            fontWeight: isSel ? 700 : 500,
                            bgcolor: isSel ? '#007acc' : 'rgba(255,255,255,0.06)',
                            color: isSel ? '#ffffff' : '#cccccc',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: isSel ? '#0062a3' : 'rgba(255,255,255,0.1)',
                            },
                          }}
                        />
                      );
                    })}
                  </Box>

                  {/* Templates List */}
                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      color: '#858585',
                      px: 0.5,
                      mt: 1,
                      fontWeight: 700,
                    }}
                  >
                    TEMPLATES ({filteredTemplates.length})
                  </Typography>

                  {filteredTemplates.map((tmpl) => {
                    const isSelected = tmpl.id === currentTemplateId;
                    return (
                      <Box
                        key={tmpl.id}
                        onClick={() => onTemplateChange(tmpl)}
                        sx={{
                          p: 1,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'rgba(0, 122, 204, 0.15)' : 'transparent',
                          border: isSelected
                            ? '1px solid rgba(0, 122, 204, 0.5)'
                            : '1px solid transparent',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: isSelected ? '#4fc1ff' : '#cccccc',
                          }}
                        >
                          {tmpl.title}
                        </Typography>
                        <Typography
                          sx={{ fontSize: '0.6875rem', color: '#858585', mt: 0.3, lineHeight: 1.3 }}
                        >
                          {tmpl.tags.slice(0, 3).join(' • ')}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* TAB 3: RUN & RUNTIME */}
              {activeActivityTab === 'run' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={isRunning ? onStop : onRun}
                    startIcon={isRunning ? <StopRoundedIcon /> : <PlayArrowRoundedIcon />}
                    sx={{
                      bgcolor: isRunning ? '#e53935' : '#007acc',
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 0.8,
                      borderRadius: '6px',
                      '&:hover': { bgcolor: isRunning ? '#c62828' : '#0062a3' },
                    }}
                  >
                    {isRunning ? '중단 (Stop Execution)' : '실행 (Run Code) [Ctrl+↵]'}
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onReset}
                    startIcon={<RestartAltRoundedIcon />}
                    sx={{
                      color: '#cccccc',
                      borderColor: 'rgba(255,255,255,0.15)',
                      fontSize: '0.75rem',
                      py: 0.6,
                      borderRadius: '6px',
                      '&:hover': {
                        borderColor: '#ffffff',
                        bgcolor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    코드 템플릿 초기화
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onCopyCode}
                    startIcon={<ContentCopyRoundedIcon />}
                    sx={{
                      color: '#cccccc',
                      borderColor: 'rgba(255,255,255,0.15)',
                      fontSize: '0.75rem',
                      py: 0.6,
                      borderRadius: '6px',
                      '&:hover': {
                        borderColor: '#ffffff',
                        bgcolor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    전체 코드 복사
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onDownload}
                    startIcon={<DownloadRoundedIcon />}
                    sx={{
                      color: '#cccccc',
                      borderColor: 'rgba(255,255,255,0.15)',
                      fontSize: '0.75rem',
                      py: 0.6,
                      borderRadius: '6px',
                      '&:hover': {
                        borderColor: '#ffffff',
                        bgcolor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    파일 다운로드
                  </Button>

                  {/* Runtime Status Card */}
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#858585' }}>
                      STATUS
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color:
                          runnerState.status === 'running'
                            ? '#ffb74d'
                            : runnerState.status === 'success'
                              ? '#4caf50'
                              : runnerState.status === 'error'
                                ? '#ef5350'
                                : '#cccccc',
                        mt: 0.4,
                      }}
                    >
                      {runnerState.statusMessage}
                    </Typography>
                    {activePort && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#4fc1ff', mt: 0.5 }}>
                        포트: :{activePort} (Live Server)
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* TAB 4: SETTINGS & THEME */}
              {activeActivityTab === 'settings' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0.5 }}>
                  {/* Theme Picker */}
                  <Box>
                    <Typography
                      sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#cccccc', mb: 0.8 }}
                    >
                      에디터 테마 (Themes)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {IDE_THEMES.map((th) => {
                        const isSel = th.id === currentThemeId;
                        return (
                          <Box
                            key={th.id}
                            onClick={() => onThemeChange(th.id)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 0.8,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              bgcolor: isSel ? 'rgba(0, 122, 204, 0.2)' : 'transparent',
                              border: isSel
                                ? '1px solid rgba(0, 122, 204, 0.5)'
                                : '1px solid transparent',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                            }}
                          >
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: th.previewBg,
                                border: `2px solid ${th.previewAccent}`,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                color: isSel ? '#4fc1ff' : '#cccccc',
                                fontWeight: isSel ? 700 : 400,
                              }}
                            >
                              {th.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Font Size */}
                  <Box>
                    <Typography
                      sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#cccccc', mb: 0.8 }}
                    >
                      폰트 크기: {fontSize}px
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onFontSizeChange(Math.max(11, fontSize - 1))}
                        sx={{ color: '#cccccc', borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        - 축소
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
                        sx={{ color: '#cccccc', borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        + 확대
                      </Button>
                    </Box>
                  </Box>

                  {/* Minimap Toggle */}
                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={onMinimapToggle}
                      sx={{ color: '#cccccc', borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      미니맵: {minimap ? '켬 (ON)' : '끔 (OFF)'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* 2.3 CENTRAL EDITOR & BOTTOM PANEL WORKSPACE */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Top: VS Code Editor Tabs Bar */}
          <Box
            sx={{
              height: 35,
              bgcolor: '#252526',
              borderBottom: '1px solid #1e1e1e',
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              flexShrink: 0,
              '&::-webkit-scrollbar': { height: 3 },
            }}
          >
            {fileNames.map((fileName) => {
              const isSelected = fileName === activeFileName;
              const badge = getFileBadge(fileName);
              return (
                <Box
                  key={fileName}
                  onClick={() => onSelectFile(fileName)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 1.5,
                    height: '100%',
                    bgcolor: isSelected ? '#1e1e1e' : '#2d2d2d',
                    color: isSelected ? '#ffffff' : '#969696',
                    borderRight: '1px solid #1e1e1e',
                    borderTop: isSelected ? '2px solid #007acc' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    userSelect: 'none',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: isSelected ? '#1e1e1e' : 'rgba(255,255,255,0.04)',
                      color: '#ffffff',
                      '& .tab-close-btn': { opacity: 1 },
                    },
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: badge.color,
                    }}
                  >
                    {badge.label}
                  </Box>
                  <span>{fileName}</span>

                  {/* Close / Delete tab button */}
                  {fileNames.length > 1 && onDeleteFile && (
                    <Tooltip title={`"${fileName}" 파일 닫기/삭제`}>
                      <Box
                        component="span"
                        className="tab-close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
                            onDeleteFile(fileName);
                          }
                        }}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 16,
                          height: 16,
                          borderRadius: '3px',
                          color: '#858585',
                          opacity: isSelected ? 0.7 : 0,
                          ml: 0.4,
                          transition: 'all 0.15s',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            opacity: 1,
                          },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 13 }} />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              );
            })}

            {/* + Add file tab button */}
            {onCreateFile && (
              <Tooltip title="새 파일 추가">
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsSidebarOpen(true);
                    setActiveActivityTab('explorer');
                    setIsCreatingFile(true);
                  }}
                  sx={{
                    color: '#858585',
                    px: 1,
                    height: '100%',
                    borderRadius: 0,
                    '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Breadcrumbs Bar */}
          <Box
            sx={{
              height: 22,
              bgcolor: '#1e1e1e',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              fontSize: '0.6875rem',
              color: '#858585',
              fontFamily: 'monospace',
              flexShrink: 0,
            }}
          >
            <span>{selectedTemplate.language}</span>
            <span>›</span>
            <span>src</span>
            <span>›</span>
            <span style={{ color: '#cccccc' }}>{activeFileName}</span>
          </Box>

          {/* Monaco Code Editor Area */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              height: isPanelOpen ? `${100 - splitRatioY}%` : '100%',
            }}
          >
            <CodeEditor
              language={selectedTemplate.language}
              value={files[activeFileName] || ''}
              onChange={onCodeChange}
              onRun={onRun}
              themeId={currentThemeId}
              fontSize={fontSize}
              minimap={minimap}
            />
          </Box>

          {/* Horizontal Split Resizer (between Editor and Bottom Panel) */}
          {isPanelOpen && (
            <SplitResizer
              direction="horizontal"
              isDragging={isDraggingY}
              theme={activeTheme}
              onMouseDown={onMouseDownY}
              onDoubleClick={onResetSplitY}
              tooltipText="패널 높이 조절 (더블 클릭: 5:5 복원)"
            />
          )}

          {/* Bottom: VS Code Drawer Panel (Terminal / Preview / Problems / Output) */}
          {isPanelOpen && (
            <Box
              sx={{
                height: `${splitRatioY}%`,
                minHeight: 180,
                maxHeight: '75%',
                bgcolor: '#1e1e1e',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Panel Header with Tabs */}
              <Box
                sx={{
                  height: 35,
                  bgcolor: '#252526',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  flexShrink: 0,
                }}
              >
                {/* Left Panel Tabs */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* TERMINAL */}
                  <Typography
                    onClick={() => setActivePanelTab('terminal')}
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      cursor: 'pointer',
                      color: activePanelTab === 'terminal' ? '#ffffff' : '#858585',
                      borderBottom:
                        activePanelTab === 'terminal'
                          ? '2px solid #007acc'
                          : '2px solid transparent',
                      py: 0.8,
                      '&:hover': { color: '#ffffff' },
                    }}
                  >
                    TERMINAL
                  </Typography>

                  {/* WEB PREVIEW (If web or plots) */}
                  {hasWebPreview && (
                    <Typography
                      onClick={() => setActivePanelTab('preview')}
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        cursor: 'pointer',
                        color: activePanelTab === 'preview' ? '#ffffff' : '#858585',
                        borderBottom:
                          activePanelTab === 'preview'
                            ? '2px solid #007acc'
                            : '2px solid transparent',
                        py: 0.8,
                        '&:hover': { color: '#ffffff' },
                      }}
                    >
                      WEB PREVIEW {isServerRunning && '⚡ (:3000)'}
                    </Typography>
                  )}

                  {/* OUTPUT */}
                  <Typography
                    onClick={() => setActivePanelTab('output')}
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      cursor: 'pointer',
                      color: activePanelTab === 'output' ? '#ffffff' : '#858585',
                      borderBottom:
                        activePanelTab === 'output' ? '2px solid #007acc' : '2px solid transparent',
                      py: 0.8,
                      '&:hover': { color: '#ffffff' },
                    }}
                  >
                    OUTPUT
                  </Typography>

                  {/* PROBLEMS */}
                  <Typography
                    onClick={() => setActivePanelTab('problems')}
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      cursor: 'pointer',
                      color: activePanelTab === 'problems' ? '#ffffff' : '#858585',
                      borderBottom:
                        activePanelTab === 'problems'
                          ? '2px solid #007acc'
                          : '2px solid transparent',
                      py: 0.8,
                      '&:hover': { color: '#ffffff' },
                    }}
                  >
                    PROBLEMS (0)
                  </Typography>
                </Box>

                {/* Right Panel Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="콘솔 지우기">
                    <IconButton
                      size="small"
                      onClick={() => terminalRef.current?.clear()}
                      sx={{ color: '#858585', p: 0.4 }}
                    >
                      <ClearRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="재실행">
                    <IconButton size="small" onClick={onRun} sx={{ color: '#858585', p: 0.4 }}>
                      <RestartAltRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="패널 닫기">
                    <IconButton
                      size="small"
                      onClick={() => setIsPanelOpen(false)}
                      sx={{ color: '#858585', p: 0.4 }}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Panel Body */}
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {/* 1. Terminal Panel */}
                <Box
                  sx={{
                    display: activePanelTab === 'terminal' ? 'block' : 'none',
                    height: '100%',
                  }}
                >
                  <TerminalView
                    ref={terminalRef}
                    themeId={currentThemeId}
                    title="bash / console output"
                    statusLabel={runnerState.statusMessage}
                    statusColor={
                      runnerState.status === 'running'
                        ? 'warning'
                        : runnerState.status === 'success'
                          ? 'success'
                          : runnerState.status === 'error'
                            ? 'error'
                            : 'default'
                    }
                    onClear={() => terminalRef.current?.clear()}
                    onRestart={onRun}
                  />
                </Box>

                {/* 2. Web Preview Panel */}
                {hasWebPreview && (
                  <Box
                    sx={{
                      display: activePanelTab === 'preview' ? 'block' : 'none',
                      height: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <PreviewPanel
                      themeId={currentThemeId}
                      previewUrl={previewUrl}
                      htmlContent={htmlPreviewContent}
                      isServerRunning={isServerRunning}
                      activePort={activePort}
                      plots={plots}
                      onClearPlots={onClearPlots}
                      systemInfo={systemDiagnostic}
                    />
                  </Box>
                )}

                {/* 3. Output Diagnostics Panel */}
                {activePanelTab === 'output' && (
                  <Box sx={{ p: 2, height: '100%', overflowY: 'auto', color: '#cccccc' }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, mb: 1.5 }}>
                      OmniRunner System & Runtime Environment
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      <Box>• Engine: {selectedTemplate.engine}</Box>
                      <Box>
                        • Cross-Origin Isolated:{' '}
                        {systemDiagnostic.isCrossOriginIsolated ? '✅ Enabled' : '❌ Disabled'}
                      </Box>
                      <Box>
                        • SharedArrayBuffer:{' '}
                        {systemDiagnostic.hasSharedArrayBuffer ? '✅ Available' : '❌ Unavailable'}
                      </Box>
                      <Box>
                        • WebContainer Ready:{' '}
                        {systemDiagnostic.webContainerReady ? '✅ Ready' : '⏳ Booting'}
                      </Box>
                      <Box>
                        • Pyodide Ready:{' '}
                        {systemDiagnostic.pyodideReady ? '✅ Ready' : '⏳ Idle/Not loaded'}
                      </Box>
                      <Box>• Browser: {systemDiagnostic.browserAgent}</Box>
                    </Box>
                  </Box>
                )}

                {/* 4. Problems Panel */}
                {activePanelTab === 'problems' && (
                  <Box
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1,
                      color: '#858585',
                      height: '100%',
                    }}
                  >
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                    <Typography sx={{ fontSize: '0.8125rem', color: '#cccccc' }}>
                      워크스페이스에서 감지된 문제(Problems)가 없습니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* 3. VS CODE BOTTOM STATUS BAR */}
      <Box
        sx={{
          height: 24,
          bgcolor: '#007acc',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          fontSize: '0.6875rem',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left Status Bar Items */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Branch */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}>
            <AccountTreeRoundedIcon sx={{ fontSize: 13 }} />
            <span>main*</span>
          </Box>

          {/* Sync */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <SyncRoundedIcon sx={{ fontSize: 13 }} />
          </Box>

          {/* Problems */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 13 }} />
            <span>0 0</span>
          </Box>

          {/* Server Port (If running) */}
          {activePort && (
            <Box
              sx={{
                bgcolor: 'rgba(0,0,0,0.25)',
                px: 0.8,
                py: 0.1,
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              ⚡ :{activePort}
            </Box>
          )}
        </Box>

        {/* Right Status Bar Items */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span style={{ fontWeight: 600 }}>{selectedTemplate.language.toUpperCase()}</span>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
