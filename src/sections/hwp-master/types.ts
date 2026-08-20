export interface HwpParagraph {
  id: string;
  text: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  isBold?: boolean;
  fontSize?: number;
  isHeading?: boolean;
  headingLevel?: number;
}

export interface HwpTableCell {
  text: string;
  rowSpan?: number;
  colSpan?: number;
  isHeader?: boolean;
}

export interface HwpTable {
  id: string;
  rows: HwpTableCell[][];
  caption?: string;
}

export interface HwpSection {
  id: string;
  title?: string;
  paragraphs: HwpParagraph[];
  tables: HwpTable[];
  rawText: string;
}

export type HwpDocCategory = 'gov' | 'public' | 'military';

export interface HwpDocument {
  id?: string;
  fileName: string;
  fileSize: string;
  fileType: 'hwpx' | 'hwp' | 'sample';
  title: string;
  category?: HwpDocCategory;
  tag?: string;
  description?: string;
  creator?: string;
  lastModified?: string;
  sections: HwpSection[];
  totalParagraphs: number;
  totalTables: number;
  fullText: string;
}

export type HwpViewMode = 'preview' | 'text' | 'tables' | 'raw';
