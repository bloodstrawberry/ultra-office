'use client';

import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Box, Card, Grid, Stack, Tooltip, Typography, IconButton } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import { useTextDiff } from './text-diff/use-text-diff';
import { TextDiffToolbar } from './text-diff/text-diff-toolbar';
import { LineNumberTextField } from './common/line-number-text-field';
import { ResizeHandle, TextAreaPanel } from './common/shared-text-area';

// ----------------------------------------------------------------------

export function TextDiffView() {
  const diff = useTextDiff();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
      <Box
        sx={{
          height: `${diff.inputHeight}px`,
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <Card sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              비교하고 싶은 텍스트를 입력해주세요.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="텍스트 스왑">
                <IconButton size="small" onClick={diff.handleSwap}>
                  <SwapHorizIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="지우기">
                <IconButton size="small" onClick={diff.handleClear} color="error">
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
              <TextAreaPanel title="이전 내용 (Original)">
                <LineNumberTextField
                  value={diff.oldValue}
                  onChange={diff.setOldValue}
                  placeholder="여기에 이전 텍스트를 입력하세요..."
                />
              </TextAreaPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
              <TextAreaPanel title="변경 내용 (Modified)">
                <LineNumberTextField
                  value={diff.newValue}
                  onChange={diff.setNewValue}
                  placeholder="여기에 새로운 텍스트를 입력하세요..."
                />
              </TextAreaPanel>
            </Grid>
          </Grid>
        </Card>
      </Box>

      <ResizeHandle onDrag={diff.handleDrag} />

      <TextDiffToolbar hook={diff} />

      <Scrollbar
        sx={{
          flex: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: diff.useDarkTheme ? 'grey.900' : 'common.white',
          minHeight: 0,
        }}
      >
        <ReactDiffViewer
          oldValue={diff.debouncedOldValue}
          newValue={diff.debouncedNewValue}
          splitView={diff.splitView}
          showDiffOnly={diff.showDiffOnly}
          useDarkTheme={diff.useDarkTheme}
          disableWordDiff={diff.disableWordDiff}
          hideLineNumbers={diff.hideLineNumbers}
          highlightLines={diff.highlightLines}
          onLineNumberClick={diff.handleLineNumberClick}
          compareMethod={diff.compareMethod}
          styles={diff.customStyles}
          codeFoldMessageRenderer={(total) => (
            <Box sx={{ py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {total}개의 줄이 숨겨져 있습니다. 클릭하여 펼치기
              </Typography>
            </Box>
          )}
        />
        {!diff.oldValue && !diff.newValue && (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              비교할 텍스트를 상단에 입력해 주세요.
            </Typography>
          </Box>
        )}
      </Scrollbar>
    </Box>
  );
}
