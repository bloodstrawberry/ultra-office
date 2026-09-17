'use client';

import { CONFIG } from 'src/global-config';

/**
 * Returns static asset paths as standard absolute paths with CONFIG.assetsDir support.
 */
export function getAssetPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (CONFIG.assetsDir || '').trim();
  return `${base}${cleanPath}`;
}
