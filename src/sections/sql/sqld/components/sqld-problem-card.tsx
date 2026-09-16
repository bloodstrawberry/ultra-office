'use client';

import type { Problem, UserProblemRecord } from '../types';

import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import { alpha, useTheme } from '@mui/material/styles';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormControlLabel from '@mui/material/FormControlLabel';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { SqldErdRenderer } from './sqld-erd-renderer';

// ----------------------------------------------------------------------

interface SqldProblemCardProps {
  problem: Problem;
  problemIndex: number;
  record?: UserProblemRecord;
  showAllAnswers: boolean;
  onSelectChoice: (choiceNum: number, isMultiple: boolean) => void;
  onSubmitAnswer: () => void;
  onRevealAnswer: () => void;
  onResetProblem: () => void;
  onEditProblem?: () => void;
}

export function SqldProblemCard({
  problem,
  problemIndex,
  record,
  showAllAnswers,
  onSelectChoice,
  onSubmitAnswer,
  onRevealAnswer,
  onResetProblem,
  onEditProblem,
}: SqldProblemCardProps) {
  const theme = useTheme();

  const isMultiple = Boolean(problem.isMultipleAnswer);
  const correctAnswersList = isMultiple
    ? (problem.answers || []).slice().sort((a, b) => a - b)
    : problem.answer
      ? [problem.answer]
      : [];

  const userSelections = record?.selectedAnswers || [];
  const isSubmitted = Boolean(record?.isSubmitted);
  const isRevealed = showAllAnswers || Boolean(record?.isRevealed) || isSubmitted;
  const isCorrect = Boolean(record?.isCorrect);

  const problemErds = Array.isArray(problem.erds)
    ? problem.erds.filter((e) => e && e.trim())
    : problem.erd && problem.erd.trim()
      ? [problem.erd.trim()]
      : [];

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        border: (t) => `1px solid ${t.vars.palette.divider}`,
        bgcolor: 'background.paper',
        ...(isSubmitted && {
          borderWidth: 2,
          borderColor: isCorrect ? 'success.main' : 'error.main',
        }),
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Top Header: Question Number & Status Chips & Hashtags */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {/* Left: Number circle & result status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                bgcolor: isSubmitted ? (isCorrect ? 'success.main' : 'error.main') : 'text.primary',
                color: 'background.paper',
              }}
            >
              {problemIndex + 1}
            </Box>

            {isSubmitted && (
              <Chip
                label={isCorrect ? '정답!' : '오답'}
                color={isCorrect ? 'success' : 'error'}
                sx={{ fontWeight: 800, fontSize: 13, height: 26 }}
              />
            )}

            {problem.isMultipleAnswer && (
              <Chip
                label={`다중 정답 (${(problem.answers || []).length}개)`}
                size="small"
                color="warning"
                variant="soft"
                sx={{ fontWeight: 700, fontSize: 12 }}
              />
            )}
          </Box>

          {/* Right: Hashtags */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              justifyContent: 'flex-end',
            }}
          >
            {problem.hashtags.map((tag, tIdx) => (
              <Chip
                key={tIdx}
                label={tag}
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 600, fontSize: 12 }}
              />
            ))}
          </Box>
        </Box>

        {/* Question Text (Markdown) */}
        <Box
          sx={{
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.8,
            color: 'text.primary',
            '& p': { m: 0 },
            '& strong': { fontWeight: 800 },
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {problem.question}
          </ReactMarkdown>
        </Box>

        {/* Description Box (지문 / SQL 코드 / Markdown Table) */}
        {problem.description && problem.description.trim() && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
              border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.16)}`,
              '& p': {
                m: 0,
                mb: 1.5,
                fontSize: 14,
                lineHeight: 1.8,
                color: 'text.secondary',
                whiteSpace: 'pre-wrap',
                '&:last-child': { mb: 0 },
              },
              '& strong': { fontWeight: 700 },
              '& code': {
                px: 0.8,
                py: 0.3,
                borderRadius: 0.6,
                fontSize: 13,
                fontFamily: 'monospace',
                bgcolor: (t) => alpha(t.palette.grey[500], 0.12),
                color: 'error.main',
              },
              '& pre': {
                p: 1.5,
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.grey[500], 0.1),
                overflow: 'auto',
                '& code': {
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  px: 0,
                  py: 0,
                },
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 1.5,
                '& th, & td': {
                  px: 1.5,
                  py: 1,
                  fontSize: 13,
                  border: (t) => `1px solid ${t.vars.palette.divider}`,
                },
                '& th': {
                  fontWeight: 700,
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
                },
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {problem.description}
            </ReactMarkdown>
          </Box>
        )}

        {/* ERD Diagrams if present in problem */}
        {problemErds.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {problemErds.map((erdText, eIdx) => (
              <SqldErdRenderer
                key={eIdx}
                chart={erdText}
                idPrefix={`sqld_erd_${problemIndex}_${eIdx}`}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* 4 Choices */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {problem.choices.map((choice, cIndex) => {
            const choiceNum = cIndex + 1;
            const isThisCorrect = correctAnswersList.includes(choiceNum);
            const isThisSelected = userSelections.includes(choiceNum);

            let choiceBgColor = 'transparent';
            let choiceBorderColor = theme.vars.palette.divider;
            let choiceIcon = isMultiple ? (
              <CheckBoxOutlineBlankIcon />
            ) : (
              <RadioButtonUncheckedIcon />
            );

            if (isRevealed) {
              if (isThisCorrect) {
                choiceBgColor = alpha(theme.palette.success.main, 0.08);
                choiceBorderColor = theme.vars.palette.success.main;
                choiceIcon = <CheckCircleIcon sx={{ color: 'success.main' }} />;
              } else if (isThisSelected && !isThisCorrect) {
                choiceBgColor = alpha(theme.palette.error.main, 0.08);
                choiceBorderColor = theme.vars.palette.error.main;
                choiceIcon = <CancelIcon sx={{ color: 'error.main' }} />;
              }
            } else if (isThisSelected) {
              choiceIcon = isMultiple ? (
                <CheckBoxIcon color="primary" />
              ) : (
                <RadioButtonCheckedIcon color="primary" />
              );
            }

            return (
              <Box
                key={cIndex}
                onClick={() => !isSubmitted && onSelectChoice(choiceNum, isMultiple)}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1.5px solid',
                  borderColor: choiceBorderColor,
                  bgcolor: choiceBgColor,
                  cursor: isSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  ...(!isSubmitted && {
                    '&:hover': {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                      borderColor: 'primary.main',
                    },
                  }),
                  ...(isThisSelected &&
                    !isSubmitted && {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                      borderColor: 'primary.main',
                    }),
                }}
              >
                <FormControlLabel
                  value={choiceNum}
                  disabled={isSubmitted}
                  control={
                    isMultiple ? (
                      <Checkbox
                        size="small"
                        checked={isThisSelected}
                        icon={isRevealed && isThisCorrect ? choiceIcon : undefined}
                        checkedIcon={isRevealed ? choiceIcon : undefined}
                        sx={{
                          ...(isRevealed && isThisCorrect && { color: 'success.main' }),
                        }}
                      />
                    ) : (
                      <Radio
                        size="small"
                        checked={isThisSelected}
                        icon={isRevealed && isThisCorrect ? choiceIcon : undefined}
                        checkedIcon={isRevealed ? choiceIcon : undefined}
                        sx={{
                          ...(isRevealed && isThisCorrect && { color: 'success.main' }),
                        }}
                      />
                    )
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isThisSelected || (isRevealed && isThisCorrect) ? 800 : 500,
                          mt: 0.1,
                          flexShrink: 0,
                        }}
                      >
                        {choiceNum}.
                      </Typography>
                      <Box
                        sx={{
                          flexGrow: 1,
                          fontSize: 14,
                          fontWeight: isThisSelected || (isRevealed && isThisCorrect) ? 700 : 400,
                          '& p': { m: 0 },
                          '& code': {
                            px: 0.6,
                            py: 0.2,
                            borderRadius: 0.5,
                            bgcolor: (t) => alpha(t.palette.grey[500], 0.12),
                            fontFamily: 'monospace',
                          },
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {choice}
                        </ReactMarkdown>
                      </Box>
                    </Box>
                  }
                  sx={{
                    m: 0,
                    width: '100%',
                    pointerEvents: 'none',
                    '& .MuiFormControlLabel-label': { flexGrow: 1 },
                  }}
                />

                {/* Extra Choice Description if any */}
                {problem.choiceDescriptions?.[cIndex] && (
                  <Box sx={{ pl: 4.5, pt: 0.5, color: 'text.secondary', fontSize: 13 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {problem.choiceDescriptions[cIndex]}
                    </ReactMarkdown>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Action Buttons: Submit / Reveal / Reset */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            pt: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isSubmitted ? (
              <Button
                variant="contained"
                color="primary"
                disabled={userSelections.length === 0}
                onClick={onSubmitAnswer}
                sx={{ fontWeight: 800 }}
              >
                정답 확인 (Enter)
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={onResetProblem}
                sx={{ fontWeight: 700 }}
              >
                다시 풀기
              </Button>
            )}

            {!isRevealed && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<VisibilityIcon />}
                onClick={onRevealAnswer}
                sx={{ fontWeight: 700 }}
              >
                정답 및 해설 보기
              </Button>
            )}

            {onEditProblem && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<EditRoundedIcon />}
                onClick={onEditProblem}
                sx={{ fontWeight: 700 }}
              >
                이 문제 편집
              </Button>
            )}
          </Box>

          {isSubmitted && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: isCorrect ? 'success.main' : 'error.main',
              }}
            >
              {isCorrect
                ? '정답입니다! 해설을 참고하여 복습해 보세요.'
                : `오답입니다. (정답: ${correctAnswersList.join(', ')}번)`}
            </Typography>
          )}
        </Box>

        {/* Explanation Collapse Section */}
        <Collapse in={isRevealed}>
          <Box
            sx={{
              mt: 1.5,
              p: 2.5,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.info.main, 0.04),
              border: (t) => `1px solid ${alpha(t.palette.info.main, 0.16)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Answer banner */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'info.dark' }}>
                  정답: {correctAnswersList.join(', ')}번
                </Typography>
                {problem.llmKeyConcept && (
                  <Chip
                    size="small"
                    label={`핵심: ${problem.llmKeyConcept}`}
                    color="info"
                    variant="soft"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>

              {problem.llmPredictedAnswer !== undefined && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  LLM 분석 일치율: {problem.isLlmMatch ? '100% 일치' : '검증완료'}
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Detailed Explanation Markdown */}
            {problem.explanation && problem.explanation.trim() && (
              <Box
                sx={{
                  '& h3': {
                    fontSize: 15,
                    fontWeight: 800,
                    mt: 1.5,
                    mb: 0.8,
                    color: 'info.darker',
                  },
                  '& p': {
                    m: 0,
                    mb: 1.2,
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: 'text.secondary',
                    whiteSpace: 'pre-wrap',
                    '&:last-child': { mb: 0 },
                  },
                  '& strong': { fontWeight: 700, color: 'text.primary' },
                  '& code': {
                    px: 0.6,
                    py: 0.2,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    bgcolor: (t) => alpha(t.palette.grey[500], 0.12),
                    color: 'error.main',
                  },
                  '& ol, & ul': {
                    pl: 2.5,
                    m: 0,
                    mb: 1.2,
                    '& li': { fontSize: 14, lineHeight: 1.8, color: 'text.secondary' },
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {problem.explanation}
                </ReactMarkdown>
              </Box>
            )}

            {/* Choice-by-Choice Explanations */}
            {problem.choiceExplanations &&
              problem.choiceExplanations.some((ce) => ce && ce.trim()) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    선택지별 상세 해설
                  </Typography>

                  {problem.choiceExplanations.map((exp, expIdx) => {
                    if (!exp || !exp.trim()) return null;
                    const isChoiceAns = correctAnswersList.includes(expIdx + 1);

                    return (
                      <Box
                        key={expIdx}
                        sx={{
                          p: 1.2,
                          px: 1.5,
                          borderRadius: 1.2,
                          bgcolor: isChoiceAns
                            ? alpha(theme.palette.success.main, 0.08)
                            : alpha(theme.palette.grey[500], 0.04),
                          border: '1px solid',
                          borderColor: isChoiceAns
                            ? alpha(theme.palette.success.main, 0.3)
                            : alpha(theme.palette.grey[500], 0.12),
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Chip
                          size="small"
                          label={`${expIdx + 1}번`}
                          color={isChoiceAns ? 'success' : 'default'}
                          variant={isChoiceAns ? 'filled' : 'outlined'}
                          sx={{ height: 20, fontSize: 11, fontWeight: 800, flexShrink: 0, mt: 0.2 }}
                        />
                        <Box
                          sx={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: isChoiceAns ? 'success.darker' : 'text.secondary',
                            '& p': { m: 0 },
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {exp}
                          </ReactMarkdown>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
          </Box>
        </Collapse>
      </Box>
    </Card>
  );
}
