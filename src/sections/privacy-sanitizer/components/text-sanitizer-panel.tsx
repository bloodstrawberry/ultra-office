'use client';

import type { PrivacyItemType } from '../types';

import { toast } from 'sonner';
import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { sanitizeAllText, scanPrivacyInText } from '../utils/privacy-utils';
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

// ----------------------------------------------------------------------

const SAMPLE_TEXT = `[고객 상담 및 계약서 서식]
고객명: 홍길동
주민등록번호: 920512-1849201 (외국인: 850101-5839201)
연락처: 010-9876-5432 / 회사: 02-1234-5678
이메일: gildong.hong@ultraoffice.com
환불 계좌: 국민은행 123-456-789012 (예금주: 홍길동)
결제 카드: 5424-1234-5678-9012 (비씨카드)
사업자번호: 123-45-67890`;

export function TextSanitizerPanel() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [activeRules, setActiveRules] = useState<Record<PrivacyItemType, boolean>>({
    rrn: true,
    phone: true,
    email: true,
    account: true,
    card: true,
    biz_no: true,
  });

  const detectedItems = useMemo(() => scanPrivacyInText(inputText), [inputText]);

  const sanitizedText = useMemo(
    () => sanitizeAllText(inputText, activeRules),
    [inputText, activeRules]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitizedText);
    toast.success('마스킹된 안전한 텍스트가 클립보드에 복사되었습니다.');
  };

  const toggleRule = (key: PrivacyItemType) => {
    setActiveRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Detection summary chip bar */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <SecurityRoundedIcon color="success" sx={{ fontSize: 20 }} />
            실시간 감지된 민감정보 ({detectedItems.reduce((acc, c) => acc + c.count, 0)}건):
          </Typography>
          {detectedItems.length > 0 ? (
            detectedItems.map((item) => (
              <Chip
                key={item.type}
                label={`${item.label} (${item.count}건)`}
                color="error"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            ))
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              감지된 개인정보가 없습니다.
            </Typography>
          )}
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoFixHighRoundedIcon />}
          onClick={() => setInputText(SAMPLE_TEXT)}
        >
          실전 테스트 예시 넣기
        </Button>
      </Card>

      {/* 2. Masking Rules Toggle */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch size="small" checked={activeRules.rrn} onChange={() => toggleRule('rrn')} />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              주민등록번호 마스킹
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch size="small" checked={activeRules.phone} onChange={() => toggleRule('phone')} />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              전화/휴대폰 번호 마스킹
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch size="small" checked={activeRules.email} onChange={() => toggleRule('email')} />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              이메일 주소 마스킹
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch size="small" checked={activeRules.card} onChange={() => toggleRule('card')} />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              카드/계좌번호 마스킹
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={activeRules.biz_no}
              onChange={() => toggleRule('biz_no')}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              사업자번호 마스킹
            </Typography>
          }
        />
      </Box>

      {/* 3. Side by Side Resizable Text Comparison */}
      <ResizablePanelGroup orientation="horizontal" autoSaveId="text-sanitizer-split">
        {/* Left: Input Text */}
        <ResizablePanel id="sanitizer-input" defaultSize={50} minSize={25}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              원본 문서 / 텍스트 입력
            </Typography>
            <TextField
              multiline
              rows={14}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="마스킹할 텍스트를 붙여넣으세요..."
              fullWidth
              InputProps={{ sx: { fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 } }}
            />
          </Card>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        {/* Right: Masked Clean Text */}
        <ResizablePanel id="sanitizer-output" defaultSize={50} minSize={25}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                마스킹 완료 안전 텍스트 (Sanitized)
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopy}
                sx={{ fontWeight: 800 }}
              >
                결과 복사
              </Button>
            </Box>
            <TextField
              multiline
              rows={14}
              value={sanitizedText}
              fullWidth
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  bgcolor: 'background.neutral',
                },
              }}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  );
}
