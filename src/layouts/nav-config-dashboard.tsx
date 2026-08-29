import type { NavMainProps } from './main/nav/types';
import type { NavSectionProps } from 'src/components/nav-section';

import GifRoundedIcon from '@mui/icons-material/GifRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import HiveRoundedIcon from '@mui/icons-material/HiveRounded';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import Grid4x4RoundedIcon from '@mui/icons-material/Grid4x4Rounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ApprovalRoundedIcon from '@mui/icons-material/ApprovalRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import DataArrayRoundedIcon from '@mui/icons-material/DataArrayRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import WorkspacesRoundedIcon from '@mui/icons-material/WorkspacesRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PhotoFilterRoundedIcon from '@mui/icons-material/PhotoFilterRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import InvertColorsRoundedIcon from '@mui/icons-material/InvertColorsRounded';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const ICONS = {
  folder: <FolderRoundedIcon fontSize="small" />,
  search: <SearchRoundedIcon fontSize="small" />,
  text: <TextFieldsRoundedIcon fontSize="small" />,
  photo: <PhotoLibraryRoundedIcon fontSize="small" />,
  gif: <GifRoundedIcon fontSize="small" />,
  drawing: <CasinoRoundedIcon fontSize="small" />,
  compare: <CompareArrowsRoundedIcon fontSize="small" />,
  imageTool: <PhotoFilterRoundedIcon fontSize="small" />,
  agent: <AutoAwesomeRoundedIcon fontSize="small" />,
  spreadsheet: <TableViewRoundedIcon fontSize="small" />,
  fileConvert: <SwapHorizontalCircleRoundedIcon fontSize="small" />,
  pdfMaster: <PictureAsPdfRoundedIcon fontSize="small" />,
  ocr: <DocumentScannerRoundedIcon fontSize="small" />,
  bgRemove: <InvertColorsRoundedIcon fontSize="small" />,
  diagram: <AccountTreeRoundedIcon fontSize="small" />,
  schedule: <CalendarMonthRoundedIcon fontSize="small" />,
  devTools: <TerminalRoundedIcon fontSize="small" />,
  codeRunner: <CodeRoundedIcon fontSize="small" />,
  barcode: <QrCodeScannerRoundedIcon fontSize="small" />,
  mathGraph: <FunctionsRoundedIcon fontSize="small" />,
  docMaster: <DescriptionRoundedIcon fontSize="small" />,
  powerpoint: <SlideshowRoundedIcon fontSize="small" />,
  hwpMaster: <ArticleRoundedIcon fontSize="small" />,
  markdown: <DescriptionRoundedIcon fontSize="small" />,
  office365: <WorkspacesRoundedIcon fontSize="small" />,
  stampStudio: <ApprovalRoundedIcon fontSize="small" />,
  screenRecorder: <VideocamRoundedIcon fontSize="small" />,
  videoMaster: <MovieCreationRoundedIcon fontSize="small" />,
  gigaViewer: <StorageRoundedIcon fontSize="small" />,
  privacySanitizer: <SecurityRoundedIcon fontSize="small" />,
  logicLab: <MemoryRoundedIcon fontSize="small" />,
  algoVisualizer: <SchemaRoundedIcon fontSize="small" />,
  bitLab: <DataArrayRoundedIcon fontSize="small" />,
  linearAlgebra: <Grid4x4RoundedIcon fontSize="small" />,
  physicsSandbox: <ScienceRoundedIcon fontSize="small" />,
  normalDistribution: <AutoGraphRoundedIcon fontSize="small" />,
  montyHall: <MeetingRoomRoundedIcon fontSize="small" />,
  fractalsChaos: <AllInclusiveRoundedIcon fontSize="small" />,
  cellularAutomata: <HiveRoundedIcon fontSize="small" />,
  waveOptics: <WavesRoundedIcon fontSize="small" />,
  monteCarlo: <ScatterPlotRoundedIcon fontSize="small" />,
  appsInToss: <AppsRoundedIcon fontSize="small" />,
  matlab: <CalculateRoundedIcon fontSize="small" />,
  blackHole: <TrackChangesRoundedIcon fontSize="small" />,
  threejs: <ViewInArRoundedIcon fontSize="small" />,
};

// ----------------------------------------------------------------------

/**
 * Input nav data is an array of navigation section items used to define the structure and content of a navigation bar.
 * Each section contains a subheader and an array of items, which can include nested children items.
 */
export const navData: NavSectionProps['data'] = [
  /**
   * 0. Hub / Overview
   */
  {
    items: [{ title: '전체 도구 허브', path: paths.photo.root, icon: ICONS.photo }],
  },

  /**
   * 1. Overview & Workspace
   */
  {
    subheader: 'Workspace',
    items: [
      {
        title: '앱인토스',
        path: paths.photo.logo,
        icon: ICONS.appsInToss,
        children: [
          { title: '로고 만들기', path: paths.photo.logo },
          { title: '배경색 변경', path: paths.photo.color },
          { title: '세로 스크린샷', path: paths.photo.sero },
          { title: '가로 스크린샷', path: paths.photo.garo },
        ],
      },
      {
        title: '사진 편집 스튜디오',
        path: paths.photo.root,
        icon: ICONS.photo,
        children: [
          { title: 'AI 배경 제거', path: paths.photo.bgRemove },
          { title: '스마트 OCR', path: paths.ocr },
          { title: '화풍 변환', path: paths.photo.artStyle },
          { title: '아스키 아트', path: paths.photo.ascii },
          { title: '픽셀 아트', path: paths.photo.pixel },
          { title: '글리치 효과', path: paths.photo.glitch },
          { title: '디지털 풍화 효과', path: paths.photo.weathering },
          { title: '종합 밈 연구소', path: paths.photo.memeLab },
          { title: '대충 · 하찮은 그림', path: paths.photo.doodle },
          { title: '인생네컷', path: paths.photo.fourCut },
          { title: '스포이드 색상 추출', path: paths.photo.colorPicker },
          { title: '사진 용량 압축', path: paths.photo.compress },
          { title: '확장자 변환', path: paths.photo.convert },
          { title: '도형 자르기', path: paths.photo.shapeCrop },
          { title: '모자이크 & 블러', path: paths.photo.mosaic },
          { title: 'AI 워터마크 각인', path: paths.photo.aiWatermark },
          { title: '워터마크 각인', path: paths.photo.watermark },
          { title: '스캔 효과 · 문서 스캐너', path: paths.photo.scan },
          { title: 'PDF 스튜디오', path: paths.photo.pdf },
        ],
      },
      {
        title: 'GIF 편집 스튜디오',
        path: paths.gifStudio.root,
        icon: ICONS.gif,
        children: [
          { title: '움짤 (GIF) 만들기', path: paths.gifStudio.create },
          { title: '동영상 → GIF 변환', path: paths.gifStudio.video },
          { title: 'GIF 프레임 분할 · 추출', path: paths.gifStudio.split },
          { title: 'GIF 배경색 변경 · 투명화', path: paths.gifStudio.bg },
          { title: 'GIF 속도 조절 & 역재생', path: paths.gifStudio.speed },
          { title: 'GIF 합치기 · 이어붙이기', path: paths.gifStudio.merge },
        ],
      },
      {
        title: '오피스 365',
        path: paths.docMaster,
        icon: ICONS.office365,
        children: [
          { title: '워드 (Word Processor)', path: paths.docMaster },
          { title: '파워 포인트 (Power Point)', path: paths.powerpoint },
          { title: '스프레드시트 (Excel)', path: paths.spreadsheet },
          { title: '마크다운', path: paths.markdown },
          { title: '한글 파일 문서', path: paths.hwpMaster },
        ],
      },
      {
        title: '개발자 도구',
        path: paths.devTools,
        icon: ICONS.devTools,
        children: [
          { title: 'Three.js 3D 랩', path: paths.threejs },
          { title: '코드 실행기', path: paths.codeRunner },
          { title: 'MATLAB 랩 (Web Studio)', path: paths.matlab },
          { title: 'SQL 연습실', path: paths.public.sql },
          { title: '정규표현식', path: paths.text.regex },
          { title: '개발자 툴킷', path: paths.devTools },
        ],
      },
      {
        title: '알고리즘',
        path: paths.algo.root,
        icon: ICONS.algoVisualizer,
        children: [
          { title: '알고리즘 시각화 랩', path: paths.algo.visualizer },
          { title: '자료구조 도감 & 실습실', path: paths.algo.dataStructures },
          { title: '1:1 알고리즘 비교', path: paths.algo.compare },
          { title: 'CS 챌린지 모드', path: paths.algo.challenge },
          { title: '커스텀 코드 샌드박스', path: paths.algo.playground },
          { title: 'Big-O 마스터 & 카탈로그', path: paths.algo.catalog },
        ],
      },
    ],
  },

  /**
   * 2. 문서 & 데이터 분석
   */
  {
    subheader: 'Document & Data',
    items: [
      { title: '수식 그래프 시각화', path: paths.mathGraph, icon: ICONS.mathGraph },
      { title: '데이터 & 코드 비교', path: paths.compare, icon: ICONS.compare },
      {
        title: '텍스트 도구',
        path: paths.text.root,
        icon: ICONS.text,
        children: [
          { title: 'Diff 비교', path: paths.text.diff },
          { title: '텍스트 추출', path: paths.text.extract },
          { title: '텍스트 변환', path: paths.text.transform },
        ],
      },
    ],
  },

  /**
   * 3. 수학 · 과학 & 컴퓨터 사이언스
   */
  {
    subheader: 'Sci-Math & CS',
    items: [
      { title: '디지털 논리회로 랩', path: paths.logicLab, icon: ICONS.logicLab },
      { title: '비트 & IEEE-754 랩', path: paths.bitLab, icon: ICONS.bitLab },
      { title: '선형대수 & 공간 변환', path: paths.linearAlgebra, icon: ICONS.linearAlgebra },
      { title: '2D 물리 & 과학 샌드박스', path: paths.physicsSandbox, icon: ICONS.physicsSandbox },
      {
        title: '정규분포 & 확률통계 랩',
        path: paths.normalDistribution,
        icon: ICONS.normalDistribution,
      },
      {
        title: '몬티홀 & 확률 역설 랩',
        path: paths.montyHall,
        icon: ICONS.montyHall,
      },
      {
        title: '프랙탈 & 카오스 랩',
        path: paths.fractalsChaos,
        icon: ICONS.fractalsChaos,
      },
      {
        title: '셀룰러 오토마타 & 라이프 게임',
        path: paths.cellularAutomata,
        icon: ICONS.cellularAutomata,
      },
      {
        title: '파동, 광학 & 푸리에 랩',
        path: paths.waveOptics,
        icon: ICONS.waveOptics,
      },
      {
        title: '몬테카를로 & 기하 확률 랩',
        path: paths.monteCarlo,
        icon: ICONS.monteCarlo,
      },
      {
        title: '블랙홀 & 일반 상대성 이론',
        path: paths.blackHole,
        icon: ICONS.blackHole,
      },
    ],
  },

  /**
   * 4. PDF & 파일 변환
   */
  {
    subheader: 'PDF & File',
    items: [
      { title: '전자 도장 · 직인 스튜디오', path: paths.stampStudio, icon: ICONS.stampStudio },
      { title: 'PDF 마스터', path: paths.pdfMaster, icon: ICONS.pdfMaster },
      { title: '파일 변환기', path: paths.fileConvert, icon: ICONS.fileConvert },
    ],
  },

  /**
   * 5. 그래픽 & 미디어 디자인
   */
  {
    subheader: 'Graphic & Media',
    items: [
      {
        title: '동영상 편집 스튜디오',
        path: paths.videoMaster,
        icon: ICONS.videoMaster,
      },
      { title: '다이어그램', path: paths.diagram, icon: ICONS.diagram },
      { title: '이미지 툴킷', path: paths.imageTool, icon: ICONS.imageTool },
    ],
  },

  /**
   * 6. 비즈니스 & 생산성
   */
  {
    subheader: 'Productivity & Utilities',
    items: [
      { title: '일정 & 간트차트', path: paths.schedule, icon: ICONS.schedule },
      { title: 'QR & 바코드', path: paths.barcode, icon: ICONS.barcode },
      { title: '주소 검색', path: paths.public.postcode, icon: ICONS.search },
      {
        title: '추첨 & 게임',
        path: paths.drawing.root,
        icon: ICONS.drawing,
        children: [
          { title: '사다리타기', path: paths.drawing.ladder },
          { title: '룰렛 게임', path: paths.drawing.roulette },
        ],
      },
    ],
  },

  /**
   * 7. 보류
   */
  {
    subheader: '보류',
    items: [
      { title: 'Drive', path: paths.fileManager, icon: ICONS.folder },
      { title: 'AI Agent', path: paths.agent, icon: ICONS.agent },
      {
        title: '개인정보 마스킹 · EXIF 파기',
        path: paths.privacySanitizer,
        icon: ICONS.privacySanitizer,
      },
      { title: '대용량 로그 & CSV 뷰어', path: paths.gigaViewer, icon: ICONS.gigaViewer },
      {
        title: '화면 & 웹캠 녹화 스튜디오',
        path: paths.screenRecorder,
        icon: ICONS.screenRecorder,
      },
    ],
  },
];

// ----------------------------------------------------------------------

export const mainNavData: NavMainProps['data'] = [
  { title: 'Home', path: '/', icon: <HomeRoundedIcon sx={{ width: 22, height: 22 }} /> },
  {
    title: 'AI Agent',
    path: paths.agent,
    icon: <AutoAwesomeRoundedIcon sx={{ width: 22, height: 22 }} />,
  },
  {
    title: '스프레드시트',
    path: paths.spreadsheet,
    icon: <TableViewRoundedIcon sx={{ width: 22, height: 22 }} />,
  },
  {
    title: 'PDF 마스터',
    path: paths.pdfMaster,
    icon: <PictureAsPdfRoundedIcon sx={{ width: 22, height: 22 }} />,
  },
  {
    title: '데이터 비교',
    path: paths.compare,
    icon: <CompareArrowsRoundedIcon sx={{ width: 22, height: 22 }} />,
  },
  {
    title: 'Drive',
    path: paths.fileManager,
    icon: <FolderRoundedIcon sx={{ width: 22, height: 22 }} />,
  },
];
