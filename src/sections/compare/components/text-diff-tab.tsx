'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { LineNumberTextField } from '../../util/components/line-number-text-field';
import { ResizeHandle, TextAreaPanel } from '../../util/components/shared-text-area';
import { TEXT_DIFF_PRESETS, type DiffPreset } from '../data/compare-presets';

// ----------------------------------------------------------------------

export function TextDiffTab() {
  const [oldText, setOldText] = useState<string>(TEXT_DIFF_PRESETS[0].oldVal);
  const [newText, setNewText] = useState<string>(TEXT_DIFF_PRESETS[0].newVal);
  const [splitView, setSplitView] = useState<boolean>(true);
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(false);
  const [hideLineNumbers, setHideLineNumbers] = useState<boolean>(false);
  const [disableWordDiff, setDisableWordDiff] = useState<boolean>(false);
  const [inputHeight, setInputHeight] = useState<number>(240);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyPreset = (preset: DiffPreset) => {
    setOldText(preset.oldVal);
    setNewText(preset.newVal);
    toast.info(`${preset.name} 예제가 로드되었습니다.`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Preset Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          ⚡ 예제 프리셋:
        </Typography>
        {TEXT_DIFF_PRESETS.map((preset, i) => (
          <Chip
            key={i}
            label={preset.name}
            size="small"
            onClick={() => handleApplyPreset(preset)}
            clickable
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          />
        ))}
      </Box>

      {/* Editors Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          height: inputHeight,
        }}
      >
        <TextAreaPanel
          title="이전 내용 (Original / Left)"
          actions={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="클립보드 복사">
                <IconButton size="small" onClick={() => handleCopy(oldText)}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="스왑">
                <IconButton
                  size="small"
                  onClick={() => {
                    const temp = oldText;
                    setOldText(newText);
                    setNewText(temp);
                  }}
                >
                  <SwapHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="비우기">
                <IconButton size="small" color="error" onClick={() => setOldText('')}>
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <LineNumberTextField
            value={oldText}
            onChange={setOldText}
            placeholder="비교할 원본 텍스트를 입력하세요..."
          />
        </TextAreaPanel>

        <TextAreaPanel
          title="변경 내용 (Modified / Right)"
          actions={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="클립보드 복사">
                <IconButton size="small" onClick={() => handleCopy(newText)}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="비우기">
                <IconButton size="small" color="error" onClick={() => setNewText('')}>
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <LineNumberTextField
            value={newText}
            onChange={setNewText}
            placeholder="비교할 변경된 텍스트를 입력하세요..."
          />
        </TextAreaPanel>
      </Box>

      <ResizeHandle
        onDrag={(delta) => setInputHeight((h) => Math.max(160, Math.min(600, h + delta)))}
      />

      {/* Diff Controls Toolbar */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            value={splitView ? 'split' : 'unified'}
            exclusive
            onChange={(_, v) => v && setSplitView(v === 'split')}
            size="small"
          >
            <ToggleButton value="split">나란히 보기 (Split)</ToggleButton>
            <ToggleButton value="unified">통합 보기 (Unified)</ToggleButton>
          </ToggleButtonGroup>

          <FormControlLabel
            control={
              <Switch
                checked={disableWordDiff}
                onChange={(e) => setDisableWordDiff(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                단어 단위 강조 끄기
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={hideLineNumbers}
                onChange={(e) => setHideLineNumbers(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                줄 번호 숨기기
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={useDarkTheme}
                onChange={(e) => setUseDarkTheme(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                다크 모드 뷰어
              </Typography>
            }
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={() =>
              handleDownload(
                `=== ORIGINAL ===\n${oldText}\n\n=== MODIFIED ===\n${newText}`,
                'diff_export.txt'
              )
            }
          >
            Diff 텍스트 내보내기
          </Button>
        </Box>
      </Card>

      {/* Diff Viewer Canvas */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          minHeight: 280,
          bgcolor: useDarkTheme ? 'grey.900' : 'background.paper',
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ReactDiffViewer
          oldValue={oldText}
          newValue={newText}
          splitView={splitView}
          useDarkTheme={useDarkTheme}
          hideLineNumbers={hideLineNumbers}
          disableWordDiff={disableWordDiff}
          codeFoldMessageRenderer={(total) => (
            <Box sx={{ py: 0.8, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {total}개의 변경 없는 줄이 접혀 있습니다. 클릭하여 펼치기
              </Typography>
            </Box>
          )}
        />
      </Card>
    </Box>
  );
}
