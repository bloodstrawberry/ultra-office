'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import KeyboardCommandKeyRoundedIcon from '@mui/icons-material/KeyboardCommandKeyRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

import { useRouter } from 'src/routes/hooks';

import { navData } from 'src/layouts/nav-config-dashboard';

import { extractNavTools } from 'src/sections/photo/utils/nav-tools';

// ----------------------------------------------------------------------

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // navData로부터 동적으로 전체 도구 추출
  const { tools } = useMemo(() => extractNavTools(navData), []);

  // Reset query on modal open
  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tools;

    return tools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(q) ||
        (tool.groupTitle && tool.groupTitle.toLowerCase().includes(q)) ||
        tool.section.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (tool.tag && tool.tag.toLowerCase().includes(q)) ||
        tool.path.toLowerCase().includes(q)
    );
  }, [tools, searchQuery]);

  const handleSelectTool = useCallback(
    (path: string) => {
      onClose();
      router.push(path);
    },
    [onClose, router]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        },
      }}
    >
      {/* Search Header Input */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          autoFocus
          fullWidth
          variant="standard"
          placeholder="필요한 도구를 검색하세요... (예: 한글, 도장, 녹화, 대용량, 마스킹, PDF, OCR)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'primary.main', fontSize: 24, mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Chip
                  label="ESC"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '10px', height: 20 }}
                />
              </InputAdornment>
            ),
            sx: { fontSize: '1.05rem', fontWeight: 600 },
          }}
        />
      </Box>

      {/* Results List */}
      <Box sx={{ maxHeight: 420, overflowY: 'auto', p: 1 }}>
        {filteredTools.length > 0 ? (
          <List disablePadding>
            {filteredTools.map((tool) => (
              <ListItemButton
                key={tool.id}
                onClick={() => handleSelectTool(tool.path)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  py: 1.2,
                  px: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    '& .arrow-icon': { transform: 'translateX(4px)', color: 'primary.main' },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {tool.icon || <DashboardCustomizeRoundedIcon sx={{ fontSize: 18 }} />}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {tool.title}
                      </Typography>
                      {tool.groupTitle && (
                        <Chip
                          label={tool.groupTitle}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '9px', fontWeight: 600 }}
                        />
                      )}
                      {tool.tag && (
                        <Chip
                          label={tool.tag}
                          size="small"
                          color={tool.badgeColor || 'primary'}
                          sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {tool.description}
                    </Typography>
                  </Box>
                </Box>

                <ArrowForwardRoundedIcon
                  className="arrow-icon"
                  sx={{ fontSize: 18, color: 'text.disabled', transition: 'all 0.15s ease' }}
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              검색어와 일치하는 도구가 없습니다.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer Navigation Hints */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: 'background.neutral',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <KeyboardCommandKeyRoundedIcon sx={{ fontSize: 14 }} />
          단축키 <strong>Ctrl + K</strong> / <strong>Cmd + K</strong>로 언제든지 열 수 있습니다.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          총 {tools.length}개 실무 도구
        </Typography>
      </Box>
    </Dialog>
  );
}
