// ----------------------------------------------------------------------
// Monty Hall & Probability Paradoxes Types
// ----------------------------------------------------------------------

export type MontyHallTab = 'monty-hall' | 'birthday' | 'prisoners' | 'simpsons';

/**
 * 1. Monty Hall Types
 */
export type DoorContent = 'car' | 'goat';

export type GameStage = 'choose' | 'opened' | 'finished';

export interface MontyDoor {
  id: number;
  content: DoorContent;
  isSelected: boolean;
  isOpen: boolean;
}

export interface MontyBulkStats {
  totalRounds: number;
  switchWins: number;
  switchLosses: number;
  stayWins: number;
  stayLosses: number;
  doorCount: number;
}

/**
 * 2. Birthday Paradox Types
 */
export interface BirthdayPerson {
  id: number;
  name: string;
  dayOfYear: number; // 1 to 365
  month: number;
  day: number;
  hasCollision: boolean;
}

export interface BirthdayStats {
  groupSize: number;
  hasSharedBirthday: boolean;
  sharedDays: number[];
  theoreticalProbability: number;
}

/**
 * 3. Prisoner's Dilemma Types
 */
export type Action = 'cooperate' | 'defect';

export type StrategyId =
  | 'tit-for-tat'
  | 'always-defect'
  | 'always-cooperate'
  | 'grudger'
  | 'pavlov'
  | 'random';

export interface StrategyInfo {
  id: StrategyId;
  name: string;
  description: string;
  color: string;
}

export interface TournamentRound {
  round: number;
  actionA: Action;
  actionB: Action;
  scoreA: number;
  scoreB: number;
}

export interface StrategyLeaderboardItem {
  id: StrategyId;
  name: string;
  totalScore: number;
  winCount: number;
  cooperationRate: number;
}

/**
 * 4. Simpson's Paradox Types
 */
export interface SimpsonsDataset {
  id: string;
  title: string;
  treatmentName: string;
  controlName: string;
  group1Name: string;
  group2Name: string;
  // Group 1
  g1TreatmentSuccess: number;
  g1TreatmentTotal: number;
  g1ControlSuccess: number;
  g1ControlTotal: number;
  // Group 2
  g2TreatmentSuccess: number;
  g2TreatmentTotal: number;
  g2ControlSuccess: number;
  g2ControlTotal: number;
  description: string;
}
