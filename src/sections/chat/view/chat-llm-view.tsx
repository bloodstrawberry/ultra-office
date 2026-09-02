'use client';

import React from 'react';
import { ChatStudioContainer } from '../components/chat-studio-container';

export function ChatLlmView() {
  return <ChatStudioContainer category="llm" defaultThemeId="chatgpt" />;
}
