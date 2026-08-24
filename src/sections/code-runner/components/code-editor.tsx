'use client';

import dynamic from 'next/dynamic';
import React, { useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { IDE_THEMES, getThemeById, DEFAULT_THEME_ID } from '../core/editor-themes';

// ----------------------------------------------------------------------

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        bgcolor: 'transparent',
        color: '#94a3b8',
      }}
    >
      <CircularProgress size={32} color="primary" />
      <Typography variant="caption">Monaco Editor 로딩 중...</Typography>
    </Box>
  ),
});

export interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  themeId?: string;
  fontSize?: number;
  minimap?: boolean;
  readOnly?: boolean;
}

function getMonacoLanguage(lang: string): string {
  switch (lang) {
    case 'node-server':
      return 'javascript';
    case 'react':
      return 'javascript';
    case 'bash':
      return 'shell';
    case 'sql':
      return 'sql';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'ruby':
      return 'ruby';
    case 'php':
      return 'php';
    case 'lua':
      return 'lua';
    case 'c':
      return 'c';
    case 'cpp':
      return 'cpp';
    case 'csharp':
      return 'csharp';
    case 'rust':
      return 'rust';
    case 'python':
      return 'python';
    case 'typescript':
      return 'typescript';
    case 'html':
      return 'html';
    default:
      return 'javascript';
  }
}

export function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  themeId = DEFAULT_THEME_ID,
  fontSize = 14,
  minimap = true,
  readOnly = false,
}: CodeEditorProps) {
  const currentTheme = getThemeById(themeId);

  const handleBeforeMount = useCallback((monaco: any) => {
    IDE_THEMES.forEach((theme) => {
      if (theme.monacoDefinition) {
        monaco.editor.defineTheme(theme.monacoThemeId, theme.monacoDefinition);
      }
    });
  }, []);

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      // 테마 재등록 (보장)
      IDE_THEMES.forEach((theme) => {
        if (theme.monacoDefinition) {
          monaco.editor.defineTheme(theme.monacoThemeId, theme.monacoDefinition);
        }
      });

      if (onRun) {
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          onRun();
        });
      }
    },
    [onRun]
  );

  const monacoLanguage = getMonacoLanguage(language);

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
        language={monacoLanguage}
        value={value}
        theme={currentTheme.monacoThemeId}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        onChange={(val) => onChange(val || '')}
        options={{
          fontSize,
          minimap: { enabled: minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </Box>
  );
}
