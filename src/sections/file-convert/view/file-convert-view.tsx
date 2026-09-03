'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PdfConvertTab } from '../components/pdf-convert-tab';
import { DataConvertTab } from '../components/data-convert-tab';
import { ImageConvertTab } from '../components/image-convert-tab';
import { OfficeConvertTab } from '../components/office-convert-tab';
import { UniversalConvertTab } from '../components/universal-convert-tab';

// ----------------------------------------------------------------------

type TabCategory = 'universal' | 'pdf' | 'office' | 'image' | 'data';

export function FileConvertView() {
  const [currentTab, setCurrentTab] = useState<TabCategory>('universal');

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 2.5, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          통합 파일 변환기 (Universal File Converter Hub)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          동영상, 오디오, 이미지, 오피스(Excel·Word·HWPX), 마크다운, 데이터(JSON·YAML·XML·SQL)를
          브라우저 100% 로컬에서 일괄 변환합니다.
        </Typography>
      </Box>

      {/* Main Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v: TabCategory) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="1. 만능 일괄 변환기 (Convertio)"
            value="universal"
            icon={<SwapHorizontalCircleRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. PDF 랩 (병합·분할·워터마크)"
            value="pdf"
            icon={<PictureAsPdfRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 오피스 & 문서 랩 (Excel·Word·HWP·PPTX)"
            value="office"
            icon={<TableViewRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="4. 이미지 포맷 랩 (6종 변환·ASCII)"
            value="image"
            icon={<PhotoLibraryRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="5. 데이터 & 개발자 랩 (JSON·YAML·XML·SQL)"
            value="data"
            icon={<DataObjectRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Internal Scrollable Content */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        {currentTab === 'universal' && <UniversalConvertTab />}
        {currentTab === 'pdf' && <PdfConvertTab />}
        {currentTab === 'office' && <OfficeConvertTab />}
        {currentTab === 'image' && <ImageConvertTab />}
        {currentTab === 'data' && <DataConvertTab />}
      </Box>
    </DashboardContent>
  );
}
