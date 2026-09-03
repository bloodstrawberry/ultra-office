import 'src/global.css';
import 'src/utils/suppress-warnings';

import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { CONFIG } from 'src/global-config';
import { themeConfig, ThemeProvider } from 'src/theme';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'Ultra Office',
  description: 'Ultra Office PWA Application',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ultra Office',
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    {
      rel: 'icon',
      url: `${CONFIG.assetsDir}/favicon.ico`,
    },
    {
      rel: 'apple-touch-icon',
      url: `${CONFIG.assetsDir}/logo/logo-single.png`,
    },
  ],
};

// ----------------------------------------------------------------------

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
        />
        {/* Force unregister any existing service workers to fix OOM issues from previous next-pwa installs */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // React 19 & React DevTools 내부 버그 (Suspense async info 경고) 콘솔 차단
              (function() {
                if (typeof window !== 'undefined') {
                  window.suppressReactDevtoolsAsyncBoundaryWarning = true;
                  var isSuspenseBug = function(msg) {
                    if (!msg) return false;
                    var str = typeof msg === 'string' ? msg : msg.message || msg.stack || String(msg);
                    return str.indexOf('We are cleaning up async info') !== -1 || str.indexOf('parent Suspense boundary') !== -1;
                  };
                  if (window.console) {
                    var origError = console.error;
                    console.error = function() {
                      for (var i = 0; i < arguments.length; i++) {
                        if (isSuspenseBug(arguments[i])) return;
                      }
                      return origError.apply(console, arguments);
                    };
                    var origWarn = console.warn;
                    console.warn = function() {
                      for (var i = 0; i < arguments.length; i++) {
                        if (isSuspenseBug(arguments[i])) return;
                      }
                      return origWarn.apply(console, arguments);
                    };
                  }
                  window.addEventListener(
                    'error',
                    function(e) {
                      if (isSuspenseBug(e.message) || isSuspenseBug(e.error)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return true;
                      }
                    },
                    true
                  );
                  window.addEventListener(
                    'unhandledrejection',
                    function(e) {
                      if (isSuspenseBug(e.reason)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                      }
                    },
                    true
                  );
                }
              })();

              // 기존 service worker 및 캐시 전체 해제 (OOM 방지)
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
              // 오래된 캐시 삭제 (누적된 캐시가 OOM 원인이 될 수 있음)
              if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                  cacheNames.forEach(function(cacheName) {
                    caches.delete(cacheName);
                  });
                });
              }

              window.addEventListener('beforeinstallprompt', (e) => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (!isMobile) {
                  e.preventDefault();
                }
              });

              // 모바일 환경에서만 manifest를 로드하여 PC(크롬) 주소창의 설치 버튼을 원천 차단합니다.
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (isMobile) {
                const link = document.createElement('link');
                link.rel = 'manifest';
                link.href = '${CONFIG.assetsDir}/manifest.json';
                document.head.appendChild(link);
              }
            `,
          }}
        />
      </head>
      <body>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.defaultMode}
        />

        <AppRouterCacheProvider options={{ key: 'css' }}>
          <ThemeProvider
            modeStorageKey={themeConfig.modeStorageKey}
            defaultMode={themeConfig.defaultMode}
          >
            <Snackbar />
            <Suspense fallback={null}>
              <ProgressBar />
            </Suspense>
            <Suspense fallback={null}>{children}</Suspense>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
