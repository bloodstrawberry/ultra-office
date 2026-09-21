export interface TouchColor {
  bg: string;
  border: string;
  glow: string;
  name: string;
}

/**
 * Generates a color with maximum hue separation using the Golden Ratio angle (137.508°).
 * Mathematically guarantees that consecutive fingers get dramatically different hues across the color spectrum.
 */
export function getGoldenRatioTouchColor(index: number, startHue: number): TouchColor {
  const goldenAngle = 137.507764;
  const hue = Math.round((startHue + index * goldenAngle) % 360);
  const saturation = 92;
  const lightness = 56;

  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    border: `hsl(${hue}, 100%, 76%)`,
    glow: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.55)`,
    name: `Hue ${hue}`,
  };
}

/**
 * Returns a session-randomized list of 20 maximally-contrasted touch colors
 */
export function getShuffledTouchColors(): TouchColor[] {
  const startHue = Math.floor(Math.random() * 360);
  const colors: TouchColor[] = [];
  for (let i = 0; i < 20; i++) {
    colors.push(getGoldenRatioTouchColor(i, startHue));
  }
  return colors;
}
