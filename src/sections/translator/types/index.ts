export type TranslatorTabType = 'direct' | 'multi' | 'doc';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flagEmoji?: string;
  countryName?: string;
  region?: 'asia' | 'europe' | 'americas' | 'mideast_africa' | 'other';
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  isFavorite?: boolean;
}

export interface MultiTranslationResult {
  langCode: string;
  langName: string;
  nativeName: string;
  translatedText: string;
  loading: boolean;
  error?: string;
}

export interface TranslationSettings {
  autoDetect: boolean;
  engine: 'auto' | 'translate' | 'mymemory' | 'deepl' | 'google';
  apiKey?: string;
  speechPitch: number;
  speechRate: number;
}

export interface BusinessTemplateItem {
  id: string;
  category: 'email' | 'meeting' | 'contract' | 'inquiry' | 'notice';
  categoryLabel: string;
  title: string;
  description: string;
  content: string;
}
