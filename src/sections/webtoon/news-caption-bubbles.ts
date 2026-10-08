import {
  CAPTION_STYLES,
  type CaptionStyleId,
  type NewsCaptionConfig,
  DEFAULT_NEWS_CAPTION_CONFIG,
  createDefaultElementsForStyle,
} from 'src/sections/photo/utils/news-caption-presets';

export const NEWS_BUBBLE_STYLES = [
  { shape: 'captionHuman', style: 'human-theater' },
  { shape: 'captionKbs', style: 'kbs-news' },
  { shape: 'captionMbc', style: 'mbc-news' },
  { shape: 'captionSbs', style: 'sbs-news' },
  { shape: 'captionJtbc', style: 'jtbc-news' },
  { shape: 'captionYtn', style: 'ytn-news' },
  { shape: 'captionCnn', style: 'cnn-news' },
  { shape: 'captionInvestigative', style: 'investigative' },
  { shape: 'captionVarietyNews', style: 'variety-meme' },
] as const;

export function getNewsStyle(shape: string) {
  const mapping = NEWS_BUBBLE_STYLES.find((item) => item.shape === shape);
  return mapping ? CAPTION_STYLES.find((style) => style.id === mapping.style) : undefined;
}

export function createNewsBubbleConfig(shape: string): NewsCaptionConfig | undefined {
  const preset = getNewsStyle(shape);
  if (!preset) return undefined;
  const defaults = preset.defaultConfig;
  return {
    ...DEFAULT_NEWS_CAPTION_CONFIG,
    ...defaults,
    styleId: preset.id as CaptionStyleId,
    elements: createDefaultElementsForStyle(
      preset.id,
      defaults.headline,
      defaults.subText,
      defaults.badgeText,
      defaults.locationText
    ),
    selectedElementId: 'headline',
  };
}
