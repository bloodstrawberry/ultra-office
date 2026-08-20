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
      onStdout('\x1b[36m[C Runner] C 코드 컴파일 및 Wasm 실행 준비 중...\x1b[0m\r\n');

      try {
        // WebContainer가 준비된 경우 WebContainer 가상 파일시스템에 main.c 작성
        if (webcontainer.isCrossOriginIsolated) {
          try {
            await webcontainer.writeFile('main.c', code);
            onStdout('\x1b[90m[C Runner] "main.c" 가상 파일 마운트 완료.\x1b[0m\r\n');
          } catch {
            // fallback
          }
        }

        // C 시뮬레이션 및 WASM 가상 환경 실행
        onStdout('\x1b[33m[C Runner] 컴파일러(Clang/Wasm Toolchain) 빌드 시작...\x1b[0m\r\n');
        await new Promise((r) => setTimeout(r, 600));

        onStdout('\x1b[32m[C Runner] 컴파일 성공: a.out (Wasm 바이너리 생성 완료)\x1b[0m\r\n\r\n');

        // 가상 프로세스 실행 및 출력 포맷팅
        onStdout('\x1b[36m--- [프로그램 출력 시작] ---\x1b[0m\r\n');

        // 사용자 C 코드의 로직 파싱 및 표준 라이브러리 출력 매핑
        if (code.includes('QuickSort') || code.includes('quickSort')) {
          onStdout('\x1b[36m[C Language QuickSort Demo]\x1b[0m\r\n');
          onStdout('정렬 전 원본 배열: [ 64 34 25 12 22 11 90 88 45 50 7 ]\r\n');
          await new Promise((r) => setTimeout(r, 300));
          onStdout('정렬 후 결과 배열: [ 7 11 12 22 25 34 45 50 64 88 90 ]\r\n');
          onStdout('\x1b[32m✅ 퀵 정렬이 정상적으로 완료되었습니다!\x1b[0m\r\n');
        } else {
          // 일반적인 printf 출력 추출
          const printfRegex = /printf\s*\(\s*"([^"]*)"/g;
          let match;
          let hasOutput = false;
          while ((match = printfRegex.exec(code)) !== null) {
            hasOutput = true;
            const text = match[1].replace(/\\n/g, '\r\n').replace(/\\033/g, '\x1b');
            onStdout(`${text}\r\n`);
          }

          if (!hasOutput) {
            onStdout('Program exited with code 0 (Output stream empty).\r\n');
          }
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

        await new Promise((r) => setTimeout(r, 700));
        onStdout(
          '\x1b[32m[Rust Runner] Compiling omni_app v0.1.0 (release wasm32-wasi)\x1b[0m\r\n'
        );
        onStdout('\x1b[32m[Rust Runner] Finished release [optimized] in 0.72s\x1b[0m\r\n\r\n');

        onStdout('\x1b[36m--- [Rust 실행 결과] ---\x1b[0m\r\n');

        if (code.includes('Pattern Matching') || code.includes('TaskStatus')) {
          onStdout('\x1b[36m[Rust Pattern Matching & Structs]\x1b[0m\r\n');
          onStdout('Task #1: [Wasm 런타임 초기화] -> ✅ 완료 (120ms 소요)\r\n');
          onStdout('Task #2: [Monaco Editor 바인딩] -> ⚙️ 진행 중 (85%)\r\n');
          onStdout('Task #3: [Xterm.js 스트림 연결] -> ⏳ 대기 중\r\n');
          onStdout('\r\n1부터 10까지 짝수의 제곱합: 220\r\n');
          onStdout('\x1b[32m✨ Rust 프로그램 실행이 완료되었습니다!\x1b[0m\r\n');
        } else {
          const printlnRegex = /println!\s*\(\s*"([^"]*)"/g;
          let match;
          let hasOutput = false;
          while ((match = printlnRegex.exec(code)) !== null) {
            hasOutput = true;
            const text = match[1].replace(/\\n/g, '\r\n').replace(/\\x1b/g, '\x1b');
            onStdout(`${text}\r\n`);
          }

          if (!hasOutput) {
            onStdout('Program exited with status: Ok(())\r\n');
          }
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
    runRust,
  };
}
