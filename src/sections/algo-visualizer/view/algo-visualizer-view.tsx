'use client';

import '../styles.css';

import React, { Suspense, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { ThemeSelector } from 'src/components/theme-selector';

import { CompareTab } from '../components/tabs/CompareTab';
import { CatalogTab } from '../components/tabs/CatalogTab';
import { type AlgorithmId } from '../lib/algorithms/types';
import { useVisualizerStore } from '../store/visualizerStore';
import { ChallengeTab } from '../components/tabs/ChallengeTab';
import { VisualizerTab } from '../components/tabs/VisualizerTab';
import { PlaygroundTab } from '../components/tabs/PlaygroundTab';
import { DataStructuresTab } from '../components/tabs/DataStructuresTab';

// ----------------------------------------------------------------------

export type VisualizerMainTab =
  | 'visualizer'
  | 'dataStructures'
  | 'compare'
  | 'challenge'
  | 'playground'
  | 'catalog';

interface AlgoVisualizerViewProps {
  defaultTab?: VisualizerMainTab;
}

function AlgoVisualizerMain({ defaultTab = 'visualizer' }: AlgoVisualizerViewProps) {
  const router = useRouter();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<VisualizerMainTab>(defaultTab);
  const [selectedAlgoId, setSelectedAlgoId] = useState<AlgorithmId | undefined>(undefined);
  const { themeId, setThemeId } = useVisualizerStore();

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setCurrentTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (_: React.SyntheticEvent, newTab: VisualizerMainTab) => {
    setCurrentTab(newTab);
    const targetPath = paths.algo[newTab];
    if (targetPath) {
      router.push(targetPath);
    }
  };

  const handleNavigateToAlgo = (algoId: string) => {
    setSelectedAlgoId(algoId as AlgorithmId);
    setCurrentTab('visualizer');
    router.push(paths.algo.visualizer);
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent className="algo-studio-container">
      {/* 1. Header */}
      <Box
        sx={{
          mb: 1,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <SchemaRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            인터랙티브 알고리즘 & 자료구조 스튜디오 (Algorithm Visualizer)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            32종 알고리즘과 15종 핵심 자료구조의 동작 원리를 실시간 단계별(Step) 애니메이션, 다국어
            코드 뷰어, 1:1 비교 및 CS 챌린지로 체화합니다.
          </Typography>
        </Box>

        <ThemeSelector
          currentThemeId={themeId}
          onThemeChange={setThemeId}
          size="small"
          height={34}
          minWidth={150}
        />
      </Box>

      {/* 2. Top Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5, flexShrink: 0 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="visualizer"
            label="1. 알고리즘 시각화 랩"
            icon={<BarChartRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="dataStructures"
            label="2. 자료구조 도감 & 실습실"
            icon={<StorageRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="compare"
            label="3. 1:1 알고리즘 비교"
            icon={<CompareArrowsRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="challenge"
            label="4. CS 챌린지 모드"
            icon={<SportsEsportsRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="playground"
            label="5. 커스텀 코드 샌드박스"
            icon={<TerminalRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="catalog"
            label="6. Big-O 마스터 & 카탈로그"
            icon={<TableChartRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* 3. Main Content Panes */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
        {currentTab === 'visualizer' && <VisualizerTab initialAlgoId={selectedAlgoId} />}
        {currentTab === 'dataStructures' && (
          <DataStructuresTab onNavigateToAlgo={handleNavigateToAlgo} />
        )}
        {currentTab === 'compare' && <CompareTab />}
        {currentTab === 'challenge' && <ChallengeTab />}
        {currentTab === 'playground' && <PlaygroundTab />}
        {currentTab === 'catalog' && <CatalogTab onSelectAlgo={handleNavigateToAlgo} />}
      </Box>
    </DashboardContent>
  );
}

export function AlgoVisualizerView({ defaultTab }: AlgoVisualizerViewProps) {
  return (
    <Suspense
      fallback={
        <DashboardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
          >
            <CircularProgress size={36} />
          </Box>
        </DashboardContent>
      }
    >
      <AlgoVisualizerMain defaultTab={defaultTab} />
    </Suspense>
  );
}
