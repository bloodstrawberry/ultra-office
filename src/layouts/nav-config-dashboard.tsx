import type { NavMainProps } from './main/nav/types';
import type { NavSectionProps } from 'src/components/nav-section';

import Chip from '@mui/material/Chip';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HiveRoundedIcon from '@mui/icons-material/HiveRounded';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
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
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import DataArrayRoundedIcon from '@mui/icons-material/DataArrayRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
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
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const ICONS = {
  hub: <DashboardCustomizeRoundedIcon fontSize="small" />,
  folder: <FolderRoundedIcon fontSize="small" />,
  search: <SearchRoundedIcon fontSize="small" />,
  text: <TextFieldsRoundedIcon fontSize="small" />,
  photo: <PhotoLibraryRoundedIcon fontSize="small" />,
  gif: <GifRoundedIcon fontSize="small" />,
  drawing: <CasinoRoundedIcon fontSize="small" />,
  boardGame: <SportsEsportsRoundedIcon fontSize="small" />,
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
  translator: <TranslateRoundedIcon fontSize="small" />,
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
  chat: <ForumRoundedIcon fontSize="small" />,
  matlab: <CalculateRoundedIcon fontSize="small" />,
  blackHole: <TrackChangesRoundedIcon fontSize="small" />,
  threejs: <ViewInArRoundedIcon fontSize="small" />,
  publicApi: <ApiRoundedIcon fontSize="small" />,
  etc: <HandymanRoundedIcon fontSize="small" />,
};

const appsInTossBadge = (
  <Chip
    size="small"
    variant="soft"
    color="info"
    label="앱인토스"
    sx={{
      height: 20,
      fontSize: '0.6875rem',
      fontWeight: 700,
      pointerEvents: 'none',
      '& .MuiChip-label': { px: 0.75 },
    }}
  />
);

const newFeatureBadge = (
  <Chip
    size="small"
    variant="soft"
    color="primary"
    label="NEW"
    sx={{
      height: 20,
      fontSize: '0.6875rem',
      fontWeight: 700,
      pointerEvents: 'none',
      '& .MuiChip-label': { px: 0.75 },
    }}
  />
);

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
    items: [{ title: '전체 도구 허브', path: paths.photo.root, icon: ICONS.hub }],
  },

  /**
   * 1. Overview & Workspace
   */
  {
    subheader: 'Workspace',
    items: [
      {
        title: '사진 필터 및 효과',
        path: paths.photo.artStyle,
        icon: ICONS.imageTool,
        children: [
          { title: '화풍 변환', path: paths.photo.artStyle },
          { title: '아스키 아트', path: paths.photo.ascii },
          { title: '픽셀 아트', path: paths.photo.pixel },
          { title: '글리치 효과', path: paths.photo.glitch },
          { title: '디지털 풍화 효과', path: paths.photo.weathering },
          { title: '종합 밈 연구소', path: paths.photo.memeLab },
          { title: '인생네컷', path: paths.photo.fourCut },
        ],
      },
      {
        title: '사진 편집 스튜디오',
        path: paths.photo.root,
        icon: ICONS.photo,
        children: [
          { title: '갤럭시 & 아이폰 사진 편집', path: paths.photo.editor, info: newFeatureBadge },
          { title: '로고 만들기', path: paths.photo.logo, info: appsInTossBadge },
          { title: '배경색 변경', path: paths.photo.color, info: appsInTossBadge },
          { title: '세로 스크린샷', path: paths.photo.sero, info: appsInTossBadge },
          { title: '가로 스크린샷', path: paths.photo.garo, info: appsInTossBadge },
          { title: 'ogImage 크기 조절', path: paths.photo.ogImage, info: appsInTossBadge },
          { title: 'AI 배경 제거', path: paths.photo.bgRemove },
          { title: '워터마크 제거', path: paths.photo.watermarkRemove, info: newFeatureBadge },
          { title: '여백 조정', path: paths.photo.padding },
          { title: '스마트 OCR', path: paths.ocr },
          { title: 'Color Picker', path: paths.photo.colorPicker },
          { title: '사진 용량 압축', path: paths.photo.compress },
          { title: '이미지 크기 조절', path: paths.photo.resize },
          { title: '확장자 변환', path: paths.photo.convert },
          { title: 'SVG 변환', path: paths.photo.svg },
          { title: '상하 · 좌우 반전', path: paths.photo.flip },
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
        ],
      },
      {
        title: '동영상 편집 스튜디오',
        path: paths.videoMaster.root,
        icon: ICONS.videoMaster,
        children: [
          { title: '동영상 편집기', path: paths.videoMaster.root },
          { title: '자막 편집기', path: paths.videoMaster.subtitle },
          { title: 'MP4 → MP3 변환', path: paths.videoMaster.mp4ToMp3 },
          { title: '동영상 일괄 변환기', path: paths.videoMaster.batch },
          { title: '동영상 AI 워터마크 각인', path: paths.videoMaster.aiWatermark },
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
          { title: '다국어 번역기 (Translator)', path: paths.translator },
        ],
      },
      {
        title: '개발자 도구',
        path: paths.devTools,
        icon: ICONS.devTools,
        children: [
          { title: 'Online 컴파일러', path: paths.codeRunner },
          { title: 'VS Code 타이핑 IDE', path: paths.devToolsIde, info: newFeatureBadge },
          { title: 'SQL Lab', path: paths.public.sql },
          { title: 'Diff Checker', path: paths.compare },
          { title: '정규표현식', path: paths.text.regex },
          { title: 'Math Lab', path: paths.matlab },
          { title: 'Three.js Lab', path: paths.threejs },
          { title: '파일 변환기', path: paths.fileConvert },
          { title: '개발자 툴킷', path: paths.devTools },
          { title: 'Public API', path: paths.publicApi },
        ],
      },
      {
        title: '채팅방',
        path: paths.chat.root,
        icon: ICONS.chat,
        children: [
          { title: '메신저', path: paths.chat.messenger },
          { title: 'SNS', path: paths.chat.sns },
          { title: 'LLM', path: paths.chat.llm },
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
      {
        title: '보드게임',
        path: paths.algo.baduk,
        icon: ICONS.boardGame,
        children: [
          { title: '바둑 사활 & 묘수풀이', path: paths.algo.baduk },
          { title: '장기 박보 & 묘수풀이', path: paths.algo.janggi },
          { title: '체스 전술 & 퍼즐풀이', path: paths.algo.chess },
          { title: '오셀로 전술 & 리버시', path: paths.algo.othello },
          { title: '오목 전술 & 5목 대국', path: paths.algo.gomoku },
          { title: '피직스 알까기 (바둑/장기)', path: paths.algo.alkkagi },
        ],
      },
      {
        title: '기타 도구',
        path: paths.morse,
        icon: ICONS.etc,
        children: [
          { title: '모스 부호 변환기', path: paths.morse },
          { title: '점자(Braille) 스튜디오', path: paths.braille },
          { title: 'NATO 무선 통화표', path: paths.natoPhonetic },
          { title: '고전 암호학 스튜디오', path: paths.cipher },
          { title: '한영 타자 오타 복원기', path: paths.hangulTypo },
          { title: '금액 한글/한자 표기기', path: paths.numberWords },
          { title: '로마자 표기 변환기', path: paths.romanize },
          { title: '유닉스 타임스탬프', path: paths.timestamp },
          { title: '해군 수기 & 해상 신호기', path: paths.semaphore },
          { title: '주소 검색', path: paths.public.postcode },
          {
            title: '추첨 & 게임',
            path: paths.drawing.root,
            children: [
              { title: '사다리타기', path: paths.drawing.ladder },
              { title: '룰렛 게임', path: paths.drawing.roulette },
            ],
          },
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
