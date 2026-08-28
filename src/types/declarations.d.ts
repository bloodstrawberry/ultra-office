declare module 'gifshot' {
  export interface GIFOptions {
    images?: Array<string | HTMLElement | CanvasImageSource>;
    video?: string[] | string;
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    fontSize?: string;
    fontColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    text?: string;
    progressCallback?: (captureProgress: number) => void;
    completeCallback?: () => void;
  }

  export interface GIFResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image: string;
  }

  export function createGIF(options: GIFOptions, callback: (obj: GIFResult) => void): void;

  export function isSupported(): boolean;
}

declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: unknown): string;
  }

  export interface Hasher {
    (message: string): WordArray;
  }

  export const MD5: Hasher;
  export const SHA1: Hasher;
  export const SHA256: Hasher;
  export const SHA512: Hasher;

  export const AES: {
    encrypt(message: string, secret: string): WordArray;
    decrypt(ciphertext: string, secret: string): WordArray;
  };

  const CryptoJS: {
    MD5: Hasher;
    SHA1: Hasher;
    SHA256: Hasher;
    SHA512: Hasher;
    AES: {
      encrypt(message: string, secret: string): WordArray;
      decrypt(ciphertext: string, secret: string): WordArray;
    };
  };

  export default CryptoJS;
}

declare module '@huggingface/transformers' {
  export const env: any;
  export const pipeline: any;
  export const AutoModel: any;
  export const AutoProcessor: any;
  export const RawImage: any;
}

declare module '@mediapipe/tasks-vision' {
  export const FilesetResolver: any;
  export const FaceDetector: any;
}

declare module 'plotly.js-dist-min' {
  import * as Plotly from 'plotly.js';

  export default Plotly;
}

declare module 'react-plotly.js/factory' {
  import type * as React from 'react';
  import type { PlotParams } from 'react-plotly.js';

  export default function createPlotlyComponent(plotly: any): React.ComponentType<PlotParams>;
}
