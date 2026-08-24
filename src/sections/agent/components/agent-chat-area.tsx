'use client';

import type { ModelOption } from '../utils/llm-engine';

import { toast } from 'sonner';
import React, { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';

import {
  SCENARIO_PROMPTS,
  type AgentSession,
  type AgentQueryMode,
} from '../../util/utils/ai-agent-data';

// ----------------------------------------------------------------------

interface AgentChatAreaProps {
  currentMode: AgentQueryMode;
  activeSession?: AgentSession;
  selectedModel: ModelOption;
  inputQuery: string;
  setInputQuery: (v: string) => void;
  isGenerating: boolean;
  isModelLoading: boolean;
  onSendMessage: (text?: string) => void;
  onStopGenerating: () => void;
}

export function AgentChatArea({
  currentMode,
  activeSession,
  selectedModel,
  inputQuery,
  setInputQuery,
  isGenerating,
  isModelLoading,
  onSendMessage,
  onStopGenerating,
}: AgentChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isGenerating]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('복사 실패');
    }
  };

  const handleDownloadReport = (md: string) => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AI_Strategy_Report_2026.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('보고서 파일이 다운로드되었습니다.');
  };

  const modePrompts = SCENARIO_PROMPTS.filter((p) => p.mode === currentMode);

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Preset Prompts Row */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 0.5, flexShrink: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            alignSelf: 'center',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          💡 추천 질문:
        </Typography>
        {modePrompts.map((p) => (
          <Chip
            key={p.id}
            label={p.title}
            size="small"
            onClick={() => onSendMessage(p.prompt)}
            clickable
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 1.5, fontWeight: 600, whiteSpace: 'nowrap' }}
          />
        ))}
      </Box>

      {/* Messages Scroll Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          pr: 1,
        }}
      >
        {activeSession?.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  maxWidth: isUser ? '80%' : '100%',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isUser ? 'primary.main' : 'background.neutral',
                  color: isUser ? 'primary.contrastText' : 'text.primary',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {!isUser && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Ultra On-Device AI Agent
                      </Typography>
                    </Box>
                    <Chip
                      label={selectedModel.name}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                    />
                  </Box>
                )}

                <Typography variant="body2" sx={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
                  {msg.content || (isGenerating && msg.id.startsWith('assistant') ? '...' : '')}
                </Typography>

                {/* Candidate Diagnosis Cards */}
                {msg.candidates && msg.candidates.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                      gap: 1.5,
                      mt: 2,
                    }}
                  >
                    {msg.candidates.map((cand) => (
                      <Card
                        key={cand.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: cand.riskLevel === 'HIGH' ? 'error.light' : 'warning.light',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {cand.name}
                          </Typography>
                          <Chip
                            label={`이탈위험: ${cand.riskLevel}`}
                            size="small"
                            color={cand.riskLevel === 'HIGH' ? 'error' : 'warning'}
                            sx={{ fontWeight: 800, height: 22 }}
                          />
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {cand.department} · {cand.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            display: 'block',
                            mb: 1,
                          }}
                        >
                          {cand.experience}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'error.dark', display: 'block' }}
                        >
                          ⚠️ 처우 리스크:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                        >
                          {cand.compensationDiagnosis}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'success.dark', display: 'block' }}
                        >
                          💡 권장 리텐션 패키지:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {cand.retentionRecommendation}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                )}

                {/* Report View */}
                {msg.reportMarkdown && (
                  <Card sx={{ p: 2.5, mt: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 800, color: 'primary.main' }}
                      >
                        📊 생성된 보고서 전문
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyRoundedIcon />}
                          onClick={() => handleCopy(msg.reportMarkdown || '')}
                        >
                          보고서 복사
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<DownloadRoundedIcon />}
                          onClick={() => handleDownloadReport(msg.reportMarkdown || '')}
                        >
                          .MD 다운로드
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.neutral',
                        borderRadius: 1.5,
                        maxHeight: 360,
                        overflowY: 'auto',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                      >
                        {msg.reportMarkdown}
                      </Typography>
                    </Box>
                  </Card>
                )}

                {/* Evidences / Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <BookmarkBorderRoundedIcon fontSize="small" /> 참고 근거 및 사규 인용 (
                      {msg.citations.length}건):
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {msg.citations.map((c) => (
                        <Box
                          key={c.id}
                          sx={{
                            p: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: 'primary.main' }}
                          >
                            [{c.source}] {c.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            {c.content}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}

        {isGenerating && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              bgcolor: 'background.neutral',
              borderRadius: 2,
              width: 'fit-content',
            }}
          >
            <CircularProgress size={18} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              온디바이스 LLM이 토큰을 실시간 생성하고 있습니다...
            </Typography>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<StopCircleRoundedIcon />}
              onClick={onStopGenerating}
              sx={{ ml: 1, height: 26, fontSize: 11 }}
            >
              생성 중단
            </Button>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Chat Input Bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 2,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={`${currentMode === 'talent' ? '인재 리텐션 및 역량' : currentMode === 'regulation' ? '사내 사규 및 출장/휴가 규정' : currentMode === 'report' ? '작성할 보고서 주제' : '인사 통계'}에 대해 온디바이스 LLM에 질문하세요...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={isGenerating || isModelLoading}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!inputQuery.trim() || isGenerating || isModelLoading}
          onClick={() => onSendMessage()}
          sx={{ px: 3, fontWeight: 700 }}
          startIcon={<SendRoundedIcon />}
        >
          전송
        </Button>
      </Box>
    </Card>
  );
}
