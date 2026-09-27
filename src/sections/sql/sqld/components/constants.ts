export interface CommonLatexSymbol {
  label: string;
  code: string;
}

export interface ERDTemplate {
  label: string;
  code: string;
}

export const COMMON_ERD_TEMPLATES: ERDTemplate[] = [
  {
    label: '1:N 관계 (일대다)',
    code: 'CUSTOMER ||--o{ ORDER : "places"',
  },
  {
    label: 'N:M 관계 (다대다)',
    code: 'STUDENT }|--|{ COURSE : "enrolls"',
  },
  {
    label: '엔티티 & 속성 정의',
    code: `USER {\n    int id PK\n    string email UK\n    string name\n    datetime created_at\n}`,
  },
  {
    label: '식별 관계 (1:1)',
    code: 'PERSON ||--|| PASSPORT : "has"',
  },
  {
    label: '비식별 관계 (0/1:N)',
    code: 'DEPARTMENT ||..o{ EMPLOYEE : "employs"',
  },
];

export const COMMON_LATEX_SYMBOLS: CommonLatexSymbol[] = [
  { label: '분수', code: '\\frac{a}{b}' },
  { label: '지수', code: 'x^{n}' },
  { label: '아래첨자', code: 'x_{n}' },
  { label: '제곱근', code: '\\sqrt{x}' },
  { label: 'n제곱근', code: '\\sqrt[n]{x}' },
  { label: '합 (∑)', code: '\\sum_{i=1}^{n}' },
  { label: '적분 (∫)', code: '\\int_{a}^{b}' },
  { label: '±', code: '\\pm' },
  { label: '×', code: '\\times' },
  { label: '÷', code: '\\div' },
  { label: '≠', code: '\\neq' },
  { label: '≤', code: '\\le' },
  { label: '≥', code: '\\ge' },
  { label: 'α', code: '\\alpha' },
  { label: 'β', code: '\\beta' },
  { label: 'θ', code: '\\theta' },
  { label: 'π', code: '\\pi' },
  { label: '∞', code: '\\infty' },
];

export interface ChartTemplate {
  label: string;
  code: string;
}

export const COMMON_CHART_TEMPLATES: ChartTemplate[] = [
  {
    label: '막대 그래프 (Bar)',
    code: `{\n  "data": [\n    {\n      "x": ["항목 A", "항목 B", "항목 C", "항목 D"],\n      "y": [25, 40, 15, 60],\n      "type": "bar",\n      "marker": { "color": "#1877F2" }\n    }\n  ],\n  "layout": { "title": "항목별 데이터 비교", "height": 300 }\n}`,
  },
  {
    label: '꺾은선 그래프 (Line)',
    code: `{\n  "data": [\n    {\n      "x": ["1분기", "2분기", "3분기", "4분기"],\n      "y": [120, 190, 300, 500],\n      "type": "scatter",\n      "mode": "lines+markers",\n      "line": { "color": "#00A76F", "width": 3 }\n    }\n  ],\n  "layout": { "title": "분기별 추이", "height": 300 }\n}`,
  },
  {
    label: '원형 차트 (Pie)',
    code: `{\n  "data": [\n    {\n      "labels": ["과목1", "과목2", "과목3", "과목4"],\n      "values": [35, 25, 20, 20],\n      "type": "pie",\n      "hole": 0.3\n    }\n  ],\n  "layout": { "title": "비율 분석", "height": 300 }\n}`,
  },
  {
    label: '산점도 (Scatter)',
    code: `{\n  "data": [\n    {\n      "x": [1, 2, 3, 4, 5, 6, 7],\n      "y": [3, 5, 4, 8, 7, 11, 10],\n      "mode": "markers",\n      "type": "scatter",\n      "marker": { "size": 10, "color": "#8E33FF" }\n    }\n  ],\n  "layout": { "title": "상관관계 산점도", "height": 300 }\n}`,
  },
  {
    label: 'Mermaid 파이',
    code: `pie title SQLD 비율\n  "1과목 데이터 모델링" : 20\n  "2과목 SQL 기본 및 활용" : 80`,
  },
  {
    label: 'Mermaid XY차트',
    code: `xychart-beta\n  title "회차별 합격률 추이"\n  x-axis ["48회", "49회", "50회", "51회", "52회"]\n  y-axis "합격률 (%)" 0 --> 100\n  bar [35, 42, 38, 48, 52]\n  line [35, 42, 38, 48, 52]`,
  },
];
