'use client';

import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  loadPlTemplate,
  loadKpiTemplate,
  loadWbsTemplate,
  exportFortuneToCSV,
  generateEmptySheet,
  importCSVToFortune,
  loadBudgetTemplate,
  exportFortuneToXLSX,
  importXLSXToFortune,
  type FortuneSheetData,
  type WorkbookInstance,
  applyDropdownValidation,
} from 'src/components/fortune-spreadsheet';

// Dynamically import FortuneSpreadsheet with SSR disabled
const FortuneSpreadsheet = dynamic(
  () => import('src/components/fortune-spreadsheet').then((mod) => mod.FortuneSpreadsheet),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          height: '100%',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    ),
  }
);

// ----------------------------------------------------------------------

export function SpreadsheetView() {
  const [sheetData, setSheetData] = useState<FortuneSheetData[]>(() => [loadKpiTemplate()]);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [activeTemplate, setActiveTemplate] = useState<'kpi' | 'budget' | 'wbs' | 'pl' | 'custom'>(
    'kpi'
  );
  const workbookRef = useRef<WorkbookInstance>(null);

  const handleSheetChange = useCallback((newData: FortuneSheetData[]) => {
    setSheetData(newData);
  }, []);

  const handleLoadKpi = () => {
    setSheetData([loadKpiTemplate()]);
    setActiveTemplate('kpi');
    setResetCounter((prev) => prev + 1);
    toast.success('2026 KPI 성과 관리 템플릿이 로드되었습니다.');
  };

  const handleLoadBudget = () => {
    setSheetData([loadBudgetTemplate()]);
    setActiveTemplate('budget');
    setResetCounter((prev) => prev + 1);
    toast.success('부서별 예산 집행현황 템플릿이 로드되었습니다.');
  };

  const handleLoadWbs = () => {
    setSheetData([loadWbsTemplate()]);
    setActiveTemplate('wbs');
    setResetCounter((prev) => prev + 1);
    toast.success('프로젝트 WBS 공수 일정표가 로드되었습니다.');
  };

  const handleLoadPl = () => {
    setSheetData([loadPlTemplate()]);
    setActiveTemplate('pl');
    setResetCounter((prev) => prev + 1);
    toast.success('손익 계산서 (P&L) 템플릿이 로드되었습니다.');
  };

  const handleLoadEmpty = () => {
    setSheetData([generateEmptySheet('빈 시트', 60, 26)]);
    setActiveTemplate('custom');
    setResetCounter((prev) => prev + 1);
    toast.info('새 빈 스프레드시트가 생성되었습니다.');
  };

  const handleExportXlsx = async () => {
    const liveSheets = workbookRef.current?.getAllSheets?.();
    const sheetsToExport =
      liveSheets && liveSheets.length > 0
        ? (liveSheets as unknown as FortuneSheetData[])
        : sheetData;

    if (!sheetsToExport || sheetsToExport.length === 0) {
      toast.warning('내보낼 시트 데이터가 없습니다.');
      return;
    }

    const currentSheetName = sheetsToExport[0]?.name || 'spreadsheet';
    try {
      const success = await exportFortuneToXLSX(sheetsToExport, currentSheetName);
      if (success) {
        toast.success('Excel (.xlsx) 파일이 메타데이터(서식/색상)와 함께 다운로드되었습니다.');
      } else {
        toast.warning('시트에 작성된 내용이 없습니다.');
      }
    } catch {
      toast.error('Excel 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const handleExportCsv = () => {
    const liveSheets = workbookRef.current?.getAllSheets?.();
    const sheetsToExport =
      liveSheets && liveSheets.length > 0
        ? (liveSheets as unknown as FortuneSheetData[])
        : sheetData;
    const targetSheet = sheetsToExport?.[0];

    if (!targetSheet) {
      toast.warning('내보낼 시트 데이터가 없습니다.');
      return;
    }

    const currentSheetName = targetSheet.name || 'spreadsheet';
    const success = exportFortuneToCSV(targetSheet, currentSheetName);
    if (success) {
      toast.success('CSV 파일이 다운로드되었습니다.');
    } else {
      toast.warning('시트에 작성된 내용이 없습니다.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            const imported = importCSVToFortune(text, file.name.replace('.csv', ''));
            setSheetData([imported]);
            setActiveTemplate('custom');
            setResetCounter((prev) => prev + 1);
            toast.success('CSV 파일이 성공적으로 불러와졌습니다.');
          }
        };
        reader.readAsText(file, 'utf-8');
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const imported = await importXLSXToFortune(file);
        setSheetData([imported]);
        setActiveTemplate('custom');
        setResetCounter((prev) => prev + 1);
        toast.success('Excel 파일이 성공적으로 불러와졌습니다.');
      } else {
        toast.error('지원하지 않는 파일 형식입니다. (.xlsx, .xls, .csv)');
      }
    } catch {
      toast.error('파일 불러오기에 실패했습니다.');
    }
    e.target.value = '';
  };

  const handleApplyKpiValidation = () => {
    if (!sheetData[0]) return;
    const updated = applyDropdownValidation(
      sheetData[0],
      1,
      5,
      ['S (우수)', 'A (양호)', 'B (보통)', 'C (미흡)', 'F (낙제)'],
      true
    );
    setSheetData([updated]);
    setResetCounter((prev) => prev + 1);
    toast.success('최종 평가 열(Column F)에 등급 드롭다운 유효성 검사가 적용되었습니다.');
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          스마트 스프레드시트 (Enterprise Spreadsheet)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          FortuneSheet 기반 초고속 캔버스 렌더링, 4대 실무 템플릿, 엑셀/CSV 양방향 가져오기 및
          유효성 검사를 지원합니다.
        </Typography>
      </Box>

      {/* Control Toolbar Card */}
      <Card
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Template Selectors */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
            📋 템플릿:
          </Typography>
          <Button
            size="small"
            variant={activeTemplate === 'kpi' ? 'contained' : 'outlined'}
            startIcon={<AssessmentRoundedIcon />}
            onClick={handleLoadKpi}
          >
            2026 KPI 성과표
          </Button>
          <Button
            size="small"
            variant={activeTemplate === 'budget' ? 'contained' : 'outlined'}
            startIcon={<AttachMoneyRoundedIcon />}
            onClick={handleLoadBudget}
          >
            예산 집행현황
          </Button>
          <Button
            size="small"
            variant={activeTemplate === 'wbs' ? 'contained' : 'outlined'}
            startIcon={<FormatListBulletedRoundedIcon />}
            onClick={handleLoadWbs}
          >
            WBS 프로젝트 일정
          </Button>
          <Button
            size="small"
            variant={activeTemplate === 'pl' ? 'contained' : 'outlined'}
            startIcon={<TrendingUpRoundedIcon />}
            onClick={handleLoadPl}
          >
            손익 계산서 (P&L)
          </Button>
          <Button
            size="small"
            variant={activeTemplate === 'custom' ? 'contained' : 'outlined'}
            color="secondary"
            onClick={handleLoadEmpty}
          >
            빈 시트
          </Button>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<FactCheckRoundedIcon />}
            onClick={handleApplyKpiValidation}
          >
            평가 등급 드롭다운 적용
          </Button>

          <Button
            size="small"
            variant="outlined"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
          >
            가져오기 (.xlsx/.csv)
            <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleImportFile} />
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportXlsx}
          >
            Excel 저장 (.xlsx)
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportCsv}
          >
            CSV 저장
          </Button>
        </Box>
      </Card>

      {/* Spreadsheet Canvas */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: { xs: 520, md: 0 },
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <FortuneSpreadsheet
          ref={workbookRef}
          key={resetCounter}
          data={sheetData}
          onChange={handleSheetChange}
          height="100%"
        />
      </Box>
    </DashboardContent>
  );
}
