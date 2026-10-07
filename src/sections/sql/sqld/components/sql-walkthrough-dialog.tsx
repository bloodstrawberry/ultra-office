'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';

import { explainSql } from '../sql-walkthrough';

interface Props {
  sql: string;
  onClose: () => void;
}

export function SqlWalkthroughDialog({ sql, onClose }: Props) {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => explainSql(sql), [sql]);
  const activeIndex = Math.min(stepIndex, steps.length - 1);
  const activeStep = steps[activeIndex];

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      fullScreen={isSmall}
      maxWidth="lg"
      aria-labelledby="sqld-sql-walkthrough-title"
      sx={{
        '& .MuiDialog-paper': {
          height: isSmall ? '100dvh' : '90vh',
          maxHeight: isSmall ? '100dvh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        id="sqld-sql-walkthrough-title"
        component="div"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1.5, flexShrink: 0 }}
      >
        <Typography variant="h6" component="h2" sx={{ flex: 1, fontWeight: 800 }}>
          SQL 단계별 원리
        </Typography>
        <IconButton onClick={onClose} aria-label="단계별 원리 닫기">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Alert severity="info" sx={{ flexShrink: 0 }}>
          입력한 SQL의 구조를 읽는 학습용 순서입니다. 실제 물리적 실행 순서와 최적화 방식은
          데이터베이스마다 다를 수 있습니다.
        </Alert>

        {activeStep ? (
          <>
            <Box
              sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5, flexShrink: 0 }}
              aria-label="SQL 설명 단계"
            >
              {steps.map((step, index) => (
                <Button
                  key={`${step.start}-${step.end}-${index}`}
                  size="small"
                  variant={index === activeIndex ? 'contained' : 'outlined'}
                  onClick={() => setStepIndex(index)}
                  sx={{ flexShrink: 0, whiteSpace: 'nowrap', textTransform: 'none' }}
                >
                  {index + 1}. {step.title}
                </Button>
              ))}
            </Box>

            <Box
              component="pre"
              aria-label="현재 단계의 SQL 구문 강조"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 1.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                maxHeight: 260,
                overflow: 'auto',
                flexShrink: 0,
              }}
            >
              {sql.slice(0, activeStep.start)}
              <Box
                component="mark"
                sx={{
                  bgcolor: (theme) => theme.palette.warning.light,
                  color: 'text.primary',
                  borderRadius: 0.5,
                }}
              >
                {sql.slice(activeStep.start, activeStep.end)}
              </Box>
              {sql.slice(activeStep.end)}
            </Box>

            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip label={`${activeIndex + 1} / ${steps.length}`} size="small" color="primary" />
                {activeStep.level > 0 && <Chip label="하위 쿼리" size="small" variant="outlined" />}
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {activeStep.title}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
                {activeStep.summary}
              </Typography>
              <Box component="ol" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
                {activeStep.details.map((detail, index) => (
                  <Box
                    component="li"
                    key={`${index}-${detail}`}
                    sx={{ mb: 0.75, fontSize: 14, lineHeight: 1.7, overflowWrap: 'anywhere' }}
                  >
                    {detail}
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            분석할 SQL을 입력한 다음 다시 열어 주세요.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.25, justifyContent: 'space-between', flexShrink: 0 }}>
        <Button
          startIcon={<NavigateBeforeRoundedIcon />}
          disabled={activeIndex <= 0}
          onClick={() => setStepIndex((index) => index - 1)}
        >
          이전 단계
        </Button>
        <Button
          variant="contained"
          endIcon={<NavigateNextRoundedIcon />}
          disabled={activeIndex < 0 || activeIndex >= steps.length - 1}
          onClick={() => setStepIndex((index) => index + 1)}
        >
          다음 단계
        </Button>
      </DialogActions>
    </Dialog>
  );
}
