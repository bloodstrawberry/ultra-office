'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  SCENARIO_PROMPTS,
  type AgentSession,
  type AgentQueryMode,
  generateAgentResponse,
  type AgentChatMessage,
} from '../../util/utils/ai-agent-data';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'ultra_office_agent_sessions_v1';

export function AiAgentView() {
  const [currentMode, setCurrentMode] = useState<AgentQueryMode>('talent');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Safe Hydration: Load sessions from localStorage inside useEffect
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AgentSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setCurrentMode(parsed[0].mode);
          setHasLoaded(true);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default initial session
    const initialSession: AgentSession = {
      id: 'session-default',
      title: '미래 성장동력 핵심인재 진단',
      mode: 'talent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-init-1',
          role: 'user',
          content:
            '회사의 미래 성장 동력 사업(AI, 반도체, 로봇)을 이끄는 핵심 리더 중 선제적 리텐션 조치가 필요한 대상자를 분석해 줘.',
          mode: 'talent',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-init-2',
          role: 'assistant',
          ...generateAgentResponse('리텐션', 'talent'),
          mode: 'talent',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
    setHasLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, hasLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isThinking]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isThinking) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      mode: currentMode,
      createdAt: new Date().toISOString(),
    };

    const updatedSessions = sessions.map((sess) => {
      if (sess.id === activeSessionId) {
        return {
          ...sess,
          title: sess.messages.length === 0 ? text.slice(0, 24) : sess.title,
          updatedAt: new Date().toISOString(),
          messages: [...sess.messages, userMsg],
        };
      }
      return sess;
    });

    setSessions(updatedSessions);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const resp = generateAgentResponse(text, currentMode);
      const assistantMsg: AgentChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: resp.content,
        citations: resp.citations,
        candidates: resp.candidates,
        reportMarkdown: resp.reportMarkdown,
        mode: currentMode,
        createdAt: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, assistantMsg],
            };
          }
          return sess;
        })
      );
      setIsThinking(false);
    }, 900);
  };

  const handleNewSession = () => {
    const newSess: AgentSession = {
      id: `session-${Date.now()}`,
      title: '새 대화 세션',
      mode: currentMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      toast.info('최소 1개의 대화 세션이 필요합니다.');
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
    toast.success('세션이 삭제되었습니다.');
  };

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
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          지능형 AI Agent 스위트 (Ultra AI Assistant)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사규·규정 질의, 인사 통계 분석, 인재 리텐션 진단, 원클릭 AI 경영 보고서 작성을 제공합니다.
        </Typography>
      </Box>

      {/* 4-Mode Selector Tabs */}
      <Tabs
        value={currentMode}
        onChange={(_, v) => {
          setCurrentMode(v);
          if (activeSession) {
            setSessions((prev) =>
              prev.map((s) => (s.id === activeSessionId ? { ...s, mode: v } : s))
            );
          }
        }}
        sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label="1. 핵심 인재 & 리텐션 진단"
          value="talent"
          icon={<PersonSearchRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="2. 사규 & 규정 질의"
          value="regulation"
          icon={<MenuBookRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="3. 인사 & 조직 통계"
          value="personnel"
          icon={<PeopleAltRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="4. AI 보고서 자동 생성"
          value="report"
          icon={<AssessmentRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* Main Grid: Sidebar Sessions + Chat Workstation */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2.5,
          height: 'calc(100vh - 280px)',
          minHeight: 600,
        }}
      >
        {/* Left Sessions Drawer */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddCommentRoundedIcon />}
            onClick={handleNewSession}
            sx={{ fontWeight: 700 }}
          >
            새 대화 시작
          </Button>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mt: 1 }}>
            대화 세션 목록 ({sessions.length})
          </Typography>

          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, flex: 1, overflowY: 'auto' }}
          >
            {sessions.map((sess) => {
              const isSelected = sess.id === activeSessionId;
              return (
                <Card
                  key={sess.id}
                  variant="outlined"
                  onClick={() => {
                    setActiveSessionId(sess.id);
                    setCurrentMode(sess.mode);
                  }}
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ overflow: 'hidden', mr: 1 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: isSelected ? 800 : 500 }}>
                      {sess.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {sess.messages.length}개 메시지
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(sess.id);
                    }}
                  >
                    <DeleteSweepRoundedIcon fontSize="small" />
                  </IconButton>
                </Card>
              );
            })}
          </Box>
        </Card>

        {/* Right Chat Workstation */}
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
                onClick={() => handleSendMessage(p.prompt)}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Ultra AI Agent
                        </Typography>
                      </Box>
                    )}

                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}
                    >
                      {msg.content}
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
                              borderColor:
                                cand.riskLevel === 'HIGH' ? 'error.light' : 'warning.light',
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
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #cbd5e1' }}>
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
                                bgcolor: '#ffffff',
                                borderRadius: 1,
                                border: '1px solid #e2e8f0',
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

            {isThinking && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                  width: 'fit-content',
                }}
              >
                <CircularProgress size={18} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Ultra AI Agent가 사내 지식 및 평가 데이터를 분석하고 있습니다...
                </Typography>
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
              placeholder={`${currentMode === 'talent' ? '인재 리텐션 및 역량' : currentMode === 'regulation' ? '사내 사규 및 출장/휴가 규정' : currentMode === 'report' ? '작성할 보고서 주제' : '인사 통계'}에 대해 질문하세요...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!inputQuery.trim() || isThinking}
              onClick={() => handleSendMessage()}
              sx={{ px: 3, fontWeight: 700 }}
              startIcon={<SendRoundedIcon />}
            >
              전송
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
