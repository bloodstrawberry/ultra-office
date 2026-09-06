'use client';

import type { IdeFile, TypingStatus } from '../types';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import { getFileIconColor } from '../data/ide-languages';

interface IdeEditorTabsProps {
  files: IdeFile[];
  activeFileId: string;
  typingStatus: TypingStatus;
  currentTheme: IDETheme;
  progressPercent: number;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
}

export function IdeEditorTabs({
  files,
  activeFileId,
  typingStatus,
  currentTheme,
  progressPercent,
  onSelectFile,
  onCloseFile,
}: IdeEditorTabsProps) {
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const accent = currentTheme.previewAccent || '#007acc';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: currentTheme.uiColors.surface,
        flexShrink: 0,
      }}
    >
      {/* File Tabs Strip */}
      <Box
        sx={{
          height: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          bgcolor: currentTheme.uiColors.surface,
          borderBottom: `1px solid ${currentTheme.uiColors.border}`,
          '&::-webkit-scrollbar': { height: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: currentTheme.uiColors.border },
        }}
      >
        {/* Tabs List */}
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isTyping = isActive && typingStatus === 'playing';

            return (
              <Box
                key={`tab-${file.id}`}
                onClick={() => onSelectFile(file.id)}
                sx={{
                  height: '100%',
                  px: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  bgcolor: isActive ? currentTheme.previewBg : currentTheme.uiColors.surface,
                  color: isActive ? currentTheme.uiColors.text : currentTheme.uiColors.textMuted,
                  borderRight: `1px solid ${currentTheme.uiColors.border}`,
                  borderTop: isActive ? `2px solid ${accent}` : '2px solid transparent',
                  transition: 'background 0.1s',
                  userSelect: 'none',
                  minWidth: 120,
                  maxWidth: 200,
                  '&:hover': {
                    bgcolor: isActive ? currentTheme.previewBg : currentTheme.uiColors.card,
                    color: currentTheme.uiColors.text,
                  },
                  '&:hover .tab-close-btn': { opacity: 1 },
                }}
              >
                <CodeRoundedIcon
                  sx={{ fontSize: 15, color: getFileIconColor(file.name), flexShrink: 0 }}
                />
                <Typography
                  noWrap
                  sx={{
                    fontSize: '0.78125rem',
                    fontWeight: isActive ? 600 : 400,
                    flex: 1,
                  }}
                >
                  {file.name}
                </Typography>

                {/* Status Dot / Close Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {isTyping ? (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: accent,
                      }}
                    />
                  ) : (
                    files.length > 1 && (
                      <IconButton
                        size="small"
                        className="tab-close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseFile(file.id);
                        }}
                        sx={{
                          opacity: 0,
                          p: 0.2,
                          color: currentTheme.uiColors.textMuted,
                          '&:hover': { color: currentTheme.uiColors.text },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    )
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Right Corner Tab Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1,
            color: currentTheme.uiColors.textMuted,
          }}
        >
          <Tooltip title="더보기">
            <IconButton size="small" sx={{ color: currentTheme.uiColors.textMuted, p: 0.4 }}>
              <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Typing Linear Progress Bar */}
      {typingStatus === 'playing' && (
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 2,
            bgcolor: currentTheme.uiColors.card,
            '& .MuiLinearProgress-bar': {
              bgcolor: accent,
            },
          }}
        />
      )}

      {/* VS Code Breadcrumbs Bar */}
      <Box
        sx={{
          height: 22,
          bgcolor: currentTheme.previewBg,
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          fontSize: '0.6875rem',
          color: currentTheme.uiColors.textMuted,
          borderBottom: `1px solid ${currentTheme.uiColors.border}`,
          userSelect: 'none',
          gap: 0.5,
        }}
      >
        <FolderOpenRoundedIcon sx={{ fontSize: 13, color: accent }} />
        <span>src</span>
        <ChevronRightRoundedIcon sx={{ fontSize: 13 }} />
        <span>workspace</span>
        <ChevronRightRoundedIcon sx={{ fontSize: 13 }} />
        <CodeRoundedIcon sx={{ fontSize: 13, color: getFileIconColor(activeFile.name) }} />
        <span style={{ color: currentTheme.uiColors.text, fontWeight: 500 }}>
          {activeFile.name}
        </span>
      </Box>
    </Box>
  );
}
