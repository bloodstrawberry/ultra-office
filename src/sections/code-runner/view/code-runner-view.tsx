'use client';

import type {
  PlotOutput,
  RunnerState,
  CodeTemplate,
  SupportedLanguage,
  SystemDiagnosticInfo,
} from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import VerticalSplitRoundedIcon from '@mui/icons-material/VerticalSplitRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

import { usePyodide } from '../core/use-pyodide';
import { CodeEditor } from '../components/code-editor';
import { useWasmRunner } from '../core/use-wasm-runner';
import { SplitResizer } from '../components/split-resizer';
import { useWebContainer } from '../core/use-webcontainer';
import { PreviewPanel } from '../components/preview-panel';
import { RunnerToolbar } from '../components/runner-toolbar';
import { usePolyglotRunner } from '../core/use-polyglot-runner';
import { TEMPLATES, getTemplatesByLanguage } from '../core/templates';
import { TerminalView, type TerminalRef } from '../components/terminal-view';
import { IDE_THEMES, getThemeById, DEFAULT_THEME_ID } from '../core/editor-themes';
import { buildHtmlPreview, buildReactPreviewHtml } from '../core/build-preview-html';

// ----------------------------------------------------------------------

const THEME_STORAGE_KEY = 'code-runner-theme';
const SPLIT_X_STORAGE_KEY = 'code-runner-split-x';
const SPLIT_Y_STORAGE_KEY = 'code-runner-split-y';

export function CodeRunnerView() {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate>(TEMPLATES[0]);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('javascript');
  const [activeFileName, setActiveFileName] = useState<string>('index.js');
  const [files, setFiles] = useState<Record<string, string>>(TEMPLATES[0].files);

  // Editor & IDE Settings
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(true);
  const [currentThemeId, setCurrentThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor-only' | 'terminal-only'>('split');

  // Split Panel Ratios & Resizing
  const [splitRatioX, setSplitRatioX] = useState<number>(50);
  const [splitRatioY, setSplitRatioY] = useState<number>(50);
  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const [hasLoadedSplits, setHasLoadedSplits] = useState(false);

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);

  // Safe Hydration: Load saved split ratios
  useEffect(() => {
    try {
      const savedX = localStorage.getItem(SPLIT_X_STORAGE_KEY);
      if (savedX) {
        const numX = Number(savedX);
        if (!isNaN(numX) && numX >= 15 && numX <= 85) {
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

  // Safe Hydration: Load saved theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && IDE_THEMES.some((t) => t.id === savedTheme)) {
        setCurrentThemeId(savedTheme);
      }
    } catch {
      // ignore storage access error
    }
    setHasLoadedTheme(true);
  }, []);

  // Sync theme changes to localStorage
  useEffect(() => {
    if (hasLoadedTheme) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, currentThemeId);
      } catch {
        // ignore storage access error
      }
    }
  }, [currentThemeId, hasLoadedTheme]);

  // Runner state
  const [runnerState, setRunnerState] = useState<RunnerState>({
    status: 'idle',
    currentEngine: 'webcontainer',
    activePort: null,
    previewUrl: null,
    exitCode: null,
    statusMessage: 'Ready',
    runningSince: null,
  });

  const [plots, setPlots] = useState<PlotOutput[]>([]);
  const [htmlPreviewContent, setHtmlPreviewContent] = useState<string>('');

  const terminalRef = useRef<TerminalRef | null>(null);
  const activeProcessRef = useRef<any>(null);

  // Runtimes
  const webcontainer = useWebContainer();
  const pyodide = usePyodide();
  const wasmRunner = useWasmRunner();
  const polyglotRunner = usePolyglotRunner();

  const activeTheme = getThemeById(currentThemeId);

  // Load initial template
  useEffect(() => {
    setFiles(selectedTemplate.files);
    setActiveFileName(selectedTemplate.mainFile);
    setCurrentLanguage(selectedTemplate.language);

    const initialCode = selectedTemplate.files[selectedTemplate.mainFile] || '';
    if (selectedTemplate.language === 'react' || selectedTemplate.engine === 'react-live') {
      setHtmlPreviewContent(buildReactPreviewHtml(initialCode));
    } else if (selectedTemplate.language === 'html' || selectedTemplate.engine === 'html-sandbox') {
      setHtmlPreviewContent(buildHtmlPreview(initialCode));
    } else {
      setHtmlPreviewContent('');
    }

    setRunnerState((prev) => ({
      ...prev,
      currentEngine: selectedTemplate.engine,
      status: 'idle',
      previewUrl: null,
      activePort: null,
    }));
  }, [selectedTemplate]);

  // Handle template switch
  const handleTemplateChange = (template: CodeTemplate) => {
    setSelectedTemplate(template);
    terminalRef.current?.writeln(
      `\r\n\x1b[35m[OmniRunner] 템플릿 변경: "${template.title}" (${template.category})\x1b[0m\r\n`
    );
  };

  // Handle language switch
  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    const matched = getTemplatesByLanguage(lang);
    if (matched.length > 0) {
      setSelectedTemplate(matched[0]);
    }
  };

  // Active file code change
  const handleCodeChange = (newCode: string) => {
    setFiles((prev) => ({
      ...prev,
      [activeFileName]: newCode,
    }));
  };

  // Stop running execution
  const handleStop = useCallback(() => {
    if (activeProcessRef.current) {
      try {
        activeProcessRef.current.kill();
      } catch {
        // ignore
      }
      activeProcessRef.current = null;
    }
    setRunnerState((prev) => ({
      ...prev,
      status: 'idle',
      statusMessage: 'Execution stopped',
    }));
    terminalRef.current?.writeln(
      '\r\n\x1b[31m⏹ [프로세스가 사용자에 의해 중단되었습니다]\x1b[0m\r\n'
    );
  }, []);

  // Execution dispatcher
  const handleRun = useCallback(async () => {
    if (runnerState.status === 'running') {
      handleStop();
    }

    const currentEngine = selectedTemplate.engine;
    const currentLang = selectedTemplate.language;
    const mainCode = files[activeFileName] || '';

    setRunnerState((prev) => ({
      ...prev,
      status: 'running',
      currentEngine,
      runningSince: Date.now(),
      statusMessage: 'Running...',
    }));

    terminalRef.current?.writeln(
      `\r\n\x1b[36m🚀 [실행 시작] ${selectedTemplate.title} (${currentLang.toUpperCase()} - ${currentEngine})\x1b[0m`
    );
    terminalRef.current?.writeln(
      '\x1b[90m--------------------------------------------------\x1b[0m'
    );

    try {
      // 1. SQL (In-Memory Database)
      if (currentLang === 'sql' || currentEngine === 'sql') {
        const ok = await polyglotRunner.runSql(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'Query OK' : 'SQL Error',
        }));
        return;
      }

      // 2. Python (Pyodide WebAssembly)
      if (currentEngine === 'pyodide' || currentLang === 'python') {
        const result = await pyodide.runPython(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg),
          (dataUrl) => {
            const newPlot: PlotOutput = {
              id: String(Date.now()),
              title: `차트 #${plots.length + 1}`,
              dataUrl,
              timestamp: Date.now(),
            };
            setPlots((prev) => [newPlot, ...prev]);
            terminalRef.current?.writeln(
              '\x1b[32m📈 [Matplotlib] 새 차트가 생성되어 결과 탭에 추가되었습니다.\x1b[0m'
            );
          }
        );

        setRunnerState((prev) => ({
          ...prev,
          status: result.success ? 'success' : 'error',
          statusMessage: result.success ? '완료 (Done)' : '실패 (Error)',
        }));
        return;
      }

      // 3. React Live Component & HTML Sandbox
      if (currentEngine === 'react-live' || currentLang === 'react') {
        const previewDoc = buildReactPreviewHtml(mainCode);
        setHtmlPreviewContent(previewDoc);
        terminalRef.current?.writeln(
          '\x1b[32m⚛️ [React Live] React 컴포넌트가 웹 미리보기에 성공적으로 마운트되었습니다.\x1b[0m\r\n'
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'React Live Mounted',
        }));
        return;
      }

      if (currentEngine === 'html-sandbox' || currentLang === 'html') {
        const previewDoc = buildHtmlPreview(mainCode);
        setHtmlPreviewContent(previewDoc);
        terminalRef.current?.writeln(
          '\x1b[32m🌐 [HTML Sandbox] 웹 미리보기가 렌더링되었습니다.\x1b[0m\r\n'
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'HTML Rendered',
        }));
        return;
      }

      // 4. Lua Runner
      if (currentLang === 'lua' || currentEngine === 'lua') {
        const ok = await polyglotRunner.runLua(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'Lua Done' : 'Lua Error',
        }));
        return;
      }

      // 5. Ruby Runner
      if (currentLang === 'ruby' || currentEngine === 'ruby') {
        const ok = await polyglotRunner.runRuby(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'Ruby Done' : 'Ruby Error',
        }));
        return;
      }

      // 6. PHP Runner
      if (currentLang === 'php' || currentEngine === 'php') {
        const ok = await polyglotRunner.runPhp(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'PHP Done' : 'PHP Error',
        }));
        return;
      }

      // 7. Go (Golang)
      if (currentLang === 'go') {
        const ok = await polyglotRunner.runGo(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'Go Done' : 'Go Error',
        }));
        return;
      }

      // 8. Java
      if (currentLang === 'java') {
        const ok = await polyglotRunner.runJava(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'Java Done' : 'Java Error',
        }));
        return;
      }

      // 9. Bash Shell
      if (currentLang === 'bash') {
        const ok = await polyglotRunner.runBash(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: ok ? 'success' : 'error',
          statusMessage: ok ? 'Bash Done' : 'Bash Error',
        }));
        return;
      }

      // 10. C / C++ / C# / Rust Wasm Runner
      if (currentLang === 'c') {
        await wasmRunner.runC(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'C Done',
        }));
        return;
      }

      if (currentLang === 'cpp') {
        await wasmRunner.runCpp(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'C++ Done',
        }));
        return;
      }

      if (currentLang === 'csharp') {
        await wasmRunner.runCsharp(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'C# Done',
        }));
        return;
      }

      if (currentLang === 'rust') {
        await wasmRunner.runRust(
          mainCode,
          (msg) => terminalRef.current?.write(msg),
          (msg) => terminalRef.current?.write(msg)
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'Rust Done',
        }));
        return;
      }

      // 11. WebContainer (Node.js / Express / TypeScript)
      if (
        currentEngine === 'webcontainer' ||
        currentLang === 'javascript' ||
        currentLang === 'typescript' ||
        currentLang === 'node-server'
      ) {
        if (!webcontainer.isCrossOriginIsolated) {
          terminalRef.current?.writeln(
            '\x1b[33m⚠️ WebContainer는 브라우저 보안 헤더(Cross-Origin Isolation)가 활성화되어야 작동합니다.\x1b[0m'
          );
          terminalRef.current?.writeln(
            '\x1b[36m💡 개발 모드에서는 next.config.ts의 COOP/COEP 헤더를 통해 자동 적용됩니다.\x1b[0m\r\n'
          );
        }

        // 가상 파일 시스템 마운트
        terminalRef.current?.writeln('\x1b[90m[WebContainer] 가상 파일 시스템 마운트 중...\x1b[0m');
        await webcontainer.mountFiles(files);

        // Express 웹 서버인 경우
        if (selectedTemplate.isServer) {
          terminalRef.current?.writeln(
            '\x1b[36m[WebContainer] Node.js 웹 서버 인스턴스 기동 중...\x1b[0m'
          );
          const proc = await webcontainer.startServer(
            'node',
            [activeFileName],
            (port, url) => {
              terminalRef.current?.writeln(
                `\r\n\x1b[1;32m🎉 [Server Ready] 웹 서버가 포트 ${port}에서 활성화되었습니다!\x1b[0m`
              );
              terminalRef.current?.writeln(`\x1b[36m👉 Preview URL: ${url}\x1b[0m\r\n`);
              setRunnerState((prev) => ({
                ...prev,
                activePort: port,
                previewUrl: url,
                status: 'running',
                statusMessage: `Running on :${port}`,
              }));
            },
            (data) => terminalRef.current?.write(data)
          );
          activeProcessRef.current = proc;
          return;
        }

        // 일반 Node.js / TypeScript 스크립트 실행
        const cmdParts = (selectedTemplate.entryCommand || `node ${activeFileName}`).split(' ');
        const [bin, ...args] = cmdParts;

        terminalRef.current?.writeln(`\x1b[90m$ ${selectedTemplate.entryCommand}\x1b[0m\r\n`);

        const proc = await webcontainer.spawnCommand(
          bin,
          args,
          (data) => terminalRef.current?.write(data),
          (exitCode) => {
            terminalRef.current?.writeln(
              `\r\n\x1b[32m✨ [프로세스 완료 (Exit Code: ${exitCode})]\x1b[0m\r\n`
            );
            setRunnerState((prev) => ({
              ...prev,
              status: exitCode === 0 ? 'success' : 'error',
              exitCode,
              statusMessage: `Exited (${exitCode})`,
            }));
          }
        );
        activeProcessRef.current = proc;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      terminalRef.current?.writeln(`\r\n\x1b[31m❌ [실행 오류]: ${errMsg}\x1b[0m\r\n`);
      setRunnerState((prev) => ({
        ...prev,
        status: 'error',
        statusMessage: 'Error',
      }));
    }
  }, [
    files,
    activeFileName,
    selectedTemplate,
    runnerState.status,
    pyodide,
    wasmRunner,
    polyglotRunner,
    webcontainer,
    plots.length,
    handleStop,
  ]);

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
    setSplitRatioX(50);
  }, []);

  const handleResetSplitY = useCallback(() => {
    setSplitRatioY(50);
  }, []);

  useEffect(() => {
    if (isDraggingX || isDraggingY) {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingX && workspaceRef.current) {
          const rect = workspaceRef.current.getBoundingClientRect();
          if (rect.width > 0) {
            const offsetX = e.clientX - rect.left;
            const ratio = (offsetX / rect.width) * 100;
            const clamped = Math.min(Math.max(ratio, 15), 85);
            setSplitRatioX(clamped);
          }
        }

        if (isDraggingY && rightPanelRef.current) {
          const rect = rightPanelRef.current.getBoundingClientRect();
          if (rect.height > 0) {
            const offsetY = e.clientY - rect.top;
            const ratio = (offsetY / rect.height) * 100;
            const clamped = Math.min(Math.max(ratio, 15), 85);
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

  // Code Reset
  const handleReset = () => {
    setFiles(selectedTemplate.files);
  };

  // Download active file
  const handleDownload = () => {
    const content = files[activeFileName] || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy code
  const handleCopyCode = () => {
    const content = files[activeFileName] || '';
    navigator.clipboard.writeText(content);
  };

  const fileNames = Object.keys(files);

  const systemDiagnostic: SystemDiagnosticInfo = {
    isCrossOriginIsolated: webcontainer.isCrossOriginIsolated,
    hasSharedArrayBuffer:
      typeof window !== 'undefined' && typeof window.SharedArrayBuffer !== 'undefined',
    webContainerReady: webcontainer.isReady,
    pyodideReady: pyodide.isReady,
    browserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: '100%' },
        minHeight: { xs: '100dvh', md: 'auto' },
        width: '100%',
        bgcolor: activeTheme.uiColors.bg,
        color: activeTheme.uiColors.text,
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      {/* Top Toolbar */}
      <RunnerToolbar
        currentLanguage={currentLanguage}
        currentTemplateId={selectedTemplate.id}
        currentThemeId={currentThemeId}
        runnerState={runnerState}
        fontSize={fontSize}
        minimap={minimap}
        onLanguageChange={handleLanguageChange}
        onTemplateChange={handleTemplateChange}
        onThemeChange={setCurrentThemeId}
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleReset}
        onDownload={handleDownload}
        onCopyCode={handleCopyCode}
        onFontSizeChange={setFontSize}
        onMinimapToggle={() => setMinimap((p) => !p)}
      />

      {/* Main Workspace (Editor + Preview & Terminal Split) */}
      <Box
        ref={workspaceRef}
        sx={{
          display: 'flex',
          flex: 1,
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' },
          height: { xs: 'auto', md: 'calc(100% - 53px)' },
          overflow: { xs: 'visible', md: 'hidden' },
          position: 'relative',
        }}
      >
        {/* Transparent Drag Overlay to prevent iframe capturing mouse events */}
        {(isDraggingX || isDraggingY) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              cursor: isDraggingX ? 'col-resize' : 'row-resize',
              userSelect: 'none',
            }}
          />
        )}

        {/* Left Side: Code Editor with File Tabs */}
        {(layoutMode === 'split' || layoutMode === 'editor-only') && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: layoutMode === 'editor-only' ? '100%' : { xs: '100%', md: `${splitRatioX}%` },
              flexShrink: 0,
              height: { xs: 'auto', md: '100%' },
              minHeight: { xs: 350, md: 'auto' },
              bgcolor: activeTheme.previewBg,
              borderRight:
                layoutMode === 'editor-only'
                  ? 'none'
                  : { xs: 'none', md: `1px solid ${activeTheme.uiColors.border}` },
              borderBottom: { xs: `1px solid ${activeTheme.uiColors.border}`, md: 'none' },
              overflow: { xs: 'visible', md: 'hidden' },
            }}
          >
            {/* File Tabs Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: activeTheme.uiColors.surface,
                borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                px: 1,
                minHeight: 36,
              }}
            >
              <Tabs
                value={activeFileName}
                onChange={(_, val) => setActiveFileName(val)}
                sx={{
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    py: 0.5,
                    px: 1.5,
                    fontSize: '12px',
                    color: activeTheme.uiColors.textMuted,
                    fontFamily: 'monospace',
                    textTransform: 'none',
                    '&.Mui-selected': {
                      bgcolor: activeTheme.previewBg,
                      color: activeTheme.previewAccent,
                      fontWeight: 600,
                      borderTop: `2px solid ${activeTheme.previewAccent}`,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {fileNames.map((fileName) => (
                  <Tab
                    key={fileName}
                    value={fileName}
                    icon={<InsertDriveFileRoundedIcon sx={{ fontSize: 14 }} />}
                    iconPosition="start"
                    label={fileName}
                  />
                ))}
              </Tabs>

              {/* Layout controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={layoutMode === 'split' ? '에디터 전체 화면' : '화면 분할'}>
                  <IconButton
                    size="small"
                    onClick={() => setLayoutMode((p) => (p === 'split' ? 'editor-only' : 'split'))}
                    sx={{ color: activeTheme.uiColors.textMuted }}
                  >
                    {layoutMode === 'split' ? (
                      <FullscreenRoundedIcon sx={{ fontSize: 17 }} />
                    ) : (
                      <VerticalSplitRoundedIcon sx={{ fontSize: 17 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Monaco Editor Container */}
            <Box sx={{ flex: 1, height: { xs: 350, md: '100%' }, overflow: 'hidden' }}>
              <CodeEditor
                language={selectedTemplate.language}
                value={files[activeFileName] || ''}
                onChange={handleCodeChange}
                onRun={handleRun}
                themeId={currentThemeId}
                fontSize={fontSize}
                minimap={minimap}
              />
            </Box>
          </Box>
        )}

        {/* Vertical Split Resizer (between Editor and Right Panel) */}
        {layoutMode === 'split' && (
          <SplitResizer
            direction="vertical"
            isDragging={isDraggingX}
            theme={activeTheme}
            onMouseDown={handleMouseDownX}
            onDoubleClick={handleResetSplitX}
            tooltipText="좌우 너비 조절 (더블 클릭: 5:5 복원)"
          />
        )}

        {/* Right Side: Split between Preview Panel (Top) and Terminal (Bottom) */}
        {(layoutMode === 'split' || layoutMode === 'terminal-only') &&
          (() => {
            const hasWebPreview =
              selectedTemplate.language === 'react' ||
              selectedTemplate.language === 'html' ||
              selectedTemplate.language === 'node-server' ||
              selectedTemplate.engine === 'react-live' ||
              selectedTemplate.engine === 'html-sandbox' ||
              Boolean(runnerState.previewUrl) ||
              plots.length > 0;

            return (
              <Box
                ref={rightPanelRef}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  width:
                    layoutMode === 'terminal-only'
                      ? '100%'
                      : { xs: '100%', md: `calc(${100 - splitRatioX}% - 6px)` },
                  minWidth: 0,
                  height: { xs: 'auto', md: '100%' },
                  bgcolor: activeTheme.terminalTheme.background || '#0d1117',
                  overflow: { xs: 'visible', md: 'hidden' },
                }}
              >
                {hasWebPreview ? (
                  <>
                    {/* Top: Preview Panel (Live Server / Matplotlib Plots / System Info) */}
                    <Box
                      sx={{
                        height: { xs: 320, md: `${splitRatioY}%` },
                        minHeight: { xs: 280, md: 'auto' },
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <PreviewPanel
                        themeId={currentThemeId}
                        previewUrl={runnerState.previewUrl}
                        htmlContent={
                          selectedTemplate.engine === 'react-live' ||
                          selectedTemplate.language === 'react'
                            ? htmlPreviewContent ||
                              buildReactPreviewHtml(files['App.jsx'] || files[activeFileName] || '')
                            : selectedTemplate.engine === 'html-sandbox' ||
                                selectedTemplate.language === 'html'
                              ? htmlPreviewContent ||
                                buildHtmlPreview(files['index.html'] || files[activeFileName] || '')
                              : undefined
                        }
                        isServerRunning={
                          runnerState.status === 'running' && Boolean(runnerState.previewUrl)
                        }
                        activePort={runnerState.activePort}
                        plots={plots}
                        onClearPlots={() => setPlots([])}
                        systemInfo={systemDiagnostic}
                      />
                    </Box>

                    {/* Horizontal Split Resizer (between Preview Panel and Terminal) */}
                    <SplitResizer
                      direction="horizontal"
                      isDragging={isDraggingY}
                      theme={activeTheme}
                      onMouseDown={handleMouseDownY}
                      onDoubleClick={handleResetSplitY}
                      tooltipText="상하 높이 조절 (더블 클릭: 5:5 복원)"
                    />

                    {/* Bottom: XTerm Terminal */}
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: { xs: 240, md: 0 },
                        overflow: 'hidden',
                      }}
                    >
                      <TerminalView
                        ref={terminalRef}
                        themeId={currentThemeId}
                        title="콘솔 출력 & 터미널"
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
                        onRestart={() => handleRun()}
                      />
                    </Box>
                  </>
                ) : (
                  /* Full-height Terminal when no web preview is needed */
                  <Box
                    sx={{
                      flex: 1,
                      height: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <TerminalView
                      ref={terminalRef}
                      themeId={currentThemeId}
                      title="콘솔 출력 & 터미널"
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
                      onRestart={() => handleRun()}
                    />
                  </Box>
                )}
              </Box>
            );
          })()}
      </Box>
    </Box>
  );
}
