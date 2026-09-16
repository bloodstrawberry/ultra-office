'use client';

import type { Problem, RoundStatistics, UserProblemRecord } from '../types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

// ----------------------------------------------------------------------

interface SqldQuestionMapProps {
  problems: Problem[];
  records: Record<number, UserProblemRecord>;
  currentIndex: number;
  stats: RoundStatistics;
  onSelectProblem: (index: number) => void;
}

export function SqldQuestionMap({
  problems,
  records,
  currentIndex,
  stats,
  onSelectProblem,
}: SqldQuestionMapProps) {
  const theme = useTheme();

  // Divide into Subject 1 (1~10) and Subject 2 (11~50)
  const subject1Problems = problems.slice(0, 10);
  const subject2Problems = problems.slice(10, 50);

  const renderQuestionBtn = (pIdx: number) => {
    const record = records[pIdx];
    const isCurrent = currentIndex === pIdx;
    const isSubmitted = record?.isSubmitted;
    const isCorrect = record?.isCorrect;

    let bgcolor = 'background.paper';
    let color = 'text.primary';
    let borderColor = theme.vars.palette.divider;

    if (isSubmitted) {
      if (isCorrect) {
        bgcolor = theme.vars.palette.success.main;
        color = theme.vars.palette.common.white;
        borderColor = theme.vars.palette.success.main;
      } else {
        bgcolor = theme.vars.palette.error.main;
        color = theme.vars.palette.common.white;
        borderColor = theme.vars.palette.error.main;
      }
    } else if (record?.selectedAnswers && record.selectedAnswers.length > 0) {
      bgcolor = alpha(theme.palette.primary.main, 0.12);
      borderColor = theme.vars.palette.primary.main;
      color = theme.vars.palette.primary.main;
    }

    return (
      <Tooltip
        key={pIdx}
        title={
          isSubmitted
            ? `${pIdx + 1}번: ${isCorrect ? '정답' : '오답'}`
            : record?.selectedAnswers?.length
              ? `${pIdx + 1}번: 답안 작성됨 (미채점)`
              : `${pIdx + 1}번: 미풀이`
        }
      >
        <Box
          component="button"
          onClick={() => onSelectProblem(pIdx)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: isCurrent ? 900 : 700,
            cursor: 'pointer',
            border: '1.5px solid',
            borderColor,
            bgcolor,
            color,
            p: 0,
            outline: 'none',
            transition: 'all 0.15s ease',
            ...(isCurrent && {
              boxShadow: `0 0 0 2px ${theme.vars.palette.primary.main}`,
              transform: 'scale(1.1)',
              zIndex: 1,
            }),
            '&:hover': {
              filter: 'brightness(0.92)',
              transform: isCurrent ? 'scale(1.1)' : 'scale(1.05)',
            },
          }}
        >
          {pIdx + 1}
        </Box>
      </Tooltip>
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Stats Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        {/* Total Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            총점:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: stats.isOverallPassed ? 'success.main' : 'text.primary',
            }}
          >
            {stats.totalScore}점
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            / 100점
          </Typography>
          <Chip
            size="small"
            label={stats.isOverallPassed ? '합격선 도달' : '합격선(60점) 미달'}
            color={stats.isOverallPassed ? 'success' : 'default'}
            variant="soft"
            sx={{ fontWeight: 700, fontSize: 11 }}
          />
        </Box>

        {/* Breakdown Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<CheckCircleOutlineIcon />}
            label={`정답 ${stats.correct}개`}
            color="success"
            variant="soft"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            icon={<HighlightOffOutlinedIcon />}
            label={`오답 ${stats.solved - stats.correct}개`}
            color="error"
            variant="soft"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            label={`진행 ${stats.solved} / ${stats.total}문항`}
            color="info"
            variant="soft"
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>

      {/* Subject 1 Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              1과목. 데이터 모델링의 이해
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              (1~10번, 10문항)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {stats.subject1.correct} / {stats.subject1.total} ({stats.subject1.correct * 2}점)
            </Typography>
            <Chip
              size="small"
              label={stats.subject1.isPassed ? '과락 면제' : '과락(40% 미만)'}
              color={stats.subject1.isPassed ? 'success' : 'warning'}
              variant="soft"
              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {subject1Problems.map((_, i) => renderQuestionBtn(i))}
        </Box>
      </Box>

      {/* Subject 2 Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              2과목. SQL 기본 및 활용
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              (11~50번, 40문항)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {stats.subject2.correct} / {stats.subject2.total} ({stats.subject2.correct * 2}점)
            </Typography>
            <Chip
              size="small"
              label={stats.subject2.isPassed ? '과락 면제' : '과락(40% 미만)'}
              color={stats.subject2.isPassed ? 'success' : 'warning'}
              variant="soft"
              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {subject2Problems.map((_, i) => renderQuestionBtn(i + 10))}
        </Box>
      </Box>
    </Card>
  );
}
