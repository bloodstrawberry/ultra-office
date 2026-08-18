export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_VERTICAL_SETTINGS: CropSettings = {
  x: 0,
  y: 124,
  width: 636,
  height: 1048,
};

export const DEFAULT_HORIZONTAL_SETTINGS: CropSettings = {
  x: 0,
  y: 0,
  width: 1504,
  height: 741,
};

const STORAGE_KEY_VERTICAL = 'ultra_office_crop_vertical';
const STORAGE_KEY_HORIZONTAL = 'ultra_office_crop_horizontal';

export async function getVerticalCropSettings(): Promise<CropSettings> {
  if (typeof window === 'undefined') return DEFAULT_VERTICAL_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VERTICAL);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        x: typeof parsed.x === 'number' ? parsed.x : DEFAULT_VERTICAL_SETTINGS.x,
        y: typeof parsed.y === 'number' ? parsed.y : DEFAULT_VERTICAL_SETTINGS.y,
        width: typeof parsed.width === 'number' ? parsed.width : DEFAULT_VERTICAL_SETTINGS.width,
        height:
          typeof parsed.height === 'number' ? parsed.height : DEFAULT_VERTICAL_SETTINGS.height,
      };
    }
  } catch (e) {
    console.error('Failed to load vertical crop settings:', e);
  }
  return DEFAULT_VERTICAL_SETTINGS;
}

export async function saveVerticalCropSettings(settings: CropSettings): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_VERTICAL, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save vertical crop settings:', e);
  }
}

export async function getHorizontalCropSettings(): Promise<CropSettings> {
  if (typeof window === 'undefined') return DEFAULT_HORIZONTAL_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HORIZONTAL);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        x: typeof parsed.x === 'number' ? parsed.x : DEFAULT_HORIZONTAL_SETTINGS.x,
        y: typeof parsed.y === 'number' ? parsed.y : DEFAULT_HORIZONTAL_SETTINGS.y,
        width: typeof parsed.width === 'number' ? parsed.width : DEFAULT_HORIZONTAL_SETTINGS.width,
        height:
          typeof parsed.height === 'number' ? parsed.height : DEFAULT_HORIZONTAL_SETTINGS.height,
      };
    }
  } catch (e) {
    console.error('Failed to load horizontal crop settings:', e);
  }
  return DEFAULT_HORIZONTAL_SETTINGS;
}

export async function saveHorizontalCropSettings(settings: CropSettings): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_HORIZONTAL, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save horizontal crop settings:', e);
  }
}
