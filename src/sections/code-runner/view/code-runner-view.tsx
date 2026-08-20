'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VerticalSplitRoundedIcon from '@mui/icons-material/VerticalSplitRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

import { useWebContainer } from '../core/use-webcontainer';
import { usePyodide } from '../core/use-pyodide';
import { useWasmRunner } from '../core/use-wasm-runner';
import { usePolyglotRunner } from '../core/use-polyglot-runner';
import { TEMPLATES } from '../core/templates';
import { CodeEditor } from '../components/code-editor';
import { TerminalView, type TerminalRef } from '../components/terminal-view';
import { PreviewPanel } from '../components/preview-panel';
import { RunnerToolbar } from '../components/runner-toolbar';
import type {
  CodeTemplate,
  PlotOutput,
  RunnerState,
  SupportedLanguage,
  SystemDiagnosticInfo,
} from '../types';

// ----------------------------------------------------------------------

export function CodeRunnerView() {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate>(TEMPLATES[0]);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('javascript');
  const [activeFileName, setActiveFileName] = useState<string>('index.js');
  const [files, setFiles] = useState<Record<string, string>>(TEMPLATES[0].files);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Editor Settings
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(true);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor-only' | 'terminal-only'>('split');

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

  // Load initial template
  useEffect(() => {
    setFiles(selectedTemplate.files);
    setActiveFileName(selectedTemplate.mainFile);
    setCurrentLanguage(selectedTemplate.language);
    setRunnerState((prev) => ({
      ...prev,
      currentEngine: selectedTemplate.engine,
      status: 'idle',
      previewUrl: null,
      activePort: null,
    }));
    setHasLoaded(true);
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
    const matched = TEMPLATES.find((t) => t.language === lang);
    if (matched) {
      setSelectedTemplate(matched);
    } else {
      setCurrentLanguage(lang);
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
      if (currentEngine === 'html-sandbox' || currentLang === 'react' || currentLang === 'html') {
        setHtmlPreviewContent(mainCode);
        terminalRef.current?.writeln(
          '\x1b[32m✅ 라이브 프리뷰 마운트가 완료되었습니다.\x1b[0m\r\n'
        );
        setRunnerState((prev) => ({
          ...prev,
          status: 'success',
          statusMessage: 'Live Rendered',
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

      // 10. C / Rust Wasm Runner
      if (currentLang === 'c' || currentLang === 'cpp') {
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
        height: '100%',
        width: '100%',
        bgcolor: '#090d16',
        color: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Top Toolbar */}
      <RunnerToolbar
        currentLanguage={currentLanguage}
        currentTemplateId={selectedTemplate.id}
        runnerState={runnerState}
        fontSize={fontSize}
        minimap={minimap}
        theme={editorTheme}
        onLanguageChange={handleLanguageChange}
        onTemplateChange={handleTemplateChange}
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleReset}
        onDownload={handleDownload}
        onCopyCode={handleCopyCode}
        onFontSizeChange={setFontSize}
        onMinimapToggle={() => setMinimap((p) => !p)}
        onThemeToggle={() => setEditorTheme((p) => (p === 'vs-dark' ? 'light' : 'vs-dark'))}
      />

      {/* Main Workspace (Editor + Preview & Terminal Split) */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: 'calc(100% - 53px)',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Code Editor with File Tabs */}
        {(layoutMode === 'split' || layoutMode === 'editor-only') && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: layoutMode === 'editor-only' ? 1 : 1.1,
              height: '100%',
              bgcolor: '#1e1e1e',
              borderRight: '1px solid #1e293b',
              overflow: 'hidden',
            }}
          >
            {/* File Tabs Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#181818',
                borderBottom: '1px solid #2d2d2d',
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
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    textTransform: 'none',
                    '&.Mui-selected': {
                      bgcolor: '#1e1e1e',
                      color: '#38bdf8',
                      fontWeight: 600,
                      borderTop: '2px solid #38bdf8',
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
                    sx={{ color: '#94a3b8' }}
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
            <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
              <CodeEditor
                language={selectedTemplate.language}
                value={files[activeFileName] || ''}
                onChange={handleCodeChange}
                onRun={handleRun}
                theme={editorTheme}
                fontSize={fontSize}
                minimap={minimap}
              />
            </Box>
          </Box>
        )}

        {/* Right Side: Split between Preview Panel (Top) and Terminal (Bottom) */}
        {(layoutMode === 'split' || layoutMode === 'terminal-only') && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: layoutMode === 'terminal-only' ? 1 : 0.9,
              height: '100%',
              bgcolor: '#0d1117',
              overflow: 'hidden',
            }}
          >
            {/* Top: Preview Panel (Live Server / Matplotlib Plots / System Info) */}
            <Box sx={{ flex: 1, height: '50%', overflow: 'hidden' }}>
              <PreviewPanel
                previewUrl={runnerState.previewUrl}
                htmlContent={
                  selectedTemplate.engine === 'html-sandbox' ||
                  selectedTemplate.language === 'react' ||
                  selectedTemplate.language === 'html'
                    ? htmlPreviewContent || files['index.html'] || files['App.jsx']
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

            {/* Bottom: XTerm Terminal */}
            <Box sx={{ flex: 1, height: '50%', overflow: 'hidden' }}>
              <TerminalView
                ref={terminalRef}
                title="콘솔 출력 & 터미널"
                statusLabel={runnerState.statusMessage}
                statusColor={
                  runnerState.status === 'running'
                    ? 'warning'
                    : runnerState.status === 'success'
                      ? 'success'
                      : runnerState.status === 'error'
                        ? 'error'
                        : 'info'
                }
                onClear={() => terminalRef.current?.clear()}
                onRestart={() => handleRun()}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
