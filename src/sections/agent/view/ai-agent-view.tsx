'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  SCENARIO_PROMPTS,
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

export function AiAgentView() {
  const [currentMode, setCurrentMode] = useState<AgentQueryMode>('talent');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isGeneratingRef = useRef<boolean>(false);

  // Check WebGPU Support on client mount
  useEffect(() => {
    async function detectHardware() {
      const res = await checkWebGPUSupport();
      setWebGpuInfo(res);
      if (!res.supported) {
        // Automatically switch to CPU model if WebGPU is not supported
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isThinking, isGenerating]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];
  const modelReady = isLLMReady() && getActiveModelId() === selectedModelId;

  /**
   * Initialize / Load selected LLM model into browser memory (GPU or CPU)
   */
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

  /**
   * Send Message and trigger streaming inference on local GPU/CPU
   */
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isThinking || isGenerating || isModelLoading) return;

    // 1. Ensure Model is loaded
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
      // Build Prompt with System Knowledge
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

      // Stream generation
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

      // Post-process rich components if relevant
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

      // Fallback to intelligent local rule-based response
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
      <Card
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <MemoryRoundedIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                온디바이스 LLM 모델:
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 300 } }}>
              <Select
                value={selectedModelId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedModelId(newId);
                  setLoadingProgress({
                    text: '모델 변경됨 ([모델 시작] 클릭 또는 질문 입력 시 로드)',
                    progress: 0,
                    phase: 'idle',
                  });
                }}
                disabled={isModelLoading || isGenerating}
                sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Chip
                        size="small"
                        label={m.engine === 'webgpu' ? 'GPU' : 'CPU'}
                        color={m.engine === 'webgpu' ? 'primary' : 'secondary'}
                        sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                        ({m.size})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip
              size="small"
              label={`메모리: ${selectedModel.vram} | ${selectedModel.description}`}
              variant="outlined"
              sx={{ display: { xs: 'none', md: 'inline-flex' }, fontSize: 11 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant={modelReady ? 'outlined' : 'contained'}
              color={modelReady ? 'success' : 'primary'}
              size="small"
              startIcon={
                isModelLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : modelReady ? (
                  <CheckCircleRoundedIcon />
                ) : (
                  <PlayCircleFilledWhiteRoundedIcon />
                )
              }
              onClick={() => handleLoadModel()}
              disabled={isModelLoading || isGenerating}
              sx={{ fontWeight: 700, px: 2, whiteSpace: 'nowrap' }}
            >
              {isModelLoading
                ? '가중치 다운로드 중...'
                : modelReady
                  ? '모델 준비완료 (Ready)'
                  : '모델 브라우저 로드'}
            </Button>
          </Box>
        </Box>

        {/* Model Loading Progress Bar */}
        {(isModelLoading ||
          loadingProgress.phase === 'downloading' ||
          loadingProgress.phase === 'compiling') && (
          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ⏳ {loadingProgress.text}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {Math.round(loadingProgress.progress * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.round(loadingProgress.progress * 100)}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontSize: 11 }}
            >
              💡 최초 1회만 브라우저 로컬 캐시(CacheStorage)에 저장되며, 이후에는 재다운로드 없이
              즉시 로드됩니다.
            </Typography>
          </Box>
        )}
      </Card>

      {/* 4-Mode Selector Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
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
                    flexShrink: 0,
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

                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}
                    >
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
                  onClick={handleStopGenerating}
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
                  handleSendMessage();
                }
              }}
              disabled={isGenerating || isModelLoading}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!inputQuery.trim() || isGenerating || isModelLoading}
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
