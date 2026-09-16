'use client';

import ReactDiffViewer from 'react-diff-viewer-continued';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Box, Card, Tooltip, Typography, IconButton } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { useTextDiff } from '../text-diff/use-text-diff';
import { TextAreaPanel } from '../common/shared-text-area';
import { TextDiffToolbar } from '../text-diff/text-diff-toolbar';
import { LineNumberTextField } from '../common/line-number-text-field';

// ----------------------------------------------------------------------

export function TextDiffView() {
  const diff = useTextDiff();

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        pb: 2,
      }}
    >
      <ResizablePanelGroup orientation="vertical" autoSaveId="text-diff-input-result">
        <ResizablePanel id="text-diff-input" defaultSize={50} minSize={20}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                비교하고 싶은 텍스트를 입력해주세요.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
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
              </Box>
            </Box>

            <ResizablePanelGroup orientation="horizontal" autoSaveId="text-diff-editors">
              <ResizablePanel id="text-diff-original" defaultSize={50} minSize={20} sx={{ pr: 1 }}>
                <TextAreaPanel title="이전 내용 (Original)">
                  <LineNumberTextField
                    value={diff.oldValue}
                    onChange={diff.setOldValue}
                    placeholder="여기에 이전 텍스트를 입력하세요..."
                  />
                </TextAreaPanel>
              </ResizablePanel>
              <ResizableHandle tooltipText="입력 영역 너비 조절" />
              <ResizablePanel id="text-diff-modified" defaultSize={50} minSize={20} sx={{ pl: 1 }}>
                <TextAreaPanel title="변경 내용 (Modified)">
                  <LineNumberTextField
                    value={diff.newValue}
                    onChange={diff.setNewValue}
                    placeholder="여기에 새로운 텍스트를 입력하세요..."
                  />
                </TextAreaPanel>
              </ResizablePanel>
            </ResizablePanelGroup>
          </Card>
        </ResizablePanel>

        <ResizableHandle direction="vertical" tooltipText="입력과 결과 높이 조절" />

        <ResizablePanel id="text-diff-result" defaultSize={50} minSize={20} sx={{ pt: 1 }}>
          <TextDiffToolbar hook={diff} />
          <Scrollbar
            sx={{
              mt: 1,
              flex: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: diff.useDarkTheme ? 'grey.900' : 'background.paper',
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </DashboardContent>
  );
}
