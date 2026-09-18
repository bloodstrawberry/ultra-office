'use client';

import '../styles.css';
import '../tailwind.css';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import HomeView from '../home-view';
import BgmPlayer from '../components/bgm-player';
import ToastContainer from '../components/toast-container';
import SnakebirdGameView from '../game/snakebird-game-view';
import SnakebirdEditorView from '../game/snakebird-editor-view';
import InitialAssetLoader from '../components/initial-asset-loader';
import { AssetLoaderProvider } from '../components/asset-loader-context';

// ----------------------------------------------------------------------

export interface SnakePuzzleViewProps {
  initialMode?: 'home' | 'game' | 'editor';
}

export function SnakePuzzleView({ initialMode = 'home' }: SnakePuzzleViewProps) {
  const [mode, setMode] = useState<'home' | 'game' | 'editor'>(initialMode);
  const [initialLevelIndex, setInitialLevelIndex] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const stageParam = params.get('stage');

      if (urlMode === 'game' || urlMode === 'editor') {
        setMode(urlMode);
      }
      if (stageParam) {
        const parsed = parseInt(stageParam, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setInitialLevelIndex(parsed - 1);
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleGoHome = () => {
      setMode('home');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('mode');
        url.searchParams.delete('stage');
        window.history.replaceState(null, '', url.pathname);
      }
    };

    window.addEventListener('snake-puzzle-go-home', handleGoHome);
    return () => {
      window.removeEventListener('snake-puzzle-go-home', handleGoHome);
    };
  }, []);

  return (
    <DashboardContent
      maxWidth={false}
      disablePadding
      sx={{
        flex: '1 1 auto',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        className="snake-puzzle-root"
        sx={{
          position: 'relative',
          isolation: 'isolate',
          width: '100%',
          flex: '1 1 auto',
          height: '100%',
          minHeight: 'calc(100vh - var(--layout-header-mobile-height, 64px))',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden',
        }}
      >
        <AssetLoaderProvider>
          <InitialAssetLoader />
          <BgmPlayer />
          {mode === 'home' && <HomeView onNavigate={(nextMode) => setMode(nextMode)} />}
          {mode === 'game' && (
            <SnakebirdGameView
              initialLevelIndex={initialLevelIndex}
              onNavigateHome={() => setMode('home')}
            />
          )}
          {mode === 'editor' && <SnakebirdEditorView onNavigateHome={() => setMode('home')} />}
          <ToastContainer />
        </AssetLoaderProvider>
      </Box>
    </DashboardContent>
  );
}
