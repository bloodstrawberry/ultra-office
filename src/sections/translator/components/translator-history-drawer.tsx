'use client';

import type { TranslationHistoryItem } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

// ----------------------------------------------------------------------

interface TranslatorHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  historyList: TranslationHistoryItem[];
  onSelectHistory: (item: TranslationHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export function TranslatorHistoryDrawer({
  open,
  onClose,
  historyList,
  onSelectHistory,
  onToggleFavorite,
  onDeleteHistory,
  onClearAll,
}: TranslatorHistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorite'>('all');

  const filteredList =
    activeTab === 'favorite' ? historyList.filter((item) => item.isFavorite) : historyList;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다.');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 440 },
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        },
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          번역 기록 & 즐겨찾기
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 1.5 }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* 탭 & 전체 삭제 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              fontSize: '0.85rem',
              fontWeight: 700,
              py: 0.5,
            },
          }}
        >
          <Tab value="all" label={`전체 기록 (${historyList.length})`} />
          <Tab
            value="favorite"
            label={`즐겨찾기 (${historyList.filter((i) => i.isFavorite).length})`}
          />
        </Tabs>

        {historyList.length > 0 && (
          <Button
            size="small"
            color="error"
            onClick={onClearAll}
            sx={{ borderRadius: 1.5, fontSize: '0.78rem' }}
          >
            전체 비우기
          </Button>
        )}
      </Box>

      {/* 리스트 본문 (내부 스크롤) */}
      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          pr: 0.5,
        }}
      >
        {filteredList.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              {activeTab === 'favorite'
                ? '즐겨찾기한 번역 내역이 없습니다.'
                : '최근 번역 기록이 없습니다.'}
            </Typography>
          </Box>
        ) : (
          filteredList.map((item) => (
            <Card
              key={item.id}
              variant="outlined"
              sx={{
                p: 1.8,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.shadows[2],
                },
              }}
            >
              {/* 메타데이터 바 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    {item.sourceLang.toUpperCase()}
                  </Typography>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {item.targetLang.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', ml: 1 }}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title={item.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}>
                    <IconButton
                      size="small"
                      color={item.isFavorite ? 'warning' : 'default'}
                      onClick={() => onToggleFavorite(item.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <StarRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton
                      size="small"
                      color="default"
                      onClick={() => onDeleteHistory(item.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* 원문 요약 */}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.sourceText}
              </Typography>

              {/* 번역문 요약 */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'text.primary',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.translatedText}
              </Typography>

              {/* 액션 버튼들 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 1,
                  pt: 0.5,
                }}
              >
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<ContentCopyRoundedIcon fontSize="small" />}
                  onClick={() => handleCopy(item.translatedText)}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                >
                  복사
                </Button>
                <Button
                  size="small"
                  variant="soft"
                  color="primary"
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700 }}
                >
                  에디터에 적용
                </Button>
              </Box>
            </Card>
          ))
        )}
      </Box>
    </Drawer>
  );
}
