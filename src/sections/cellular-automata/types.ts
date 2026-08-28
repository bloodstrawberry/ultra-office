// ----------------------------------------------------------------------
// Cellular Automata & Game of Life Types
// ----------------------------------------------------------------------

export type CellularTab = 'life-game' | 'wolfram-1d';

export interface LifePreset {
  name: string;
  category: 'spaceships' | 'oscillators' | 'guns' | 'methuselahs';
  width: number;
  height: number;
  pattern: number[][]; // [row, col] offsets
  description: string;
}

export interface WolframRuleInfo {
  rule: number;
  name: string;
  classType:
    | 'Class 1 (Uniform)'
    | 'Class 2 (Periodic)'
    | 'Class 3 (Chaotic)'
    | 'Class 4 (Complex/Turing Complete)';
  description: string;
}
