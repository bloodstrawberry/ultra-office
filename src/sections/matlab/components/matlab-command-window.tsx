'use client';

import type { MatlabCommandLog } from '../types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

// ----------------------------------------------------------------------

interface MatlabCommandWindowProps {
  logs: MatlabCommandLog[];
  onExecuteCommand: (command: string) => void;
  onClearLogs: () => void;
}

export function MatlabCommandWindow({
  logs,
  onExecuteCommand,
  onClearLogs,
}: MatlabCommandWindowProps) {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputVal.trim();
      if (!cmd) return;

      setHistoryList((prev) => [cmd, ...prev]);
      setHistoryIndex(-1);
      setInputVal('');
      onExecuteCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyList.length === 0) return;
      const nextIdx = Math.min(historyIndex + 1, historyList.length - 1);
      setHistoryIndex(nextIdx);
      setInputVal(historyList[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(historyList[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => (l.type === 'input' ? `>> ${l.content}` : l.content)).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: '#0f1115',
        color: '#f8fafc',
        borderRadius: 1,
        border: '1px solid #242933',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#191c23',
          borderBottom: '1px solid #242933',
          px: 1,
          minHeight: 34,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TerminalRoundedIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
            COMMAND WINDOW
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="콘솔 내용 복사">
            <IconButton size="small" onClick={handleCopyLogs} sx={{ color: '#94a3b8' }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="콘솔 지우기 (clc)">
            <IconButton size="small" onClick={onClearLogs} sx={{ color: '#94a3b8' }}>
              <ClearRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Output Console Log Area */}
      <Box
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        sx={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          p: 1.5,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontSize: '12px',
          lineHeight: 1.5,
          cursor: 'text',
        }}
      >
        {/* Welcome message if empty */}
        {logs.length === 0 && (
          <Box sx={{ color: '#64748b', mb: 1 }}>
            <div>MATLAB Web Studio R2024b (WebAssembly Math Engine)</div>
            <div>
              수식이나 명령어를 입력하고 Enter를 누르세요. (예: <code>A = [1 2; 3 4]</code>,{' '}
              <code>plot(sin(0:0.1:10))</code>)
            </div>
          </Box>
        )}

        {logs.map((log) => {
          if (log.type === 'input') {
            return (
              <Box key={log.id} sx={{ color: '#38bdf8', fontWeight: 600, mt: 0.75 }}>
                <span>&gt;&gt; </span>
                <span>{log.content}</span>
              </Box>
            );
          }
          if (log.type === 'error') {
            return (
              <Box key={log.id} sx={{ color: '#f87171', whiteSpace: 'pre-wrap', my: 0.5 }}>
                {log.content}
              </Box>
            );
          }
          if (log.type === 'info') {
            return (
              <Box key={log.id} sx={{ color: '#a3e635', fontStyle: 'italic', my: 0.25 }}>
                {log.content}
              </Box>
            );
          }
          return (
            <Box key={log.id} sx={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', my: 0.5 }}>
              {log.content}
            </Box>
          );
        })}

        {/* Interactive Prompt Input Line */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Typography
            component="span"
            sx={{
              color: '#38bdf8',
              fontWeight: 700,
              fontFamily: 'inherit',
              fontSize: '12px',
              mr: 1,
              userSelect: 'none',
            }}
          >
            &gt;&gt;
          </Typography>
          <Box
            component="input"
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            autoComplete="off"
            spellCheck={false}
            sx={{
              flex: 1,
              bgcolor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontSize: '12px',
              caretColor: '#38bdf8',
              p: 0,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
