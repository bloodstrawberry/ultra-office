'use client';

import type {
  PcaMetrics,
  RegressionMetrics,
  ClusteringMetrics,
  ClassificationMetrics,
} from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

interface MlMetricsPanelProps {
  regression?: RegressionMetrics;
  classification?: ClassificationMetrics;
  clustering?: ClusteringMetrics;
  pca?: PcaMetrics;
}

export function MlMetricsPanel({
  regression,
  classification,
  clustering,
  pca,
}: MlMetricsPanelProps) {
  return (
    <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
        📊 모델 성능 지표 (Model Evaluation Metrics)
      </Typography>

      {/* 1. Regression Metrics */}
      {regression && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <MetricItem
              label="결정계수 (R² Score)"
              value={regression.r2.toFixed(4)}
              color={regression.r2 > 0.7 ? 'success.main' : 'warning.main'}
            />
            <MetricItem
              label="평균제곱오차 (MSE)"
              value={regression.mse.toFixed(4)}
              color="text.primary"
            />
            <MetricItem
              label="평균제곱근오차 (RMSE)"
              value={regression.rmse.toFixed(4)}
              color="text.primary"
            />
            <MetricItem
              label="평균절대오차 (MAE)"
              value={regression.mae.toFixed(4)}
              color="text.primary"
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                설명력 (R² Fit Quality)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {Math.max(0, Math.min(100, Math.round(regression.r2 * 100)))}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, regression.r2 * 100))}
              color={regression.r2 > 0.75 ? 'success' : regression.r2 > 0.4 ? 'warning' : 'error'}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        </Box>
      )}

      {/* 2. Classification Metrics */}
      {classification && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <MetricItem
              label="정확도 (Accuracy)"
              value={`${(classification.accuracy * 100).toFixed(1)}%`}
              color="primary.main"
            />
            <MetricItem
              label="F1 Score"
              value={classification.f1.toFixed(3)}
              color="success.main"
            />
            <MetricItem
              label="정밀도 (Precision)"
              value={`${(classification.precision * 100).toFixed(1)}%`}
              color="text.primary"
            />
            <MetricItem
              label="재현율 (Recall)"
              value={`${(classification.recall * 100).toFixed(1)}%`}
              color="text.primary"
            />
          </Box>

          {/* 2x2 Confusion Matrix */}
          {classification.confusionMatrix && (
            <Box sx={{ mt: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75, display: 'block' }}
              >
                혼동 행렬 (Confusion Matrix):
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 0.75,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    TN (참 음성)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {classification.confusionMatrix[0]?.[0] ?? 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'error.lighter',
                    border: '1px solid',
                    borderColor: 'error.light',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    FP (거짓 양성)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>
                    {classification.confusionMatrix[0]?.[1] ?? 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'warning.lighter',
                    border: '1px solid',
                    borderColor: 'warning.light',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'warning.main' }}>
                    FN (거짓 음성)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'warning.main' }}>
                    {classification.confusionMatrix[1]?.[0] ?? 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'success.lighter',
                    border: '1px solid',
                    borderColor: 'success.light',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    TP (참 양성)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {classification.confusionMatrix[1]?.[1] ?? 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* 3. Clustering Metrics */}
      {clustering && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <MetricItem label="클러스터 수 (K)" value={String(clustering.k)} color="primary.main" />
          <MetricItem
            label="군집 내 분산 (Inertia/WCSS)"
            value={clustering.inertia.toFixed(1)}
            color="text.primary"
          />
          <MetricItem
            label="수렴 반복수 (Iterations)"
            value={`${clustering.iterations}회`}
            color="text.primary"
          />
          <MetricItem
            label="군집별 크기"
            value={clustering.clusterCounts.join(', ')}
            color="text.secondary"
          />
        </Box>
      )}

      {/* 4. PCA Metrics */}
      {pca && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <MetricItem
              label="제1 주성분 설명 분산 (PC1)"
              value={`${(pca.explainedVarianceRatio[0] * 100).toFixed(1)}%`}
              color="cyan.main"
            />
            <MetricItem
              label="제2 주성분 설명 분산 (PC2)"
              value={`${(pca.explainedVarianceRatio[1] * 100).toFixed(1)}%`}
              color="secondary.main"
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                PC1 + PC2 누적 설명 분산
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                100%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pca.explainedVarianceRatio[0] * 100}
              color="info"
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        </Box>
      )}
    </Card>
  );
}

function MetricItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1,
        bgcolor: 'background.neutral',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 800, color: color || 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}
