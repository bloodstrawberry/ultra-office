'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { ThemeSelector } from 'src/components/theme-selector';

import {
  IDE_THEMES,
  getThemeById,
  DEFAULT_THEME_ID,
} from 'src/sections/code-runner/core/editor-themes';

import { type Step } from '../../lib/algorithms/types';
import { useVisualizerStore } from '../../store/visualizerStore';
import { SortingVisualizer } from '../visualizer/SortingVisualizer';
import { playSwapSound, playSuccessFanfare } from '../../lib/sound';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        bgcolor: 'background.paper',
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={32} color="primary" />
      <Typography variant="caption">샌드박스 에디터 로딩 중...</Typography>
    </Box>
  ),
});

const TEMPLATES: Record<string, { name: string; code: string; defaultArray: number[] }> = {
  bubbleSort: {
    name: '버블 정렬 (Bubble Sort)',
    defaultArray: [40, 20, 60, 10, 50, 30],
    code: `// 사용자 정의 버블 정렬 샌드박스
// arr를 직접 변경하면서 recordStep()을 호출해 시각화 상태를 기록하세요!
function runAlgorithm(arr, recordStep) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // 1. 비교 상태 기록
      recordStep({
        comparingIndices: [j, j + 1],
        description: \`\${arr[j]}와 \${arr[j + 1]} 비교 중...\`
      });

      if (arr[j] > arr[j + 1]) {
        // 교환
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        // 2. 스왑 상태 기록
        recordStep({
          swappingIndices: [j, j + 1],
          description: \`\${arr[j + 1]}와 \${arr[j]} 위치 교환!\`
        });
      }
    }
  }
}`,
  },
  selectionSort: {
    name: '선택 정렬 (Selection Sort)',
    defaultArray: [55, 25, 80, 15, 45, 35],
    code: `// 사용자 정의 선택 정렬 샌드박스
function runAlgorithm(arr, recordStep) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      recordStep({
        comparingIndices: [minIdx, j],
        description: \`현재 최솟값 후보 \${arr[minIdx]}와 \${arr[j]} 비교\`
      });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      recordStep({
        swappingIndices: [i, minIdx],
        description: \`\${arr[i]}를 \${i}번째 위치로 확정 교환\`
      });
    }
  }
}`,
  },
  insertionSort: {
    name: '삽입 정렬 (Insertion Sort)',
    defaultArray: [35, 12, 68, 24, 49, 18],
    code: `// 사용자 정의 삽입 정렬 샌드박스
function runAlgorithm(arr, recordStep) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    recordStep({
      pivotIndex: i,
      description: \`삽입 대상 원소: \${key}\`
    });
    while (j >= 0 && arr[j] > key) {
      recordStep({
        comparingIndices: [j, j + 1],
        description: \`\${arr[j]}가 \${key}보다 크므로 오른쪽으로 이동\`
      });
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
    recordStep({
      swappingIndices: [j + 1],
      description: \`\${key}를 \${j + 1}번째 위치에 안착\`
    });
  }
}`,
  },
};

export function PlaygroundTab() {
  const { themeId = DEFAULT_THEME_ID, setThemeId } = useVisualizerStore();
  const currentTheme = getThemeById(themeId);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('bubbleSort');
  const [code, setCode] = useState<string>(TEMPLATES.bubbleSort.code);
  const [inputArrayStr, setInputArrayStr] = useState<string>('40, 20, 60, 10, 50, 30');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBeforeMount = useCallback((monaco: any) => {
    IDE_THEMES.forEach((theme) => {
      if (theme.monacoDefinition) {
        monaco.editor.defineTheme(theme.monacoThemeId, theme.monacoDefinition);
      }
    });
  }, []);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplate(key);
    setCode(TEMPLATES[key].code);
    setInputArrayStr(TEMPLATES[key].defaultArray.join(', '));
    setSteps([]);
    setCurrentStepIdx(0);
    setErrorMessage(null);
  };

  const handleRunCode = () => {
    setErrorMessage(null);
    try {
      const parsedArray = inputArrayStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      if (parsedArray.length === 0) {
        setErrorMessage('올바른 숫자 배열을 입력해 주세요 (예: 10, 20, 30)');
        return;
      }

      const generatedSteps: Step[] = [];
      const workingArr = [...parsedArray];

      generatedSteps.push({
        stepIndex: 0,
        line: 1,
        array: [...workingArr],
        variables: {},
        description: '알고리즘 시작 준비 완료',
      });

      const recordStep = (meta: Partial<Step>) => {
        generatedSteps.push({
          stepIndex: generatedSteps.length,
          line: meta.line || 1,
          array: [...workingArr],
          variables: meta.variables || {},
          description: meta.description || '알고리즘 실행 중...',
          ...meta,
        });
      };

      const executor = new Function(
        'arr',
        'recordStep',
        `${code}\n runAlgorithm(arr, recordStep);`
      );
      executor(workingArr, recordStep);

      generatedSteps.push({
        stepIndex: generatedSteps.length,
        line: 1,
        array: [...workingArr],
        variables: {},
        sortedIndices: workingArr.map((_, idx) => idx),
        description: '✨ 정렬이 성공적으로 완료되었습니다!',
      });

      setSteps(generatedSteps);
      setCurrentStepIdx(0);
      setIsPlaying(true);
      playSuccessFanfare();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`실행 중 오류 발생: ${errMsg}`);
    }
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < steps.length - 1) {
          playSwapSound();
          return prev + 1;
        }
        setIsPlaying(false);
        return prev;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  const currentStep = steps[currentStepIdx] || {
    stepIndex: 0,
    line: 1,
    array: inputArrayStr.split(',').map((s) => parseInt(s.trim(), 10) || 10),
    description: '코드를 작성하고 실행하기를 눌러주세요.',
    variables: {},
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: '1 1 auto', minHeight: 0 }}
    >
      {/* 1. Header Toolbar */}
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 1 }}>
            알고리즘 템플릿:
          </Typography>
          {Object.keys(TEMPLATES).map((key) => (
            <Button
              key={key}
              size="small"
              variant={selectedTemplate === key ? 'contained' : 'outlined'}
              color={selectedTemplate === key ? 'primary' : 'inherit'}
              onClick={() => handleSelectTemplate(key)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {TEMPLATES[key].name}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ThemeSelector
            currentThemeId={themeId}
            onThemeChange={setThemeId}
            size="small"
            height={36}
            minWidth={150}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={handleRunCode}
            sx={{ borderRadius: 2, fontWeight: 800, px: 3, height: 36 }}
          >
            실시간 시각화 실행하기
          </Button>
        </Box>
      </Card>

      {/* 2. Main 2-Column Split: Editor + Live Canvas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 1.5,
          flex: '1 1 auto',
          minHeight: 0,
        }}
      >
        {/* Left Column: Code & Array Input */}
        <Card
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <TextField
            label="입력 배열 (쉼표로 구분)"
            size="small"
            value={inputArrayStr}
            onChange={(e) => setInputArrayStr(e.target.value)}
            fullWidth
            sx={{ '& input': { fontFamily: 'monospace', fontWeight: 700 } }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CodeRoundedIcon fontSize="small" /> JavaScript Sandbox Editor
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>
              runAlgorithm(arr, recordStep)
            </Typography>
          </Box>

          <Box
            sx={{
              height: 380,
              width: '100%',
              borderRadius: 2,
              border: 1,
              borderColor: currentTheme.uiColors.border,
              overflow: 'hidden',
              bgcolor: currentTheme.uiColors.surface,
            }}
          >
            <MonacoEditor
              height="100%"
              language="javascript"
              value={code}
              theme={currentTheme.monacoThemeId}
              beforeMount={handleBeforeMount}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: true, scale: 0.75 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true,
                padding: { top: 8, bottom: 8 },
              }}
            />
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Card>

        {/* Right Column: Visualizer Canvas & Timeline */}
        <Card
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              pb: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              실시간 캔버스 시각화
            </Typography>
            {steps.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}
                >
                  {currentStepIdx + 1} / {steps.length} 단계
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  onClick={() => setIsPlaying(!isPlaying)}
                  sx={{ borderRadius: 1.5 }}
                >
                  {isPlaying ? '일시정지' : '재생'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => {
                    setCurrentStepIdx(0);
                    setIsPlaying(false);
                  }}
                  sx={{ borderRadius: 1.5 }}
                >
                  리셋
                </Button>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <SortingVisualizer step={currentStep} />
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}
            >
              {currentStep.description || '시작 준비'}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
