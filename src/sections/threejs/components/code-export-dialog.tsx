'use client';

import type { ExampleDefinition } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

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
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

// ----------------------------------------------------------------------

interface CodeExportDialogProps {
  open: boolean;
  onClose: () => void;
  example: ExampleDefinition;
  currentParams: Record<string, number | string | boolean>;
}

export function CodeExportDialog({ open, onClose, example, currentParams }: CodeExportDialogProps) {
  const [tab, setTab] = useState<'vanilla' | 'r3f'>('vanilla');

  const vanillaCode = example.vanillaCode(currentParams).trim();
  const r3fCode = example.r3fCode(currentParams).trim();
  const activeCode = tab === 'vanilla' ? vanillaCode : r3fCode;

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
          bgcolor: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 2.5,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#38bdf8' }}>
            {example.title} - 코드 내보내기
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            현재 적용된 파라미터 값으로 완성된 실행 가능한 소스코드를 복사하여 즉시 활용할 수
            있습니다.
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 2.5, pt: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { minHeight: 40, py: 0.5, fontWeight: 700, color: 'text.secondary' },
            '& .Mui-selected': { color: '#38bdf8' },
          }}
        >
          <Tab value="vanilla" label="Vanilla Three.js (JavaScript)" />
          <Tab value="r3f" label="React Three Fiber (TypeScript / Next.js)" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            bgcolor: '#020617',
            borderRadius: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            overflowX: 'auto',
            maxHeight: 440,
          }}
        >
          <code>{activeCode}</code>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#94a3b8' }}
        >
          닫기
        </Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          startIcon={<ContentCopyRoundedIcon />}
          sx={{
            bgcolor: '#0284c7',
            '&:hover': { bgcolor: '#0369a1' },
            fontWeight: 800,
          }}
        >
          코드 전체 복사하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
