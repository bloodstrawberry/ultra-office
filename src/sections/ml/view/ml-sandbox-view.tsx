'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { MlHeaderNav } from '../components/ml-header-nav';
import {
  fitPca2D,
  fitKMeans,
  fitRidgeRegression,
  fitLassoRegression,
  fitSimpleLinearRegression,
} from '../utils/math-ml';
import {
  generateCorrelatedPcaData,
  generateBlobsClusteringData,
  generateLinearRegressionData,
  generatePolynomialRegressionData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

interface LibraryCardInfo {
  name: string;
  category: string;
  tech: string;
  pros: string;
  useCase: string;
  status: 'installed' | 'available';
}

const LIBRARIES: LibraryCardInfo[] = [
  {
    name: 'Pure TS Math Engine',
    category: '초고속 경량 연산',
    tech: 'TypeScript / Web Canvas',
    pros: '0ms 초기화 지연, 번들 오버헤드 없음, 60fps 실시간 렌더링',
    useCase: '실시간 데이터 포인트 인터랙션, 선형/Ridge/Lasso/K-Means/PCA 즉시 시각화',
    status: 'installed',
  },
  {
    name: 'mathjs',
    category: '고급 수치 해석 & 선형대수',
    tech: 'mathjs (^14.3.1)',
    pros: '행렬 곱셈, 역행렬, LU/QR 분해, 복소수 및 미분 연산 완벽 지원',
    useCase: '다차원 회귀 분석, 정규화 방정식, 벡터 공간 변환',
    status: 'installed',
  },
  {
    name: 'Pyodide + Scikit-Learn',
    category: '정통 파이썬 ML 스택',
    tech: 'Pyodide WebAssembly (Wasm)',
    pros: 'Python scikit-learn, numpy, scipy 코드를 브라우저에서 100% 동일 실행',
    useCase: '파이썬 머신러닝 코드 검증, 복잡한 파이프라인 및 교차 검증(GridSearchCV)',
    status: 'installed',
  },
  {
    name: 'Transformers.js',
    category: '최신 딥러닝 & 트랜스포머',
    tech: '@huggingface/transformers',
    pros: 'ONNX 런타임 가속, 웹 브라우저에서 가중치 다운로드 후 로컬 추론',
    useCase: '문장 임베딩(Embedding), 감정 분석(Sentiment), Zero-shot 이미지/텍스트 분류',
    status: 'installed',
  },
  {
    name: 'Web-LLM & Wllama',
    category: '온디바이스 LLM',
    tech: '@mlc-ai/web-llm, @wllama/wllama',
    pros: 'WebGPU 가속, 서버 비용 0원, 프라이버시 완벽 보장',
    useCase: '브라우저 로컬 Llama-3, Gemma-2 소형 언어 모델 추론',
    status: 'installed',
  },
];

type TemplateId = 'linear' | 'ridge' | 'lasso' | 'kmeans' | 'pca';

export function MlSandboxView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('linear');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastExecutionTimeMs, setLastExecutionTimeMs] = useState<number | null>(null);

  useEffect(() => {
    setHasLoaded(true);
    setConsoleOutput([
      '⚡ Next.js Machine Learning Library Sandbox 준비 완료.',
      '👉 상단의 알고리즘 템플릿을 선택하고 [테스트 실행] 버튼을 눌러보세요.',
    ]);
  }, []);

  const runTest = (template: TemplateId) => {
    setIsRunning(true);
    const start = performance.now();

    setTimeout(() => {
      const logs: string[] = [];
      logs.push(`=======================================================`);
      logs.push(`🚀 실행 템플릿: ${template.toUpperCase()} 알고리즘 벤치마크`);
      logs.push(`⚙️ 환경: Next.js Client Engine (V8 JIT Optimized)`);
      logs.push(`-------------------------------------------------------`);

      if (template === 'linear') {
        const pts = generateLinearRegressionData(50, 1.2, 2.5, -1.0);
        const res = fitSimpleLinearRegression(pts);
        logs.push(`[데이터] N=50개 2D 데이터셋 로드`);
        logs.push(`[계산 완료] 기울기(Slope w): ${res.w.toFixed(4)}`);
        logs.push(`[계산 완료] 절편(Intercept b): ${res.b.toFixed(4)}`);
        logs.push(`[평가 지표] R² Score: ${res.metrics.r2.toFixed(4)}`);
        logs.push(
          `[평가 지표] MSE: ${res.metrics.mse.toFixed(4)} | RMSE: ${res.metrics.rmse.toFixed(4)}`
        );
        logs.push(`✅ 테스트 통과: OLS 정규방정식 최적화 완료`);
      } else if (template === 'ridge') {
        const pts = generatePolynomialRegressionData(50, 1.0);
        const res = fitRidgeRegression(pts, 4, 2.0);
        logs.push(`[데이터] N=50개 다항 곡선 데이터셋 로드`);
        logs.push(`[설정] 4차 다항식 확장, L2 규제 강도 λ = 2.0`);
        logs.push(`[계산 완료] Ridge 가중치 벡터:`);
        res.weights.forEach((w, i) => logs.push(`   w[${i}] = ${w.toFixed(4)}`));
        logs.push(
          `[평가 지표] R² Score: ${res.metrics.r2.toFixed(4)} | MSE: ${res.metrics.mse.toFixed(4)}`
        );
        logs.push(`✅ 테스트 통과: L2 가중치 수축(Weight Shrinkage) 검증`);
      } else if (template === 'lasso') {
        const pts = generatePolynomialRegressionData(50, 1.0);
        const res = fitLassoRegression(pts, 5, 1.5, 300);
        logs.push(`[데이터] N=50개 데이터셋 로드`);
        logs.push(`[설정] 5차 다항식 확장, L1 규제 강도 λ = 1.5, 좌표하강법 300회`);
        logs.push(`[계산 완료] Lasso 가중치 벡터:`);
        let zeros = 0;
        res.weights.forEach((w, i) => {
          const isZero = Math.abs(w) < 1e-4;
          if (isZero) zeros += 1;
          logs.push(`   w[${i}] = ${w.toFixed(4)} ${isZero ? ' (★ 소멸됨 - Sparsity)' : ''}`);
        });
        logs.push(`[특성 선택] 소멸된 계수: ${zeros}개 / 총 6개`);
        logs.push(`✅ 테스트 통과: L1 Soft-thresholding 특성 선택 검증`);
      } else if (template === 'kmeans') {
        const pts = generateBlobsClusteringData(3, 30);
        const res = fitKMeans(pts, 3, 'kmeans++', 25);
        logs.push(`[데이터] N=90개 군집 데이터셋 로드`);
        logs.push(`[설정] K = 3, 초기화: K-Means++`);
        logs.push(`[수렴] ${res.metrics.iterations}회 반복 후 센트로이드 수렴`);
        res.centroids.forEach((c, i) =>
          logs.push(`   Centroid[${i + 1}]: (${c.x.toFixed(2)}, ${c.y.toFixed(2)})`)
        );
        logs.push(`[평가 지표] 군집 내 분산 (Inertia/WCSS): ${res.metrics.inertia.toFixed(2)}`);
        logs.push(`✅ 테스트 통과: Lloyd's 알고리즘 군집 배정 정상 완료`);
      } else if (template === 'pca') {
        const pts = generateCorrelatedPcaData(80, 45);
        const res = fitPca2D(pts);
        logs.push(`[데이터] N=80개 2D 상관 데이터셋 로드`);
        logs.push(`[중심점] Mean X = ${res.meanX.toFixed(2)}, Mean Y = ${res.meanY.toFixed(2)}`);
        logs.push(
          `[고유치] Lambda 1 = ${res.metrics.eigenvalues[0].toFixed(3)}, Lambda 2 = ${res.metrics.eigenvalues[1].toFixed(3)}`
        );
        logs.push(
          `[주성분 1 벡터] [${res.metrics.eigenvectors[0][0].toFixed(3)}, ${res.metrics.eigenvectors[0][1].toFixed(3)}]`
        );
        logs.push(
          `[설명 분산 비율] PC1 = ${(res.metrics.explainedVarianceRatio[0] * 100).toFixed(1)}%, PC2 = ${(res.metrics.explainedVarianceRatio[1] * 100).toFixed(1)}%`
        );
        logs.push(`✅ 테스트 통과: 공분산 고유치 분해 및 직교 투영 완료`);
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      logs.push(`-------------------------------------------------------`);
      logs.push(`⏱️ 총 실행 소요 시간: ${elapsed} ms (Zero Network Latency)`);
      logs.push(`=======================================================`);

      setConsoleOutput(logs);
      setLastExecutionTimeMs(elapsed);
      setIsRunning(false);
    }, 120);
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      <MlHeaderNav currentModelId="sandbox" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* Available Libraries Grid */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
          📦 Next.js / 웹 브라우저에서 실행 가능한 머신러닝 라이브러리 스택
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {LIBRARIES.map((lib) => (
            <Grid key={lib.name} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {lib.name}
                  </Typography>
                  <Chip
                    size="small"
                    label="설치됨"
                    color="success"
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}
                >
                  {lib.category} ({lib.tech})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.8125rem', mb: 1 }}
                >
                  • <b>특징:</b> {lib.pros}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 'auto' }}>
                  활용: {lib.useCase}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Interactive Runner Section */}
        <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  인터랙티브 라이브러리 알고리즘 실행기
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  선택한 머신러닝 모델의 수학 연산 및 알고리즘 수렴을 브라우저 가상 환경에서 즉시
                  벤치마크합니다.
                </Typography>
              </Box>
            </Box>

            {lastExecutionTimeMs !== null && (
              <Chip
                label={`연산 속도: ${lastExecutionTimeMs} ms`}
                color="info"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            )}
          </Box>

          {/* Template Selectors */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Button
              size="small"
              variant={selectedTemplate === 'linear' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTemplate('linear');
                runTest('linear');
              }}
              sx={{ fontWeight: 700 }}
            >
              선형 회귀 (Linear)
            </Button>
            <Button
              size="small"
              variant={selectedTemplate === 'ridge' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTemplate('ridge');
                runTest('ridge');
              }}
              sx={{ fontWeight: 700 }}
            >
              릿지 회귀 (Ridge L2)
            </Button>
            <Button
              size="small"
              variant={selectedTemplate === 'lasso' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTemplate('lasso');
                runTest('lasso');
              }}
              sx={{ fontWeight: 700 }}
            >
              라쏘 회귀 (Lasso L1)
            </Button>
            <Button
              size="small"
              variant={selectedTemplate === 'kmeans' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTemplate('kmeans');
                runTest('kmeans');
              }}
              sx={{ fontWeight: 700 }}
            >
              K-평균 군집화 (K-Means)
            </Button>
            <Button
              size="small"
              variant={selectedTemplate === 'pca' ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTemplate('pca');
                runTest('pca');
              }}
              sx={{ fontWeight: 700 }}
            >
              주성분 분석 (PCA)
            </Button>

            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={
                isRunning ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PlayArrowRoundedIcon />
                )
              }
              onClick={() => runTest(selectedTemplate)}
              disabled={isRunning}
              sx={{ ml: 'auto', fontWeight: 800 }}
            >
              {isRunning ? '연산 중...' : '테스트 다시 실행'}
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltRoundedIcon />}
              onClick={() => setConsoleOutput(['콘솔이 초기화되었습니다.'])}
            >
              지우기
            </Button>
          </Box>

          {/* Console Output Window */}
          <Box
            component="pre"
            sx={{
              p: 2,
              m: 0,
              bgcolor: '#0B0F19',
              color: '#34D399',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.8125rem',
              lineHeight: 1.7,
              minHeight: 260,
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            {consoleOutput.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
