import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MlNeuralNetView } from 'src/sections/ml/view';

export const metadata: Metadata = {
  title: `다층 퍼셉트론 (MLP Playground) | ML Studio - ${CONFIG.appName}`,
};

export default function Page() {
  return <MlNeuralNetView />;
}
