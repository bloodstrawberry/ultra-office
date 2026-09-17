'use client';

import '../styles.css';
import '../tailwind.css';

import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import HomeView from '../home-view';
import GameView from '../game/game-view';
import BgmPlayer from '../components/bgm-player';
import ToastContainer from '../components/toast-container';
import InitialAssetLoader from '../components/initial-asset-loader';
import { AssetLoaderProvider } from '../components/asset-loader-context';

export function DeliveryView({ mode = 'home' }: { mode?: 'home' | 'game' | 'editor' }) {
  return (
    <DashboardContent maxWidth={false} disablePadding sx={{ flex: '1 1 auto', height: '100%', minHeight: 0 }}>
      <Box
        className="delivery-root"
        sx={{
          position: 'relative',
          isolation: 'isolate',
          width: '100%',
          height: '100%',
          minHeight: 'calc(100vh - var(--layout-header-mobile-height, 64px))',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'url(/delivery/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
        }}
      >
        <AssetLoaderProvider>
          <InitialAssetLoader />
          <BgmPlayer />
          {mode === 'home' && <HomeView />}
          {mode === 'game' && <GameView />}
          {mode === 'editor' && <GameView isEditor />}
          <ToastContainer />
        </AssetLoaderProvider>
      </Box>
    </DashboardContent>
  );
}
