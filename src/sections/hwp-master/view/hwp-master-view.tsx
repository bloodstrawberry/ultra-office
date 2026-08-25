'use client';

import type { HwpDocument, HwpViewMode, HwpDocCategory } from '../types';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { HwpViewer } from '../components/hwp-viewer';
import { HwpExtractor } from '../components/hwp-extractor';
import { loadHwpDocument, SAMPLE_HWP_DOCS } from '../utils/hwpx-parser';

// ----------------------------------------------------------------------

const CATEGORY_MAP: Record<
  HwpDocCategory,
  { label: string; color: 'info' | 'success' | 'warning'; icon: React.ReactNode }
> = {
  gov: {
    label: '공무원 · 행정기관',
    color: 'info',
    icon: <AccountBalanceRoundedIcon sx={{ fontSize: 16 }} />,
  },
  public: {
    label: '공기업 · 공공기관',
    color: 'success',
    icon: <BusinessCenterRoundedIcon sx={{ fontSize: 16 }} />,
  },
  military: {
    label: '군대 · 국방서식',
    color: 'warning',
    icon: <SecurityRoundedIcon sx={{ fontSize: 16 }} />,
  },
};

export function HwpMasterView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [document, setDocument] = useState<HwpDocument | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string>(
    SAMPLE_HWP_DOCS[0].id || 'gov-draft'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<HwpViewMode>('preview');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | HwpDocCategory>(
    'all'
  );

  useEffect(() => {
    setHasLoaded(true);
    setDocument(SAMPLE_HWP_DOCS[0]);
  }, []);

  const handleSelectSample = useCallback((sample: HwpDocument) => {
    setActiveSampleId(sample.id || '');
    setDocument(sample);
    setIsTemplateDialogOpen(false);
    toast.success(`'${sample.title}' 서식이 로드되었습니다.`);
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const doc = await loadHwpDocument(file);
      setActiveSampleId('');
      setDocument(doc);
      toast.success(`'${file.name}' 한글 문서가 로드되었습니다.`);
    } catch {
      toast.error('한글 문서 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredSamples = SAMPLE_HWP_DOCS.filter(
    (doc) => selectedCategoryFilter === 'all' || doc.category === selectedCategoryFilter
  );

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
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ArticleRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            한글 파일 문서
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            설치 프로그램 없이 HWP/HWPX 문서를 브라우저에서 즉시 열람하고 텍스트와 표 데이터를
            추출합니다.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => setIsTemplateDialogOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            표준 서식 라이브러리 ({SAMPLE_HWP_DOCS.length}종)
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileRoundedIcon />}
            sx={{ fontWeight: 700 }}
          >
            내 한글 파일(.hwpx / .hwp) 열기
            <input
              type="file"
              hidden
              accept=".hwpx,.hwp,application/x-hwp,application/haansofthwp"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </Box>

      {/* 2. Quick Sample Selector Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          flexShrink: 0,
          overflowX: 'auto',
          py: 0.5,
          minHeight: 36,
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mr: 0.5,
            flexShrink: 0,
          }}
        >
          <FormatListBulletedRoundedIcon sx={{ fontSize: 16 }} />
          표준 서식 예시:
        </Typography>

        {SAMPLE_HWP_DOCS.map((sample) => {
          const isSelected = activeSampleId === sample.id;
          const categoryMeta = sample.category ? CATEGORY_MAP[sample.category] : null;

          return (
            <Tooltip key={sample.id} title={sample.description || sample.title} arrow>
              <Chip
                icon={categoryMeta?.icon as React.ReactElement}
                label={sample.tag || sample.fileName}
                clickable
                onClick={() => handleSelectSample(sample)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                size="small"
                sx={{
                  fontWeight: isSelected ? 800 : 500,
                  borderRadius: 1.5,
                  flexShrink: 0,
                  borderWidth: isSelected ? 2 : 1,
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      {/* 3. File Status Bar */}
      {document && (
        <Card
          variant="outlined"
          sx={{
            p: 1.5,
            mb: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={document.fileType.toUpperCase()}
              color="primary"
              size="small"
              sx={{ fontWeight: 800 }}
            />
            {document.category && CATEGORY_MAP[document.category] && (
              <Chip
                label={CATEGORY_MAP[document.category].label}
                color={CATEGORY_MAP[document.category].color}
                size="small"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {document.fileName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({document.fileSize} · {document.totalParagraphs}개 문단 · {document.totalTables}개
              표)
            </Typography>
          </Box>

          {/* Zoom Slider */}
          {currentTab === 'preview' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 220 }}>
              <ZoomInRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Slider
                size="small"
                value={zoomLevel}
                min={60}
                max={140}
                step={5}
                onChange={(_, v) => setZoomLevel(v as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
              <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 700 }}>
                {zoomLevel}%
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* 4. Navigation Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab
            value="preview"
            label="1. 문서 뷰어 (A4 미리보기)"
            icon={<DescriptionRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="text"
            label="2. 텍스트 & 표 추출기"
            icon={<TableViewRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>

        {document && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<PrintRoundedIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            인쇄 / PDF 저장
          </Button>
        )}
      </Box>

      {/* 5. Tab Content Area */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          pb: 2,
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              한글 문서를 분석하고 렌더링하는 중입니다...
            </Typography>
          </Box>
        ) : !document ? (
          <Card sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              열람할 한글 파일(.hwpx / .hwp)을 선택해 주세요.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              모든 처리는 브라우저 메모리 내에서 안전하게 진행되며 외부로 전송되지 않습니다.
            </Typography>
          </Card>
        ) : currentTab === 'preview' ? (
          <HwpViewer document={document} zoomLevel={zoomLevel} />
        ) : (
          <HwpExtractor document={document} />
        )}
      </Box>

      {/* 6. Template Library Dialog Modal */}
      <Dialog
        open={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2.5,
            p: 3,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              공공 · 공기업 · 군대 표준 서식 라이브러리
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsTemplateDialogOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          실무에서 바로 활용되는 관공서 기안문, 출장복명서, 과업지시서, 지출결의서, 작전명령서,
          휴가신청서 서식입니다.
        </Typography>

        {/* Category Filters in Dialog */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          <Chip
            label={`전체 서식 (${SAMPLE_HWP_DOCS.length}종)`}
            clickable
            color={selectedCategoryFilter === 'all' ? 'primary' : 'default'}
            variant={selectedCategoryFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategoryFilter('all')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            icon={<SecurityRoundedIcon sx={{ fontSize: 16 }} />}
            label={`군대 · 국방서식 (${SAMPLE_HWP_DOCS.filter((d) => d.category === 'military').length}종)`}
            clickable
            color={selectedCategoryFilter === 'military' ? 'warning' : 'default'}
            variant={selectedCategoryFilter === 'military' ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategoryFilter('military')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            icon={<AccountBalanceRoundedIcon sx={{ fontSize: 16 }} />}
            label={`공무원 · 행정기관 (${SAMPLE_HWP_DOCS.filter((d) => d.category === 'gov').length}종)`}
            clickable
            color={selectedCategoryFilter === 'gov' ? 'info' : 'default'}
            variant={selectedCategoryFilter === 'gov' ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategoryFilter('gov')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            icon={<BusinessCenterRoundedIcon sx={{ fontSize: 16 }} />}
            label={`공기업 · 공공기관 (${SAMPLE_HWP_DOCS.filter((d) => d.category === 'public').length}종)`}
            clickable
            color={selectedCategoryFilter === 'public' ? 'success' : 'default'}
            variant={selectedCategoryFilter === 'public' ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategoryFilter('public')}
            sx={{ fontWeight: 700 }}
          />
        </Box>

        {/* Template Grid */}
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            p: 0.5,
          }}
        >
          {filteredSamples.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            const categoryMeta = sample.category ? CATEGORY_MAP[sample.category] : null;

            return (
              <Card
                key={sample.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectSample(sample)}
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ width: '100%', mb: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      {categoryMeta && (
                        <Chip
                          icon={categoryMeta.icon as React.ReactElement}
                          label={categoryMeta.label}
                          size="small"
                          color={categoryMeta.color}
                          variant="soft"
                          sx={{ fontSize: '11px', fontWeight: 700 }}
                        />
                      )}
                      <Chip
                        label={sample.fileSize}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '10px', height: 20 }}
                      />
                    </Box>

                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.4 }}
                    >
                      {sample.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      {sample.description}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      pt: 1,
                      borderTop: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', fontFamily: 'monospace' }}
                    >
                      {sample.fileName}
                    </Typography>
                    <Chip
                      label={`${sample.totalTables}개 표 · ${sample.totalParagraphs}문단`}
                      size="small"
                      sx={{ fontSize: '10px', height: 18 }}
                    />
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Dialog>
    </DashboardContent>
  );
}
