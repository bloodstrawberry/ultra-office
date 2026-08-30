'use client';

import type { MatlabFile } from '../types';
import type { MatlabTemplate } from '../engine/templates';

import React, { useRef } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

import { getThemeById, DEFAULT_THEME_ID } from 'src/sections/code-runner/core/editor-themes';

// ----------------------------------------------------------------------

interface MatlabCurrentFolderProps {
  files: MatlabFile[];
  activeFileId: string;
  templates: MatlabTemplate[];
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onDeleteFile: (id: string) => void;
  onUploadFile: (file: File) => void;
  onDownloadFile: (file: MatlabFile) => void;
  onLoadTemplate: (template: MatlabTemplate) => void;
  themeId?: string;
}

export function MatlabCurrentFolder({
  files,
  activeFileId,
  templates,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onUploadFile,
  onDownloadFile,
  onLoadTemplate,
  themeId = DEFAULT_THEME_ID,
}: MatlabCurrentFolderProps) {
  const activeTheme = getThemeById(themeId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [templateMenuAnchor, setTemplateMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      onUploadFile(uploaded);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: activeTheme.uiColors.surface,
        color: activeTheme.uiColors.text,
        borderRadius: 1,
        border: `1px solid ${activeTheme.uiColors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".m,.txt,.mat"
        style={{ display: 'none' }}
      />

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: activeTheme.uiColors.card,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          px: 1,
          minHeight: 34,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <FolderRoundedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
            CURRENT FOLDER
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="예제 템플릿 로드">
            <IconButton
              size="small"
              onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
              color="primary"
            >
              <LibraryBooksRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="새 .m 파일">
            <IconButton
              size="small"
              onClick={onNewFile}
              sx={{ color: activeTheme.uiColors.textMuted }}
            >
              <AddRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title=".m 파일 업로드">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: activeTheme.uiColors.textMuted }}
            >
              <UploadRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Templates Dropdown Menu */}
      <Menu
        anchorEl={templateMenuAnchor}
        open={Boolean(templateMenuAnchor)}
        onClose={() => setTemplateMenuAnchor(null)}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: activeTheme.uiColors.card,
            color: activeTheme.uiColors.text,
            border: `1px solid ${activeTheme.uiColors.border}`,
            minWidth: 260,
          },
        }}
      >
        <Typography
          sx={{
            px: 2,
            py: 1,
            fontSize: '11px',
            fontWeight: 700,
            color: activeTheme.uiColors.textMuted,
          }}
        >
          MATLAB 예제 템플릿
        </Typography>
        {templates.map((tpl) => (
          <MenuItem
            key={tpl.id}
            onClick={() => {
              onLoadTemplate(tpl);
              setTemplateMenuAnchor(null);
            }}
            sx={{
              py: 0.75,
              fontSize: '12px',
              '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' },
            }}
          >
            <ListItemText
              primary={tpl.title}
              secondary={tpl.category}
              primaryTypographyProps={{
                fontSize: '12px',
                fontWeight: 600,
                color: activeTheme.uiColors.text,
              }}
              secondaryTypographyProps={{ fontSize: '10px', color: activeTheme.uiColors.textMuted }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* File List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List dense disablePadding>
          {files.map((file) => {
            const isSelected = activeFileId === file.id;
            return (
              <ListItem
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                sx={{
                  py: 0.4,
                  px: 1,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(128, 128, 128, 0.08)',
                  },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="다운로드">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadFile(file);
                        }}
                        sx={{
                          color: activeTheme.uiColors.textMuted,
                          p: 0.25,
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <DownloadRoundedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                    {files.length > 1 && (
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          sx={{
                            color: activeTheme.uiColors.textMuted,
                            p: 0.25,
                            '&:hover': { color: '#f87171' },
                          }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 24, color: 'primary.main' }}>
                  <InsertDriveFileRoundedIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  primaryTypographyProps={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: isSelected ? 'primary.main' : activeTheme.uiColors.text,
                    fontWeight: isSelected ? 700 : 400,
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
