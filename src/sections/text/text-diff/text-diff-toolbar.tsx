import type { useTextDiff } from './use-text-diff';

import React from 'react';
import { DiffMethod } from 'react-diff-viewer-continued';

import NumbersIcon from '@mui/icons-material/Numbers';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import {
  Stack,
  Paper,
  Select,
  Divider,
  Tooltip,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

interface Props {
  hook: ReturnType<typeof useTextDiff>;
}

export function TextDiffToolbar({ hook }: Props) {
  return (
    <Paper
      sx={{
        p: 1.5,
        mb: 1.5,
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        alignItems: 'center',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>비교 방식</InputLabel>
          <Select
            value={hook.compareMethod}
            label="비교 방식"
            onChange={(e) => hook.setCompareMethod(e.target.value as DiffMethod)}
          >
            <MenuItem value={DiffMethod.CHARS}>Characters (문자)</MenuItem>
            <MenuItem value={DiffMethod.WORDS}>Words (단어)</MenuItem>
            <MenuItem value={DiffMethod.LINES}>Lines (줄)</MenuItem>
            <MenuItem value={DiffMethod.SENTENCES}>Sentences (문장)</MenuItem>
            <MenuItem value={DiffMethod.JSON}>JSON (구조)</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup
        size="small"
        value={[
          ...(hook.splitView ? ['split'] : []),
          ...(hook.showDiffOnly ? ['diffOnly'] : []),
          ...(hook.useDarkTheme ? ['dark'] : []),
          ...(hook.disableWordDiff ? ['noWordDiff'] : []),
          ...(hook.hideLineNumbers ? ['noNumbers'] : []),
        ]}
        onChange={(e, newValues) => {
          if (newValues.includes('split') !== hook.splitView) hook.setSplitView(!hook.splitView);
          if (newValues.includes('diffOnly') !== hook.showDiffOnly)
            hook.setShowDiffOnly(!hook.showDiffOnly);
          if (newValues.includes('dark') !== hook.useDarkTheme)
            hook.setUseDarkTheme(!hook.useDarkTheme);
          if (newValues.includes('noWordDiff') !== hook.disableWordDiff)
            hook.setDisableWordDiff(!hook.disableWordDiff);
          if (newValues.includes('noNumbers') !== hook.hideLineNumbers)
            hook.setHideLineNumbers(!hook.hideLineNumbers);
        }}
        sx={{
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: (theme) => theme.palette.action.selected,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          '& .MuiToggleButton-root': {
            border: 0,
            borderRadius: 1,
            px: 2,
            py: 0.75,
            transition: 'all 0.2s',
            '&.Mui-selected': {
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[2],
              color: 'primary.main',
            },
          },
        }}
      >
        <ToggleButton value="split">
          <Tooltip title={hook.splitView ? '좌우 분할' : '한 줄'}>
            <Stack direction="row" spacing={1} alignItems="center">
              {hook.splitView ? (
                <VerticalSplitIcon fontSize="small" />
              ) : (
                <ViewStreamIcon fontSize="small" />
              )}
              <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Split
              </Typography>
            </Stack>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="diffOnly">
          <Tooltip title="차이점만 보기">
            <Stack direction="row" spacing={1} alignItems="center">
              <DensityMediumIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Diff Only
              </Typography>
            </Stack>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="dark">
          <Tooltip title="다크 모드">
            <Stack direction="row" spacing={1} alignItems="center">
              {hook.useDarkTheme ? (
                <DarkModeIcon fontSize="small" />
              ) : (
                <LightModeIcon fontSize="small" />
              )}
              <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Dark
              </Typography>
            </Stack>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="noWordDiff">
          <Tooltip title="단어 단위 강조">
            <Stack direction="row" spacing={1} alignItems="center">
              <FormatColorTextIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Word Diff
              </Typography>
            </Stack>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="noNumbers">
          <Tooltip title="줄 번호">
            <Stack direction="row" spacing={1} alignItems="center">
              <NumbersIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Numbers
              </Typography>
            </Stack>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
