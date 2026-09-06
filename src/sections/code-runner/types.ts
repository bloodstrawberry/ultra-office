// ----------------------------------------------------------------------

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'html'
  | 'node-server'
  | 'python'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'java'
  | 'go'
  | 'sql'
  | 'ruby'
  | 'php'
  | 'lua'
  | 'bash'
  | 'rust';

export type RunnerEngine =
  | 'webcontainer'
  | 'pyodide'
  | 'wasm'
  | 'sql'
  | 'lua'
  | 'ruby'
  | 'php'
  | 'html-sandbox'
  | 'react-live';

export type ExecutionStatus =
  | 'idle'
  | 'booting'
  | 'installing'
  | 'running'
  | 'stopping'
  | 'error'
  | 'success';

export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface CodeTemplate {
  id: string;
  title: string;
  category:
    | 'JavaScript/Node'
    | 'TypeScript'
    | 'Python'
    | 'Database & SQL'
    | 'Web & Server'
    | 'Backend & Scripting'
    | 'Backend & Server'
    | 'Frontend & UI'
    | 'Systems & Native'
    | 'Algorithms & CS'
    | string;
  language: SupportedLanguage;
  engine: RunnerEngine;
  description: string;
  files: Record<string, string>;
  mainFile: string;
  isServer?: boolean;
  defaultPort?: number;
  entryCommand?: string;
  tags: string[];
}

export interface PlotOutput {
  id: string;
  title: string;
  dataUrl: string;
  timestamp: number;
}

export interface SystemDiagnosticInfo {
  isCrossOriginIsolated: boolean;
  hasSharedArrayBuffer: boolean;
  webContainerReady: boolean;
  pyodideReady: boolean;
  browserAgent: string;
  memoryUsageMb?: number;
}

export interface RunnerState {
  status: ExecutionStatus;
  currentEngine: RunnerEngine;
  activePort: number | null;
  previewUrl: string | null;
  exitCode: number | null;
  statusMessage: string;
  runningSince: number | null;
}

export type CodeRunnerStyleMode = 'classic' | 'vscode';
