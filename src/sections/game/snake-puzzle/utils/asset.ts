'use client';

/**
 * Returns static asset paths as standard absolute paths (e.g. "/images/title.png").
 * In Apps-in-Toss production build, scripts/post-build.js automatically rewrites
 * these paths in HTML/JS/CSS output to the exact relative depth required by the webview.
 */
export function getAssetPath(path: string): string {
  if (!path) return path;
  return path;
}
