'use client';

import type * as RhwpCore from '@rhwp/core';
import type { RhwpEditor as RhwpEditorInstance } from '@rhwp/editor';

import { toast } from 'sonner';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const WASM_PATH = `${BASE_PATH}/rhwp/rhwp_bg.wasm`;
const STUDIO_PATH = `${BASE_PATH}/rhwp-studio/index.html`;

let coreInitialization: Promise<typeof RhwpCore> | null = null;

interface HwpTemplate {
  id: string;
  title: string;
  description: string;
  fileName: string;
  assetPath: string;
}

const HWP_TEMPLATES: HwpTemplate[] = [
  {
    id: 'travel-plan-report',
    title: '해외여행 계획(보고)',
    description: '2단 일정·예산·준비물 보고서',
    fileName: '해외여행_계획보고서.hwp',
    assetPath: '/hwp-templates/travel-plan-report.hwp',
  },
  {
    id: 'official-draft-general',
    title: '일반 기안문',
    description: '수신·시행·공개 구분 포함',
    fileName: '공문서_기안문_일반.hwp',
    assetPath: '/hwp-templates/official-draft-general.hwp',
  },
  {
    id: 'official-draft-internal',
    title: '내부결재 기안문',
    description: '보고서·계획서·검토서용',
    fileName: '공문서_기안문_내부결재.hwp',
    assetPath: '/hwp-templates/official-draft-internal.hwp',
  },
  {
    id: 'official-work-handover',
    title: '업무인계·인수서',
    description: '업무·문서·물품·예산 인계',
    fileName: '업무인계_인수서.hwp',
    assetPath: '/hwp-templates/official-work-handover.hwp',
  },
  {
    id: 'official-video-conference-room-request',
    title: '영상회의실 사용신청서',
    description: '회의 일정·장소·담당자 포함',
    fileName: '정부영상회의실_사용신청서.hwp',
    assetPath: '/hwp-templates/official-video-conference-room-request.hwp',
  },
];

const OFFICIAL_TEMPLATE_SOURCE =
  'https://law.go.kr/lsInfoP.do?ancYnChk=0&efYd=20230628&lsiSeq=252189';

function initializeCore() {
  if (!coreInitialization) {
    coreInitialization = (async () => {
      let context: CanvasRenderingContext2D | null = null;
      let lastFont = '';

      (
        globalThis as typeof globalThis & {
          measureTextWidth: (font: string, text: string) => number;
        }
      ).measureTextWidth = (font, text) => {
        context ??= document.createElement('canvas').getContext('2d');
        if (!context) return 0;
        if (font !== lastFont) {
          context.font = font;
          lastFont = font;
        }
        return context.measureText(text).width;
      };

      const core = await import('@rhwp/core');
      await core.default({ module_or_path: WASM_PATH });
      return core;
    })();
  }

  return coreInitialization;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function downloadBytes(bytes: Uint8Array, fileName: string, mimeType: string) {
  const data = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function confirmDocumentReplacement(editor: RhwpEditorInstance) {
  try {
    const state = await editor.getDocumentState();
    if (!state.dirty) return true;
    return window.confirm('저장하지 않은 변경 사항이 있습니다. 현재 문서를 바꾸시겠습니까?');
  } catch {
    return true;
  }
}

export function RhwpEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<RhwpEditorInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let instance: RhwpEditorInstance | null = null;

    async function mountEditor() {
      if (!containerRef.current) return;

      setIsReady(false);
      setError(null);
      containerRef.current.replaceChildren();

      try {
        const { createEditor } = await import('@rhwp/editor');
        instance = await createEditor(containerRef.current, {
          studioUrl: STUDIO_PATH,
          width: '100%',
          height: '100%',
          renderer: 'canvas2d',
          requestTimeoutMs: 60000,
        });

        if (disposed) {
          instance.destroy();
          return;
        }

        editorRef.current = instance;
        setIsReady(true);
      } catch (mountError) {
        if (!disposed) {
          setError(`rhwp 편집기를 초기화하지 못했습니다. ${getErrorMessage(mountError)}`);
        }
      }
    }

    void mountEditor();

    return () => {
      disposed = true;
      if (editorRef.current === instance) editorRef.current = null;
      instance?.destroy();
    };
  }, [editorKey]);

  const openFile = useCallback(async (file: File) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (!/\.(hwp|hwpx)$/i.test(file.name)) {
      toast.error('HWP 또는 HWPX 파일만 열 수 있습니다.');
      return;
    }

    if (!(await confirmDocumentReplacement(editor))) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setIsWorking(true);
    try {
      const buffer = await file.arrayBuffer();
      const core = await initializeCore();
      const parsedDocument = new core.HwpDocument(new Uint8Array(buffer));
      let parsedPageCount = 0;

      try {
        parsedPageCount = parsedDocument.pageCount();
      } finally {
        parsedDocument.free();
      }

      const result = await editor.loadFile(buffer, file.name, {
        skipUnsavedGuard: true,
        suppressDialogs: true,
      });

      setFileName(file.name);
      setPageCount(result.pageCount || parsedPageCount);
      toast.success(`${file.name} 문서를 열었습니다.`);
    } catch (loadError) {
      toast.error(`문서를 열지 못했습니다. ${getErrorMessage(loadError)}`);
    } finally {
      setIsWorking(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void openFile(file);
    },
    [openFile]
  );

  const loadTemplate = useCallback(async (template: HwpTemplate) => {
    const editor = editorRef.current;
    if (!editor || !(await confirmDocumentReplacement(editor))) return;

    setIsWorking(true);
    try {
      const response = await fetch(`${BASE_PATH}${template.assetPath}`);
      if (!response.ok) {
        throw new Error(`양식 파일을 가져오지 못했습니다. (${response.status})`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const core = await initializeCore();
      const templateDocument = new core.HwpDocument(bytes);
      let templatePageCount = 0;

      try {
        templatePageCount = templateDocument.pageCount();
      } finally {
        templateDocument.free();
      }

      const result = await editor.loadFile(bytes, template.fileName, {
        skipUnsavedGuard: true,
        suppressDialogs: true,
      });

      setFileName(template.fileName);
      setPageCount(result.pageCount || templatePageCount);
      toast.success(`${template.title} 양식을 불러왔습니다.`);
    } catch (templateError) {
      toast.error(`양식을 불러오지 못했습니다. ${getErrorMessage(templateError)}`);
    } finally {
      setIsWorking(false);
    }
  }, []);

  const exportDocument = useCallback(
    async (format: 'hwp' | 'hwpx') => {
      const editor = editorRef.current;
      if (!editor) return;

      setIsWorking(true);
      try {
        const bytes = format === 'hwp' ? await editor.exportHwp() : await editor.exportHwpx();
        const baseName = (fileName || '새 문서').replace(/\.(hwp|hwpx)$/i, '');
        const outputName = `${baseName}.${format}`;
        const mimeType = format === 'hwp' ? 'application/x-hwp' : 'application/vnd.hancom.hwpx+zip';

        downloadBytes(bytes, outputName, mimeType);

        try {
          await editor.notifySaved(outputName);
        } catch {
          // 구버전 Studio에서는 저장 완료 알림 capability가 없을 수 있습니다.
        }

        toast.success(`${outputName} 파일을 저장했습니다.`);
      } catch (exportError) {
        toast.error(`파일을 저장하지 못했습니다. ${getErrorMessage(exportError)}`);
      } finally {
        setIsWorking(false);
      }
    },
    [fileName]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, gap: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {fileName || '새 한글 문서'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fileName
              ? `${pageCount ?? '-'}페이지 · 브라우저에서 편집 중`
              : 'HWP/HWPX 파일을 열거나 편집기에서 새 문서를 작성하세요.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            component="label"
            variant="contained"
            size="small"
            disabled={!isReady || isWorking}
            startIcon={<UploadFileRoundedIcon />}
          >
            파일 불러오기
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".hwp,.hwpx,application/x-hwp,application/haansofthwp,application/vnd.hancom.hwpx+zip"
              onChange={handleFileChange}
            />
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={!isReady || isWorking}
            startIcon={<DownloadRoundedIcon />}
            onClick={() => void exportDocument('hwp')}
          >
            HWP 저장
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={!isReady || isWorking}
            startIcon={<DownloadRoundedIcon />}
            onClick={() => void exportDocument('hwpx')}
          >
            HWPX 저장
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.25,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 800, flexShrink: 0 }}
        >
          <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
          공공문서 양식
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {HWP_TEMPLATES.map((template) => (
            <Button
              key={template.id}
              variant="outlined"
              size="small"
              disabled={!isReady || isWorking}
              onClick={() => void loadTemplate(template)}
              sx={{ textTransform: 'none' }}
            >
              {template.title}
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 0.75, color: 'text.secondary' }}
              >
                {template.description}
              </Typography>
            </Button>
          ))}
        </Box>
        <Typography
          component="a"
          href={OFFICIAL_TEMPLATE_SOURCE}
          target="_blank"
          rel="noreferrer"
          variant="caption"
          sx={{ ml: { md: 'auto' }, color: 'primary.main', whiteSpace: 'nowrap' }}
        >
          국가법령정보센터 원본 ↗
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => setEditorKey((value) => value + 1)}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 620, md: 760 },
          height: 'calc(100vh - 245px)',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
        {(!isReady || isWorking) && !error && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              bgcolor: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {isWorking
                ? '한글 문서를 분석하고 여는 중입니다…'
                : 'rhwp 편집기를 준비하는 중입니다…'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
