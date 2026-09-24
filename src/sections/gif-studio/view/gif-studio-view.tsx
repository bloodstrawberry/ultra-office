'use client';

import { useState } from 'react';

import { GifStudioBgView } from './gif-studio-bg-view';
import { GifStudioSplitView } from './gif-studio-split-view';
import { GifStudioSpeedView } from './gif-studio-speed-view';
import { GifStudioVideoView } from './gif-studio-video-view';
import { GifStudioCreateView } from './gif-studio-create-view';
import { GifStudioResizeView } from './gif-studio-resize-view';

// ----------------------------------------------------------------------

export type GifStudioTabType = 'create' | 'video' | 'resize' | 'split' | 'bg' | 'speed';

interface GifStudioViewProps {
  initialTab?: GifStudioTabType;
}

// ----------------------------------------------------------------------

export function GifStudioView({ initialTab = 'create' }: GifStudioViewProps) {
  const [currentTab] = useState<GifStudioTabType>(initialTab);

  switch (currentTab) {
    case 'video':
      return <GifStudioVideoView />;
    case 'resize':
      return <GifStudioResizeView />;
    case 'split':
      return <GifStudioSplitView />;
    case 'bg':
      return <GifStudioBgView />;
    case 'speed':
      return <GifStudioSpeedView />;
    case 'create':
    default:
      return <GifStudioCreateView />;
  }
}
