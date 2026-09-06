'use client';

import type { IdeFile, TypingConfig, TypingStatus } from '../types';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import dynamic from 'next/dynamic';
import React, { useRef, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { IDE_THEMES } from 'src/sections/code-runner/core/editor-themes';

import { getMonacoLanguage } from '../data/ide-languages';

// Dynamically load Monaco Editor with SSR disabled
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        bgcolor: '#1e1e1e',
        color: '#94a3b8',
      }}
    >
      <CircularProgress size={32} sx={{ color: '#007acc' }} />
      <Typography variant="caption">Monaco Editor 로딩 중...</Typography>
    </Box>
  ),
});

interface IdeEditorProps {
  file: IdeFile;
  displayedCode: string;
  typingStatus: TypingStatus;
  config: TypingConfig;
  currentTheme: IDETheme;
  cursorLine: number;
  cursorColumn: number;
  onCodeChange: (newCode: string) => void;

  onEditorMount?: (editor: any, monaco: any) => void;
}

export function IdeEditor({
  file,
  displayedCode,
  typingStatus,
  config,
  currentTheme,
  cursorLine,
  cursorColumn,
  onCodeChange,
  onEditorMount,
}: IdeEditorProps) {
  const editorRef = useRef<any>(null);

  const monacoRef = useRef<any>(null);

  // Register custom themes in Monaco

  const handleBeforeMount = useCallback((monaco: any) => {
    IDE_THEMES.forEach((t) => {
      if (t.monacoDefinition) {
        monaco.editor.defineTheme(t.monacoThemeId, t.monacoDefinition);
      }
    });
  }, []);

  // Editor mount handler

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      IDE_THEMES.forEach((t) => {
        if (t.monacoDefinition) {
          monaco.editor.defineTheme(t.monacoThemeId, t.monacoDefinition);
        }
      });

      if (onEditorMount) {
        onEditorMount(editor, monaco);
      }
    },
    [onEditorMount]
  );

  // When theme changes dynamically
  useEffect(() => {
    if (monacoRef.current && currentTheme) {
      try {
        monacoRef.current.editor.setTheme(currentTheme.monacoThemeId);
      } catch {
        // ignore
      }
    }
  }, [currentTheme]);

  // Sync editor cursor position and auto-scroll as code is typed
  useEffect(() => {
    if (editorRef.current && typingStatus === 'playing') {
      try {
        editorRef.current.setPosition({ lineNumber: cursorLine, column: cursorColumn });
        editorRef.current.revealPositionInCenterIfOutsideViewport({
          lineNumber: cursorLine,
          column: cursorColumn,
        });
      } catch {
        // ignore cursor sync race
      }
    }
  }, [cursorLine, cursorColumn, typingStatus]);

  const isPlaying = typingStatus === 'playing';

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: currentTheme.previewBg,
        overflow: 'hidden',
      }}
    >
      <MonacoEditor
        height="100%"
        language={getMonacoLanguage(file.name || file.language)}
        value={displayedCode}
        theme={currentTheme.monacoThemeId}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        onChange={(val) => {
          // Strictly protect against internal overwrites during playback
          if (typingStatus === 'playing') return;
          if (val !== undefined) {
            onCodeChange(val);
          }
        }}
        options={{
          fontSize: config.fontSize,
          minimap: { enabled: config.minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: isPlaying,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          bracketPairColorization: { enabled: true },
          renderWhitespace: 'selection',
        }}
      />
    </Box>
  );
}
