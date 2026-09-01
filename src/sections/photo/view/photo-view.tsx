'use client';

import React from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import BlurOnRoundedIcon from '@mui/icons-material/BlurOnRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CropRotateRoundedIcon from '@mui/icons-material/CropRotateRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import PhotoFilterRoundedIcon from '@mui/icons-material/PhotoFilterRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

interface PhotoToolItem {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  tag?: string;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const TOOL_SECTIONS: { category: string; desc: string; tools: PhotoToolItem[] }[] = [
  {
    category: '아트 & 비주얼 이펙트',
    desc: '사진을 감성적인 예술 작품이나 레트로 그래픽으로 변환합니다.',
    tools: [
      {
        id: 'art-style',
        title: '명화 & 스케치 필터',
        desc: '인상파 유화, 수묵화, 색연필, 수채화, 지브리 애니, 판화 등 14종 화풍',
        href: paths.photo.artStyle,
        icon: <AutoFixHighRoundedIcon sx={{ fontSize: 28, color: '#ec4899' }} />,
        tag: '인기',
        badgeColor: 'secondary',
      },
      {
        id: 'ascii',
        title: 'ASCII 아스키 아트',
        desc: '사진을 텍스트 문자로 변환 (Dark, Matrix, Cyber, Full Color)',
        href: paths.photo.ascii,
        icon: <TextFieldsRoundedIcon sx={{ fontSize: 28, color: '#10b981' }} />,
        tag: 'NEW',
        badgeColor: 'success',
      },
      {
        id: 'pixel',
        title: '픽셀 아트 변환기',
        desc: '8비트 게임보이 / NES 패미컴 레트로 도트 그래픽',
        href: paths.photo.pixel,
        icon: <ViewModuleRoundedIcon sx={{ fontSize: 28, color: '#f59e0b' }} />,
      },
      {
        id: 'glitch',
        title: '글리치 효과 생성기',
        desc: 'RGB 색수차 분리, CRT 스캔라인, 노이즈 왜곡 효과',
        href: paths.photo.glitch,
        icon: <FlashOnRoundedIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />,
      },
      {
        id: 'four-cut',
        title: '인생네컷 포토부스',
        desc: '4컷 / 2x2 격자 / 폴라로이드 감성 프레임 & 스티커',
        href: paths.photo.fourCut,
        icon: <PhotoFilterRoundedIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
        tag: '추천',
        badgeColor: 'primary',
      },
      {
        id: 'weathering',
        title: '디지털 풍화 시뮬레이터',
        desc: '세대 손실(Generation Loss), 썩은 짤방, 카톡 무한 압축, 배터리 3% UI',
        href: paths.photo.weathering,
        icon: <HourglassBottomRoundedIcon sx={{ fontSize: 28, color: '#16a34a' }} />,
        tag: 'NEW',
        badgeColor: 'success',
      },
      {
        id: 'meme-lab',
        title: '종합 밈 연구소 (Meme Lab)',
        desc: '와이드 푸틴, 레이저 눈, 코봉이 왜곡, 흑화 10단계, 3D 스피닝 짤방',
        href: paths.photo.memeLab,
        icon: <WhatshotRoundedIcon sx={{ fontSize: 28, color: '#f43f5e' }} />,
        tag: 'HOT',
        badgeColor: 'error',
      },
    ],
  },
  {
    category: '컬러 & 배경 & 보정',
    desc: '배경 투명화, Color Picker, 모자이크 등 정밀 편집 도구입니다.',
    tools: [
      {
        id: 'bg-remove',
        title: 'AI 배경 제거 (누끼 따기)',
        desc: 'WebGPU 기반 1초 만에 인물, 헤어라인, 제품 배경 100% 로컬 분리',
        href: paths.photo.bgRemove,
        icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: '#6366f1' }} />,
        tag: 'AI 추천',
        badgeColor: 'primary',
      },
      {
        id: 'padding',
        title: '여백 조정 (Padding Studio)',
        desc: '상하좌우 여백 확장, SNS 규격 자동 맞춤 & 스마트 그라데이션/블러 배경 채우기',
        href: paths.photo.padding,
        icon: <AspectRatioRoundedIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
        tag: 'NEW',
        badgeColor: 'success',
      },
      {
        id: 'color',
        title: '투명화 / 배경 지우개',
        desc: '원클릭 흰색↔투명 전환 및 스마트 페인트 통 영역 채우기',
        href: paths.photo.color,
        icon: <InvertColorsRoundedIcon sx={{ fontSize: 28, color: '#06b6d4' }} />,
      },
      {
        id: 'color-picker',
        title: 'Color Picker',
        desc: '사진 픽셀 스포이드, HEX/RGB/HSL/HSV/CMYK 정밀 색상 코드 추출 & 복사',
        href: paths.photo.colorPicker,
        icon: <ColorLensRoundedIcon sx={{ fontSize: 28, color: '#eab308' }} />,
      },
      {
        id: 'mosaic',
        title: '모자이크 & 블러 스튜디오',
        desc: '얼굴 자동 감지, 민감 정보 OCR 자동 마스킹, 브러시/도형 모자이크',
        href: paths.photo.mosaic,
        icon: <BlurOnRoundedIcon sx={{ fontSize: 28, color: '#64748b' }} />,
        tag: 'AI 인식',
        badgeColor: 'info',
      },
      {
        id: 'shape-crop',
        title: '도형 모양 자르기',
        desc: '원형, 하트, 별, 육각형, 꽃, 말풍선 형태로 사진 크롭 & 펀칭',
        href: paths.photo.shapeCrop,
        icon: <CropRotateRoundedIcon sx={{ fontSize: 28, color: '#f43f5e' }} />,
      },
      {
        id: 'ai-watermark',
        title: 'AI 워터마크 & 생성물 각인기',
        desc: 'ChatGPT, Gemini, Claude 등 AI 로고와 손그림 마커(동그라미·화살표·네모) 자유 드래그 각인',
        href: paths.photo.aiWatermark,
        icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
        tag: 'AI 추천',
        badgeColor: 'primary',
      },
      {
        id: 'watermark',
        title: '워터마크 각인기',
        desc: '텍스트, 사용자 지정 로고/도장, AI 아이콘 대각선 반복 타일 일괄 각인',
        href: paths.photo.watermark,
        icon: <BrandingWatermarkRoundedIcon sx={{ fontSize: 28, color: '#6366f1' }} />,
        tag: '추천',
        badgeColor: 'primary',
      },
      {
        id: 'scan',
        title: '스캔 효과 & 문서 스캐너',
        desc: '일반 스마트폰 촬영 문서를 선명한 평판 스캐너/복사기 룩으로 변환 & PDF 생성',
        href: paths.photo.scan,
        icon: <DocumentScannerRoundedIcon sx={{ fontSize: 28, color: '#0ea5e9' }} />,
        tag: 'NEW',
        badgeColor: 'success',
      },
      {
        id: 'flip',
        title: '상하 · 좌우 반전',
        desc: '정밀 거울 대칭 좌우/상하 반전, 90° 각도 회전, 다중 일괄 반전 & 만화경 대칭 합성',
        href: paths.photo.flip,
        icon: <SwapHorizRoundedIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
        tag: 'NEW',
        badgeColor: 'success',
      },
    ],
  },
  {
    category: '포맷 변환 & 압축 & 썸네일',
    desc: '용량 압축, 확장자 일괄 변환, GIF/PDF 제작 및 규격별 썸네일을 생성합니다.',
    tools: [
      {
        id: 'compress',
        title: '용량 압축 & 최적화',
        desc: '화질 손실 없는 고효율 용량 압축 및 Before/After 비교',
        href: paths.photo.compress,
        icon: <CompressRoundedIcon sx={{ fontSize: 28, color: '#10b981' }} />,
      },
      {
        id: 'resize',
        title: '이미지 크기 조절',
        desc: '너비/높이 픽셀 지정, 비율 유지, 확대 방지, 25%/50%/75% 및 사용자 비율 조절',
        href: paths.photo.resize,
        icon: <AspectRatioRoundedIcon sx={{ fontSize: 28, color: '#6366f1' }} />,
        tag: 'NEW',
        badgeColor: 'primary',
      },
      {
        id: 'convert',
        title: '확장자 일괄 변환',
        desc: 'PNG, JPG, WEBP, AVIF, ICO, BMP 고속 일괄 변환 & ZIP 다운로드',
        href: paths.photo.convert,
        icon: <TransformRoundedIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
      },
      {
        id: 'gif',
        title: 'GIF 편집 스튜디오',
        desc: '움짤 제작, 동영상 GIF 변환, 프레임 분할, 배경색 변경 & 속도/역재생',
        href: paths.gifStudio.root,
        icon: <GifRoundedIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />,
        tag: '추천',
        badgeColor: 'primary',
      },
      {
        id: 'pdf',
        title: 'PDF 변환 & 분할',
        desc: '이미지 다중 선택 PDF 제작(A4/Letter) 및 PDF 페이지 이미지 추출',
        href: paths.photo.pdf,
        icon: <PictureAsPdfRoundedIcon sx={{ fontSize: 28, color: '#ef4444' }} />,
      },
      {
        id: 'logo',
        title: '로고 / 정사각형 1:1 썸네일',
        desc: '정사각형 크롭 및 600x600 고해상도 앱 아이콘/프로필 생성',
        href: paths.photo.logo,
        icon: <CropSquareRoundedIcon sx={{ fontSize: 28, color: '#0ea5e9' }} />,
      },
      {
        id: 'sero',
        title: '세로 636x1048 세로 스크린샷',
        desc: '모바일 카드/숏폼/인스타 스토리 규격 일괄 스크린샷 생성',
        href: paths.photo.sero,
        icon: <PhoneAndroidRoundedIcon sx={{ fontSize: 28, color: '#84cc16' }} />,
      },
      {
        id: 'garo',
        title: '가로 1504x741 가로 스크린샷',
        desc: '유튜브/블로그/웹 배너 규격 가로 스크린샷 일괄 생성',
        href: paths.photo.garo,
        icon: <LaptopMacRoundedIcon sx={{ fontSize: 28, color: '#f97316' }} />,
      },
    ],
  },
];

export function PhotoHubView() {
  return (
    <DashboardContent>
      <Box sx={{ mb: { xs: 2.5, md: 3 }, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          이미지 편집 허브 (Photo Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          브라우저 기반 100% 안전한 고속 이미지 편집 도구 모음입니다. 서버 업로드 없이
          클라이언트에서 즉시 처리됩니다.
        </Typography>
      </Box>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {TOOL_SECTIONS.map((sec) => (
            <Box key={sec.category}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {sec.category}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {sec.desc}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {sec.tools.map((tool) => (
                  <Card
                    key={tool.id}
                    component={Link}
                    href={tool.href}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      textDecoration: 'none',
                      color: 'text.primary',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 150,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[8],
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {tool.icon}
                        </Box>
                        {tool.tag && (
                          <Chip
                            label={tool.tag}
                            size="small"
                            color={tool.badgeColor || 'primary'}
                            sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {tool.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.4 }}
                      >
                        {tool.desc}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </DashboardContent>
  );
}
