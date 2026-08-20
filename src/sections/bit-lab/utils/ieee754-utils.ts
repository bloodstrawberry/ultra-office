import type { Float32Decomposition } from '../types';

// ----------------------------------------------------------------------

const buffer = new ArrayBuffer(4);
const floatView = new Float32Array(buffer);
const uintView = new Uint32Array(buffer);

/**
 * Deconstruct float into IEEE-754 components
 */
export function decomposeFloat32(num: number): Float32Decomposition {
  floatView[0] = num;
  const uint32 = uintView[0] ?? 0;
  const binary32 = uint32.toString(2).padStart(32, '0');

  const signBit = parseInt(binary32[0] || '0', 10);
  const exponentBits = binary32.slice(1, 9);
  const mantissaBits = binary32.slice(9);

  const exponentRaw = parseInt(exponentBits, 2);
  const exponentBiased = exponentRaw - 127;

  // Calculate fractional mantissa: sum(bit * 2^-i)
  let mantissaFraction = 0;
  for (let i = 0; i < mantissaBits.length; i++) {
    if (mantissaBits[i] === '1') {
      mantissaFraction += Math.pow(2, -(i + 1));
    }
  }

  // Handle special values
  let isSpecial = false;
  let specialLabel: string | undefined;

  if (exponentRaw === 255) {
    isSpecial = true;
    if (mantissaFraction === 0) {
      specialLabel = signBit === 1 ? '-Infinity (음의 무한대)' : '+Infinity (양의 무한대)';
    } else {
      specialLabel = 'NaN (Not a Number)';
    }
  } else if (exponentRaw === 0 && mantissaFraction === 0) {
    isSpecial = true;
    specialLabel = signBit === 1 ? '-0.0' : '+0.0';
  }

  const effectiveMantissa = exponentRaw === 0 ? mantissaFraction : 1 + mantissaFraction;

  return {
    signBit,
    exponentBits,
    mantissaBits,
    exponentRaw,
    exponentBiased,
    mantissaFraction: effectiveMantissa,
    actualDecimal: floatView[0] ?? 0,
    hex: '0x' + uint32.toString(16).toUpperCase().padStart(8, '0'),
    isSpecial,
    specialLabel,
  };
}

/**
 * Reconstruct float from 32-bit binary string
 */
export function bitsToFloat32(bits: string): Float32Decomposition {
  const cleanBits = bits.padEnd(32, '0').slice(0, 32);
  const uint32 = parseInt(cleanBits, 2);
  uintView[0] = uint32;
  return decomposeFloat32(floatView[0] ?? 0);
}
