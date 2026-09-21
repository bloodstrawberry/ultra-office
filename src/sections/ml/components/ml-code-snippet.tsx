'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

// ----------------------------------------------------------------------

interface MlCodeSnippetProps {
  pythonCode: string;
  jsCode: string;
}

export function MlCodeSnippet({ pythonCode, jsCode }: MlCodeSnippetProps) {
  const [lang, setLang] = useState<'python' | 'javascript'>('python');
  const [copied, setCopied] = useState(false);

  const activeCode = lang === 'python' ? pythonCode : jsCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {/* Header with language switcher and copy button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.5,
          bgcolor: 'background.neutral',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={lang}
          onChange={(_, v) => setLang(v)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { minHeight: 40, py: 0, fontWeight: 700, fontSize: '0.8125rem' },
          }}
        >
          <Tab value="python" label="🐍 Python (Scikit-Learn)" />
          <Tab value="javascript" label="⚡ Next.js / TypeScript" />
        </Tabs>

        <Tooltip title={copied ? '복사됨!' : '코드 복사'}>
          <Button
            size="small"
            variant="text"
            color={copied ? 'success' : 'inherit'}
            startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
            onClick={handleCopy}
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          >
            {copied ? '복사 완료' : '복사'}
          </Button>
        </Tooltip>
      </Box>

      {/* Code Body */}
      <Box
        component="pre"
        sx={{
          p: 2,
          m: 0,
          bgcolor: '#0F172A',
          color: '#E2E8F0',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          overflowX: 'auto',
          maxHeight: 280,
        }}
      >
        <code>{activeCode}</code>
      </Box>
    </Card>
  );
}
