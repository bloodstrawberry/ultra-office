'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import type { AgentSession, AgentQueryMode } from '../../util/utils/ai-agent-data';

// ----------------------------------------------------------------------

interface AgentSessionSidebarProps {
  sessions: AgentSession[];
  activeSessionId: string;
  onSelectSession: (id: string, mode: AgentQueryMode) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export function AgentSessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: AgentSessionSidebarProps) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        overflowY: 'auto',
      }}
    >
      <Button
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<AddCommentRoundedIcon />}
        onClick={onNewSession}
        sx={{ fontWeight: 700 }}
      >
        새 대화 시작
      </Button>

      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mt: 1 }}>
        대화 세션 목록 ({sessions.length})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, flex: 1, overflowY: 'auto' }}>
        {sessions.map((sess) => {
          const isSelected = sess.id === activeSessionId;
          return (
            <Card
              key={sess.id}
              variant="outlined"
              onClick={() => onSelectSession(sess.id, sess.mode)}
              sx={{
                flexShrink: 0,
                p: 1.2,
                borderRadius: 1.5,
                cursor: 'pointer',
                bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                borderColor: isSelected ? 'primary.main' : 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ overflow: 'hidden', mr: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: isSelected ? 800 : 500 }}>
                  {sess.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {sess.messages.length}개 메시지
                </Typography>
              </Box>

              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(sess.id);
                }}
              >
                <DeleteSweepRoundedIcon fontSize="small" />
              </IconButton>
            </Card>
          );
        })}
      </Box>
    </Card>
  );
}
