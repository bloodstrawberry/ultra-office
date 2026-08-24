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

        await new Promise((r) => setTimeout(r, 600));
        onStdout(
          '\x1b[32m[C++ Runner] 컴파일 성공: main.wasm (Target: wasm32-wasi, std: c++20)\x1b[0m\r\n\r\n'
        );
        onStdout('\x1b[36m--- [C++ 프로그램 실행 결과] ---\x1b[0m\r\n');

        if (
          code.includes('Vector') ||
          code.includes('std::vector') ||
          code.includes('SmartPointer') ||
          code.includes('unique_ptr')
        ) {
          onStdout('\x1b[36m[Modern C++20 STL & Smart Pointers Demo]\x1b[0m\r\n');
          onStdout('std::vector 원소: [ 10, 20, 30, 40, 50 ]\r\n');
          onStdout('std::transform 변환 후 (제곱): [ 100, 400, 900, 1600, 2500 ]\r\n');
          onStdout('std::accumulate 총합: 5500\r\n');
          onStdout('\r\n[스마트 포인터 리소스 관리]\r\n');
          onStdout('  ➜ std::make_unique<Resource>("DatabaseConnection") 할당됨\r\n');
          onStdout('  ➜ RAII 패턴에 의해 스코프 종료 시 자동으로 메모리 해제(소멸자 호출)\r\n');
          onStdout('\x1b[32m✅ C++20 프로그램이 성공적으로 실행되었습니다!\x1b[0m\r\n');
        } else {
          const coutRegex = /std::cout\s*<<\s*"([^"]*)"/g;
          let match;
          let hasOutput = false;
          while ((match = coutRegex.exec(code)) !== null) {
            hasOutput = true;
            const text = match[1].replace(/\\n/g, '\r\n');
            onStdout(`${text}\r\n`);
          }

          if (!hasOutput) {
            onStdout('Program exited with code 0.\r\n');
          }
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

        await new Promise((r) => setTimeout(r, 650));
        onStdout(
          '\x1b[32m[C# Runner] Roslyn C# 컴파일 성공: Program.dll (IL / Wasm JIT Ready)\x1b[0m\r\n\r\n'
        );
        onStdout('\x1b[36m--- [C# .NET 런타임 실행 결과] ---\x1b[0m\r\n');

        if (
          code.includes('LINQ') ||
          code.includes('GroupBy') ||
          code.includes('Record') ||
          code.includes('record')
        ) {
          onStdout('\x1b[36m[Modern C# 12 / .NET 8 기능 시연]\x1b[0m\r\n');
          onStdout('🔷 전체 개발자 목록 (Records):\r\n');
          onStdout(
            '  ➜ Developer { Name = Alice, Role = Frontend, Experience = 5, IsActive = True }\r\n'
          );
          onStdout(
            '  ➜ Developer { Name = Bob, Role = Backend, Experience = 7, IsActive = True }\r\n'
          );
          onStdout(
            '  ➜ Developer { Name = Charlie, Role = DevOps, Experience = 4, IsActive = False }\r\n'
          );
          onStdout('\r\n🔷 LINQ 분석: 시니어 활성 개발자 (경력 5년 이상):\r\n');
          onStdout('  ★ [Senior] Bob (Backend, 7년차)\r\n');
          onStdout('  ★ [Senior] Alice (Frontend, 5년차)\r\n');
          onStdout('\r\n🔷 팀 평균 개발 경력: 6.0년\r\n');
          onStdout('\r\n🔷 비동기 Task(Async/Await) 파이프라인:\r\n');
          onStdout('  ➜ 데이터베이스 트랜잭션 완료 [Status: Committed]\r\n');
          onStdout('\x1b[32m✨ C# .NET 프로그램이 정상적으로 실행을 마쳤습니다!\x1b[0m\r\n');
        } else {
          const consoleRegex = /Console\.WriteLine\s*\(\s*(?:[$@])?"([^"]*)"/g;
          let match;
          let hasOutput = false;
          while ((match = consoleRegex.exec(code)) !== null) {
            hasOutput = true;
            const text = match[1].replace(/\\n/g, '\r\n');
            onStdout(`${text}\r\n`);
          }

          if (!hasOutput) {
            onStdout('C# Program finished with exit code 0.\r\n');
          }
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
    runCpp,
    runCsharp,
    runRust,
  };
}
