'use client';

import type {
  MatlabFile,
  MatlabFigure,
  MatlabVariable,
  MatlabCommandLog,
  MatlabToolstripTab,
  MatlabLayoutPreset,
} from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';

import { getThemeById, DEFAULT_THEME_ID } from 'src/sections/code-runner/core/editor-themes';

import { MatlabRuntime } from '../engine/matlab-runtime';
import { MatlabEditor } from '../components/matlab-editor';
import { MatlabWorkspace } from '../components/matlab-workspace';
import { MatlabToolstrip } from '../components/matlab-toolstrip';
import { MatlabAppsDialog } from '../components/matlab-apps-dialog';
import { MatlabHelpDialog } from '../components/matlab-help-dialog';
import { MatlabFigureViewer } from '../components/matlab-figure-viewer';
import { MatlabSplitResizer } from '../components/matlab-split-resizer';
import { MatlabCurrentFolder } from '../components/matlab-current-folder';
import { MatlabCommandWindow } from '../components/matlab-command-window';
import { MATLAB_TEMPLATES, type MatlabTemplate } from '../engine/templates';
import { MatlabVariableEditorDialog } from '../components/matlab-variable-editor-dialog';

// ----------------------------------------------------------------------

const STORAGE_KEY_FILES = 'matlab-studio-files';
const STORAGE_KEY_ACTIVE_FILE = 'matlab-studio-active-file';
const STORAGE_KEY_THEME = 'matlab-theme';
const STORAGE_KEY_SPLIT_LEFT_W = 'matlab-split-left-w';
const STORAGE_KEY_SPLIT_LEFT_Y = 'matlab-split-left-y';
const STORAGE_KEY_SPLIT_CENTER_X = 'matlab-split-center-x';
const STORAGE_KEY_SPLIT_CENTER_Y = 'matlab-split-center-y';

let viewIdCounter = 0;
function createUniqueId(prefix: string): string {
  viewIdCounter += 1;
  return `${prefix}-${Date.now()}-${viewIdCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MatlabView() {
  // Runtime reference
  const runtimeRef = useRef<MatlabRuntime | null>(null);
  if (!runtimeRef.current) {
    runtimeRef.current = new MatlabRuntime();
  }

  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);

  // Toolstrip & Layout state
  const [toolstripTab, setToolstripTab] = useState<MatlabToolstripTab>('HOME');
  const [layoutPreset, setLayoutPreset] = useState<MatlabLayoutPreset>('standard');
  const [isRunning, setIsRunning] = useState(false);

  // Split panel ratios & dragging states
  const [splitLeftW, setSplitLeftW] = useState<number>(20);
  const [splitLeftY, setSplitLeftY] = useState<number>(50);
  const [splitCenterX, setSplitCenterX] = useState<number>(55);
  const [splitCenterY, setSplitCenterY] = useState<number>(58);

  const [isDraggingLeftW, setIsDraggingLeftW] = useState(false);
  const [isDraggingLeftY, setIsDraggingLeftY] = useState(false);
  const [isDraggingCenterX, setIsDraggingCenterX] = useState(false);
  const [isDraggingCenterY, setIsDraggingCenterY] = useState(false);
  const [hasLoadedSplits, setHasLoadedSplits] = useState(false);

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const centerRightContainerRef = useRef<HTMLDivElement | null>(null);
  const centerPanelRef = useRef<HTMLDivElement | null>(null);

  // Files state
  const [files, setFiles] = useState<MatlabFile[]>(MATLAB_TEMPLATES[0].files);
  const [activeFileId, setActiveFileId] = useState<string>(MATLAB_TEMPLATES[0].files[0].id);
  const [hasLoadedFiles, setHasLoadedFiles] = useState(false);

  // Logs & Variables & Figures state
  const [logs, setLogs] = useState<MatlabCommandLog[]>([]);
  const [variables, setVariables] = useState<Record<string, MatlabVariable>>({});
  const [selectedVarName, setSelectedVarName] = useState<string | null>(null);
  const [figures, setFigures] = useState<MatlabFigure[]>([]);
  const [activeFigureId, setActiveFigureId] = useState<string | null>(null);

  // Dialogs state
  const [editingVariable, setEditingVariable] = useState<MatlabVariable | null>(null);
  const [activeAppType, setActiveAppType] = useState<'linalg' | 'fft' | 'ode' | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Safe Hydration: Load saved split ratios
  useEffect(() => {
    try {
      const savedLeftW = localStorage.getItem(STORAGE_KEY_SPLIT_LEFT_W);
      if (savedLeftW) {
        const val = Number(savedLeftW);
        if (!isNaN(val) && val >= 10 && val <= 45) setSplitLeftW(val);
      }
      const savedLeftY = localStorage.getItem(STORAGE_KEY_SPLIT_LEFT_Y);
      if (savedLeftY) {
        const val = Number(savedLeftY);
        if (!isNaN(val) && val >= 15 && val <= 85) setSplitLeftY(val);
      }
      const savedCenterX = localStorage.getItem(STORAGE_KEY_SPLIT_CENTER_X);
      if (savedCenterX) {
        const val = Number(savedCenterX);
        if (!isNaN(val) && val >= 15 && val <= 85) setSplitCenterX(val);
      }
      const savedCenterY = localStorage.getItem(STORAGE_KEY_SPLIT_CENTER_Y);
      if (savedCenterY) {
        const val = Number(savedCenterY);
        if (!isNaN(val) && val >= 15 && val <= 85) setSplitCenterY(val);
      }
    } catch {
      // ignore
    }
    setHasLoadedSplits(true);
  }, []);

  // Sync split ratios to localStorage
  useEffect(() => {
    if (hasLoadedSplits) {
      try {
        localStorage.setItem(STORAGE_KEY_SPLIT_LEFT_W, String(Math.round(splitLeftW)));
      } catch {
        // ignore
      }
    }
  }, [splitLeftW, hasLoadedSplits]);

  useEffect(() => {
    if (hasLoadedSplits) {
      try {
        localStorage.setItem(STORAGE_KEY_SPLIT_LEFT_Y, String(Math.round(splitLeftY)));
      } catch {
        // ignore
      }
    }
  }, [splitLeftY, hasLoadedSplits]);

  useEffect(() => {
    if (hasLoadedSplits) {
      try {
        localStorage.setItem(STORAGE_KEY_SPLIT_CENTER_X, String(Math.round(splitCenterX)));
      } catch {
        // ignore
      }
    }
  }, [splitCenterX, hasLoadedSplits]);

  useEffect(() => {
    if (hasLoadedSplits) {
      try {
        localStorage.setItem(STORAGE_KEY_SPLIT_CENTER_Y, String(Math.round(splitCenterY)));
      } catch {
        // ignore
      }
    }
  }, [splitCenterY, hasLoadedSplits]);

  // Adjust splits when layoutPreset changes
  useEffect(() => {
    if (layoutPreset === 'wide-plot') {
      setSplitLeftW(16);
      setSplitCenterX(42);
    } else if (layoutPreset === 'editor-focus') {
      setSplitLeftW(18);
      setSplitCenterX(68);
    } else {
      setSplitLeftW(20);
      setSplitCenterX(55);
    }
  }, [layoutPreset]);

  // Drag handlers
  const handleMouseDownLeftW = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLeftW(true);
  }, []);

  const handleMouseDownLeftY = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLeftY(true);
  }, []);

  const handleMouseDownCenterX = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCenterX(true);
  }, []);

  const handleMouseDownCenterY = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCenterY(true);
  }, []);

  const handleResetLeftW = useCallback(() => setSplitLeftW(20), []);
  const handleResetLeftY = useCallback(() => setSplitLeftY(50), []);
  const handleResetCenterX = useCallback(() => setSplitCenterX(55), []);
  const handleResetCenterY = useCallback(() => setSplitCenterY(58), []);

  useEffect(() => {
    if (isDraggingLeftW || isDraggingLeftY || isDraggingCenterX || isDraggingCenterY) {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingLeftW && workspaceRef.current) {
          const rect = workspaceRef.current.getBoundingClientRect();
          if (rect.width > 0) {
            const offsetX = e.clientX - rect.left;
            const ratio = (offsetX / rect.width) * 100;
            setSplitLeftW(Math.min(Math.max(ratio, 10), 40));
          }
        }

        if (isDraggingLeftY && leftPanelRef.current) {
          const rect = leftPanelRef.current.getBoundingClientRect();
          if (rect.height > 0) {
            const offsetY = e.clientY - rect.top;
            const ratio = (offsetY / rect.height) * 100;
            setSplitLeftY(Math.min(Math.max(ratio, 15), 85));
          }
        }

        if (isDraggingCenterX && centerRightContainerRef.current) {
          const rect = centerRightContainerRef.current.getBoundingClientRect();
          if (rect.width > 0) {
            const offsetX = e.clientX - rect.left;
            const ratio = (offsetX / rect.width) * 100;
            setSplitCenterX(Math.min(Math.max(ratio, 15), 85));
          }
        }

        if (isDraggingCenterY && centerPanelRef.current) {
          const rect = centerPanelRef.current.getBoundingClientRect();
          if (rect.height > 0) {
            const offsetY = e.clientY - rect.top;
            const ratio = (offsetY / rect.height) * 100;
            setSplitCenterY(Math.min(Math.max(ratio, 15), 85));
          }
        }
      };

      const handleMouseUp = () => {
        setIsDraggingLeftW(false);
        setIsDraggingLeftY(false);
        setIsDraggingCenterX(false);
        setIsDraggingCenterY(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDraggingLeftW, isDraggingLeftY, isDraggingCenterX, isDraggingCenterY]);

  // Safe Hydration: Load saved files from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE_FILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFiles(parsed);
          if (savedActive && parsed.some((f: MatlabFile) => f.id === savedActive)) {
            setActiveFileId(savedActive);
          } else {
            setActiveFileId(parsed[0].id);
          }
        }
      }
    } catch {
      // ignore
    }
    setHasLoadedFiles(true);
  }, []);

  // Sync files to localStorage
  useEffect(() => {
    if (hasLoadedFiles) {
      try {
        localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
        localStorage.setItem(STORAGE_KEY_ACTIVE_FILE, activeFileId);
      } catch {
        // ignore
      }
    }
  }, [files, activeFileId, hasLoadedFiles]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Execute full script
  const handleRunScript = useCallback(() => {
    if (!runtimeRef.current || !activeFile) return;

    setIsRunning(true);
    const startLog: MatlabCommandLog = {
      id: createUniqueId('in'),
      type: 'input',
      content: `run('${activeFile.name}')`,
      timestamp: Date.now(),
    };

    const res = runtimeRef.current.execute(activeFile.content);

    setLogs((prev) => [...prev, startLog, ...res.logs]);
    setVariables(res.variables);
    setFigures(res.figures);
    if (res.figures.length > 0) {
      setActiveFigureId(res.figures[res.figures.length - 1].id);
    }
    setIsRunning(false);
  }, [activeFile]);

  // Initial auto run of template on mount
  useEffect(() => {
    if (hasLoadedFiles && files.length > 0) {
      handleRunScript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoadedFiles]);

  // Execute section or selection
  const handleRunSelection = useCallback((codeSnippet: string) => {
    if (!runtimeRef.current) return;

    const startLog: MatlabCommandLog = {
      id: createUniqueId('in'),
      type: 'input',
      content: codeSnippet.split('\n')[0] + (codeSnippet.includes('\n') ? ' ...' : ''),
      timestamp: Date.now(),
    };

    const res = runtimeRef.current.execute(codeSnippet);

    setLogs((prev) => [...prev, startLog, ...res.logs]);
    setVariables(res.variables);
    setFigures(res.figures);
    if (res.figures.length > 0) {
      setActiveFigureId(res.figures[res.figures.length - 1].id);
    }
  }, []);

  // Execute command from Command Window REPL
  const handleExecuteCommand = useCallback((cmd: string) => {
    if (!runtimeRef.current) return;

    const startLog: MatlabCommandLog = {
      id: createUniqueId('in'),
      type: 'input',
      content: cmd,
      timestamp: Date.now(),
    };

    const res = runtimeRef.current.execute(cmd);

    setLogs((prev) => [...prev, startLog, ...res.logs]);
    setVariables(res.variables);
    setFigures(res.figures);
    if (res.figures.length > 0) {
      setActiveFigureId(res.figures[res.figures.length - 1].id);
    }
  }, []);

  // Code change in editor
  const handleCodeChange = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent, isModified: true } : f))
    );
  };

  // Add new .m file
  const handleNewFile = () => {
    const newIdx = files.length + 1;
    const newFile: MatlabFile = {
      id: createUniqueId('file'),
      name: `untitled${newIdx}.m`,
      content: `% Untitled Script\n% Created: ${new Date().toLocaleTimeString()}\n\nx = linspace(0, 10, 100);\ny = cos(x);\nplot(x, y);\ntitle('Cosine Wave');\ngrid on;\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  // Close file
  const handleCloseFile = (fileId: string) => {
    if (files.length <= 1) return;
    const remain = files.filter((f) => f.id !== fileId);
    setFiles(remain);
    if (activeFileId === fileId) {
      setActiveFileId(remain[0].id);
    }
  };

  // Load template
  const handleLoadTemplate = (tpl: MatlabTemplate) => {
    setFiles(tpl.files);
    setActiveFileId(tpl.files[0].id);
    if (runtimeRef.current) {
      runtimeRef.current.clearWorkspace();
      const res = runtimeRef.current.execute(tpl.files[0].content);
      setLogs([
        {
          id: createUniqueId('info'),
          type: 'info',
          content: `[템플릿 로드 완료: ${tpl.title}]`,
          timestamp: Date.now(),
        },
        ...res.logs,
      ]);
      setVariables(res.variables);
      setFigures(res.figures);
      if (res.figures.length > 0) {
        setActiveFigureId(res.figures[0].id);
      }
    }
  };

  // Reset current template
  const handleResetToTemplate = () => {
    const matched =
      MATLAB_TEMPLATES.find((t) => t.files.some((f) => f.name === activeFile.name)) ||
      MATLAB_TEMPLATES[0];
    handleLoadTemplate(matched);
  };

  // Upload file
  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || '');
      const newFile: MatlabFile = {
        id: createUniqueId('file'),
        name: file.name.endsWith('.m') ? file.name : `${file.name}.m`,
        content,
      };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
    };
    reader.readAsText(file);
  };

  // Download file
  const handleDownloadFile = (file: MatlabFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick plot from variable or toolstrip
  const handleQuickPlot = (plotType: string) => {
    const targetVar = selectedVarName || 'ans';
    if (!targetVar) return;
    const cmd = `${plotType}(${targetVar}); title('${plotType}(${targetVar})'); grid on;`;
    handleExecuteCommand(cmd);
  };

  // Save variable value from Variable Editor Dialog
  const handleSaveVariableValue = (varName: string, newValue: any) => {
    if (runtimeRef.current) {
      (runtimeRef.current as any).scope[varName] = newValue;
      const updated = runtimeRef.current.extractVariables();
      setVariables(updated);
      setLogs((prev) => [
        ...prev,
        {
          id: createUniqueId('info'),
          type: 'info',
          content: `[변수 '${varName}'의 값이 Variable Editor를 통해 업데이트되었습니다]`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    if (runtimeRef.current) {
      runtimeRef.current.clearWorkspace();
      setVariables({});
      setSelectedVarName(null);
      setLogs((prev) => [
        ...prev,
        {
          id: createUniqueId('info'),
          type: 'info',
          content: '[Workspace 변수가 초기화되었습니다 (clear)]',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Clear console
  const handleClearConsole = () => {
    setLogs([]);
  };

  // Clear figures
  const handleClearFigures = () => {
    if (runtimeRef.current) {
      runtimeRef.current.clearFigures();
      setFigures([]);
      setActiveFigureId(null);
    }
  };

  // Insert snippet or code into active file
  const handleInsertCode = (code: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, content: f.content + '\n' + code, isModified: true } : f
      )
    );
    handleRunSelection(code);
  };

  const activeTheme = getThemeById(currentThemeId);

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
      {/* Top MATLAB Ribbon Toolstrip */}
      <MatlabToolstrip
        activeTab={toolstripTab}
        onTabChange={setToolstripTab}
        isRunning={isRunning}
        onRunScript={handleRunScript}
        onRunSection={() => handleRunSelection(activeFile?.content || '')}
        onStop={() => setIsRunning(false)}
        onNewScript={handleNewFile}
        onSaveScript={() => handleDownloadFile(activeFile)}
        onClearWorkspace={handleClearWorkspace}
        onClearConsole={handleClearConsole}
        onQuickPlot={handleQuickPlot}
        selectedVarName={selectedVarName}
        currentLayout={layoutPreset}
        onLayoutChange={setLayoutPreset}
        onOpenApp={(app) => setActiveAppType(app)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onInsertSnippet={handleInsertCode}
        currentThemeId={currentThemeId}
        onThemeChange={setCurrentThemeId}
      />

      {/* Main Docking Layout Workspace */}
      <Box
        ref={workspaceRef}
        sx={{
          display: 'flex',
          flex: 1,
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' },
          height: { xs: 'auto', md: 'calc(100% - 88px)' },
          overflow: { xs: 'visible', md: 'hidden' },
          p: 0.5,
          position: 'relative',
        }}
      >
        {/* --- LEFT PANEL: Current Folder + Workspace --- */}
        {layoutPreset !== 'editor-focus' && (
          <>
            <Box
              ref={leftPanelRef}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: { xs: '100%', md: `${splitLeftW}%` },
                height: { xs: 'auto', md: '100%' },
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {/* Current Folder (Top Left) */}
              <Box
                sx={{ height: { xs: 240, md: `calc(${splitLeftY}% - 3px)` }, overflow: 'hidden' }}
              >
                <MatlabCurrentFolder
                  files={files}
                  activeFileId={activeFileId}
                  templates={MATLAB_TEMPLATES}
                  onSelectFile={setActiveFileId}
                  onNewFile={handleNewFile}
                  onDeleteFile={handleCloseFile}
                  onUploadFile={handleUploadFile}
                  onDownloadFile={handleDownloadFile}
                  onLoadTemplate={handleLoadTemplate}
                  themeId={currentThemeId}
                />
              </Box>

              {/* Horizontal Divider between Folder & Workspace */}
              <MatlabSplitResizer
                direction="horizontal"
                isDragging={isDraggingLeftY}
                theme={activeTheme}
                onMouseDown={handleMouseDownLeftY}
                onDoubleClick={handleResetLeftY}
                tooltipText="폴더/작업공간 높이 조절 (더블 클릭 시 초기화)"
              />

              {/* Workspace (Bottom Left) */}
              <Box
                sx={{
                  height: { xs: 240, md: `calc(${100 - splitLeftY}% - 3px)` },
                  overflow: 'hidden',
                }}
              >
                <MatlabWorkspace
                  variables={variables}
                  selectedVarName={selectedVarName}
                  onSelectVariable={setSelectedVarName}
                  onOpenVariableEditor={setEditingVariable}
                  onQuickPlot={handleQuickPlot}
                  onClearWorkspace={handleClearWorkspace}
                  themeId={currentThemeId}
                />
              </Box>
            </Box>

            {/* Vertical Divider between Left Panel & Center Panel */}
            <MatlabSplitResizer
              direction="vertical"
              isDragging={isDraggingLeftW}
              theme={activeTheme}
              onMouseDown={handleMouseDownLeftW}
              onDoubleClick={handleResetLeftW}
              tooltipText="왼쪽 탐색기/작업공간 너비 조절 (더블 클릭 시 초기화)"
            />
          </>
        )}

        {/* --- CENTER + RIGHT CONTAINER --- */}
        <Box
          ref={centerRightContainerRef}
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: { xs: 'column', md: 'row' },
            height: { xs: 'auto', md: '100%' },
            minWidth: 0,
            overflow: { xs: 'visible', md: 'hidden' },
          }}
        >
          {/* --- CENTER PANEL: Script Editor + Command Window --- */}
          <Box
            ref={centerPanelRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${splitCenterX}%` },
              height: { xs: 700, md: '100%' },
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {/* Script Editor (Center Top) */}
            <Box
              sx={{ height: { xs: 400, md: `calc(${splitCenterY}% - 3px)` }, overflow: 'hidden' }}
            >
              <MatlabEditor
                files={files}
                activeFileId={activeFileId}
                onSelectFile={setActiveFileId}
                onCloseFile={handleCloseFile}
                onNewFile={handleNewFile}
                onCodeChange={handleCodeChange}
                onRunScript={handleRunScript}
                onRunSelection={handleRunSelection}
                onResetToTemplate={handleResetToTemplate}
                themeId={currentThemeId}
              />
            </Box>

            {/* Horizontal Divider between Editor & Command Window */}
            <MatlabSplitResizer
              direction="horizontal"
              isDragging={isDraggingCenterY}
              theme={activeTheme}
              onMouseDown={handleMouseDownCenterY}
              onDoubleClick={handleResetCenterY}
              tooltipText="스크립트 에디터/커맨드 창 높이 조절 (더블 클릭 시 초기화)"
            />

            {/* Command Window (Center Bottom) */}
            <Box
              sx={{
                height: { xs: 300, md: `calc(${100 - splitCenterY}% - 3px)` },
                overflow: 'hidden',
              }}
            >
              <MatlabCommandWindow
                logs={logs}
                onExecuteCommand={handleExecuteCommand}
                onClearLogs={handleClearConsole}
                themeId={currentThemeId}
              />
            </Box>
          </Box>

          {/* Vertical Divider between Center Panel & Right Panel */}
          <MatlabSplitResizer
            direction="vertical"
            isDragging={isDraggingCenterX}
            theme={activeTheme}
            onMouseDown={handleMouseDownCenterX}
            onDoubleClick={handleResetCenterX}
            tooltipText="에디터/피규어(그래프) 너비 조절 (더블 클릭 시 초기화)"
          />

          {/* --- RIGHT PANEL: Figure Viewer --- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `calc(${100 - splitCenterX}% - 6px)` },
              height: { xs: 500, md: '100%' },
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <MatlabFigureViewer
              figures={figures}
              activeFigureId={activeFigureId}
              onSelectFigure={setActiveFigureId}
              onClearFigures={handleClearFigures}
              themeId={currentThemeId}
            />
          </Box>
        </Box>
      </Box>

      {/* Variable Editor Dialog */}
      <MatlabVariableEditorDialog
        open={Boolean(editingVariable)}
        variable={editingVariable}
        onClose={() => setEditingVariable(null)}
        onSaveValue={handleSaveVariableValue}
        themeId={currentThemeId}
      />

      {/* Built-in Apps Dialog */}
      <MatlabAppsDialog
        open={Boolean(activeAppType)}
        appType={activeAppType}
        onClose={() => setActiveAppType(null)}
        onInsertCode={handleInsertCode}
        themeId={currentThemeId}
      />

      {/* Help Cheatsheet Dialog */}
      <MatlabHelpDialog
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        themeId={currentThemeId}
      />
    </Box>
  );
}
