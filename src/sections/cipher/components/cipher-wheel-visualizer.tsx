'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface CipherWheelVisualizerProps {
  shift: number;
}

export function CipherWheelVisualizer({ shift }: CipherWheelVisualizerProps) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const anglePerLetter = 360 / 26;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          width: { xs: 200, sm: 240 },
          height: { xs: 200, sm: 240 },
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer Wheel (Fixed Plaintext Alphabet A-Z) */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: (theme) => `2px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows?.z8,
          }}
        >
          {letters.map((char, idx) => {
            const angle = idx * anglePerLetter - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 98; // radius
            const x = 110 + r * Math.cos(rad);
            const y = 110 + r * Math.sin(rad);

            return (
              <Typography
                key={`outer-${char}`}
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  color: 'primary.main',
                }}
              >
                {char}
              </Typography>
            );
          })}
        </Box>

        {/* Inner Rotating Wheel (Ciphertext Alphabet with Shift) */}
        <Box
          sx={{
            width: '68%',
            height: '68%',
            borderRadius: '50%',
            bgcolor: 'background.neutral',
            border: (theme) => `2px dashed ${theme.palette.warning.main}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transform: `rotate(${shift * anglePerLetter}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 2,
          }}
        >
          {letters.map((char, idx) => {
            const angle = idx * anglePerLetter - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 62;
            const x = 75 + r * Math.cos(rad);
            const y = 75 + r * Math.sin(rad);

            return (
              <Typography
                key={`inner-${char}`}
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  color: 'warning.dark',
                }}
              >
                {char}
              </Typography>
            );
          })}

          {/* Center Hub Badge */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.85rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transform: `rotate(-${shift * anglePerLetter}deg)`,
              transition: 'transform 0.3s ease',
            }}
          >
            +{shift}
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5, fontWeight: 700 }}>
        바깥쪽: 평문(Plaintext) ⇄ 안쪽: 암호문(Ciphertext, 시프트: {shift})
      </Typography>
    </Box>
  );
}
