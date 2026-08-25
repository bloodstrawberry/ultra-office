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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';

import { Scrollbar } from 'src/components/scrollbar';

import { SAMPLE_DATASETS } from './sample-datasets';

// ----------------------------------------------------------------------

interface SqlProblemPanelProps {
  title?: string;
  problems: SqlProblem[];
  selectedProblem: SqlProblem | null;
  onSelectProblem: (prob: SqlProblem) => void;
  solvedProblemIds: string[];
  verificationResult: VerificationResult | null;
  onInsertSolution?: (solutionQuery: string) => void;
  onInsertAndRun?: (query: string) => void;
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
  onInsertAndRun,
}: SqlProblemPanelProps) {
  // Extract distinct main categories from problems
  const mainCategories = React.useMemo(() => {
    const cats = problems.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [problems]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showTablePreview, setShowTablePreview] = useState(true);

  // Sync category & subcategory when selectedProblem changes externally
  useEffect(() => {
    if (selectedProblem) {
      if (selectedCategory !== 'all' && selectedProblem.category !== selectedCategory) {
        setSelectedCategory(selectedProblem.category);
      }
      if (
        selectedSubCategory !== 'all' &&
        selectedProblem.subCategory &&
        selectedProblem.subCategory !== selectedSubCategory
      ) {
        setSelectedSubCategory(selectedProblem.subCategory);
      }
    }
  }, [selectedProblem?.id]);

  // Subcategories available under the selected category (or all if 'all')
  const availableSubCategories = React.useMemo(() => {
    const subset = problems.filter(
      (p) => selectedCategory === 'all' || p.category === selectedCategory
    );
    const subs = subset.map((p) => p.subCategory).filter((sub): sub is string => Boolean(sub));
    return Array.from(new Set(subs));
  }, [problems, selectedCategory]);

  // Filter problems by main category and optional subcategory
  const filteredProblems = React.useMemo(() => {
    return problems.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSub = selectedSubCategory === 'all' || p.subCategory === selectedSubCategory;
      return matchCat && matchSub;
    });
  }, [problems, selectedCategory, selectedSubCategory]);

  // Current problem index in filtered list for Next/Previous navigation
  const currentProblemIndex = React.useMemo(() => {
    if (!selectedProblem) return -1;
    return filteredProblems.findIndex((p) => p.id === selectedProblem.id);
  }, [filteredProblems, selectedProblem]);

  const hasPrevProblem = currentProblemIndex > 0;
  const hasNextProblem =
    currentProblemIndex >= 0 && currentProblemIndex < filteredProblems.length - 1;

  const handlePrevProblem = () => {
    if (hasPrevProblem) {
      onSelectProblem(filteredProblems[currentProblemIndex - 1]);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handleNextProblem = () => {
    if (hasNextProblem) {
      onSelectProblem(filteredProblems[currentProblemIndex + 1]);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('all');
    const firstOfCat = problems.find((p) => cat === 'all' || p.category === cat);
    if (firstOfCat) {
      onSelectProblem(firstOfCat);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handleSubCategoryChange = (sub: string) => {
    setSelectedSubCategory(sub);
    const firstOfSub = problems.find(
      (p) =>
        (selectedCategory === 'all' || p.category === selectedCategory) &&
        (sub === 'all' || p.subCategory === sub)
    );
    if (firstOfSub) {
      onSelectProblem(firstOfSub);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const solvedCount = problems.filter((p) => solvedProblemIds.includes(p.id)).length;
  const progressPercent =
    problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

  // Find target table metadata and initial data for original preview
  const currentDataset = SAMPLE_DATASETS.find((d) => d.id === selectedProblem?.datasetId);
  const targetTableName =
    selectedProblem?.targetTable ||
    (selectedProblem?.datasetId === 'sqld_sqlp' ? 'emp' : currentDataset?.tables[0]?.name);
  const targetTableInfo = currentDataset?.tables.find(
    (t) => t.name.toLowerCase() === targetTableName?.toLowerCase()
  );

  const handleExecuteQuickQuery = (query: string) => {
    if (onInsertAndRun) {
      onInsertAndRun(query);
    } else if (onInsertSolution) {
      onInsertSolution(query);
    }
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

        {/* Dropdown Selectors: Category, Subcategory & Problem */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            mt: 1.25,
          }}
        >
          {/* Row 1: Category & Subcategory Dropdowns */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <InputLabel id="category-select-label" sx={{ fontSize: 12 }}>
                카테고리
              </InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                label="카테고리"
                onChange={(e) => handleCategoryChange(e.target.value)}
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  '& .MuiSelect-select': { py: 0.75 },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: 12 }}>
                  전체 카테고리 ({problems.length})
                </MenuItem>
                {mainCategories.map((cat) => {
                  const catCount = problems.filter((p) => p.category === cat).length;
                  return (
                    <MenuItem key={cat} value={cat} sx={{ fontSize: 12 }}>
                      {cat} ({catCount})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <InputLabel id="subcategory-select-label" sx={{ fontSize: 12 }}>
                하위 카테고리
              </InputLabel>
              <Select
                labelId="subcategory-select-label"
                value={selectedSubCategory}
                label="하위 카테고리"
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={availableSubCategories.length === 0}
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  '& .MuiSelect-select': { py: 0.75 },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: 12 }}>
                  전체 하위 카테고리
                </MenuItem>
                {availableSubCategories.map((sub) => (
                  <MenuItem key={sub} value={sub} sx={{ fontSize: 12 }}>
                    {sub}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Problem Selector Dropdown with Prev/Next Navigation */}
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            <Tooltip title="이전 문제">
              <span>
                <IconButton
                  size="small"
                  onClick={handlePrevProblem}
                  disabled={!hasPrevProblem}
                  sx={{
                    bgcolor: 'background.paper',
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                  }}
                >
                  <NavigateBeforeRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <Select
                value={selectedProblem?.id || ''}
                onChange={(e) => {
                  const target = problems.find((p) => p.id === e.target.value);
                  if (target) {
                    onSelectProblem(target);
                    setShowHint(false);
                    setShowSolution(false);
                  }
                }}
                renderValue={(selectedId) => {
                  const prob = problems.find((p) => p.id === selectedId);
                  if (!prob) return '';
                  const isSolved = solvedProblemIds.includes(prob.id);
                  const pIdx = filteredProblems.findIndex((p) => p.id === prob.id);
                  const pNum = pIdx >= 0 ? `Q${pIdx + 1}. ` : '';
                  return (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden' }}
                    >
                      {isSolved ? (
                        <CheckCircleRoundedIcon
                          sx={{ fontSize: 15, color: 'success.main', flexShrink: 0 }}
                        />
                      ) : (
                        <RadioButtonUncheckedRoundedIcon
                          sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {pNum}
                        {prob.title}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  fontSize: 12,
                  bgcolor: 'background.paper',
                  '& .MuiSelect-select': { py: 0.75 },
                }}
              >
                {filteredProblems.map((prob, idx) => {
                  const isSolved = solvedProblemIds.includes(prob.id);
                  return (
                    <MenuItem key={prob.id} value={prob.id} sx={{ fontSize: 12, py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {isSolved ? (
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <RadioButtonUncheckedRoundedIcon
                            sx={{ fontSize: 16, color: 'text.disabled' }}
                          />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 700 }}>
                            Q{idx + 1}. {prob.title}
                          </Typography>
                          {prob.subCategory && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block', fontSize: 10.5 }}
                            >
                              {prob.category} &gt; {prob.subCategory}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Tooltip title="다음 문제">
              <span>
                <IconButton
                  size="small"
                  onClick={handleNextProblem}
                  disabled={!hasNextProblem}
                  sx={{
                    bgcolor: 'background.paper',
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                  }}
                >
                  <NavigateNextRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
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
              sx={{ fontWeight: 700, borderColor: 'primary.main', color: 'primary.main' }}
            />
            {selectedProblem.subCategory && (
              <Chip
                size="small"
                label={selectedProblem.subCategory}
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(0,167,111,0.16)' : 'rgba(0,167,111,0.08)',
                  borderColor: 'primary.light',
                  color: 'primary.darker',
                }}
              />
            )}
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

          {/* 1. Original Table Data Preview Card */}
          {targetTableInfo && (
            <Card
              sx={{
                mb: 2,
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.vars.palette.primary.light}`,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 167, 111, 0.06)'
                    : 'rgba(0, 167, 111, 0.03)',
                overflow: 'hidden',
              }}
            >
              <Box
                onClick={() => setShowTablePreview((prev) => !prev)}
                sx={{
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(0, 167, 111, 0.12)'
                      : 'rgba(0, 167, 111, 0.08)',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChartRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>
                    기본 테이블 데이터: <strong>{targetTableInfo.name.toUpperCase()}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ({targetTableInfo.initialData.length}건)
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  endIcon={showTablePreview ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                  sx={{ fontSize: 11, fontWeight: 700, height: 24, p: 0.5 }}
                >
                  {showTablePreview ? '접기' : '미리보기 펼치기'}
                </Button>
              </Box>

              <Collapse in={showTablePreview}>
                <Box
                  sx={{
                    maxHeight: 200,
                    overflow: 'auto',
                    p: 0,
                    bgcolor: 'background.paper',
                    position: 'relative',
                  }}
                >
                  <Table size="small" stickyHeader sx={{ borderCollapse: 'separate' }}>
                    <TableHead>
                      <TableRow>
                        {targetTableInfo.columns.map((col) => (
                          <TableCell
                            key={col.name}
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              py: 0.75,
                              px: 1.25,
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
                              whiteSpace: 'nowrap',
                              zIndex: 2,
                            }}
                          >
                            {col.name}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {targetTableInfo.initialData.map((row, rIdx) => (
                        <TableRow key={rIdx} hover>
                          {targetTableInfo.columns.map((col) => {
                            const val = row[col.name];
                            const isNull = val === null || val === undefined;
                            return (
                              <TableCell
                                key={col.name}
                                sx={{
                                  fontSize: 11.5,
                                  py: 0.5,
                                  px: 1.25,
                                  whiteSpace: 'nowrap',
                                  color: isNull ? 'text.disabled' : 'text.primary',
                                  fontStyle: isNull ? 'italic' : 'normal',
                                  borderBottom: (theme) =>
                                    `1px dashed ${theme.vars.palette.divider}`,
                                }}
                              >
                                {isNull ? (
                                  <Box
                                    component="span"
                                    sx={{
                                      bgcolor: 'action.hover',
                                      px: 0.6,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: 'error.main',
                                    }}
                                  >
                                    NULL
                                  </Box>
                                ) : (
                                  String(val)
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </Card>
          )}

          {/* 2. Problem Description */}
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

          {/* 3. Quick Operator Examples Section (⚡ 연산자별 예시 쿼리 바로 실행) */}
          {selectedProblem.quickExamples && selectedProblem.quickExamples.length > 0 && (
            <Card
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <DataObjectRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>
                  ⚡ 연산자 예시 쿼리 바로 실행
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 1.25 }}
              >
                버튼을 누르면 에디터에 쿼리가 적용되고 즉시 실행 결과를 비교할 수 있습니다.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedProblem.quickExamples.map((ex, idx) => (
                  <Tooltip key={idx} title={ex.description || ex.query} arrow>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleExecuteQuickQuery(ex.query)}
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        py: 0.5,
                        px: 1.25,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        textTransform: 'none',
                      }}
                    >
                      {ex.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Card>
          )}

          {/* 4. Interactive Try-It Modification Guide (🛠️ 쿼리 수정 & 실시간 결과 변화 체험) */}
          {selectedProblem.tryModifications && selectedProblem.tryModifications.length > 0 && (
            <Card
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.vars.palette.info.light}`,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 184, 217, 0.06)'
                    : 'rgba(0, 184, 217, 0.04)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <AutoFixHighRoundedIcon sx={{ fontSize: 18, color: 'info.main' }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, fontSize: 13, color: 'info.darker' }}
                >
                  🛠️ 쿼리를 수정하고 결과 변화 확인하기
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedProblem.tryModifications.map((mod, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}
                      >
                        👉 {mod.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: 11.5 }}
                      >
                        {mod.guide}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="soft"
                      color="info"
                      startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 15 }} />}
                      onClick={() => handleExecuteQuickQuery(mod.query)}
                      sx={{ fontSize: 11.5, height: 26, fontWeight: 700, flexShrink: 0 }}
                    >
                      실행해보기
                    </Button>
                  </Box>
                ))}
              </Box>
            </Card>
          )}

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
