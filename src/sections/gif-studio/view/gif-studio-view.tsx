'use client';

import { useState } from 'react';

import { GifStudioBgView } from './gif-studio-bg-view';
import { GifStudioSplitView } from './gif-studio-split-view';
import { GifStudioSpeedView } from './gif-studio-speed-view';
import { GifStudioVideoView } from './gif-studio-video-view';
import { GifStudioMergeView } from './gif-studio-merge-view';
import { GifStudioCreateView, type CreateClipItem } from './gif-studio-create-view';

// ----------------------------------------------------------------------

export type GifStudioTabType = 'create' | 'video' | 'split' | 'bg' | 'speed' | 'merge';

export type { CreateClipItem };

interface GifStudioViewProps {
  initialTab?: GifStudioTabType;
}

// ----------------------------------------------------------------------

export function GifStudioView({ initialTab = 'create' }: GifStudioViewProps) {
  const [currentTab] = useState<GifStudioTabType>(initialTab);

  switch (currentTab) {
    case 'video':
      return <GifStudioVideoView />;
    case 'split':
      return <GifStudioSplitView />;
    case 'bg':
      return <GifStudioBgView />;
    case 'speed':
      return <GifStudioSpeedView />;
    case 'merge':
      return <GifStudioMergeView />;
    case 'create':
    default:
      return <GifStudioCreateView />;
  }
}
