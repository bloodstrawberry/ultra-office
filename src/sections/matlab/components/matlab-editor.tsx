'use client';

import type { MatlabFile } from '../types';

import React, { useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// ----------------------------------------------------------------------

interface MatlabEditorProps {
  files: MatlabFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
  onNewFile: () => void;
  onCodeChange: (fileId: string, newContent: string) => void;
  onRunScript: () => void;
  onRunSelection: (code: string) => void;
  onResetToTemplate: () => void;
}

export function MatlabEditor({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
  onNewFile,
  onCodeChange,
  onRunScript,
  onRunSelection,
  onResetToTemplate,
}: MatlabEditorProps) {
  const editorRef = useRef<any>(null);
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register MATLAB language configuration if not present
    monaco.languages.register({ id: 'matlab' });
    monaco.languages.setMonarchTokensProvider('matlab', {
      keywords: [
        'break',
        'case',
        'catch',
        'classdef',
        'continue',
        'else',
        'elseif',
        'end',
        'for',
        'function',
        'global',
        'if',
        'otherwise',
        'parfor',
        'persistent',
        'return',
        'spmd',
        'switch',
        'try',
        'while',
      ],
      typeKeywords: ['double', 'single', 'int8', 'int16', 'int32', 'int64', 'char', 'logical'],
      operators: [
        '+',
        '-',
        '*',
        '/',
        '\\',
        '^',
        '.*',
        './',
        '.\\',
        '.^',
        '==',
        '~=',
        '<',
        '<=',
        '>',
        '>=',
        '&',
        '|',
        '&&',
        '||',
        '~',
        '=',
      ],
      symbols: /[=><!~?:&|+\-*/^%]+/,
      tokenizer: {
        root: [
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'type',
                '@default': 'identifier',
              },
            },
          ],
          { include: '@whitespace' },
          [/[{}()[\]]/, '@brackets'],
          [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
          [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
          [/\d+([eE][-+]?\d+)?/, 'number'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/"([^"\\]|\\.)*"/, 'string'],
        ],
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/%%.*$/, 'comment.doc'],
          [/%.*$/, 'comment'],
        ],
      },
    });

    // Add F5 keybinding for Run
    editor.addCommand(monaco.KeyCode.F5, () => {
      onRunScript();
    });

    // Add Ctrl+Enter keybinding for Run Selection or Section
    // eslint-disable-next-line no-bitwise
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selection = editor.getSelection();
      const selectedText = selection ? editor.getModel()?.getValueInRange(selection) : '';
      if (selectedText && selectedText.trim()) {
        onRunSelection(selectedText);
      } else {
        onRunScript();
      }
    });
  };

  const handleRunCurrentSelection = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const selectedText = selection
        ? editorRef.current.getModel()?.getValueInRange(selection)
        : '';
      if (selectedText && selectedText.trim()) {
        onRunSelection(selectedText);
        return;
      }
    }
    onRunScript();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: '#14161b',
        color: '#e2e8f0',
        borderRadius: 1,
        border: '1px solid #282e3b',
        overflow: 'hidden',
      }}
    >
      {/* File Tabs & Action Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1c2027',
          borderBottom: '1px solid #282e3b',
          px: 1,
          minHeight: 38,
        }}
      >
        {/* Tabs Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
          <Tabs
            value={activeFile?.id || ''}
            onChange={(_, val) => onSelectFile(val)}
            variant="scrollable"
            scrollButtons="auto"
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
                gap: 0.5,
                '&.Mui-selected': {
                  bgcolor: '#14161b',
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
            {files.map((file) => (
              <Tab
                key={file.id}
                value={file.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CodeRoundedIcon sx={{ fontSize: 14 }} />
                    <span>{file.name}</span>
                    {files.length > 1 && (
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseFile(file.id);
                        }}
                        sx={{
                          ml: 0.5,
                          p: 0.25,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#f87171' },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 12 }} />
                      </Box>
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>

          <Tooltip title="새 스크립트 파일 추가">
            <IconButton size="small" onClick={onNewFile} sx={{ color: '#94a3b8', ml: 0.5 }}>
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="선택 영역 또는 섹션 실행 (Ctrl+Enter)">
            <IconButton size="small" onClick={handleRunCurrentSelection} sx={{ color: '#38bdf8' }}>
              <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="템플릿 초기 상태로 되돌리기">
            <IconButton size="small" onClick={onResetToTemplate} sx={{ color: '#94a3b8' }}>
              <ReplayRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Monaco Code Editor */}
      <Box sx={{ flex: 1, width: '100%', height: 'calc(100% - 38px)', overflow: 'hidden' }}>
        {activeFile && (
          <Editor
            height="100%"
            language="matlab"
            theme="vs-dark"
            value={activeFile.content}
            onChange={(val) => onCodeChange(activeFile.id, val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: true, scale: 0.8 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              automaticLayout: true,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 8, bottom: 8 },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
