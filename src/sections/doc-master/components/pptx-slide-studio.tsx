'use client';

import type { PptDeck, SlideItem, PptThemeId, SlideLayoutType } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { generatePptxFile } from '../utils/pptx-generator';
import { PPT_THEMES, SAMPLE_PPT_DECKS } from '../data/presentation-templates';

// ----------------------------------------------------------------------

export function PptxSlideStudio() {
  const [deck, setDeck] = useState<PptDeck>(SAMPLE_PPT_DECKS['startup-pitch']);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const activeSlide = deck.slides[activeSlideIdx] || deck.slides[0];
  const currentTheme = PPT_THEMES[deck.themeId] || PPT_THEMES['navy-tech'];

  const handleUpdateActiveSlide = (updates: Partial<SlideItem>) => {
    setDeck((prev) => ({
      ...prev,
      slides: prev.slides.map((s, idx) => (idx === activeSlideIdx ? { ...s, ...updates } : s)),
    }));
  };

  const handleAddSlide = (layout: SlideLayoutType = 'kpi-cards') => {
    const newSlide: SlideItem = {
      id: `s-${Date.now()}`,
      layout,
      title: '새로운 슬라이드 제목',
      subtitle: '슬라이드 세부 설명을 입력하세요',
      kpiList: [
        { label: '핵심 지표 1', value: '100%', desc: '달성률' },
        { label: '핵심 지표 2', value: '$10M', desc: '목표치' },
        { label: '핵심 지표 3', value: '50만명', desc: '사용자 수' },
      ],
    };

    setDeck((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setActiveSlideIdx(deck.slides.length);
    toast.success('새 슬라이드가 추가되었습니다.');
  };

  const handleRemoveSlide = (idx: number) => {
    if (deck.slides.length <= 1) {
      toast.warning('최소 1장의 슬라이드는 유지되어야 합니다.');
      return;
    }
    setDeck((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== idx),
    }));
    if (activeSlideIdx >= deck.slides.length - 1) {
      setActiveSlideIdx(Math.max(0, deck.slides.length - 2));
    }
  };

  const handleDownloadPptx = async () => {
    try {
      setIsGenerating(true);
      const filename = `${deck.title.replace(/[^a-zA-Z0-9가-힣]/g, '_') || 'presentation'}.pptx`;
      await generatePptxFile(deck, filename);
      toast.success(`'${filename}' 파워포인트 파일이 다운로드되었습니다!`);
    } catch (err) {
      console.error(err);
      toast.error('PPTX 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '320px 1fr 340px' },
        gap: 2,
        height: '100%',
      }}
    >
      {/* 1. Left Column: Slide Thumbnails List & Add */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            슬라이드 목록 ({deck.slides.length})
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddRoundedIcon fontSize="small" />}
            onClick={() => handleAddSlide('kpi-cards')}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            슬라이드 추가
          </Button>
        </Box>

        {/* Thumbnail Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {deck.slides.map((s, idx) => {
            const isSelected = idx === activeSlideIdx;
            return (
              <Box
                key={s.id}
                onClick={() => setActiveSlideIdx(idx)}
                sx={{
                  p: 1.2,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: (theme) =>
                    `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                  bgcolor: isSelected ? 'action.selected' : 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.8,
                  position: 'relative',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Chip
                    size="small"
                    label={`${idx + 1}. ${s.layout.toUpperCase()}`}
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                  />
                  {deck.slides.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSlide(idx);
                      }}
                      sx={{ p: 0.2 }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>

                {/* 16:9 Thumbnail Mini-Mockup */}
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    bgcolor: currentTheme.bgColor,
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: currentTheme.titleColor,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {s.title}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* 2. Middle Column: 16:9 Interactive Slide Canvas Preview */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        {/* Top Action Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <SlideshowRoundedIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              슬라이드 {activeSlideIdx + 1} / {deck.slides.length} 미리보기
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleDownloadPptx}
            disabled={isGenerating}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            {isGenerating ? '생성 중...' : 'PowerPoint (.pptx) 다운로드'}
          </Button>
        </Box>

        {/* 16:9 Aspect Ratio Slide Canvas */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#cbd5e1'),
            p: { xs: 1.5, md: 3 },
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Slide Stage (16:9 Canvas) */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 820,
              aspectRatio: '16/9',
              bgcolor: currentTheme.bgColor,
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
              boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Slide Header */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: currentTheme.titleColor,
                  textAlign:
                    activeSlide.layout === 'title' || activeSlide.layout === 'conclusion'
                      ? 'center'
                      : 'left',
                  mb: 0.5,
                }}
              >
                {activeSlide.title}
              </Typography>

              {activeSlide.subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textAlign:
                      activeSlide.layout === 'title' || activeSlide.layout === 'conclusion'
                        ? 'center'
                        : 'left',
                    mb: 2,
                  }}
                >
                  {activeSlide.subtitle}
                </Typography>
              )}
            </Box>

            {/* Slide Layout Body */}
            <Box
              sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {activeSlide.layout === 'kpi-cards' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${activeSlide.kpiList?.length || 3}, 1fr)`,
                    gap: 2,
                    width: '100%',
                  }}
                >
                  {activeSlide.kpiList?.map((kpi, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.accentColor}`,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: currentTheme.accentColor }}
                      >
                        {kpi.value}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: currentTheme.textColor, mt: 0.5 }}
                      >
                        {kpi.label}
                      </Typography>
                      {kpi.desc && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {kpi.desc}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {(activeSlide.layout === 'chart-bar' || activeSlide.layout === 'chart-pie') && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: currentTheme.cardBg,
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    {activeSlide.layout === 'chart-bar' ? (
                      <BarChartRoundedIcon sx={{ fontSize: 64, color: currentTheme.accentColor }} />
                    ) : (
                      <PieChartRoundedIcon sx={{ fontSize: 64, color: currentTheme.accentColor }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ color: currentTheme.textColor, fontWeight: 700, mt: 1 }}
                    >
                      {activeSlide.chartTitle || '네이티브 PPT 차트'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      (다운로드 시 파워포인트 내에서 100% 편집 가능)
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {activeSlide.bullets?.map((b, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{ color: currentTheme.textColor, fontSize: '0.85rem' }}
                      >
                        • {b}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {activeSlide.layout === 'timeline' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                    width: '100%',
                  }}
                >
                  {activeSlide.timelineSteps?.map((st, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.accentColor}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: currentTheme.accentColor }}
                      >
                        {st.step}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: currentTheme.textColor }}
                      >
                        {st.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {st.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {activeSlide.layout === 'team' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                    width: '100%',
                  }}
                >
                  {activeSlide.teamMembers?.map((tm, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: currentTheme.cardBg,
                        border: '1px solid rgba(255,255,255,0.15)',
                        textAlign: 'center',
                      }}
                    >
                      <GroupsRoundedIcon
                        sx={{ fontSize: 32, color: currentTheme.accentColor, mb: 0.5 }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: currentTheme.textColor }}
                      >
                        {tm.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: currentTheme.accentColor, fontWeight: 600, display: 'block' }}
                      >
                        {tm.role}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                      >
                        {tm.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {activeSlide.layout === 'conclusion' && (
                <Typography
                  variant="body1"
                  sx={{ color: currentTheme.textColor, textAlign: 'center' }}
                >
                  {activeSlide.bodyText}
                </Typography>
              )}
            </Box>

            {/* Slide Footer */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'text.disabled',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                pt: 1,
              }}
            >
              <span>{deck.company}</span>
              <span>Ultra Office SlideMaster</span>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 3. Right Column: Inspector & Theme Settings */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {/* Theme Settings */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <PaletteRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              프레젠테이션 테마 디자인
            </Typography>
          </Box>

          <Select
            size="small"
            value={deck.themeId}
            onChange={(e) => setDeck({ ...deck, themeId: e.target.value as PptThemeId })}
            fullWidth
          >
            {Object.values(PPT_THEMES).map((th) => (
              <MenuItem key={th.id} value={th.id}>
                {th.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Current Slide Inspector Form */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            pt: 1.5,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            현재 슬라이드 속성 편집
          </Typography>

          <Select
            size="small"
            value={activeSlide.layout}
            onChange={(e) => handleUpdateActiveSlide({ layout: e.target.value as SlideLayoutType })}
            fullWidth
          >
            <MenuItem value="title">표지 (Title)</MenuItem>
            <MenuItem value="kpi-cards">핵심 지표 카드 (KPIs)</MenuItem>
            <MenuItem value="chart-bar">막대 차트 (Bar Chart)</MenuItem>
            <MenuItem value="chart-pie">원형 차트 (Pie Chart)</MenuItem>
            <MenuItem value="timeline">타임라인 로드맵 (Timeline)</MenuItem>
            <MenuItem value="team">팀원 소개 (Team)</MenuItem>
            <MenuItem value="conclusion">결론 (Conclusion)</MenuItem>
          </Select>

          <TextField
            size="small"
            label="슬라이드 제목"
            value={activeSlide.title}
            onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
            fullWidth
          />

          <TextField
            size="small"
            label="부제목 / 설명"
            value={activeSlide.subtitle || ''}
            onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
            fullWidth
          />

          <TextField
            size="small"
            label="발표자 메모 (Speaker Notes)"
            multiline
            rows={3}
            value={activeSlide.speakerNotes || ''}
            onChange={(e) => handleUpdateActiveSlide({ speakerNotes: e.target.value })}
            fullWidth
          />
        </Box>
      </Card>
    </Box>
  );
}
