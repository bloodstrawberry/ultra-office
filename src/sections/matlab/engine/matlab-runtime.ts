import type { MatlabFigure, MatlabVariable, MatlabPlotTrace, MatlabCommandLog } from '../types';

import * as math from 'mathjs';

import { preprocessMatlabLine } from './matlab-parser';

// ----------------------------------------------------------------------

let globalLogCounter = 0;
function createUniqueLogId(prefix: string): string {
  globalLogCounter += 1;
  return `${prefix}-${Date.now()}-${globalLogCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface RuntimeExecutionResult {
  success: boolean;
  logs: MatlabCommandLog[];
  figures: MatlabFigure[];
  variables: Record<string, MatlabVariable>;
  errorMessage?: string;
}

export class MatlabRuntime {
  private mathInstance: math.MathJsInstance;
  private scope: Record<string, any> = {};
  private figures: Map<number, MatlabFigure> = new Map();
  private currentFigureNum: number = 1;
  private holdState: Map<number, boolean> = new Map();
  private currentSubplot: { rows: number; cols: number; index: number } | null = null;
  private ticTime: number = 0;

  constructor() {
    this.mathInstance = math.create(math.all);
    this.initCustomFunctions();
    this.clearWorkspace();
  }

  /**
   * Resets and clears the entire workspace
   */
  public clearWorkspace(): void {
    this.scope = {};
    this.figures.clear();
    this.currentFigureNum = 1;
    this.holdState.clear();
    this.currentSubplot = null;
    this.ticTime = 0;
  }

  /**
   * Resets only plots / figures
   */
  public clearFigures(): void {
    this.figures.clear();
    this.currentFigureNum = 1;
    this.holdState.clear();
  }

  /**
   * Registers all MATLAB specific functions into mathjs instance
   */
  private initCustomFunctions(): void {
    // Helper: to flat JS Array or number
    const toArray = (val: any): any => {
      if (val && typeof val.toArray === 'function') {
        return val.toArray();
      }
      return val;
    };

    // Helper: flatten nested matrix
    const flatten = (arr: any): number[] => {
      if (!Array.isArray(arr)) return [Number(arr) || 0];
      return arr.flat(Infinity).map((v) => Number(v) || 0);
    };

    // --- 1. Array & Matrix Creation ---
    const zeros = (...args: any[]) => {
      const dims = args.length === 1 ? [args[0], args[0]] : args.map(Number);
      if (dims.length === 1) dims.push(dims[0]);
      return math.zeros(dims);
    };

    const ones = (...args: any[]) => {
      const dims = args.length === 1 ? [args[0], args[0]] : args.map(Number);
      if (dims.length === 1) dims.push(dims[0]);
      return math.ones(dims);
    };

    const eye = (...args: any[]) => {
      const n = Number(args[0]) || 1;
      const m = args.length > 1 ? Number(args[1]) : n;
      return math.identity([n, m]);
    };

    const rand = (...args: any[]) => {
      const r = Number(args[0]) || 1;
      const c = args.length > 1 ? Number(args[1]) : r;
      const mat: number[][] = [];
      for (let i = 0; i < r; i++) {
        const row: number[] = [];
        for (let j = 0; j < c; j++) row.push(Math.random());
        mat.push(row);
      }
      return r === 1 ? mat[0] : mat;
    };

    const randn = (...args: any[]) => {
      const r = Number(args[0]) || 1;
      const c = args.length > 1 ? Number(args[1]) : r;
      // Box-Muller transform for standard normal distribution N(0, 1)
      const gaussian = () => {
        let u = 0,
          v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      };

      const mat: number[][] = [];
      for (let i = 0; i < r; i++) {
        const row: number[] = [];
        for (let j = 0; j < c; j++) row.push(Number(gaussian().toFixed(6)));
        mat.push(row);
      }
      return r === 1 ? mat[0] : mat;
    };

    const magic = (n: number) => {
      n = Math.max(1, Math.floor(n));
      const mat = Array.from({ length: n }, () => Array(n).fill(0));
      let row = 0;
      let col = Math.floor(n / 2);
      for (let k = 1; k <= n * n; k++) {
        mat[row][col] = k;
        const nextRow = (row - 1 + n) % n;
        const nextCol = (col + 1) % n;
        if (mat[nextRow][nextCol] !== 0) {
          row = (row + 1) % n;
        } else {
          row = nextRow;
          col = nextCol;
        }
      }
      return mat;
    };

    const linspace = (start: number, stop: number, n: number = 100) => {
      n = Math.max(2, Math.floor(n));
      const step = (stop - start) / (n - 1);
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(Number((start + i * step).toFixed(8)));
      }
      return arr;
    };

    const logspace = (a: number, b: number, n: number = 50) => {
      n = Math.max(2, Math.floor(n));
      const expStep = (b - a) / (n - 1);
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(Math.pow(10, a + i * expStep));
      }
      return arr;
    };

    const meshgrid = (xVec: any, yVec?: any) => {
      const x = flatten(toArray(xVec));
      const y = yVec ? flatten(toArray(yVec)) : x;
      const X: number[][] = [];
      const Y: number[][] = [];
      for (let i = 0; i < y.length; i++) {
        X.push([...x]);
        Y.push(new Array(x.length).fill(y[i]));
      }
      return [X, Y];
    };

    // --- 2. Signal Processing & FFT ---
    const fft = (signalInput: any) => {
      const arr = flatten(toArray(signalInput));
      const N = arr.length;
      if (N === 0) return [];

      // Cooley-Tukey Radix-2 FFT or direct DFT for arbitrary lengths
      const isPowerOf2 = Math.log2(N) % 1 === 0;
      if (isPowerOf2) {
        return cooleyTukeyFFT(arr.map((v) => math.complex(v, 0)));
      }
      return dft(arr);
    };

    const ifft = (signalInput: any) => {
      const arr = toArray(signalInput);
      const N = arr.length;
      if (N === 0) return [];
      const complexArr = arr.map((v: any) =>
        typeof v === 'object' && 're' in v ? math.complex(v.re, -v.im) : math.complex(v, 0)
      );
      const transformed = cooleyTukeyFFT(complexArr);
      return transformed.map((v) => math.complex(v.re / N, -v.im / N));
    };

    const fftshift = (arrInput: any) => {
      const arr = toArray(arrInput);
      const mid = Math.floor(arr.length / 2);
      return [...arr.slice(mid), ...arr.slice(0, mid)];
    };

    // Cooley Tukey FFT implementation
    const cooleyTukeyFFT = (x: math.Complex[]): math.Complex[] => {
      const N = x.length;
      if (N <= 1) return x;

      const even: math.Complex[] = [];
      const odd: math.Complex[] = [];
      for (let i = 0; i < N; i++) {
        if (i % 2 === 0) even.push(x[i]);
        else odd.push(x[i]);
      }

      const q = cooleyTukeyFFT(even);
      const r = cooleyTukeyFFT(odd);

      const y: math.Complex[] = new Array(N);
      for (let k = 0; k < N / 2; k++) {
        const kth = (-2 * Math.PI * k) / N;
        const wk = math.complex(Math.cos(kth), Math.sin(kth));
        const wk_rk = math.multiply(wk, r[k]) as math.Complex;
        y[k] = math.add(q[k], wk_rk) as math.Complex;
        y[k + N / 2] = math.subtract(q[k], wk_rk) as math.Complex;
      }
      return y;
    };

    // Direct Discrete Fourier Transform (fallback for non-powers of 2)
    const dft = (x: number[]): math.Complex[] => {
      const N = x.length;
      const X: math.Complex[] = [];
      for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
          const phi = (2 * Math.PI * k * n) / N;
          re += x[n] * Math.cos(phi);
          im -= x[n] * Math.sin(phi);
        }
        X.push(math.complex(Number(re.toFixed(8)), Number(im.toFixed(8))));
      }
      return X;
    };

    // --- 3. Matrix & Linear Algebra Operations ---
    const eig = (matInput: any) => {
      const A = toArray(matInput);
      try {
        const res = math.eigs(A);
        const vectors = (res.eigenvectors || []).map((e: any) => toArray(e.vector));
        return [vectors, math.diag(res.values as any)];
      } catch {
        return [[], []];
      }
    };

    // --- 4. Plot & Figure Graphics Engine ---
    const figure = (num: number = 1) => {
      this.currentFigureNum = Math.max(1, Math.floor(Number(num) || 1));
      if (!this.figures.has(this.currentFigureNum)) {
        this.figures.set(this.currentFigureNum, {
          id: `fig-${this.currentFigureNum}`,
          figureNumber: this.currentFigureNum,
          title: `Figure ${this.currentFigureNum}`,
          traces: [],
          layout: {
            autosize: true,
            margin: { l: 50, r: 30, t: 40, b: 40 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#e0e0e0', family: 'Inter, sans-serif' },
            xaxis: { gridcolor: '#333333', zerolinecolor: '#555555' },
            yaxis: { gridcolor: '#333333', zerolinecolor: '#555555' },
          },
          createdAt: Date.now(),
        });
      }
      return this.currentFigureNum;
    };

    const getActiveFigure = (): MatlabFigure => {
      if (!this.figures.has(this.currentFigureNum)) {
        figure(this.currentFigureNum);
      }
      return this.figures.get(this.currentFigureNum)!;
    };

    const hold = (state: string = 'on') => {
      const isOn = String(state).toLowerCase() !== 'off';
      this.holdState.set(this.currentFigureNum, isOn);
      return isOn;
    };

    const plot = (arg1: any, arg2?: any, _style?: string) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) {
        fig.traces = [];
      }

      let x: any[], y: any[];
      if (arg2 !== undefined) {
        x = flatten(toArray(arg1));
        y = flatten(toArray(arg2));
      } else {
        y = flatten(toArray(arg1));
        x = Array.from({ length: y.length }, (_, i) => i + 1);
      }

      const trace: MatlabPlotTrace = {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        name: `Trace ${fig.traces.length + 1}`,
        line: { width: 2.2 },
      };

      fig.traces.push(trace);
      return fig;
    };

    const scatter = (arg1: any, arg2: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const x = flatten(toArray(arg1));
      const y = flatten(toArray(arg2));

      const trace: MatlabPlotTrace = {
        x,
        y,
        type: 'scatter',
        mode: 'markers',
        name: `Scatter ${fig.traces.length + 1}`,
        marker: { size: 6, opacity: 0.8 },
      };

      fig.traces.push(trace);
      return fig;
    };

    const bar = (arg1: any, arg2?: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      let x: any[], y: any[];
      if (arg2 !== undefined) {
        x = flatten(toArray(arg1));
        y = flatten(toArray(arg2));
      } else {
        y = flatten(toArray(arg1));
        x = Array.from({ length: y.length }, (_, i) => i + 1);
      }

      const trace: MatlabPlotTrace = {
        x,
        y,
        type: 'bar',
        name: `Bar ${fig.traces.length + 1}`,
      };

      fig.traces.push(trace);
      return fig;
    };

    const stem = (arg1: any, arg2?: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      let x: any[], y: any[];
      if (arg2 !== undefined) {
        x = flatten(toArray(arg1));
        y = flatten(toArray(arg2));
      } else {
        y = flatten(toArray(arg1));
        x = Array.from({ length: y.length }, (_, i) => i + 1);
      }

      // Stem is represented as markers with lines to y=0
      const trace: MatlabPlotTrace = {
        x,
        y,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Stem ${fig.traces.length + 1}`,
        line: { shape: 'hv' },
        marker: { size: 6 },
      };

      fig.traces.push(trace);
      return fig;
    };

    const histogram = (dataInput: any, nbins: number = 30) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const x = flatten(toArray(dataInput));
      const trace: MatlabPlotTrace = {
        x,
        type: 'histogram',
        nbinsx: nbins,
        name: `Hist ${fig.traces.length + 1}`,
      };
      fig.traces.push(trace);
      return fig;
    };

    const surf = (X: any, Y: any, Z: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const zMat = toArray(Z);
      const xMat = toArray(X);
      const yMat = toArray(Y);

      const trace: MatlabPlotTrace = {
        x: Array.isArray(xMat[0]) ? xMat[0] : xMat,
        y: Array.isArray(yMat) && Array.isArray(yMat[0]) ? yMat.map((r: any) => r[0]) : yMat,
        z: zMat,
        type: 'surface',
        colorscale: 'Viridis',
        name: `Surf ${fig.traces.length + 1}`,
        showscale: true,
      };

      fig.traces.push(trace);
      return fig;
    };

    const mesh = (X: any, Y: any, Z: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const zMat = toArray(Z);
      const trace: MatlabPlotTrace = {
        z: zMat,
        type: 'surface',
        colorscale: 'Jet',
        contours: {
          x: { show: true },
          y: { show: true },
          z: { show: true },
        },
        opacity: 0.85,
        name: `Mesh ${fig.traces.length + 1}`,
      };

      fig.traces.push(trace);
      return fig;
    };

    const contour = (X: any, Y: any, Z: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const zMat = toArray(Z);
      const xMat = toArray(X);
      const yMat = toArray(Y);

      const trace: MatlabPlotTrace = {
        x: Array.isArray(xMat[0]) ? xMat[0] : xMat,
        y: Array.isArray(yMat) && Array.isArray(yMat[0]) ? yMat.map((r: any) => r[0]) : yMat,
        z: zMat,
        type: 'contour',
        colorscale: 'Viridis',
        name: `Contour ${fig.traces.length + 1}`,
      };

      fig.traces.push(trace);
      return fig;
    };

    const plot3 = (xInput: any, yInput: any, zInput: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const x = flatten(toArray(xInput));
      const y = flatten(toArray(yInput));
      const z = flatten(toArray(zInput));

      const trace: MatlabPlotTrace = {
        x,
        y,
        z,
        type: 'scatter3d',
        mode: 'lines',
        name: `Plot3D ${fig.traces.length + 1}`,
        line: { width: 3, color: '#38bdf8' },
      };

      fig.traces.push(trace);
      return fig;
    };

    const scatter3 = (xInput: any, yInput: any, zInput: any) => {
      const fig = getActiveFigure();
      const isHold = this.holdState.get(this.currentFigureNum) || false;
      if (!isHold) fig.traces = [];

      const x = flatten(toArray(xInput));
      const y = flatten(toArray(yInput));
      const z = flatten(toArray(zInput));

      const trace: MatlabPlotTrace = {
        x,
        y,
        z,
        type: 'scatter3d',
        mode: 'markers',
        marker: { size: 4, opacity: 0.8 },
        name: `Scatter3D ${fig.traces.length + 1}`,
      };

      fig.traces.push(trace);
      return fig;
    };

    const title = (text: string) => {
      const fig = getActiveFigure();
      fig.title = String(text);
      fig.layout.title = { text: String(text), font: { size: 14 } };
      return text;
    };

    const xlabel = (text: string) => {
      const fig = getActiveFigure();
      fig.layout.xaxis = { ...fig.layout.xaxis, title: { text: String(text) } };
      return text;
    };

    const ylabel = (text: string) => {
      const fig = getActiveFigure();
      fig.layout.yaxis = { ...fig.layout.yaxis, title: { text: String(text) } };
      return text;
    };

    const zlabel = (text: string) => {
      const fig = getActiveFigure();
      fig.layout.scene = {
        ...fig.layout.scene,
        zaxis: { title: { text: String(text) } },
      };
      return text;
    };

    const grid = (state: string = 'on') => {
      const fig = getActiveFigure();
      const show = String(state).toLowerCase() !== 'off';
      fig.layout.xaxis = { ...fig.layout.xaxis, showgrid: show };
      fig.layout.yaxis = { ...fig.layout.yaxis, showgrid: show };
      return show;
    };

    const legend = (...items: any[]) => {
      const fig = getActiveFigure();
      fig.layout.showlegend = true;
      items.forEach((item, idx) => {
        if (fig.traces[idx]) {
          fig.traces[idx].name = String(item);
        }
      });
      return items;
    };

    const clf = () => {
      const fig = getActiveFigure();
      fig.traces = [];
      return fig;
    };

    const num2str = (val: any, precision?: number) => {
      if (typeof val === 'number') {
        return precision ? val.toFixed(precision) : String(val);
      }
      return String(val);
    };

    const str2num = (str: string) => {
      const n = Number(str);
      return isNaN(n) ? [] : n;
    };

    const tic = () => {
      this.ticTime = performance.now();
    };

    const toc = () => {
      const elapsed = ((performance.now() - this.ticTime) / 1000).toFixed(6);
      return `Elapsed time is ${elapsed} seconds.`;
    };

    // Import into mathjs instance
    this.mathInstance.import(
      {
        zeros,
        ones,
        eye,
        rand,
        randn,
        magic,
        linspace,
        logspace,
        meshgrid,
        fft,
        ifft,
        fftshift,
        eig,
        figure,
        hold,
        plot,
        scatter,
        bar,
        stem,
        histogram,
        surf,
        mesh,
        contour,
        plot3,
        scatter3,
        title,
        xlabel,
        ylabel,
        zlabel,
        grid,
        legend,
        clf,
        num2str,
        str2num,
        tic,
        toc,
      },
      { override: true }
    );
  }

  /**
   * Executes a multi-line MATLAB script or command string
   */
  public execute(code: string): RuntimeExecutionResult {
    const logs: MatlabCommandLog[] = [];
    const rawLines = code.split(/\r?\n/);
    let isBlockSkipping = false;
    let blockBuffer = '';
    let blockDepth = 0;

    // Reset figures if starting a full script execution
    // (figure(1), etc will re-populate)

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i];
      const trimmed = rawLine.trim();

      // Skip empty lines or pure comment lines
      if (!trimmed || trimmed.startsWith('%')) {
        continue;
      }

      // Check for control block start (for, while, if, function)
      const isControlStart = /^(for\b|while\b|if\b|function\b)/.test(trimmed);
      const isControlEnd = /^end\b/.test(trimmed);

      if (isControlStart) {
        isBlockSkipping = true;
        blockDepth++;
        blockBuffer += rawLine + '\n';
        continue;
      }

      if (isBlockSkipping) {
        blockBuffer += rawLine + '\n';
        if (isControlStart) blockDepth++;
        if (isControlEnd) {
          blockDepth--;
          if (blockDepth === 0) {
            // Execute control block via simulated JS loop execution
            isBlockSkipping = false;
            try {
              this.executeBlock(blockBuffer, logs);
            } catch (err: any) {
              logs.push({
                id: createUniqueLogId('err'),
                type: 'error',
                content: `Error in block: ${err.message || String(err)}`,
                timestamp: Date.now(),
              });
            }
            blockBuffer = '';
          }
        }
        continue;
      }

      // Single line statement execution
      try {
        this.executeStatement(trimmed, logs);
      } catch (err: any) {
        logs.push({
          id: createUniqueLogId('err'),
          type: 'error',
          content: `Line ${i + 1}: ${err.message || String(err)}`,
          timestamp: Date.now(),
        });
      }
    }

    const variables = this.extractVariables();
    const figures = Array.from(this.figures.values()).filter((f) => f.traces.length > 0);

    return {
      success: logs.every((l) => l.type !== 'error'),
      logs,
      figures,
      variables,
    };
  }

  /**
   * Executes a single statement line
   */
  public executeStatement(line: string, logs: MatlabCommandLog[]): void {
    const isSuppressed = line.endsWith(';');
    const cleanLine = preprocessMatlabLine(line);
    if (!cleanLine) return;

    // Check for special commands
    if (cleanLine === 'clc') {
      logs.push({
        id: createUniqueLogId('info'),
        type: 'info',
        content: '[Command window cleared]',
        timestamp: Date.now(),
      });
      return;
    }
    if (cleanLine === 'clear' || cleanLine === 'clear all') {
      this.clearWorkspace();
      logs.push({
        id: createUniqueLogId('info'),
        type: 'info',
        content: '[Workspace cleared]',
        timestamp: Date.now(),
      });
      return;
    }
    if (cleanLine === 'whos') {
      const vars = this.extractVariables();
      let msg = '  Name      Size         Bytes  Class\n';
      msg += '  ====      ====         =====  =====\n';
      Object.values(vars).forEach((v) => {
        msg += `  ${v.name.padEnd(8)}  ${v.sizeStr.padEnd(11)}  --     ${v.typeName}\n`;
      });
      logs.push({
        id: createUniqueLogId('out'),
        type: 'output',
        content: msg,
        timestamp: Date.now(),
      });
      return;
    }

    // Special disp(...) handling
    if (cleanLine.startsWith('disp(') && cleanLine.endsWith(')')) {
      const inner = cleanLine.substring(5, cleanLine.length - 1);
      const val = this.mathInstance.evaluate(inner, this.scope);
      logs.push({
        id: createUniqueLogId('out'),
        type: 'output',
        content: this.formatValue(val),
        timestamp: Date.now(),
      });
      return;
    }

    // Standard expression evaluation
    const result = this.mathInstance.evaluate(cleanLine, this.scope);

    // If not suppressed with semicolon, print output in MATLAB style
    if (!isSuppressed && result !== undefined) {
      const assignMatch = cleanLine.match(/^([a-zA-Z_]\w*)\s*=/);
      const varName = assignMatch ? assignMatch[1] : 'ans';
      if (!assignMatch) {
        this.scope.ans = result;
      }
      logs.push({
        id: createUniqueLogId('out'),
        type: 'output',
        content: `${varName} =\n\n${this.formatValue(result)}`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Executes compound blocks like `for i = 1:N ... end`
   */
  private executeBlock(blockStr: string, logs: MatlabCommandLog[]): void {
    const lines = blockStr.trim().split('\n');
    const header = lines[0].trim();
    const bodyLines = lines.slice(1, -1);

    // For loop pattern: for i = 1:10 or for i = 1:2:10 or for i = array
    const forMatch = header.match(/^for\s+([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (forMatch) {
      const loopVar = forMatch[1];
      const rangeExpr = preprocessMatlabLine(forMatch[2]);
      const rangeVal = this.mathInstance.evaluate(rangeExpr, this.scope);
      const items = Array.isArray(rangeVal)
        ? rangeVal
        : typeof rangeVal?.toArray === 'function'
          ? rangeVal.toArray()
          : [rangeVal];
      const flatItems = items.flat(Infinity);

      for (let k = 0; k < Math.min(flatItems.length, 10000); k++) {
        this.scope[loopVar] = flatItems[k];
        for (const bodyLine of bodyLines) {
          this.executeStatement(bodyLine.trim(), logs);
        }
      }
      return;
    }

    // Fallback: evaluate line by line
    for (const bLine of bodyLines) {
      this.executeStatement(bLine.trim(), logs);
    }
  }

  /**
   * Formats a mathjs / JS value into clean MATLAB text output
   */
  public formatValue(val: any): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return `    '${val}'`;
    if (typeof val === 'number') {
      return `    ${Number.isInteger(val) ? val : val.toFixed(4)}`;
    }
    if (typeof val === 'boolean') {
      return `    ${val ? 1 : 0}`;
    }
    if (typeof val.toArray === 'function') {
      val = val.toArray();
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return '    []';
      // 1D array
      if (!Array.isArray(val[0])) {
        const rowStr = val
          .map((v) =>
            typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(4)) : String(v)
          )
          .join('    ');
        return `    ${rowStr}`;
      }
      // 2D matrix
      return val
        .map(
          (row: any[]) =>
            '    ' +
            row
              .map((v) =>
                typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(4)) : String(v)
              )
              .join('    ')
        )
        .join('\n');
    }
    if (typeof val === 'object') {
      if ('re' in val && 'im' in val) {
        return `    ${val.re.toFixed(4)} + ${val.im.toFixed(4)}i`;
      }
      return JSON.stringify(val, null, 2);
    }
    return String(val);
  }

  /**
   * Extracts current Workspace variables for the Variable Inspector
   */
  public extractVariables(): Record<string, MatlabVariable> {
    const result: Record<string, MatlabVariable> = {};

    Object.entries(this.scope).forEach(([name, val]) => {
      // Ignore internal functions
      if (typeof val === 'function') return;

      let rawVal = val;
      if (val && typeof val.toArray === 'function') {
        rawVal = val.toArray();
      }

      let typeName: MatlabVariable['typeName'] = 'double';
      let size: [number, number] = [1, 1];
      let isNumericArray = false;
      let minVal: number | null = null;
      let maxVal: number | null = null;

      if (typeof rawVal === 'number') {
        typeName = 'double';
        size = [1, 1];
        minVal = rawVal;
        maxVal = rawVal;
      } else if (typeof rawVal === 'string') {
        typeName = 'char';
        size = [1, rawVal.length];
      } else if (typeof rawVal === 'boolean') {
        typeName = 'logical';
        size = [1, 1];
      } else if (Array.isArray(rawVal)) {
        isNumericArray = true;
        if (rawVal.length === 0) {
          typeName = 'matrix';
          size = [0, 0];
        } else if (!Array.isArray(rawVal[0])) {
          typeName = 'vector';
          size = [1, rawVal.length];
          const nums = rawVal.filter((n) => typeof n === 'number') as number[];
          if (nums.length > 0) {
            minVal = Math.min(...nums);
            maxVal = Math.max(...nums);
          }
        } else {
          typeName = 'matrix';
          size = [rawVal.length, rawVal[0]?.length || 0];
          const flatNums = rawVal.flat(Infinity).filter((n) => typeof n === 'number') as number[];
          if (flatNums.length > 0) {
            minVal = Math.min(...flatNums);
            maxVal = Math.max(...flatNums);
          }
        }
      } else if (typeof rawVal === 'object' && rawVal !== null) {
        if ('re' in rawVal && 'im' in rawVal) {
          typeName = 'complex';
          size = [1, 1];
        } else {
          typeName = 'struct';
          size = [1, 1];
        }
      }

      result[name] = {
        name,
        value: rawVal,
        typeName,
        size,
        sizeStr: `${size[0]}x${size[1]}`,
        min: minVal,
        max: maxVal,
        preview: this.formatValue(rawVal).trim().substring(0, 40),
        isNumericArray,
      };
    });

    return result;
  }
}
