'use client';

import type { MatlabVariable } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';

import { DEFAULT_THEME_ID, getThemeById } from 'src/sections/code-runner/core/editor-themes';

// ----------------------------------------------------------------------

interface MatlabWorkspaceProps {
  variables: Record<string, MatlabVariable>;
  selectedVarName: string | null;
  onSelectVariable: (name: string | null) => void;
  onOpenVariableEditor: (variable: MatlabVariable) => void;
  onQuickPlot: (varName: string, plotType: string) => void;
  onClearWorkspace: () => void;
  themeId?: string;
}

export function MatlabWorkspace({
  variables,
  selectedVarName,
  onSelectVariable,
  onOpenVariableEditor,
  onQuickPlot,
  onClearWorkspace,
  themeId = DEFAULT_THEME_ID,
}: MatlabWorkspaceProps) {
  const activeTheme = getThemeById(themeId);
  const [filterText, setFilterText] = useState('');

  const varList = Object.values(variables).filter((v) =>
    v.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: activeTheme.uiColors.surface,
        color: activeTheme.uiColors.text,
        borderRadius: 1,
        border: `1px solid ${activeTheme.uiColors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Workspace Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: activeTheme.uiColors.card,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          px: 1,
          minHeight: 34,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <StorageRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
            WORKSPACE ({varList.length})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {selectedVarName && (
            <Tooltip title="변수 데이터 테이블 열기">
              <IconButton
                size="small"
                onClick={() => {
                  const target = variables[selectedVarName];
                  if (target) onOpenVariableEditor(target);
                }}
                color="primary"
              >
                <TableChartRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="워크스페이스 초기화 (clear)">
            <IconButton
              size="small"
              onClick={onClearWorkspace}
              sx={{ color: activeTheme.uiColors.textMuted }}
            >
              <ClearRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filter / Search Bar */}
      <Box
        sx={{
          p: 0.75,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          bgcolor: activeTheme.uiColors.bg,
        }}
      >
        <Box
          component="input"
          type="text"
          placeholder="변수 필터..."
          value={filterText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
          sx={{
            width: '100%',
            bgcolor: activeTheme.uiColors.card,
            border: `1px solid ${activeTheme.uiColors.border}`,
            borderRadius: 0.75,
            px: 1,
            py: 0.25,
            fontSize: '11px',
            color: activeTheme.uiColors.text,
            outline: 'none',
            '&:focus': { borderColor: 'primary.main' },
          }}
        />
      </Box>

      {/* Variables Table */}
      <Box sx={{ flex: 1, width: '100%', overflowY: 'auto' }}>
        {varList.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: activeTheme.uiColors.textMuted,
              fontSize: '11px',
              fontStyle: 'italic',
              p: 2,
              textAlign: 'center',
            }}
          >
            정의된 변수가 없습니다.
          </Box>
        ) : (
          <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.4, px: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: activeTheme.uiColors.card,
                    color: activeTheme.uiColors.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: activeTheme.uiColors.card,
                    color: activeTheme.uiColors.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                  }}
                >
                  Value
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: activeTheme.uiColors.card,
                    color: activeTheme.uiColors.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                  }}
                >
                  Size
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: activeTheme.uiColors.card,
                    color: activeTheme.uiColors.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                  }}
                >
                  Class
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {varList.map((v) => {
                const isSelected = selectedVarName === v.name;
                return (
                  <TableRow
                    key={v.name}
                    hover
                    selected={isSelected}
                    onClick={() => onSelectVariable(isSelected ? null : v.name)}
                    onDoubleClick={() => onOpenVariableEditor(v)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(56, 189, 248, 0.12) !important' : 'inherit',
                      '&:hover': { bgcolor: 'rgba(128, 128, 128, 0.08) !important' },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: 'primary.main',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                      }}
                    >
                      {v.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: activeTheme.uiColors.text,
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                      }}
                    >
                      {v.preview || '[]'}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: activeTheme.uiColors.textMuted,
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                      }}
                    >
                      {v.sizeStr}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#10b981',
                        fontSize: '10px',
                        borderBottom: `1px solid ${activeTheme.uiColors.border}`,
                      }}
                    >
                      {v.typeName}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
