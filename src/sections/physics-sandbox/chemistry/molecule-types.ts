// ----------------------------------------------------------------------
// Chemistry & Physics Sandbox Types
// ----------------------------------------------------------------------

export type ElementCategory =
  | 'nonmetal'
  | 'noble-gas'
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'metalloid'
  | 'halogen'
  | 'post-transition'
  | 'transition-metal'
  | 'lanthanide'
  | 'actinide';

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  nameKo: string;
  nameEn: string;
  atomicMass: number;
  maxBonds: number; // 대표 결합 가능 수 (원자가)
  category: ElementCategory;
  cpkColor: string;
  hexColor: string;
  period: number;
  group: number;
  electronConfiguration: string;
  electronegativity: number | null;
  meltingPoint: number | null; // Kelvin
  boilingPoint: number | null; // Kelvin
  density: number | null; // g/cm3
  description: string;
  realLifeUse: string;
}

export interface MoleculePreset {
  id: string;
  formula: string; // e.g. "H2O", "C8H10N4O2"
  nameKo: string; // e.g. "물", "카페인"
  nameEn: string; // e.g. "Water", "Caffeine"
  molecularWeight: number; // e.g. 18.015
  description: string;
  category:
    | '기본 기체'
    | '생명/유기 화합물'
    | '무기 화합물'
    | '산/염기'
    | '의약품/영양소'
    | 'PubChem 추가';
  difficulty: '초급' | '중급' | '고급';
  xp: number; // 경험치 보상
  elementCounts: Record<string, number>; // { H: 2, O: 1 }
  bondsSummary: string;
  smiles?: string;
  realLifeUsage: string;
  cid?: number; // PubChem Compound ID
  isCustom?: boolean; // 사용자가 PubChem에서 동적으로 추가한 분자인지 여부
  addedAt?: number; // 추가된 타임스탬프
}

export interface AtomNodeData {
  id: string;
  element: string; // e.g. "H", "C"
  position: [number, number, number];
}

export interface BondLineData {
  id: string;
  atomA: string; // Atom ID
  atomB: string; // Atom ID
  order: 1 | 2 | 3;
}

export interface ValidationResult {
  status: 'VALID' | 'INCOMPLETE' | 'INVALID' | 'EMPTY';
  matchedMolecule?: MoleculePreset;
  empiricalFormula?: string;
  message: string;
  details?: string;
  excessAtoms?: string[];
  unsaturatedAtoms?: { symbol: string; currentBonds: number; maxBonds: number }[];
}

export interface MissionItem {
  id: string;
  title: string;
  targetMoleculeId: string;
  targetFormula: string;
  targetName: string;
  requiredElements: string; // e.g. "H × 2, O × 1"
  difficulty: '초급' | '중급' | '고급';
  xpReward: number;
  description: string;
}

export interface MolarMassResult {
  formula: string;
  totalMass: number;
  composition: { symbol: string; count: number; massPercent: number; nameKo: string }[];
}

export interface BalancedEquationResult {
  rawInput: string;
  isSuccess: boolean;
  balancedEquation: string;
  coefficients: { reactants: number[]; products: number[] };
  message: string;
}

export interface PubChemPropertyResult {
  CID: number;
  MolecularFormula?: string;
  MolecularWeight?: string | number;
  CanonicalSMILES?: string;
  IUPACName?: string;
  Title?: string;
}
