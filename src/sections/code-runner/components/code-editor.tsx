'use client';

import dynamic from 'next/dynamic';
import React, { useCallback } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

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
        bgcolor: '#1e1e1e',
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
  theme?: 'vs-dark' | 'light';
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
    case 'cpp':
      return 'cpp';
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
  theme = 'vs-dark',
  fontSize = 14,
  minimap = true,
  readOnly = false,
}: CodeEditorProps) {
  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      if (onRun) {
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
        bgcolor: theme === 'vs-dark' ? '#1e1e1e' : '#fffffe',
        overflow: 'hidden',
      }}
    >
      <MonacoEditor
        height="100%"
        language={monacoLanguage}
        value={value}
        theme={theme}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorMount}
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
