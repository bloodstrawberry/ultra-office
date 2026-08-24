'use client';

import type { SqlDataset, SqlTableInfo } from './types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import ListItem from '@mui/material/ListItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface SchemaBrowserProps {
  dataset: SqlDataset;
  onInsertQuery?: (query: string) => void;
}

export function SchemaBrowser({ dataset, onInsertQuery }: SchemaBrowserProps) {
  const [previewTable, setPreviewTable] = useState<SqlTableInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleOpenPreview = (table: SqlTableInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTable(table);
  };

  const handleClosePreview = () => {
    setPreviewTable(null);
  };

  const handleInsertSelect = (tableName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onInsertQuery?.(`SELECT *\nFROM ${tableName}\nLIMIT 10;`);
  };

  const filteredTables = dataset.tables.filter((table) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const tableMatch =
      table.name.toLowerCase().includes(q) || table.description?.toLowerCase().includes(q);
    const colMatch = table.columns.some(
      (col) => col.name.toLowerCase().includes(q) || col.type.toLowerCase().includes(q)
    );
    return tableMatch || colMatch;
  });

  return (
    <Card
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          pb: 2,
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <TableChartRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.925rem' }}>
              테이블 스키마
            </Typography>
            <Chip
              size="small"
              label={`${dataset.tables.length}개 테이블`}
              variant="outlined"
              sx={{ fontSize: 11.5, fontWeight: 700, height: 22 }}
            />
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="테이블 또는 컬럼명 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { height: 36, fontSize: 13, bgcolor: 'background.paper', borderRadius: 1.5 },
            },
          }}
        />
      </Box>

      {/* Tables List Accordion */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ px: 2.5, pt: 2, pb: 4 }}>
          {filteredTables.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                검색된 테이블 또는 컬럼이 없습니다.
              </Typography>
            </Box>
          ) : (
            filteredTables.map((table) => (
              <Accordion
                key={table.name}
                defaultExpanded={filteredTables.length <= 3}
                disableGutters
                sx={{
                  mb: 1.5,
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  borderRadius: '10px !important',
                  boxShadow: 'none',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  '&:before': { display: 'none' },
                  transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
                  '&:hover': {
                    borderColor: 'primary.light',
                  },
                  '&.Mui-expanded': {
                    boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 4px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <AccordionSummary
                  sx={{
                    pl: 2.5,
                    pr: 2.5,
                    minHeight: 42,
                    '&.Mui-expanded': {
                      minHeight: 42,
                      bgcolor: 'background.neutral',
                      borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
                    },
                    '& .MuiAccordionSummary-content': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      my: 0,
                      '&.Mui-expanded': {
                        my: 0,
                      },
                    },
                    '& .expand-icon': {
                      transition: (theme) => theme.transitions.create('transform'),
                    },
                    '&.Mui-expanded .expand-icon': {
                      transform: 'rotate(180deg)',
                    },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      display: 'none',
                    },
                  }}
                >
                  {/* Left Table Info */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      minWidth: 0,
                      pl: 1.25,
                    }}
                  >
                    <StorageRoundedIcon
                      sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                      }}
                    >
                      {table.name}
                    </Typography>
                    <Chip
                      label={`${table.initialData.length}행`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: 'action.hover',
                        color: 'text.secondary',
                        borderRadius: 0.75,
                      }}
                    />
                  </Box>

                  {/* Right Action Buttons Group (눈 + 플러스 + 펼침 — 균등 간격) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto', mr: 1 }}>
                    <Tooltip title="데이터 미리보기">
                      <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => handleOpenPreview(table, e)}
                        sx={{
                          p: 0.5,
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
                        }}
                      >
                        <VisibilityRoundedIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                    {onInsertQuery && (
                      <Tooltip title="SELECT 쿼리 삽입">
                        <IconButton
                          component="span"
                          size="small"
                          onClick={(e) => handleInsertSelect(table.name, e)}
                          sx={{
                            p: 0.5,
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <AddCircleOutlineRoundedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <ExpandMoreRoundedIcon
                      className="expand-icon"
                      sx={{
                        fontSize: 19,
                        color: 'text.secondary',
                      }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    p: 2,
                    bgcolor: 'background.neutral',
                  }}
                >
                  {table.description && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 1.25, px: 0.5 }}
                    >
                      {table.description}
                    </Typography>
                  )}
                  <List
                    dense
                    sx={{
                      p: 0,
                      bgcolor: 'background.paper',
                      borderRadius: 1.25,
                      border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                      overflow: 'hidden',
                    }}
                  >
                    {table.columns.map((col) => (
                      <ListItem
                        key={col.name}
                        sx={{
                          py: 0.6,
                          px: 1.5,
                          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
                          '&:last-child': { borderBottom: 'none' },
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {col.isPrimary ? (
                            <Tooltip title="Primary Key (기본키)">
                              <KeyRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                            </Tooltip>
                          ) : (
                            <Box sx={{ width: 14, height: 14 }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: 12.5,
                              fontWeight: col.isPrimary ? 700 : 500,
                              color: col.isPrimary ? 'warning.darker' : 'text.primary',
                            }}
                          >
                            {col.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            label={col.type}
                            sx={{
                              height: 20,
                              fontSize: 10.5,
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              bgcolor: 'action.hover',
                              color: 'text.secondary',
                              borderRadius: 0.5,
                            }}
                          />
                          {col.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.disabled',
                                fontSize: 11,
                                display: { xs: 'none', sm: 'inline' },
                                maxWidth: 140,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {col.description}
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          )}

          {/* 하단 여백 강제 확보 (스크롤 잘림 방지) */}
          {filteredTables.length > 0 && <Box sx={{ height: 12, flexShrink: 0 }} />}
        </Box>
      </Scrollbar>

      {/* Table Data Preview Dialog (PaperProps 대신 sx 사용 규칙 준수) */}
      <Dialog
        open={Boolean(previewTable)}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableChartRoundedIcon color="primary" />
            <Typography variant="h6" component="span" sx={{ fontFamily: 'monospace' }}>
              {previewTable?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (상위 {previewTable?.initialData.length}개 샘플 데이터)
            </Typography>
          </Box>
          <Button onClick={handleClosePreview} color="inherit" size="small">
            닫기
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {previewTable && (
            <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 'none' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {previewTable.columns.map((col) => (
                      <TableCell
                        key={col.name}
                        sx={{
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          bgcolor: 'background.neutral',
                        }}
                      >
                        {col.name}
                        {col.isPrimary && ' (PK)'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewTable.initialData.map((row, idx) => (
                    <TableRow key={idx} hover>
                      {previewTable.columns.map((col) => {
                        const val = row[col.name];
                        return (
                          <TableCell key={col.name} sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                            {val === null || val === undefined ? 'NULL' : String(val)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
