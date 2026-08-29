'use client';

import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import React, { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { ThemeSelector } from 'src/components/theme-selector';
import {
  IDE_THEMES,
  getThemeById,
  DEFAULT_THEME_ID,
} from 'src/sections/code-runner/core/editor-themes';

import type { ExampleDefinition } from '../types';

// ----------------------------------------------------------------------

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: '100%',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        bgcolor: 'background.paper',
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={32} color="primary" />
      <Typography variant="caption">코드 에디터 로딩 중...</Typography>
    </Box>
  ),
});

interface CodeExportDialogProps {
  open: boolean;
  onClose: () => void;
  example: ExampleDefinition;
  currentParams: Record<string, number | string | boolean>;
  themeId?: string;
  onThemeChange?: (themeId: string) => void;
}

export function CodeExportDialog({
  open,
  onClose,
  example,
  currentParams,
  themeId = DEFAULT_THEME_ID,
  onThemeChange,
}: CodeExportDialogProps) {
  const [tab, setTab] = useState<'vanilla' | 'r3f'>('vanilla');
  const [localThemeId, setLocalThemeId] = useState<string>(themeId);

  const activeThemeId = onThemeChange ? themeId : localThemeId;
  const currentTheme = getThemeById(activeThemeId);

  const handleThemeChange = (newTheme: string) => {
    setLocalThemeId(newTheme);
    onThemeChange?.(newTheme);
  };

  const vanillaCode = example.vanillaCode(currentParams).trim();
  const r3fCode = example.r3fCode(currentParams).trim();
  const activeCode = tab === 'vanilla' ? vanillaCode : r3fCode;
  const language = tab === 'vanilla' ? 'javascript' : 'typescript';

  const handleBeforeMount = useCallback((monaco: any) => {
    IDE_THEMES.forEach((theme) => {
      if (theme.monacoDefinition) {
        monaco.editor.defineTheme(theme.monacoThemeId, theme.monacoDefinition);
      }
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    toast.success(
      `${tab === 'vanilla' ? 'Vanilla Three.js' : 'React Three Fiber'} 코드가 클립보드에 복사되었습니다!`
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: currentTheme.uiColors.surface,
          color: currentTheme.uiColors.text,
          border: `1px solid ${currentTheme.uiColors.border}`,
          borderRadius: 2.5,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${currentTheme.uiColors.border}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {example.title} - 코드 내보내기
          </Typography>
          <Typography variant="caption" sx={{ color: currentTheme.uiColors.textMuted }}>
            현재 적용된 파라미터 값으로 완성된 실행 가능한 소스코드를 복사하여 즉시 활용할 수
            있습니다.
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: currentTheme.uiColors.textMuted }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Box
        sx={{
          px: 2.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: `1px solid ${currentTheme.uiColors.border}`,
          bgcolor: currentTheme.uiColors.card,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              fontWeight: 700,
              color: currentTheme.uiColors.textMuted,
            },
            '& .Mui-selected': { color: 'primary.main' },
          }}
        >
          <Tab value="vanilla" label="Vanilla Three.js (JavaScript)" />
          <Tab value="r3f" label="React Three Fiber (TypeScript / Next.js)" />
        </Tabs>

        <ThemeSelector
          currentThemeId={activeThemeId}
          onThemeChange={handleThemeChange}
          size="small"
          height={32}
          minWidth={150}
        />
      </Box>

      <DialogContent sx={{ p: 0, height: 420 }}>
        <MonacoEditor
          height="100%"
          language={language}
          value={activeCode}
          theme={currentTheme.monacoThemeId}
          beforeMount={handleBeforeMount}
          options={{
            readOnly: true,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            minimap: { enabled: true, scale: 0.75 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${currentTheme.uiColors.border}`,
          bgcolor: currentTheme.uiColors.card,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: currentTheme.uiColors.border, color: currentTheme.uiColors.textMuted }}
        >
          닫기
        </Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          color="primary"
          startIcon={<ContentCopyRoundedIcon />}
          sx={{
            fontWeight: 800,
          }}
        >
          코드 전체 복사하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
