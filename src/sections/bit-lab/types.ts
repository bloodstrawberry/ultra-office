export interface Float32Decomposition {
  signBit: number; // 0 (+) or 1 (-)
  exponentBits: string; // 8 bits e.g. "10000001"
  mantissaBits: string; // 23 bits
  exponentRaw: number; // 0 ~ 255
  exponentBiased: number; // exponentRaw - 127
  mantissaFraction: number; // 1.xxxx or 0.xxxx
  actualDecimal: number;
  hex: string;
  isSpecial: boolean;
  specialLabel?: string; // NaN, +Infinity, -Infinity
}

export type BitOperation = 'AND' | 'OR' | 'XOR' | 'NOT' | 'SHL' | 'SHR' | 'USHR';
