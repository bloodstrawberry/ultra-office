'use client';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import { exportTableToCsv } from '../utils/export-helpers';
import { createMathEvaluator, generateTableOfValues } from '../utils/math-eval';

// ----------------------------------------------------------------------

interface TableOfValuesProps {
  formula: string;
}

export function TableOfValues({ formula }: TableOfValuesProps) {
  const [start, setStart] = useState<number>(-5);
  const [end, setEnd] = useState<number>(5);
  const [step, setStep] = useState<number>(0.5);

  const evaluator = useMemo(() => createMathEvaluator(formula), [formula]);

  const rows = useMemo(
    () => generateTableOfValues(evaluator, start, end, step),
    [evaluator, start, end, step]
  );

  const handleDownloadCsv = () => {
    exportTableToCsv(rows, `table_values_${formula.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: (theme) => theme.shadows[2],
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <TableChartRoundedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            함수 값 테이블 (Table of Values)
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownloadRoundedIcon fontSize="small" />}
          onClick={handleDownloadCsv}
          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
        >
          CSV 내보내기 ({rows.length}개 행)
        </Button>
      </Box>

      {/* Control Inputs */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          label="시작 x"
          type="number"
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
          sx={{ width: 110 }}
        />
        <TextField
          size="small"
          label="종료 x"
          type="number"
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
          sx={{ width: 110 }}
        />
        <TextField
          size="small"
          label="간격 (Δx)"
          type="number"
          value={step}
          onChange={(e) => setStep(Math.max(0.01, Number(e.target.value)))}
          sx={{ width: 110 }}
        />
      </Box>

      {/* Scrollable Data Table */}
      <TableContainer
        sx={{
          maxHeight: 280,
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflowY: 'auto',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>x</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>f(x)</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                f&apos;(x) [1계 도함수]
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                f&apos;&apos;(x) [2계 도함수]
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.x} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.x}</TableCell>
                <TableCell
                  sx={{
                    fontFamily: 'monospace',
                    color: row.fx !== null && row.fx >= 0 ? 'primary.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {row.fx !== null ? row.fx : 'NaN'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {row.dfx !== null ? row.dfx : 'NaN'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {row.d2fx !== null ? row.d2fx : 'NaN'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
