'use client';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';

import { useSqldPractice } from './use-sqld-practice';
import { SqldHeader } from './components/sqld-header';
import { SqldPagination } from './components/sqld-pagination';
import { SqldEditorCard } from './components/sqld-editor-card';
import { SqldProblemCard } from './components/sqld-problem-card';
import { SqldQuestionMap } from './components/sqld-question-map';
import { SqldEditorHeader } from './components/sqld-editor-header';

// ----------------------------------------------------------------------

export function SqldPracticeView() {
  const {
    rounds,
    selectedRoundId,
    currentProblems,
    currentProblem,
    currentIndex,
    pageInput,
    showAllAnswers,
    showMap,
    loading,
    error,
    currentRoundRecords,
    currentRecord,
    roundStatistics,
    viewMode,
    setViewMode,
    handleSelectRound,
    handlePrevProblem,
    handleNextProblem,
    handleJumpTo,
    handlePageInputChange,
    handlePageInputBlur,
    handlePageInputKeyDown,
    handleSelectChoice,
    handleSubmitAnswer,
    handleRevealAnswer,
    handleResetProblem,
    handleResetRound,
    handleToggleShowAllAnswers,
    handleToggleMap,
    handleCopyProblem,
    updateProblem,
    handleAddProblem,
    handleDuplicateProblem,
    handleRemoveProblem,
    handleSaveData,
    handleExportJson,
    handleResetToDefault,
  } = useSqldPractice();

  // Anchors and refs for auto-scrolling to top on question change
  const isFirstMount = useRef(true);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const problemCardAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return () => {};
    }

    const rafId = requestAnimationFrame(() => {
      const targetRef = showMap ? problemCardAnchorRef : pageTopRef;
      const targetElem = targetRef.current || problemCardAnchorRef.current || pageTopRef.current;

      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetElem.focus({ preventScroll: true });
      }

      if (typeof window !== 'undefined') {
        const scrollableParent = (targetElem?.closest('.layout__dashboard__content') ||
          targetElem?.closest('.MuiContainer-root')) as HTMLElement | null;

        if (scrollableParent && !showMap) {
          scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [currentIndex, selectedRoundId, showMap]);

  // 1. Loading State
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          SQLD 기출문제 데이터를 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  // 2. Error State
  if (error || !currentProblems.length) {
    return (
      <Card
        sx={{
          p: 5,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.neutral',
          borderRadius: 2,
        }}
      >
        <AssignmentRoundedIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {error || '불러올 수 있는 SQLD 기출문제가 없습니다.'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', maxWidth: 460 }}>
          public/sqld/problem.json 파일이 정상적으로 위치해 있는지 확인해 주세요.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => window.location.reload()}
          sx={{ fontWeight: 700, mt: 1 }}
        >
          새로고침
        </Button>
      </Card>
    );
  }

  // 3. Problem Editor View Mode
  if (viewMode === 'editor') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          pb: 6,
        }}
      >
        {/* Top Scroll Anchor */}
        <Box
          ref={pageTopRef}
          tabIndex={-1}
          sx={{ position: 'relative', top: 0, height: 0, outline: 'none' }}
        />

        {/* Editor Toolbar Header */}
        <SqldEditorHeader
          rounds={rounds}
          selectedRoundId={selectedRoundId}
          onSelectRound={handleSelectRound}
          currentIndex={currentIndex}
          totalProblems={currentProblems.length}
          pageInput={pageInput}
          onPrev={handlePrevProblem}
          onNext={handleNextProblem}
          onPageInputChange={handlePageInputChange}
          onPageInputBlur={handlePageInputBlur}
          onPageInputKeyDown={handlePageInputKeyDown}
          onExitEditor={() => setViewMode('practice')}
          onAddProblem={handleAddProblem}
          onDuplicateProblem={handleDuplicateProblem}
          onRemoveProblem={handleRemoveProblem}
          onSave={handleSaveData}
          onExportJson={handleExportJson}
          onResetToDefault={handleResetToDefault}
        />

        {/* Problem Card Scroll Anchor */}
        <Box
          ref={problemCardAnchorRef}
          tabIndex={-1}
          sx={{ position: 'relative', top: -20, height: 0, outline: 'none' }}
        />

        {/* Problem Editor Card Form */}
        {currentProblem && (
          <SqldEditorCard
            problem={currentProblem}
            problemIndex={currentIndex}
            onUpdateProblem={updateProblem}
          />
        )}

        {/* Bottom Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <SqldPagination
            variant="footer"
            currentIndex={currentIndex}
            totalProblems={currentProblems.length}
            pageInput={pageInput}
            onPrev={handlePrevProblem}
            onNext={handleNextProblem}
            onPageInputChange={handlePageInputChange}
            onPageInputBlur={handlePageInputBlur}
            onPageInputKeyDown={handlePageInputKeyDown}
          />
        </Box>
      </Box>
    );
  }

  // 4. Problem Practice View Mode (Default)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 1200,
        width: '100%',
        mx: 'auto',
        pb: 6,
      }}
    >
      {/* Top Scroll Anchor */}
      <Box
        ref={pageTopRef}
        tabIndex={-1}
        sx={{ position: 'relative', top: 0, height: 0, outline: 'none' }}
      />

      {/* 1. Header Toolbar */}
      <SqldHeader
        rounds={rounds}
        selectedRoundId={selectedRoundId}
        onSelectRound={handleSelectRound}
        currentIndex={currentIndex}
        totalProblems={currentProblems.length}
        pageInput={pageInput}
        onPrev={handlePrevProblem}
        onNext={handleNextProblem}
        onPageInputChange={handlePageInputChange}
        onPageInputBlur={handlePageInputBlur}
        onPageInputKeyDown={handlePageInputKeyDown}
        showAllAnswers={showAllAnswers}
        onToggleShowAllAnswers={handleToggleShowAllAnswers}
        showMap={showMap}
        onToggleMap={handleToggleMap}
        onCopyProblem={handleCopyProblem}
        onResetRound={handleResetRound}
        onEnterEditor={() => setViewMode('editor')}
      />

      {/* 2. 50 Question Map Collapsible Section */}
      <Collapse in={showMap}>
        <SqldQuestionMap
          problems={currentProblems}
          records={currentRoundRecords}
          currentIndex={currentIndex}
          stats={roundStatistics}
          onSelectProblem={(idx) => {
            handleJumpTo(idx);
          }}
        />
      </Collapse>

      {/* Problem Card Scroll Anchor */}
      <Box
        ref={problemCardAnchorRef}
        tabIndex={-1}
        sx={{ position: 'relative', top: -20, height: 0, outline: 'none' }}
      />

      {/* 3. Main Problem Card */}
      {currentProblem && (
        <SqldProblemCard
          problem={currentProblem}
          problemIndex={currentIndex}
          record={currentRecord}
          showAllAnswers={showAllAnswers}
          onSelectChoice={handleSelectChoice}
          onSubmitAnswer={handleSubmitAnswer}
          onRevealAnswer={handleRevealAnswer}
          onResetProblem={handleResetProblem}
          onEditProblem={() => setViewMode('editor')}
        />
      )}

      {/* 4. Bottom Footer Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <SqldPagination
          variant="footer"
          currentIndex={currentIndex}
          totalProblems={currentProblems.length}
          pageInput={pageInput}
          onPrev={handlePrevProblem}
          onNext={handleNextProblem}
          onPageInputChange={handlePageInputChange}
          onPageInputBlur={handlePageInputBlur}
          onPageInputKeyDown={handlePageInputKeyDown}
        />
      </Box>
    </Box>
  );
}
