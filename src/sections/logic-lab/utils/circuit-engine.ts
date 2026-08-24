import type { GateType, CircuitGate, CircuitWire, TruthTableRow } from '../types';

// ----------------------------------------------------------------------

export function createGate(type: GateType, x: number, y: number, id?: string): CircuitGate {
  const gateId = id || `gate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const w = type === 'SEGMENT7' ? 100 : type === 'SWITCH' || type === 'LED' ? 70 : 80;
  const h = type === 'SEGMENT7' ? 120 : 60;

  switch (type) {
    case 'NOT':
      return {
        id: gateId,
        type,
        x,
        y,
        width: w,
        height: h,
        label: 'NOT',
        inputs: [{ id: 'in0', type: 'input', label: 'A', relX: 0, relY: h / 2, value: false }],
        outputs: [{ id: 'out0', type: 'output', label: 'Q', relX: w, relY: h / 2, value: true }],
      };
    case 'SWITCH':
      return {
        id: gateId,
        type,
        x,
        y,
        width: w,
        height: h,
        label: 'SWITCH',
        state: false,
        inputs: [],
        outputs: [{ id: 'out0', type: 'output', label: 'OUT', relX: w, relY: h / 2, value: false }],
      };
    case 'LED':
      return {
        id: gateId,
        type,
        x,
        y,
        width: w,
        height: h,
        label: 'LED',
        inputs: [{ id: 'in0', type: 'input', label: 'IN', relX: 0, relY: h / 2, value: false }],
        outputs: [],
      };
    case 'AND':
    case 'OR':
    case 'XOR':
    case 'NAND':
    case 'NOR':
    case 'XNOR':
    default:
      return {
        id: gateId,
        type,
        x,
        y,
        width: w,
        height: h,
        label: type,
        inputs: [
          { id: 'in0', type: 'input', label: 'A', relX: 0, relY: h * 0.3, value: false },
          { id: 'in1', type: 'input', label: 'B', relX: 0, relY: h * 0.7, value: false },
        ],
        outputs: [{ id: 'out0', type: 'output', label: 'Q', relX: w, relY: h / 2, value: false }],
      };
  }
}

/**
 * Simulate circuit signal propagation
 */
export function simulateCircuit(gates: CircuitGate[], wires: CircuitWire[]): CircuitGate[] {
  // Clone gates to compute next state
  const updatedGates = gates.map((g) => ({
    ...g,
    inputs: g.inputs.map((p) => ({ ...p })),
    outputs: g.outputs.map((p) => ({ ...p })),
  }));

  const gateMap = new Map<string, CircuitGate>();
  updatedGates.forEach((g) => gateMap.set(g.id, g));

  // Run up to 6 relaxation passes for feedback loops
  for (let pass = 0; pass < 6; pass++) {
    // 1. Evaluate gates internal logic
    updatedGates.forEach((gate) => {
      if (gate.type === 'SWITCH') {
        if (gate.outputs[0]) {
          gate.outputs[0].value = !!gate.state;
        }
      } else if (gate.type === 'NOT') {
        const inVal = gate.inputs[0]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = !inVal;
      } else if (gate.type === 'AND') {
        const a = gate.inputs[0]?.value ?? false;
        const b = gate.inputs[1]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = a && b;
      } else if (gate.type === 'OR') {
        const a = gate.inputs[0]?.value ?? false;
        const b = gate.inputs[1]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = a || b;
      } else if (gate.type === 'XOR') {
        const a = gate.inputs[0]?.value ?? false;
        const b = gate.inputs[1]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = a !== b;
      } else if (gate.type === 'NAND') {
        const a = gate.inputs[0]?.value ?? false;
        const b = gate.inputs[1]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = !(a && b);
      } else if (gate.type === 'NOR') {
        const a = gate.inputs[0]?.value ?? false;
        const b = gate.inputs[1]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = !(a || b);
      } else if (gate.type === 'XNOR') {
        const a = gate.inputs[0]?.value ?? false;
        const b = gate.inputs[1]?.value ?? false;
        if (gate.outputs[0]) gate.outputs[0].value = a === b;
      } else if (gate.type === 'LED') {
        // LED reflects input
      }
    });

    // 2. Propagate signals across wires
    wires.forEach((wire) => {
      const fromG = gateMap.get(wire.fromGateId);
      const toG = gateMap.get(wire.toGateId);
      if (fromG && toG) {
        const fromPin = fromG.outputs.find((p) => p.id === wire.fromPinId);
        const toPin = toG.inputs.find((p) => p.id === wire.toPinId);
        if (fromPin && toPin) {
          toPin.value = fromPin.value;
        }
      }
    });
  }

  return updatedGates;
}

/**
 * Generate Truth Table for current circuit
 */
export function generateTruthTable(gates: CircuitGate[], wires: CircuitWire[]): TruthTableRow[] {
  const switchGates = gates.filter((g) => g.type === 'SWITCH');
  const ledGates = gates.filter((g) => g.type === 'LED');

  if (switchGates.length === 0 || switchGates.length > 5) return [];

  const numCombinations = 1 << switchGates.length;
  const rows: TruthTableRow[] = [];

  for (let i = 0; i < numCombinations; i++) {
    // Set switches state based on binary representation
    const testGates = gates.map((g) => {
      const sIdx = switchGates.findIndex((sw) => sw.id === g.id);
      if (sIdx >= 0) {
        const isHigh = Boolean((i >> (switchGates.length - 1 - sIdx)) & 1);
        return { ...g, state: isHigh };
      }
      return g;
    });

    const resultGates = simulateCircuit(testGates, wires);

    const inputsMap: Record<string, boolean> = {};
    switchGates.forEach((sw, sIdx) => {
      const isHigh = Boolean((i >> (switchGates.length - 1 - sIdx)) & 1);
      inputsMap[sw.label || `SW ${sIdx + 1}`] = isHigh;
    });

    const outputsMap: Record<string, boolean> = {};
    ledGates.forEach((led, lIdx) => {
      const target = resultGates.find((g) => g.id === led.id);
      outputsMap[led.label || `LED ${lIdx + 1}`] = target?.inputs[0]?.value ?? false;
    });

    rows.push({ inputs: inputsMap, outputs: outputsMap });
  }

  return rows;
}

/**
 * Built-in Circuit Presets
 */
export function getPresetCircuits(name: 'half_adder' | 'full_adder' | 'sr_latch'): {
  gates: CircuitGate[];
  wires: CircuitWire[];
} {
  if (name === 'half_adder') {
    const swA = createGate('SWITCH', 80, 100, 'sw_a');
    swA.label = 'A (입력 1)';
    const swB = createGate('SWITCH', 80, 260, 'sw_b');
    swB.label = 'B (입력 2)';

    const xorGate = createGate('XOR', 300, 100, 'gate_xor');
    const andGate = createGate('AND', 300, 260, 'gate_and');

    const ledSum = createGate('LED', 520, 100, 'led_sum');
    ledSum.label = '합 (SUM)';
    const ledCarry = createGate('LED', 520, 260, 'led_carry');
    ledCarry.label = '올림 (CARRY)';

    const wires: CircuitWire[] = [
      { id: 'w1', fromGateId: 'sw_a', fromPinId: 'out0', toGateId: 'gate_xor', toPinId: 'in0' },
      { id: 'w2', fromGateId: 'sw_b', fromPinId: 'out0', toGateId: 'gate_xor', toPinId: 'in1' },
      { id: 'w3', fromGateId: 'sw_a', fromPinId: 'out0', toGateId: 'gate_and', toPinId: 'in0' },
      { id: 'w4', fromGateId: 'sw_b', fromPinId: 'out0', toGateId: 'gate_and', toPinId: 'in1' },
      { id: 'w5', fromGateId: 'gate_xor', fromPinId: 'out0', toGateId: 'led_sum', toPinId: 'in0' },
      {
        id: 'w6',
        fromGateId: 'gate_and',
        fromPinId: 'out0',
        toGateId: 'led_carry',
        toPinId: 'in0',
      },
    ];

    return { gates: [swA, swB, xorGate, andGate, ledSum, ledCarry], wires };
  }

  // Default SR Latch
  const swS = createGate('SWITCH', 80, 90, 'sw_s');
  swS.label = 'SET (S)';
  const swR = createGate('SWITCH', 80, 270, 'sw_r');
  swR.label = 'RESET (R)';

  const nor1 = createGate('NOR', 300, 90, 'nor_1');
  const nor2 = createGate('NOR', 300, 270, 'nor_2');

  const ledQ = createGate('LED', 520, 90, 'led_q');
  ledQ.label = 'Q (출력)';
  const ledQbar = createGate('LED', 520, 270, 'led_qbar');
  ledQbar.label = 'Q̄ (반전)';

  const wires: CircuitWire[] = [
    { id: 'w1', fromGateId: 'sw_s', fromPinId: 'out0', toGateId: 'nor_1', toPinId: 'in0' },
    { id: 'w2', fromGateId: 'sw_r', fromPinId: 'out0', toGateId: 'nor_2', toPinId: 'in1' },
    { id: 'w3', fromGateId: 'nor_1', fromPinId: 'out0', toGateId: 'led_q', toPinId: 'in0' },
    { id: 'w4', fromGateId: 'nor_2', fromPinId: 'out0', toGateId: 'led_qbar', toPinId: 'in0' },
    { id: 'w5', fromGateId: 'nor_1', fromPinId: 'out0', toGateId: 'nor_2', toPinId: 'in0' },
    { id: 'w6', fromGateId: 'nor_2', fromPinId: 'out0', toGateId: 'nor_1', toPinId: 'in1' },
  ];

  return { gates: [swS, swR, nor1, nor2, ledQ, ledQbar], wires };
}
