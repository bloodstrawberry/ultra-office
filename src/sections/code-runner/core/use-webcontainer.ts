'use client';

import type { WebContainer, WebContainerProcess } from '@webcontainer/api';

import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

let globalWebContainerPromise: Promise<WebContainer> | null = null;
let globalWebContainerInstance: WebContainer | null = null;

export interface WebContainerHookReturn {
  instance: WebContainer | null;
  isReady: boolean;
  isBooting: boolean;
  error: string | null;
  isCrossOriginIsolated: boolean;
  boot: () => Promise<WebContainer | null>;
  writeFile: (path: string, content: string) => Promise<void>;
  mountFiles: (files: Record<string, string>) => Promise<void>;
  spawnCommand: (
    cmd: string,
    args: string[],
    onData: (data: string) => void,
    onExit?: (code: number) => void
  ) => Promise<WebContainerProcess | null>;
  startServer: (
    cmd: string,
    args: string[],
    onServerReady: (port: number, url: string) => void,
    onData: (data: string) => void
  ) => Promise<WebContainerProcess | null>;
}

export function useWebContainer(): WebContainerHookReturn {
  const [isReady, setIsReady] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCrossOriginIsolated, setIsCrossOriginIsolated] = useState(false);
  const activeProcessRef = useRef<WebContainerProcess | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isolated = Boolean(window.crossOriginIsolated);
      setIsCrossOriginIsolated(isolated);
      if (globalWebContainerInstance) {
        setIsReady(true);
      }
    }
  }, []);

  const boot = useCallback(async (): Promise<WebContainer | null> => {
    if (typeof window === 'undefined') return null;

    if (globalWebContainerInstance) {
      setIsReady(true);
      return globalWebContainerInstance;
    }

    if (!window.crossOriginIsolated) {
      const msg =
        'WebContainer는 보안 정책상 Cross-Origin Isolation (SharedArrayBuffer)이 필요합니다.\n' +
        '현재 브라우저 컨텍스트가 격리되지 않았습니다. (COOP/COEP 헤더 설정 필요)\n' +
        'Python (Pyodide Wasm) 및 HTML Sandbox는 제한 없이 실행 가능합니다.';
      setError(msg);
      return null;
    }

    setIsBooting(true);
    setError(null);

    try {
      if (!globalWebContainerPromise) {
        const { WebContainer: WC } = await import('@webcontainer/api');
        globalWebContainerPromise = WC.boot();
      }

      globalWebContainerInstance = await globalWebContainerPromise;
      setIsReady(true);
      setIsBooting(false);
      return globalWebContainerInstance;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`WebContainer 부팅 실패: ${errMsg}`);
      setIsBooting(false);
      globalWebContainerPromise = null;
      return null;
    }
  }, []);

  const writeFile = useCallback(
    async (path: string, content: string): Promise<void> => {
      const wc = globalWebContainerInstance || (await boot());
      if (!wc) throw new Error('WebContainer 인스턴스를 사용할 수 없습니다.');

      // 디렉토리가 포함된 경로인 경우 상위 디렉토리 생성
      const segments = path.split('/');
      if (segments.length > 1) {
        const dirPath = segments.slice(0, -1).join('/');
        try {
          await wc.fs.mkdir(dirPath, { recursive: true });
        } catch {
          // 이미 존재하는 디렉토리 무시
        }
      }

      await wc.fs.writeFile(path, content);
    },
    [boot]
  );

  const mountFiles = useCallback(
    async (files: Record<string, string>): Promise<void> => {
      const wc = globalWebContainerInstance || (await boot());
      if (!wc) throw new Error('WebContainer 인스턴스를 사용할 수 없습니다.');

      const fileSystemTree: Record<string, any> = {};

      for (const [filePath, content] of Object.entries(files)) {
        const parts = filePath.split('/');
        let current = fileSystemTree;

        for (let i = 0; i < parts.length - 1; i += 1) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = { directory: {} };
          }
          current = current[part].directory;
        }

        const fileName = parts[parts.length - 1];
        current[fileName] = {
          file: {
            contents: content,
          },
        };
      }

      await wc.mount(fileSystemTree);
    },
    [boot]
  );

  const spawnCommand = useCallback(
    async (
      cmd: string,
      args: string[],
      onData: (data: string) => void,
      onExit?: (code: number) => void
    ): Promise<WebContainerProcess | null> => {
      const wc = globalWebContainerInstance || (await boot());
      if (!wc) throw new Error('WebContainer가 준비되지 않았습니다.');

      const process = await wc.spawn(cmd, args);
      activeProcessRef.current = process;

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            onData(data);
          },
        })
      );

      process.exit.then((exitCode) => {
        if (activeProcessRef.current === process) {
          activeProcessRef.current = null;
        }
        onExit?.(exitCode);
      });

      return process;
    },
    [boot]
  );

  const startServer = useCallback(
    async (
      cmd: string,
      args: string[],
      onServerReady: (port: number, url: string) => void,
      onData: (data: string) => void
    ): Promise<WebContainerProcess | null> => {
      const wc = globalWebContainerInstance || (await boot());
      if (!wc) throw new Error('WebContainer가 준비되지 않았습니다.');

      wc.on('server-ready', (port, url) => {
        onServerReady(port, url);
      });

      return spawnCommand(cmd, args, onData);
    },
    [boot, spawnCommand]
  );

  return {
    instance: globalWebContainerInstance,
    isReady,
    isBooting,
    error,
    isCrossOriginIsolated,
    boot,
    writeFile,
    mountFiles,
    spawnCommand,
    startServer,
  };
}
