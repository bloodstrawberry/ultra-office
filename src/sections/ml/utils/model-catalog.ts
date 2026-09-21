import type { MlModelSummary } from '../types';

import { paths } from 'src/routes/paths';

export const ML_MODELS: MlModelSummary[] = [
  // 1. Supervised: Regression
  {
    id: 'linear',
    nameKo: '선형 회귀 (Linear Regression)',
    nameEn: 'Linear Regression (OLS / GD)',
    category: 'supervised-regression',
    categoryNameKo: '지도학습 (회귀)',
    description:
      '독립 변수 X와 종속 변수 Y 사이의 선형 상관관계를 모델링합니다. OLS(최소자승법) 정규방정식과 경사하강법(GD)을 지원합니다.',
    formula: 'y = wx + b',
    path: paths.ml.linear,
    tags: ['OLS', '회귀분석', '경사하강법', 'MSE', 'R²'],
  },
  {
    id: 'ridge',
    nameKo: '릿지 회귀 (Ridge Regression)',
    nameEn: 'Ridge Regression (L2)',
    category: 'supervised-regression',
    categoryNameKo: '지도학습 (회귀)',
    description:
      '가중치의 제곱합(L2 Norm)에 패널티를 부여하여 계수의 크기를 축소시킴으로써 모델의 분산을 줄이고 과적합(Overfitting)을 방지합니다.',
    formula: 'Loss = MSE + \\lambda \\sum w_j^2',
    path: paths.ml.ridge,
    tags: ['L2 규제', '가중치 축소', '정규화', '과적합 방지'],
  },
  {
    id: 'lasso',
    nameKo: '라쏘 회귀 (Lasso Regression)',
    nameEn: 'Lasso Regression (L1)',
    category: 'supervised-regression',
    categoryNameKo: '지도학습 (회귀)',
    description:
      '가중치의 절댓값 합(L1 Norm)에 패널티를 부여하여 중요하지 않은 특성의 계수를 정확히 0으로 만들어 자동 특성 선택(Feature Selection)을 수행합니다.',
    formula: 'Loss = MSE + \\lambda \\sum |w_j|',
    path: paths.ml.lasso,
    tags: ['L1 규제', '특성 선택', 'Sparsity', '좌표하강법'],
  },

  // 2. Supervised: Classification
  {
    id: 'logistic',
    nameKo: '로지스틱 회귀 (Logistic Regression)',
    nameEn: 'Logistic Regression',
    category: 'supervised-classification',
    categoryNameKo: '지도학습 (분류)',
    description:
      '시그모이드 함수를 통해 0과 1 사이의 사건 발생 확률을 예측하며, 2차원 공간에서 2개 클래스를 분리하는 선형 결정 경계를 학습합니다.',
    formula: 'P(y=1|x) = \\sigma(w^T x + b) = \\frac{1}{1 + e^{-(w^T x + b)}}',
    path: paths.ml.logistic,
    tags: ['2진 분류', '시그모이드', '교차 엔트로피', '결정 경계'],
  },
  {
    id: 'knn',
    nameKo: 'K-최근접 이웃 (KNN Classifier)',
    nameEn: 'K-Nearest Neighbors',
    category: 'supervised-classification',
    categoryNameKo: '지도학습 (분류)',
    description:
      '별도의 학습 과정 없이(Lazy Learner), 새로운 데이터가 들어왔을 때 가장 가까운 K개의 이웃 데이터의 다수결 투표로 클래스를 판별합니다.',
    formula: 'd(x, y) = \\sqrt{\\sum (x_i - y_i)^2}',
    path: paths.ml.knn,
    tags: ['인스턴스 기반', '거리 척도', '보로노이', '비모수'],
  },
  {
    id: 'decision-tree',
    nameKo: '의사결정나무 (Decision Tree)',
    nameEn: 'Decision Tree (CART)',
    category: 'supervised-classification',
    categoryNameKo: '지도학습 (분류)',
    description:
      '지니 불순도(Gini) 또는 엔트로피(Entropy)를 최소화하는 기준 변수와 임계값을 순차적으로 찾아 직교 경계면으로 분할하는 화이트박스 모델입니다.',
    formula: 'Gini = 1 - \\sum p_i^2, \\quad Entropy = -\\sum p_i \\log_2 p_i',
    path: paths.ml.decisionTree,
    tags: ['CART', '트리 시각화', '지니 계수', '설명 가능 AI'],
  },

  // 3. Unsupervised: Clustering & Dim Reduction
  {
    id: 'kmeans',
    nameKo: 'K-평균 군집화 (K-Means)',
    nameEn: 'K-Means Clustering',
    category: 'unsupervised-clustering',
    categoryNameKo: '비지도학습 (군집화)',
    description:
      '데이터를 K개의 클러스터로 묶는 대표적인 분할적 군집화 알고리즘입니다. 센트로이드 업데이트 반복 과정과 엘보우 차트(Elbow Method)를 시각화합니다.',
    formula: 'WCSS = \\sum_{k=1}^K \\sum_{x \\in C_k} ||x - \\mu_k||^2',
    path: paths.ml.kmeans,
    tags: ['센트로이드', 'K-Means++', '엘보우 플롯', '보로노이'],
  },
  {
    id: 'hierarchical',
    nameKo: '계층적 군집화 (Hierarchical)',
    nameEn: 'Agglomerative Clustering',
    category: 'unsupervised-clustering',
    categoryNameKo: '비지도학습 (군집화)',
    description:
      '개별 데이터에서 시작하여 가장 가까운 군집들을 순차적으로 병합해 나가는 상향식 군집화입니다. 수형도(Dendrogram)를 탐색할 수 있습니다.',
    formula: 'd_{avg}(C_1, C_2) = \\frac{1}{|C_1||C_2|} \\sum d(x, y)',
    path: paths.ml.hierarchical,
    tags: ['수형도', '덴드로그램', '병합 군집', '연결법'],
  },
  {
    id: 'dbscan',
    nameKo: 'DBSCAN 밀도 기반 군집화',
    nameEn: 'DBSCAN (Density-Based)',
    category: 'unsupervised-clustering',
    categoryNameKo: '비지도학습 (군집화)',
    description:
      '데이터의 밀도를 기반으로 클러스터를 형성합니다. 원형이 아닌 임의의 기하학적 형태(도넛, 반달)를 군집화할 수 있으며 노이즈(이상치)를 자동 판별합니다.',
    formula: 'N_\\epsilon(p) = \\{q \\in D \\mid dist(p, q) \\le \\epsilon\\}',
    path: paths.ml.dbscan,
    tags: ['밀도 군집', '노이즈 검출', '비구형 클러스터', 'Epsilon & MinPts'],
  },
  {
    id: 'pca',
    nameKo: '주성분 분석 (PCA)',
    nameEn: 'Principal Component Analysis',
    category: 'unsupervised-dim-reduction',
    categoryNameKo: '차원 축소',
    description:
      '데이터의 분산이 최대가 되는 직교 축(주성분 벡터)을 찾아 고차원 데이터를 저차원으로 투영하는 대표적인 비지도 차원 축소 기법입니다.',
    formula: 'C = \\frac{1}{n-1} X^T X, \\quad Cv = \\lambda v',
    path: paths.ml.pca,
    tags: ['고유벡터', '공분산 행렬', '설명 분산', '차원 축소'],
  },

  // 4. Neural Network
  {
    id: 'neural-net',
    nameKo: '다층 퍼셉트론 (MLP Playground)',
    nameEn: 'Multi-Layer Perceptron',
    category: 'neural-network',
    categoryNameKo: '신경망 & 딥러닝',
    description:
      '은닉층과 비선형 활성화 함수(ReLU, Tanh, Sigmoid)를 갖춘 인공신경망입니다. 역전파(Backpropagation) 학습을 통해 나선형/XOR 등 비선형 경계를 실시간 학습합니다.',
    formula: 'h = f(W x + b), \\quad \\hat{y} = \\sigma(W_2 h + b_2)',
    path: paths.ml.neuralNet,
    tags: ['딥러닝', '역전파', '활성화 함수', '비선형 결정 경계'],
  },

  // 5. Sandbox / Runner
  {
    id: 'sandbox',
    nameKo: '머신러닝 라이브러리 샌드박스',
    nameEn: 'ML Library Benchmark & Sandbox',
    category: 'library-sandbox',
    categoryNameKo: '라이브러리 벤치마크',
    description:
      'Next.js / 브라우저 환경에서 동작하는 머신러닝 라이브러리(mathjs, Python Scikit-Learn in Pyodide, Transformers.js)를 테스트하고 코드를 실행합니다.',
    formula: 'Scikit-Learn \\leftrightarrow JS ML Engine',
    path: paths.ml.sandbox,
    tags: ['Scikit-Learn', 'Pyodide', 'mathjs', 'Transformers.js'],
  },
];
