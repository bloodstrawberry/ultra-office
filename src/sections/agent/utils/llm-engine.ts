'use client';

export type LLMEngineType = 'webgpu' | 'cpu';

export interface ModelOption {
  id: string;
  name: string;
  engine: LLMEngineType;
  size: string;
  vram: string;
  description: string;
  recommended?: boolean;
  url?: string; // For CPU Wllama GGUF
}

export const AVAILABLE_MODELS: ModelOption[] = [
  // WebGPU Models
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 0.5B (GPU 가속 - 추천)',
    engine: 'webgpu',
    size: '350 MB',
    vram: '~500 MB',
    description: '초경량 & 초고속, 우수한 한국어 이해력 (저사양/노트북 최적)',
    recommended: true,
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 1.5B (GPU 가속 - 고성능)',
    engine: 'webgpu',
    size: '1.0 GB',
    vram: '~1.5 GB',
    description: '사규 분석 및 보고서 작성에 탁월한 고품질 모델',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama-3.2 1B (GPU 가속)',
    engine: 'webgpu',
    size: '880 MB',
    vram: '~1.2 GB',
    description: 'Meta의 고효율 경량 오픈소스 LLM',
  },
  {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 360M (GPU 가속 - 극초경량)',
    engine: 'webgpu',
    size: '230 MB',
    vram: '~350 MB',
    description: '가장 가볍고 빠른 반응 속도',
  },
  // CPU (WASM) Models
  {
    id: 'qwen2.5-0.5b-cpu',
    name: 'Qwen2.5 0.5B (CPU WebAssembly)',
    engine: 'cpu',
    size: '398 MB',
    vram: 'CPU RAM ~600 MB',
    description: 'WebGPU 미지원 환경에서도 구동되는 표준 CPU 모델',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    recommended: true,
  },
  {
    id: 'smollm2-135m-cpu',
    name: 'SmolLM2 135M (CPU WebAssembly - 극초경량)',
    engine: 'cpu',
    size: '105 MB',
    vram: 'CPU RAM ~200 MB',
    description: '저사양 PC CPU에서도 매우 가볍게 동작하는 모델',
    url: 'https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_K_M.gguf',
  },
];

export interface LoadingProgress {
  text: string;
  progress: number; // 0 to 1
  phase: 'idle' | 'downloading' | 'compiling' | 'ready' | 'error';
}

export interface ChatMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Check if the current browser supports WebGPU
 */
export async function checkWebGPUSupport(): Promise<{ supported: boolean; message: string }> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: false, message: '서버 환경입니다.' };
  }

  const nav = navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown> } };
  if (!nav.gpu || typeof nav.gpu.requestAdapter !== 'function') {
    return {
      supported: false,
      message:
        '이 브라우저는 WebGPU를 지원하지 않습니다. (Chrome 113+, Edge 113+ 권장 또는 CPU 모드 사용)',
    };
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        message:
          '사용 가능한 WebGPU 어댑터(그래픽 카드)를 찾을 수 없습니다. CPU 모드를 사용하세요.',
      };
    }
    return { supported: true, message: 'WebGPU 가속이 활성화되었습니다.' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      supported: false,
      message: `WebGPU 초기화 실패: ${errMsg}. CPU 모드를 사용하세요.`,
    };
  }
}

// ----------------------------------------------------------------------
// Singleton Engine Handler
// ----------------------------------------------------------------------

let activeEngineType: LLMEngineType | null = null;
let activeModelId: string | null = null;
let webLLMEngineInstance: any = null;
let wllamaInstance: any = null;

/**
 * Load Model with progress callback
 */
export async function initializeLLM(
  model: ModelOption,
  onProgress: (prog: LoadingProgress) => void
): Promise<void> {
  // If already loaded the same model, return immediately
  if (
    activeModelId === model.id &&
    ((model.engine === 'webgpu' && webLLMEngineInstance) ||
      (model.engine === 'cpu' && wllamaInstance))
  ) {
    onProgress({ text: '모델이 이미 로드되어 준비되었습니다.', progress: 1, phase: 'ready' });
    return;
  }

  try {
    onProgress({ text: `[${model.name}] 초기화 준비 중...`, progress: 0.05, phase: 'downloading' });

    if (model.engine === 'webgpu') {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      // Unload previous CPU instance if existing
      if (wllamaInstance) {
        try {
          await wllamaInstance.exit();
        } catch {
          // ignore
        }
        wllamaInstance = null;
      }

      onProgress({ text: 'WebGPU 가속 모델 로딩 시작...', progress: 0.1, phase: 'downloading' });

      webLLMEngineInstance = await CreateMLCEngine(model.id, {
        initProgressCallback: (report) => {
          const progress = Math.min(Math.max(report.progress, 0), 1);
          let phase: LoadingProgress['phase'] = 'downloading';
          if (progress >= 0.9) {
            phase = 'compiling';
          }
          if (progress >= 1) {
            phase = 'ready';
          }
          onProgress({
            text: report.text || '모델 가중치 로드 중...',
            progress,
            phase,
          });
        },
      });

      activeEngineType = 'webgpu';
      activeModelId = model.id;
      onProgress({ text: 'WebGPU LLM이 성공적으로 준비되었습니다!', progress: 1, phase: 'ready' });
    } else {
      // CPU Wllama (Import directly from pre-built ESM bundle)
      const wllamaModule = (await import('@wllama/wllama/esm/index.js')) as unknown as {
        Wllama?: typeof import('@wllama/wllama').Wllama;
        default?: { Wllama?: typeof import('@wllama/wllama').Wllama };
      };
      const Wllama =
        wllamaModule.Wllama ||
        wllamaModule.default?.Wllama ||
        (wllamaModule.default as unknown as typeof import('@wllama/wllama').Wllama);

      // Unload previous WebLLM instance if existing
      if (webLLMEngineInstance) {
        try {
          await webLLMEngineInstance.unload();
        } catch {
          // ignore
        }
        webLLMEngineInstance = null;
      }

      onProgress({
        text: 'CPU WebAssembly 엔진 초기화 중...',
        progress: 0.15,
        phase: 'downloading',
      });

      // Initialize Wllama with valid CDN WASM paths
      const CONFIG_PATHS = {
        default: 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.5.1/esm/wasm/wllama.wasm',
      };

      const wllama = new Wllama(CONFIG_PATHS);

      if (!model.url) {
        throw new Error('GGUF 모델 다운로드 URL이 지정되지 않았습니다.');
      }

      onProgress({
        text: 'HuggingFace에서 GGUF 가중치 다운로드 중...',
        progress: 0.25,
        phase: 'downloading',
      });

      await wllama.loadModelFromUrl(model.url, {
        progressCallback: ({ loaded, total }: { loaded: number; total: number }) => {
          const ratio = total > 0 ? loaded / total : 0.5;
          if (ratio >= 0.999) {
            onProgress({
              text: '가중치 다운로드 완료! WebAssembly 엔진 초기화 중...',
              progress: 0.96,
              phase: 'compiling',
            });
          } else {
            onProgress({
              text: `모델 다운로드 중 (${Math.round((loaded / (1024 * 1024)) * 10) / 10}MB / ${Math.round((total / (1024 * 1024)) * 10) / 10}MB)...`,
              progress: Math.min(ratio * 0.85 + 0.1, 0.95),
              phase: 'downloading',
            });
          }
        },
      });

      wllamaInstance = wllama;
      activeEngineType = 'cpu';
      activeModelId = model.id;
      onProgress({ text: 'CPU LLM이 성공적으로 준비되었습니다!', progress: 1, phase: 'ready' });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('LLM Initialization Error:', err);
    onProgress({
      text: `모델 로드 실패: ${errorMsg}`,
      progress: 0,
      phase: 'error',
    });
    throw err;
  }
}

/**
 * Generate streaming chat response from the active LLM
 */
export async function streamChatResponse(
  messages: ChatMessageParam[],
  onChunk: (chunk: string, fullText: string) => void
): Promise<string> {
  if (activeEngineType === 'webgpu' && webLLMEngineInstance) {
    let fullText = '';
    const completion = await webLLMEngineInstance.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    });

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullText += delta;
        onChunk(delta, fullText);
      }
    }
    return fullText;
  }

  if (activeEngineType === 'cpu' && wllamaInstance) {
    let fullText = '';
    const completion = (await wllamaInstance.createChatCompletion({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    })) as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>;

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullText += delta;
        onChunk(delta, fullText);
      }
    }
    return fullText;
  }

  throw new Error('활성화된 LLM 엔진이 없습니다. 먼저 모델을 로드해 주세요.');
}

/**
 * Check if an engine is currently ready
 */
export function isLLMReady(): boolean {
  return (
    (activeEngineType === 'webgpu' && !!webLLMEngineInstance) ||
    (activeEngineType === 'cpu' && !!wllamaInstance)
  );
}

/**
 * Get active model ID
 */
export function getActiveModelId(): string | null {
  return activeModelId;
}
