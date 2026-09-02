'use client';

import React, { useState } from 'react';
import { toast } from 'src/components/snackbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { INITIAL_PRESETS } from '../constants/presets';
import type {
  ChatData,
  ChatMessage,
  ChatUser,
  ChatRoomConfig,
  ChatCategory,
  DeviceType,
  NetworkType,
} from '../types';

interface ChatEditorDrawerProps {
  open: boolean;
  onClose: () => void;
  data: ChatData;
  onChange: (newData: ChatData) => void;
  category: ChatCategory;
}

export function ChatEditorDrawer({
  open,
  onClose,
  data,
  onChange,
  category,
}: ChatEditorDrawerProps) {
  const [activeTab, setActiveTab] = useState(0);

  // 메시지 신규/수정 폼 상태
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [msgSenderId, setMsgSenderId] = useState<string>('me');
  const [msgText, setMsgText] = useState<string>('');
  const [msgTime, setMsgTime] = useState<string>('오후 2:30');
  const [msgUnreadCount, setMsgUnreadCount] = useState<number>(0);
  const [msgIsRead, setMsgIsRead] = useState<boolean>(true);
  const [msgIsSystem, setMsgIsSystem] = useState<boolean>(false);
  const [msgThoughtText, setMsgThoughtText] = useState<string>('');
  const [msgCodeLang, setMsgCodeLang] = useState<string>('typescript');
  const [msgCodeText, setMsgCodeText] = useState<string>('');
  const [msgReactionEmoji, setMsgReactionEmoji] = useState<string>('');
  const [msgReactionCount, setMsgReactionCount] = useState<number>(1);
  const [msgMediaUrl, setMsgMediaUrl] = useState<string>('');
  const [msgReplySender, setMsgReplySender] = useState<string>('');
  const [msgReplyText, setMsgReplyText] = useState<string>('');

  // 신규 참가자 상태
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'other' | 'bot'>('other');
  const [newUserTitle, setNewUserTitle] = useState<string>('');

  // 이미지 파일 업로드 (Base64 변환)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMsgMediaUrl(result);
        toast.success('이미지가 첨부되었습니다.');
      }
    };
    reader.readAsDataURL(file);
  };

  // 클립보드 이미지 붙여넣기 (Ctrl + V) 핸들러
  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              setMsgMediaUrl(result);
              toast.success('클립보드의 이미지가 첨부되었습니다!');
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  // 클립보드에서 직접 이미지 읽어오기 버튼 핸들러
  const handleReadFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast.info('Ctrl + V 단축키로 이미지를 붙여넣어 주세요.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              setMsgMediaUrl(result);
              toast.success('클립보드의 이미지가 첨부되었습니다!');
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      toast.error('클립보드에 복사된 이미지가 없습니다.');
    } catch (err) {
      console.warn('Clipboard read error:', err);
      toast.info('이미지 영역을 클릭하고 Ctrl + V 를 눌러 붙여넣으세요.');
    }
  };

  // 1. 메시지 추가/수정 처리
  const handleSaveMessage = () => {
    if (
      !msgText.trim() &&
      !msgThoughtText.trim() &&
      !msgCodeText.trim() &&
      !msgMediaUrl.trim() &&
      !msgIsSystem
    )
      return;

    const reactionsObj = msgReactionEmoji.trim()
      ? { [msgReactionEmoji.trim()]: Number(msgReactionCount) || 1 }
      : undefined;

    const codeObj = msgCodeText.trim()
      ? { language: msgCodeLang || 'text', code: msgCodeText }
      : undefined;

    const replyObj =
      msgReplySender.trim() && msgReplyText.trim()
        ? { senderName: msgReplySender.trim(), text: msgReplyText.trim() }
        : undefined;

    if (editingMessageId) {
      // 수정
      const updatedMessages = data.messages.map((m) => {
        if (m.id === editingMessageId) {
          return {
            ...m,
            senderId: msgSenderId,
            text: msgText,
            time: msgTime,
            unreadCount: msgUnreadCount,
            isRead: msgIsRead,
            isSystem: msgIsSystem,
            mediaUrl: msgMediaUrl.trim() || undefined,
            mediaType: msgMediaUrl.trim() ? ('image' as const) : undefined,
            thoughtText: msgThoughtText || undefined,
            codeSnippet: codeObj,
            reactions: reactionsObj,
            replyTo: replyObj,
          };
        }
        return m;
      });
      onChange({ ...data, messages: updatedMessages });
      setEditingMessageId(null);
    } else {
      // 신규 추가
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: msgSenderId,
        text: msgText,
        time: msgTime,
        unreadCount: msgUnreadCount,
        isRead: msgIsRead,
        isSystem: msgIsSystem,
        mediaUrl: msgMediaUrl.trim() || undefined,
        mediaType: msgMediaUrl.trim() ? ('image' as const) : undefined,
        thoughtText: msgThoughtText || undefined,
        codeSnippet: codeObj,
        reactions: reactionsObj,
        replyTo: replyObj,
      };
      onChange({ ...data, messages: [...data.messages, newMsg] });
    }

    // 폼 초기화
    setMsgText('');
    setMsgThoughtText('');
    setMsgCodeText('');
    setMsgReactionEmoji('');
    setMsgMediaUrl('');
    setMsgReplySender('');
    setMsgReplyText('');
  };

  const handleEditMessageClick = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setMsgSenderId(msg.senderId);
    setMsgText(msg.text);
    setMsgTime(msg.time || '');
    setMsgUnreadCount(msg.unreadCount ?? 0);
    setMsgIsRead(Boolean(msg.isRead));
    setMsgIsSystem(Boolean(msg.isSystem));
    setMsgMediaUrl(msg.mediaUrl || '');
    setMsgThoughtText(msg.thoughtText || '');
    setMsgCodeLang(msg.codeSnippet?.language || 'typescript');
    setMsgCodeText(msg.codeSnippet?.code || '');
    setMsgReplySender(msg.replyTo?.senderName || '');
    setMsgReplyText(msg.replyTo?.text || '');
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      const [emoji, cnt] = Object.entries(msg.reactions)[0];
      setMsgReactionEmoji(emoji);
      setMsgReactionCount(cnt);
    } else {
      setMsgReactionEmoji('');
      setMsgReactionCount(1);
    }
  };

  const handleDeleteMessage = (id: string) => {
    onChange({
      ...data,
      messages: data.messages.filter((m) => m.id !== id),
    });
    if (editingMessageId === id) {
      setEditingMessageId(null);
    }
  };

  const handleMoveMessage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.messages.length) return;
    const newMessages = [...data.messages];
    const [moved] = newMessages.splice(index, 1);
    newMessages.splice(targetIndex, 0, moved);
    onChange({ ...data, messages: newMessages });
  };

  // 2. 유저 관리
  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    const newUser: ChatUser = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole,
      title: newUserTitle.trim() || undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newUserName)}`,
    };
    onChange({
      ...data,
      users: [...data.users, newUser],
    });
    setNewUserName('');
    setNewUserTitle('');
  };

  const handleDeleteUser = (id: string) => {
    onChange({
      ...data,
      users: data.users.filter((u) => u.id !== id),
    });
  };

  // 3. 방 환경설정 변경 헬퍼
  const handleConfigChange = (patch: Partial<ChatRoomConfig>) => {
    onChange({
      ...data,
      config: {
        ...data.config,
        ...patch,
      },
    });
  };

  // 4. 프리셋 로드
  const handleLoadPreset = (presetKey: string) => {
    const preset = INITIAL_PRESETS[category]?.[presetKey];
    if (preset) {
      onChange(JSON.parse(JSON.stringify(preset)));
    }
  };

  // 5. JSON 내보내기 & 가져오기
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-mockup-${data.config.themeId}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.config && parsed.users && parsed.messages) {
          onChange(parsed);
        }
      } catch (err) {
        console.error('JSON 파싱 오류:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 460 },
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* 상단 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditRoundedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            채팅방 편집 스튜디오
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* 탭 네비게이션 */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="fullWidth"
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Tab label="메시지 관리" />
        <Tab label="참가자" />
        <Tab label="환경 & 기기" />
        <Tab label="프리셋/저장" />
      </Tabs>

      {/* 내부 스크롤 콘텐츠 본문 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {/* 탭 0: 메시지 관리 */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 메시지 작성/수정 카드 */}
            <Card
              variant="outlined"
              onPaste={handlePasteImage}
              sx={{
                p: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                {editingMessageId ? '✏️ 메시지 수정' : '➕ 새 메시지 추가'}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* 발신자 선택 */}
                <TextField
                  select
                  size="small"
                  label="발신자 (Sender)"
                  value={msgSenderId}
                  onChange={(e) => setMsgSenderId(e.target.value)}
                >
                  <MenuItem value="system">🔔 시스템 / 날짜 공지</MenuItem>
                  {data.users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.role === 'me'
                        ? `[나] ${u.name}`
                        : u.role === 'bot'
                          ? `[AI] ${u.name}`
                          : u.name}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 메시지 내용 */}
                <TextField
                  multiline
                  minRows={2}
                  maxRows={4}
                  size="small"
                  label="메시지 본문"
                  placeholder="대화 내용을 입력하세요 (클립보드 이미지는 Ctrl+V로 바로 첨부)"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onPaste={handlePasteImage}
                />

                {/* 🖼️ 이미지 첨부 UI (파일 업로드, 클립보드 붙여넣기, URL) */}
                <Box
                  onPaste={handlePasteImage}
                  tabIndex={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px dashed',
                    borderColor: msgMediaUrl ? 'primary.main' : 'divider',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    outline: 'none',
                    '&:focus': {
                      borderColor: 'primary.main',
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.750' : 'grey.200'),
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      🖼️ 사진 첨부{' '}
                      <span style={{ fontSize: 10, color: '#888', fontWeight: 400 }}>
                        (Ctrl+V 지원)
                      </span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleReadFromClipboard}
                        sx={{ fontSize: 11, py: 0.2, px: 0.8 }}
                      >
                        📋 붙여넣기
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        component="label"
                        sx={{ fontSize: 11, py: 0.2, px: 0.8 }}
                      >
                        파일 선택
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                    </Box>
                  </Box>

                  <TextField
                    size="small"
                    placeholder="또는 이미지 URL 직접 입력 (https://...)"
                    value={msgMediaUrl}
                    onChange={(e) => setMsgMediaUrl(e.target.value)}
                    onPaste={handlePasteImage}
                    sx={{ fontSize: 12 }}
                  />

                  {msgMediaUrl && (
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 120,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        component="img"
                        src={msgMediaUrl}
                        alt="미리보기"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setMsgMediaUrl('')}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                          p: 0.5,
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/* 💬 답장(Reply) 인용 설정 */}
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    💬 답장(Reply) 인용 표시 (선택)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      label="답장 대상자 이름"
                      placeholder="예: 김장현"
                      value={msgReplySender}
                      onChange={(e) => setMsgReplySender(e.target.value)}
                      sx={{ width: 140 }}
                    />
                    <TextField
                      size="small"
                      label="인용할 원본 메시지"
                      placeholder="예: 남현 그친구분은 자막은 직접다시나?"
                      value={msgReplyText}
                      onChange={(e) => setMsgReplyText(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* 시간 & 안읽음 & 읽음 상태 */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    size="small"
                    label="전송 시각"
                    value={msgTime}
                    onChange={(e) => setMsgTime(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="number"
                    size="small"
                    label="안읽음(카톡1)"
                    value={msgUnreadCount}
                    onChange={(e) => setMsgUnreadCount(Number(e.target.value))}
                    sx={{ width: 100 }}
                  />
                </Box>

                {/* LLM 전용 필드: Thinking & Code */}
                {category === 'llm' && (
                  <>
                    <TextField
                      multiline
                      minRows={1}
                      maxRows={3}
                      size="small"
                      label="LLM Thinking (사고 과정)"
                      placeholder="사고 과정 텍스트"
                      value={msgThoughtText}
                      onChange={(e) => setMsgThoughtText(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        label="코드 언어"
                        value={msgCodeLang}
                        onChange={(e) => setMsgCodeLang(e.target.value)}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        multiline
                        minRows={1}
                        maxRows={3}
                        size="small"
                        label="코드 스니펫"
                        placeholder="코드 내용"
                        value={msgCodeText}
                        onChange={(e) => setMsgCodeText(e.target.value)}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </>
                )}

                {/* 이모지 리액션 */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="리액션 이모지 (예: ❤️, 👍)"
                    value={msgReactionEmoji}
                    onChange={(e) => setMsgReactionEmoji(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="number"
                    size="small"
                    label="개수"
                    value={msgReactionCount}
                    onChange={(e) => setMsgReactionCount(Number(e.target.value))}
                    sx={{ width: 80 }}
                  />
                </Box>

                {/* 버튼 그룹 */}
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSaveMessage}
                    startIcon={<AddRoundedIcon />}
                  >
                    {editingMessageId ? '수정 완료' : '메시지 등록'}
                  </Button>
                  {editingMessageId && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => setEditingMessageId(null)}
                    >
                      취소
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>

            {/* 현재 등록된 메시지 목록 (순서 변경/수정/삭제) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                💬 등록된 메시지 ({data.messages.length}개)
              </Typography>

              {data.messages.map((m, idx) => {
                const sender = data.users.find((u) => u.id === m.senderId);
                const senderLabel = m.isSystem
                  ? '공지'
                  : sender?.role === 'me'
                    ? '나'
                    : sender?.name || m.senderId;

                return (
                  <Card
                    key={m.id}
                    variant="outlined"
                    sx={{
                      p: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: editingMessageId === m.id ? 'action.selected' : 'background.paper',
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, mr: 1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          [{senderLabel}]
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {m.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" noWrap sx={{ fontSize: 13 }}>
                        {m.text || (m.codeSnippet ? '[코드 블록]' : '[메시지]')}
                      </Typography>
                    </Box>

                    {/* 제어 버튼: 위/아래, 수정, 삭제 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <IconButton
                        size="small"
                        disabled={idx === 0}
                        onClick={() => handleMoveMessage(idx, 'up')}
                      >
                        <ArrowUpwardRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={idx === data.messages.length - 1}
                        onClick={() => handleMoveMessage(idx, 'down')}
                      >
                        <ArrowDownwardRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditMessageClick(m)}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteMessage(m.id)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 탭 1: 참가자 관리 */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                ➕ 새 참가자 추가
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="이름 (닉네임)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <TextField
                  select
                  size="small"
                  label="역할"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'other' | 'bot')}
                >
                  <MenuItem value="other">상대방 / 대화 참여자</MenuItem>
                  <MenuItem value="bot">AI 어시스턴트 / 봇</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  label="직급 / 소속 (Knox 등)"
                  placeholder="예: 수석연구원, 기획팀"
                  value={newUserTitle}
                  onChange={(e) => setNewUserTitle(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddUser} startIcon={<AddRoundedIcon />}>
                  참가자 추가
                </Button>
              </Box>
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                👥 참가자 목록 ({data.users.length}명)
              </Typography>
              {data.users.map((u) => (
                <Card
                  key={u.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={u.avatar} alt={u.name} sx={{ width: 36, height: 36 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {u.name} {u.role === 'me' && '(나)'}
                      </Typography>
                      {u.title && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {u.title}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {u.role !== 'me' && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* 탭 2: 환경 & 기기 설정 */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                📱 상단 헤더 및 상대방 설정
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="방 제목 / 상대방 이름"
                  value={data.config.roomTitle}
                  onChange={(e) =>
                    handleConfigChange({
                      roomTitle: e.target.value,
                      partnerName: e.target.value,
                    })
                  }
                />
                <TextField
                  size="small"
                  label="상태 메시지 / 부서 정보"
                  value={data.config.partnerStatus || ''}
                  onChange={(e) => handleConfigChange({ partnerStatus: e.target.value })}
                />
              </Box>
            </Card>

            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                🔋 스마트폰 상태바 설정
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    size="small"
                    label="시계 시간"
                    value={data.config.timeString}
                    onChange={(e) => handleConfigChange({ timeString: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    select
                    size="small"
                    label="통신망"
                    value={data.config.networkType}
                    onChange={(e) =>
                      handleConfigChange({ networkType: e.target.value as NetworkType })
                    }
                    sx={{ width: 100 }}
                  >
                    <MenuItem value="5G">5G</MenuItem>
                    <MenuItem value="LTE">LTE</MenuItem>
                    <MenuItem value="WIFI">Wi-Fi</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    배터리 잔량: {data.config.batteryLevel}%
                  </Typography>
                  <Slider
                    value={data.config.batteryLevel}
                    min={0}
                    max={100}
                    onChange={(_, val) => handleConfigChange({ batteryLevel: val as number })}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.config.isCharging}
                        onChange={(e) => handleConfigChange({ isCharging: e.target.checked })}
                      />
                    }
                    label="충전 중 ⚡"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.config.darkMode}
                        onChange={(e) => handleConfigChange({ darkMode: e.target.checked })}
                      />
                    }
                    label="다크 모드"
                  />
                </Box>
              </Box>
            </Card>

            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                📲 기기 프레임 및 크기 조절
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.config.showDeviceFrame}
                      onChange={(e) => handleConfigChange({ showDeviceFrame: e.target.checked })}
                    />
                  }
                  label="스마트폰 외곽 프레임 표시"
                />
                <TextField
                  select
                  size="small"
                  label="디바이스 기종"
                  value={data.config.deviceType}
                  onChange={(e) => handleConfigChange({ deviceType: e.target.value as DeviceType })}
                >
                  <MenuItem value="iphone">Apple iPhone (Dynamic Island)</MenuItem>
                  <MenuItem value="android">Samsung Galaxy / Android</MenuItem>
                  <MenuItem value="frameless">프레임리스 (앱 카드형)</MenuItem>
                </TextField>

                {/* 모바일 화면 너비 조절 */}
                <Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      기기 가로 너비 (Width): {data.config.deviceWidth || 390}px
                    </Typography>
                  </Box>
                  <Slider
                    value={data.config.deviceWidth || 390}
                    min={320}
                    max={520}
                    step={10}
                    onChange={(_, val) => handleConfigChange({ deviceWidth: val as number })}
                  />
                  {/* 퀵 프리셋 버튼 */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11, py: 0.2 }}
                      onClick={() => handleConfigChange({ deviceWidth: 340 })}
                    >
                      미니 (340px)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11, py: 0.2 }}
                      onClick={() => handleConfigChange({ deviceWidth: 390 })}
                    >
                      기본 (390px)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11, py: 0.2 }}
                      onClick={() => handleConfigChange({ deviceWidth: 430 })}
                    >
                      맥스 (430px)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11, py: 0.2 }}
                      onClick={() => handleConfigChange({ deviceWidth: 480 })}
                    >
                      태블릿 (480px)
                    </Button>
                  </Box>
                </Box>

                {/* 화면 줌/배율 조절 */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    화면 배율 (Scale): {data.config.deviceScale || 100}%
                  </Typography>
                  <Slider
                    value={data.config.deviceScale || 100}
                    min={70}
                    max={130}
                    step={5}
                    onChange={(_, val) => handleConfigChange({ deviceScale: val as number })}
                  />
                </Box>

                {/* 모서리 곡률(Round) 조절 */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    모서리 둥글기 (Round): {data.config.frameBorderRadius ?? 36}px
                  </Typography>
                  <Slider
                    value={data.config.frameBorderRadius ?? 36}
                    min={0}
                    max={50}
                    step={2}
                    onChange={(_, val) => handleConfigChange({ frameBorderRadius: val as number })}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {/* 탭 3: 프리셋 / 저장 & 불러오기 */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                ⚡ 추천 대화 프리셋
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.keys(INITIAL_PRESETS[category] || {}).map((presetKey) => (
                  <Button
                    key={presetKey}
                    variant="outlined"
                    onClick={() => handleLoadPreset(presetKey)}
                    startIcon={<AutoAwesomeRoundedIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {presetKey.replace(/_/g, ' ').toUpperCase()} 대화 로드
                  </Button>
                ))}
              </Box>
            </Card>

            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                💾 데이터 저장 & 불러오기
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleExportJson}
                  startIcon={<DownloadRoundedIcon />}
                >
                  대화 내용 JSON으로 내보내기
                </Button>

                <Button variant="outlined" component="label" startIcon={<UploadFileRoundedIcon />}>
                  JSON 파일 불러오기
                  <input type="file" accept=".json" hidden onChange={handleImportJson} />
                </Button>
              </Box>
            </Card>
          </Box>
        )}
      </Box>

      {/* 하단 닫기 바 */}
      <Box
        sx={{
          p: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="contained" onClick={onClose}>
          완료 및 미리보기 확인
        </Button>
      </Box>
    </Drawer>
  );
}
