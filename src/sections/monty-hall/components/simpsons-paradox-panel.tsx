'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { SIMPSONS_DATASETS } from '../utils/monty-math';

// ----------------------------------------------------------------------

export function SimpsonsParadoxPanel() {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('kidney-stones');

  const dataset = SIMPSONS_DATASETS.find((d) => d.id === selectedDatasetId) || SIMPSONS_DATASETS[0];

  // Calculate percentages
  const g1RateA = (dataset.g1TreatmentSuccess / dataset.g1TreatmentTotal) * 100;
  const g1RateB = (dataset.g1ControlSuccess / dataset.g1ControlTotal) * 100;

  const g2RateA = (dataset.g2TreatmentSuccess / dataset.g2TreatmentTotal) * 100;
  const g2RateB = (dataset.g2ControlSuccess / dataset.g2ControlTotal) * 100;

  const totalSuccessA = dataset.g1TreatmentSuccess + dataset.g2TreatmentSuccess;
  const totalCountA = dataset.g1TreatmentTotal + dataset.g2TreatmentTotal;
  const totalRateA = (totalSuccessA / totalCountA) * 100;

  const totalSuccessB = dataset.g1ControlSuccess + dataset.g2ControlSuccess;
  const totalCountB = dataset.g1ControlTotal + dataset.g2ControlTotal;
  const totalRateB = (totalSuccessB / totalCountB) * 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top Selector */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              심슨의 역설 (Simpson&apos;s Paradox) 시각화 분석
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              각 부분 그룹에서는 A가 우세하지만, 전체 데이터를 합치면 정반대로 B가 우세해지는 통계적
              착시
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="simpson-dataset-label">사례 연구 데이터셋 선택</InputLabel>
            <Select
              labelId="simpson-dataset-label"
              value={selectedDatasetId}
              label="사례 연구 데이터셋 선택"
              onChange={(e) => setSelectedDatasetId(e.target.value)}
            >
              {SIMPSONS_DATASETS.map((ds) => (
                <MenuItem key={ds.id} value={ds.id}>
                  {ds.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Main Data Breakdown Table */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          {dataset.title} 데이터 분석표
        </Typography>

        <Table size="small" sx={{ mb: 2.5 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>구분</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {dataset.treatmentName}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                {dataset.controlName}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>
                승자 판정
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Subgroup 1 */}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>① {dataset.group1Name}</TableCell>
              <TableCell
                align="center"
                sx={{ bgcolor: g1RateA > g1RateB ? 'success.lighter' : 'inherit' }}
              >
                <b>{g1RateA.toFixed(1)}%</b> ({dataset.g1TreatmentSuccess}/
                {dataset.g1TreatmentTotal})
              </TableCell>
              <TableCell
                align="center"
                sx={{ bgcolor: g1RateB > g1RateA ? 'success.lighter' : 'inherit' }}
              >
                <b>{g1RateB.toFixed(1)}%</b> ({dataset.g1ControlSuccess}/{dataset.g1ControlTotal})
              </TableCell>
              <TableCell align="center">
                <Chip
                  size="small"
                  label={
                    g1RateA > g1RateB ? `${dataset.treatmentName} 승` : `${dataset.controlName} 승`
                  }
                  color="success"
                />
              </TableCell>
            </TableRow>

            {/* Subgroup 2 */}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>② {dataset.group2Name}</TableCell>
              <TableCell
                align="center"
                sx={{ bgcolor: g2RateA > g2RateB ? 'success.lighter' : 'inherit' }}
              >
                <b>{g2RateA.toFixed(1)}%</b> ({dataset.g2TreatmentSuccess}/
                {dataset.g2TreatmentTotal})
              </TableCell>
              <TableCell
                align="center"
                sx={{ bgcolor: g2RateB > g2RateA ? 'success.lighter' : 'inherit' }}
              >
                <b>{g2RateB.toFixed(1)}%</b> ({dataset.g2ControlSuccess}/{dataset.g2ControlTotal})
              </TableCell>
              <TableCell align="center">
                <Chip
                  size="small"
                  label={
                    g2RateA > g2RateB ? `${dataset.treatmentName} 승` : `${dataset.controlName} 승`
                  }
                  color="success"
                />
              </TableCell>
            </TableRow>

            {/* Total Aggregated (The Paradox!) */}
            <TableRow
              sx={{ borderTop: 2, borderColor: 'primary.main', bgcolor: 'warning.lighter' }}
            >
              <TableCell sx={{ fontWeight: 900, color: 'warning.darker' }}>
                ⚡ 전체 합산 (Total Aggregated)
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 900,
                  color: totalRateA > totalRateB ? 'success.dark' : 'error.dark',
                }}
              >
                {totalRateA.toFixed(1)}% ({totalSuccessA}/{totalCountA})
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 900,
                  color: totalRateB > totalRateA ? 'success.dark' : 'error.dark',
                }}
              >
                {totalRateB.toFixed(1)}% ({totalSuccessB}/{totalCountB})
              </TableCell>
              <TableCell align="center">
                <Chip
                  size="small"
                  label={
                    totalRateA > totalRateB
                      ? `${dataset.treatmentName} 승`
                      : `${dataset.controlName} 역전승!`
                  }
                  color="warning"
                  sx={{ fontWeight: 800 }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'error.main' }}>
            🚨 역설의 원인: 교란 변수(Confounding Variable)와 가중치의 마법
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {dataset.description}
          </Typography>
        </Paper>
      </Card>
    </Box>
  );
}
