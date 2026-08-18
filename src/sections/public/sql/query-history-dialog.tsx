'use client';

import type { QueryHistoryItem } from './types';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface QueryHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

export function QueryHistoryDialog({
  open,
  onClose,
  history,
  onSelectQuery,
  onClearHistory,
}: QueryHistoryDialogProps) {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryRoundedIcon color="primary" />
          <Typography variant="h6">쿼리 실행 기록 (Query History)</Typography>
          <Chip size="small" label={`${history.length}건`} variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {history.length > 0 && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={onClearHistory}
            >
              기록 삭제
            </Button>
          )}
          <Button onClick={onClose} color="inherit" size="small">
            닫기
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {history.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">실행된 쿼리 기록이 없습니다.</Typography>
          </Box>
        ) : (
          <Scrollbar sx={{ maxHeight: 450 }}>
            <List sx={{ p: 1 }}>
              {history.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.success ? (
                        <Chip
                          size="small"
                          icon={<CheckCircleOutlineRoundedIcon />}
                          label="성공"
                          color="success"
                          variant="soft"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={<ErrorOutlineRoundedIcon />}
                          label="실패"
                          color="error"
                          variant="soft"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      )}
                      <Chip
                        size="small"
                        label={`DB: ${item.datasetId}`}
                        variant="outlined"
                        sx={{ fontSize: 11, height: 22 }}
                      />
                      {item.rowCount !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          {item.rowCount} rows
                        </Typography>
                      )}
                      {item.executionTimeMs !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          {item.executionTimeMs} ms
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.disabled">
                        {formatTime(item.timestamp)}
                      </Typography>
                      <Tooltip title="에디터에 로드">
                        <Button
                          size="small"
                          variant="soft"
                          color="primary"
                          startIcon={<ContentPasteRoundedIcon fontSize="small" />}
                          onClick={() => {
                            onSelectQuery(item.query);
                            onClose();
                          }}
                          sx={{ fontSize: 11, height: 26 }}
                        >
                          로드
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      p: 1.2,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.query}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
