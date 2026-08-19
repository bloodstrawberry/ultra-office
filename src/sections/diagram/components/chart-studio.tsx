'use client';

import type { ChartType } from '../types';

import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { CHART_EXAMPLES } from '../data/example-templates';

// Dynamically import ReactApexChart to prevent SSR window is not defined error
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function ChartStudio() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(CHART_EXAMPLES[0].id);
  const [chartType, setChartType] = useState<ChartType>(CHART_EXAMPLES[0].type);
  const [chartTitle, setChartTitle] = useState<string>(CHART_EXAMPLES[0].title);
  const [categoriesJson, setCategoriesJson] = useState<string>(
    JSON.stringify(CHART_EXAMPLES[0].categories || [], null, 2)
  );
  const [seriesJson, setSeriesJson] = useState<string>(
    JSON.stringify(CHART_EXAMPLES[0].series, null, 2)
  );

  const [parsedSeries, setParsedSeries] = useState<any[]>(CHART_EXAMPLES[0].series);
  const [parsedCategories, setParsedCategories] = useState<string[]>(
    CHART_EXAMPLES[0].categories || []
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync state when example changes
  const handleSelectExample = (id: string) => {
    setSelectedExampleId(id);
    const ex = CHART_EXAMPLES.find((e) => e.id === id);
    if (ex) {
      setChartType(ex.type);
      setChartTitle(ex.title);
      const catStr = JSON.stringify(ex.categories || [], null, 2);
      const serStr = JSON.stringify(ex.series, null, 2);
      setCategoriesJson(catStr);
      setSeriesJson(serStr);
      setParsedCategories(ex.categories || []);
      setParsedSeries(ex.series);
      setJsonError(null);
      toast.success(`'${ex.title}' 차트 예시를 불러왔습니다.`);
    }
  };

  // Live parse JSON
  const handleUpdateJson = (newSeriesStr: string, newCategoriesStr: string) => {
    setSeriesJson(newSeriesStr);
    setCategoriesJson(newCategoriesStr);
    try {
      const parsedS = JSON.parse(newSeriesStr);
      let parsedC: string[] = [];
      if (newCategoriesStr.trim()) {
        parsedC = JSON.parse(newCategoriesStr);
      }
      setParsedSeries(parsedS);
      setParsedCategories(parsedC);
      setJsonError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'JSON 파싱 오류';
      setJsonError(msg);
    }
  };

  const handleCopyConfig = () => {
    const config = {
      type: chartType,
      title: chartTitle,
      categories: parsedCategories,
      series: parsedSeries,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('차트 설정 JSON 데이터가 클립보드에 복사되었습니다.');
  };

  // Build ApexCharts Options
  const apexOptions: any = {
    chart: {
      type: chartType,
      toolbar: { show: true },
      fontFamily: 'inherit',
      background: 'transparent',
    },
    title: {
      text: chartTitle,
      align: 'left',
      style: { fontSize: '15px', fontWeight: 700 },
    },
    stroke: {
      curve: 'smooth',
      width: chartType === 'area' || chartType === 'line' ? 3 : 2,
    },
    xaxis: {
      categories: parsedCategories,
    },
    labels: chartType === 'donut' ? parsedCategories : undefined,
    dataLabels: {
      enabled: chartType === 'donut' || chartType === 'radar',
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    grid: {
      borderColor: 'rgba(145, 158, 171, 0.2)',
    },
    colors: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#d32f2f'],
    tooltip: {
      theme: 'light',
    },
  };

  const currentExample = CHART_EXAMPLES.find((e) => e.id === selectedExampleId);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: 2,
      }}
    >
      {/* 1. Header Toolbar & Quick Examples */}
      <Card
        sx={{
          p: 2,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartRoundedIcon sx={{ color: 'success.main', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                그래프 & 차트 스튜디오 (Charts & Graph Studio)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                인터랙티브한 비즈니스 그래프와 시각화 차트를 실시간으로 작성하고 커스텀합니다.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>차트 유형</InputLabel>
              <Select
                value={chartType}
                label="차트 유형"
                onChange={(e) => setChartType(e.target.value as ChartType)}
              >
                <MenuItem value="bar">막대 (Bar/Column)</MenuItem>
                <MenuItem value="line">선 (Line)</MenuItem>
                <MenuItem value="area">영역 (Area)</MenuItem>
                <MenuItem value="donut">도넛 (Donut)</MenuItem>
                <MenuItem value="radar">레이더 (Radar)</MenuItem>
                <MenuItem value="scatter">산점도 (Scatter)</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltRoundedIcon />}
              onClick={() => handleSelectExample(CHART_EXAMPLES[0].id)}
            >
              초기화
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyConfig}
            >
              JSON 복사
            </Button>
          </Box>
        </Box>

        {/* Example Presets Chips */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              실전 비즈니스 그래프 예시 (6종):
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 0.8,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            {CHART_EXAMPLES.map((ex) => {
              const isSelected = ex.id === selectedExampleId;
              return (
                <Chip
                  key={ex.id}
                  label={ex.title}
                  clickable
                  color={isSelected ? 'success' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => handleSelectExample(ex.id)}
                  sx={{
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* 2. Main Studio Grid (JSON Data Editor & Live Chart Preview) */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' },
          gap: 2,
        }}
      >
        {/* Left Column: Data & Configuration Editor */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <EditNoteRoundedIcon sx={{ fontSize: 18, color: 'info.main' }} />
              차트 데이터 및 옵션 (JSON)
            </Typography>
            {currentExample && (
              <Chip
                label={currentExample.category}
                size="small"
                variant="outlined"
                color="success"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>

          <TextField
            label="차트 제목"
            size="small"
            fullWidth
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            sx={{ mb: 1.5, flexShrink: 0 }}
          />

          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              overflowY: 'auto',
            }}
          >
            {chartType !== 'donut' && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}
                >
                  X축 카테고리 (Categories JSON):
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={categoriesJson}
                  onChange={(e) => handleUpdateJson(seriesJson, e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.8rem',
                      bgcolor: 'background.neutral',
                    },
                  }}
                />
              </Box>
            )}

            <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}
              >
                {chartType === 'donut'
                  ? '도넛 데이터 배열 (Values JSON):'
                  : '시리즈 데이터 (Series JSON):'}
              </Typography>
              <TextField
                multiline
                rows={chartType === 'donut' ? 6 : 8}
                fullWidth
                value={seriesJson}
                onChange={(e) => handleUpdateJson(e.target.value, categoriesJson)}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.8rem',
                    bgcolor: 'background.neutral',
                  },
                }}
              />
            </Box>

            {jsonError && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'error.lighter',
                  color: 'error.main',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                ⚠️ JSON 문법 에러: {jsonError}
              </Box>
            )}
          </Box>
        </Card>

        {/* Right Column: Live Interactive ApexChart Preview */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
              실시간 인터랙티브 그래프 렌더링
            </Typography>
            <Chip
              label={`${chartType.toUpperCase()} CHART`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>

          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 280,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 2,
              p: 2,
            }}
          >
            {!jsonError && parsedSeries ? (
              <Box sx={{ width: '100%', height: '100%', minHeight: 280 }}>
                <Chart
                  options={apexOptions}
                  series={parsedSeries}
                  type={chartType}
                  width="100%"
                  height="100%"
                />
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                올바른 JSON 데이터를 입력하면 인터랙티브 차트가 시각화됩니다.
              </Typography>
            )}
          </Box>

          {/* Current Chart Description */}
          {currentExample && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: 'success.main', mb: 0.3 }}
              >
                {currentExample.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}
              >
                {currentExample.description}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
