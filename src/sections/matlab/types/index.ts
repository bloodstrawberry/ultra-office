// ----------------------------------------------------------------------

export type MatlabVariableType =
  | 'double'
  | 'matrix'
  | 'vector'
  | 'char'
  | 'string'
  | 'logical'
  | 'struct'
  | 'complex'
  | 'function_handle';

export interface MatlabVariable {
  name: string;
  value: any;
  typeName: MatlabVariableType;
  size: [number, number];
  sizeStr: string;
  min?: number | null;
  max?: number | null;
  preview: string;
  isNumericArray: boolean;
}

export interface MatlabPlotTrace {
  x?: any[];
  y?: any[];
  z?: any[] | any[][];
  type?: string;
  mode?: string;
  name?: string;
  marker?: Record<string, any>;
  line?: Record<string, any>;
  colorscale?: string | any[];
  showscale?: boolean;
  opacity?: number;
  [key: string]: any;
}

export interface MatlabFigure {
  id: string;
  figureNumber: number;
  title: string;
  traces: MatlabPlotTrace[];
  layout: Record<string, any>;
  config?: Record<string, any>;
  createdAt: number;
}

export interface MatlabFile {
  id: string;
  name: string;
  content: string;
  isModified?: boolean;
  isProtected?: boolean;
}

export interface MatlabCommandLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'plot-notify';
  content: string;
  timestamp: number;
}

export type MatlabToolstripTab = 'HOME' | 'PLOTS' | 'APPS' | 'EDITOR' | 'HELP';

export type MatlabLayoutPreset = 'standard' | 'three-column' | 'wide-plot' | 'editor-focus';

export interface MatlabAppConfig {
  type: 'linalg' | 'fft' | 'ode' | 'matrix-generator';
  title: string;
  isOpen: boolean;
}
