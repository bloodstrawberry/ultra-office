'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

import { CodeViewer } from '../visualizer/CodeViewer';
import { ComplexityCard } from '../info/ComplexityCard';
import { DPVisualizer } from '../visualizer/DPVisualizer';
import { GridVisualizer } from '../visualizer/GridVisualizer';
import { TreeVisualizer } from '../visualizer/TreeVisualizer';
import { PlayerControls } from '../visualizer/PlayerControls';
import { VariableWatcher } from '../visualizer/VariableWatcher';
import { useVisualizerStore } from '../../store/visualizerStore';
import { MatrixVisualizer } from '../visualizer/MatrixVisualizer';
import { SearchVisualizer } from '../visualizer/SearchVisualizer';
import { ThreeDVisualizer } from '../visualizer/ThreeDVisualizer';
import { CustomInputModal } from '../visualizer/CustomInputModal';
import { CodingTestGuideCard } from '../info/CodingTestGuideCard';
import { NetworkVisualizer } from '../visualizer/NetworkVisualizer';
import { SortingVisualizer } from '../visualizer/SortingVisualizer';
import { ALGORITHMS, CATEGORIES } from '../../lib/algorithms/registry';
import { RecursionVisualizer } from '../visualizer/RecursionVisualizer';
import { ParametricVisualizer } from '../visualizer/ParametricVisualizer';
import { CountingSortVisualizer } from '../visualizer/CountingSortVisualizer';
import { PlaneSweepingVisualizer } from '../visualizer/PlaneSweepingVisualizer';
import { type AlgorithmId, type AlgorithmCategory } from '../../lib/algorithms/types';

export function VisualizerTab({ initialAlgoId }: { initialAlgoId?: AlgorithmId }) {
  const { currentAlgoId, currentAlgo, steps, currentStepIndex, setAlgorithm, initFromStorage } =
    useVisualizerStore();

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isAlgoListModalOpen, setIsAlgoListModalOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<AlgorithmCategory | 'all'>(
    'all'
  );
  const [activeRightTab, setActiveRightTab] = useState<
    'code' | 'variables' | 'complexity' | 'guide'
  >('code');

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (initialAlgoId && ALGORITHMS[initialAlgoId] && initialAlgoId !== currentAlgoId) {
      setAlgorithm(initialAlgoId);
    }
  }, [initialAlgoId, currentAlgoId, setAlgorithm]);

  const currentStep = steps[currentStepIndex] ||
    steps[0] || {
      stepIndex: 0,
      line: 1,
      description: '알고리즘을 선택하여 실행하세요.',
      variables: {},
    };

  const handleSelectAlgo = (id: AlgorithmId) => {
    setAlgorithm(id);
    setIsAlgoListModalOpen(false);
  };

  // Render canvas according to algorithm category & ID
  const renderCanvas = () => {
    if (is3DMode && (currentAlgo.category === 'sorting' || currentStep.array)) {
      return <ThreeDVisualizer step={currentStep} />;
    }

    if (currentAlgoId === 'countingSort' || currentAlgoId === 'radixSort') {
      return <CountingSortVisualizer step={currentStep} />;
    }
    if (currentAlgoId === 'parametricSearch') {
      return <ParametricVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'sorting') {
      return <SortingVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'search' || currentAlgo.category === 'string') {
      return <SearchVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'tree') {
      return <TreeVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'graph') {
      return <GridVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'advancedGraph') {
      if (currentAlgoId === 'floydWarshall') {
        return <MatrixVisualizer step={currentStep} />;
      }
      return <NetworkVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'dp') {
      return <DPVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'recursion') {
      return <RecursionVisualizer step={currentStep} />;
    }
    if (currentAlgo.category === 'geometry') {
      return <PlaneSweepingVisualizer step={currentStep} />;
    }
    return <SortingVisualizer step={currentStep} />;
  };

  const filteredAlgos = Object.values(ALGORITHMS).filter(
    (a) => selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter
  );

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: '1 1 auto', minHeight: 0 }}
    >
      {/* 1. Header Toolbar: Algorithm Picker, Category Chips, 3D & Custom Data Buttons */}
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Main Algo Selection Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAlgoListModalOpen(true)}
            sx={{ fontWeight: 800, borderRadius: 2, px: 2, py: 1 }}
          >
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>
              {currentAlgo.icon}
            </Box>
            {currentAlgo.name} ({currentAlgo.englishName}) ▾
          </Button>

          {/* 3D Mode Toggle for Sorting & Array Algorithms */}
          {(currentAlgo.category === 'sorting' || currentStep.array) && (
            <Button
              variant={is3DMode ? 'contained' : 'outlined'}
              color={is3DMode ? 'info' : 'inherit'}
              startIcon={<ViewInArRoundedIcon />}
              onClick={() => setIs3DMode(!is3DMode)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {is3DMode ? '2D 뷰 전환' : '3D 입체 뷰'}
            </Button>
          )}

          {/* Custom Data Button */}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<TuneRoundedIcon />}
            onClick={() => setIsInputModalOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            데이터 변경
          </Button>
        </Box>

        {/* Category Filter Chips */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            pb: { xs: 0.5, md: 0 },
          }}
        >
          <Button
            size="small"
            variant={selectedCategoryFilter === 'all' ? 'contained' : 'text'}
            color="primary"
            onClick={() => setSelectedCategoryFilter('all')}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            전체 (32)
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="small"
              variant={selectedCategoryFilter === cat.id ? 'contained' : 'text'}
              color={selectedCategoryFilter === cat.id ? 'primary' : 'inherit'}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <Box component="span" sx={{ mr: 0.5 }}>
                {cat.icon}
              </Box>
              {cat.label.split(' ')[0]}
            </Button>
          ))}
        </Box>
      </Card>

      {/* 2. Main Content Grid: Left (Visualizer Canvas + Controls) / Right (Code Viewer + Info Tabs) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.45fr 1fr' },
          gap: 1.5,
          alignItems: 'stretch',
          flex: '1 1 auto',
          minHeight: 0,
        }}
      >
        {/* Left Column: Canvas & Player Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0 }}>
          {/* Visualizer Canvas Area */}
          <Card
            sx={{
              flex: '1 1 auto',
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {renderCanvas()}
          </Card>

          {/* Player Controls */}
          <PlayerControls />
        </Box>

        {/* Right Column: Multi-Language Code Viewer & Detail Tabs */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 2,
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Sub Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
            <Tabs
              value={activeRightTab}
              onChange={(_, val) => setActiveRightTab(val)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                value="code"
                label="동기화 코드"
                icon={<CodeRoundedIcon fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 44, fontWeight: 700, fontSize: '0.8rem' }}
              />
              <Tab
                value="variables"
                label="변수 추적기"
                icon={<VisibilityRoundedIcon fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 44, fontWeight: 700, fontSize: '0.8rem' }}
              />
              <Tab
                value="complexity"
                label="복잡도 분석"
                icon={<AssessmentRoundedIcon fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 44, fontWeight: 700, fontSize: '0.8rem' }}
              />
              <Tab
                value="guide"
                label="코딩테스트 팁"
                icon={<HelpOutlineRoundedIcon fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 44, fontWeight: 700, fontSize: '0.8rem' }}
              />
            </Tabs>
          </Box>

          {/* Sub Tab Content Panels */}
          <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
            {activeRightTab === 'code' && (
              <CodeViewer
                code={currentAlgo.code}
                activeLine={currentStep.line}
                algoId={currentAlgo.id}
                language={currentAlgo.codeLanguage}
              />
            )}
            {activeRightTab === 'variables' && <VariableWatcher step={currentStep} />}
            {activeRightTab === 'complexity' && <ComplexityCard algo={currentAlgo} />}
            {activeRightTab === 'guide' && <CodingTestGuideCard algo={currentAlgo} />}
          </Box>
        </Card>
      </Box>

      {/* 3. Algorithm Selection Modal */}
      <Dialog
        open={isAlgoListModalOpen}
        onClose={() => setIsAlgoListModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 2.5 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            ⚡ 알고리즘 카탈로그 (전체 32종)
          </Typography>
          <IconButton onClick={() => setIsAlgoListModalOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 1.5,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {filteredAlgos.map((algo) => {
            const isSelected = algo.id === currentAlgoId;
            return (
              <Card
                key={algo.id}
                onClick={() => handleSelectAlgo(algo.id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: 2,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="h5">{algo.icon}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      fontWeight: 700,
                    }}
                  >
                    {algo.tag}
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}
                >
                  {algo.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 1, fontFamily: 'monospace' }}
                >
                  {algo.englishName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {algo.shortDescription}
                </Typography>
              </Card>
            );
          })}
        </Box>
      </Dialog>

      {/* 4. Custom Input Modal */}
      <CustomInputModal isOpen={isInputModalOpen} onClose={() => setIsInputModalOpen(false)} />
    </Box>
  );
}
