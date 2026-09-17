'use client';

import '../styles.css';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import GameView from '../components/game-view';
import HomeView from '../components/home-view';
import BgmPlayer from '../components/bgm-player';
import ToastContainer from '../components/toast-container';
import InitialAssetLoader from '../components/initial-asset-loader';
import { AssetLoaderProvider } from '../components/asset-loader-context';

// ----------------------------------------------------------------------

export function VeryHardPuzzleView() {
  const [mode, setMode] = useState<'home' | 'game' | 'editor'>('home');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'game' || urlMode === 'editor') {
        setMode(urlMode);
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

    window.addEventListener('very-hard-puzzle-go-home', handleGoHome);
    return () => {
      window.removeEventListener('very-hard-puzzle-go-home', handleGoHome);
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
        className="very-hard-puzzle-root"
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
          {mode === 'game' && <GameView isEditor={false} />}
          {mode === 'editor' && <GameView isEditor />}
          <ToastContainer />
        </AssetLoaderProvider>
      </Box>
    </DashboardContent>
  );
}
