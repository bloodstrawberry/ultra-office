import type { NavMainProps } from './main/nav/types';
import type { NavSectionProps } from 'src/components/nav-section';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import PhotoFilterRoundedIcon from '@mui/icons-material/PhotoFilterRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';

import { paths } from 'src/routes/paths';

const ICONS = {
  folder: <FolderRoundedIcon fontSize="small" />,
  home: <HomeRoundedIcon fontSize="small" />,
  search: <SearchRoundedIcon fontSize="small" />,
  text: <TextFieldsRoundedIcon fontSize="small" />,
  photo: <PhotoLibraryRoundedIcon fontSize="small" />,
  drawing: <CasinoRoundedIcon fontSize="small" />,
  compare: <CompareArrowsRoundedIcon fontSize="small" />,
  imageTool: <PhotoFilterRoundedIcon fontSize="small" />,
  agent: <AutoAwesomeRoundedIcon fontSize="small" />,
  spreadsheet: <TableViewRoundedIcon fontSize="small" />,
  fileConvert: <SwapHorizontalCircleRoundedIcon fontSize="small" />,
  pdfMaster: <PictureAsPdfRoundedIcon fontSize="small" />,
  ocr: <DocumentScannerRoundedIcon fontSize="small" />,
  diagram: <AccountTreeRoundedIcon fontSize="small" />,
  schedule: <CalendarMonthRoundedIcon fontSize="small" />,
  devTools: <TerminalRoundedIcon fontSize="small" />,
  barcode: <QrCodeScannerRoundedIcon fontSize="small" />,
};

// ----------------------------------------------------------------------

/**
 * Input nav data is an array of navigation section items used to define the structure and content of a navigation bar.
 * Each section contains a subheader and an array of items, which can include nested children items.
 *
 * Each item can have the following properties:
 * - `title`: The title of the navigation item.
 * - `path`: The URL path the item links to.
 * - `icon`: An optional icon component to display alongside the title.
 * - `info`: Optional additional information to display, such as a label.
 * - `allowedRoles`: An optional array of roles that are allowed to see the item.
 * - `caption`: An optional caption to display below the title.
 * - `children`: An optional array of nested navigation items.
 * - `disabled`: An optional boolean to disable the item.
 * - `deepMatch`: An optional boolean to indicate if the item should match subpaths.
 */
export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Home', path: paths.home, icon: ICONS.home },
      { title: 'Drive', path: paths.fileManager, icon: ICONS.folder },
      {
        title: 'AI Agent',
        path: paths.agent,
        icon: ICONS.agent,
      },
      {
        title: '스프레드시트',
        path: paths.spreadsheet,
        icon: ICONS.spreadsheet,
      },
      {
        title: '데이터 비교',
        path: paths.compare,
        icon: ICONS.compare,
      },
      {
        title: '이미지 도구',
        path: paths.imageTool,
        icon: ICONS.imageTool,
      },
      {
        title: 'PDF 마스터',
        path: paths.pdfMaster,
        icon: ICONS.pdfMaster,
      },
      {
        title: '스마트 OCR',
        path: paths.ocr,
        icon: ICONS.ocr,
      },
      {
        title: '조직도 & 마인드맵',
        path: paths.diagram,
        icon: ICONS.diagram,
      },
      {
        title: '일정 & 간트차트',
        path: paths.schedule,
        icon: ICONS.schedule,
      },
      {
        title: '개발자 툴킷',
        path: paths.devTools,
        icon: ICONS.devTools,
      },
      {
        title: 'QR & 바코드',
        path: paths.barcode,
        icon: ICONS.barcode,
      },
      {
        title: '파일 변환',
        path: paths.fileConvert,
        icon: ICONS.fileConvert,
      },
      {
        title: '텍스트',
        path: paths.text.root,
        icon: ICONS.text,
        children: [
          { title: 'Diff 비교', path: paths.text.diff },
          { title: '텍스트 추출', path: paths.text.extract },
          { title: '텍스트 변환', path: paths.text.transform },
        ],
      },
      {
        title: '이미지 편집',
        path: paths.photo.root,
        icon: ICONS.photo,
        children: [
          { title: '전체 도구 허브', path: paths.photo.root },
          { title: '화풍 변환', path: paths.photo.artStyle },
          { title: '아스키 아트', path: paths.photo.ascii },
          { title: '픽셀 아트', path: paths.photo.pixel },
          { title: '글리치 효과', path: paths.photo.glitch },
          { title: '인생네컷', path: paths.photo.fourCut },
          { title: '배경색 변경', path: paths.photo.color },
          { title: '스포이드 색상 추출', path: paths.photo.colorPicker },
          { title: '사진 용량 압축', path: paths.photo.compress },
          { title: '확장자 변환', path: paths.photo.convert },
          { title: '도형 자르기', path: paths.photo.shapeCrop },
          { title: '모자이크 & 블러', path: paths.photo.mosaic },
          { title: '워터마크 각인', path: paths.photo.watermark },
          { title: 'GIF 스튜디오', path: paths.photo.gif },
          { title: 'PDF 스튜디오', path: paths.photo.pdf },
          { title: '로고 만들기', path: paths.photo.logo },
          { title: '세로 썸네일', path: paths.photo.sero },
          { title: '가로 썸네일', path: paths.photo.garo },
        ],
      },
      {
        title: 'Public',
        path: paths.public.root,
        icon: ICONS.search,
        children: [
          { title: '주소 검색', path: paths.public.postcode },
          { title: 'SQL 연습', path: paths.public.sql },
        ],
      },
      {
        title: 'Drawing',
        path: paths.drawing.root,
        icon: ICONS.drawing,
        children: [
          { title: '사다리', path: paths.drawing.ladder },
          { title: '룰렛', path: paths.drawing.roulette },
        ],
      },
    ],
  },
];

// ----------------------------------------------------------------------

export const mainNavData: NavMainProps['data'] = [
  { title: 'Home', path: '/', icon: <HomeRoundedIcon sx={{ width: 22, height: 22 }} /> },
  {
    title: 'Drive',
    path: paths.fileManager,
    icon: <FolderRoundedIcon sx={{ width: 22, height: 22 }} />,
  },
];
