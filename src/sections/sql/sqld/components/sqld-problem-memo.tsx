'use client';

import type { Problem } from '../types';

import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import NoteAltRoundedIcon from '@mui/icons-material/NoteAltRounded';

import { MarkdownEditor } from 'src/components/markdown-editor';

import { getSqldMemo, saveSqldMemo } from '../sqld-memo-storage';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SqldProblemMemoProps {
  problem: Problem;
  problemIndex: number;
  problemKey: string;
}

const markdownSx = {
  overflowWrap: 'anywhere',
  '& p': { mt: 0, mb: 1 },
  '& p:last-child': { mb: 0 },
  '& pre': { overflowX: 'auto', p: 1.5, borderRadius: 1, bgcolor: 'action.hover' },
  '& code': { fontFamily: 'monospace' },
  '& table': { display: 'block', overflowX: 'auto', borderCollapse: 'collapse', my: 1 },
  '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1, py: 0.5 },
  '& ul, & ol': { pl: 3 },
};

export function SqldProblemMemo({ problem, problemIndex, problemKey }: SqldProblemMemoProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const latestContent = useRef('');
  const dirty = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);

  useEffect(() => {
    if (!open) return undefined;
    if (dirty.current) return undefined;

    let active = true;
    setLoading(true);
    setLoadError(false);
    getSqldMemo(problemKey)
      .then((memo) => {
        if (!active) return;
        latestContent.current = memo;
        setContent(memo);
        setStatus('idle');
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, problemKey]);

  const persist = (value: string, currentRevision: number) => {
    saveSqldMemo(problemKey, value)
      .then(() => {
        if (revision.current === currentRevision) {
          dirty.current = false;
          setStatus('saved');
        }
      })
      .catch(() => {
        if (revision.current === currentRevision) setStatus('error');
      });
  };

  const flush = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (dirty.current) persist(latestContent.current, revision.current);
  };

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (dirty.current) {
        void saveSqldMemo(problemKey, latestContent.current).catch(() => {});
      }
    },
    [problemKey]
  );

  const handleChange = (value: string) => {
    if (value === latestContent.current) return;

    latestContent.current = value;
    dirty.current = true;
    revision.current += 1;
    setContent(value);
    setStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const currentRevision = revision.current;
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      persist(value, currentRevision);
    }, 500);
  };

  const handleClose = () => {
    flush();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<NoteAltRoundedIcon />}
        onClick={() => setOpen(true)}
        sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
      >
        메모장
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        slotProps={{ paper: { sx: { height: { xs: '100%', md: '85vh' } } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          SQLD {problemIndex + 1}번 · 마크다운 메모장
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: { xs: 'block', md: 'flex' },
            minHeight: 0,
            overflowY: { xs: 'auto', md: 'hidden' },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gridTemplateRows: { md: 'minmax(0, 1fr)' },
              gap: 3,
              flex: 1,
              minHeight: 0,
              width: '100%',
            }}
          >
            <Box sx={{ minWidth: 0, minHeight: 0, overflowY: { md: 'auto' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                문제와 선택지
              </Typography>
              <Box sx={{ ...markdownSx, fontWeight: 700, mb: 2 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {problem.question}
                </ReactMarkdown>
              </Box>
              {problem.description?.trim() && (
                <Box sx={{ ...markdownSx, p: 2, mb: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {problem.description}
                  </ReactMarkdown>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {problem.choices.map((choice, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, flexShrink: 0 }}>
                      {index + 1}.
                    </Typography>
                    <Box sx={{ ...markdownSx, fontSize: 14, minWidth: 0 }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {choice}
                      </ReactMarkdown>
                      {problem.choiceDescriptions?.[index] && (
                        <Box sx={{ color: 'text.secondary', mt: 0.5 }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {problem.choiceDescriptions[index]}
                          </ReactMarkdown>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                내 공부 메모
              </Typography>
              {loadError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  메모를 불러오지 못했습니다. 메모장을 닫았다가 다시 열어 주세요.
                </Alert>
              ) : (
                <>
                  {!loading && (
                    <MarkdownEditor
                      hideHeader
                      fillHeight
                      label="내 공부 메모"
                      value={content}
                      onChange={handleChange}
                      placeholder="추가로 공부한 개념, 오답 이유, SQL 예시 등을 적어 보세요."
                      minRows={10}
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: status === 'error' ? 'error.main' : 'text.secondary',
                      mt: 0.75,
                    }}
                  >
                    {loading
                      ? '메모를 불러오는 중…'
                      : status === 'saving'
                        ? '자동 저장 중…'
                        : status === 'saved'
                          ? '이 브라우저의 IndexedDB에 저장됨'
                          : status === 'error'
                            ? '저장에 실패했습니다. 내용을 수정하면 다시 시도합니다.'
                            : '작성 내용은 이 브라우저에 자동 저장됩니다.'}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ fontWeight: 700 }}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
