export interface DiffPreset {
  name: string;
  desc: string;
  oldVal: string;
  newVal: string;
}

export interface LinePreset {
  name: string;
  listA: string;
  listB: string;
}

export const TEXT_DIFF_PRESETS: DiffPreset[] = [
  {
    name: '1. 소스 코드 (TypeScript)',
    desc: '인증 미들웨어 로직 수정',
    oldVal: `async function authenticateUser(token: string) {
  if (!token) {
    throw new Error("Token missing");
  }
  const user = await verifyJwt(token);
  return { id: user.id, role: "USER" };
}`,
    newVal: `async function authenticateUser(token: string, requiredRole = "USER") {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  const user = await verifyJwt(token);
  if (user.isSuspended) {
    throw new Error("User account is suspended");
  }
  return { id: user.id, role: user.role, permissions: user.permissions };
}`,
  },
  {
    name: '2. API JSON 응답',
    desc: '결제 트랜잭션 데이터 변경',
    oldVal: `{
  "status": "PENDING",
  "orderId": "ORD-2026-0818",
  "amount": 45000,
  "currency": "KRW",
  "items": [
    { "id": "ITM-01", "name": "무선 마우스", "qty": 1 }
  ]
}`,
    newVal: `{
  "status": "SUCCESS",
  "orderId": "ORD-2026-0818",
  "amount": 45000,
  "currency": "KRW",
  "paymentMethod": "HYUNDAI_CARD",
  "approvedAt": "2026-08-18T15:20:00Z",
  "items": [
    { "id": "ITM-01", "name": "무선 마우스 M3", "qty": 1, "price": 45000 }
  ]
}`,
  },
  {
    name: '3. 계약서 & 이용약관',
    desc: '개인정보 보유기간 개정',
    oldVal: `제5조 (개인정보의 보유 및 이용기간)
1. 회사는 회원이 탈퇴할 때까지 개인정보를 보유합니다.
2. 상법 등 법령에 따른 보존 의무가 있는 경우 3년간 보관합니다.`,
    newVal: `제5조 (개인정보의 보유 및 이용기간)
1. 회사는 회원 탈퇴 시 지체 없이 개인정보를 파기합니다. 단, 부정 이용 방지를 위해 식별값은 탈퇴 후 6개월간 안전하게 분리 보관합니다.
2. 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 따라 결제 및 계약 기록은 5년간 보존합니다.`,
  },
  {
    name: '4. SQL 쿼리',
    desc: '인덱스 최적화 및 조인 튜닝',
    oldVal: `SELECT u.id, u.name, o.total_price
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= '2026-01-01';`,
    newVal: `SELECT /*+ INDEX(o idx_orders_created) */ 
  u.id, u.name, u.email, SUM(o.total_price) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'PAID'
  AND o.created_at >= '2026-01-01'
GROUP BY u.id, u.name, u.email
HAVING SUM(o.total_price) >= 1000000;`,
  },
];

export const LINE_COMPARE_PRESETS: LinePreset[] = [
  {
    name: '1. 이메일 수신자 명단 비교',
    listA: `gildong.hong@company.com
minsu.kim@company.com
jieun.lee@company.com
seojun.park@company.com
yuna.jung@company.com`,
    listB: `minsu.kim@company.com
seojun.park@company.com
dongwook.choi@company.com
haewon.song@company.com
jieun.lee@company.com`,
  },
  {
    name: '2. 서버 IP 화이트리스트 검증',
    listA: `192.168.1.10
192.168.1.20
10.0.0.50
10.0.0.55
211.234.120.5`,
    listB: `192.168.1.10
10.0.0.50
10.0.0.99
211.234.120.5
172.16.0.100`,
  },
  {
    name: '3. 상품 SKU 재고 코드 비교',
    listA: `SKU-MACBOOK-M3-16
SKU-STUDIO-DISP-27
SKU-MX-MASTER-3S
SKU-MAGIC-KEYBOARD
SKU-IPAD-AIR-13`,
    listB: `SKU-MACBOOK-M3-16
SKU-MX-MASTER-3S
SKU-IPHONE-16-PRO
SKU-AIRPODS-PRO-2
SKU-MAGIC-KEYBOARD`,
  },
];
