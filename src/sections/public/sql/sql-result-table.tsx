'use client';

import type { QueryResult } from './types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AlertTitle from '@mui/material/AlertTitle';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';

// ----------------------------------------------------------------------

interface SqlResultTableProps {
  result: QueryResult | null;
  title?: string;
  isVerification?: boolean;
}

export function SqlResultTable({
  result,
  title = '실행 결과',
  isVerification,
}: SqlResultTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <Card
        sx={{
          width: '100%',
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
          textAlign: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <TableChartRoundedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          실행된 쿼리 결과가 여기에 표시됩니다.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          SQL 에디터에서 쿼리를 작성한 후 <strong>실행 (Ctrl + Enter)</strong>을 눌러주세요.
        </Typography>
      </Card>
    );
  }

  if (result.error) {
    return (
      <Alert severity="error" sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
        <AlertTitle sx={{ fontWeight: 'bold' }}>SQL 실행 오류</AlertTitle>
        <Box sx={{ fontFamily: 'monospace', fontSize: 13, mt: 1, whiteSpace: 'pre-wrap' }}>
          {result.error}
        </Box>
      </Alert>
    );
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCopyJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadCsv = () => {
    if (!result.columns.length || !result.rows.length) return;
    const header = result.columns.join(',');
    const rows = result.rows.map((row) =>
      result.columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          const str = String(val);
          return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    );
    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sql_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedRows = result.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      {/* Table Header Controls */}
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
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Chip
            size="small"
            label={`${result.rowCount} Rows`}
            color={result.rowCount > 0 ? 'primary' : 'default'}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${result.executionTimeMs} ms`}
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? '복사 완료!' : 'JSON 클립보드 복사'}>
            <IconButton size="small" onClick={handleCopyJson}>
              {copied ? (
                <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
              ) : (
                <ContentCopyRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="CSV 다운로드">
            <IconButton size="small" onClick={handleDownloadCsv} disabled={result.rowCount === 0}>
              <FileDownloadRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Execution Message Banner for DDL / DML */}
      {result.executionMessage && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlineRoundedIcon fontSize="inherit" />}
          sx={{
            py: 0.6,
            px: 2,
            borderRadius: 0,
            fontSize: 13,
            fontWeight: 500,
            borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          {result.executionMessage}
        </Alert>
      )}

      {/* Table Content */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {result.columns.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">결과 데이터가 없습니다.</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              flex: 1,
              minHeight: 0,
              boxShadow: 'none',
              borderRadius: 0,
              overflow: 'auto',
            }}
          >
            <Table stickyHeader size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: 50,
                      fontWeight: 'bold',
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      textAlign: 'center',
                    }}
                  >
                    #
                  </TableCell>
                  {result.columns.map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    hover
                    sx={{
                      '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: 'text.disabled',
                        fontSize: 12,
                        textAlign: 'center',
                        fontFamily: 'monospace',
                      }}
                    >
                      {page * rowsPerPage + rowIdx + 1}
                    </TableCell>
                    {result.columns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined;
                      return (
                        <TableCell
                          key={col}
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 13,
                            whiteSpace: 'nowrap',
                            color: isNull ? 'text.disabled' : 'text.primary',
                            fontStyle: isNull ? 'italic' : 'normal',
                          }}
                        >
                          {isNull ? 'NULL' : String(val)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Table Pagination */}
      {result.rowCount > 10 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={result.rowCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`, flexShrink: 0 }}
        />
      )}
    </Card>
  );
}
