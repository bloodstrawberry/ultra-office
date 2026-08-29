const isBrowser = typeof window !== 'undefined';

/**
 * Storage helpers for Algorithm Visualizer (Safe for SSR/Hydration)
 */

export const getLocalSync = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setLocalSync = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota errors
  }
};

export const removeLocalSync = (key: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};

// ============================================================
// Visualizer Preferences Storage Helper
// ============================================================
export interface VisualizerUserPrefs {
  speed: number;
  soundEnabled: boolean;
  arraySize: number;
  recentAlgorithms: string[];
  completedAlgorithms: string[];
  themeId?: string;
}

const VISUALIZER_PREFS_KEY = 'ultra_algo_visualizer_prefs_v1';

export const DEFAULT_VISUALIZER_PREFS: VisualizerUserPrefs = {
  speed: 1,
  soundEnabled: true,
  arraySize: 12,
  recentAlgorithms: ['bubbleSort', 'dijkstra', 'binarySearch'],
  completedAlgorithms: [],
  themeId: 'light',
};

export const getVisualizerPrefsSync = (): VisualizerUserPrefs => {
  const raw = getLocalSync(VISUALIZER_PREFS_KEY);
  if (!raw) return { ...DEFAULT_VISUALIZER_PREFS };
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_VISUALIZER_PREFS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_VISUALIZER_PREFS };
  }
};

export const setVisualizerPrefsSync = (prefs: Partial<VisualizerUserPrefs>): void => {
  const current = getVisualizerPrefsSync();
  const updated = { ...current, ...prefs };
  setLocalSync(VISUALIZER_PREFS_KEY, JSON.stringify(updated));
};

// ============================================================
// Sound Settings Storage Helper
// ============================================================
const SFX_MUTED_KEY = 'ultra_algo_sfx_muted';

export interface SoundSettings {
  sfxMuted: boolean;
}

export const getSoundSettingsSync = (): SoundSettings => {
  const savedSfxMuted = getLocalSync(SFX_MUTED_KEY);
  const sfxMuted = savedSfxMuted === 'true';
  return { sfxMuted };
};

export const setSfxMutedStorage = (muted: boolean): void => {
  setLocalSync(SFX_MUTED_KEY, String(muted));
};
