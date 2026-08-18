import type { NavMainProps } from './main/nav/types';
import type { NavSectionProps } from 'src/components/nav-section';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';

import { paths } from 'src/routes/paths';

const ICONS = {
  folder: <FolderRoundedIcon fontSize="small" />,
  practice: <AssignmentRoundedIcon fontSize="small" />,
  listening: <HeadphonesRoundedIcon fontSize="small" />,
  home: <HomeRoundedIcon fontSize="small" />,
  search: <SearchRoundedIcon fontSize="small" />,
  text: <TextFieldsRoundedIcon fontSize="small" />,
  photo: <PhotoLibraryRoundedIcon fontSize="small" />,
  drawing: <CasinoRoundedIcon fontSize="small" />,
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
        title: 'Practice',
        path: paths.practice.root,
        icon: ICONS.practice,
        children: [
          { title: '내 모의고사', path: paths.practice.myTests },
          { title: '랜덤 모의고사', path: paths.practice.randomTest },
        ],
      },
      {
        title: 'Listening',
        path: paths.listening.root,
        icon: ICONS.listening,
        children: [
          { title: 'Playlist', path: paths.listening.playlist },
          { title: '랜덤 듣기', path: paths.listening.random },
        ],
      },
      {
        title: '텍스트',
        path: paths.text.root,
        icon: ICONS.text,
        children: [
          { title: 'Diff', path: paths.text.diff },
          { title: '추출', path: paths.text.extract },
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
        children: [{ title: '주소 검색', path: paths.public.postcode }],
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
  {
    title: 'Practice',
    path: paths.practice.root,
    icon: <AssignmentRoundedIcon sx={{ width: 22, height: 22 }} />,
    children: [
      {
        subheader: 'Practice',
        items: [
          { title: '내 모의고사', path: paths.practice.myTests },
          { title: '랜덤 모의고사', path: paths.practice.randomTest },
        ],
      },
    ],
  },
  {
    title: 'Listening',
    path: paths.listening.root,
    icon: <HeadphonesRoundedIcon sx={{ width: 22, height: 22 }} />,
    children: [
      {
        subheader: 'Listening',
        items: [
          { title: 'Playlist', path: paths.listening.playlist },
          { title: '랜덤 듣기', path: paths.listening.random },
        ],
      },
    ],
  },
];
