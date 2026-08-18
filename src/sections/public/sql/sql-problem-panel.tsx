'use client';

import type { SqlProblem, ProblemLevel, VerificationResult } from './types';

import React, { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import LinearProgress from '@mui/material/LinearProgress';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface SqlProblemPanelProps {
  problems: SqlProblem[];
  selectedProblem: SqlProblem;
  onSelectProblem: (prob: SqlProblem) => void;
  solvedProblemIds: string[];
  verificationResult: VerificationResult | null;
  onInsertSolution?: (solutionQuery: string) => void;
}

const LEVEL_CONFIG: Record<
  ProblemLevel,
  { label: string; color: 'success' | 'info' | 'warning' | 'error' }
> = {
  1: { label: 'Level 1: 기초', color: 'success' },
  2: { label: 'Level 2: 중급', color: 'info' },
  3: { label: 'Level 3: 고급', color: 'warning' },
  4: { label: 'Level 4: 심화', color: 'error' },
};

export function SqlProblemPanel({
  problems,
  selectedProblem,
  onSelectProblem,
  solvedProblemIds,
  verificationResult,
  onInsertSolution,
}: SqlProblemPanelProps) {
  const [levelTab, setLevelTab] = useState<ProblemLevel>(selectedProblem.level);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const filteredProblems = problems.filter((p) => p.level === levelTab);
  const solvedCount = problems.filter((p) => solvedProblemIds.includes(p.id)).length;
  const progressPercent = Math.round((solvedCount / problems.length) * 100);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ProblemLevel) => {
    setLevelTab(newValue);
    const firstOfLevel = problems.find((p) => p.level === newValue);
    if (firstOfLevel) {
      onSelectProblem(firstOfLevel);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handleProblemClick = (prob: SqlProblem) => {
    onSelectProblem(prob);
    setShowHint(false);
    setShowSolution(false);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      {/* Header & Progress */}
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            연습 문제 목록
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            진행률: {solvedCount} / {problems.length} ({progressPercent}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ height: 6, borderRadius: 3 }}
          color="primary"
        />

        {/* Level Tabs */}
        <Tabs
          value={levelTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mt: 1.5,
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              fontSize: 12,
              py: 0.5,
              fontWeight: 'bold',
            },
          }}
        >
          <Tab value={1} label="Lv 1" />
          <Tab value={2} label="Lv 2" />
          <Tab value={3} label="Lv 3" />
          <Tab value={4} label="Lv 4" />
        </Tabs>
      </Box>

      {/* Split Section: Problem List & Problem Detail */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        {/* Horizontal or Vertical Problem Selector */}
        <List
          dense
          sx={{ p: 1, borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}` }}
        >
          {filteredProblems.map((prob) => {
            const isSelected = prob.id === selectedProblem.id;
            const isSolved = solvedProblemIds.includes(prob.id);

            return (
              <ListItem key={prob.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleProblemClick(prob)}
                  sx={{
                    borderRadius: 1,
                    py: 0.8,
                    px: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                  }}
                >
                  {isSolved ? (
                    <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18, flexShrink: 0 }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon
                      color="disabled"
                      sx={{ fontSize: 18, flexShrink: 0 }}
                    />
                  )}
                  <ListItemText
                    primary={prob.title}
                    secondary={prob.category}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: isSelected ? 'bold' : 'medium',
                      noWrap: true,
                    }}
                    secondaryTypographyProps={{
                      fontSize: 11,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Selected Problem Details */}
        <Box sx={{ p: 2 }}>
          {/* Tags & Level */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={LEVEL_CONFIG[selectedProblem.level].label}
              color={LEVEL_CONFIG[selectedProblem.level].color}
              sx={{ fontWeight: 'bold' }}
            />
            <Chip size="small" label={selectedProblem.category} variant="outlined" />
            {solvedProblemIds.includes(selectedProblem.id) && (
              <Chip
                size="small"
                icon={<CheckCircleRoundedIcon />}
                label="해결 완료"
                color="success"
                variant="soft"
              />
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
            {selectedProblem.title}
          </Typography>

          {/* Description */}
          <Box
            sx={{
              p: 1.8,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              mb: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
                color: 'text.primary',
                '& strong': { color: 'primary.main' },
                '& code': {
                  bgcolor: 'action.hover',
                  px: 0.6,
                  py: 0.2,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: 12,
                },
              }}
            >
              {selectedProblem.description}
            </Typography>
          </Box>

          {/* Verification Result Feedback */}
          {verificationResult && (
            <Alert severity={verificationResult.isCorrect ? 'success' : 'error'} sx={{ mb: 2 }}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>
                {verificationResult.isCorrect ? '채점 통과!' : '채점 불일치'}
              </AlertTitle>
              <Typography variant="body2" sx={{ fontSize: 13, mt: 0.5 }}>
                {verificationResult.message}
              </Typography>
              {verificationResult.diffSummary && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {verificationResult.diffSummary}
                </Box>
              )}
            </Alert>
          )}

          {/* Hint Accordion */}
          <Box sx={{ mb: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              color="info"
              fullWidth
              startIcon={<LightbulbRoundedIcon />}
              endIcon={showHint ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              onClick={() => setShowHint((prev) => !prev)}
              sx={{ justifyContent: 'space-between', textTransform: 'none' }}
            >
              힌트 보기 (Hint)
            </Button>
            <Collapse in={showHint}>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'info.lighter',
                  color: 'info.darker',
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: (theme) => `1px solid ${theme.vars.palette.info.light}`,
                }}
              >
                {selectedProblem.hint}
              </Box>
            </Collapse>
          </Box>

          {/* Solution Accordion */}
          <Box>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              fullWidth
              startIcon={<HelpOutlineRoundedIcon />}
              endIcon={showSolution ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              onClick={() => setShowSolution((prev) => !prev)}
              sx={{ justifyContent: 'space-between', textTransform: 'none' }}
            >
              정답 쿼리 보기 (Solution)
            </Button>
            <Collapse in={showSolution}>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    정답 SQL:
                  </Typography>
                  {onInsertSolution && (
                    <Tooltip title="에디터에 붙여넣기">
                      <Button
                        size="small"
                        variant="soft"
                        color="warning"
                        startIcon={<ContentPasteRoundedIcon fontSize="small" />}
                        onClick={() => onInsertSolution(selectedProblem.solutionQuery)}
                        sx={{ fontSize: 11, height: 26 }}
                      >
                        에디터 복사
                      </Button>
                    </Tooltip>
                  )}
                </Box>
                <Box
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    p: 1,
                    borderRadius: 0.5,
                    bgcolor: 'background.neutral',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedProblem.solutionQuery}
                </Box>
                {selectedProblem.explanation && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
                  >
                    💡 {selectedProblem.explanation}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Scrollbar>
    </Card>
  );
}
