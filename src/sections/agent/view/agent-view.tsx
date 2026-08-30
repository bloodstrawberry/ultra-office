'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { AgentChatArea } from '../components/agent-chat-area';
import { AgentModelControl } from '../components/agent-model-control';
import { AgentSessionSidebar } from '../components/agent-session-sidebar';
import {
  type AgentSession,
  type AgentQueryMode,
  generateAgentResponse,
  type AgentChatMessage,
  buildAgentSystemPrompt,
} from '../../util/utils/ai-agent-data';
import {
  isLLMReady,
  initializeLLM,
  AVAILABLE_MODELS,
  type ModelOption,
  getActiveModelId,
  checkWebGPUSupport,
  streamChatResponse,
  type LoadingProgress,
} from '../utils/llm-engine';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'ultra_office_agent_sessions_v2';

export function AgentView() {
  const [currentMode, setCurrentMode] = useState<AgentQueryMode>('talent');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Hardware and LLM Model State
  const [webGpuInfo, setWebGpuInfo] = useState<{ supported: boolean; message: string }>({
    supported: false,
    message: '하드웨어 상태 확인 중...',
  });
  const [selectedModelId, setSelectedModelId] = useState<string>(AVAILABLE_MODELS[0].id);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    text: '모델 미로드 (질문 시 자동 로드 또는 [모델 시작] 클릭)',
    progress: 0,
    phase: 'idle',
  });
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);

  const isGeneratingRef = useRef<boolean>(false);

  // Check WebGPU Support on client mount
  useEffect(() => {
    async function detectHardware() {
      const res = await checkWebGPUSupport();
      setWebGpuInfo(res);
      if (!res.supported) {
        const cpuModel = AVAILABLE_MODELS.find((m) => m.engine === 'cpu');
        if (cpuModel) {
          setSelectedModelId(cpuModel.id);
        }
      }
    }
    detectHardware();
  }, []);

  // Safe Hydration: Load sessions from localStorage
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

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];
  const modelReady = isLLMReady() && getActiveModelId() === selectedModelId;

  const handleLoadModel = async (targetModel?: ModelOption) => {
    const model = targetModel || selectedModel;
    if (isModelLoading) return;

    setIsModelLoading(true);
    try {
      toast.info(`[${model.name}] 가중치를 브라우저에 로드합니다...`);
      await initializeLLM(model, (prog) => {
        setLoadingProgress(prog);
      });
      toast.success(`[${model.name}] 온디바이스 LLM이 준비되었습니다!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`모델 로드 중 오류가 발생했습니다: ${msg}`);
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isThinking || isGenerating || isModelLoading) return;

    if (!modelReady) {
      toast.info('온디바이스 LLM 모델을 먼저 로드합니다. 잠시만 기다려 주세요...');
      try {
        await handleLoadModel();
      } catch {
        toast.error('모델 로드에 실패하여 추론을 시작할 수 없습니다.');
        return;
      }
    }

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      mode: currentMode,
      createdAt: new Date().toISOString(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: AgentChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      mode: currentMode,
      createdAt: new Date().toISOString(),
    };

    const updatedSessions = sessions.map((sess) => {
      if (sess.id === activeSessionId) {
        return {
          ...sess,
          title: sess.messages.length === 0 ? text.slice(0, 24) : sess.title,
          updatedAt: new Date().toISOString(),
          messages: [...sess.messages, userMsg, initialAssistantMsg],
        };
      }
      return sess;
    });

    setSessions(updatedSessions);
    setInputQuery('');
    setIsGenerating(true);
    isGeneratingRef.current = true;

    try {
      const systemPrompt = buildAgentSystemPrompt(currentMode);
      const conversationHistory = (activeSession?.messages || []).slice(-4).map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }));

      const messagesForLLM = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory,
        { role: 'user' as const, content: text.trim() },
      ];

      const fullGenerated = await streamChatResponse(messagesForLLM, (_chunk, accumulated) => {
        if (!isGeneratingRef.current) return;

        setSessions((prev) =>
          prev.map((sess) => {
            if (sess.id === activeSessionId) {
              const msgs = sess.messages.map((m) => {
                if (m.id === assistantMsgId) {
                  return { ...m, content: accumulated };
                }
                return m;
              });
              return { ...sess, messages: msgs };
            }
            return sess;
          })
        );
      });

      const mockEnrichment = generateAgentResponse(text, currentMode);
      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === activeSessionId) {
            const msgs = sess.messages.map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content: fullGenerated || mockEnrichment.content,
                  citations: mockEnrichment.citations,
                  candidates: mockEnrichment.candidates,
                  reportMarkdown:
                    currentMode === 'report'
                      ? fullGenerated || mockEnrichment.reportMarkdown
                      : undefined,
                };
              }
              return m;
            });
            return { ...sess, messages: msgs };
          }
          return sess;
        })
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Inference Error:', err);
      toast.error(`추론 중 오류가 발생했습니다: ${errMsg}`);

      const fallbackResp = generateAgentResponse(text, currentMode);
      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === activeSessionId) {
            const msgs = sess.messages.map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content: `[로컬 폴백 응답]\n\n${fallbackResp.content}`,
                  citations: fallbackResp.citations,
                  candidates: fallbackResp.candidates,
                  reportMarkdown: fallbackResp.reportMarkdown,
                };
              }
              return m;
            });
            return { ...sess, messages: msgs };
          }
          return sess;
        })
      );
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const handleStopGenerating = () => {
    isGeneratingRef.current = false;
    setIsGenerating(false);
    toast.info('답변 생성을 중단했습니다.');
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

  return (
    <DashboardContent>
      {/* Header Info */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                지능형 온디바이스 AI Agent 스위트
              </Typography>
              <Chip
                icon={<LockOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label="100% 무료 & 로컬 프라이버시"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              서버 비용 및 API 키 없이 웹 브라우저(GPU/CPU)에서 직접 실행되는 오픈소스 LLM
              비서입니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<SpeedRoundedIcon sx={{ fontSize: '15px !important' }} />}
              label={webGpuInfo.supported ? '⚡ WebGPU 가속 가능' : '💻 CPU WASM 모드'}
              color={webGpuInfo.supported ? 'primary' : 'default'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Model & Acceleration Toolbar Card */}
      <AgentModelControl
        selectedModelId={selectedModelId}
        onSelectModelId={(newId) => {
          setSelectedModelId(newId);
          setLoadingProgress({
            text: '모델 변경됨 ([모델 시작] 클릭 또는 질문 입력 시 로드)',
            progress: 0,
            phase: 'idle',
          });
        }}
        selectedModel={selectedModel}
        modelReady={modelReady}
        isModelLoading={isModelLoading}
        isGenerating={isGenerating}
        loadingProgress={loadingProgress}
        onLoadModel={handleLoadModel}
      />

      {/* 4-Mode Selector Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentMode}
          onChange={(_, v: AgentQueryMode) => {
            setCurrentMode(v);
            if (activeSession) {
              setSessions((prev) =>
                prev.map((s) => (s.id === activeSessionId ? { ...s, mode: v } : s))
              );
            }
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
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
      </Box>

      {/* Main Grid: Sidebar Sessions + Chat Workstation */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2.5,
          flex: '1 1 auto',
          minHeight: 0,
          pb: 2,
        }}
      >
        <AgentSessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id, mode) => {
            setActiveSessionId(id);
            setCurrentMode(mode);
          }}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
        />

        <AgentChatArea
          currentMode={currentMode}
          activeSession={activeSession}
          selectedModel={selectedModel}
          inputQuery={inputQuery}
          setInputQuery={setInputQuery}
          isGenerating={isGenerating}
          isModelLoading={isModelLoading}
          onSendMessage={handleSendMessage}
          onStopGenerating={handleStopGenerating}
        />
      </Box>
    </DashboardContent>
  );
}
