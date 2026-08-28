import type { MatlabFile } from '../types';

// ----------------------------------------------------------------------

export interface MatlabTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  mainFile: string;
  files: MatlabFile[];
}

export const MATLAB_TEMPLATES: MatlabTemplate[] = [
  {
    id: 'signal-fft',
    title: '1. 신호 처리 및 FFT 스펙트럼 분석',
    category: 'Signal Processing',
    description:
      '노이즈가 포함된 다중 주파수 정현파를 생성하고 고속 푸리에 변환(FFT)으로 주파수 성분을 추출합니다.',
    mainFile: 'signal_fft.m',
    files: [
      {
        id: 'file-1',
        name: 'signal_fft.m',
        content: `% =========================================================================
% MATLAB Signal Processing & FFT Spectrum Analysis
% =========================================================================

% 1. 시간축 파라미터 정의
Fs = 1000;              % 샘플링 주파수 (Hz)
T = 1 / Fs;             % 샘플링 주기 (s)
L = 1500;               % 신호 길이
t = (0:L-1) * T;        % 시간 벡터

% 2. 다중 주파수 정현파 합성 (50Hz + 120Hz + White Noise)
f1 = 50;
f2 = 120;
S = 0.8 * sin(2 * pi * f1 * t) + 1.5 * sin(2 * pi * f2 * t);
noise = 2.0 * randn(1, L);
X = S + noise;

% 3. 원본 및 노이즈 신호 2D 플롯 (Figure 1)
figure(1);
plot(1000 * t(1:100), X(1:100));
title('노이즈가 섞인 50Hz + 120Hz 원시 시간 신호 X(t)');
xlabel('시간 t (밀리초, ms)');
ylabel('신호 진폭 (Amplitude)');
grid on;

% 4. 단면 FFT 스펙트럼 계산
Y = fft(X);
P2 = abs(Y / L);
P1 = P2(1:floor(L/2)+1);
P1(2:end-1) = 2 * P1(2:end-1);
f = Fs * (0:(L/2)) / L;

% 5. 주파수 스펙트럼 플롯 (Figure 2)
figure(2);
plot(f, P1);
title('단면 주파수 진폭 스펙트럼 |P1(f)|');
xlabel('주파수 f (Hz)');
ylabel('|P1(f)|');
grid on;

disp('FFT 스펙트럼 분석이 성공적으로 완료되었습니다.');
`,
      },
    ],
  },
  {
    id: 'surface-3d',
    title: '2. 3D Peaks & Sombrero 표면 그래픽',
    category: 'Graphics & Visuals',
    description:
      '2차원 격자 meshgrid를 생성하고 3D surf, mesh, contour 등 다양한 입체 그래픽을 렌더링합니다.',
    mainFile: 'surface_3d.m',
    files: [
      {
        id: 'file-2',
        name: 'surface_3d.m',
        content: `% =========================================================================
% MATLAB 3D Surface & Contour Visualizer
% =========================================================================

% 1. 2D 격자 좌표 생성
[X, Y] = meshgrid(-8:0.4:8, -8:0.4:8);

% 2. Sombrero (2D Sinc) 표면 함수 계산
R = sqrt(X.^2 + Y.^2) + eps;
Z = sin(R) ./ R;

% 3. 3D Surf 표면도 생성 (Figure 1)
figure(1);
surf(X, Y, Z);
title('3D Sombrero (2D Sinc 함수) 표면');
xlabel('X 축');
ylabel('Y 축');
zlabel('Z = sin(R)/R');

% 4. Peaks 함수 및 등고선(Contour) 생성 (Figure 2)
[Xp, Yp] = meshgrid(-3:0.15:3, -3:0.15:3);
Zp = 3*(1-Xp).^2 .* exp(-(Xp.^2) - (Yp+1).^2) ...
   - 10*(Xp/5 - Xp.^3 - Yp.^5) .* exp(-Xp.^2 - Yp.^2) ...
   - 1/3 * exp(-(Xp+1).^2 - Yp.^2);

figure(2);
contour(Xp, Yp, Zp);
title('MATLAB 표준 Peaks 등고선도 (Contour Map)');
xlabel('X');
ylabel('Y');

disp('3D 표면 및 등고선도 렌더링이 완료되었습니다.');
`,
      },
    ],
  },
  {
    id: 'linear-algebra',
    title: '3. 선형대수 및 행렬 고유값 분석',
    category: 'Linear Algebra',
    description:
      '행렬의 역행렬, 행렬식, 고유값(Eigenvalues), 고유벡터를 계산하고 원의 2D 선형변환을 시각화합니다.',
    mainFile: 'linear_algebra.m',
    files: [
      {
        id: 'file-3',
        name: 'linear_algebra.m',
        content: `% =========================================================================
% MATLAB Linear Algebra & Eigen Decomposition
% =========================================================================

% 1. 3x3 대칭 행렬 정의
A = [4, 1, 2; 
     1, 3, 0; 
     2, 0, 5];

disp('행렬 A =');
disp(A);

% 2. 행렬식 및 역행렬 계산
d = det(A);
A_inv = inv(A);
disp('행렬식 det(A) =');
disp(d);
disp('역행렬 inv(A) =');
disp(A_inv);

% 3. 고유값 및 고유벡터 분해
[V, D] = eig(A);
disp('고유벡터 행렬 V =');
disp(V);
disp('고유값 대각행렬 D =');
disp(D);

% 4. 2D 선형변환 기하학 시각화
theta = linspace(0, 2*pi, 100);
circle = [cos(theta); sin(theta)];

% 2x2 변환 행렬 M (회전 + 전단 + 스케일)
M = [2.0, 0.8; 
     0.4, 1.5];

transformed = M * circle;

figure(1);
plot(circle(1, :), circle(2, :));
hold on;
plot(transformed(1, :), transformed(2, :));
title('선형 변환 M에 의한 단위 원의 타원 변환');
xlabel('x');
ylabel('y');
legend('원래 원 (Unit Circle)', '변환된 타원 (M * Circle)');
grid on;
`,
      },
    ],
  },
  {
    id: 'lorenz-ode',
    title: '4. 로렌츠 카오스 미분방정식 (ODE45)',
    category: 'Differential Equations',
    description:
      '나비 효과(Butterfly Effect)로 유명한 로렌츠 카오스 연립 미분방정식을 4차 룬게-쿠타로 수치적분하고 3D 궤적을 그립니다.',
    mainFile: 'lorenz_ode.m',
    files: [
      {
        id: 'file-4',
        name: 'lorenz_ode.m',
        content: `% =========================================================================
% MATLAB Lorenz Attractor ODE Simulation
% =========================================================================

% 로렌츠 계수 설정 (카오스 영역)
sigma = 10;
beta = 8 / 3;
rho = 28;

% 수치 해석 파라미터
dt = 0.01;
numSteps = 2500;

% 상태 벡터 초기화 (x, y, z)
x = zeros(1, numSteps);
y = zeros(1, numSteps);
z = zeros(1, numSteps);

% 초기 조건
x(1) = 0.1;
y(1) = 0.0;
z(1) = 0.0;

% 4차 룬게-쿠타(RK4) 수치 적분
for i = 1:numSteps-1
    % 현재 상태
    cx = x(i);
    cy = y(i);
    cz = z(i);
    
    % k1
    k1x = sigma * (cy - cx);
    k1y = cx * (rho - cz) - cy;
    k1z = cx * cy - beta * cz;
    
    % k2
    k2x = sigma * ((cy + 0.5*dt*k1y) - (cx + 0.5*dt*k1x));
    k2y = (cx + 0.5*dt*k1x) * (rho - (cz + 0.5*dt*k1z)) - (cy + 0.5*dt*k1y);
    k2z = (cx + 0.5*dt*k1x) * (cy + 0.5*dt*k1y) - beta * (cz + 0.5*dt*k1z);
    
    % k3
    k3x = sigma * ((cy + 0.5*dt*k2y) - (cx + 0.5*dt*k2x));
    k3y = (cx + 0.5*dt*k2x) * (rho - (cz + 0.5*dt*k2z)) - (cy + 0.5*dt*k2y);
    k3z = (cx + 0.5*dt*k2x) * (cy + 0.5*dt*k2y) - beta * (cz + 0.5*dt*k2z);
    
    % k4
    k4x = sigma * ((cy + dt*k3y) - (cx + dt*k3x));
    k4y = (cx + dt*k3x) * (rho - (cz + dt*k3z)) - (cy + dt*k3y);
    k4z = (cx + dt*k3x) * (cy + dt*k3y) - beta * (cz + dt*k3z);
    
    % 상태 갱신
    x(i+1) = cx + (dt/6) * (k1x + 2*k2x + 2*k3x + k4x);
    y(i+1) = cy + (dt/6) * (k1y + 2*k2y + 2*k3y + k4y);
    z(i+1) = cz + (dt/6) * (k1z + 2*k2z + 2*k3z + k4z);
end

% 3D 카오스 어트랙터 궤적 플롯
figure(1);
plot3(x, y, z);
title('로렌츠 카오스 어트랙터 3D 궤적 (Lorenz Attractor)');
xlabel('X (대류 강도)');
ylabel('Y (수평 온도차)');
zlabel('Z (수직 온도 기울기)');
grid on;

disp('로렌츠 어트랙터 시뮬레이션 완료!');
`,
      },
    ],
  },
  {
    id: 'monte-carlo',
    title: '5. 몬테카를로 기하 확률 & π 원주율 추정',
    category: 'Statistics & Probability',
    description:
      '단위 정사각형 내에 균등 난수를 투사하여 원 내부 점의 비율로 원주율 π를 수치 근사하고 오차 수렴을 분석합니다.',
    mainFile: 'monte_carlo_pi.m',
    files: [
      {
        id: 'file-5',
        name: 'monte_carlo_pi.m',
        content: `% =========================================================================
% MATLAB Monte Carlo Simulation for Pi Estimation
% =========================================================================

N = 3000;               % 총 난수 샘플 개수
x = 2 * rand(1, N) - 1; % [-1, 1] 범위 균등 난수
y = 2 * rand(1, N) - 1;

% 단위 원 내부 여부 판정 (x^2 + y^2 <= 1)
dist_sq = x.^2 + y.^2;
inside = dist_sq <= 1;

inside_count = sum(inside);
pi_approx = 4 * inside_count / N;
err = abs(pi_approx - pi) / pi * 100;

disp(['총 샘플 수: ', num2str(N)]);
disp(['내부 점 수: ', num2str(inside_count)]);
disp(['π 추정치: ', num2str(pi_approx)]);
disp(['상대 오차: ', num2str(err), ' %']);

% 2D 산점도 시각화 (Figure 1)
figure(1);
scatter(x(inside), y(inside));
hold on;
scatter(x(~inside), y(~inside));

% 단위 원 테두리
th = linspace(0, 2*pi, 200);
plot(cos(th), sin(th));

title(['몬테카를로 \\pi 추정: \\pi \\approx ', num2str(pi_approx, 5), ' (N = ', num2str(N), ')']);
xlabel('X');
ylabel('Y');
legend('원 내부 (Inside)', '원 외부 (Outside)', '단위 원 경계');
grid on;
`,
      },
    ],
  },
  {
    id: 'bode-circuit',
    title: '6. RLC 전기회로 주파수 응답 및 보드선도 (Bode Plot)',
    category: 'Control & Engineering',
    description:
      '2차 RLC 대역통과/저역통과 필터의 복소 전달함수 H(jω)를 유도하고 이득(Magnitude) 및 위상(Phase) 보드선도를 출력합니다.',
    mainFile: 'bode_circuit.m',
    files: [
      {
        id: 'file-6',
        name: 'bode_circuit.m',
        content: `% =========================================================================
% MATLAB 2nd-Order RLC Filter Frequency Response (Bode Plot)
% =========================================================================

% 회로 파라미터 (R = 100 Ohm, L = 10mH, C = 1uF)
R = 100;
L = 0.01;
C = 1e-6;

% 고유 공진 주파수 및 감쇠비
omega_0 = 1 / sqrt(L * C);
f_0 = omega_0 / (2 * pi);
zeta = (R / 2) * sqrt(C / L);

disp(['공진 주파수 f0: ', num2str(f_0), ' Hz']);
disp(['감쇠비 zeta: ', num2str(zeta)]);

% 주파수 범위 (10 Hz ~ 100 kHz, 로그 스케일)
f = logspace(1, 5, 500);
omega = 2 * pi * f;

% RLC 저역통과 전달함수: H(s) = omega_0^2 / (s^2 + 2*zeta*omega_0*s + omega_0^2)
% s = j*omega
s = 1i * omega;
H = omega_0^2 ./ (s.^2 + 2*zeta*omega_0.*s + omega_0^2);

mag_dB = 20 * log10(abs(H));
phase_deg = angle(H) * 180 / pi;

% 1. 이득 선도 (Magnitude Response)
figure(1);
plot(f, mag_dB);
title('RLC 저역통과 필터 이득 응답 (Magnitude Response |H(f)| dB)');
xlabel('주파수 f (Hz)');
ylabel('이득 (dB)');
grid on;

% 2. 위상 선도 (Phase Response)
figure(2);
plot(f, phase_deg);
title('RLC 저역통과 필터 위상 응답 (Phase Response)');
xlabel('주파수 f (Hz)');
ylabel('위상 (\\circ)');
grid on;

disp('보드선도 주파수 응답 분석 완료');
`,
      },
    ],
  },
  {
    id: 'linear-regression',
    title: '7. 머신러닝 선형회귀 및 3D 손실함수 지형도',
    category: 'Machine Learning',
    description:
      '합성 데이터에 대해 정규방정식 및 경사하강법으로 최적 회귀 직선을 찾고 가중치 공간의 3D 2차 손실 곡면을 그립니다.',
    mainFile: 'linear_regression.m',
    files: [
      {
        id: 'file-7',
        name: 'linear_regression.m',
        content: `% =========================================================================
% MATLAB Linear Regression & 3D Loss Landscape
% =========================================================================

% 1. 훈련 데이터 생성 (y = 2.5*x + 1.2 + noise)
N = 60;
x_data = linspace(-2, 4, N);
true_w = 2.5;
true_b = 1.2;
y_data = true_w * x_data + true_b + 0.8 * randn(1, N);

% 2. 정규방정식 (Normal Equation)으로 최적 가중치 계산
X_mat = [x_data', ones(N, 1)];
theta_opt = inv(X_mat' * X_mat) * X_mat' * y_data';
w_opt = theta_opt(1);
b_opt = theta_opt(2);

disp(['최적 기울기 w*: ', num2str(w_opt)]);
disp(['최적 절편 b*: ', num2str(b_opt)]);

% 3. 회귀 직선 시각화 (Figure 1)
figure(1);
scatter(x_data, y_data);
hold on;
y_pred = w_opt * x_data + b_opt;
plot(x_data, y_pred);
title(['선형 회귀선: y = ', num2str(w_opt, 3), 'x + ', num2str(b_opt, 3)]);
xlabel('입력 특징 (Feature x)');
ylabel('목표 값 (Target y)');
legend('데이터 포인트 (Samples)', '최적 회귀선 (Best Fit)');
grid on;

% 4. 3D 손실함수 곡면 (MSE Loss Surface)
[W_grid, B_grid] = meshgrid(0.5:0.1:4.5, -1.0:0.1:3.5);
Loss = zeros(size(W_grid));

for r = 1:size(W_grid, 1)
    for c = 1:size(W_grid, 2)
        w_val = W_grid(r, c);
        b_val = B_grid(r, c);
        pred = w_val * x_data + b_val;
        Loss(r, c) = mean((y_data - pred).^2);
    end
end

figure(2);
surf(W_grid, B_grid, Loss);
title('가중치 공간의 평균제곱오차(MSE) 3D 손실 지형도');
xlabel('가중치 W (기울기)');
ylabel('편향 B (절편)');
zlabel('MSE 손실 비용 J(W, B)');

disp('머신러닝 선형회귀 분석이 완료되었습니다.');
`,
      },
    ],
  },
];
