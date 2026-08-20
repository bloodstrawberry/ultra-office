'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import type { CircuitGate, CircuitWire, GateType } from '../types';
import {
  createGate,
  simulateCircuit,
  generateTruthTable,
  getPresetCircuits,
} from '../utils/circuit-engine';
import { CircuitCanvas } from '../components/circuit-canvas';
import { TruthTableView } from '../components/truth-table-view';

// ----------------------------------------------------------------------

export function LogicLabView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [gates, setGates] = useState<CircuitGate[]>([]);
  const [wires, setWires] = useState<CircuitWire[]>([]);

  useEffect(() => {
    setHasLoaded(true);
    // Load Half Adder preset on initial load
    const preset = getPresetCircuits('half_adder');
    setGates(preset.gates);
    setWires(preset.wires);
  }, []);

  // Continuous real-time simulation
  const simulatedGates = useMemo(() => {
    return simulateCircuit(gates, wires);
  }, [gates, wires]);

  // Compute truth table
  const truthTableRows = useMemo(() => {
    return generateTruthTable(gates, wires);
  }, [gates, wires]);

  const handleToggleSwitch = (gateId: string) => {
    setGates((prev) => prev.map((g) => (g.id === gateId ? { ...g, state: !g.state } : g)));
  };

  const handleAddGate = (type: GateType) => {
    const newGate = createGate(type, 150 + Math.random() * 200, 150 + Math.random() * 150);
    setGates((prev) => [...prev, newGate]);
    toast.info(`${type} 게이트가 캔버스에 추가되었습니다.`);
  };

  const handleAddWire = (wire: CircuitWire) => {
    setWires((prev) => [...prev, wire]);
  };

  const handleDeleteGate = (gateId: string) => {
    setGates((prev) => prev.filter((g) => g.id !== gateId));
    setWires((prev) => prev.filter((w) => w.fromGateId !== gateId && w.toGateId !== gateId));
  };

  const handleDeleteWire = (wireId: string) => {
    setWires((prev) => prev.filter((w) => w.id !== wireId));
    toast.info('전선이 제거되었습니다.');
  };

  const handleMoveGate = (gateId: string, x: number, y: number) => {
    setGates((prev) => prev.map((g) => (g.id === gateId ? { ...g, x, y } : g)));
  };

  const handleLoadPreset = (presetName: 'half_adder' | 'sr_latch') => {
    const preset = getPresetCircuits(presetName);
    setGates(preset.gates);
    setWires(preset.wires);
    toast.success(
      `${presetName === 'half_adder' ? '반가산기(Half Adder)' : 'SR 래치(메모리)'} 회로가 로드되었습니다.`
    );
  };

  const handleClear = () => {
    setGates([]);
    setWires([]);
    toast.info('캔버스가 초기화되었습니다.');
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
    <DashboardContent>
      {/* 1. Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <MemoryRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            디지털 논리회로 & 컴퓨터 구조 랩 (Logic Gate Lab)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            논리 게이트(AND/OR/NOT/XOR)와 전선을 연결하여 CPU 가산기 및 메모리 회로를 시뮬레이션하고
            진리표(Truth Table)를 자동 계산합니다.
          </Typography>
        </Box>

        {/* Preset Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => handleLoadPreset('half_adder')}
          >
            반가산기 (Half Adder)
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => handleLoadPreset('sr_latch')}
          >
            SR 래치 (1비트 메모리)
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteSweepRoundedIcon />}
            onClick={handleClear}
          >
            초기화
          </Button>
        </Box>
      </Box>

      {/* 2. Component Add Toolbar */}
      <Card
        sx={{
          p: 1.5,
          mb: 2,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 1 }}>
          부품 추가:
        </Typography>
        {(['SWITCH', 'LED', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'] as GateType[]).map(
          (type) => (
            <Button
              key={type}
              size="small"
              variant="contained"
              color={type === 'SWITCH' ? 'success' : type === 'LED' ? 'error' : 'primary'}
              startIcon={<AddRoundedIcon />}
              onClick={() => handleAddGate(type)}
              sx={{ fontWeight: 800 }}
            >
              {type}
            </Button>
          )
        )}
      </Card>

      {/* 3. Main Workspace */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          pb: 4,
        }}
      >
        {/* Interactive Circuit Canvas */}
        <CircuitCanvas
          gates={simulatedGates}
          wires={wires}
          onToggleSwitch={handleToggleSwitch}
          onAddWire={handleAddWire}
          onDeleteGate={handleDeleteGate}
          onDeleteWire={handleDeleteWire}
          onMoveGate={handleMoveGate}
        />

        {/* Truth Table */}
        <TruthTableView rows={truthTableRows} />
      </Box>
    </DashboardContent>
  );
}
