'use client';

import type { MatlabVariable } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';

import { getThemeById, DEFAULT_THEME_ID } from 'src/sections/code-runner/core/editor-themes';

// ----------------------------------------------------------------------

interface MatlabVariableEditorDialogProps {
  variable: MatlabVariable | null;
  open: boolean;
  onClose: () => void;
  onSaveValue: (varName: string, newValue: any) => void;
  themeId?: string;
}

export function MatlabVariableEditorDialog({
  variable,
  open,
  onClose,
  onSaveValue,
  themeId = DEFAULT_THEME_ID,
}: MatlabVariableEditorDialogProps) {
  const activeTheme = getThemeById(themeId);
  const [gridData, setGridData] = useState<any[][]>([]);
  const [isEditing, setIsEditing] = useState<{ r: number; c: number } | null>(null);
  const [cellInput, setCellInput] = useState<string>('');

  useEffect(() => {
    if (!variable) {
      setGridData([]);
      return;
    }

    const val = variable.value;
    if (Array.isArray(val)) {
      if (val.length === 0) {
        setGridData([]);
      } else if (!Array.isArray(val[0])) {
        // 1D row vector -> convert to 1 x N matrix for grid view
        setGridData([val]);
      } else {
        setGridData(val);
      }
    } else {
      // Scalar or single object
      setGridData([[val]]);
    }
  }, [variable]);

  if (!variable) return null;

  const rows = gridData.length;
  const cols = rows > 0 ? (Array.isArray(gridData[0]) ? gridData[0].length : 1) : 0;

  const handleCellClick = (r: number, c: number) => {
    setIsEditing({ r, c });
    const currentVal = gridData[r]?.[c];
    setCellInput(currentVal !== undefined ? String(currentVal) : '');
  };

  const handleCellSave = () => {
    if (!isEditing) return;
    const { r, c } = isEditing;
    const num = Number(cellInput);
    const finalVal = isNaN(num) ? cellInput : num;

    const newGrid = gridData.map((rowArr, ri) =>
      ri === r ? rowArr.map((cell, ci) => (ci === c ? finalVal : cell)) : [...rowArr]
    );

    setGridData(newGrid);
    setIsEditing(null);

    // If original was 1D array, save as 1D array
    if (Array.isArray(variable.value) && !Array.isArray(variable.value[0])) {
      onSaveValue(variable.name, newGrid[0]);
    } else if (typeof variable.value === 'number') {
      onSaveValue(variable.name, finalVal);
    } else {
      onSaveValue(variable.name, newGrid);
    }
  };

  const handleExportCsv = () => {
    const csvContent = gridData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${variable.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: activeTheme.uiColors.surface,
          color: activeTheme.uiColors.text,
          border: `1px solid ${activeTheme.uiColors.border}`,
          borderRadius: 1.5,
          height: 600,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: activeTheme.uiColors.card,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          px: 2,
          py: 1.25,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableChartRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>
            Variable Editor - <code>{variable.name}</code> ({variable.typeName}, {variable.sizeStr})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={handleExportCsv}
            sx={{
              fontSize: '11px',
              py: 0.25,
              px: 1,
              borderColor: activeTheme.uiColors.border,
              color: activeTheme.uiColors.textMuted,
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            CSV 저장
          </Button>
          <IconButton size="small" onClick={onClose} sx={{ color: activeTheme.uiColors.textMuted }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Grid Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1, bgcolor: activeTheme.uiColors.bg }}>
        {rows === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: activeTheme.uiColors.textMuted,
              fontSize: '12px',
            }}
          >
            빈 데이터입니다.
          </Box>
        ) : (
          <Table
            size="small"
            stickyHeader
            sx={{
              borderCollapse: 'collapse',
              '& .MuiTableCell-root': {
                border: `1px solid ${activeTheme.uiColors.border}`,
                py: 0.5,
                px: 1,
                fontFamily: 'monospace',
                fontSize: '11px',
                textAlign: 'right',
                color: activeTheme.uiColors.text,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: activeTheme.uiColors.card,
                    color: activeTheme.uiColors.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    width: 40,
                    textAlign: 'center',
                    borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                  }}
                >
                  #
                </TableCell>
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <TableCell
                    key={cIdx}
                    sx={{
                      bgcolor: activeTheme.uiColors.card,
                      color: activeTheme.uiColors.textMuted,
                      fontSize: '10px',
                      fontWeight: 700,
                      minWidth: 70,
                      textAlign: 'center',
                      borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                    }}
                  >
                    col {cIdx + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {gridData.map((row, rIdx) => (
                <TableRow key={rIdx}>
                  <TableCell
                    sx={{
                      bgcolor: activeTheme.uiColors.card,
                      color: activeTheme.uiColors.textMuted,
                      fontSize: '10px',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    {rIdx + 1}
                  </TableCell>
                  {(Array.isArray(row) ? row : [row]).map((cell, cIdx) => {
                    const isCellEditing = isEditing?.r === rIdx && isEditing?.c === cIdx;
                    return (
                      <TableCell
                        key={cIdx}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isCellEditing ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                          '&:hover': { bgcolor: 'rgba(128, 128, 128, 0.08)' },
                        }}
                      >
                        {isCellEditing ? (
                          <Box
                            component="input"
                            autoFocus
                            type="text"
                            value={cellInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setCellInput(e.target.value)
                            }
                            onBlur={handleCellSave}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter') handleCellSave();
                              if (e.key === 'Escape') setIsEditing(null);
                            }}
                            sx={{
                              width: '100%',
                              bgcolor: activeTheme.uiColors.card,
                              color: activeTheme.uiColors.text,
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderRadius: 0.5,
                              px: 0.5,
                              py: 0.2,
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              textAlign: 'right',
                              outline: 'none',
                            }}
                          />
                        ) : typeof cell === 'number' ? (
                          Number.isInteger(cell) ? (
                            cell
                          ) : (
                            cell.toFixed(4)
                          )
                        ) : (
                          String(cell)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#191d26',
          borderTop: '1px solid #282f3d',
          px: 2,
          py: 0.75,
          fontSize: '11px',
          color: '#94a3b8',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <span>차원: {variable.sizeStr}</span>
          {variable.min !== null && variable.min !== undefined && (
            <span>
              Min: {typeof variable.min === 'number' ? variable.min.toFixed(4) : variable.min}
            </span>
          )}
          {variable.max !== null && variable.max !== undefined && (
            <span>
              Max: {typeof variable.max === 'number' ? variable.max.toFixed(4) : variable.max}
            </span>
          )}
        </Box>
        <Typography sx={{ fontSize: '10px', color: '#64748b' }}>
          셀을 클릭하여 값을 직접 편집하고 Enter를 누르세요.
        </Typography>
      </Box>
    </Dialog>
  );
}
