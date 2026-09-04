'use client';

import React from 'react';
import { DashboardContent } from 'src/layouts/dashboard';
import { ChatStudioContainer } from '../components/chat-studio-container';

export function ChatLlmView() {
  return (
    <DashboardContent
      maxWidth={false}
      disablePadding
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        p: 0,
        overflow: 'hidden',
      }}
    >
      <ChatStudioContainer category="llm" defaultThemeId="chatgpt_web" />
    </DashboardContent>
  );
}
