export type GateType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'XNOR'
  | 'SWITCH'
  | 'LED'
  | 'CLOCK'
  | 'SEGMENT7';

export interface CircuitPin {
  id: string;
  type: 'input' | 'output';
  label: string;
  relX: number;
  relY: number;
  value: boolean;
}

export interface CircuitGate {
  id: string;
  type: GateType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  inputs: CircuitPin[];
  outputs: CircuitPin[];
  state?: boolean; // For switches / clocks / flipflops
}

export interface CircuitWire {
  id: string;
  fromGateId: string;
  fromPinId: string;
  toGateId: string;
  toPinId: string;
}

export interface TruthTableRow {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
}
