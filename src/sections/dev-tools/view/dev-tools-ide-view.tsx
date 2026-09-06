'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';

import { getThemeById } from 'src/sections/code-runner/core/editor-themes';

import { IdeEditor } from '../ide/components/ide-editor';
import { IdeSidebar } from '../ide/components/ide-sidebar';
import { IdeTitleBar } from '../ide/components/ide-title-bar';
import { IdeStatusBar } from '../ide/components/ide-status-bar';
import { IdeEditorTabs } from '../ide/components/ide-editor-tabs';
import { IdeTerminalPanel } from '../ide/components/ide-terminal-panel';
import { IdePlayerControls } from '../ide/components/ide-player-controls';
import { IdeCodeInputModal } from '../ide/components/ide-code-input-modal';
import { IdeActivityBar, type ActivityTab } from '../ide/components/ide-activity-bar';
import {
  keyboardAudio,
  type KeyboardSoundType,
  KEYBOARD_SOUND_PROFILES,
} from '../ide/sound-effect';
import {
  PRESET_FILES,
  type IdeFile,
  type TerminalLog,
  type TypingConfig,
  type TypingStatus,
} from '../ide/types';

// ----------------------------------------------------------------------

export function DevToolsIdeView() {
  const [hasLoaded, setHasLoaded] = useState(false);

  // Files & Active File (Start with top 5 presets, all 25 available in template gallery)
  const [files, setFiles] = useState<IdeFile[]>(() => PRESET_FILES.slice(0, 5));
  const [activeFileId, setActiveFileId] = useState<string>(PRESET_FILES[0].id);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Typing state
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('idle');
  const [charIndex, setCharIndex] = useState<number>(() => activeFile.content.length);
  const [displayedCode, setDisplayedCode] = useState<string>(() => activeFile.content);

  // Layout toggles
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCodeInputModalOpen, setIsCodeInputModalOpen] = useState(false);

  // Typing Configuration with themeId and soundType
  const [config, setConfig] = useState<TypingConfig>({
    speedPreset: 'normal',
    speedMs: 18,
    charsPerTick: 1,
    soundEnabled: true,
    soundType: 'blue',
    naturalJitter: true,
    autoRunTerminal: true,
    fontSize: 14,
    minimap: true,
    themeId: 'vs-dark',
  });

  const currentTheme = getThemeById(config.themeId);

  // Terminal Logs
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'command',
      text: 'git status',
      timestamp: '16:00:01',
    },
    {
      id: 'init-2',
      type: 'info',
      text: 'On branch main. Ready to simulate code typing.',
      timestamp: '16:00:02',
    },
  ]);

  // Robust Refs for Zero-Race-Condition Typing

  const editorInstanceRef = useRef<any>(null);
  const targetCodeRef = useRef<string>(activeFile.content);
  const charIndexRef = useRef<number>(activeFile.content.length);
  const isTypingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<TypingConfig>(config);
  configRef.current = config;
  const lastReactUpdateRef = useRef<number>(0);

  // Calculate cursor line & column
  const linesSoFar = displayedCode.split('\n');
  const cursorLine = Math.max(1, linesSoFar.length);
  const cursorColumn = Math.max(1, linesSoFar[linesSoFar.length - 1].length + 1);

  // Safe Hydration
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  // Update sound synthesizer mute status
  useEffect(() => {
    keyboardAudio.setMuted(!config.soundEnabled);
  }, [config.soundEnabled]);

  const addTerminalLog = useCallback((type: TerminalLog['type'], text: string) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text, timestamp }]);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Terminal simulated execution on finish
  const handleCompleteExecution = useCallback(() => {
    isTypingRef.current = false;
    setTypingStatus('completed');
    stopTimer();

    const target = targetCodeRef.current;
    const fileName = activeFile.name;

    if (configRef.current.autoRunTerminal) {
      if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
        addTerminalLog('command', `npm run build && npm run test`);
        addTerminalLog('info', `> compiling typescript files in workspace...`);
        addTerminalLog('success', `✔ TypeScript build succeeded with zero type errors in 184ms.`);
        addTerminalLog(
          'success',
          `✨ Finished typing: ${fileName} (${target.length.toLocaleString()} chars).`
        );
      } else if (fileName.endsWith('.py')) {
        addTerminalLog('command', `python3 ${fileName}`);
        addTerminalLog('info', `Running Python 3.12 interpreter...`);
        addTerminalLog('success', `🚀 Process finished with exit code 0.`);
      } else if (fileName.endsWith('.html')) {
        addTerminalLog('command', `live-server --open=${fileName}`);
        addTerminalLog('success', `Serving HTTP at http://127.0.0.1:5500/${fileName}`);
      } else {
        addTerminalLog('command', `node ${fileName}`);
        addTerminalLog('success', `Executed successfully.`);
      }
    }
  }, [activeFile.name, addTerminalLog, stopTimer]);

  // Recursive Next Character Typing Step (High Performance Batch Engine)
  const scheduleNextChar = useCallback(() => {
    if (!isTypingRef.current) return;

    const target = targetCodeRef.current;
    const currentIdx = charIndexRef.current;

    if (currentIdx >= target.length) {
      // Completed all characters!
      isTypingRef.current = false;
      setTypingStatus('completed');
      charIndexRef.current = target.length;
      setCharIndex(target.length);
      setDisplayedCode(target);
      if (editorInstanceRef.current) {
        editorInstanceRef.current.setValue(target);
      }
      handleCompleteExecution();
      return;
    }

    // Advance by batch size (charsPerTick)
    const charsToAdvance = Math.max(1, configRef.current.charsPerTick || 1);
    const nextIdx = Math.min(target.length, currentIdx + charsToAdvance);
    const addedChunk = target.slice(currentIdx, nextIdx);
    charIndexRef.current = nextIdx;
    const slice = target.slice(0, nextIdx);
    const lastChar = target[nextIdx - 1];

    // Update Monaco editor directly (instant hardware accelerated DOM)
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        model.setValue(slice);
      }
      const lines = slice.split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      editorInstanceRef.current.setPosition({ lineNumber: line, column: col });
      editorInstanceRef.current.revealLine(line);
    }

    // Audio sound: play 1 keystroke sound per tick for the last char
    if (configRef.current.soundEnabled) {
      keyboardAudio.playKey(lastChar);
    }

    // Throttle React state re-renders to ~30 FPS so the main loop never chokes
    const now = performance.now();
    if (now - lastReactUpdateRef.current > 33 || nextIdx >= target.length) {
      lastReactUpdateRef.current = now;
      setDisplayedCode(slice);
      setCharIndex(nextIdx);
    }

    if (nextIdx >= target.length) {
      isTypingRef.current = false;
      setTypingStatus('completed');
      setDisplayedCode(target);
      setCharIndex(target.length);
      handleCompleteExecution();
      return;
    }

    // Delay calculation with speed-scaled jitter
    let delay = configRef.current.speedMs;
    if (configRef.current.naturalJitter) {
      const preset = configRef.current.speedPreset;
      const jitterScale =
        preset === 'slow'
          ? 1.4
          : preset === 'normal'
            ? 1.0
            : preset === 'fast'
              ? 0.35
              : preset === 'turbo'
                ? 0.12
                : preset === 'hacker'
                  ? 0.04
                  : 0;

      if (addedChunk.includes('\n')) {
        delay = Math.max(delay, delay + 20 * jitterScale + Math.random() * 15 * jitterScale);
      } else if (/[{};:]/.test(addedChunk)) {
        delay = Math.max(delay, delay + 10 * jitterScale);
      }
    }

    timerRef.current = setTimeout(scheduleNextChar, delay);
  }, [handleCompleteExecution]);

  // Play Button Handler
  const handlePlay = useCallback(() => {
    stopTimer();
    isTypingRef.current = true;
    setTypingStatus('playing');

    const target = activeFile.content;
    targetCodeRef.current = target;

    // If current position is at end (or 0), start from beginning
    if (charIndexRef.current >= target.length || charIndexRef.current === 0) {
      charIndexRef.current = 0;
      setCharIndex(0);
      setDisplayedCode('');
      if (editorInstanceRef.current) {
        editorInstanceRef.current.setValue('');
        editorInstanceRef.current.setPosition({ lineNumber: 1, column: 1 });
      }
      addTerminalLog('command', `cat /dev/null > ${activeFile.name}`);
      addTerminalLog(
        'info',
        `코드 타이핑 시작: ${activeFile.name} (${target.length.toLocaleString()}자)`
      );
    } else {
      addTerminalLog(
        'info',
        `코드 타이핑 이어하기: ${charIndexRef.current}/${target.length.toLocaleString()}자`
      );
    }

    scheduleNextChar();
  }, [activeFile.content, activeFile.name, addTerminalLog, scheduleNextChar, stopTimer]);

  // Pause Button Handler
  const handlePause = useCallback(() => {
    isTypingRef.current = false;
    stopTimer();
    setTypingStatus('paused');
    const currentIdx = charIndexRef.current;
    setCharIndex(currentIdx);
    setDisplayedCode(targetCodeRef.current.slice(0, currentIdx));
    addTerminalLog('warn', `타이핑 일시정지 (${currentIdx}/${targetCodeRef.current.length}자)`);
  }, [addTerminalLog, stopTimer]);

  // Stop Button Handler (정지 시 원래 예시 코드로 복원)
  const handleStop = useCallback(() => {
    isTypingRef.current = false;
    stopTimer();
    setTypingStatus('idle');

    // 원래 예시 코드 전체 복원 (프리셋 파일인 경우 원본 템플릿, 사용자 파일인 경우 저장된 내용)
    const originalPreset = PRESET_FILES.find((p) => p.id === activeFile.id);
    const original = originalPreset ? originalPreset.content : activeFile.content;

    targetCodeRef.current = original;
    charIndexRef.current = 0; // 다음 번 재생 시 처음(0)부터 다시 타이핑되도록 인덱스 리셋
    setCharIndex(original.length);
    setDisplayedCode(original);

    if (originalPreset && originalPreset.content !== activeFile.content) {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFile.id ? { ...f, content: originalPreset.content } : f))
      );
    }

    if (editorInstanceRef.current) {
      editorInstanceRef.current.setValue(original);
      editorInstanceRef.current.setPosition({ lineNumber: 1, column: 1 });
      editorInstanceRef.current.revealPosition({ lineNumber: 1, column: 1 });
    }

    addTerminalLog('warn', `타이핑 정지: 원래 예시 코드로 복원되었습니다.`);
  }, [activeFile.content, activeFile.id, addTerminalLog, stopTimer]);

  // Restart Button Handler (처음부터 즉시 다시 타이핑)
  const handleRestart = useCallback(() => {
    stopTimer();
    isTypingRef.current = true;
    setTypingStatus('playing');

    const target = activeFile.content;
    targetCodeRef.current = target;
    charIndexRef.current = 0;
    setCharIndex(0);
    setDisplayedCode('');
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setValue('');
      editorInstanceRef.current.setPosition({ lineNumber: 1, column: 1 });
    }
    addTerminalLog('command', `cat /dev/null > ${activeFile.name}`);
    addTerminalLog('info', `처음부터 다시 타이핑 시작: ${activeFile.name}`);
    scheduleNextChar();
  }, [activeFile.content, activeFile.name, addTerminalLog, scheduleNextChar, stopTimer]);

  // Skip to End
  const handleSkipToEnd = useCallback(() => {
    isTypingRef.current = false;
    stopTimer();
    const target = targetCodeRef.current || activeFile.content;
    charIndexRef.current = target.length;
    setCharIndex(target.length);
    setDisplayedCode(target);
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setValue(target);
    }
    handleCompleteExecution();
  }, [activeFile.content, handleCompleteExecution, stopTimer]);

  // Clean up timer on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  // Select File Handler
  const handleSelectFile = (fileId: string) => {
    if (fileId === activeFileId) return;
    isTypingRef.current = false;
    stopTimer();
    setActiveFileId(fileId);

    const newFile = files.find((f) => f.id === fileId);
    if (newFile) {
      targetCodeRef.current = newFile.content;
      charIndexRef.current = newFile.content.length;
      setCharIndex(newFile.content.length);
      setDisplayedCode(newFile.content);
      if (editorInstanceRef.current) {
        editorInstanceRef.current.setValue(newFile.content);
      }
    }
    setTypingStatus('idle');
  };

  // Close File Handler
  const handleCloseFile = (fileId: string) => {
    if (files.length <= 1) return;
    const nextFiles = files.filter((f) => f.id !== fileId);
    setFiles(nextFiles);
    if (fileId === activeFileId) {
      handleSelectFile(nextFiles[0].id);
    }
  };

  // Delete File Handler
  const handleDeleteFile = (fileId: string) => {
    handleCloseFile(fileId);
  };

  // Select Preset Handler
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_FILES.find((p) => p.id === presetId);
    if (!found) return;

    const exists = files.some((f) => f.id === presetId);
    if (!exists) {
      setFiles((prev) => [...prev, found]);
    }
    handleSelectFile(presetId);
  };

  // Manual Code Edit in Monaco
  const handleCodeChange = (newCode: string) => {
    if (isTypingRef.current) return;
    setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, content: newCode } : f)));
    targetCodeRef.current = newCode;
    charIndexRef.current = newCode.length;
    setCharIndex(newCode.length);
    setDisplayedCode(newCode);
  };

  // Theme Change Handler
  const handleThemeChange = (newThemeId: string) => {
    setConfig((prev) => ({ ...prev, themeId: newThemeId }));
    const t = getThemeById(newThemeId);
    addTerminalLog('info', `테마 변경: ${t.name} (${t.monacoThemeId})`);
  };

  // Sound Profile Change Handler
  const handleSoundTypeChange = (soundType: KeyboardSoundType) => {
    setConfig((prev) => ({ ...prev, soundType }));
    keyboardAudio.setSoundType(soundType);
    const profile = KEYBOARD_SOUND_PROFILES.find((p) => p.id === soundType);
    if (profile) {
      addTerminalLog('info', `키보드 타건음 변경: ${profile.name} (${profile.tag})`);
    }
  };

  // Save Modal Handler
  const handleSaveModal = (
    fileName: string,
    language: string,
    content: string,
    autoPlay: boolean
  ) => {
    const updatedFiles = files.map((f) =>
      f.id === activeFileId ? { ...f, name: fileName, language, content } : f
    );
    setFiles(updatedFiles);
    setIsCodeInputModalOpen(false);

    isTypingRef.current = false;
    stopTimer();

    targetCodeRef.current = content;

    if (autoPlay) {
      charIndexRef.current = 0;
      setCharIndex(0);
      setDisplayedCode('');
      if (editorInstanceRef.current) {
        editorInstanceRef.current.setValue('');
      }
      setTimeout(() => {
        handlePlay();
      }, 100);
    } else {
      charIndexRef.current = content.length;
      setCharIndex(content.length);
      setDisplayedCode(content);
      if (editorInstanceRef.current) {
        editorInstanceRef.current.setValue(content);
      }
      setTypingStatus('idle');
      addTerminalLog(
        'info',
        `소스코드 업데이트 완료: ${fileName} (${content.length.toLocaleString()}자).`
      );
    }
  };

  // Estimated WPM calculation
  const charsPerSec =
    config.speedMs > 0 ? Math.round(((config.charsPerTick || 1) / config.speedMs) * 1000) : 0;
  const estimatedWpm = Math.round((charsPerSec * 60) / 5);

  if (!hasLoaded) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: isFullscreen ? '100vh' : { xs: 'calc(100dvh - 64px)', lg: '100%' },
        flex: isFullscreen ? 'none' : '1 1 0%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: currentTheme.previewBg,
        color: currentTheme.uiColors.text,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        overflow: 'hidden',
      }}
    >
      {/* 1. Title Bar */}
      <IdeTitleBar
        fileName={activeFile.name}
        typingStatus={typingStatus}
        currentTheme={currentTheme}
        isFullscreen={isFullscreen}
        isSidebarOpen={isSidebarOpen}
        isTerminalOpen={isTerminalOpen}
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        onToggleTerminal={() => setIsTerminalOpen((p) => !p)}
        onToggleFullscreen={() => setIsFullscreen((p) => !p)}
        onPlayPause={typingStatus === 'playing' ? handlePause : handlePlay}
        onStop={handleStop}
        onOpenCodeInput={() => setIsCodeInputModalOpen(true)}
      />

      {/* 2. Player Controls Toolbar (With Theme Selector) */}
      <IdePlayerControls
        status={typingStatus}
        config={config}
        currentTheme={currentTheme}
        currentChars={charIndex}
        totalChars={targetCodeRef.current.length}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onReset={handleRestart}
        onSkipToEnd={handleSkipToEnd}
        onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
        onThemeChange={handleThemeChange}
        onSoundTypeChange={handleSoundTypeChange}
        onOpenCodeInput={() => setIsCodeInputModalOpen(true)}
      />

      {/* 3. Main Central Workspace (Activity Bar + Sidebar + Editor/Tabs + Terminal) */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          width: '100%',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Activity Bar */}
        <IdeActivityBar
          activeTab={activeActivityTab}
          isSidebarOpen={isSidebarOpen}
          currentTheme={currentTheme}
          onSelectTab={(tab) => {
            if (tab === 'settings') {
              setIsCodeInputModalOpen(true);
            } else if (activeActivityTab === tab) {
              setIsSidebarOpen((p) => !p);
            } else {
              setActiveActivityTab(tab);
              setIsSidebarOpen(true);
            }
          }}
          onOpenSettings={() => setIsCodeInputModalOpen(true)}
        />

        {/* Primary Sidebar */}
        {isSidebarOpen && (
          <IdeSidebar
            activeTab={activeActivityTab}
            files={files}
            activeFileId={activeFileId}
            typingStatus={typingStatus}
            currentTheme={currentTheme}
            onSelectFile={handleSelectFile}
            onCloseFile={handleCloseFile}
            onDeleteFile={handleDeleteFile}
            onOpenCodeInput={() => setIsCodeInputModalOpen(true)}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* Right Workspace: Editor Tabs + Monaco Editor + Bottom Terminal Panel */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Editor Tabs & Breadcrumbs */}
          <IdeEditorTabs
            files={files}
            activeFileId={activeFileId}
            typingStatus={typingStatus}
            currentTheme={currentTheme}
            progressPercent={
              targetCodeRef.current.length > 0
                ? (charIndex / targetCodeRef.current.length) * 100
                : 0
            }
            onSelectFile={handleSelectFile}
            onCloseFile={handleCloseFile}
          />

          {/* Monaco Editor Typing Area */}
          <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <IdeEditor
              file={activeFile}
              displayedCode={displayedCode}
              typingStatus={typingStatus}
              config={config}
              currentTheme={currentTheme}
              cursorLine={cursorLine}
              cursorColumn={cursorColumn}
              onCodeChange={handleCodeChange}
              onEditorMount={(editor) => {
                editorInstanceRef.current = editor;
              }}
            />
          </Box>

          {/* Bottom Terminal & Output Panel */}
          <IdeTerminalPanel
            logs={logs}
            height={190}
            isOpen={isTerminalOpen}
            currentTheme={currentTheme}
            onClose={() => setIsTerminalOpen(false)}
            onClear={() => setLogs([])}
          />
        </Box>
      </Box>

      {/* 4. Bottom Status Bar */}
      <IdeStatusBar
        activeFile={activeFile}
        cursorLine={cursorLine}
        cursorColumn={cursorColumn}
        typingStatus={typingStatus}
        currentTheme={currentTheme}
        wpm={typingStatus === 'playing' ? estimatedWpm : 0}
      />

      {/* 5. Custom Code Input Modal */}
      <IdeCodeInputModal
        open={isCodeInputModalOpen}
        activeFile={activeFile}
        onClose={() => setIsCodeInputModalOpen(false)}
        onSaveOnly={(fileName, language, content) =>
          handleSaveModal(fileName, language, content, false)
        }
        onSaveAndPlay={(fileName, language, content) =>
          handleSaveModal(fileName, language, content, true)
        }
      />
    </Box>
  );
}
