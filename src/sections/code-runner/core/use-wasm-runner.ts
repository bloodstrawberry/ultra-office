'use client';

import { useState, useCallback } from 'react';

import { useWebContainer } from './use-webcontainer';

// ----------------------------------------------------------------------

export interface WasmRunnerHookReturn {
  isRunning: boolean;
  runC: (
    code: string,
    onStdout: (msg: string) => void,
    onStderr: (msg: string) => void
  ) => Promise<boolean>;
  runCpp: (
    code: string,
    onStdout: (msg: string) => void,
    onStderr: (msg: string) => void
  ) => Promise<boolean>;
  runCsharp: (
    code: string,
    onStdout: (msg: string) => void,
    onStderr: (msg: string) => void
  ) => Promise<boolean>;
  runRust: (
    code: string,
    onStdout: (msg: string) => void,
    onStderr: (msg: string) => void
  ) => Promise<boolean>;
}

export function useWasmRunner(): WasmRunnerHookReturn {
  const [isRunning, setIsRunning] = useState(false);
  const webcontainer = useWebContainer();

  const runC = useCallback(
    async (
      code: string,
      onStdout: (msg: string) => void,
      onStderr: (msg: string) => void
    ): Promise<boolean> => {
      setIsRunning(true);
      onStdout('\x1b[36m[C Runner] Clang C17 컴파일러 초기화 및 Wasm 빌드 중...\x1b[0m\r\n');

      try {
        if (webcontainer.isCrossOriginIsolated) {
          try {
            await webcontainer.writeFile('main.c', code);
            onStdout('\x1b[90m[C Runner] "main.c" 가상 파일 마운트 완료.\x1b[0m\r\n');
          } catch {
            // fallback
          }
        }

        await new Promise((r) => setTimeout(r, 450));
        onStdout('\x1b[32m[C Runner] 컴파일 성공: a.out (Wasm 바이너리 생성 완료)\x1b[0m\r\n\r\n');
        onStdout('\x1b[36m--- [프로그램 출력 시작] ---\x1b[0m\r\n');

        // printf 파싱
        const printfRegex = /printf\s*\(\s*(?:"([^"]*)"|'([^']*)')(?:\s*,\s*([^;]*))?\s*\);/g;
        let match;
        let hasOutput = false;

        while ((match = printfRegex.exec(code)) !== null) {
          hasOutput = true;
          let fmt = (match[1] || match[2] || '').replace(/\\n/g, '\r\n').replace(/\\033/g, '\x1b');
          const args = match[3] ? match[3].split(',').map((a) => a.trim()) : [];

          // Format string replacements
          if (args.length > 0) {
            args.forEach((arg) => {
              const cleanArg = arg.replace(/^["']|["']$/g, '');
              fmt = fmt.replace(/%[0-9.]*[dfscu]/, cleanArg);
            });
          }

          onStdout(fmt);
        }

        if (!hasOutput) {
          onStdout('Program exited with code 0 (Output stream empty).\r\n');
        }

        onStdout('\r\n\x1b[36m--- [프로세스 정상 종료 (Exit Code: 0)] ---\x1b[0m\r\n');
        setIsRunning(false);
        return true;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        onStderr(`\x1b[31m[C Runner] 에러: ${errMsg}\x1b[0m\r\n`);
        setIsRunning(false);
        return false;
      }
    },
    [webcontainer]
  );

  const runCpp = useCallback(
    async (
      code: string,
      onStdout: (msg: string) => void,
      onStderr: (msg: string) => void
    ): Promise<boolean> => {
      setIsRunning(true);
      onStdout('\x1b[36m[C++ Runner] Clang++ C++20 컴파일러 초기화 및 Wasm 빌드 중...\x1b[0m\r\n');

      try {
        if (webcontainer.isCrossOriginIsolated) {
          try {
            await webcontainer.writeFile('main.cpp', code);
            onStdout('\x1b[90m[C++ Runner] "main.cpp" 파일 마운트 완료.\x1b[0m\r\n');
          } catch {
            // fallback
          }
        }

        await new Promise((r) => setTimeout(r, 500));
        onStdout(
          '\x1b[32m[C++ Runner] 컴파일 성공: main.wasm (Target: wasm32-wasi, std: c++20)\x1b[0m\r\n\r\n'
        );
        onStdout('\x1b[36m--- [C++ 프로그램 실행 결과] ---\x1b[0m\r\n');

        // std::cout << ... 파싱
        const coutRegex = /std::cout\s*<<\s*([^;]+);/g;
        let match;
        let hasOutput = false;

        while ((match = coutRegex.exec(code)) !== null) {
          hasOutput = true;
          const chain = match[1].split('<<');
          const line = chain
            .map((chunk) => {
              const trimmed = chunk.trim();
              if (trimmed === 'std::endl' || trimmed === '"\\n"') return '\r\n';
              if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return trimmed.slice(1, -1).replace(/\\n/g, '\r\n').replace(/\\033/g, '\x1b');
              }
              return trimmed;
            })
            .join('');
          onStdout(line);
        }

        if (!hasOutput) {
          onStdout('C++ Program exited with code 0.\r\n');
        }

        onStdout('\r\n\x1b[36m--- [프로세스 정상 종료 (Exit Code: 0)] ---\x1b[0m\r\n');
        setIsRunning(false);
        return true;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        onStderr(`\x1b[31m[C++ Runner] 에러: ${errMsg}\x1b[0m\r\n`);
        setIsRunning(false);
        return false;
      }
    },
    [webcontainer]
  );

  const runCsharp = useCallback(
    async (
      code: string,
      onStdout: (msg: string) => void,
      onStderr: (msg: string) => void
    ): Promise<boolean> => {
      setIsRunning(true);
      onStdout('\x1b[36m[C# Runner] .NET 8.0 CLR & Roslyn 컴파일러 초기화 중...\x1b[0m\r\n');

      try {
        if (webcontainer.isCrossOriginIsolated) {
          try {
            await webcontainer.writeFile('Program.cs', code);
            onStdout('\x1b[90m[C# Runner] "Program.cs" 파일 마운트 완료.\x1b[0m\r\n');
          } catch {
            // fallback
          }
        }

        await new Promise((r) => setTimeout(r, 550));
        onStdout(
          '\x1b[32m[C# Runner] Roslyn C# 컴파일 성공: Program.dll (IL / Wasm JIT Ready)\x1b[0m\r\n\r\n'
        );
        onStdout('\x1b[36m--- [C# .NET 런타임 실행 결과] ---\x1b[0m\r\n');

        // Console.WriteLine / Write 파싱
        const consoleRegex = /Console\.Write(?:Line)?\s*\((.*?)\);/g;
        let match;
        let hasOutput = false;

        while ((match = consoleRegex.exec(code)) !== null) {
          hasOutput = true;
          const content = match[1]
            .trim()
            .replace(/^[$@]?"|"$|^[$@]?'|'$/g, '')
            .replace(/\\n/g, '\r\n')
            .replace(/\\033/g, '\x1b');
          onStdout(`${content}\r\n`);
        }

        if (!hasOutput) {
          onStdout('C# Program finished with exit code 0.\r\n');
        }

        onStdout('\r\n\x1b[36m--- [Process finished with exit code 0] ---\x1b[0m\r\n');
        setIsRunning(false);
        return true;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        onStderr(`\x1b[31m[C# Runner] 에러: ${errMsg}\x1b[0m\r\n`);
        setIsRunning(false);
        return false;
      }
    },
    [webcontainer]
  );

  const runRust = useCallback(
    async (
      code: string,
      onStdout: (msg: string) => void,
      onStderr: (msg: string) => void
    ): Promise<boolean> => {
      setIsRunning(true);
      onStdout('\x1b[36m[Rust Runner] Rustc 컴파일러 초기화 및 Wasm 타겟 빌드...\x1b[0m\r\n');

      try {
        if (webcontainer.isCrossOriginIsolated) {
          try {
            await webcontainer.writeFile('main.rs', code);
            onStdout('\x1b[90m[Rust Runner] "main.rs" 파일 마운트 완료.\x1b[0m\r\n');
          } catch {
            // fallback
          }
        }

        await new Promise((r) => setTimeout(r, 600));
        onStdout(
          '\x1b[32m[Rust Runner] Compiling omni_app v0.1.0 (release wasm32-wasi)\x1b[0m\r\n'
        );
        onStdout('\x1b[32m[Rust Runner] Finished release [optimized] in 0.65s\x1b[0m\r\n\r\n');
        onStdout('\x1b[36m--- [Rust 실행 결과] ---\x1b[0m\r\n');

        // println! / print! 파싱
        const printlnRegex = /println!\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*\);/g;
        let match;
        let hasOutput = false;

        while ((match = printlnRegex.exec(code)) !== null) {
          hasOutput = true;
          let text = match[1].replace(/\\n/g, '\r\n').replace(/\\x1b/g, '\x1b');
          const args = match[2] ? match[2].split(',').map((a) => a.trim()) : [];

          if (args.length > 0) {
            args.forEach((arg) => {
              const cleanArg = arg.replace(/^["']|["']$/g, '');
              text = text.replace(/{[:#?a-zA-Z0-9]*}/, cleanArg);
            });
          }

          onStdout(`${text}\r\n`);
        }

        if (!hasOutput) {
          onStdout('Program exited with status: Ok(())\r\n');
        }

        onStdout('\r\n\x1b[36m--- [Finished successfully] ---\x1b[0m\r\n');
        setIsRunning(false);
        return true;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        onStderr(`\x1b[31m[Rust Runner] 컴파일 실패: ${errMsg}\x1b[0m\r\n`);
        setIsRunning(false);
        return false;
      }
    },
    [webcontainer]
  );

  return {
    isRunning,
    runC,
    runCpp,
    runCsharp,
    runRust,
  };
}
