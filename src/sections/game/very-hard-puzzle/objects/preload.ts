'use client';

import { useState } from 'react';

export const ALL_BLOCK_IMAGE_PATHS: readonly string[] = [];

export function preloadAllBlockImages(): Promise<void> {
  return Promise.resolve();
}

export function useBlockImagesPreloader(): boolean {
  const [isLoaded] = useState<boolean>(true);
  return isLoaded;
}
