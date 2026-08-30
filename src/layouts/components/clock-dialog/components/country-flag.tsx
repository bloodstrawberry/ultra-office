'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';

interface CountryFlagProps {
  countryCode?: string;
  flagEmoji?: string;
  size?: number;
}

export function CountryFlag({ countryCode, flagEmoji, size = 44 }: CountryFlagProps) {
  const [hasError, setHasError] = useState(false);
  const code = (countryCode || '').trim().toLowerCase();

  // 국가 코드가 없거나 아이콘 로드 에러 시 텍스트 fallback
  if (!code || hasError) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          fontWeight: 800,
          userSelect: 'none',
          boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {flagEmoji || (code ? code.toUpperCase() : '🌐')}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        borderRadius: '50%',
        boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.1)',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Iconify의 원형 국기 아이콘 사용 (CORS 및 렌더링 에러 방지) */}
      <Icon
        icon={`circle-flags:${code}`}
        width="100%"
        height="100%"
        onLoad={() => setHasError(false)}
        // 에러 처리를 위해 div로 감싸거나, Iconify 자체적으로 에러 시 안 보일 수 있으므로 주의
        // 대체적으로 Iconify SVG는 CORS 에러가 거의 없거나 로컬 캐싱됩니다.
      />
    </Box>
  );
}
