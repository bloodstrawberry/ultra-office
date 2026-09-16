'use client';

import type { Problem } from '../types';

import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
import TagIcon from '@mui/icons-material/Tag';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import SchemaIcon from '@mui/icons-material/Schema';
import { alpha, useTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormControlLabel from '@mui/material/FormControlLabel';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';

import { SqldErdRenderer } from './sqld-erd-renderer';

// ----------------------------------------------------------------------

interface SqldEditorCardProps {
  problem: Problem;
  problemIndex: number;
  onUpdateProblem: (updates: Partial<Problem>) => void;
}

export function SqldEditorCard({ problem, problemIndex, onUpdateProblem }: SqldEditorCardProps) {
  const theme = useTheme();

  const [tagInput, setTagInput] = useState('');
  const [previewQuestion, setPreviewQuestion] = useState(false);
  const [previewDescription, setPreviewDescription] = useState(false);
  const [previewExplanation, setPreviewExplanation] = useState(false);

  // 1. Hashtag Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!problem.hashtags.includes(formatted)) {
      onUpdateProblem({ hashtags: [...problem.hashtags, formatted] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onUpdateProblem({
      hashtags: problem.hashtags.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // 2. ERD Handlers
  const currentErd =
    Array.isArray(problem.erds) && problem.erds.length > 0 ? problem.erds[0] : problem.erd || '';

  const handleErdChange = (newVal: string) => {
    onUpdateProblem({
      erds: newVal.trim() ? [newVal] : [],
      erd: newVal.trim() || undefined,
    });
  };

  // 3. Choices Handlers
  const isMultiple = Boolean(problem.isMultipleAnswer);
  const correctAnswersList = isMultiple
    ? (problem.answers || []).slice().sort((a, b) => a - b)
    : problem.answer
      ? [problem.answer]
      : [];

  const handleChoiceTextChange = (choiceIndex: number, text: string) => {
    const nextChoices = [...problem.choices];
    nextChoices[choiceIndex] = text;
    onUpdateProblem({ choices: nextChoices });
  };

  const handleChoiceDescChange = (choiceIndex: number, desc: string) => {
    const nextDescs = [...(problem.choiceDescriptions || Array(problem.choices.length).fill(''))];
    nextDescs[choiceIndex] = desc;
    onUpdateProblem({ choiceDescriptions: nextDescs });
  };

  const handleToggleAnswer = (choiceNum: number) => {
    if (isMultiple) {
      const exists = correctAnswersList.includes(choiceNum);
      const nextAnswers = exists
        ? correctAnswersList.filter((n) => n !== choiceNum)
        : [...correctAnswersList, choiceNum].sort((a, b) => a - b);
      onUpdateProblem({
        answers: nextAnswers,
        answer: nextAnswers[0] || 1,
      });
    } else {
      onUpdateProblem({
        answer: choiceNum,
        answers: [choiceNum],
      });
    }
  };

  const handleAddChoice = () => {
    const nextChoices = [...problem.choices, ''];
    const nextDescs = [...(problem.choiceDescriptions || []), ''];
    const nextExps = [...(problem.choiceExplanations || []), ''];
    onUpdateProblem({
      choices: nextChoices,
      choiceDescriptions: nextDescs,
      choiceExplanations: nextExps,
    });
  };

  const handleRemoveChoice = (idx: number) => {
    if (problem.choices.length <= 2) return;
    const nextChoices = problem.choices.filter((_, i) => i !== idx);
    const nextDescs = (problem.choiceDescriptions || []).filter((_, i) => i !== idx);
    const nextExps = (problem.choiceExplanations || []).filter((_, i) => i !== idx);

    // Adjust answer numbers
    const removedNum = idx + 1;
    let nextAnswer = problem.answer;
    if (nextAnswer === removedNum) {
      nextAnswer = 1;
    } else if (nextAnswer > removedNum) {
      nextAnswer -= 1;
    }

    const nextAnswers = (problem.answers || [])
      .filter((n) => n !== removedNum)
      .map((n) => (n > removedNum ? n - 1 : n));

    onUpdateProblem({
      choices: nextChoices,
      choiceDescriptions: nextDescs,
      choiceExplanations: nextExps,
      answer: nextAnswer,
      answers: nextAnswers.length > 0 ? nextAnswers : [1],
    });
  };

  // 4. Choice Explanation Handler
  const handleChoiceExplanationChange = (choiceIndex: number, text: string) => {
    const nextExps = [...(problem.choiceExplanations || Array(problem.choices.length).fill(''))];
    nextExps[choiceIndex] = text;
    onUpdateProblem({ choiceExplanations: nextExps });
  };

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        border: (t) => `1px solid ${t.vars.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Row 1: Problem Index & Flags (Hold, Multiple Answer, Concept) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 14,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
              }}
            >
              #{problemIndex + 1}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              문제 내용 편집
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Multiple answer toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(problem.isMultipleAnswer)}
                  onChange={(e) =>
                    onUpdateProblem({
                      isMultipleAnswer: e.target.checked,
                      answers: e.target.checked
                        ? problem.answers?.length
                          ? problem.answers
                          : [problem.answer || 1]
                        : [problem.answer || 1],
                    })
                  }
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  다중 정답 허용
                </Typography>
              }
            />

            {/* Hold Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(problem.isHold)}
                  onChange={(e) => onUpdateProblem({ isHold: e.target.checked })}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  문제 보류(Hold)
                </Typography>
              }
            />
          </Box>
        </Box>

        {/* Row 2: Hashtags & Key Concept */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'flex-start' },
          }}
        >
          {/* Hashtags */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              해시태그
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1 }}>
              {problem.hashtags.map((tag, tIdx) => (
                <Chip
                  key={tIdx}
                  label={tag}
                  size="small"
                  color="primary"
                  variant="soft"
                  onDelete={() => handleRemoveTag(tIdx)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="#태그 입력 후 추가"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <TagIcon sx={{ color: 'text.disabled', mr: 0.5, fontSize: 18 }} />
                    ),
                  },
                }}
                sx={{ maxWidth: 260 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                sx={{ fontWeight: 700 }}
              >
                추가
              </Button>
            </Box>
          </Box>

          {/* Key Concept (LLM Key Concept) */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              핵심 개념 키워드
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="예: 데이터 모델링 3대 유의점 및 반정규화"
              value={problem.llmKeyConcept || ''}
              onChange={(e) => onUpdateProblem({ llmKeyConcept: e.target.value })}
            />
          </Box>
        </Box>

        <Divider />

        {/* Section 1: Question (문제 질문) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              1. 문제 질문 (Question) *
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={previewQuestion ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => setPreviewQuestion((prev) => !prev)}
            >
              {previewQuestion ? '편집창 보기' : '마크다운 미리보기'}
            </Button>
          </Box>

          {previewQuestion ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                border: (t) => `1px solid ${t.vars.palette.divider}`,
                fontSize: 15,
                fontWeight: 700,
                '& p': { m: 0 },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {problem.question || '*(입력된 질문이 없습니다)*'}
              </ReactMarkdown>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              placeholder="문제를 입력하세요 (Markdown 지원, e.g. **굵게**, `코드`)"
              value={problem.question}
              onChange={(e) => onUpdateProblem({ question: e.target.value })}
            />
          )}
        </Box>

        {/* Section 2: Description (지문 / SQL 구문 / 표) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                2. 문제 지문 / SQL 구문 / 표 (Description)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (선택 사항)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Insert SQL Template */}
              <Tooltip title="SQL 코드 블록 서식 삽입">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CodeRoundedIcon />}
                  onClick={() => {
                    const sqlTemplate =
                      '\n```sql\nSELECT empno, ename, sal\nFROM emp_sample\nWHERE sal >= 3000;\n```\n';
                    onUpdateProblem({
                      description: (problem.description || '') + sqlTemplate,
                    });
                  }}
                  sx={{ fontSize: 12 }}
                >
                  + SQL 블록
                </Button>
              </Tooltip>

              {/* Insert Table Template */}
              <Tooltip title="표(Table) 서식 삽입">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<TableChartRoundedIcon />}
                  onClick={() => {
                    const tableTemplate =
                      '\n| 컬럼A | 컬럼B | 컬럼C |\n| :--- | :--- | :--- |\n| 데이터1 | 데이터2 | 데이터3 |\n';
                    onUpdateProblem({
                      description: (problem.description || '') + tableTemplate,
                    });
                  }}
                  sx={{ fontSize: 12 }}
                >
                  + 표(Table)
                </Button>
              </Tooltip>

              <Button
                size="small"
                variant="text"
                startIcon={previewDescription ? <VisibilityOffIcon /> : <VisibilityIcon />}
                onClick={() => setPreviewDescription((prev) => !prev)}
              >
                {previewDescription ? '편집창' : '미리보기'}
              </Button>
            </Box>
          </Box>

          {previewDescription ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                border: (t) => `1px solid ${t.vars.palette.divider}`,
                '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                '& pre': {
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.1),
                  overflow: 'auto',
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    px: 1.5,
                    py: 0.8,
                    border: (t) => `1px solid ${t.vars.palette.divider}`,
                  },
                },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {problem.description || '*(입력된 지문이 없습니다)*'}
              </ReactMarkdown>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              placeholder="지문 텍스트, SQL 코드 블록(```sql ... ```), Markdown 표 등을 입력하세요."
              value={problem.description || ''}
              onChange={(e) => onUpdateProblem({ description: e.target.value })}
            />
          )}
        </Box>

        {/* Section 3: ERD Diagram (Mermaid erDiagram) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              <SchemaIcon sx={{ color: 'primary.main', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                3. ERD 다이어그램 (Mermaid erDiagram)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (선택 사항)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleErdChange(`${currentErd}\n고객 ||--o{ 주문 : "한다"`)}
                sx={{ fontSize: 11 }}
              >
                + 1:N 관계
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleErdChange(`${currentErd}\n사원 ||--|| 인사기록 : "1대1"`)}
                sx={{ fontSize: 11 }}
              >
                + 1:1 관계
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleErdChange(`${currentErd}\n학생 }o--o{ 강의 : "수강"`)}
                sx={{ fontSize: 11 }}
              >
                + N:M 관계
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleErdChange(
                    `${currentErd}\n테이블명 {\n    string 컬럼명1 PK\n    string 컬럼명2 FK\n    string 컬럼명3\n}`
                  )
                }
                sx={{ fontSize: 11 }}
              >
                + 테이블 정의
              </Button>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="erDiagram&#10;    고객 ||--o{ 주문 : '주문한다'&#10;    고객 { string 고객ID PK }"
            value={currentErd}
            onChange={(e) => handleErdChange(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />

          {currentErd.trim() && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}
              >
                실시간 ERD 미리보기:
              </Typography>
              <SqldErdRenderer chart={currentErd} idPrefix={`editor_erd_${problemIndex}`} />
            </Box>
          )}
        </Box>

        <Divider />

        {/* Section 4: Choices & Answer Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              4. 4지선다 보기 및 정답 지정 *
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              정답인 보기에 체크/라디오를 선택하세요.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {problem.choices.map((choice, cIdx) => {
              const choiceNum = cIdx + 1;
              const isCorrectChoice = correctAnswersList.includes(choiceNum);

              return (
                <Box
                  key={cIdx}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1.5px solid',
                    borderColor: isCorrectChoice ? 'success.main' : 'divider',
                    bgcolor: isCorrectChoice
                      ? alpha(theme.palette.success.main, 0.04)
                      : 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Answer Radio/Checkbox */}
                    <Tooltip
                      title={isCorrectChoice ? '정답으로 지정됨' : '정답으로 지정하려면 클릭'}
                    >
                      <IconButton
                        size="small"
                        color={isCorrectChoice ? 'success' : 'default'}
                        onClick={() => handleToggleAnswer(choiceNum)}
                      >
                        {isMultiple ? (
                          <Checkbox checked={isCorrectChoice} sx={{ p: 0 }} />
                        ) : (
                          <Radio checked={isCorrectChoice} sx={{ p: 0 }} />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Chip
                      label={`${choiceNum}번`}
                      size="small"
                      color={isCorrectChoice ? 'success' : 'default'}
                      variant={isCorrectChoice ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 800, width: 44 }}
                    />

                    {/* Choice Text Input */}
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`${choiceNum}번 보기 내용 입력 (Markdown 지원)`}
                      value={choice}
                      onChange={(e) => handleChoiceTextChange(cIdx, e.target.value)}
                    />

                    {/* Delete choice if > 2 */}
                    {problem.choices.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveChoice(cIdx)}
                        title="보기 삭제"
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>

                  {/* Optional Choice Extra Description */}
                  <Box sx={{ pl: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`${choiceNum}번 보기에 대한 부가 지문/설명 (선택)`}
                      value={problem.choiceDescriptions?.[cIdx] || ''}
                      onChange={(e) => handleChoiceDescChange(cIdx, e.target.value)}
                      sx={{ '& .MuiInputBase-input': { fontSize: 13 } }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddChoice}
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
          >
            보기 추가
          </Button>
        </Box>

        <Divider />

        {/* Section 5: Overall Explanation (종합 해설) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              5. 종합 해설 (Explanation)
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const template =
                    '### [핵심 개념 및 문제 분석]\n여기에 핵심 개념을 정리합니다.\n\n### [정답 해설]\n정답에 대한 명확한 근거를 서술합니다.\n\n### [오답 분석]\n1. 보기 1: ...\n2. 보기 2: ...\n';
                  onUpdateProblem({
                    explanation: (problem.explanation || '') + template,
                  });
                }}
                sx={{ fontSize: 12 }}
              >
                + 표준 해설 템플릿
              </Button>

              <Button
                size="small"
                variant="text"
                startIcon={previewExplanation ? <VisibilityOffIcon /> : <VisibilityIcon />}
                onClick={() => setPreviewExplanation((prev) => !prev)}
              >
                {previewExplanation ? '편집창' : '미리보기'}
              </Button>
            </Box>
          </Box>

          {previewExplanation ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.info.main, 0.04),
                border: (t) => `1px solid ${alpha(t.palette.info.main, 0.2)}`,
                '& h3': { fontSize: 15, fontWeight: 800, mt: 1, mb: 0.5 },
                '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {problem.explanation || '*(입력된 해설이 없습니다)*'}
              </ReactMarkdown>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={10}
              placeholder="문제의 상세 해설을 입력하세요 (Markdown 지원)"
              value={problem.explanation}
              onChange={(e) => onUpdateProblem({ explanation: e.target.value })}
            />
          )}
        </Box>

        {/* Section 6: Choice Explanations (선택지별 개별 해설) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            6. 선택지별 1:1 상세 해설 (Choice Explanations)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            각 보기가 왜 정답인지, 왜 오답인지 개별적으로 설명합니다.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {problem.choices.map((_, cIdx) => {
              const choiceNum = cIdx + 1;
              const isCorrectChoice = correctAnswersList.includes(choiceNum);

              return (
                <Box key={cIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${choiceNum}번`}
                    size="small"
                    color={isCorrectChoice ? 'success' : 'default'}
                    variant={isCorrectChoice ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 800, width: 44, flexShrink: 0 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`예: ${isCorrectChoice ? '옳음: ...' : '틀림: ...'}`}
                    value={problem.choiceExplanations?.[cIdx] || ''}
                    onChange={(e) => handleChoiceExplanationChange(cIdx, e.target.value)}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
