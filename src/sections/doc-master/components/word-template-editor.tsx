'use client';

import type { WordTemplateConfig } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import { downloadFile } from '../utils/docx-generator';
import { WORD_TEMPLATES } from '../data/document-templates';
import { renderTemplateText, buildDocxFromTemplate } from '../utils/docx-template-engine';

// ----------------------------------------------------------------------

export function WordTemplateEditor() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(WORD_TEMPLATES[0].id);
  const [formData, setFormData] = useState<Record<string, string>>(WORD_TEMPLATES[0].defaultData);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const activeTemplate =
    WORD_TEMPLATES.find((t) => t.id === selectedTemplateId) || WORD_TEMPLATES[0];

  const handleSelectTemplate = (template: WordTemplateConfig) => {
    setSelectedTemplateId(template.id);
    setFormData(template.defaultData);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownloadDocx = async () => {
    try {
      setIsGenerating(true);
      const blob = await buildDocxFromTemplate(activeTemplate, formData);
      const filename = `${activeTemplate.title}_${formData.employee_name || formData.recipient_name || '발급'}.docx`;
      downloadFile(blob, filename);
      toast.success(`'${filename}' 템플릿 문서가 성공적으로 발급되었습니다!`);
    } catch (err) {
      console.error(err);
      toast.error('문서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderedPreviewText = renderTemplateText(activeTemplate.sampleContent, formData);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '380px 1fr' },
        gap: 2.5,
        height: '100%',
      }}
    >
      {/* Left Column: Template Selector & Input Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {/* Template Cards Horizontal Selector */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            표준 문서 템플릿 선택
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {WORD_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <Card
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: (theme) =>
                      `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: isSelected ? 'action.selected' : 'background.paper',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: 'primary.main' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
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
                      size="small"
                      label={tmpl.category}
                      sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                    />
                    {isSelected && <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 16 }} />}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {tmpl.title}
                  </Typography>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Dynamic Variable Input Form */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              템플릿 데이터 주입 폼
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            입력된 값이 문서 내 {`{태그}`}에 실시간으로 반영됩니다.
          </Typography>

          {activeTemplate.fields.map((field) => (
            <TextField
              key={field.key}
              size="small"
              label={field.label}
              multiline={field.type === 'textarea'}
              rows={field.type === 'textarea' ? 3 : 1}
              value={formData[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              fullWidth
            />
          ))}
        </Card>
      </Box>

      {/* Right Column: Live Document Preview */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            실시간 완성 문서 미리보기 ({activeTemplate.title})
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleDownloadDocx}
            disabled={isGenerating}
            sx={{ fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
          >
            {isGenerating ? '발급 중...' : '맞춤형 Word (.docx) 발급'}
          </Button>
        </Box>

        {/* Rendered Preview Box */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#cbd5e1'),
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 700,
              minHeight: 800,
              bgcolor: '#ffffff',
              color: '#1e293b',
              p: { xs: 3, md: 5 },
              borderRadius: 1,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              fontFamily: '"Pretendard", -apple-system, sans-serif',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {renderedPreviewText}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
