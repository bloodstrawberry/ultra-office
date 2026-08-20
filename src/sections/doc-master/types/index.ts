export type OfficeTabType =
  | 'word-scratch'
  | 'word-template'
  | 'word-viewer'
  | 'pptx-studio'
  | 'markdown-studio'
  | 'batch-hub';

// ----------------------------------------------------------------------
// Word (DOCX) Models
// ----------------------------------------------------------------------

export interface WordDocSection {
  id: string;
  type: 'heading1' | 'heading2' | 'paragraph' | 'bullet' | 'table' | 'quote' | 'callout';
  content: string;
  tableData?: string[][]; // For table rows/cols
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface WordDocumentMetadata {
  title: string;
  subtitle: string;
  author: string;
  company: string;
  date: string;
  version: string;
  headerText: string;
  footerText: string;
  themeColor: string;
  accentColor: string;
}

export interface WordTemplateConfig {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  defaultData: Record<string, string>;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'number' | 'select';
    placeholder?: string;
    options?: string[];
  }[];
  sampleContent: string;
}

// ----------------------------------------------------------------------
// PowerPoint (PPTX) Models
// ----------------------------------------------------------------------

export type PptThemeId = 'navy-tech' | 'minimal-mono' | 'startup-gradient' | 'executive-dark';

export interface PptTheme {
  id: PptThemeId;
  name: string;
  bgColor: string;
  cardBg: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

export type SlideLayoutType =
  | 'title'
  | 'agenda'
  | 'content-2col'
  | 'chart-bar'
  | 'chart-pie'
  | 'kpi-cards'
  | 'timeline'
  | 'team'
  | 'quote'
  | 'conclusion';

export interface SlideItem {
  id: string;
  layout: SlideLayoutType;
  title: string;
  subtitle?: string;
  bodyText?: string;
  bullets?: string[];
  leftColText?: string;
  rightColText?: string;
  chartLabels?: string[];
  chartData?: number[];
  chartTitle?: string;
  kpiList?: { label: string; value: string; desc?: string }[];
  timelineSteps?: { step: string; title: string; desc: string }[];
  teamMembers?: { name: string; role: string; desc: string }[];
  speakerNotes?: string;
}

export interface PptDeck {
  title: string;
  author: string;
  company: string;
  themeId: PptThemeId;
  slides: SlideItem[];
}

// ----------------------------------------------------------------------
// Markdown Models
// ----------------------------------------------------------------------

export interface MarkdownTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

// ----------------------------------------------------------------------
// Batch Generator Models
// ----------------------------------------------------------------------

export interface BatchItemData {
  id: string;
  [key: string]: string;
}
