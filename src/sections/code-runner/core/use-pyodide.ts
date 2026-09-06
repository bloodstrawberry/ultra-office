'use client';

import { useRef, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<any>;
  loadPackage: (names: string | string[]) => Promise<void>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  setStdout: (options: { batched?: (msg: string) => void; isatty?: boolean }) => void;
  setStderr: (options: { batched?: (msg: string) => void; isatty?: boolean }) => void;
  globals: any;
  registerJsModule: (name: string, module: any) => void;
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
    __omni_plot_callback__?: (dataUrl: string) => void;
  }
}

export interface PyodideHookReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  loadPyodideRuntime: (onLog?: (msg: string) => void) => Promise<PyodideInterface | null>;
  runPython: (
    code: string,
    onStdout: (data: string) => void,
    onStderr: (data: string) => void,
    onPlot?: (dataUrl: string) => void,
    files?: Record<string, string>
  ) => Promise<{ success: boolean; result?: any; error?: string }>;
}

let globalPyodideInstance: PyodideInterface | null = null;
let globalPyodideLoadingPromise: Promise<PyodideInterface> | null = null;

export function usePyodide(): PyodideHookReturn {
  const [isReady, setIsReady] = useState(Boolean(globalPyodideInstance));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onPlotRef = useRef<((dataUrl: string) => void) | null>(null);

  const loadPyodideRuntime = useCallback(
    async (onLog?: (msg: string) => void): Promise<PyodideInterface | null> => {
      if (typeof window === 'undefined') return null;

      if (globalPyodideInstance) {
        setIsReady(true);
        return globalPyodideInstance;
      }

      setIsLoading(true);
      setError(null);
      onLog?.('\x1b[36m[Pyodide] WebAssembly Python 3.12 런타임 초기화 중...\x1b[0m\r\n');

      try {
        if (!globalPyodideLoadingPromise) {
          globalPyodideLoadingPromise = (async () => {
            // CDN 스크립트가 아직 로드되지 않은 경우 동적 스크립트 주입
            if (!window.loadPyodide) {
              await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js';
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () =>
                  reject(new Error('Pyodide CDN 스크립트를 불러오는데 실패했습니다.'));
                document.head.appendChild(script);
              });
            }

            if (!window.loadPyodide) {
              throw new Error('window.loadPyodide 함수를 찾을 수 없습니다.');
            }

            const pyodide = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/',
            });

            return pyodide;
          })();
        }

        const pyodide = await globalPyodideLoadingPromise;
        globalPyodideInstance = pyodide;

        // 전역 Matplotlib 차트 콜백 등록
        window.__omni_plot_callback__ = (dataUrl: string) => {
          if (onPlotRef.current) {
            onPlotRef.current(dataUrl);
          }
        };

        setIsReady(true);
        setIsLoading(false);
        onLog?.('\x1b[32m[Pyodide] Python 런타임이 준비되었습니다! ✨\x1b[0m\r\n');
        return pyodide;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(errMsg);
        setIsLoading(false);
        globalPyodideLoadingPromise = null;
        onLog?.(`\x1b[31m[Pyodide] 초기화 에러: ${errMsg}\x1b[0m\r\n`);
        return null;
      }
    },
    []
  );

  const runPython = useCallback(
    async (
      code: string,
      onStdout: (data: string) => void,
      onStderr: (data: string) => void,
      onPlot?: (dataUrl: string) => void,
      files?: Record<string, string>
    ): Promise<{ success: boolean; result?: any; error?: string }> => {
      onPlotRef.current = onPlot || null;

      try {
        const pyodide = await loadPyodideRuntime((msg) => onStdout(msg));
        if (!pyodide) {
          throw new Error('Python 런타임을 초기화할 수 없습니다.');
        }

        // Virtual File System (pyodide.FS)에 작업 공간 파일 동기화
        if (files) {
          const emscripten = pyodide as unknown as {
            FS?: { writeFile: (name: string, data: string) => void };
          };
          if (emscripten.FS) {
            for (const [filename, fileContent] of Object.entries(files)) {
              try {
                emscripten.FS.writeFile(filename, fileContent);
              } catch {
                // ignore file write error
              }
            }
          }
        }

        // Stdout/Stderr 스트림 연결
        pyodide.setStdout({
          batched: (msg: string) => {
            onStdout(`${msg}\r\n`);
          },
        });

        pyodide.setStderr({
          batched: (msg: string) => {
            onStderr(`\x1b[33m${msg}\x1b[0m\r\n`);
          },
        });

        // 사용된 패키지 자동 분석 및 로드
        onStdout(
          '\x1b[90m[Pyodide] 코드 내 필요한 라이브러리(NumPy, SciPy, SymPy, Scikit-Learn, NetworkX 등) 분석 및 로딩 중...\x1b[0m\r\n'
        );

        try {
          await pyodide.loadPackagesFromImports(code);
        } catch {
          const packagesToLoad: string[] = [];
          if (code.includes('sympy') || code.includes('Symbol(')) packagesToLoad.push('sympy');
          if (code.includes('sklearn') || code.includes('scikit-learn'))
            packagesToLoad.push('scikit-learn');
          if (code.includes('scipy')) packagesToLoad.push('scipy');
          if (code.includes('networkx') || code.includes('nx.')) packagesToLoad.push('networkx');
          if (code.includes('PIL') || code.includes('Pillow') || code.includes('Image.'))
            packagesToLoad.push('pillow');
          if (code.includes('bs4') || code.includes('BeautifulSoup'))
            packagesToLoad.push('beautifulsoup4');
          if (code.includes('seaborn') || code.includes('sns.')) packagesToLoad.push('seaborn');
          if (code.includes('pandas') || code.includes('pd.')) packagesToLoad.push('pandas');
          if (code.includes('numpy') || code.includes('np.')) packagesToLoad.push('numpy');
          if (code.includes('statsmodels') || code.includes('sm.'))
            packagesToLoad.push('statsmodels');
          if (code.includes('mpmath')) packagesToLoad.push('mpmath');
          if (code.includes('tabulate')) packagesToLoad.push('tabulate');
          if (code.includes('pydantic')) packagesToLoad.push('pydantic');
          if (code.includes('shapely')) packagesToLoad.push('shapely');
          if (code.includes('pygments')) packagesToLoad.push('pygments');

          if (packagesToLoad.length > 0) {
            await pyodide.loadPackage(packagesToLoad);
          }
        }

        // Matplotlib 감지 시 차트 인터셉터 주입
        let finalCode = code;
        if (code.includes('matplotlib') || code.includes('plt.')) {
          finalCode = `
import sys
import io
import base64
import js

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    _orig_show = plt.show
    def _omni_custom_show(*args, **kwargs):
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
        buf.seek(0)
        img_str = "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')
        buf.close()
        plt.close('all')
        if hasattr(js, '__omni_plot_callback__'):
            js.__omni_plot_callback__(img_str)
            
    plt.show = _omni_custom_show
except Exception as _e:
    pass

# --- 사용자 코드 시작 ---
${code}
`;
        }

        const result = await pyodide.runPythonAsync(finalCode);
        return { success: true, result };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        onStderr(
          `\r\n\x1b[31mPython Traceback (가장 최근 호출):\x1b[0m\r\n\x1b[31m${errMsg}\x1b[0m\r\n`
        );
        return { success: false, error: errMsg };
      }
    },
    [loadPyodideRuntime]
  );

  return {
    isReady,
    isLoading,
    error,
    loadPyodideRuntime,
    runPython,
  };
}
