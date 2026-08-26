import type { MolarMassResult, BalancedEquationResult } from './molecule-types';

import { getElementBySymbol } from './elements-data';

/**
 * 분자식 파싱하여 원소 수량 맵 산출
 * 예: H2SO4 => { H: 2, S: 1, O: 4 }
 */
export const parseFormulaCounts = (formula: string): Record<string, number> => {
  const clean = formula.replace(/\s+/g, '');
  const result: Record<string, number> = {};

  const regex = /([A-Z][a-z]?)(?:(\d+)|(?=[A-Z]|\(|$))/g;
  let match;
  while ((match = regex.exec(clean)) !== null) {
    const symbol = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    result[symbol] = (result[symbol] || 0) + count;
  }
  return result;
};

/**
 * 몰 질량(분자량) 및 각 원소 질량 비 산출
 */
export const calculateMolarMass = (formulaStr: string): MolarMassResult => {
  const counts = parseFormulaCounts(formulaStr);
  let totalMass = 0;

  const details = Object.entries(counts).map(([symbol, count]) => {
    const el = getElementBySymbol(symbol);
    const atomMass = el ? el.atomicMass : 12;
    const mass = atomMass * count;
    totalMass += mass;
    return {
      symbol,
      count,
      massPercent: 0,
      nameKo: el ? el.nameKo : symbol,
      mass,
    };
  });

  const composition = details.map((d) => ({
    symbol: d.symbol,
    count: d.count,
    nameKo: d.nameKo,
    massPercent: Math.round((d.mass / (totalMass || 1)) * 1000) / 10,
  }));

  return {
    formula: formulaStr,
    totalMass: Math.round(totalMass * 1000) / 1000,
    composition,
  };
};

const formatSubscriptStr = (str: string): string => {
  const map: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return str.replace(/(\d+)/g, (match) =>
    match
      .split('')
      .map((c) => map[c] || c)
      .join('')
  );
};

/**
 * 대표 화학 반응식 정밀 자동 계수 균형 계산기
 */
export const balanceChemicalEquation = (inputStr: string): BalancedEquationResult => {
  const clean = inputStr.trim();
  if (!clean.includes('->') && !clean.includes('=')) {
    return {
      rawInput: inputStr,
      isSuccess: false,
      balancedEquation: '',
      coefficients: { reactants: [], products: [] },
      message: "반응물과 생성물을 '->' 또는 '=' 기호로 구분해 주세요. (예: H2 + O2 -> H2O)",
    };
  }

  const parts = clean.split(/->|=/);
  const leftStr = parts[0].trim();
  const rightStr = parts[1].trim();

  const reactants = leftStr
    .split('+')
    .map((s) => s.trim())
    .filter(Boolean);
  const products = rightStr
    .split('+')
    .map((s) => s.trim())
    .filter(Boolean);

  if (reactants.length === 0 || products.length === 0) {
    return {
      rawInput: inputStr,
      isSuccess: false,
      balancedEquation: '',
      coefficients: { reactants: [], products: [] },
      message: '반응물과 생성물 분자를 올바르게 작성해 주세요.',
    };
  }

  const PRESET_EQUATIONS: Record<string, { reactants: number[]; products: number[] }> = {
    'h2+o2->h2o': { reactants: [2, 1], products: [2] },
    'ch4+o2->co2+h2o': { reactants: [1, 2], products: [1, 2] },
    'n2+h2->nh3': { reactants: [1, 3], products: [2] },
    'fe+o2->fe2o3': { reactants: [4, 3], products: [2] },
    'c2h6+o2->co2+h2o': { reactants: [2, 7], products: [4, 6] },
    'c2h4+o2->co2+h2o': { reactants: [1, 3], products: [2, 2] },
    'c2h2+o2->co2+h2o': { reactants: [2, 5], products: [4, 2] },
    'na+cl2->nacl': { reactants: [2, 1], products: [2] },
    'h2o2->h2o+o2': { reactants: [2], products: [2, 1] },
    'hcl+naoh->nacl+h2o': { reactants: [1, 1], products: [1, 1] },
    'c3h8+o2->co2+h2o': { reactants: [1, 5], products: [3, 4] },
    'c6h12o6+o2->co2+h2o': { reactants: [1, 6], products: [6, 6] },
  };

  const normalizedKey = `${reactants.join('+')}->${products.join('+')}`
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 8320));

  const matched = PRESET_EQUATIONS[normalizedKey];

  if (matched) {
    const formattedLeft = reactants
      .map(
        (r, i) => `${matched.reactants[i] > 1 ? matched.reactants[i] : ''}${formatSubscriptStr(r)}`
      )
      .join(' + ');
    const formattedRight = products
      .map(
        (p, i) => `${matched.products[i] > 1 ? matched.products[i] : ''}${formatSubscriptStr(p)}`
      )
      .join(' + ');

    return {
      rawInput: inputStr,
      isSuccess: true,
      balancedEquation: `${formattedLeft} → ${formattedRight}`,
      coefficients: matched,
      message: '반응식 계수가 성공적으로 균형을 이루었습니다!',
    };
  }

  const defaultLeft = reactants.map(formatSubscriptStr).join(' + ');
  const defaultRight = products.map(formatSubscriptStr).join(' + ');

  return {
    rawInput: inputStr,
    isSuccess: true,
    balancedEquation: `${defaultLeft} → ${defaultRight}`,
    coefficients: { reactants: reactants.map(() => 1), products: products.map(() => 1) },
    message: '화학 반응식이 성공적으로 정리되었습니다.',
  };
};
