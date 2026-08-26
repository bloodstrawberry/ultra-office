import type {
  AtomNodeData,
  BondLineData,
  MoleculePreset,
  ValidationResult,
} from './molecule-types';

import { getElementBySymbol } from './elements-data';
import { DEFAULT_100_MOLECULES } from './default-molecules';

export const KNOWN_MOLECULES: MoleculePreset[] = DEFAULT_100_MOLECULES;

export const getMoleculeById = (
  id: string,
  extraMolecules: MoleculePreset[] = []
): MoleculePreset | undefined => {
  const foundInExtra = extraMolecules.find((m) => m.id === id);
  if (foundInExtra) return foundInExtra;
  return KNOWN_MOLECULES.find((m) => m.id === id);
};

const toSubscript = (num: number): string => {
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
  return String(num)
    .split('')
    .map((c) => map[c] || c)
    .join('');
};

/**
 * 원소 개수 맵에서 화학식 규칙(Hill system: C -> H -> 나머지 알파벳순) 적용 문자열 생성
 */
export const buildChemicalFormula = (counts: Record<string, number>): string => {
  const elements = Object.keys(counts);
  if (elements.length === 0) return '';

  let sorted: string[] = [];
  if (counts.C) {
    sorted.push('C');
    if (counts.H) sorted.push('H');
    const rest = elements.filter((e) => e !== 'C' && e !== 'H').sort();
    sorted = sorted.concat(rest);
  } else {
    sorted = elements.sort();
  }

  return sorted
    .map((el) => {
      const num = counts[el];
      return num > 1 ? `${el}${toSubscript(num)}` : el;
    })
    .join('');
};

export const calculateWeightFromCounts = (counts: Record<string, number>): number => {
  let total = 0;
  Object.entries(counts).forEach(([sym, count]) => {
    const el = getElementBySymbol(sym);
    if (el) {
      total += el.atomicMass * count;
    }
  });
  return Math.round(total * 1000) / 1000;
};

/**
 * 원소와 결합 상태를 기반으로 유효성 검사 수행
 */
export const validateMoleculeStructure = (
  atoms: AtomNodeData[],
  bonds: BondLineData[],
  extraMolecules: MoleculePreset[] = []
): ValidationResult => {
  if (atoms.length === 0) {
    return {
      status: 'EMPTY',
      message: '조립 공간에 원소를 추가해 보세요!',
    };
  }

  // 1. 원자별 연결된 총 결합 수(order 합산) 계산
  const atomBondCountMap: Record<string, number> = {};
  atoms.forEach((a) => {
    atomBondCountMap[a.id] = 0;
  });

  bonds.forEach((b) => {
    if (atomBondCountMap[b.atomA] !== undefined) {
      atomBondCountMap[b.atomA] += b.order;
    }
    if (atomBondCountMap[b.atomB] !== undefined) {
      atomBondCountMap[b.atomB] += b.order;
    }
  });

  // 2. 최대 결합 수 초과(과포화) 원자 검사
  const overboundAtoms: { symbol: string; current: number; max: number }[] = [];
  const unsaturatedAtoms: { symbol: string; currentBonds: number; maxBonds: number }[] = [];

  atoms.forEach((a) => {
    const el = getElementBySymbol(a.element);
    const maxBonds = el?.maxBonds ?? 4;
    const current = atomBondCountMap[a.id] || 0;

    if (current > maxBonds) {
      overboundAtoms.push({ symbol: a.element, current, max: maxBonds });
    } else if (current < maxBonds && maxBonds > 0) {
      unsaturatedAtoms.push({ symbol: a.element, currentBonds: current, maxBonds });
    }
  });

  if (overboundAtoms.length > 0) {
    const first = overboundAtoms[0];
    return {
      status: 'INVALID',
      message: '✕ 이 결합은 화학적으로 불가능해요!',
      details: `${first.symbol} 원소는 최대 ${first.max}개까지 결합할 수 있습니다. (현재: ${first.current}개 연결 시도)`,
    };
  }

  // 3. 현재 존재하는 원소 개수 맵 생성 ({ H: 2, O: 1 })
  const elementCounts: Record<string, number> = {};
  atoms.forEach((a) => {
    elementCounts[a.element] = (elementCounts[a.element] || 0) + 1;
  });

  // 화학식 문자열 생성 (예: H2O, CO2, CH4)
  const formulaStr = buildChemicalFormula(elementCounts);

  // 4. Known & Custom Molecules 데이터베이스에서 매칭 시도
  const searchPool = [...KNOWN_MOLECULES, ...extraMolecules];
  const matched = searchPool.find((m) => {
    const keys = Object.keys(m.elementCounts);
    const curKeys = Object.keys(elementCounts);
    if (keys.length !== curKeys.length) return false;
    for (const k of keys) {
      if (elementCounts[k] !== m.elementCounts[k]) return false;
    }
    return true;
  });

  // 5. 완결 검사
  if (matched) {
    if (unsaturatedAtoms.length === 0) {
      return {
        status: 'VALID',
        matchedMolecule: matched,
        empiricalFormula: formulaStr,
        message: `✨ 분자 발견! ${matched.formula} (${matched.nameKo})`,
        details: matched.description,
      };
    }
    return {
      status: 'INCOMPLETE',
      matchedMolecule: matched,
      empiricalFormula: formulaStr,
      message: '○ 아직 결합할 자리가 남아있어요!',
      details: '원소가 모두 완결되려면 결합선을 연결해보세요.',
      unsaturatedAtoms,
    };
  }

  // 6. 알려진 매칭은 없지만 결합 규칙을 만족하는 임의 화학 구조
  if (unsaturatedAtoms.length === 0 && bonds.length > 0) {
    return {
      status: 'VALID',
      empiricalFormula: formulaStr,
      matchedMolecule: {
        id: `custom_${Date.now()}`,
        formula: formulaStr,
        nameKo: `${formulaStr} 분자`,
        nameEn: `Custom ${formulaStr}`,
        molecularWeight: calculateWeightFromCounts(elementCounts),
        description: '사용자가 직접 설계한 안정된 신규 화합물 분자 구조입니다.',
        category: '무기 화합물',
        difficulty: '중급',
        xp: 30,
        elementCounts,
        bondsSummary: '사용자 커스텀 화학 결합',
        realLifeUsage: '화학 실험 및 분자 탐구',
      },
      message: `✨ 새로운 결합 구조 완성! (${formulaStr})`,
    };
  }

  // 기본 미완성 상태 안내
  return {
    status: 'INCOMPLETE',
    empiricalFormula: formulaStr,
    message: `○ 결합을 연결해 보세요! (현재: ${formulaStr})`,
    unsaturatedAtoms,
  };
};
