export interface FortuneSpreadsheetOptions {
  rowLimit?: number;
  columnLimit?: number;
  showToolbar?: boolean;
  showFormulaBar?: boolean;
  showSheetTabs?: boolean;
  lang?: 'ko' | 'en' | 'zh';
  allowEdit?: boolean;
  toolbarItems?: string[];
}

export const DEFAULT_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  'format-painter',
  'clear-format',
  '|',
  'font-size',
  '|',
  'bold',
  'italic',
  'strike-through',
  'underline',
  '|',
  'font-color',
  'background',
  'border',
  'merge-cell',
  '|',
  'horizontal-align',
  'vertical-align',
  'text-wrap',
  'text-rotation',
  '|',
  'freeze',
  'sort',
  'comment',
  'quick-formula',
  'image',
  'link',
];

export const DEFAULT_OPTIONS: FortuneSpreadsheetOptions = {
  rowLimit: 50,
  columnLimit: 20,
  showToolbar: true,
  showFormulaBar: true,
  showSheetTabs: true,
  lang: 'ko',
  allowEdit: true,
  toolbarItems: DEFAULT_TOOLBAR_ITEMS,
};
