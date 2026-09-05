'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { BUSINESS_TEMPLATES } from '../utils/business-templates';

// ----------------------------------------------------------------------

interface TranslatorTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (text: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'email', label: '비즈니스 메일' },
  { id: 'inquiry', label: '견적 및 문의' },
  { id: 'meeting', label: '회의 및 일정' },
  { id: 'contract', label: '계약 및 협약' },
  { id: 'notice', label: '공지사항' },
];

export function TranslatorTemplateDialog({
  open,
  onClose,
  onSelectTemplate,
}: TranslatorTemplateDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates =
    selectedCategory === 'all'
      ? BUSINESS_TEMPLATES
      : BUSINESS_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            오피스 365 실무 비즈니스 번역 템플릿
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 1.5 }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          해외 바이어 교신, 영문 견적 요청, 글로벌 회의록, 계약 조항 등 실무에서 바로 활용할 수 있는
          표준 비즈니스 양식입니다. 선택 시 에디터에 자동으로 채워지며 즉시 원하는 언어로 번역할 수
          있습니다.
        </Typography>

        {/* 카테고리 필터 칩 */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.id)}
              color={selectedCategory === cat.id ? 'primary' : 'default'}
              variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            />
          ))}
        </Box>

        {/* 템플릿 그리드 리스트 (내부 스크롤) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            maxHeight: 450,
            overflowY: 'auto',
            pr: 0.5,
            pt: 0.5,
          }}
        >
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.shadows[3],
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Chip
                    label={template.categoryLabel}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ borderRadius: 1, fontSize: '0.72rem', fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {template.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 1 }}
                >
                  {template.description}
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    maxHeight: 90,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-wrap',
                    color: 'text.secondary',
                  }}
                >
                  {template.content.slice(0, 160)}...
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  onSelectTemplate(template.content);
                  onClose();
                }}
                sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
              >
                이 템플릿 적용하기
              </Button>
            </Card>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
