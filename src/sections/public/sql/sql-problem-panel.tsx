'use client';

import type { SqlProblem, ProblemLevel, VerificationResult } from './types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import LinearProgress from '@mui/material/LinearProgress';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface SqlProblemPanelProps {
  title?: string;
  problems: SqlProblem[];
  selectedProblem: SqlProblem | null;
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
  title = '연습 문제',
  problems,
  selectedProblem,
  onSelectProblem,
  solvedProblemIds,
  verificationResult,
  onInsertSolution,
}: SqlProblemPanelProps) {
  const [levelTab, setLevelTab] = useState<ProblemLevel>(selectedProblem?.level ?? 1);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Sync level tab when selectedProblem changes
  useEffect(() => {
    if (selectedProblem?.level) {
      setLevelTab(selectedProblem.level);
    }
  }, [selectedProblem?.id, selectedProblem?.level]);

  const filteredProblems = problems.filter((p) => p.level === levelTab);
  const solvedCount = problems.filter((p) => solvedProblemIds.includes(p.id)).length;
  const progressPercent =
    problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

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

  // Empty state when no problems are available
  if (problems.length === 0 || !selectedProblem) {
    return (
      <Card
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            pb: 1.5,
            borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
            bgcolor: 'background.neutral',
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {title} (0제)
          </Typography>
        </Box>

        {/* Empty State Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <AssignmentLateRoundedIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            등록된 예시 문제가 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mb: 2 }}>
            해당 카테고리의 예시 문제가 준비 중입니다. 추후 새로운 예시 문제가 추가될 예정입니다.
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              bgcolor: 'background.neutral',
              px: 2,
              py: 1,
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            💡 상단의 <strong>연습문제 풀이</strong> 또는 <strong>자유 쿼리 샌드박스</strong>를
            이용해 보세요.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: '100%',
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
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {title} ({problems.length}제)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            해결: {solvedCount} / {problems.length} ({progressPercent}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
          color="primary"
        />

        {/* Level Selector Tabs */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            bgcolor: 'background.paper',
            borderRadius: 1.5,
            p: '3px',
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            gap: '4px',
          }}
        >
          {[
            { val: 1 as ProblemLevel, label: 'Lv 1 기초' },
            { val: 2 as ProblemLevel, label: 'Lv 2 중급' },
            { val: 3 as ProblemLevel, label: 'Lv 3 고급' },
            { val: 4 as ProblemLevel, label: 'Lv 4 심화' },
          ].map((item) => (
            <Button
              key={item.val}
              size="small"
              onClick={() => handleTabChange(null as any, item.val)}
              sx={{
                height: 28,
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 1,
                bgcolor: levelTab === item.val ? 'primary.main' : 'transparent',
                color: levelTab === item.val ? '#ffffff' : 'text.secondary',
                '&:hover': {
                  bgcolor: levelTab === item.val ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Horizontal Problem Selector for Current Level */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 1.5,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
          }}
        >
          {filteredProblems.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'text.disabled', py: 0.5, px: 1 }}>
              이 레벨에 등록된 문제가 없습니다.
            </Typography>
          ) : (
            filteredProblems.map((prob, idx) => {
              const isSelected = prob.id === selectedProblem.id;
              const isSolved = solvedProblemIds.includes(prob.id);

              return (
                <Button
                  key={prob.id}
                  size="small"
                  variant={isSelected ? 'contained' : 'outlined'}
                  color={isSelected ? 'primary' : 'inherit'}
                  onClick={() => handleProblemClick(prob)}
                  startIcon={
                    isSolved ? (
                      <CheckCircleRoundedIcon
                        sx={{ fontSize: 16, color: isSelected ? '#ffffff' : 'success.main' }}
                      />
                    ) : (
                      <RadioButtonUncheckedRoundedIcon
                        sx={{
                          fontSize: 16,
                          color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.disabled',
                        }}
                      />
                    )
                  }
                  sx={{
                    flexShrink: 0,
                    fontSize: 12,
                    py: 0.5,
                    px: 1.25,
                    borderRadius: 1.5,
                    fontWeight: isSelected ? 700 : 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Q{idx + 1}. {prob.title.length > 14 ? prob.title.slice(0, 14) + '…' : prob.title}
                </Button>
              );
            })
          )}
        </Box>
      </Box>

      {/* Selected Problem Details */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2 }}>
          {/* Tags & Level */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={LEVEL_CONFIG[selectedProblem.level].label}
              color={LEVEL_CONFIG[selectedProblem.level].color}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              size="small"
              label={selectedProblem.category}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`DB: ${selectedProblem.datasetId}`}
              variant="outlined"
              sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
            />
            {solvedProblemIds.includes(selectedProblem.id) && (
              <Chip
                size="small"
                icon={<CheckCircleRoundedIcon />}
                label="해결 완료"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
            {selectedProblem.title}
          </Typography>

          {/* Description */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              mb: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 1.8,
                color: 'text.primary',
                fontSize: '0.875rem',
                '& strong': { color: 'primary.main', fontWeight: 700 },
                '& code': {
                  bgcolor: 'action.hover',
                  px: 0.8,
                  py: 0.3,
                  borderRadius: 0.75,
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  color: 'info.main',
                  fontWeight: 600,
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
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
              sx={{
                height: 36,
                justifyContent: 'space-between',
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              힌트 보기 (Hint)
            </Button>
            <Collapse in={showHint}>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1.5,
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
              sx={{
                height: 36,
                justifyContent: 'space-between',
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              정답 쿼리 보기 (Solution)
            </Button>
            <Collapse in={showSolution}>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1.5,
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
