'use client';

import type { SqlDataset, SqlTableInfo } from './types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import ListItem from '@mui/material/ListItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
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

  return (
    <Card
      sx={{
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
          px: 2,
          py: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableChartRoundedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            테이블 스키마
          </Typography>
          <Chip
            size="small"
            label={`${dataset.tables.length}개`}
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Box>
      </Box>

      {/* Tables List Accordion */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 1 }}>
          {dataset.tables.map((table) => (
            <Accordion
              key={table.name}
              disableGutters
              sx={{
                mb: 1,
                border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{
                  px: 1.5,
                  minHeight: 48,
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 0.5,
                    mr: 1,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  >
                    {table.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    ({table.initialData.length}행)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="데이터 미리보기">
                    <IconButton size="small" onClick={(e) => handleOpenPreview(table, e)}>
                      <VisibilityRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {onInsertQuery && (
                    <Tooltip title="SELECT 쿼리 삽입">
                      <IconButton size="small" onClick={(e) => handleInsertSelect(table.name, e)}>
                        <AddCircleOutlineRoundedIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 1.5, pt: 0, bgcolor: 'background.neutral' }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                >
                  {table.description}
                </Typography>
                <List
                  dense
                  sx={{
                    p: 0,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  }}
                >
                  {table.columns.map((col) => (
                    <ListItem
                      key={col.name}
                      sx={{
                        py: 0.5,
                        px: 1.5,
                        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
                        '&:last-child': { borderBottom: 'none' },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        {col.isPrimary && (
                          <Tooltip title="Primary Key (기본키)">
                            <KeyRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                          </Tooltip>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: col.isPrimary ? 'bold' : 'normal',
                          }}
                        >
                          {col.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: 11, fontFamily: 'monospace' }}
                        >
                          {col.type}
                        </Typography>
                        {col.description && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.disabled',
                              fontSize: 11,
                              display: { xs: 'none', sm: 'inline' },
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
          ))}
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
