'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import type { TruthTableRow } from '../types';

// ----------------------------------------------------------------------

interface TruthTableViewProps {
  rows: TruthTableRow[];
}

export function TruthTableView({ rows }: TruthTableViewProps) {
  if (rows.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          회로에 스위치(입력)와 LED(출력)가 모두 연결되면 자동으로 모든 경우의 수에 대한
          진리표(Truth Table)가 생성됩니다.
        </Typography>
      </Card>
    );
  }

  const inputKeys = Object.keys(rows[0]?.inputs || {});
  const outputKeys = Object.keys(rows[0]?.outputs || {});

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        회로 실시간 진리표 (Truth Table)
      </Typography>

      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'background.neutral' }}>
            <TableRow>
              {inputKeys.map((k) => (
                <TableCell key={k} align="center" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  입력: {k}
                </TableCell>
              ))}
              {outputKeys.map((k) => (
                <TableCell key={k} align="center" sx={{ fontWeight: 800, color: 'error.main' }}>
                  출력: {k}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                {inputKeys.map((k) => {
                  const val = row.inputs[k];
                  return (
                    <TableCell
                      key={k}
                      align="center"
                      sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                    >
                      <Box
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: 0.5,
                          bgcolor: val ? 'success.lighter' : 'action.selected',
                          color: val ? 'success.dark' : 'text.secondary',
                        }}
                      >
                        {val ? '1 (HIGH)' : '0 (LOW)'}
                      </Box>
                    </TableCell>
                  );
                })}
                {outputKeys.map((k) => {
                  const val = row.outputs[k];
                  return (
                    <TableCell
                      key={k}
                      align="center"
                      sx={{ fontWeight: 800, fontFamily: 'monospace' }}
                    >
                      <Box
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: 0.5,
                          bgcolor: val ? 'error.lighter' : 'action.selected',
                          color: val ? 'error.dark' : 'text.secondary',
                        }}
                      >
                        {val ? '1 (HIGH)' : '0 (LOW)'}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
