import type { NavListProps, NavSubListProps, NavItemDataProps } from '../types';

import { useBoolean } from 'minimal-shared/hooks';
import { useRef, useEffect, useCallback } from 'react';
import { isActiveLink, isExternalLink } from 'minimal-shared/utils';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

import { usePathname } from 'src/routes/hooks';

import { useToolFavorites } from 'src/hooks/use-tool-favorites';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../styles';
import { NavUl, NavLi, NavCollapse } from '../components';

// ----------------------------------------------------------------------

function isChildActive(items: NavItemDataProps[] | undefined, pathname: string): boolean {
  if (!items || items.length === 0) return false;
  return items.some((item) => {
    if (isActiveLink(pathname, item.path, item.deepMatch ?? false)) {
      return true;
    }
    if (item.children) {
      return isChildActive(item.children, pathname);
    }
    return false;
  });
}

export function NavList({
  data,
  depth,
  render,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
}: NavListProps) {
  const pathname = usePathname();
  const { favorites, toggleFavorite } = useToolFavorites();
  const navItemRef = useRef<HTMLButtonElement>(null);

  const hasActiveChild = data.children ? isChildActive(data.children, pathname) : false;
  const isSelfActive = isActiveLink(pathname, data.path, data.deepMatch ?? false);
  const isActive = hasActiveChild || isSelfActive;

  const { value: open, onTrue: onOpen, onFalse: onClose, onToggle } = useBoolean(isActive);

  useEffect(() => {
    if (isActive) {
      onOpen();
    } else {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isActive]);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      onToggle();
    }
  }, [data.children, onToggle]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      // slots
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      // state
      open={open}
      active={isActive}
      disabled={data.disabled}
      // options
      depth={depth}
      render={render}
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      enabledRootRedirect={enabledRootRedirect}
      // styles
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      // actions
      onClick={handleToggleMenu}
    />
  );

  const renderCollapse = () =>
    !!data.children && (
      <NavCollapse mountOnEnter unmountOnExit depth={depth} in={open} data-group={data.title}>
        <NavSubList
          data={data.children}
          render={render}
          depth={depth}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          enabledRootRedirect={enabledRootRedirect}
        />
      </NavCollapse>
    );

  // Hidden item by role
  if (data.allowedRoles && checkPermissions && checkPermissions(data.allowedRoles)) {
    return null;
  }

  return (
    <NavLi
      disabled={data.disabled}
      sx={{
        position: 'relative',
        ...(!!data.children && {
          [`& .${navSectionClasses.li}`]: {
            '&:first-of-type': { mt: 'var(--nav-item-gap)' },
          },
        }),
      }}
    >
      {data.favoriteEnabled ? (
        <>
          <div className="nav-favorite-link" style={{ paddingRight: 30 }}>
            {renderNavItem()}
          </div>
          <Tooltip title={favorites.includes(data.path) ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
            <IconButton
              className="nav-favorite-toggle"
              size="small"
              aria-label={`${data.title} ${favorites.includes(data.path) ? '즐겨찾기 해제' : '즐겨찾기 추가'}`}
              aria-pressed={favorites.includes(data.path)}
              onClick={() => toggleFavorite(data.path)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 0,
                width: 28,
                height: 28,
                color: favorites.includes(data.path) ? 'warning.main' : 'text.disabled',
                '&:hover': { color: 'warning.main' },
              }}
            >
              {favorites.includes(data.path) ? (
                <StarRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <StarBorderRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </>
      ) : (
        renderNavItem()
      )}
      {renderCollapse()}
    </NavLi>
  );
}

// ----------------------------------------------------------------------

function NavSubList({
  data,
  render,
  depth = 0,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
}: NavSubListProps) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {data.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={depth + 1}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
