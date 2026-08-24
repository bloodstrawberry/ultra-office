'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ApprovalRoundedIcon from '@mui/icons-material/ApprovalRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { StampGenerator } from '../components/stamp-generator';
import { DocumentStamper } from '../components/document-stamper';
import { QuickInvoiceForm } from '../components/quick-invoice-form';

// ----------------------------------------------------------------------

export function StampStudioView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'generator' | 'stamper' | 'invoice'>('generator');
  const [activeStampUrl, setActiveStampUrl] = useState<string>('');

  const handleStampGenerated = React.useCallback((url: string) => {
    setActiveStampUrl(url);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <ApprovalRoundedIcon sx={{ fontSize: 32, color: 'error.main' }} />
          전자 도장 · 직인 스튜디오 & 간이 서식 날인기
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          개인 원형 인감, 법인/회사 직인, 결재 도장을 실시간 생성하고 투명 PNG로 저장하거나 PDF 및
          견적서에 즉시 날인합니다.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab
            value="generator"
            label="1. 전자 도장 & 직인 생성기"
            icon={<AutoFixHighRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="stamper"
            label="2. PDF · 문서 원클릭 날인기"
            icon={<TouchAppRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="invoice"
            label="3. 견적서 & 영수증 서식기"
            icon={<ReceiptLongRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'generator' && <StampGenerator onStampGenerated={handleStampGenerated} />}
        {currentTab === 'stamper' && <DocumentStamper currentStampUrl={activeStampUrl} />}
        {currentTab === 'invoice' && <QuickInvoiceForm currentStampUrl={activeStampUrl} />}
      </Box>
    </DashboardContent>
  );
}
