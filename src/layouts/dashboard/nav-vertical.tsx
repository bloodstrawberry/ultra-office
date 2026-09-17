import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';
import { navSectionClasses } from 'src/components/nav-section/styles';
import { ManualResizeHandle } from 'src/components/resizable/manual-resize-handle';

import { layoutClasses } from '../core';
import { NavTime } from '../components/nav-time';

// ----------------------------------------------------------------------

export type NavVerticalProps = React.ComponentProps<'div'> &
  NavSectionProps & {
    isNavMini: boolean;
    layoutQuery?: Breakpoint;
    onToggleNav: () => void;
    onResize?: (delta: number) => void;
    slots?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
  };

export function NavVertical({
  sx,
  data,
  slots,
  cssVars,
  className,
  isNavMini,
  onToggleNav,
  onResize,
  checkPermissions,
  layoutQuery = 'md',
  ...other
}: NavVerticalProps) {
  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx}
      {...other}
    >
      {slots?.topArea ?? (
        <Box
          sx={{
            pl: 3.5,
            pt: 2.5,
            pb: 1,
            pr: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {!isNavMini && <Logo />}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {!isNavMini && (
              <NavTime
                sx={{ '--nav-time-digit-height': 'clamp(14px, calc(20cqw - 34px), 26px)' }}
              />
            )}
            <Tooltip title={isNavMini ? '내비게이션 펼치기' : '내비게이션 접기'}>
              <IconButton
                size="small"
                onClick={onToggleNav}
                aria-label="내비게이션 접기 또는 펼치기"
              >
                {isNavMini ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          checkPermissions={checkPermissions}
          sx={{ px: 2, flex: '1 1 auto' }}
        />

        {slots?.bottomArea}
      </Scrollbar>

      {!isNavMini && (
        <ManualResizeHandle
          direction="horizontal"
          ariaLabel="내비게이션 너비 조절"
          onDrag={(delta) => onResize?.(delta)}
          sx={{
            position: 'absolute',
            top: 0,
            right: -5,
            height: '100%',
            zIndex: 2,
          }}
        />
      )}
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

const NavRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})<Pick<NavVerticalProps, 'isNavMini' | 'layoutQuery'>>(
  ({ isNavMini, layoutQuery = 'md', theme }) => ({
    top: 0,
    left: 0,
    height: '100%',
    display: 'none',
    containerType: 'inline-size',
    position: 'fixed',
    flexDirection: 'column',
    zIndex: 'var(--layout-nav-zIndex)',
    backgroundColor: 'var(--layout-nav-bg)',
    width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
    borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
    transition: theme.transitions.create(['width'], {
      easing: 'var(--layout-transition-easing)',
      duration: 'var(--layout-transition-duration)',
    }),
    ...(isNavMini && {
      [`& .${navSectionClasses.subheader}, & .${navSectionClasses.item.texts}, & .${navSectionClasses.item.info}, & .${navSectionClasses.item.arrow}`]:
        {
          display: 'none',
        },
      [`& .${navSectionClasses.item.root}`]: {
        justifyContent: 'center',
        paddingLeft: 0,
        paddingRight: 0,
      },
      [`& .${navSectionClasses.item.icon}`]: { margin: 0 },
      '[data-group]': { display: 'none' },
    }),
    [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
  })
);
