'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid4x4RoundedIcon from '@mui/icons-material/Grid4x4Rounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import BiotechRoundedIcon from '@mui/icons-material/BiotechRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SportsBaseballRoundedIcon from '@mui/icons-material/SportsBaseballRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhysicsCanvas } from '../components/physics-canvas';
import { AtomBuilderPanel } from '../components/atom-builder-panel';
import { MissionModePanel } from '../components/mission-mode-panel';
import { MoleculeCodexPanel } from '../components/molecule-codex-panel';
import { PeriodicTablePanel } from '../components/periodic-table-panel';
import { MoleculeBuilderPanel } from '../components/molecule-builder-panel';
import { ChemicalCalculatorPanel } from '../components/chemical-calculator-panel';

// ----------------------------------------------------------------------

type TabKey = 'physics' | 'builder' | 'atom' | 'table' | 'codex' | 'missions' | 'calculator';

export function PhysicsSandboxView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabKey>('builder');
  const [atomBuilderInitialZ, setAtomBuilderInitialZ] = useState<number>(6);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

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

  const handleNavigateToAtomBuilder = (atomicNumber: number) => {
    setAtomBuilderInitialZ(atomicNumber);
    setCurrentTab('atom');
  };

  const handleNavigateToMoleculeBuilder = (_symbol?: string) => {
    setCurrentTab('builder');
  };

  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box sx={{ mb: 2.5, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <ScienceRoundedIcon sx={{ fontSize: 34, color: 'success.main' }} />
          2D 물리 & 과학 샌드박스 (Science & Physics Lab)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 900 }}>
          3D 분자 조립과 원소 3D 껍질 시뮬레이션, 118개 원소 주기율표 백과사전, PubChem 연동 분자
          도감, 챌린지 미션, 화학 반응식 밸런서 및 2D 강체 & 천체 중력 시뮬레이터를 실시간으로
          탐구하세요.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs (7 Science & Physics Labs) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val: TabKey) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: '13px',
              minHeight: 48,
            },
          }}
        >
          <Tab
            value="builder"
            label="1. 3D 분자 조립 (Builder)"
            icon={<BiotechRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="atom"
            label="2. 원소 3D 빌더 (Atom)"
            icon={<ScienceRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="table"
            label="3. 118개 주기율표 (Table)"
            icon={<Grid4x4RoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="codex"
            label="4. 분자 도감 (Codex)"
            icon={<MenuBookRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="missions"
            label="5. 챌린지 미션 (Missions)"
            icon={<EmojiEventsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="calculator"
            label="6. 반응식 & 몰 질량 (Calculator)"
            icon={<CalculateRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="physics"
            label="7. 2D & 천체 물리 (Physics)"
            icon={<SportsBaseballRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'builder' && (
          <MoleculeBuilderPanel onNavigateToCodex={() => setCurrentTab('codex')} />
        )}

        {currentTab === 'atom' && (
          <AtomBuilderPanel
            initialAtomicNumber={atomBuilderInitialZ}
            onNavigateToMoleculeBuilder={handleNavigateToMoleculeBuilder}
          />
        )}

        {currentTab === 'table' && (
          <PeriodicTablePanel
            onNavigateToAtomBuilder={handleNavigateToAtomBuilder}
            onNavigateToMoleculeBuilder={handleNavigateToMoleculeBuilder}
          />
        )}

        {currentTab === 'codex' && (
          <MoleculeCodexPanel
            onNavigateToBuilderWithPreset={(_id, _custom) => setCurrentTab('builder')}
          />
        )}

        {currentTab === 'missions' && (
          <MissionModePanel onStartMissionInSandbox={(_id) => setCurrentTab('builder')} />
        )}

        {currentTab === 'calculator' && <ChemicalCalculatorPanel />}

        {currentTab === 'physics' && <PhysicsCanvas />}
      </Box>
    </DashboardContent>
  );
}
