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

import { MatlabRuntime } from '../engine/matlab-runtime';
import { MatlabEditor } from '../components/matlab-editor';
import { MatlabWorkspace } from '../components/matlab-workspace';
import { MatlabToolstrip } from '../components/matlab-toolstrip';
import { MatlabAppsDialog } from '../components/matlab-apps-dialog';
import { MatlabHelpDialog } from '../components/matlab-help-dialog';
import { MatlabFigureViewer } from '../components/matlab-figure-viewer';
import { MatlabCurrentFolder } from '../components/matlab-current-folder';
import { MatlabCommandWindow } from '../components/matlab-command-window';
import { MATLAB_TEMPLATES, type MatlabTemplate } from '../engine/templates';
import { MatlabVariableEditorDialog } from '../components/matlab-variable-editor-dialog';

// ----------------------------------------------------------------------

const STORAGE_KEY_FILES = 'matlab-studio-files';
const STORAGE_KEY_ACTIVE_FILE = 'matlab-studio-active-file';

export function MatlabView() {
  // Runtime reference
  const runtimeRef = useRef<MatlabRuntime | null>(null);
  if (!runtimeRef.current) {
    runtimeRef.current = new MatlabRuntime();
  }

  // Toolstrip & Layout state
  const [toolstripTab, setToolstripTab] = useState<MatlabToolstripTab>('HOME');
  const [layoutPreset, setLayoutPreset] = useState<MatlabLayoutPreset>('standard');
  const [isRunning, setIsRunning] = useState(false);

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
      id: `in-${Date.now()}`,
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
      id: `in-${Date.now()}`,
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
      id: `in-${Date.now()}`,
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
      id: `file-${Date.now()}`,
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
          id: `info-${Date.now()}`,
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
        id: `file-${Date.now()}`,
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
          id: `info-${Date.now()}`,
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
          id: `info-${Date.now()}`,
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: '100%' },
        minHeight: { xs: '100dvh', md: 'auto' },
        width: '100%',
        bgcolor: '#0d0f12',
        color: '#f8fafc',
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
      />

      {/* Main Docking Layout Workspace */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' },
          height: { xs: 'auto', md: 'calc(100% - 88px)' },
          overflow: { xs: 'visible', md: 'hidden' },
          p: 0.5,
          gap: 0.5,
        }}
      >
        {/* --- LEFT PANEL: Current Folder + Workspace --- */}
        {layoutPreset !== 'editor-focus' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: layoutPreset === 'wide-plot' ? '18%' : '20%' },
              height: { xs: 450, md: '100%' },
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            {/* Current Folder (Top Left) */}
            <Box sx={{ flex: 1, height: '50%', overflow: 'hidden' }}>
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
              />
            </Box>

            {/* Workspace (Bottom Left) */}
            <Box sx={{ flex: 1, height: '50%', overflow: 'hidden' }}>
              <MatlabWorkspace
                variables={variables}
                selectedVarName={selectedVarName}
                onSelectVariable={setSelectedVarName}
                onOpenVariableEditor={setEditingVariable}
                onQuickPlot={handleQuickPlot}
                onClearWorkspace={handleClearWorkspace}
              />
            </Box>
          </Box>
        )}

        {/* --- CENTER PANEL: Script Editor + Command Window --- */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: layoutPreset === 'wide-plot' ? 1 : layoutPreset === 'editor-focus' ? 2 : 1.4,
            height: { xs: 700, md: '100%' },
            gap: 0.5,
            minWidth: 0,
          }}
        >
          {/* Script Editor (Center Top) */}
          <Box sx={{ flex: 1.2, height: '58%', overflow: 'hidden' }}>
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
            />
          </Box>

          {/* Command Window (Center Bottom) */}
          <Box sx={{ flex: 0.8, height: '42%', overflow: 'hidden' }}>
            <MatlabCommandWindow
              logs={logs}
              onExecuteCommand={handleExecuteCommand}
              onClearLogs={handleClearConsole}
            />
          </Box>
        </Box>

        {/* --- RIGHT PANEL: Figure Viewer --- */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: {
              xs: '100%',
              md:
                layoutPreset === 'wide-plot'
                  ? '46%'
                  : layoutPreset === 'editor-focus'
                    ? '35%'
                    : '38%',
            },
            height: { xs: 500, md: '100%' },
            flexShrink: 0,
          }}
        >
          <MatlabFigureViewer
            figures={figures}
            activeFigureId={activeFigureId}
            onSelectFigure={setActiveFigureId}
            onClearFigures={handleClearFigures}
          />
        </Box>
      </Box>

      {/* Variable Editor Dialog */}
      <MatlabVariableEditorDialog
        open={Boolean(editingVariable)}
        variable={editingVariable}
        onClose={() => setEditingVariable(null)}
        onSaveValue={handleSaveVariableValue}
      />

      {/* Built-in Apps Dialog */}
      <MatlabAppsDialog
        open={Boolean(activeAppType)}
        appType={activeAppType}
        onClose={() => setActiveAppType(null)}
        onInsertCode={handleInsertCode}
      />

      {/* Help Cheatsheet Dialog */}
      <MatlabHelpDialog open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Box>
  );
}
