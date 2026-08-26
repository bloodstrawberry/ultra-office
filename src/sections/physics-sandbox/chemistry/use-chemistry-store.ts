import type {
  AtomNodeData,
  BondLineData,
  MoleculePreset,
  ValidationResult,
} from './molecule-types';

import { create } from 'zustand';

import { KNOWN_MOLECULES, getMoleculeById, validateMoleculeStructure } from './molecule-validator';

// ----------------------------------------------------------------------

export const LEVEL_TITLES = [
  'Lv.1 원자 견습생',
  'Lv.2 분자 조립가',
  'Lv.3 화학 탐험가',
  'Lv.4 분자 연구원',
  'Lv.5 화학 박사',
  'Lv.6 연금술 수재',
  'Lv.7 노벨 화학상 후보',
];

export const calculateLevel = (totalXp: number): { level: number; title: string } => {
  const level = Math.min(Math.floor(totalXp / 50) + 1, 7);
  const title = LEVEL_TITLES[level - 1] || 'Lv.7 노벨 화학상 후보';
  return { level, title };
};

const PROGRESS_STORAGE_KEY = 'ultra_office_chemistry_progress_v1';
const CUSTOM_MOLECULES_STORAGE_KEY = 'ultra_office_chemistry_custom_molecules_v1';

// ----------------------------------------------------------------------
// Chemistry Store Interface
// ----------------------------------------------------------------------

interface ChemistryState {
  // User Progress
  discoveredMoleculeIds: string[];
  completedMissionIds: string[];
  xp: number;
  level: number;
  levelTitle: string;
  hasLoadedProgress: boolean;

  // Custom Molecules (PubChem)
  customMolecules: MoleculePreset[];
  hasLoadedCustomMolecules: boolean;

  // Builder Canvas State
  atoms: AtomNodeData[];
  bonds: BondLineData[];
  selectedElement: string;
  selectedBondOrder: 1 | 2 | 3;
  selectedAtomId: string | null;
  validationResult: ValidationResult;
  discoveredModalMolecule: MoleculePreset | null;

  // Actions - Progress
  loadProgress: () => void;
  discoverMolecule: (moleculeId: string, xpReward: number) => void;
  completeMission: (missionId: string, xpReward: number) => void;
  resetProgress: () => void;

  // Actions - Custom Molecules
  loadCustomMolecules: () => void;
  addCustomMolecule: (molecule: MoleculePreset) => boolean;
  addBatchCustomMolecules: (molecules: MoleculePreset[]) => number;
  removeCustomMolecule: (id: string) => void;
  getAllMolecules: () => MoleculePreset[];

  // Actions - Molecule Builder
  setSelectedElement: (element: string) => void;
  setSelectedBondOrder: (order: 1 | 2 | 3) => void;
  setSelectedAtomId: (id: string | null) => void;
  addAtom: (position?: [number, number, number]) => void;
  removeAtom: (id: string) => void;
  addOrToggleBond: (atomAId: string, atomBId: string) => void;
  removeBond: (id: string) => void;
  clearCanvas: () => void;
  closeDiscoveryModal: () => void;
  loadPresetMolecule: (moleculeId: string, customPreset?: MoleculePreset) => void;
}

export const useChemistryStore = create<ChemistryState>((set, get) => ({
  // 1. User Progress
  discoveredMoleculeIds: ['h2o', 'o2', 'co2'],
  completedMissionIds: [],
  xp: 35,
  level: 1,
  levelTitle: 'Lv.1 원자 견습생',
  hasLoadedProgress: false,

  // 2. Custom Molecules
  customMolecules: [],
  hasLoadedCustomMolecules: false,

  // 3. Builder Canvas initial state
  atoms: [
    { id: 'atom_1', element: 'H', position: [-1.4, 0, 0] },
    { id: 'atom_2', element: 'O', position: [0, 0, 0] },
    { id: 'atom_3', element: 'H', position: [1.4, 0, 0] },
  ],
  bonds: [
    { id: 'bond_1', atomA: 'atom_1', atomB: 'atom_2', order: 1 },
    { id: 'bond_2', atomA: 'atom_2', atomB: 'atom_3', order: 1 },
  ],
  selectedElement: 'H',
  selectedBondOrder: 1,
  selectedAtomId: null,
  validationResult: {
    status: 'VALID',
    matchedMolecule: KNOWN_MOLECULES.find((m) => m.id === 'h2o'),
    empiricalFormula: 'H₂O',
    message: '✨ 분자 발견! H₂O (물)',
    details: '모든 생명체의 필수 용매이며, 수소 2개와 산소 1개가 굽은형 공유결합을 형성합니다.',
  },
  discoveredModalMolecule: null,

  // Progress Actions
  loadProgress: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const xp = parsed.xp || 0;
        const { level, title } = calculateLevel(xp);
        set({
          discoveredMoleculeIds: parsed.discoveredMoleculeIds || ['h2o', 'o2', 'co2'],
          completedMissionIds: parsed.completedMissionIds || [],
          xp,
          level,
          levelTitle: title,
          hasLoadedProgress: true,
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load progress from storage', e);
    }
    set({ hasLoadedProgress: true });
  },

  discoverMolecule: (moleculeId, xpReward) => {
    const { discoveredMoleculeIds, xp } = get();
    if (discoveredMoleculeIds.includes(moleculeId)) return;

    const newDiscovered = [...discoveredMoleculeIds, moleculeId];
    const newXp = xp + xpReward;
    const { level, title } = calculateLevel(newXp);

    set({
      discoveredMoleculeIds: newDiscovered,
      xp: newXp,
      level,
      levelTitle: title,
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          PROGRESS_STORAGE_KEY,
          JSON.stringify({
            discoveredMoleculeIds: newDiscovered,
            completedMissionIds: get().completedMissionIds,
            xp: newXp,
          })
        );
      } catch (e) {
        console.warn('Failed to save progress', e);
      }
    }
  },

  completeMission: (missionId, xpReward) => {
    const { completedMissionIds, xp } = get();
    if (completedMissionIds.includes(missionId)) return;

    const newMissions = [...completedMissionIds, missionId];
    const newXp = xp + xpReward;
    const { level, title } = calculateLevel(newXp);

    set({
      completedMissionIds: newMissions,
      xp: newXp,
      level,
      levelTitle: title,
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          PROGRESS_STORAGE_KEY,
          JSON.stringify({
            discoveredMoleculeIds: get().discoveredMoleculeIds,
            completedMissionIds: newMissions,
            xp: newXp,
          })
        );
      } catch (e) {
        console.warn('Failed to save mission progress', e);
      }
    }
  },

  resetProgress: () => {
    set({
      discoveredMoleculeIds: ['h2o'],
      completedMissionIds: [],
      xp: 0,
      level: 1,
      levelTitle: 'Lv.1 원자 견습생',
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          PROGRESS_STORAGE_KEY,
          JSON.stringify({
            discoveredMoleculeIds: ['h2o'],
            completedMissionIds: [],
            xp: 0,
          })
        );
      } catch (e) {
        console.warn('Failed to reset progress', e);
      }
    }
  },

  // Custom Molecules Actions
  loadCustomMolecules: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(CUSTOM_MOLECULES_STORAGE_KEY);
      if (raw) {
        const parsed: MoleculePreset[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set({ customMolecules: parsed, hasLoadedCustomMolecules: true });
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom molecules', e);
    }
    set({ hasLoadedCustomMolecules: true });
  },

  addCustomMolecule: (molecule) => {
    const { customMolecules } = get();
    const existsInDefault = KNOWN_MOLECULES.some(
      (m) => m.id === molecule.id || (m.cid && molecule.cid && m.cid === molecule.cid)
    );
    const existsInCustom = customMolecules.some(
      (m) => m.id === molecule.id || (m.cid && molecule.cid && m.cid === molecule.cid)
    );

    if (existsInDefault || existsInCustom) {
      return false;
    }

    const updated = [molecule, ...customMolecules];
    set({ customMolecules: updated });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CUSTOM_MOLECULES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save custom molecules', e);
      }
    }

    return true;
  },

  addBatchCustomMolecules: (molecules) => {
    const { customMolecules } = get();
    const newItems: MoleculePreset[] = [];

    molecules.forEach((m) => {
      const existsInDefault = KNOWN_MOLECULES.some(
        (ex) => ex.id === m.id || (ex.cid && m.cid && ex.cid === m.cid)
      );
      const existsInCustom = [...customMolecules, ...newItems].some(
        (ex) => ex.id === m.id || (ex.cid && m.cid && ex.cid === m.cid)
      );
      if (!existsInDefault && !existsInCustom) {
        newItems.push(m);
      }
    });

    if (newItems.length === 0) return 0;

    const updated = [...newItems, ...customMolecules];
    set({ customMolecules: updated });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CUSTOM_MOLECULES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save custom molecules', e);
      }
    }

    return newItems.length;
  },

  removeCustomMolecule: (id) => {
    const { customMolecules } = get();
    const updated = customMolecules.filter((m) => m.id !== id);
    set({ customMolecules: updated });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CUSTOM_MOLECULES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update custom molecules', e);
      }
    }
  },

  getAllMolecules: () => {
    const { customMolecules } = get();
    return [...KNOWN_MOLECULES, ...customMolecules];
  },

  // Molecule Builder Actions
  setSelectedElement: (element) => set({ selectedElement: element }),
  setSelectedBondOrder: (order) => set({ selectedBondOrder: order }),
  setSelectedAtomId: (id) => set({ selectedAtomId: id }),

  addAtom: (pos) => {
    const { atoms, bonds, selectedElement, customMolecules } = get();
    const index = atoms.length;
    const defaultPos: [number, number, number] = pos || [
      ((index % 4) - 1.5) * 1.5,
      Math.floor(index / 4) * 1.4 - 0.5,
      0,
    ];

    const newAtom: AtomNodeData = {
      id: `atom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      element: selectedElement,
      position: defaultPos,
    };

    const newAtoms = [...atoms, newAtom];
    const newValidation = validateMoleculeStructure(newAtoms, bonds, customMolecules);

    if (newValidation.status === 'VALID' && newValidation.matchedMolecule) {
      get().discoverMolecule(
        newValidation.matchedMolecule.id,
        newValidation.matchedMolecule.xp || 30
      );
    }

    set({
      atoms: newAtoms,
      validationResult: newValidation,
      discoveredModalMolecule:
        newValidation.status === 'VALID' && newValidation.matchedMolecule
          ? newValidation.matchedMolecule
          : null,
    });
  },

  removeAtom: (id) => {
    const { atoms, bonds, customMolecules } = get();
    const newAtoms = atoms.filter((a) => a.id !== id);
    const newBonds = bonds.filter((b) => b.atomA !== id && b.atomB !== id);
    const newValidation = validateMoleculeStructure(newAtoms, newBonds, customMolecules);

    set({
      atoms: newAtoms,
      bonds: newBonds,
      selectedAtomId: null,
      validationResult: newValidation,
    });
  },

  addOrToggleBond: (atomAId, atomBId) => {
    if (atomAId === atomBId) return;
    const { atoms, bonds, selectedBondOrder, customMolecules } = get();

    const existingIndex = bonds.findIndex(
      (b) =>
        (b.atomA === atomAId && b.atomB === atomBId) || (b.atomA === atomBId && b.atomB === atomAId)
    );

    const newBonds = [...bonds];
    if (existingIndex >= 0) {
      const existing = bonds[existingIndex];
      if (existing.order === selectedBondOrder) {
        newBonds.splice(existingIndex, 1);
      } else {
        newBonds[existingIndex] = { ...existing, order: selectedBondOrder };
      }
    } else {
      newBonds.push({
        id: `bond_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        atomA: atomAId,
        atomB: atomBId,
        order: selectedBondOrder,
      });
    }

    const newValidation = validateMoleculeStructure(atoms, newBonds, customMolecules);

    if (newValidation.status === 'VALID' && newValidation.matchedMolecule) {
      get().discoverMolecule(
        newValidation.matchedMolecule.id,
        newValidation.matchedMolecule.xp || 30
      );
    }

    set({
      bonds: newBonds,
      selectedAtomId: null,
      validationResult: newValidation,
      discoveredModalMolecule:
        newValidation.status === 'VALID' && newValidation.matchedMolecule
          ? newValidation.matchedMolecule
          : null,
    });
  },

  removeBond: (id) => {
    const { atoms, bonds, customMolecules } = get();
    const newBonds = bonds.filter((b) => b.id !== id);
    const newValidation = validateMoleculeStructure(atoms, newBonds, customMolecules);

    set({
      bonds: newBonds,
      validationResult: newValidation,
    });
  },

  clearCanvas: () => {
    const emptyValidation = validateMoleculeStructure([], []);
    set({
      atoms: [],
      bonds: [],
      selectedAtomId: null,
      validationResult: emptyValidation,
      discoveredModalMolecule: null,
    });
  },

  closeDiscoveryModal: () => set({ discoveredModalMolecule: null }),

  loadPresetMolecule: (moleculeId, customPreset) => {
    const { customMolecules } = get();
    const preset = customPreset || getMoleculeById(moleculeId, customMolecules);
    if (!preset) return;

    let newAtoms: AtomNodeData[] = [];
    let newBonds: BondLineData[] = [];

    if (preset.id === 'h2o') {
      newAtoms = [
        { id: 'a_o', element: 'O', position: [0, 0, 0] },
        { id: 'a_h1', element: 'H', position: [-1.4, -0.8, 0] },
        { id: 'a_h2', element: 'H', position: [1.4, -0.8, 0] },
      ];
      newBonds = [
        { id: 'b_1', atomA: 'a_o', atomB: 'a_h1', order: 1 },
        { id: 'b_2', atomA: 'a_o', atomB: 'a_h2', order: 1 },
      ];
    } else if (preset.id === 'co2') {
      newAtoms = [
        { id: 'a_c', element: 'C', position: [0, 0, 0] },
        { id: 'a_o1', element: 'O', position: [-1.8, 0, 0] },
        { id: 'a_o2', element: 'O', position: [1.8, 0, 0] },
      ];
      newBonds = [
        { id: 'b_1', atomA: 'a_c', atomB: 'a_o1', order: 2 },
        { id: 'b_2', atomA: 'a_c', atomB: 'a_o2', order: 2 },
      ];
    } else if (preset.id === 'ch4') {
      newAtoms = [
        { id: 'a_c', element: 'C', position: [0, 0, 0] },
        { id: 'a_h1', element: 'H', position: [0, 1.4, 0] },
        { id: 'a_h2', element: 'H', position: [-1.3, -0.7, 0.7] },
        { id: 'a_h3', element: 'H', position: [1.3, -0.7, 0.7] },
        { id: 'a_h4', element: 'H', position: [0, -0.7, -1.4] },
      ];
      newBonds = [
        { id: 'b_1', atomA: 'a_c', atomB: 'a_h1', order: 1 },
        { id: 'b_2', atomA: 'a_c', atomB: 'a_h2', order: 1 },
        { id: 'b_3', atomA: 'a_c', atomB: 'a_h3', order: 1 },
        { id: 'b_4', atomA: 'a_c', atomB: 'a_h4', order: 1 },
      ];
    } else {
      let idx = 0;
      const countEntries = Object.entries(preset.elementCounts);
      countEntries.forEach(([el, count]) => {
        for (let i = 0; i < count; i += 1) {
          newAtoms.push({
            id: `atom_preset_${idx}`,
            element: el,
            position: [((idx % 4) - 1.5) * 1.4, Math.floor(idx / 4) * 1.3 - 0.5, 0],
          });
          idx += 1;
        }
      });
    }

    const validation = validateMoleculeStructure(newAtoms, newBonds, customMolecules);
    set({
      atoms: newAtoms,
      bonds: newBonds,
      selectedAtomId: null,
      validationResult: validation,
    });
  },
}));
